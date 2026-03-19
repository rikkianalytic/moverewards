
import React, { useState, useEffect } from 'react';
import { mockApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Reward } from '../../types';
import { Gift, Coins, ShoppingBag, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const RewardsStore: React.FC = () => {
  const { user } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [myPoints, setMyPoints] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const fetchData = async () => {
    const r = await mockApi.getRewards();
    const history = await mockApi.getPointsHistory(user!.id);
    const total = history.reduce((s, t) => s + t.points, 0);
    setRewards(r.filter(x => x.status === 'active'));
    setMyPoints(total);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleRedeem = async (reward: Reward) => {
    if (myPoints < reward.pointsRequired) {
      setMessage({ text: 'Insufficient points!', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      await mockApi.redeemReward(user!.id, reward.id);
      setMessage({ text: 'Success! Your reward is unlocked and ready in the Vault.', type: 'success' });
      fetchData();
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 8000);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Perks Marketplace</h2>
          <p className="text-slate-500 font-medium">Exchange your points for instant vouchers and rewards.</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3 bg-white px-6 py-4 rounded-[1.5rem] shadow-sm border border-orange-100">
          <Coins className="text-orange-500" />
          <span className="text-2xl font-black text-slate-900">{myPoints.toLocaleString()}</span>
          <span className="text-slate-400 text-xs font-black uppercase tracking-widest">Available</span>
        </div>
      </div>

      {message && (
        <div className={`p-5 rounded-2xl flex items-center justify-between border animate-in fade-in slide-in-from-top-2 ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
        }`}>
          <div className="flex items-center space-x-3">
            {message.type === 'success' ? <CheckCircle size={24} /> : <ShoppingBag size={24} />}
            <p className="font-black text-sm">{message.text}</p>
          </div>
          {message.type === 'success' && (
            <Link to="/employee/redemptions" className="bg-emerald-600 text-white px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center space-x-2 hover:bg-emerald-700 shadow-lg shadow-emerald-200">
              <span>Go to Vault</span>
              <ArrowRight size={14} />
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {rewards.map(reward => (
          <div key={reward.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 group transition-all hover:shadow-xl hover:border-blue-200 flex flex-col">
            <div className="h-48 bg-slate-50 flex items-center justify-center relative border-b border-slate-50">
              <Gift size={64} className="text-slate-200 group-hover:text-blue-500 transition-colors" />
              <div className="absolute top-6 right-6 bg-orange-500 text-white px-4 py-1.5 rounded-full font-black text-sm shadow-xl shadow-orange-200">
                {reward.pointsRequired.toLocaleString()} pts
              </div>
            </div>
            <div className="p-8 flex-1 flex flex-col">
              <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight">{reward.name}</h3>
              <p className="text-slate-500 text-sm mb-8 flex-1 leading-relaxed font-medium">{reward.description}</p>
              
              <button
                onClick={() => handleRedeem(reward)}
                disabled={loading || myPoints < reward.pointsRequired}
                className={`w-full py-4 rounded-2xl font-black transition-all flex items-center justify-center space-x-2 active:scale-95 ${
                  myPoints >= reward.pointsRequired
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-100'
                    : 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed'
                }`}
              >
                <ShoppingBag size={18} />
                <span>{myPoints >= reward.pointsRequired ? 'Redeem Instantly' : 'Insufficient Points'}</span>
              </button>
            </div>
          </div>
        ))}

        {rewards.length === 0 && (
          <div className="col-span-full py-24 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
             <ShoppingBag className="mx-auto text-slate-200 mb-6" size={64} />
             <h4 className="text-xl font-black text-slate-800 tracking-tight">The store is currently empty</h4>
             <p className="text-slate-400 text-sm font-medium">Check back soon for new vouchers and perks!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RewardsStore;
