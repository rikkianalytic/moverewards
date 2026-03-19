
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockApi } from '../../services/api';
import { RewardRedemption, RedemptionStatus, Reward } from '../../types';
import { ShoppingBag, CheckCircle, XCircle, Clock, ExternalLink, Key, Info, Copy, X } from 'lucide-react';

const MyRedemptions: React.FC = () => {
  const { user } = useAuth();
  const [redemptions, setRedemptions] = useState<RewardRedemption[]>([]);
  const [rewardsList, setRewardsList] = useState<Reward[]>([]);
  const [selectedRedemption, setSelectedRedemption] = useState<{ red: RewardRedemption, reward: Reward } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const reds = await mockApi.getRedemptions(user!.id);
      const rews = await mockApi.getRewards();
      setRedemptions(reds);
      setRewardsList(rews);
    };
    fetchData();
  }, [user]);

  const handleCardClick = (red: RewardRedemption) => {
    if (red.status !== RedemptionStatus.APPROVED) return;
    
    const reward = rewardsList.find(r => r.id === red.rewardId);
    if (reward) {
      setSelectedRedemption({ red, reward });
    }
  };

  const copyToClipboard = (e: React.MouseEvent, text: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const getStatusStyle = (status: RedemptionStatus) => {
    switch (status) {
      case RedemptionStatus.APPROVED: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case RedemptionStatus.DENIED: return 'bg-rose-50 text-rose-700 border-rose-100';
      default: return 'bg-blue-50 text-blue-700 border-blue-100';
    }
  };

  const getStatusIcon = (status: RedemptionStatus) => {
    switch (status) {
      case RedemptionStatus.APPROVED: return <CheckCircle size={16} />;
      case RedemptionStatus.DENIED: return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">My Reward Vault</h2>
          <p className="text-slate-500 font-medium">Track your redemptions and access instant voucher codes.</p>
        </div>
        <div className="bg-blue-600 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center space-x-2 shadow-lg shadow-blue-100">
           <Key size={14} />
           <span>{redemptions.filter(r => r.status === RedemptionStatus.APPROVED).length} Unlocked Rewards</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {redemptions.map(red => {
          const reward = rewardsList.find(r => r.id === red.rewardId);
          return (
            <div 
              key={red.id} 
              onClick={() => handleCardClick(red)}
              className={`bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 transition-all flex flex-col ${
                red.status === RedemptionStatus.APPROVED 
                  ? 'cursor-pointer hover:shadow-xl hover:border-blue-200 group' 
                  : 'opacity-70 grayscale-[0.3]'
              }`}
            >
              <div className="flex justify-between items-start mb-8">
                <div className={`p-4 rounded-2xl ${red.status === RedemptionStatus.APPROVED ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                  <ShoppingBag size={28} />
                </div>
                <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(red.status)}`}>
                  {getStatusIcon(red.status)}
                  <span>{red.status}</span>
                </div>
              </div>
              
              <h3 className="text-xl font-black text-slate-900 mb-1 leading-tight">{red.rewardName}</h3>
              <p className="text-sm font-black text-orange-500 mb-6">{red.pointsValue.toLocaleString()} Points Spent</p>
              
              {red.status === RedemptionStatus.APPROVED && reward?.couponCode && (
                <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Coupon Code</span>
                      <span className="text-xs font-black text-slate-900 font-mono">{reward.couponCode}</span>
                   </div>
                   <button 
                    onClick={(e) => copyToClipboard(e, reward.couponCode || '', red.id)}
                    className={`p-2.5 rounded-xl transition-all active:scale-90 ${copied === red.id ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 shadow-sm'}`}
                   >
                     {copied === red.id ? <CheckCircle size={16} /> : <Copy size={16} />}
                   </button>
                </div>
              )}
              
              <div className="mt-auto pt-6 border-t border-slate-50 flex justify-between items-center">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {new Date(red.dateRequested).toLocaleDateString()}
                </div>
                {red.status === RedemptionStatus.APPROVED && (
                  <div className="text-blue-600 text-[10px] font-black uppercase tracking-widest flex items-center group-hover:translate-x-1 transition-transform">
                    Full Details
                    <ExternalLink size={12} className="ml-1.5" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        {redemptions.length === 0 && (
          <div className="col-span-full py-24 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 text-center">
            <ShoppingBag className="mx-auto text-slate-200 mb-6" size={64} />
            <h4 className="text-xl font-black text-slate-800">Your vault is empty</h4>
            <p className="text-slate-400 text-sm font-medium mt-2">Redeem points in the Store to see your rewards here.</p>
          </div>
        )}
      </div>

      {/* Reward Details / Voucher Modal */}
      {selectedRedemption && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-[3.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white">
            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <CheckCircle size={28} />
                </div>
                <div>
                   <h3 className="text-2xl font-black text-slate-900 tracking-tight">Reward Unlocked!</h3>
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Transaction Verified</p>
                </div>
              </div>
              <button onClick={() => setSelectedRedemption(null)} className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-10 space-y-8">
              <div className="text-center">
                <p className="text-sm font-bold text-slate-500 mb-1">{selectedRedemption.red.rewardName}</p>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-8">Redemption ID: {selectedRedemption.red.id.slice(-8)}</p>
                
                <div className="relative group">
                   <div className="p-8 bg-slate-900 rounded-[2.5rem] border-4 border-dashed border-slate-700 relative overflow-hidden">
                      <Key className="absolute -right-4 -bottom-4 text-white/5" size={120} />
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">Your Secret Voucher Code</p>
                      <h4 className="text-4xl font-black text-white font-mono tracking-tighter mb-6">
                        {selectedRedemption.reward.couponCode || 'N/A-GENERIC'}
                      </h4>
                      <button 
                        onClick={(e) => copyToClipboard(e, selectedRedemption.reward.couponCode || 'GENERIC', 'modal')}
                        className={`mx-auto px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center space-x-2 transition-all active:scale-95 ${
                          copied === 'modal' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-900 hover:bg-slate-100 shadow-xl'
                        }`}
                      >
                        {copied === 'modal' ? <CheckCircle size={16} /> : <Copy size={16} />}
                        <span>{copied === 'modal' ? 'Copied to Clipboard' : 'Copy Code'}</span>
                      </button>
                   </div>
                </div>
              </div>

              <div className="bg-blue-50 p-8 rounded-[2rem] border border-blue-100">
                <h5 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3 flex items-center">
                  <Info size={14} className="mr-2" />
                  How to use this reward
                </h5>
                <p className="text-sm text-blue-900 font-bold leading-relaxed">
                  {selectedRedemption.reward.howToUse || 'Present this code to your manager or enter it on the provider\'s checkout page to claim your perk.'}
                </p>
              </div>

              <button 
                onClick={() => setSelectedRedemption(null)}
                className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-200"
              >
                Close Vault
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRedemptions;
