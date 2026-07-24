import React, { useState } from 'react';
import { User, Lock, Building, CheckCircle2 } from 'lucide-react';
import Card from '../components/common/Card';
import { useAuth } from '../context/AuthContext';
import API from '../api/axiosInstance';

const Profile = () => {
  const { user, updateUserProfile } = useAuth();

  // Profile Form state
  const [name, setName] = useState(user?.name || '');
  const [companyName, setCompanyName] = useState(user?.companyName || 'OTESS DATA');
  const [logoUrl, setLogoUrl] = useState(user?.logoUrl || '');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passMsg, setPassMsg] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg('');

    try {
      const res = await API.put('/auth/profile', { name, companyName, logoUrl });
      if (res.data.success) {
        updateUserProfile(res.data.user);
        setProfileMsg('Profile updated successfully.');
        setTimeout(() => setProfileMsg(''), 3000);
      }
    } catch (error) {
      setProfileMsg(error.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassLoading(true);
    setPassMsg('');

    try {
      const res = await API.put('/auth/change-password', { currentPassword, newPassword });
      if (res.data.success) {
        setPassMsg('Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setTimeout(() => setPassMsg(''), 3000);
      }
    } catch (error) {
      setPassMsg(error.response?.data?.message || 'Failed to change password.');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Admin Profile & Security</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your account profile information and update your security password.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company & Profile Information */}
        <Card title="Account & Organization Settings">
          {profileMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
              {profileMsg}
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-brand-500" /> Admin Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-brand-500" /> Company Name
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Company Logo URL (Optional)</label>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={profileLoading}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
              >
                {profileLoading ? 'Saving...' : 'Update Profile Details'}
              </button>
            </div>
          </form>
        </Card>

        {/* Change Password Security */}
        <Card title="Security & Change Password">
          {passMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
              {passMsg}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-slate-500" /> Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-brand-500" /> New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={passLoading}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
              >
                {passLoading ? 'Updating...' : 'Change Password'}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
