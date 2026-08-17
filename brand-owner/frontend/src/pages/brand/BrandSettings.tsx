import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Settings, Lock, Bell, Users, Shield } from 'lucide-react';

import brandService from '../../services/brand.service';

export const BrandSettings: React.FC = () => {
  const { addToast } = useApp();
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [offerNotifs, setOfferNotifs] = useState(true);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    brandService
      .getNotificationSettings()
      .then((res) => {
        const prefs = res.data?.preferences || res.data || res;
        if (prefs) {
          if (typeof prefs.emailAlerts === 'boolean') setEmailNotifs(prefs.emailAlerts);
          if (typeof prefs.counterOfferAlerts === 'boolean') setOfferNotifs(prefs.counterOfferAlerts);
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await brandService.updateNotificationSettings({
        emailAlerts: emailNotifs,
        counterOfferAlerts: offerNotifs,
      });

      if (newPassword) {
        if (newPassword !== confirmPassword) {
          addToast('error', 'Password Mismatch', 'New password and confirm password must match.');
          setIsSubmitting(false);
          return;
        }
        await brandService.updatePassword({ newPassword, confirmPassword });
        setNewPassword('');
        setConfirmPassword('');
      }

      addToast('success', 'Account Settings Saved');
    } catch (err: any) {
      addToast('error', 'Failed to save settings', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Account & Security Settings</h1>
        <p className="text-xs text-slate-500">Manage login credentials, team access, and notification alerts</p>
      </div>

      <Card className="p-6 md:p-8 border-slate-200/90 shadow-md space-y-6">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Notification Preferences */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-pink-500" /> Notification Alert Preferences
            </h3>
            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer">
                <span className="font-semibold text-slate-700">Email Alerts on Creator Counter Offers</span>
                <input
                  type="checkbox"
                  checked={offerNotifs}
                  onChange={(e) => setOfferNotifs(e.target.checked)}
                  className="w-4 h-4 accent-[#EC4899]"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer">
                <span className="font-semibold text-slate-700">Daily Campaign Activity Digest</span>
                <input
                  type="checkbox"
                  checked={emailNotifs}
                  onChange={(e) => setEmailNotifs(e.target.checked)}
                  className="w-4 h-4 accent-[#EC4899]"
                />
              </label>
            </div>
          </div>

          {/* Change Password */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-500" /> Update Password
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#EC4899] hover:bg-pink-600 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-md"
            >
              {isSubmitting ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};
