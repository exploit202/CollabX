import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Star, Send } from 'lucide-react';

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorId: string;
  creatorName: string;
  campaignTitle?: string;
}

export const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  isOpen,
  onClose,
  creatorId,
  creatorName,
  campaignTitle,
}) => {
  const { addCreatorReview } = useApp();
  const { user } = useAuth();

  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment) return;

    addCreatorReview(creatorId, {
      reviewerName: (user as any)?.companyName || user?.name || 'Verified Brand',
      reviewerAvatar: user?.avatar || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200',
      reviewerRole: 'brand',
      rating,
      comment,
      campaignTitle,
    });

    setComment('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Rate & Review ${creatorName}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star Rating Select */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">Overall Rating</label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1.5 focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  className={`w-7 h-7 ${
                    star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-sm font-bold text-slate-700">{rating}.0 / 5.0</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Feedback Comment</label>
          <textarea
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Describe their communication, b-roll quality, adherence to deadlines, and overall campaign impact..."
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
            required
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
            <Send className="w-3.5 h-3.5" />
            Submit Review
          </button>
        </div>
      </form>
    </Modal>
  );
};
