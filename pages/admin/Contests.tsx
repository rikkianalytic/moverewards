
import React, { useState, useEffect } from 'react';
import { mockApi } from '../../services/api';
import { Contest, EmployeeProfile } from '../../types';
import { Award, Plus, Calendar, Target, Clock, Users, Mail, CheckCircle2, Edit2, X, Trash2, Power } from 'lucide-react';

const ContestsManager: React.FC = () => {
  const [contests, setContests] = useState<Contest[]>([]);
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingContest, setEditingContest] = useState<Contest | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    criteriaType: 'points' as 'points' | 'category_count',
    categoryFilter: '',
    prizeType: 'points' as 'points' | 'reward',
    prizeValue: '',
    assignedEmployeeIds: [] as string[]
  });

  const fetchData = async () => {
    const data = await mockApi.getContests();
    const emps = await mockApi.getEmployees();
    const cats = await mockApi.getCategories();
    setContests(data);
    setEmployees(emps.filter(e => e.status === 'active'));
    setCategories(cats);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditClick = (contest: Contest) => {
    setEditingContest(contest);
    setFormData({
      name: contest.name,
      description: contest.description,
      startDate: contest.startDate.split('T')[0],
      endDate: contest.endDate.split('T')[0],
      criteriaType: contest.criteriaType,
      categoryFilter: contest.categoryFilter || '',
      prizeType: contest.prizeType,
      prizeValue: contest.prizeValue.toString(),
      assignedEmployeeIds: contest.assignedEmployeeIds
    });
    setIsAdding(true);
  };

  const toggleEmployee = (id: string) => {
    setFormData(prev => {
      const ids = prev.assignedEmployeeIds.includes(id)
        ? prev.assignedEmployeeIds.filter(item => item !== id)
        : [...prev.assignedEmployeeIds, id];
      return { ...prev, assignedEmployeeIds: ids };
    });
  };

  const selectAll = () => {
    setFormData(prev => ({
      ...prev,
      assignedEmployeeIds: employees.map(e => e.id)
    }));
  };

  const deselectAll = () => {
    setFormData(prev => ({ ...prev, assignedEmployeeIds: [] }));
  };

  const handleToggleStatus = async (contest: Contest) => {
    setLoading(true);
    const newStatus = contest.status === 'active' ? 'completed' : 'active';
    await mockApi.updateContest(contest.id, { status: newStatus });
    fetchData();
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this contest permanently?')) {
      setLoading(true);
      await mockApi.deleteContest(id);
      fetchData();
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.assignedEmployeeIds.length === 0) {
      alert('Please assign at least one employee to this contest.');
      return;
    }

    setLoading(true);
    try {
      if (editingContest) {
        await mockApi.updateContest(editingContest.id, {
          ...formData,
          prizeValue: parseInt(formData.prizeValue)
        });
        setMessage(`Contest "${formData.name}" updated successfully.`);
      } else {
        await mockApi.createContest({
          ...formData,
          prizeValue: parseInt(formData.prizeValue)
        });
        setMessage(`Contest launched! Emails sent to ${formData.assignedEmployeeIds.length} employees.`);
      }

      setIsAdding(false);
      setEditingContest(null);
      fetchData();
      setTimeout(() => setMessage(''), 5000);
      
      setFormData({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        criteriaType: 'points',
        categoryFilter: '',
        prizeType: 'points',
        prizeValue: '',
        assignedEmployeeIds: []
      });
    } catch (err) {
      alert('Failed to save contest.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Team Competitions</h2>
          <p className="text-slate-500 text-sm font-medium">Motivate your staff with targeted goals and prizes.</p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => {
              setEditingContest(null);
              setFormData({
                name: '',
                description: '',
                startDate: '',
                endDate: '',
                criteriaType: 'points',
                categoryFilter: '',
                prizeType: 'points',
                prizeValue: '',
                assignedEmployeeIds: []
              });
              setIsAdding(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center space-x-2 shadow-lg shadow-blue-100 transition-all active:scale-95"
          >
            <Plus size={18} />
            <span>New Contest</span>
          </button>
        )}
      </div>

      {message && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl flex items-center space-x-3 shadow-sm animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={18} />
          <p className="text-sm font-bold">{message}</p>
        </div>
      )}

      {isAdding ? (
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-4">
            <h3 className="text-lg font-black text-slate-900 flex items-center">
              {editingContest ? <Edit2 className="mr-2 text-blue-500" size={20} /> : <Plus className="mr-2 text-blue-500" size={20} />}
              {editingContest ? 'Edit Contest Configuration' : 'Create New Competition'}
            </h3>
            <button onClick={() => { setIsAdding(false); setEditingContest(null); }} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-5">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-black">1</div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Competition Details</h4>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Contest Title</label>
                    <input required placeholder="e.g. June Safety Sprint" className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Mission Statement</label>
                    <textarea required placeholder="Brief description of the goals..." className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Start Date</label>
                      <input type="date" required className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">End Date</label>
                      <input type="date" required className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Scoring Criteria</label>
                      <select className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={formData.criteriaType} onChange={e => setFormData({...formData, criteriaType: e.target.value as any})}>
                        <option value="points">Aggregated Points</option>
                        <option value="category_count">Single Category Focus</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Prize Points</label>
                      <div className="relative">
                        <Target className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input type="number" required placeholder="500" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={formData.prizeValue} onChange={e => setFormData({...formData, prizeValue: e.target.value})} />
                      </div>
                    </div>
                  </div>
                  {formData.criteriaType === 'category_count' && (
                    <div className="animate-in fade-in slide-in-from-left-2">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Category Target</label>
                      <select className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={formData.categoryFilter} onChange={e => setFormData({...formData, categoryFilter: e.target.value})}>
                        <option value="">Select Reason Category...</option>
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-black">2</div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enrolled Participants ({formData.assignedEmployeeIds.length})</h4>
                  </div>
                  <div className="flex space-x-3 text-[10px] font-black uppercase tracking-tight">
                    <button type="button" onClick={selectAll} className="text-blue-600 hover:text-blue-700">All</button>
                    <span className="text-slate-200">|</span>
                    <button type="button" onClick={deselectAll} className="text-slate-400 hover:text-slate-600">None</button>
                  </div>
                </div>
                
                <div className="bg-slate-50 rounded-xl border border-slate-100 max-h-[400px] overflow-y-auto no-scrollbar p-2 space-y-1.5 shadow-inner">
                  {employees.map(emp => {
                    const isSelected = formData.assignedEmployeeIds.includes(emp.id);
                    return (
                      <div 
                        key={emp.id}
                        onClick={() => toggleEmployee(emp.id)}
                        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                          isSelected 
                            ? 'bg-white shadow-md border-l-4 border-blue-600' 
                            : 'bg-transparent text-slate-600 border border-transparent hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                             isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
                          }`}>
                            {emp.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-bold">{emp.name}</p>
                            <p className="text-[10px] font-medium text-slate-400">{emp.position}</p>
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 size={16} className="text-blue-600" />}
                      </div>
                    );
                  })}
                  {employees.length === 0 && (
                    <div className="text-center py-10">
                      <Users className="mx-auto text-slate-200 mb-2" size={32} />
                      <p className="text-slate-400 italic text-xs">No active employees found.</p>
                    </div>
                  )}
                </div>
                
                <div className="bg-blue-50 p-4 rounded-xl flex items-start space-x-3 border border-blue-100">
                  <Mail className="text-blue-600 shrink-0 mt-0.5" size={16} />
                  <p className="text-[10px] text-blue-800 font-bold leading-relaxed">
                    Participants will receive a push notification and email summary of the contest rules and grand prize once saved.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-6 border-t border-slate-50">
               {editingContest && (
                 <button 
                   type="button" 
                   onClick={() => handleDelete(editingContest.id)}
                   className="flex items-center space-x-2 px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-bold text-xs transition-all"
                 >
                   <Trash2 size={16} />
                   <span>Delete Permanently</span>
                 </button>
               )}
               <div className="flex-1" />
               <div className="flex items-center space-x-4">
                <button type="button" onClick={() => { setIsAdding(false); setEditingContest(null); }} className="px-5 py-2.5 text-slate-400 hover:text-slate-600 font-bold text-sm">Discard</button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-slate-900 text-white px-8 py-2.5 rounded-xl font-black text-sm hover:bg-black shadow-lg shadow-slate-200 transition-all active:scale-95 disabled:opacity-50 flex items-center space-x-2"
                >
                  {loading ? <Clock className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                  <span>{editingContest ? 'Save Changes' : 'Launch Competition'}</span>
                </button>
               </div>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {contests.map(contest => (
            <div key={contest.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden group hover:border-blue-200 transition-all">
              <div className={`p-6 text-white relative h-48 flex flex-col justify-end ${contest.status === 'active' ? 'bg-slate-900' : 'bg-slate-400'}`}>
                <Award className="absolute right-6 top-6 opacity-10" size={120} />
                
                <div className="flex items-center justify-between absolute top-6 left-6 right-6">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${contest.status === 'active' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                      {contest.status}
                    </span>
                    <span className="text-white/40 text-[10px] font-bold">#{contest.id.slice(-4)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={() => handleToggleStatus(contest)}
                      className="p-2 hover:bg-white/10 rounded-xl transition-all text-white/60 hover:text-white"
                      title={contest.status === 'active' ? 'Deactivate' : 'Reactivate'}
                    >
                      <Power size={18} />
                    </button>
                    <button 
                      onClick={() => handleEditClick(contest)}
                      className="p-2 hover:bg-white/10 rounded-xl transition-all text-white/60 hover:text-white"
                      title="Edit Configuration"
                    >
                      <Edit2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="relative z-10">
                  <h3 className="text-2xl font-black mb-1 leading-tight">{contest.name}</h3>
                  <p className="text-white/60 text-xs font-medium line-clamp-1">{contest.description}</p>
                </div>
              </div>

              <div className="p-5">
                <div className="grid grid-cols-3 gap-4 border-b border-slate-50 pb-5 mb-5">
                  <div className="text-center border-r border-slate-50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Participants</p>
                    <p className="text-sm font-black text-slate-800 flex items-center justify-center">
                      <Users size={12} className="mr-1 text-blue-500" />
                      {contest.assignedEmployeeIds.length}
                    </p>
                  </div>
                  <div className="text-center border-r border-slate-50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ends In</p>
                    <p className="text-sm font-black text-slate-800 flex items-center justify-center">
                      <Clock size={12} className="mr-1 text-orange-500" />
                      {Math.max(0, Math.ceil((new Date(contest.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))}d
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Prize</p>
                    <p className="text-sm font-black text-emerald-600 flex items-center justify-center">
                      <Target size={12} className="mr-1" />
                      {contest.prizeValue}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center -space-x-2">
                    {contest.assignedEmployeeIds.slice(0, 5).map((id, i) => {
                       const emp = employees.find(e => e.id === id);
                       return (
                         <div key={id} className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500 shadow-sm" title={emp?.name}>
                           {emp?.name?.charAt(0) || '?'}
                         </div>
                       );
                    })}
                    {contest.assignedEmployeeIds.length > 5 && (
                      <div className="w-7 h-7 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                        +{contest.assignedEmployeeIds.length - 5}
                      </div>
                    )}
                  </div>
                  <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 flex items-center group">
                    View Rankings
                    <CheckCircle2 size={12} className="ml-1 opacity-0 group-hover:opacity-100 transition-all" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {contests.length === 0 && !isAdding && (
            <div className="col-span-full py-24 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200 text-center">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
                <Award className="text-slate-300" size={32} />
              </div>
              <h4 className="text-lg font-black text-slate-800">No active competitions</h4>
              <p className="text-slate-400 text-sm max-w-xs mx-auto mt-2">Start a new contest to boost team performance and reward your top movers.</p>
              <button 
                onClick={() => setIsAdding(true)}
                className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-xl shadow-blue-100 active:scale-95"
              >
                Launch First Contest
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContestsManager;
