import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockApi } from '../services/api';
import { User, Lock, Camera, Save, Bell, BellOff } from 'lucide-react';

const UPLOAD_URL = 'https://demo.gomoverly.com/api/upload.php';

const Toast = ({ msg, type }: { msg: string; type: 'success' | 'error' }) => (
  <div className={`fixed top-6 right-6 z-[200] px-6 py-3 rounded-2xl font-bold shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-2 ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
    {msg}
  </div>
);

const Settings: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [notifications, setNotifications] = useState(user?.notificationsEnabled !== false);
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);
  const [previewPic, setPreviewPic] = useState(user?.profilePic || '');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Upload image to server - saves to api/uploads/ folder
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('Image too large. Max 2MB allowed.', 'error');
      return;
    }

    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowed.includes(file.type)) {
      showToast('Only JPG, PNG, GIF, WEBP allowed.', 'error');
      return;
    }

    setImgLoading(true);

    // Show local preview immediately
    const reader = new FileReader();
    reader.onloadend = () => setPreviewPic(reader.result as string);
    reader.readAsDataURL(file);

    try {
      const token = localStorage.getItem('mr_token') ?? '';
      const formData = new FormData();
      formData.append('image', file);

            const res = await fetch('https://demo.gomoverly.com/api/upload.php', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      // Update preview with actual server URL
            const serverUrl = `https://demo.gomoverly.com${data.url}`;
      setPreviewPic(serverUrl);
      refreshUser({ ...user!, profilePic: serverUrl });
      showToast('Profile photo updated!');

    } catch (err: any) {
      showToast(err.message || 'Upload failed', 'error');
      setPreviewPic(user?.profilePic || '');
    } finally {
      setImgLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await mockApi.updateProfile(user!.id, { name, notificationsEnabled: notifications });
      refreshUser({ ...user!, name, notificationsEnabled: notifications });
      showToast('Profile updated successfully!');
    } catch (err: any) {
      showToast(err.message || 'Update failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) { showToast('Passwords do not match', 'error'); return; }
    if (newPass.length < 6) { showToast('Password must be at least 6 characters', 'error'); return; }
    setLoading(true);
    try {
      await mockApi.updatePassword(user!.id, newPass);
      setNewPass(''); setConfirmPass('');
      showToast('Password changed successfully!');
    } catch (err: any) {
      showToast(err.message || 'Failed to change password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Account Settings</h2>
        <p className="text-slate-500 font-medium">Manage your profile and security preferences.</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
        <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2 text-lg">
          <User size={20} className="text-blue-600" />Profile
        </h3>
        <form onSubmit={handleSaveProfile} className="space-y-6">

          {/* Photo Upload */}
          <div className="flex items-center gap-6">
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-blue-600 flex items-center justify-center text-white text-3xl font-black shadow-lg border-2 border-slate-100">
                {previewPic
                  ? <img src={previewPic} className="w-full h-full object-cover" alt="Profile" />
                  : user?.name.charAt(0)
                }
              </div>
              <label className={`absolute -bottom-2 -right-2 p-2.5 bg-white rounded-xl shadow-lg border border-slate-200 cursor-pointer transition-all hover:border-blue-400 hover:text-blue-600 ${imgLoading ? 'opacity-50 cursor-not-allowed' : 'text-slate-500'}`}>
                <Camera size={18} />
                <input
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleImageUpload}
                  disabled={imgLoading}
                />
              </label>
              {imgLoading && (
                <div className="absolute inset-0 bg-white/70 rounded-2xl flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <div>
              <p className="font-black text-slate-900 text-sm">Profile Photo</p>
              <p className="text-slate-400 text-xs mt-1">JPG, PNG, GIF or WEBP — max 2MB</p>
              <p className="text-slate-300 text-xs mt-1">Saved to: <code>api/uploads/</code></p>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
            <input
              className="w-full px-5 py-3 bg-slate-50 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 outline-none"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
            <input
              className="w-full px-5 py-3 bg-slate-100 rounded-xl font-bold text-slate-400 cursor-not-allowed"
              value={user?.email}
              disabled
            />
          </div>

          {/* Notifications Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
            <div className="flex items-center gap-3">
              {notifications
                ? <Bell size={20} className="text-blue-600" />
                : <BellOff size={20} className="text-slate-400" />
              }
              <div>
                <p className="font-bold text-slate-900 text-sm">Email Notifications</p>
                <p className="text-slate-400 text-xs">{notifications ? 'Enabled — you will receive email alerts' : 'Disabled'}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setNotifications(!notifications)}
              className={`w-12 h-6 rounded-full transition-all relative flex-shrink-0 ${notifications ? 'bg-blue-600' : 'bg-slate-300'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-all ${notifications ? 'right-0.5' : 'left-0.5'}`} />
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save size={18} />
            <span>{loading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </form>
      </div>

      {/* Password Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
        <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2 text-lg">
          <Lock size={20} className="text-blue-600" />Change Password
        </h3>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">New Password</label>
            <input
              type="password"
              required
              minLength={6}
              className="w-full px-5 py-3 bg-slate-50 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Minimum 6 characters"
              value={newPass}
              onChange={e => setNewPass(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Confirm Password</label>
            <input
              type="password"
              required
              className="w-full px-5 py-3 bg-slate-50 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Repeat new password"
              value={confirmPass}
              onChange={e => setConfirmPass(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Lock size={18} />
            <span>{loading ? 'Updating...' : 'Change Password'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
