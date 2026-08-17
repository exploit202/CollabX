import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { User, Save, Upload, MapPin, Globe, Instagram, Youtube, Twitter } from 'lucide-react';

export const CreatorProfilePage: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const { addToast } = useApp();

  const [name, setName] = useState(user?.name || 'Ananya Sharma');
  const [category, setCategory] = useState('Tech & Gadgets');
  const [country, setCountry] = useState('India');
  const [bio, setBio] = useState(
    'Tech reviewer & desk setup transformation enthusiast. Creating high-retention video content for top electronics and smart tech brands in India.'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({ name, bio, category, country } as any);
    addToast('success', 'Creator Profile Saved!');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Creator Profile Setup</h1>
        <p className="text-xs text-slate-500">Edit your public bio, category tags, and social account handles</p>
      </div>

      <Card className="p-6 md:p-8 border-slate-200/90 shadow-md">
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
                onClick={() => addToast('info', 'Avatar upload triggered')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" /> Upload Profile Picture
              </button>
              <span className="text-[10px] text-slate-400 block mt-1">PNG, JPG up to 5MB</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name / Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Niche Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 font-medium"
              >
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
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 font-medium"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">Bio / Pitch Overview</label>
              <span className={`text-[10px] font-semibold ${bio.length > 220 ? 'text-rose-500' : 'text-slate-400'}`}>
                {bio.length}/220
              </span>
            </div>
            <div className="rounded-xl border border-pink-100 bg-gradient-to-br from-pink-50/60 to-purple-50/40 p-3 mb-2">
              <p className="text-[10px] text-slate-600 leading-relaxed">
                <span className="font-bold text-[#EC4899]">Tip:</span> Lead with your niche and standout stat (followers,
                engagement, or a brand you've worked with), then say what kind of collabs you're looking for. Brands skim —
                make the first line count.
              </p>
            </div>
            <textarea
              rows={4}
              maxLength={220}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. Tech reviewer with 250K+ engaged followers across Instagram & YouTube. Known for high-retention unboxing content and honest reviews. Open to long-term brand partnerships in consumer electronics."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
            />
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#EC4899] hover:bg-pink-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Profile Details
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};
