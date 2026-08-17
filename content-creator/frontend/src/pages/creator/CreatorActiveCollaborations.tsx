import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Briefcase, Upload, ExternalLink, CheckCircle2, Send, Clock } from 'lucide-react';

export const CreatorActiveCollaborations: React.FC = () => {
  const { collaborations, submitContentDeliverable } = useApp();

  const [selectedCollabId, setSelectedCollabId] = useState<string | null>(null);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');

  const handleSubmitDeliverable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCollabId || !submissionUrl) return;

    submitContentDeliverable(selectedCollabId, submissionUrl, submissionNotes);

    setSelectedCollabId(null);
    setSubmissionUrl('');
    setSubmissionNotes('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Active Brand Collaborations</h1>
        <p className="text-xs text-slate-500">Track deadlines, create content, and submit draft preview links</p>
      </div>

      <div className="space-y-4">
        {collaborations.length === 0 ? (
          <Card className="p-8 text-center text-xs text-slate-400">
            No active collaborations in progress.
          </Card>
        ) : (
          collaborations.map((collab) => (
            <Card key={collab.id} className="p-6 border-slate-200/90 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={collab.brandLogo}
                    alt={collab.brandName}
                    className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{collab.brandName}</h3>
                    <p className="text-xs text-slate-500">Campaign: {collab.campaignTitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Badge variant={collab.stage === 'completed' ? 'emerald' : 'purple'}>
                    Stage: {collab.stage.replace('_', ' ')}
                  </Badge>
                  <span className="text-xl font-black text-slate-900">₹{collab.agreedPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center text-[10px] font-bold">
                <div className="py-1.5 px-1 rounded-xl bg-purple-100 text-purple-700">1. Agreed</div>
                <div className={`py-1.5 px-1 rounded-xl ${['content_in_progress', 'content_submitted', 'completed'].includes(collab.stage) ? 'bg-purple-100 text-purple-700' : 'bg-white text-slate-400'}`}>
                  2. Content Production
                </div>
                <div className={`py-1.5 px-1 rounded-xl ${['content_submitted', 'completed'].includes(collab.stage) ? 'bg-purple-100 text-purple-700' : 'bg-white text-slate-400'}`}>
                  3. Content Submitted
                </div>
                <div className={`py-1.5 px-1 rounded-xl ${collab.stage === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-white text-slate-400'}`}>
                  4. Approved & Paid
                </div>
              </div>

              {collab.submissionUrl && (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-1 text-xs">
                  <span className="font-bold text-emerald-900 block">Submitted Content Preview:</span>
                  <a
                    href={collab.submissionUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-700 hover:underline font-semibold flex items-center gap-1 text-[11px]"
                  >
                    {collab.submissionUrl} <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <p className="text-emerald-800 text-[11px] mt-1">"{collab.submissionNotes}"</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-400">Deadline: {collab.deadline}</span>

                {collab.stage !== 'completed' && (
                  <button
                    onClick={() => setSelectedCollabId(collab.id)}
                    className="px-4 py-2 bg-[#EC4899] hover:bg-pink-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" /> Submit Content Deliverables
                  </button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Submission Modal */}
      <Modal
        isOpen={!!selectedCollabId}
        onClose={() => setSelectedCollabId(null)}
        title="Submit Content Deliverables"
      >
        <form onSubmit={handleSubmitDeliverable} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Live Content / Unlisted Draft URL
            </label>
            <input
              type="url"
              required
              placeholder="https://instagram.com/p/draft_reel or YouTube unlisted link"
              value={submissionUrl}
              onChange={(e) => setSubmissionUrl(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Submission Notes & Hashtags</label>
            <textarea
              rows={3}
              placeholder="Include required discount codes, brand tags used, or notes for brand manager..."
              value={submissionNotes}
              onChange={(e) => setSubmissionNotes(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setSelectedCollabId(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#EC4899] hover:bg-pink-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Submit for Approval
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
