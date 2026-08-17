import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { WriteReviewModal } from '../../components/modals/WriteReviewModal';
import { CollaborationActivity } from '../../components/CollaborationActivity';
import {
  ExternalLink,
  CheckCircle2,
  Star,
  FileText,
  RotateCcw,
  CheckCheck,
  Loader2,
  DollarSign,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  getBrandCollaborations,
  requestRevision,
  approveCollaboration,
  completeCollaboration,
  initiateEscrowPayment,
  releaseEscrowPayment,
  getBrandPayments
} from '../../lib/api';

export const BrandActiveCollaborations: React.FC = () => {
  const { formatCurrency, formatDate } = useApp();
  const [collaborations, setCollaborations] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [revisionCollabId, setRevisionCollabId] = useState<string | null>(null);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedCollabForReview, setSelectedCollabForReview] = useState<{
    creatorId: string;
    creatorName: string;
    campaignTitle: string;
    collabId: string;
  } | null>(null);

  const fetchCollaborationsAndPayments = async () => {
    try {
      const [collabRes, payRes] = await Promise.all([
        getBrandCollaborations(),
        getBrandPayments().catch(() => ({ success: false, data: [] }))
      ]);

      if (collabRes.success) {
        setCollaborations(collabRes.data || []);
      }
      if (payRes.success) {
        setPayments(payRes.data || []);
      }
    } catch (err) {
      console.error('Error fetching brand data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollaborationsAndPayments();
  }, []);

  const handleRequestRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionCollabId || !revisionNotes) return;

    setIsSubmitting(true);
    try {
      await requestRevision(revisionCollabId, { revisionNotes, brandFeedback: revisionNotes });
      setRevisionCollabId(null);
      setRevisionNotes('');
      fetchCollaborationsAndPayments();
    } catch (err) {
      console.error('Failed to request revision:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveCollaboration(id);
      fetchCollaborationsAndPayments();
    } catch (err) {
      console.error('Failed to approve collaboration:', err);
    }
  };

  const handleComplete = async (collab: any) => {
    try {
      await completeCollaboration(collab._id || collab.id);
      fetchCollaborationsAndPayments();
      setSelectedCollabForReview({
        creatorId: collab.creatorId?._id || collab.creatorId,
        creatorName: collab.creatorName,
        campaignTitle: collab.campaignTitle || collab.campaignId?.title || 'Campaign',
        collabId: collab._id || collab.id
      });
    } catch (err) {
      console.error('Failed to complete collaboration:', err);
    }
  };

  const handleInitiateEscrow = async (collabId: string) => {
    try {
      await initiateEscrowPayment({ collaborationId: collabId });
      fetchCollaborationsAndPayments();
    } catch (err) {
      console.error('Failed to deposit escrow payment:', err);
    }
  };

  const handleReleaseEscrow = async (paymentId: string) => {
    try {
      await releaseEscrowPayment(paymentId);
      fetchCollaborationsAndPayments();
    } catch (err) {
      console.error('Failed to release escrow payment:', err);
    }
  };

  const formatDeadline = (rawDate: any) => {
    if (!rawDate) return 'No Deadline Specified';
    const dateObj = new Date(rawDate);
    if (isNaN(dateObj.getTime())) return 'No Deadline Specified';
    return dateObj.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Active Collaborations & Escrow</h1>
        <p className="text-xs text-slate-500">
          Monitor content production, review submitted drafts, request revisions, deposit/release escrow, and mark completed
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
        </div>
      ) : (
        <div className="space-y-4">
          {collaborations.length === 0 ? (
            <Card className="p-8 text-center text-xs text-slate-400">
              No active collaborations currently in progress.
            </Card>
          ) : (
            collaborations.map((collab) => {
              const collabId = collab._id || collab.id;
              const status = collab.status || collab.stage || 'active';
              const payment = payments.find((p) => String(p.collaborationId?._id || p.collaborationId) === String(collabId));
              const campaignTitle = collab.campaignTitle || (typeof collab.campaignId === 'object' ? collab.campaignId?.title : '') || 'Campaign Collaboration';
              const deadlineStr = formatDate(collab.deadline || (typeof collab.campaignId === 'object' ? collab.campaignId?.deadline : null)) || 'No Deadline Specified';

              return (
                <Card key={collabId} className="p-6 border-slate-200/90 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-lg">
                        {collab.creatorName?.[0] || 'C'}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">{collab.creatorName}</h3>
                        <p className="text-xs text-slate-500">
                          Campaign: <span className="font-bold text-slate-800">{campaignTitle}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Badge variant={status === 'completed' ? 'emerald' : status === 'brand_approved' ? 'purple' : status === 'revision_requested' ? 'rose' : 'pink'}>
                        Stage: {String(status).replace('_', ' ')}
                      </Badge>
                      <span className="text-lg font-black text-slate-900">{formatCurrency(collab.agreedBudget || collab.agreedPrice || 0)}</span>
                    </div>
                  </div>

                  {/* Escrow Status Banner */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className={`w-4 h-4 ${payment?.status === 'released' ? 'text-emerald-600' : payment?.status === 'escrowed' ? 'text-purple-600' : 'text-slate-400'}`} />
                      <span className="font-semibold text-slate-700">
                        Escrow Status: <b className="uppercase">{payment ? payment.status : 'NOT_DEPOSITED'}</b>
                        {payment?.status === 'escrowed' && ' (Funds Secured)'}
                        {payment?.status === 'released' && ' (Payout Released)'}
                      </span>
                    </div>

                    {!payment && (
                      <button
                        onClick={() => handleInitiateEscrow(collabId)}
                        className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
                      >
                        <DollarSign className="w-3.5 h-3.5" /> Deposit Escrow
                      </button>
                    )}

                    {payment && payment.status === 'escrowed' && status === 'completed' && (
                      <button
                        onClick={() => handleReleaseEscrow(payment._id || payment.id)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
                      >
                        <CheckCheck className="w-3.5 h-3.5" /> Release Escrow Payout
                      </button>
                    )}
                  </div>

                  {/* Stepper Progress Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 py-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center text-[10px] font-bold">
                    <div className="py-1.5 px-1 rounded-xl bg-pink-100 text-pink-700">1. Agreed</div>
                    <div className={`py-1.5 px-1 rounded-xl ${['content_in_progress', 'content_submitted', 'revision_requested', 'brand_approved', 'completed'].includes(status) ? 'bg-pink-100 text-pink-700' : 'bg-white text-slate-400'}`}>
                      2. Production
                    </div>
                    <div className={`py-1.5 px-1 rounded-xl ${['content_submitted', 'brand_approved', 'completed'].includes(status) ? 'bg-pink-100 text-pink-700' : status === 'revision_requested' ? 'bg-rose-100 text-rose-700' : 'bg-white text-slate-400'}`}>
                      3. Submitted
                    </div>
                    <div className={`py-1.5 px-1 rounded-xl ${['brand_approved', 'completed'].includes(status) ? 'bg-purple-100 text-purple-700' : 'bg-white text-slate-400'}`}>
                      4. Approved
                    </div>
                    <div className={`py-1.5 px-1 rounded-xl ${status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-white text-slate-400'}`}>
                      5. Completed
                    </div>
                  </div>

                  {/* Submitted Content Preview */}
                  {(collab.submissionUrl || collab.contentUrl) && (
                    <div className="p-4 bg-purple-50/60 border border-purple-100 rounded-2xl space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-purple-900 flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-purple-600" /> Submitted Content Draft Link
                        </span>
                        <a
                          href={collab.submissionUrl || collab.contentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-purple-600 font-bold hover:underline flex items-center gap-1 text-[11px]"
                        >
                          Preview Content <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                      {collab.submissionNotes && <p className="text-purple-800 text-[11px]">"{collab.submissionNotes}"</p>}
                    </div>
                  )}

                  {/* Revision Feedback Display */}
                  {status === 'revision_requested' && (collab.revisionNotes || collab.brandFeedback) && (
                    <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl text-xs space-y-1">
                      <span className="font-bold text-rose-900 block">Revision Requested Feedback:</span>
                      <p className="text-rose-800 text-[11px]">"{collab.revisionNotes || collab.brandFeedback}"</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-500 font-medium">
                      Deadline: <span className="font-bold text-slate-800">{deadlineStr}</span>
                    </span>

                    <div className="flex items-center gap-2">
                      {status === 'content_submitted' && (
                        <>
                          <button
                            onClick={() => setRevisionCollabId(collabId)}
                            className="px-3.5 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-xs rounded-xl flex items-center gap-1.5"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Request Revision
                          </button>
                          <button
                            onClick={() => handleApprove(collabId)}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve Content
                          </button>
                        </>
                      )}

                      {status === 'brand_approved' && (
                        <button
                          onClick={() => handleComplete(collab)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                        >
                          <CheckCheck className="w-3.5 h-3.5" /> Mark Collaboration Completed
                        </button>
                      )}

                      {status === 'completed' && (
                        <button
                          onClick={() =>
                            setSelectedCollabForReview({
                              creatorId: collab.creatorId?._id || collab.creatorId,
                              creatorName: collab.creatorName,
                              campaignTitle: campaignTitle,
                              collabId: collabId
                            })
                          }
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                        >
                          <Star className="w-3.5 h-3.5" /> Rate & Review Creator
                        </button>
                      )}
                    </div>

                    <CollaborationActivity collaborationId={collabId} role="brand" />
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Revision Modal */}
      <Modal
        isOpen={!!revisionCollabId}
        onClose={() => setRevisionCollabId(null)}
        title="Request Content Revision"
      >
        <form onSubmit={handleRequestRevision} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Revision Notes & Specific Changes Required
            </label>
            <textarea
              rows={4}
              required
              placeholder="Describe required changes (e.g., audio adjustment, brand placement framing)..."
              value={revisionNotes}
              onChange={(e) => setRevisionNotes(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setRevisionCollabId(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 rounded-xl"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
              Send Revision Request
            </button>
          </div>
        </form>
      </Modal>

      {selectedCollabForReview && (
        <WriteReviewModal
          isOpen={!!selectedCollabForReview}
          onClose={() => setSelectedCollabForReview(null)}
          creatorId={selectedCollabForReview.creatorId}
          creatorName={selectedCollabForReview.creatorName}
          campaignTitle={selectedCollabForReview.campaignTitle}
          collabId={selectedCollabForReview.collabId}
          onSuccess={() => {
            fetchCollaborationsAndPayments();
          }}
        />
      )}
    </div>
  );
};
