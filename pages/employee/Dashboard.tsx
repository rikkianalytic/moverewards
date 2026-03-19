
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockApi } from '../../services/api';
import { Trophy, History, Gift, TrendingUp, ArrowRight, Coins, Award, ShoppingBag, Key } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    lifetime: 0,
    monthly: 0,
    rank: 0,
    activeContests: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [latestVoucher, setLatestVoucher] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const db = await mockApi.getPointsHistory(user!.id);
      const leaderboard = await mockApi.getLeaderboard();
      const contests = await mockApi.getContests();
      const redemptions = await mockApi.getRedemptions(user!.id);
      const allRewards = await mockApi.getRewards();
      
      const myRank = leaderboard.find(l => l.name === user!.name)?.rank || 0;
      const lifetime = db.reduce((s, t) => s + t.points, 0);
      
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthly = db
        .filter(t => new Date(t.createdAt) >= startOfMonth)
        .reduce((s, t) => s + t.points, 0);

      // Get latest approved redemption and its associated reward info
      const latestApproved = redemptions.find(r => r.status === 'approved');
      if (latestApproved) {
        const rewardInfo = allRewards.find(rw => rw.id === latestApproved.rewardId);
        setLatestVoucher({ ...latestApproved, ...rewardInfo });
      }

      setStats({
        lifetime,
        monthly,
        rank: myRank,
        activeContests: contests.filter(c => c.status === 'active' && c.assignedEmployeeIds.includes(user!.id)).length
      });
      setRecentActivity(db.slice(0, 5));
    };
    fetchData();
  }, [user]);

  return (
    <div className="space-y-10">
      {/* Header Profile Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            Hey {user?.name.split(' ')[0]} <span className="animate-pulse">👋</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2 text-lg">Here's your performance snapshot for this month.</p>
        </div>
        <div className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-4 rounded-[2.5rem] shadow-xl shadow-blue-200">
          <Coins size={24} />
          <span className="text-3xl font-black">{stats.lifetime.toLocaleString()}</span>
          <span className="text-xs font-black uppercase tracking-widest text-blue-200 ml-2">Total pts</span>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard 
          icon={<Trophy className="text-orange-500" size={28} />} 
          label="Leaderboard" 
          value={`Rank #${stats.rank}`} 
          trend={`+${stats.monthly} pts this month`}
          color="bg-orange-50"
          link="/employee/leaderboard"
        />
        <MetricCard 
          icon={<TrendingUp className="text-indigo-500" size={28} />} 
          label="Competitions" 
          value={stats.activeContests} 
          trend="Active contests assigned"
          color="bg-indigo-50"
          link="/employee/contests"
        />
        <MetricCard 
          icon={<ShoppingBag className="text-rose-500" size={28} />} 
          label="My Vault" 
          value="Redeemed Items" 
          trend="Access your coupon codes"
          color="bg-rose-50"
          link="/employee/redemptions"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Recent Activity List */}
        <section className="bg-white rounded-[2rem] p-8 soft-shadow border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-900 flex items-center">
              <History className="mr-3 text-blue-600" size={24} />
              Recent Rewards
            </h3>
            <Link to="/employee/history" className="text-sm font-bold text-blue-600 flex items-center hover:translate-x-1 transition-transform">
              View History <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentActivity.map(tx => (
              <div key={tx.id} className="group flex items-center justify-between p-5 bg-slate-50/50 rounded-3xl border border-transparent hover:border-slate-200 hover:bg-white transition-all">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-2xl ${tx.points > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                    {tx.points > 0 ? <TrendingUp size={20} /> : <TrendingUp size={20} className="rotate-180" />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{tx.category}</p>
                    <p className="text-xs text-slate-400 font-medium">{new Date(tx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                  </div>
                </div>
                <div className={`text-xl font-black ${tx.points > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {tx.points > 0 ? '+' : ''}{tx.points}
                </div>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-400 font-medium">No recent activity to show.</p>
              </div>
            )}
          </div>
        </section>

        {/* Promo / Banner Area */}
        <section className="space-y-6">
          {latestVoucher ? (
            <div className="bg-gradient-to-br from-blue-700 to-indigo-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl group cursor-pointer border border-blue-400/30">
               <div className="absolute -right-10 -top-10 bg-white/10 w-40 h-40 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
               <Key className="absolute -right-8 -bottom-8 opacity-10 text-white" size={180} />
               <div className="relative z-10">
                 <div className="flex items-center space-x-2 mb-6">
                    <span className="bg-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full animate-bounce">Active Voucher</span>
                    <span className="text-blue-200 text-[10px] font-black uppercase tracking-widest">Unlocked</span>
                 </div>
                 <h3 className="text-2xl font-black leading-tight">Your {latestVoucher.rewardName} is ready!</h3>
                 <p className="text-blue-100/70 mt-3 text-sm font-medium">Head to your vault to claim your coupon code and start using your perk.</p>
                 <Link to="/employee/redemptions" className="mt-8 bg-white text-slate-900 px-6 py-3 rounded-2xl font-bold inline-flex items-center space-x-2 hover:bg-blue-50 transition-colors">
                    <span>Open Vault</span>
                    <ArrowRight size={18} />
                 </Link>
               </div>
            </div>
          ) : (
            <div className="bg-[#0F172A] rounded-[2rem] p-10 text-white relative overflow-hidden shadow-2xl">
              <Award className="absolute -right-8 -bottom-8 opacity-10 text-white" size={200} />
              <div className="relative z-10">
                <span className="bg-orange-500 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full">Pro Tip</span>
                <h3 className="text-3xl font-black mt-6 leading-tight">Climb the<br/>Ranks faster!</h3>
                <p className="text-slate-400 mt-4 max-w-xs font-medium">Customer reviews earn you the most points. Ask your clients for a quick shoutout today.</p>
                <Link to="/employee/leaderboard" className="mt-8 bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold flex items-center space-x-2 hover:bg-slate-100 transition-colors">
                  <span>See Strategies</span>
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-6">
             <div className="bg-emerald-600 rounded-[2rem] p-8 text-white shadow-xl shadow-emerald-600/20">
                <p className="text-xs font-black uppercase tracking-widest opacity-60">Success Rate</p>
                <p className="text-4xl font-black mt-2">98%</p>
             </div>
             <div className="bg-blue-600 rounded-[2rem] p-8 text-white shadow-xl shadow-blue-600/20">
                <p className="text-xs font-black uppercase tracking-widest opacity-60">Safety Score</p>
                <p className="text-4xl font-black mt-2">5.0</p>
             </div>
          </div>
        </section>
      </div>
    </div>
  );
};

const MetricCard = ({ icon, label, value, trend, color, link }: any) => (
  <Link to={link} className={`block bg-white p-8 rounded-[2.5rem] soft-shadow border border-slate-100 transition-all hover:-translate-y-2 hover:border-blue-200 group`}>
    <div className="flex items-center justify-between mb-8">
      <div className={`p-4 rounded-[1.5rem] ${color} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <ArrowRight size={20} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
    </div>
    <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">{label}</p>
    <p className="text-3xl font-black text-slate-900 mb-2">{value}</p>
    <p className="text-sm text-slate-500 font-semibold">{trend}</p>
  </Link>
);

export default EmployeeDashboard;
