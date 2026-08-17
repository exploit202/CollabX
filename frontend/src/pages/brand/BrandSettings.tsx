import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Bell, Lock, Globe, Save, Loader2, AlertCircle } from 'lucide-react';
import { getBrandSettings, updateBrandSettings, changeBrandPassword } from '../../lib/api';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

export const BrandSettings: React.FC = () => {
  const { addToast, setUserPreferences } = useApp();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Notification Preferences State
  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    {
      id: 'newInvitationResponses',
      title: 'New Invitation Responses',
      description: 'Receive notifications when creators accept or decline your collaboration invitations.',
      enabled: true
    },
    {
      id: 'counterOffers',
      title: 'Counter Offers',
      description: 'Receive notifications when creators send a counter offer.',
      enabled: true
    },
    {
      id: 'negotiationMessages',
      title: 'Negotiation Messages',
      description: 'Receive notifications about new negotiation activity.',
      enabled: true
    },
    {
      id: 'collaborationUpdates',
      title: 'Collaboration Updates',
      description: 'Receive important updates about your active collaborations.',
      enabled: true
    },
    {
      id: 'contentSubmissions',
      title: 'Content Submissions',
      description: 'Receive notifications when creators submit content for review.',
      enabled: true
    },
    {
      id: 'escrowUpdates',
      title: 'Escrow Updates',
      description: 'Receive notifications about escrow-related activity.',
      enabled: true
    },
    {
      id: 'dailyCampaignDigest',
      title: 'Daily Campaign Digest',
      description: 'Receive a summary of important campaign activity.',
      enabled: true
    }
  ]);

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Preferences State (Canonical values)
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [currency, setCurrency] = useState('INR');

  // Load Settings from Backend API on mount
  useEffect(() => {
    setLoading(true);
    setErrorMsg(null);

    getBrandSettings()
      .then((res) => {
        if (res?.success && res.data) {
          const { notificationPreferences, preferences } = res.data;

          if (notificationPreferences) {
            setNotifications((prev) =>
              prev.map((item) => ({
                ...item,
                enabled:
                  typeof (notificationPreferences as any)[item.id] === 'boolean'
                    ? (notificationPreferences as any)[item.id]
                    : true
              }))
            );
          }

          if (preferences) {
            const canonicalTz = preferences.timezone || 'Asia/Kolkata';
            const canonicalCurr = preferences.currency || 'INR';
            setTimezone(canonicalTz);
            setCurrency(canonicalCurr);
            setUserPreferences({
              timezone: canonicalTz,
              currency: canonicalCurr
            });
          }
        }
      })
      .catch((err) => {
        console.error('Error loading brand settings:', err);
        setErrorMsg(err?.data?.message || err?.message || 'Failed to load brand settings.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const toggleNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item))
    );
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      addToast('error', 'Please enter your current password.');
      return;
    }
    if (!newPassword) {
      addToast('error', 'Please enter a new password.');
      return;
    }
    if (newPassword.length < 8) {
      addToast('error', 'New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      addToast('error', 'New password and confirm password do not match.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await changeBrandPassword({
        currentPassword,
        newPassword,
        confirmPassword: confirmNewPassword
      });

      if (res?.success) {
        addToast('success', res.message || 'Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        addToast('error', res?.message || 'Failed to change password.');
      }
    } catch (err: any) {
      console.error('Error changing brand password:', err);
      addToast('error', err?.data?.message || err?.message || 'Failed to change password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg(null);

    const notifObj: Record<string, boolean> = {};
    notifications.forEach((n) => {
      notifObj[n.id] = n.enabled;
    });

    try {
      const res = await updateBrandSettings({
        notificationPreferences: notifObj,
        preferences: {
          timezone,
          currency
        }
      });

      if (res?.success) {
        setUserPreferences({ timezone, currency });
        addToast('success', 'Account & security preferences saved successfully.');
      } else {
        setErrorMsg(res?.message || 'Failed to save settings.');
      }
    } catch (err: any) {
      console.error('Error saving brand settings:', err);
      setErrorMsg(err?.data?.message || err?.message || 'Failed to save settings.');
      addToast('error', err?.data?.message || err?.message || 'Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-[#EC4899]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Account & Security Settings</h1>
        <p className="text-xs text-slate-500">Manage your account, security, and notification preferences</p>
      </div>

      {errorMsg && (
        <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-800 rounded-xl font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSavePreferences} className="space-y-6">
        {/* Section 1 — Notification Preferences */}
        <Card className="p-6 border-slate-200/90 shadow-xs space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#EC4899]" />
              Notification Preferences
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Choose which updates you want to receive from CollabX.</p>
          </div>

          <div className="divide-y divide-slate-100 border-t border-b border-slate-100">
            {notifications.map((notif) => (
              <div key={notif.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-800">{notif.title}</h4>
                  <p className="text-[11px] text-slate-500">{notif.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleNotification(notif.id)}
                  disabled={isSaving}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-60 ${
                    notif.enabled ? 'bg-[#EC4899]' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                      notif.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Section 2 — Security */}
        <Card className="p-6 border-slate-200/90 shadow-xs space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-600" />
              Security
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Manage your account password.</p>
          </div>

          <div className="space-y-4 pt-1">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider text-[11px]">Change Password</h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-60"
                  disabled={isChangingPassword}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-60"
                  disabled={isChangingPassword}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-60"
                  disabled={isChangingPassword}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleChangePassword}
                disabled={isChangingPassword}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isChangingPassword ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                Change Password
              </button>
            </div>
          </div>
        </Card>

        {/* Section 3 — Preferences */}
        <Card className="p-6 border-slate-200/90 shadow-xs space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-600" />
              Preferences
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Set your basic CollabX preferences.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-60"
                disabled={isSaving}
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-60"
                disabled={isSaving}
              >
                <option value="INR">Indian Rupee (₹)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="EUR">Euro (€)</option>
                <option value="GBP">British Pound (£)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Save Preferences Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-[#EC4899] hover:bg-pink-600 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
};
