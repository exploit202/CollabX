import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Plus, Loader2, Youtube, Instagram, Video, DollarSign, Eye, TrendingUp, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { addPortfolioItem } from '../../lib/api';

interface AddPortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AddPortfolioModal: React.FC<AddPortfolioModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [brandName, setBrandName] = useState('');
  const [platform, setPlatform] = useState<'youtube' | 'instagram' | 'shorts-reels'>('youtube');
  const [description, setDescription] = useState('');
  const [campaignValue, setCampaignValue] = useState<number | ''>(45000);
  const [views, setViews] = useState('1.2M');
  const [engagementRate, setEngagementRate] = useState('8.4%');
  const [contentUrl, setContentUrl] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please enter a showcase title.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await addPortfolioItem({
        title: title.trim(),
        brandName: brandName.trim() || 'Brand Partner',
        platform,
        description: description.trim(),
        campaignValue: Number(campaignValue) || 0,
        views: views.trim() || '0',
        engagementRate: engagementRate.trim() || '0%',
        contentUrl: contentUrl.trim(),
        thumbnail: thumbnail.trim() || 'https://images.unsplash.com/photo-1579208575657-c595a05383b7?w=600&auto=format&fit=crop&q=80',
        mediaType: platform === 'youtube' || platform === 'shorts-reels' ? 'video' : 'image'
      });

      // Reset form
      setTitle('');
      setBrandName('');
      setDescription('');
      setContentUrl('');
      setThumbnail('');
      setCampaignValue(45000);
      setViews('1.2M');
      setEngagementRate('8.4%');

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.data?.message || err.message || 'Failed to save showcase item');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Showcase Item">
      {errorMsg && (
        <div className="mb-3 p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-semibold">
          {errorMsg}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title (Required) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Showcase Title <span className="text-pink-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. boAt Nirvana ANC Launch Campaign"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500 font-medium"
            required
            disabled={isSubmitting}
          />
        </div>

        {/* Brand Name & Platform */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Brand Name</label>
            <input
              type="text"
              placeholder="e.g. boAt Lifestyle"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as any)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500"
              disabled={isSubmitting}
            >
              <option value="youtube">YouTube</option>
              <option value="instagram">Instagram</option>
              <option value="shorts-reels">Shorts / Reels</option>
            </select>
          </div>
        </div>

        {/* Campaign Value (₹), Views & Engagement */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Campaign Value (₹)</label>
            <input
              type="number"
              min="0"
              placeholder="45000"
              value={campaignValue}
              onChange={(e) => setCampaignValue(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-pink-500"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Views</label>
            <input
              type="text"
              placeholder="e.g. 1.2M or 450K"
              value={views}
              onChange={(e) => setViews(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Engagement Rate (%)</label>
            <input
              type="text"
              placeholder="e.g. 8.4%"
              value={engagementRate}
              onChange={(e) => setEngagementRate(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* URLs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Content URL</label>
            <input
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              value={contentUrl}
              onChange={(e) => setContentUrl(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Thumbnail URL</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
          <textarea
            rows={3}
            placeholder="Brief overview of the brand integration, deliverables, and campaign impact..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500"
            disabled={isSubmitting}
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-[#EC4899] hover:bg-pink-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Save Showcase
          </button>
        </div>
      </form>
    </Modal>
  );
};
