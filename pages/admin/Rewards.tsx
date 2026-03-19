import React, { useState, useEffect, useCallback } from 'react';
import { mockApi } from '../../services/api';
import { Reward } from '../../types';
import { Gift, Plus, Edit2, CheckCircle, XCircle, X, Save, Key, Info } from 'lucide-react';

const Toast = ({msg,type}:{msg:string;type:'success'|'error'}) => (
  <div className={`fixed top-6 right-6 z-[200] px-6 py-3 rounded-2xl font-bold shadow-2xl animate-in slide-in-from-top-2 ${type==='success'?'bg-emerald-600 text-white':'bg-rose-600 text-white'}`}>{msg}</div>
);

const emptyForm = { name:'', description:'', pointsRequired:'', couponCode:'', howToUse:'' };

const Rewards: React.FC = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string|null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{msg:string;type:'success'|'error'}|null>(null);

  const showToast = (msg:string,type:'success'|'error'='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  const load = useCallback(async()=>{
    try { setRewards(await mockApi.getRewards()); }
    catch(e:any){ showToast(e.message,'error'); }
  },[]);

  useEffect(()=>{ load(); },[load]);

  const openModal = (reward?:Reward) => {
    if(reward){ setEditingId(reward.id); setForm({name:reward.name,description:reward.description||'',pointsRequired:reward.pointsRequired.toString(),couponCode:reward.couponCode||'',howToUse:reward.howToUse||''}); }
    else { setEditingId(null); setForm(emptyForm); }
    setModalOpen(true);
  };

  const handleSubmit = async(e:React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const data = {...form, pointsRequired:parseInt(form.pointsRequired)};
      if(editingId){ await mockApi.updateReward(editingId,data); showToast('Reward updated!'); }
      else { await mockApi.createReward(data); showToast('Reward created!'); }
      setModalOpen(false); load();
    } catch(e:any){ showToast(e.message,'error'); }
    finally { setSaving(false); }
  };

  const toggleStatus = async(r:Reward) => {
    try { await mockApi.updateReward(r.id,{status:r.status==='active'?'inactive':'active'}); showToast(`Reward ${r.status==='active'?'deactivated':'activated'}.`); load(); }
    catch(e:any){ showToast(e.message,'error'); }
  };

  return (
    <div className="space-y-8">
      {toast&&<Toast msg={toast.msg} type={toast.type}/>}
      <div className="flex justify-between items-center">
        <div><h2 className="text-3xl font-black text-slate-900 tracking-tight">Perks Inventory</h2><p className="text-slate-500 font-medium">Manage rewards, coupon codes, and usage guides.</p></div>
        <button onClick={()=>openModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-blue-100 transition-all active:scale-95">
          <Plus size={20}/><span>New Perk</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.map(r=>(
          <div key={r.id} className={`bg-white rounded-[2.5rem] shadow-sm border p-8 flex flex-col transition-all hover:shadow-xl ${r.status==='inactive'?'opacity-60 border-slate-100':'border-slate-100 hover:border-blue-200'}`}>
            <div className="flex items-center justify-between mb-6">
              <div className={`p-4 rounded-[1.5rem] ${r.status==='active'?'bg-blue-50 text-blue-600':'bg-slate-100 text-slate-400'}`}><Gift size={32}/></div>
              <div className="text-right"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cost</p><span className={`text-3xl font-black ${r.status==='active'?'text-orange-600':'text-slate-400'}`}>{r.pointsRequired.toLocaleString()}</span></div>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">{r.name}</h3>
            <p className="text-slate-500 text-sm mb-6 flex-1 leading-relaxed">{r.description}</p>
            {r.couponCode&&<div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between"><div className="flex items-center gap-2 text-slate-400"><Key size={14}/><span className="text-[10px] font-black uppercase">Code</span></div><span className="text-xs font-black text-slate-900 font-mono">{r.couponCode}</span></div>}
            <div className="flex items-center justify-between pt-5 border-t border-slate-50">
              <button onClick={()=>toggleStatus(r)} className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-colors ${r.status==='active'?'text-rose-500 hover:text-rose-700':'text-emerald-500 hover:text-emerald-700'}`}>
                {r.status==='active'?<><XCircle size={14}/>Deactivate</>:<><CheckCircle size={14}/>Activate</>}
              </button>
              <button onClick={()=>openModal(r)} className="text-blue-600 hover:text-blue-800 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"><Edit2 size={14}/>Edit</button>
            </div>
          </div>
        ))}
        {rewards.length===0&&<div className="col-span-full py-20 text-center text-slate-300 italic text-lg">No rewards yet. Create one!</div>}
      </div>

      {modalOpen&&(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-900">{editingId?'Edit Reward':'New Reward'}</h3>
              <button onClick={()=>setModalOpen(false)} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-900"><X size={24}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Reward Name</label><input required className="w-full px-5 py-3 bg-slate-50 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. $50 Gift Card" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Points Required</label><input type="number" required min="1" className="w-full px-5 py-3 bg-slate-50 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. 500" value={form.pointsRequired} onChange={e=>setForm({...form,pointsRequired:e.target.value})}/></div>
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Coupon Code</label><div className="relative"><Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16}/><input className="w-full pl-12 pr-5 py-3 bg-slate-50 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="CODE123" value={form.couponCode} onChange={e=>setForm({...form,couponCode:e.target.value})}/></div></div>
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Usage Instructions</label><div className="relative"><Info className="absolute left-4 top-4 text-slate-300" size={16}/><textarea rows={2} className="w-full pl-12 pr-5 py-3 bg-slate-50 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="How to use this reward..." value={form.howToUse} onChange={e=>setForm({...form,howToUse:e.target.value})}/></div></div>
              </div>
              <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description</label><textarea required rows={3} className="w-full px-5 py-3 bg-slate-50 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Describe the reward..." value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={()=>setModalOpen(false)} className="px-6 py-3 text-slate-400 font-black hover:text-slate-900">Cancel</button>
                <button type="submit" disabled={saving} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-blue-700 shadow-xl shadow-blue-100 flex items-center gap-2 disabled:opacity-50">
                  <Save size={18}/><span>{saving?'Saving...':editingId?'Update':'Create'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Rewards;
