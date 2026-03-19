import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mockApi } from '../services/api';
import { LogIn, ArrowRight } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { user } = await mockApi.login(email, password);
      login(user);
      navigate(user.role === 'admin' ? '/admin' : '/employee', { replace: true });
    } catch (err: any) { setError(err.message || 'Login failed. Please check your credentials.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] px-4">
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-blue-600/20 to-transparent pointer-events-none"/>
      <div className="max-w-md w-full relative z-10">
        <div className="bg-white rounded-[3rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] p-10 lg:p-12">
          <div className="text-center mb-10">
            <div className="inline-block p-5 bg-orange-500 rounded-3xl text-white shadow-xl shadow-orange-500/30 mb-6"><LogIn size={40}/></div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">MoveRewards</h2>
            <p className="text-slate-500 font-medium mt-3 text-lg">Sign in to your performance portal</p>
          </div>
          {error && <div className="mb-6 p-4 bg-rose-50 text-rose-600 text-sm rounded-2xl border border-rose-100 font-bold flex items-center space-x-2"><div className="w-1.5 h-1.5 bg-rose-600 rounded-full flex-shrink-0"/><span>{error}</span></div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Work Email</label>
              <input type="email" required autoComplete="email" className="w-full px-6 py-4 bg-slate-50 border-none rounded-[1.5rem] font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="you@company.com" value={email} onChange={e=>setEmail(e.target.value)}/>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2 ml-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                <Link to="/reset-password" className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline">Forgot?</Link>
              </div>
              <input type="password" required autoComplete="current-password" className="w-full px-6 py-4 bg-slate-50 border-none rounded-[1.5rem] font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)}/>
            </div>
            <button type="submit" disabled={loading} className="w-full py-5 bg-[#1E1B4B] hover:bg-black text-white font-black rounded-[1.5rem] transition-all shadow-2xl disabled:opacity-50 active:scale-[0.98] flex items-center justify-center space-x-2">
              <span>{loading?'Signing in...':'Enter Dashboard'}</span><ArrowRight size={20}/>
            </button>
          </form>
          <div className="mt-10 text-center">
            <p className="text-sm text-slate-400 font-medium mb-1">New employee?</p>
            <Link to="/signup" className="text-blue-600 font-black hover:underline">Request an Account Activation</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
