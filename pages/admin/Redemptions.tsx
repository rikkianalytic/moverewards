import React, { useState, useEffect, useCallback } from 'react';
import { mockApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { RewardRedemption, RedemptionStatus, PointRequest, RequestStatus } from '../../types';
import { CheckCircle, XCircle, Gift, Coins, Inbox, User } from 'lucide-react';

const Toast = ({msg,type}:{msg:string;type:'success'|'error'}) => (
  <div className={`fixed top-6 right-6 z-[200] px-6 py-3 rounded-2xl font-bold shadow-2xl animate-in slide-in-from-top-2 ${type==='success'?'bg-emerald-600 text-white':'bg-rose-600 text-white'}`}>{msg}</div>
);

const Redemptions: React.FC = () => {
  const { user } = useAuth();
  const [redemptions, setRedemptions] = useState<RewardRedemption[]>([]);
  const [pointReqs, setPointReqs] = useState<PointRequest[]>([]);
  const [tab, setTab] = useState<'rewards'|'points'>('rewards');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{msg:string;type:'success'|'error'}|null>(null);

  const showToast = (msg:string,type:'success'|'error'='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  const load = useCallback(async()=>{
    try {
      const [r,p] = await Promise.all([mockApi.getRedemptions(),mockApi.getPointRequests()]);
      setRedemptions(r); setPointReqs(p);
    } catch(e:any){ showToast(e.message,'error'); }
  },[]);

  useEffect(()=>{ load(); },[load]);

  const handleRedeem = async(id:string,status:RedemptionStatus) => {
    setLoading(true);
    try { await mockApi.handleRedemption(id,status); showToast(status===RedemptionStatus.APPROVED?'Redemption approved!':'Redemption denied.'); load(); }
    catch(e:any){ showToast(e.message,'error'); }
    finally { setLoading(false); }
  };

  const handlePoint = async(id:string,status:RequestStatus) => {
    setLoading(true);
    try { await mockApi.handlePointRequest(id,status,user!.id); showToast(status===RequestStatus.APPROVED?'Points request approved!':'Request declined.'); load(); }
    catch(e:any){ showToast(e.message,'error'); }
    finally { setLoading(false); }
  };

  const pendingReds = redemptions.filter(r=>r.status===RedemptionStatus.PENDING);
  const pendingPts = pointReqs.filter(r=>r.status===RequestStatus.PENDING);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {toast&&<Toast msg={toast.msg} type={toast.type}/>}
      <div className="text-center"><h2 className="text-3xl font-black text-slate-900 tracking-tight">Approval Queue</h2><p className="text-slate-500 font-medium">Review and process employee requests.</p></div>

      <div className="flex bg-slate-100/50 p-2 rounded-[2rem] max-w-md mx-auto">
        <button onClick={()=>setTab('rewards')} className={`flex-1 py-3 rounded-[1.5rem] font-bold transition-all flex items-center justify-center gap-2 ${tab==='rewards'?'bg-white text-blue-600 shadow-sm':'text-slate-500'}`}>
          <Gift size={18}/><span>Rewards</span>{pendingReds.length>0&&<span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black">{pendingReds.length}</span>}
        </button>
        <button onClick={()=>setTab('points')} className={`flex-1 py-3 rounded-[1.5rem] font-bold transition-all flex items-center justify-center gap-2 ${tab==='points'?'bg-white text-blue-600 shadow-sm':'text-slate-500'}`}>
          <Coins size={18}/><span>Points</span>{pendingPts.length>0&&<span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black">{pendingPts.length}</span>}
        </button>
      </div>

      {tab==='rewards'?(
        <div className="space-y-4">
          {pendingReds.length===0?(
            <Empty text="No pending reward requests."/>
          ):pendingReds.map(r=>(
            <div key={r.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-blue-200 transition-all">
              <div className="flex items-center gap-5">
                <div className="p-5 bg-blue-50 rounded-[1.5rem] text-blue-600"><Gift size={32}/></div>
                <div><h4 className="text-xl font-black text-slate-900">{r.rewardName}</h4><div className="flex items-center text-slate-500 text-sm font-semibold mt-1"><User size={14} className="mr-1.5"/>{r.employeeName}</div><p className="text-xs text-slate-400 mt-1">{new Date(r.dateRequested).toLocaleDateString()}</p></div>
              </div>
              <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-t-0 pt-4 md:pt-0 border-slate-50">
                <div className="text-right"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cost</p><p className="text-2xl font-black text-orange-600">{r.pointsValue} pts</p></div>
                <div className="flex gap-3">
                  <button disabled={loading} onClick={()=>handleRedeem(r.id,RedemptionStatus.APPROVED)} className="p-4 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-2xl transition-all active:scale-95 disabled:opacity-50"><CheckCircle size={24}/></button>
                  <button disabled={loading} onClick={()=>handleRedeem(r.id,RedemptionStatus.DENIED)} className="p-4 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-2xl transition-all active:scale-95 disabled:opacity-50"><XCircle size={24}/></button>
                </div>
              </div>
            </div>
          ))}
          {redemptions.filter(r=>r.status!==RedemptionStatus.PENDING).length>0&&(
            <div className="mt-6"><h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3">Processed</h3>
              {redemptions.filter(r=>r.status!==RedemptionStatus.PENDING).map(r=>(
                <div key={r.id} className={`bg-white p-5 rounded-2xl shadow-sm border mb-3 flex items-center justify-between ${r.status===RedemptionStatus.APPROVED?'border-emerald-100':'border-rose-100'}`}>
                  <div><p className="font-bold text-slate-900">{r.rewardName}</p><p className="text-sm text-slate-500">{r.employeeName}</p></div>
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${r.status===RedemptionStatus.APPROVED?'bg-emerald-50 text-emerald-600':'bg-rose-50 text-rose-600'}`}>{r.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ):(
        <div className="space-y-4">
          {pendingPts.length===0?(
            <Empty text="No pending point requests."/>
          ):pendingPts.map(r=>(
            <div key={r.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-blue-200 transition-all">
              <div className="flex items-center gap-5 flex-1">
                <div className="p-5 bg-orange-50 rounded-[1.5rem] text-orange-600"><Coins size={32}/></div>
                <div className="flex-1"><h4 className="text-xl font-black text-slate-900">{r.category}</h4><div className="flex items-center text-slate-500 text-sm font-semibold mt-1"><User size={14} className="mr-1.5"/>{r.employeeName}</div>{r.notes&&<p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-xl mt-2">"{r.notes}"</p>}</div>
              </div>
              <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-t-0 pt-4 md:pt-0 border-slate-50">
                <div className="text-right"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Award</p><p className="text-2xl font-black text-emerald-600">+{r.points} pts</p></div>
                <div className="flex gap-3">
                  <button disabled={loading} onClick={()=>handlePoint(r.id,RequestStatus.APPROVED)} className="p-4 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-2xl transition-all active:scale-95 disabled:opacity-50"><CheckCircle size={24}/></button>
                  <button disabled={loading} onClick={()=>handlePoint(r.id,RequestStatus.DECLINED)} className="p-4 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-2xl transition-all active:scale-95 disabled:opacity-50"><XCircle size={24}/></button>
                </div>
              </div>
            </div>
          ))}
          {pointReqs.filter(r=>r.status!==RequestStatus.PENDING).length>0&&(
            <div className="mt-6"><h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3">Processed</h3>
              {pointReqs.filter(r=>r.status!==RequestStatus.PENDING).map(r=>(
                <div key={r.id} className={`bg-white p-5 rounded-2xl shadow-sm border mb-3 flex items-center justify-between ${r.status===RequestStatus.APPROVED?'border-emerald-100':'border-rose-100'}`}>
                  <div><p className="font-bold text-slate-900">{r.category}</p><p className="text-sm text-slate-500">{r.employeeName} · {r.points} pts</p></div>
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${r.status===RequestStatus.APPROVED?'bg-emerald-50 text-emerald-600':'bg-rose-50 text-rose-600'}`}>{r.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Empty = ({text}:{text:string}) => (
  <div className="p-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center">
    <div className="p-6 bg-slate-50 rounded-full mb-4"><Inbox className="text-slate-200" size={48}/></div>
    <p className="text-slate-400 font-bold">{text}</p><p className="text-slate-300 text-sm mt-1">Check back later for new requests.</p>
  </div>
);

export default Redemptions;
