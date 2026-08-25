import React, { useState, useEffect } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Modal } from '../common/Modal';

interface ReportUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetName: string;
  targetRole: 'brand' | 'creator';
  onSubmit: (data: { reason: string; description: string }) => Promise<void>;
}

const CREATOR_REPORT_REASONS = [
  'Fraudulent or misleading information',
  'Fake audience or engagement',
  'Unprofessional behavior',
  'Missed deliverables',
  'Inappropriate content',
  'Spam or abuse',
  'Other'
];

const BRAND_REPORT_REASONS = [
  'Fraudulent or misleading information',
  'Payment or financial issue',
  'Harassment or inappropriate behaviour',
  'Campaign or collaboration issue',
  'Spam or suspicious activity',
  'Other'
];

export const ReportUserModal: React.FC<ReportUserModalProps> = ({
  isOpen,
  onClose,
  targetName,
  targetRole,
  onSubmit
}) => {
  const currentReasons = targetRole === 'creator' ? CREATOR_REPORT_REASONS : BRAND_REPORT_REASONS;
  const [reason, setReason] = useState(currentReasons[0]);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setReason(currentReasons[0]);
  }, [targetRole]);

  const handleClose = () => {
    if (submitting) return;
    setReason(currentReasons[0]);
    setDescription('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({ reason, description: description.trim() });
      setReason(currentReasons[0]);
      setDescription('');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const modalTitle = targetRole === 'creator' ? 'Report Creator' : 'Report Brand';

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={modalTitle}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 flex items-start gap-2.5 shadow-2xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-900 leading-relaxed font-medium">
            Report <b>{targetName}</b> only when there is a genuine issue. Your report will be reviewed by the CollabX admin team.
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Reason for Report</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500"
            disabled={submitting}
          >
            {currentReasons.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Details & Context (optional)
          </label>
          <textarea
            rows={4}
            maxLength={3000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please provide specific details or evidence regarding this issue..."
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none font-medium placeholder-slate-400"
            disabled={submitting}
          />
          <div className="text-right text-[10px] text-slate-400 mt-1 font-semibold">
            {description.length}/3000
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
            Submit Report
          </button>
        </div>
      </form>
    </Modal>
  );
};
