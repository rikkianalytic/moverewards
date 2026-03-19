import React, { useState, useEffect, useCallback } from 'react';
import { mockApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { EmployeeProfile } from '../../types';
import { Plus, Minus, History, Settings, User, Tag, X, Trash2 } from 'lucide-react';

const Toast = ({msg,type}:{msg:string;type:'success'|'error'}) => (
  <div className={`fixed top-6 right-6 z-[200] px-6 py-3 rounded-2xl font-bold shadow-2xl animate-in slide-in-from-top-2 ${type==='success'?'bg-emerald-600 text-white':'bg-rose-600 text-white'}`}>{msg}</div>
);

const Points: React.FC = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [newCat, setNewCat] = useState('');
  const [showCats, setShowCats] = useState(false);
  const [selEmp, setSelEmp] = useState('');
  const [points, setPoints] = useState('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{msg:string;type:'success'|'error'}|null>(null);

  const showToast = (msg:string,type:'success'|'error'='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  const load = useCallback(async()=>{
    try {
      const [emps,cats,txs] = await Promise.all([mockApi.getEmployees(),mockApi.getCategories(),mockApi.getPointsHistory()]);
      setEmployees(emps.filter(e=>e.status==='active'));
      setCategories(cats);
      setLogs(txs.slice(0,10));
      if(cats.length>0&&!category) setCategory(cats[0]);
    } catch(e:any){ showToast(e.message,'error'); }
  },[]);

  useEffect(()=>{ load(); },[load]);

  const handleSubmit = async(isAdd:boolean) => {
    if(!selEmp||!points||!category){ showToast('Please fill all required fields','error'); return; }
    setLoading(true);
    try {
      const amt = isAdd?parseInt(points):-parseInt(points);
      await mockApi.addPoints(selEmp,amt,category,notes,user!.id);
      showToast(`${isAdd?'Awarded':'Deducted'} ${points} points successfully!`);
      setPoints(''); setNotes('');
      load();
    } catch(e:any){ showToast(e.message,'error'); }
    finally { setLoading(false); }
  };

  const handleAddCat = async() => {
    if(!newCat.trim()){ showToast('Enter a category name','error'); return; }
    try { await mockApi.addCategory(newCat.trim()); setNewCat(''); showToast('Category added!'); load(); }
    catch(e:any){ showToast(e.message,'error'); }
  };

  const handleDelCat = async(cat:string) => {
    if(!window.confirm(`Delete category "${cat}"?`)) return;
    try { await mockApi.deleteCategory(cat); showToast('Category deleted.'); load(); }
    catch(e:any){ showToast(e.message,'error'); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {toast&&<Toast msg={toast.msg} type={toast.type}/>}
      <div className="flex justify-between items-center">
        <div><h2 className="text-2xl font-black text-slate-900 tracking-tight">Points Console</h2><p className="text-slate-500 text-sm font-medium">Award or deduct employee points.</p></div>
        <button onClick={()=>setShowCats(!showCats)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all flex items-center gap-2 text-sm font-bold">
          <Settings size={18}/><span>Categories</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Team Member</label>
                <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                  <select className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none appearance-none" value={selEmp} onChange={e=>setSelEmp(e.target.value)}>
                    <option value="">Select employee...</option>
                    {employees.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                <div className="relative"><Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                  <select className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none appearance-none" value={category} onChange={e=>setCategory(e.target.value)}>
                    {categories.map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Points Amount</label>
              <input type="number" min="1" className="w-full px-4 py-2.5 bg-slate-50 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. 50" value={points} onChange={e=>setPoints(e.target.value)}/>
            </div>
            <div className="mb-5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Notes (optional)</label>
              <textarea className="w-full px-4 py-2.5 bg-slate-50 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none min-h-[70px]" placeholder="Additional context..." value={notes} onChange={e=>setNotes(e.target.value)}/>
            </div>
            <div className="flex gap-3">
              <button onClick={()=>handleSubmit(true)} disabled={loading} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50">
                <Plus size={18}/><span>Award Points</span>
              </button>
              <button onClick={()=>handleSubmit(false)} disabled={loading} className="flex-1 py-3 bg-white border border-slate-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 text-slate-500 font-black rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50">
                <Minus size={18}/><span>Deduct Points</span>
              </button>
            </div>
          </div>

          {showCats&&(
            <div className="bg-slate-900 text-white p-6 rounded-2xl animate-in fade-in slide-in-from-top-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-black text-sm uppercase tracking-widest flex items-center gap-2"><Tag size={16} className="text-blue-400"/>Manage Categories</h3>
                <button onClick={()=>setShowCats(false)} className="text-slate-500 hover:text-white"><X size={20}/></button>
              </div>
              <div className="flex gap-2 mb-4">
                <input type="text" className="flex-1 bg-slate-800 rounded-xl px-4 py-2 text-sm font-bold focus:ring-1 focus:ring-blue-500 outline-none" placeholder="New category name..." value={newCat} onChange={e=>setNewCat(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleAddCat()}/>
                <button onClick={handleAddCat} className="bg-blue-600 p-2.5 rounded-xl hover:bg-blue-700"><Plus size={18}/></button>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {categories.map(c=>(
                  <div key={c} className="flex items-center justify-between p-2.5 bg-slate-800/50 rounded-lg group">
                    <span className="text-xs font-bold text-slate-300">{c}</span>
                    <button onClick={()=>handleDelCat(c)} className="text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14}/></button>
                  </div>
                ))}
                {categories.length===0&&<p className="text-slate-500 text-xs text-center py-4">No categories yet.</p>}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-5">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-black text-slate-900 mb-5 flex items-center gap-2"><History size={18} className="text-blue-600"/>Recent Adjustments</h3>
            <div className="space-y-3">
              {logs.map(l=>(
                <div key={l.id} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-transparent hover:border-slate-100 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-[10px]">{l.employeeName.charAt(0)}</div>
                    <div><p className="font-bold text-slate-800 text-xs">{l.employeeName}</p><p className="text-[10px] text-slate-400 uppercase tracking-tight">{l.category}</p></div>
                  </div>
                  <div className={`text-sm font-black ${l.points>0?'text-emerald-600':'text-rose-600'}`}>{l.points>0?'+':''}{l.points}</div>
                </div>
              ))}
              {logs.length===0&&<p className="text-center py-10 text-slate-400 text-xs italic">No points issued yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Points;
