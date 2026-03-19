import React, { useState, useEffect } from 'react';
import { mockApi } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Coins, Gift, TrendingUp, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const COLORS = ['#3B82F6','#F97316','#10B981','#6366F1','#EC4899','#F59E0B'];

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    mockApi.getAdminStats()
      .then(setStats)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/></div>;
  if (error) return <div className="p-6 bg-rose-50 text-rose-600 rounded-2xl font-bold flex items-center gap-3"><AlertCircle size={20}/>{error}</div>;

  const txs: any[] = stats?.recentTransactions || [];
  const catMap: any = {};
  txs.forEach((t:any) => { if(t.points>0) catMap[t.category]=(catMap[t.category]||0)+t.points; });
  const catData = Object.entries(catMap).map(([name,value])=>({name,value}));

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-black text-slate-900 tracking-tight">Executive Overview</h2><p className="text-slate-500 text-sm font-medium">Live performance analytics for your team.</p></div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users size={20}/>} label="Active Team" value={stats?.totalEmployees??0} sub="employees" color="text-blue-600" bg="bg-blue-50"/>
        <StatCard icon={<Coins size={20}/>} label="Points Issued" value={(stats?.totalPointsIssued??0).toLocaleString()} sub="all time" color="text-orange-600" bg="bg-orange-50"/>
        <StatCard icon={<Gift size={20}/>} label="Pending Redemptions" value={stats?.pendingRedemptions??0} sub="awaiting approval" color="text-indigo-600" bg="bg-indigo-50"/>
        <StatCard icon={<TrendingUp size={20}/>} label="Active Contests" value={stats?.activeContests??0} sub="running now" color="text-emerald-600" bg="bg-emerald-50"/>
      </div>

      {/* Alerts */}
      {(stats?.pendingApprovals>0||stats?.pendingPointRequests>0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats?.pendingApprovals>0 && (
            <Link to="/admin/employees" className="p-4 bg-orange-50 border border-orange-200 rounded-2xl flex items-center gap-3 text-orange-700 font-bold hover:bg-orange-100 transition-colors">
              <Clock size={18}/><span>{stats.pendingApprovals} employee(s) waiting for account approval</span>
            </Link>
          )}
          {stats?.pendingPointRequests>0 && (
            <Link to="/admin/redemptions" className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-3 text-blue-700 font-bold hover:bg-blue-100 transition-colors">
              <AlertCircle size={18}/><span>{stats.pendingPointRequests} point claim(s) pending review</span>
            </Link>
          )}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-black text-slate-900 mb-6 uppercase tracking-widest">Points by Category</h3>
          {catData.length>0?(
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={catData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                  <XAxis dataKey="name" fontSize={9} axisLine={false} tickLine={false}/>
                  <YAxis fontSize={10} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={{borderRadius:'12px',border:'none',boxShadow:'0 10px 15px -3px rgb(0 0 0/0.1)'}}/>
                  <Bar dataKey="value" fill="#3B82F6" radius={[6,6,0,0]} barSize={36}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ):(
            <div className="h-[260px] flex flex-col items-center justify-center text-slate-300">
              <Coins size={48} className="mb-3"/>
              <p className="italic text-sm">No points data yet. Start awarding points!</p>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-black text-slate-900 mb-4 uppercase tracking-widest">Recent Transactions</h3>
          <div className="space-y-3 max-h-[280px] overflow-y-auto">
            {txs.slice(0,8).map((tx:any)=>(
              <div key={tx.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div>
                  <p className="text-xs font-bold text-slate-800 truncate max-w-[130px]">{tx.employeeName}</p>
                  <p className="text-[10px] text-slate-400">{tx.category}</p>
                </div>
                <span className={`text-sm font-black ${tx.points>0?'text-emerald-600':'text-rose-600'}`}>{tx.points>0?'+':''}{tx.points}</span>
              </div>
            ))}
            {txs.length===0&&<p className="text-slate-300 text-sm italic text-center py-8">No transactions yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({icon,label,value,sub,color,bg}:any) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4 hover:border-blue-200 transition-all">
    <div className={`p-3 rounded-xl ${bg} ${color}`}>{icon}</div>
    <div><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-0.5">{label}</p><p className="text-xl font-black text-slate-900">{value}</p><p className="text-[10px] text-slate-400">{sub}</p></div>
  </div>
);

export default AdminDashboard;
