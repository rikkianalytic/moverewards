import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockApi } from '../../services/api';
import { UserNote } from '../../types';
import { Plus, Search, Trash2, Globe, Lock, Lightbulb, X, Check, PenLine, AlertCircle, RefreshCw } from 'lucide-react';

const COLORS = [
  'bg-blue-50 border-blue-200',
  'bg-orange-50 border-orange-200',
  'bg-emerald-50 border-emerald-200',
  'bg-purple-50 border-purple-200',
  'bg-yellow-50 border-yellow-200'
];

const NoteHub: React.FC = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [filter, setFilter] = useState('');
  const [tab, setTab] = useState<'all' | 'my' | 'ideas'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [form, setForm] = useState({ title: '', content: '', type: 'note' as 'note' | 'idea', isPublic: false });

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const data = await mockApi.getNotes(user.id);
      setNotes(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message || 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await mockApi.createNote({
        ...form,
        userId: user.id,
        userName: user.name,
        color: COLORS[Math.floor(Math.random() * COLORS.length)]
      });
      setModalOpen(false);
      setForm({ title: '', content: '', type: 'note', isPublic: false });
      showToast('Note saved successfully!');
      load();
    } catch (e: any) {
      showToast(e.message || 'Failed to save note', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user || !window.confirm('Delete this note permanently?')) return;
    try {
      await mockApi.deleteNote(id, user.id);
      showToast('Note deleted.');
      load();
    } catch (e: any) {
      showToast(e.message || 'Failed to delete', 'error');
    }
  };

  const filtered = notes.filter(n => {
    const s = filter.toLowerCase();
    const matchSearch = n.title.toLowerCase().includes(s) || n.content.toLowerCase().includes(s);
    const matchTab =
      tab === 'all' ? true :
      tab === 'my' ? n.userId === user?.id :
      n.type === 'idea' && n.isPublic;
    return matchSearch && matchTab;
  });

  return (
    <div className="space-y-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[200] px-6 py-3 rounded-2xl font-bold shadow-2xl animate-in slide-in-from-top-2 ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Brainstorm Hub</h2>
          <p className="text-slate-500 font-medium">Private notes and shared company ideas.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-blue-100 transition-all active:scale-95"
        >
          <Plus size={20} /><span>New Entry</span>
        </button>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
          {(['all', 'my', 'ideas'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tab === t ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-700'}`}
            >
              {t === 'all' ? 'All Board' : t === 'my' ? 'My Notes' : 'Idea Wall'}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search notes and ideas..."
            className="w-full pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="p-8 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-4">
          <AlertCircle className="text-rose-500 flex-shrink-0" size={24} />
          <div className="flex-1">
            <p className="font-bold text-rose-700">{error}</p>
            <p className="text-rose-500 text-sm mt-1">Check that your XAMPP server is running.</p>
          </div>
          <button onClick={load} className="flex items-center gap-2 bg-rose-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-rose-700">
            <RefreshCw size={16} />Retry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(note => (
            <div
              key={note.id}
              className={`flex flex-col p-6 rounded-[2.5rem] border-2 group hover:shadow-xl transition-all duration-300 ${note.color || 'bg-white border-slate-100'}`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${note.type === 'idea' ? 'bg-orange-500 text-white' : 'bg-blue-600 text-white'}`}>
                  {note.type}
                </span>
                <div className="flex items-center gap-2">
                  {note.isPublic ? <Globe size={14} className="text-slate-400" /> : <Lock size={14} className="text-slate-300" />}
                  {note.userId === user?.id && (
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-3 leading-tight">{note.title}</h3>
              <p className="text-slate-600 text-sm font-medium line-clamp-4 flex-1 whitespace-pre-wrap">{note.content}</p>
              <div className="mt-5 pt-4 border-t border-slate-900/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-900/10 flex items-center justify-center text-[10px] font-bold">
                    {note.userName.charAt(0)}
                  </div>
                  <span className="text-[10px] font-bold text-slate-500">{note.userName}</span>
                </div>
                <span className="text-[9px] font-bold text-slate-400">{new Date(note.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full py-24 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <Lightbulb className="text-slate-300" size={32} />
              </div>
              <p className="text-slate-400 font-bold italic text-lg">
                {tab === 'my' ? 'You have no notes yet.' : tab === 'ideas' ? 'No public ideas shared yet.' : 'No entries found.'}
              </p>
              <button onClick={() => setModalOpen(true)} className="mt-4 text-blue-600 font-black text-sm hover:underline">
                + Create your first entry
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                <PenLine className="text-blue-600" />New Entry
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-8 space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Title</label>
                <input
                  required
                  placeholder="Brief headline..."
                  className="w-full px-5 py-3 bg-slate-50 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Content</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Write your thoughts..."
                  className="w-full px-5 py-3 bg-slate-50 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  value={form.content}
                  onChange={e => setForm({ ...form, content: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Type</label>
                  <div className="flex bg-slate-50 p-1 rounded-xl">
                    <button type="button" onClick={() => setForm({ ...form, type: 'note' })} className={`flex-1 py-2.5 rounded-lg text-xs font-black transition-all ${form.type === 'note' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400'}`}>Note</button>
                    <button type="button" onClick={() => setForm({ ...form, type: 'idea' })} className={`flex-1 py-2.5 rounded-lg text-xs font-black transition-all ${form.type === 'idea' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400'}`}>Idea</button>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Visibility</label>
                  <div className="flex bg-slate-50 p-1 rounded-xl">
                    <button type="button" onClick={() => setForm({ ...form, isPublic: false })} className={`flex-1 py-2.5 rounded-lg text-xs font-black transition-all ${!form.isPublic ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400'}`}>Private</button>
                    <button type="button" onClick={() => setForm({ ...form, isPublic: true })} className={`flex-1 py-2.5 rounded-lg text-xs font-black transition-all ${form.isPublic ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400'}`}>Public</button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-6 py-3 text-slate-400 font-black hover:text-slate-900">Cancel</button>
                <button type="submit" disabled={saving} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-blue-700 shadow-xl shadow-blue-100 flex items-center gap-2 active:scale-95 disabled:opacity-50">
                  <Check size={18} /><span>{saving ? 'Saving...' : 'Save Entry'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteHub;
