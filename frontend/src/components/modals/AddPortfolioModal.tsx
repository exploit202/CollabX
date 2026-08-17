import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Plus, Loader2 } from 'lucide-react';
import { addPortfolioItem } from '../../lib/api';

interface AddPortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddPortfolioModal: React.FC<AddPortfolioModalProps> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [brandName, setBrandName] = useState('');
  const [category, setCategory] = useState('Tech & Gadgets');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [views, setViews] = useState('120K');
  const [likes, setLikes] = useState('9.4K');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await addPortfolioItem({
        title,
        brandName,
        category,
        mediaType,
        views,
        likes,
        description
      });
      setTitle('');
      setDescription('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add portfolio item');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Portfolio Showcase">
      {errorMsg && (
        <div className="mb-3 p-2.5 text-xs bg-rose-50 border border-rose-200 text-rose-600 rounded-xl font-medium">
          {errorMsg}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Showcase Title</label>
          <input
            type="text"
            placeholder="e.g. Mechanical Keyboard Review"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500 font-medium"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Brand Name (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Logitech"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800"
              disabled={isSubmitting}
            >
              <option value="Tech & Gadgets">Tech & Gadgets</option>
              <option value="Fashion & Lifestyle">Fashion & Lifestyle</option>
              <option value="Fitness & Wellness">Fitness & Wellness</option>
              <option value="Gaming">Gaming</option>
              <option value="Travel">Travel</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Views Metric</label>
            <input
              type="text"
              placeholder="e.g. 250K"
              value={views}
              onChange={(e) => setViews(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Likes Metric</label>
            <input
              type="text"
              placeholder="e.g. 15K"
              value={likes}
              onChange={(e) => setLikes(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Summary</label>
          <textarea
            rows={3}
            placeholder="Brief overview of the collaboration..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800"
            disabled={isSubmitting}
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-slate-600 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-[#EC4899] hover:bg-pink-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Save Showcase Item
          </button>
        </div>
      </form>
    </Modal>
  );
};
