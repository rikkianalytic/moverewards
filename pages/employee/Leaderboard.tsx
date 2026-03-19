import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockApi } from '../../services/api';
import { Trophy, Medal } from 'lucide-react';

const Leaderboard: React.FC = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mockApi.getLeaderboard().then(setEntries).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  if(loading) return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/></div>;

  const myEntry = entries.find(e=>e.name===user?.name);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center"><h2 className="text-3xl font-black text-slate-900 tracking-tight">Leaderboard</h2><p className="text-slate-500 font-medium">Monthly performance rankings</p></div>
      {myEntry&&(
        <div className="bg-blue-600 text-white p-5 rounded-2xl flex items-center justify-between shadow-xl shadow-blue-200">
          <div className="flex items-center gap-3"><Trophy size={24}/><div><p className="font-black">Your Rank</p><p className="text-blue-200 text-sm">{myEntry.monthlyPoints} pts this month</p></div></div>
          <div className="text-4xl font-black">#{myEntry.rank}</div>
        </div>
      )}
      {entries.length===0?(
        <div className="p-20 text-center bg-white rounded-3xl border border-slate-100"><Trophy className="mx-auto text-slate-200 mb-4" size={48}/><p className="text-slate-400 font-bold">No rankings yet!</p></div>
      ):(
        <div className="space-y-3">
          {entries.map(e=>(
            <div key={e.rank} className={`bg-white p-5 rounded-2xl shadow-sm border flex items-center justify-between transition-all ${e.name===user?.name?'border-blue-400 bg-blue-50/50':e.rank===1?'border-yellow-200 bg-yellow-50/30':e.rank===2?'border-slate-200':e.rank===3?'border-orange-200':'border-slate-100'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ${e.rank===1?'bg-yellow-400 text-white':e.rank===2?'bg-slate-400 text-white':e.rank===3?'bg-orange-400 text-white':e.name===user?.name?'bg-blue-600 text-white':'bg-slate-100 text-slate-500'}`}>
                  {e.rank<=3?<Trophy size={16}/>:`#${e.rank}`}
                </div>
                <div className={`w-10 h-10 rounded-full ${e.name===user?.name?'bg-blue-600':'bg-slate-300'} flex items-center justify-center text-white font-black`}>{e.name.charAt(0)}</div>
                <div><p className={`font-black ${e.name===user?.name?'text-blue-700':'text-slate-900'}`}>{e.name} {e.name===user?.name&&'(You)'}</p><p className="text-xs text-slate-400">{e.position}</p></div>
              </div>
              <div className="text-right"><p className={`font-black text-lg ${e.name===user?.name?'text-blue-600':'text-slate-700'}`}>{e.monthlyPoints.toLocaleString()}</p><p className="text-[10px] text-slate-400">Monthly pts</p></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default Leaderboard;
