import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Star, Send, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { createReview } from '../../lib/api';

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorId: string;
  creatorName: string;
  campaignTitle?: string;
  collabId?: string;
  onSuccess?: () => void;
}

export const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  isOpen,
  onClose,
  creatorName,
  collabId,
  onSuccess
}) => {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!collabId) {
      setErrorMsg('Collaboration reference ID is missing. Please refresh and try again.');
      return;
    }

    if (!rating || rating < 1 || rating > 5) {
      setErrorMsg('Please select a valid rating between 1 and 5 stars.');
      return;
    }

    if (!comment.trim()) {
      setErrorMsg('Please provide a written feedback comment for the review.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await createReview({
        collaborationId: collabId,
        rating,
        review: comment.trim()
      });

      if (res?.success) {
        setSuccessMsg('Review submitted successfully!');
        setTimeout(() => {
          setComment('');
          if (onSuccess) onSuccess();
          onClose();
        }, 1200);
      } else {
        setErrorMsg(res?.message || 'Failed to submit review.');
      }
    } catch (err: any) {
      console.error('Failed to submit review:', err);
      setErrorMsg(err?.data?.message || err?.message || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Rate & Review ${creatorName}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Star Rating Select */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">Overall Rating</label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                disabled={isSubmitting}
                className="p-1.5 focus:outline-none transition-transform hover:scale-110 disabled:opacity-50"
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
            disabled={isSubmitting}
            placeholder="Describe their communication, deliverable quality, adherence to deadlines, and overall campaign impact..."
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-60"
            required
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-[#EC4899] hover:bg-pink-600 text-white font-semibold text-xs rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Submit Review
          </button>
        </div>
      </form>
    </Modal>
  );
};
