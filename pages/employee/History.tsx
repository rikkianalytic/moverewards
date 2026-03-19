import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockApi } from '../../services/api';
import { PointsTransaction } from '../../types';
import { History as HistoryIcon, ArrowUpCircle, ArrowDownCircle, Plus, Send, X } from 'lucide-react';

const Toast = ({msg,type}:{msg:string;type:'success'|'error'}) => (
  <div className={`fixed top-6 right-6 z-[200] px-6 py-3 rounded-2xl font-bold shadow-2xl animate-in slide-in-from-top-2 ${type==='success'?'bg-emerald-600 text-white':'bg-rose-600 text-white'}`}>{msg}</div>
);

const PointsHistory: React.FC = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<PointsTransaction[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [balance, setBalance] = useState(0);
  const [toast, setToast] = useState<{msg:string;type:'success'|'error'}|null>(null);
  const [form, setForm] = useState({ points:'', category:'', notes:'' });

  const showToast = (msg:string,type:'success'|'error'='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  const load = useCallback(async()=>{
    try {
      const [txs,cats] = await Promise.all([mockApi.getPointsHistory(user!.id),mockApi.getCategories()]);
      setHistory(txs);
      setCategories(cats);
      setBalance(txs.reduce((s:number,t:any)=>s+t.points,0));
      if(cats.length>0&&!form.category) setForm(f=>({...f,category:cats[0]}));
    } catch(e:any){ showToast(e.message,'error'); }
  },[user]);

  useEffect(()=>{ load(); },[load]);

  const handleSubmit = async(e:React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      await mockApi.createPointRequest(user!.id,parseInt(form.points),form.category,form.notes);
      showToast('Points request submitted! Waiting for admin approval.');
      setForm({points:'',category:categories[0]||'',notes:''}); setModalOpen(false); load();
    } catch(e:any){ showToast(e.message,'error'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-8">
      {toast&&<Toast msg={toast.msg} type={toast.type}/>}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h2 className="text-3xl font-black text-slate-900 tracking-tight">Points History</h2><p className="text-slate-500 font-medium">Your earnings and redemptions.</p></div>
        <div className="flex items-center gap-4">
          <div className="bg-blue-50 border border-blue-100 px-5 py-3 rounded-2xl"><p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Balance</p><p className="text-xl font-black text-blue-700">{balance.toLocaleString()} pts</p></div>
          <button onClick={()=>setModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-blue-100 transition-all active:scale-95"><Plus size={20}/><span>Claim Points</span></button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {history.length===0?(
          <div className="p-20 text-center"><div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4"><HistoryIcon className="text-slate-300" size={32}/></div><p className="text-slate-500 font-medium">No transactions yet.</p></div>
        ):(
          <div className="divide-y divide-slate-50">
            {history.map(tx=>(
              <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-full ${tx.points>0?'bg-emerald-100 text-emerald-600':'bg-rose-100 text-rose-600'}`}>{tx.points>0?<ArrowUpCircle size={22}/>:<ArrowDownCircle size={22}/>}</div>
                  <div><h4 className="font-bold text-slate-900">{tx.category}</h4><p className="text-sm text-slate-500">{tx.notes||'—'}</p><p className="text-xs text-slate-400 mt-1">{new Date(tx.createdAt).toLocaleString()}</p></div>
                </div>
                <div className="text-right"><p className={`text-xl font-black ${tx.points>0?'text-emerald-600':'text-rose-600'}`}>{tx.points>0?'+':''}{tx.points}</p><p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Points</p></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen&&(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-900">Claim Points</h3>
              <button onClick={()=>setModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-900"><X size={24}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                <select required className="w-full px-5 py-3 bg-slate-50 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
                  {categories.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Points Amount</label><input required type="number" min="1" className="w-full px-5 py-3 bg-slate-50 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. 100" value={form.points} onChange={e=>setForm({...form,points:e.target.value})}/></div>
              <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Notes / Proof</label><textarea required rows={3} className="w-full px-5 py-3 bg-slate-50 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Explain why you're claiming..." value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={()=>setModalOpen(false)} className="flex-1 py-3 text-slate-500 font-bold">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-3 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50">
                  <Send size={18}/><span>{saving?'Sending...':'Submit Request'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default PointsHistory;
