import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Save, Loader2, Eye, EyeOff } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';


export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', bio: user?.bio || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/auth/update', { name: form.name, bio: form.bio });
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.error || 'Update failed'); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirm) {
      return toast.error('Passwords do not match');
    }
    setSaving(true);
    try {
      await api.put('/auth/update', { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success('Password changed successfully!');
      setPasswords({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to change password'); }
    finally { setSaving(false); }
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-white">Profile</h1>
            <p className="text-slate-400 mt-1">Manage your account settings</p>
          </div>

          {/* Avatar section */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card flex items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-2xl font-bold shadow-glow-primary flex-shrink-0">
              {initials}
            </div>
            <div>
              <p className="text-white font-semibold text-xl">{user?.name}</p>
              <p className="text-slate-400 text-sm">{user?.email}</p>
              <p className="text-slate-600 text-xs mt-1">Member since {new Date(user?.createdAt).toLocaleDateString()}</p>
            </div>
          </motion.div>

          {/* Profile Form */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card">
            <h2 className="text-white font-semibold text-lg mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-primary-400" /> Personal Information
            </h2>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <input type="text" value={form.name} onChange={e => update('name', e.target.value)}
                  className="input-field" required minLength={2} />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" value={user?.email} className="input-field opacity-60" disabled />
              </div>
              <div>
                <label className="label">Bio <span className="text-slate-600">(optional)</span></label>
                <textarea value={form.bio} onChange={e => update('bio', e.target.value)} rows={3}
                  className="input-field resize-none" placeholder="Tell us about yourself..." maxLength={200} />
              </div>

              <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-60">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </form>
          </motion.div>

          {/* Change Password */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
            <h2 className="text-white font-semibold text-lg mb-6 flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-400" /> Change Password
            </h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              {[
                { key: 'currentPassword', label: 'Current Password' },
                { key: 'newPassword', label: 'New Password' },
                { key: 'confirm', label: 'Confirm New Password' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="label">{label}</label>
                  <div className="relative">
                    <input type={showPw ? 'text' : 'password'} value={passwords[key]}
                      onChange={e => setPasswords(p => ({ ...p, [key]: e.target.value }))}
                      className="input-field pr-12" required minLength={key !== 'currentPassword' ? 6 : 1} />
                    <button type="button" onClick={() => setShowPw(s => !s)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
              <button type="submit" disabled={saving} className="btn-secondary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-60">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                Change Password
              </button>
            </form>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
