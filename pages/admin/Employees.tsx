import React, { useState, useEffect, useCallback } from 'react';
import { mockApi } from '../../services/api';
import { EmployeeProfile, UserStatus, PointsTransaction, EmployeePosition, UserRole } from '../../types';
import { UserCheck, UserX, Search, Mail, Phone, Coins, X, Plus, Edit2, Camera, Save, Key, RefreshCw } from 'lucide-react';

const Toast = ({msg,type}:{msg:string;type:'success'|'error'}) => (
  <div className={`fixed top-6 right-6 z-[200] px-6 py-3 rounded-2xl font-bold shadow-2xl animate-in slide-in-from-top-2 ${type==='success'?'bg-emerald-600 text-white':'bg-rose-600 text-white'}`}>{msg}</div>
);

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<EmployeeProfile|null>(null);
  const [history, setHistory] = useState<PointsTransaction[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string|null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{msg:string;type:'success'|'error'}|null>(null);
  const [form, setForm] = useState({name:'',email:'',phone:'',position:EmployeePosition.MOVER,password:'password123',profilePic:''});

  const showToast = (msg:string,type:'success'|'error'='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  const load = useCallback(async()=>{
    try { setEmployees(await mockApi.getEmployees()); }
    catch(e:any){ showToast(e.message,'error'); }
  },[]);

  useEffect(()=>{ load(); },[load]);

  const handleApprove = async(e:React.MouseEvent,id:string) => {
    e.stopPropagation();
    try { await mockApi.approveEmployee(id); showToast('Employee approved!'); load(); }
    catch(e:any){ showToast(e.message,'error'); }
  };
  const handleDeactivate = async(e:React.MouseEvent,id:string) => {
    e.stopPropagation();
    if(!window.confirm('Deactivate this employee? They will not be able to login.')) return;
    try { await mockApi.deactivateEmployee(id); showToast('Employee deactivated.'); load(); }
    catch(e:any){ showToast(e.message,'error'); }
  };
  const handleActivate = async(e:React.MouseEvent,id:string) => {
    e.stopPropagation();
    try { await mockApi.activateEmployee(id); showToast('Employee reactivated!'); load(); }
    catch(e:any){ showToast(e.message,'error'); }
  };
  const openDetails = async(emp:EmployeeProfile) => {
    setSelected(emp);
    try { setHistory(await mockApi.getPointsHistory(emp.id)); }
    catch(e:any){ setHistory([]); }
  };
  const openModal = (emp?:EmployeeProfile) => {
    if(emp){ setEditId(emp.id); setForm({name:emp.name,email:emp.email,phone:emp.phone||'',position:emp.position,password:'',profilePic:emp.profilePic||''}); }
    else { setEditId(null); setForm({name:'',email:'',phone:'',position:EmployeePosition.MOVER,password:'password123',profilePic:''}); }
    setModalOpen(true);
  };
  const handleImg = (e:React.ChangeEvent<HTMLInputElement>) => {
    const f=e.target.files?.[0]; if(!f) return;
    if(f.size>2*1024*1024){ showToast('Image too large. Max 2MB.','error'); return; }
    const r=new FileReader(); r.onloadend=()=>setForm(p=>({...p,profilePic:r.result as string})); r.readAsDataURL(f);
  };
  const handleSubmit = async(e:React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if(editId){ const p:any={...form}; if(!p.password) delete p.password; await mockApi.adminUpdateEmployee(editId,p); showToast('Employee updated!'); }
      else { await mockApi.adminCreateEmployee({...form,role:UserRole.EMPLOYEE,hireDate:new Date().toISOString()}); showToast('Employee created!'); }
      setModalOpen(false); load();
    } catch(e:any){ showToast(e.message,'error'); }
    finally { setSaving(false); }
  };

  const filtered = employees.filter(e=>{
    const s=filter.toLowerCase();
    return (e.name.toLowerCase().includes(s)||e.email.toLowerCase().includes(s))&&(statusFilter==='all'||e.status===statusFilter);
  });

  return (
    <div className="space-y-8">
      {toast&&<Toast msg={toast.msg} type={toast.type}/>}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div><h2 className="text-3xl font-black text-slate-900 tracking-tight">Team Roster</h2><p className="text-slate-500 font-medium">Manage staff profiles, access, and identity.</p></div>
        <div className="flex gap-3">
          <select className="px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold outline-none cursor-pointer" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value={UserStatus.ACTIVE}>Active</option>
            <option value={UserStatus.PENDING}>Pending</option>
            <option value={UserStatus.DEACTIVATED}>Deactivated</option>
          </select>
          <button onClick={()=>openModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-blue-100 transition-all active:scale-95">
            <Plus size={20}/><span>Add Member</span>
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
        <input type="text" placeholder="Search by name or email..." className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-3xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium" value={filter} onChange={e=>setFilter(e.target.value)}/>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(emp=>(
          <div key={emp.id} onClick={()=>openDetails(emp)} className={`bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden group cursor-pointer hover:shadow-xl transition-all ${emp.status===UserStatus.DEACTIVATED?'opacity-60':''}`}>
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="w-16 h-16 rounded-[1.5rem] overflow-hidden bg-slate-100 border-2 border-white shadow-lg">
                  {emp.profilePic?<img src={emp.profilePic} className="w-full h-full object-cover" alt={emp.name}/>:<div className="w-full h-full bg-blue-600 flex items-center justify-center text-white font-black text-xl">{emp.name.charAt(0)}</div>}
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 ${emp.status===UserStatus.ACTIVE?'bg-emerald-50 text-emerald-600':emp.status===UserStatus.PENDING?'bg-orange-50 text-orange-600':'bg-rose-50 text-rose-600'}`}>{emp.status}</span>
                  <div className="flex items-center gap-1 text-blue-600 font-black text-sm"><Coins size={14}/><span>{(emp.totalPoints||0).toLocaleString()} pts</span></div>
                </div>
              </div>
              <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{emp.name}</h3>
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest mt-1 mb-4">{emp.position}</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-slate-500"><Mail size={14} className="mr-3 opacity-40"/><span className="truncate font-medium">{emp.email}</span></div>
                <div className="flex items-center text-slate-500"><Phone size={14} className="mr-3 opacity-40"/><span className="font-medium">{emp.phone||'—'}</span></div>
              </div>
            </div>
            <div className="bg-slate-50/50 px-8 py-5 flex justify-between items-center border-t border-slate-100">
              <button onClick={e=>{e.stopPropagation();openModal(emp);}} className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 rounded-xl transition-all"><Edit2 size={16}/></button>
              <div className="flex gap-2">
                {emp.status===UserStatus.PENDING&&<button onClick={e=>handleApprove(e,emp.id)} className="p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"><UserCheck size={18}/></button>}
                {emp.status===UserStatus.ACTIVE&&<button onClick={e=>handleDeactivate(e,emp.id)} className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 rounded-xl transition-all"><UserX size={18}/></button>}
                {emp.status===UserStatus.DEACTIVATED&&<button onClick={e=>handleActivate(e,emp.id)} className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"><RefreshCw size={18}/></button>}
              </div>
            </div>
          </div>
        ))}
        {filtered.length===0&&<div className="col-span-full py-20 text-center text-slate-300 italic text-lg">No employees found.</div>}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen&&(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-900">{editId?'Edit Employee':'Add New Employee'}</h3>
              <button onClick={()=>setModalOpen(false)} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-900"><X size={24}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-blue-600 flex items-center justify-center text-white text-2xl font-black shadow-lg">
                    {form.profilePic?<img src={form.profilePic} className="w-full h-full object-cover" alt=""/>:form.name?.charAt(0)||'?'}
                  </div>
                  <label className="absolute -bottom-2 -right-2 p-2 bg-white rounded-xl shadow-lg border border-slate-100 text-slate-500 hover:text-blue-600 cursor-pointer transition-all">
                    <Camera size={16}/><input type="file" className="hidden" accept="image/*" onChange={handleImg}/>
                  </label>
                </div>
                <div><p className="font-black text-slate-700 text-sm">Profile Photo</p><p className="text-slate-400 text-xs mt-1">JPG/PNG — max 2MB</p></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Full Name</label><input required className="w-full px-5 py-3 bg-slate-50 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email</label><input type="email" required className="w-full px-5 py-3 bg-slate-50 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Phone</label><input className="w-full px-5 py-3 bg-slate-50 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></div>
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Position</label>
                  <select className="w-full px-5 py-3 bg-slate-50 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={form.position} onChange={e=>setForm({...form,position:e.target.value as EmployeePosition})}>
                    <option value={EmployeePosition.MOVER}>Mover</option>
                    <option value={EmployeePosition.DRIVER}>Driver</option>
                    <option value={EmployeePosition.CREW_LEAD}>Crew Lead</option>
                  </select>
              </div><button type="button" onClick={()=>{setModalOpen(false);setEditId(null);}} className="px-6 py-3 text-slate-500 font-black hover:text-slate-900">Cancel</button>
                <button type="submit" disabled={saving} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-blue-700 shadow-xl shadow-blue-100 flex items-center gap-2 disabled:opacity-50">
                  <Save size={18}/><span>{saving?'Saving...':editId?'Update':'Create'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selected&&(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-start">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-blue-600 flex items-center justify-center text-white text-2xl font-black shadow-lg">
                  {selected.profilePic?<img src={selected.profilePic} className="w-full h-full object-cover" alt=""/>:selected.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">{selected.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">{selected.position}</span>
                    <span className="text-slate-400 text-xs">{selected.email}</span>
                  </div>
                </div>
              </div>
              <button onClick={()=>setSelected(null)} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-900"><X size={22}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8">
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs">Points History</h4>
                <div className="bg-orange-50 px-5 py-2 rounded-2xl text-orange-600 font-black text-sm">Balance: {(selected.totalPoints||0).toLocaleString()} pts</div>
              </div>
              <div className="space-y-3">
                {history.map(tx=>(
                  <div key={tx.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div><p className="font-bold text-slate-800 text-sm">{tx.category}</p>{tx.notes&&<p className="text-xs text-slate-400 mt-0.5">"{tx.notes}"</p>}<p className="text-[10px] text-slate-300 mt-1">{new Date(tx.createdAt).toLocaleString()}</p></div>
                    <div className={`text-lg font-black ${tx.points>0?'text-emerald-600':'text-rose-600'}`}>{tx.points>0?'+':''}{tx.points}</div>
                  </div>
                ))}
                {history.length===0&&<p className="text-center py-10 text-slate-300 italic text-sm">No transactions yet.</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Employees;
