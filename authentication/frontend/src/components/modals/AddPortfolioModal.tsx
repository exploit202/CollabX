import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Plus } from 'lucide-react';

interface AddPortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddPortfolioModal: React.FC<AddPortfolioModalProps> = ({ isOpen, onClose }) => {
  const { addPortfolioItem } = useApp();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [brandName, setBrandName] = useState('');
  const [category, setCategory] = useState('Tech & Gadgets');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [thumbnail, setThumbnail] = useState('https://images.unsplash.com/photo-1512756290469-ec264b7fbf87?auto=format&fit=crop&q=80&w=600');
  const [views, setViews] = useState('120K');
  const [likes, setLikes] = useState('9.4K');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    addPortfolioItem(user?.id || 'creator-1', {
      title,
      brandName,
      category,
      mediaType,
      thumbnail: thumbnail || 'https://images.unsplash.com/photo-1512756290469-ec264b7fbf87?auto=format&fit=crop&q=80&w=600',
      views,
      likes,
      comments: '450',
      description,
    });

    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Portfolio Showcase">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Showcase Title</label>
          <input
            type="text"
            placeholder="e.g. Mechanical Keyboard Sound Test & Review"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500 font-medium"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Brand Name (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Logitech, Sony"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
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
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Likes Metric</label>
            <input
              type="text"
              placeholder="e.g. 18.2K"
              value={likes}
              onChange={(e) => setLikes(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Cover Image URL</label>
          <input
            type="text"
            value={thumbnail}
            onChange={(e) => setThumbnail(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Key Results & Summary</label>
          <textarea
            rows={3}
            placeholder="Highlight campaign ROI, engagement rates, and key b-roll deliverables..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#EC4899] hover:bg-pink-600 text-white font-semibold text-xs rounded-xl transition-all shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add to Portfolio
          </button>
        </div>
      </form>
    </Modal>
  );
};
