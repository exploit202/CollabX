import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Save, Upload } from 'lucide-react';
import { getProfile, updateProfile } from '../../lib/api';

export const CreatorProfilePage: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const { addToast } = useApp();

  const [name, setName] = useState(user?.name || '');
  const [category, setCategory] = useState('Tech & Gadgets');
  const [country, setCountry] = useState('India');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getProfile();
        const backendUser = response.data.user;
        const profile = response.data.profile || {};
        setName(backendUser?.fullName || '');
        setCountry(profile?.location?.country || 'India');
        setBio(profile?.bio || '');
        setCategory(profile?.niche?.[0] || 'Tech & Gadgets');
        updateUserProfile({
          name: backendUser?.fullName || '',
          email: backendUser?.email || user?.email || '',
          avatar: backendUser?.profileImage || '',
        } as any);
      } catch (err: any) {
        addToast('error', err?.message || 'Unable to load profile');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await updateProfile({
        fullName: name,
        bio,
        niche: category ? [category] : [],
        location: { country },
      });
      const backendUser = response.data.user;
      updateUserProfile({
        name: backendUser?.fullName || name,
        avatar: backendUser?.profileImage || '',
        bio,
        category,
      } as any);
      addToast('success', 'Creator Profile Saved!');
    } catch (err: any) {
      addToast('error', err?.message || 'Unable to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Creator Profile Setup</h1>
        <p className="text-xs text-slate-500">Edit your public bio, category tags, and profile information</p>
      </div>

      <Card className="p-6 md:p-8 border-slate-200/90 shadow-md">
        {loading ? (
          <p className="text-xs text-slate-400">Loading profile...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center gap-5 pb-5 border-b border-slate-100">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-2 border-slate-200"
              />
              <div>
                <button
                  type="button"
                  onClick={() => addToast('info', 'Profile image upload is not connected yet')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" /> Upload Profile Picture
                </button>
                <span className="text-[10px] text-slate-400 block mt-1">Backend currently stores an image URL</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name / Display Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 font-medium" required />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Niche Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 font-medium">
                  <option value="Tech & Gadgets">Tech & Gadgets</option>
                  <option value="Fashion & Lifestyle">Fashion & Lifestyle</option>
                  <option value="Fitness & Wellness">Fitness & Wellness</option>
                  <option value="Gaming">Gaming</option>
                  <option value="Travel">Travel</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Country</label>
              <input value={country} onChange={(e) => setCountry(e.target.value)} className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 font-medium" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Bio / Pitch Overview</label>
                <span className={`text-[10px] font-semibold ${bio.length > 220 ? 'text-rose-500' : 'text-slate-400'}`}>{bio.length}/500</span>
              </div>
              <textarea rows={4} maxLength={500} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Describe your niche and what brands you work with." className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none" />
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button type="submit" disabled={saving} className="px-6 py-2.5 bg-[#EC4899] hover:bg-pink-600 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2">
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Profile Details'}
              </button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};
