import React, { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Modal } from '../common/Modal';

interface ReportUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetName: string;
  targetRole: 'brand' | 'creator';
  onSubmit: (data: { reason: string; description: string }) => Promise<void>;
}

const reasons = [
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
  const [reason, setReason] = useState(reasons[0]);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    if (submitting) return;
    setReason(reasons[0]);
    setDescription('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({ reason, description: description.trim() });
      setReason(reasons[0]);
      setDescription('');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Report ${targetRole === 'brand' ? 'Brand' : 'Creator'}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-[11px] text-amber-800 leading-relaxed">
            Report <b>{targetName}</b> only when there is a genuine issue. Your report will be reviewed by the CollabX admin team.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Reason</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
            disabled={submitting}
          >
            {reasons.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Details (optional)</label>
          <textarea
            rows={4}
            maxLength={3000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Briefly explain what happened..."
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
            disabled={submitting}
          />
          <div className="text-right text-[10px] text-slate-400 mt-1">{description.length}/3000</div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button type="button" onClick={handleClose} disabled={submitting} className="px-4 py-2 text-xs font-semibold text-slate-600 rounded-xl hover:bg-slate-50">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 disabled:opacity-60">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
            Submit Report
          </button>
        </div>
      </form>
    </Modal>
  );
};
