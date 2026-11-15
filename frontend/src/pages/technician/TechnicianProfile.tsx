import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { Card, CardHeader } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { User, Lock, CheckCircle2, Shield, Building, Mail, Phone, Calendar } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const TechnicianProfile: React.FC = () => {
  const { user, updateCurrentUser } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [designation, setDesignation] = useState(user?.designation || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess(false);
    try {
      const res = await authService.updateProfile({ fullName, phone, designation });
      if (res.success && res.data) {
        updateCurrentUser(res.data);
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 3000);
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setSavingPassword(true);
    try {
      const res = await authService.changePassword({ currentPassword, newPassword });
      if (res.success) {
        setPasswordSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordSuccess(false), 3000);
      }
    } catch (err: any) {
      setPasswordError(err.response?.data?.error?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          User Account & Security Profile
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage your personal identity information, phone numbers, and security credentials
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Summary Card */}
        <Card className="flex flex-col items-center text-center p-6 space-y-3">
          <div className="w-20 h-20 rounded-full bg-brand-600/20 text-brand-600 font-extrabold text-2xl flex items-center justify-center border-2 border-brand-500/40">
            {user?.fullName.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">{user?.fullName}</h3>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-300">
              {user?.role.replace('_', ' ')}
            </span>
          </div>

          <div className="w-full pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-left">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Shield className="w-3.5 h-3.5 text-brand-600" />
              <span>ID: {user?.employeeId}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Building className="w-3.5 h-3.5 text-brand-600" />
              <span>{user?.department?.name || 'Enterprise Team'}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-brand-600" />
              <span>Joined: {formatDate(user?.joiningDate, 'MMM yyyy')}</span>
            </div>
          </div>
        </Card>

        {/* Edit Profile Form */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader title="Personal Information" />
            {profileSuccess && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Profile details successfully saved.
              </div>
            )}
            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" size="sm" loading={savingProfile}>
                  Save Profile
                </Button>
              </div>
            </form>
          </Card>

          {/* Change Password Card */}
          <Card>
            <CardHeader title="Security Credentials" subtitle="Update your account login password" />
            {passwordSuccess && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Password successfully updated.
              </div>
            )}
            {passwordError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-800 dark:bg-red-950/60 dark:text-red-300 text-xs flex items-center gap-2">
                <span>{passwordError}</span>
              </div>
            )}
            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    New Password (Min 8 chars)
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" size="sm" variant="secondary" loading={savingPassword}>
                  Update Password
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

