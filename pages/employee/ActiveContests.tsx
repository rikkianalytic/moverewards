
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockApi } from '../../services/api';
import { Contest } from '../../types';
import { Award, Target, TrendingUp, Clock, Mail } from 'lucide-react';

const ActiveContests: React.FC = () => {
  const { user } = useAuth();
  const [contests, setContests] = useState<Contest[]>([]);
  const [pointsHistory, setPointsHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const c = await mockApi.getContests();
      const p = await mockApi.getPointsHistory(user!.id);
      // Filter for active contests AND where the user is assigned
      setContests(c.filter(x => x.status === 'active' && x.assignedEmployeeIds.includes(user!.id)));
      setPointsHistory(p);
    };
    fetchData();
  }, [user]);

  const calculateProgress = (contest: Contest) => {
    const start = new Date(contest.startDate);
    const end = new Date(contest.endDate);
    
    const relevantPoints = pointsHistory.filter(tx => {
      const txDate = new Date(tx.createdAt);
      const isWithinDate = txDate >= start && txDate <= end;
      const isCorrectCategory = contest.criteriaType === 'points' || tx.category === contest.categoryFilter;
      return isWithinDate && isCorrectCategory && tx.points > 0;
    }).reduce((sum, tx) => sum + tx.points, 0);

    return relevantPoints;
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Your Active Contests</h2>
        <p className="text-gray-500">Contests you've been invited to participate in.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {contests.map(contest => {
          const myProgress = calculateProgress(contest);
          return (
            <div key={contest.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:border-blue-200 transition-all">
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="p-4 bg-orange-50 rounded-2xl text-orange-500">
                    <Award size={32} />
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Grand Prize</p>
                    <p className="text-2xl font-black text-orange-500">{contest.prizeValue} Points</p>
                  </div>
                </div>

                <h3 className="text-2xl font-black text-gray-900 mb-2">{contest.name}</h3>
                <p className="text-gray-500 text-sm mb-8 line-clamp-2">{contest.description}</p>

                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <p className="text-sm font-bold text-gray-700">My Performance</p>
                      <p className="text-sm font-black text-blue-600">{myProgress} Points</p>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 transition-all duration-1000" 
                        style={{ width: `${Math.min((myProgress / (contest.prizeValue * 2)) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-2 text-gray-400 mb-1">
                        <Target size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-tighter">Criteria</span>
                      </div>
                      <p className="text-xs font-bold text-gray-700 truncate">
                        {contest.criteriaType === 'points' ? 'Any Points' : contest.categoryFilter}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-2 text-gray-400 mb-1">
                        <Clock size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-tighter">Time Left</span>
                      </div>
                      <p className="text-xs font-bold text-gray-700">
                        {Math.max(0, Math.ceil((new Date(contest.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} Days
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 px-8 py-4 border-t border-blue-100 flex items-center justify-between">
                <span className="text-xs font-bold text-blue-700 flex items-center">
                  <Mail size={14} className="mr-1.5" />
                  Invited Participant
                </span>
                <button className="text-sm font-bold text-blue-800 hover:underline">View Standings</button>
              </div>
            </div>
          );
        })}
        
        {contests.length === 0 && (
          <div className="col-span-full py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 text-center">
            <Award className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500 font-bold">No contests assigned to you right now.</p>
            <p className="text-sm text-gray-400 mt-1">Wait for an admin to invite you to the next competition!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveContests;
