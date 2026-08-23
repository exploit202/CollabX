import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { Modal } from '../../components/common/Modal';
import { WriteReviewModal } from '../../components/modals/WriteReviewModal';
import { Upload, ExternalLink, Send, Loader2, AlertCircle, RotateCcw, Star, Flag, ShieldCheck } from 'lucide-react';
import { CollaborationActivity } from '../../components/CollaborationActivity';
import { getCreatorCollaborations, submitDeliverables, reportBrand, getPayments } from '../../lib/api';
import { ReportUserModal } from '../../components/modals/ReportUserModal';

export const CreatorActiveCollaborations: React.FC = () => {
  const { formatCurrency } = useApp();
  const [collaborations, setCollaborations] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCollabId, setSelectedCollabId] = useState<string | null>(null);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ id: string; name: string } | null>(null);

  const [selectedCollabForReview, setSelectedCollabForReview] = useState<{
    creatorId: string;
    creatorName: string;
    campaignTitle: string;
    collabId: string;
  } | null>(null);

  const fetchCollaborations = async () => {
    setError(null);
    try {
      const [collabRes, payRes] = await Promise.all([
        getCreatorCollaborations(),
        getPayments().catch(() => ({ success: false, data: [] }))
      ]);

      if (collabRes.success) {
        setCollaborations(Array.isArray(collabRes.data) ? collabRes.data : []);
      } else {
        setCollaborations([]);
      }

      if (payRes.success) {
        setPayments(Array.isArray(payRes.data) ? payRes.data : []);
      }
    } catch (err: any) {
      console.error('Error fetching creator collaborations:', err);
      setError(err?.message || 'Failed to load active collaborations.');
      setCollaborations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollaborations();
  }, []);

  const handleSubmitDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCollabId || !submissionUrl) return;

    setIsSubmitting(true);
    try {
      await submitDeliverables(selectedCollabId, {
        contentUrl: submissionUrl,
        submissionNotes
      });
      setSelectedCollabId(null);
      setSubmissionUrl('');
      setSubmissionNotes('');
      fetchCollaborations();
    } catch (err) {
      console.error('Failed to submit deliverables:', err);
    } finally {
      setIsSubmitting(false);
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
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Active Brand Collaborations</h1>
        <p className="text-xs text-slate-500">Track deadlines, create content, respond to revisions, and submit draft preview links</p>
      </div>

      {error && (
        <Card className="p-4 bg-rose-50 border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchCollaborations()}
            className="px-3 py-1 bg-rose-600 text-white rounded-lg text-[11px] font-bold hover:bg-rose-700"
          >
            Retry
          </button>
        </Card>
      )}

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
              const brandName = collab.brandName || collab.brandId?.fullName || collab.brandId?.name || 'Brand';
              const campaignTitle = collab.campaignTitle || (typeof collab.campaignId === 'object' ? collab.campaignId?.title : '') || 'Campaign Collaboration';
              const budgetAmount = collab.agreedBudget || collab.agreedPrice || 0;
              const deadlineStr = formatDeadline(collab.deadline || (typeof collab.campaignId === 'object' ? collab.campaignId?.deadline : null));
              const brandLogo = collab.brandLogo || collab.brandId?.profileImage?.url || collab.brandId?.profileImage || collab.brandId?.companyLogo;

              const payment = payments.find((p) => String(p.collaborationId?._id || p.collaborationId) === String(collabId));

              return (
                <Card key={collabId} className="p-6 border-slate-200/90 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={typeof brandLogo === 'object' ? brandLogo?.url : brandLogo}
                        name={brandName}
                        size="w-12 h-12"
                        textSize="text-base"
                        className="rounded-2xl shrink-0"
                      />
                      <div>
                        <h3 className="text-base font-bold text-slate-900">{brandName}</h3>
                        <p className="text-xs text-slate-500">
                          Campaign: <span className="font-bold text-slate-800">{campaignTitle}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Badge variant={status === 'completed' ? 'emerald' : status === 'brand_approved' ? 'purple' : status === 'revision_requested' ? 'rose' : 'pink'}>
                        Stage: {String(status).replace('_', ' ')}
                      </Badge>
                      <span className="text-xl font-black text-slate-900">{formatCurrency(budgetAmount || 0)}</span>
                    </div>
                  </div>

                  {/* Escrow Status & Protection Vault */}
                  <div className="p-4 bg-gradient-to-br from-slate-50 to-pink-50/40 border border-pink-100/80 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between border-b border-pink-100/60 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          payment?.status === 'released'
                            ? 'bg-emerald-100 text-emerald-700'
                            : payment?.status === 'funded' || payment?.status === 'escrowed'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800">Escrow Payment Protection</span>
                            <Badge variant={
                              payment?.status === 'released'
                                ? 'emerald'
                                : payment?.status === 'funded' || payment?.status === 'escrowed'
                                ? 'purple'
                                : 'amber'
                            }>
                              {payment?.status === 'released'
                                ? 'PAYOUT RELEASED'
                                : payment?.status === 'funded' || payment?.status === 'escrowed'
                                ? 'FUNDS SECURED IN ESCROW'
                                : 'AWAITING BRAND DEPOSIT'}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {payment?.status === 'released'
                              ? `Payout of ${formatCurrency(payment?.amount || budgetAmount || 0)} has been released to your account.`
                              : payment?.status === 'funded' || payment?.status === 'escrowed'
                              ? `Brand has funded ${formatCurrency(payment?.amount || budgetAmount || 0)} in escrow. Your payment is 100% guaranteed upon deliverable approval.`
                              : 'Brand has not deposited escrow yet.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Escrow Workflow Timeline */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-center text-[10px] font-bold">
                      <div className="py-2 px-1.5 rounded-xl bg-purple-100/80 text-purple-800 border border-purple-200/60">
                        1. Agreement Finalized
                      </div>
                      <div className={`py-2 px-1.5 rounded-xl border ${
                        payment && payment.status !== 'pending'
                          ? 'bg-purple-100/80 text-purple-800 border-purple-200/60'
                          : 'bg-white/80 text-slate-400 border-slate-200'
                      }`}>
                        2. Escrow Funded
                      </div>
                      <div className={`py-2 px-1.5 rounded-xl border ${
                        ['content_submitted', 'revision_requested', 'brand_approved', 'completed'].includes(status)
                          ? 'bg-purple-100/80 text-purple-800 border-purple-200/60'
                          : 'bg-white/80 text-slate-400 border-slate-200'
                      }`}>
                        3. Content Submitted
                      </div>
                      <div className={`py-2 px-1.5 rounded-xl border ${
                        ['brand_approved', 'completed'].includes(status)
                          ? 'bg-purple-100/80 text-purple-800 border-purple-200/60'
                          : 'bg-white/80 text-slate-400 border-slate-200'
                      }`}>
                        4. Brand Approved
                      </div>
                      <div className={`py-2 px-1.5 rounded-xl border ${
                        payment?.status === 'released' || status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-white/80 text-slate-400 border-slate-200'
                      }`}>
                        5. Payout Received
                      </div>
                    </div>
                  </div>

                  {/* Revision Feedback Box */}
                  {status === 'revision_requested' && (
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 text-rose-900 font-bold">
                        <AlertCircle className="w-4 h-4 text-rose-600" /> Brand Action Required: Revision Requested
                      </div>
                      <p className="text-rose-800 text-[11px]">"{collab.revisionNotes || collab.brandFeedback || 'Please review requested changes'}"</p>
                    </div>
                  )}

                  {(collab.contentUrl || collab.submissionUrl) && (
                    <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-1 text-xs">
                      <span className="font-bold text-emerald-900 block">Current Submitted Content Preview:</span>
                      <a
                        href={collab.contentUrl || collab.submissionUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-700 hover:underline font-semibold flex items-center gap-1 text-[11px]"
                      >
                        {collab.contentUrl || collab.submissionUrl} <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      {collab.submissionNotes && <p className="text-emerald-800 text-[11px] mt-1">"{collab.submissionNotes}"</p>}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-500 font-medium">
                      Deadline: <span className="font-bold text-slate-800">{deadlineStr}</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setReportTarget({
                          id: String(collab.brandId?._id || collab.brandId),
                          name: brandName
                        })}
                        disabled={!collab.brandId?._id && !collab.brandId}
                        className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100 font-bold text-xs rounded-xl flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Flag className="w-3.5 h-3.5" /> Report Brand
                      </button>
                      {!['brand_approved', 'completed'].includes(status) && (
                        <button
                          onClick={() => setSelectedCollabId(collabId)}
                          className={`px-4 py-2 font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 ${
                            status === 'revision_requested'
                              ? 'bg-rose-600 hover:bg-rose-700 text-white'
                              : 'bg-[#EC4899] hover:bg-pink-600 text-white'
                          }`}
                        >
                          {status === 'revision_requested' ? (
                            <>
                              <RotateCcw className="w-3.5 h-3.5" /> Resubmit Revised Deliverables
                            </>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5" /> Submit Content Deliverables
                            </>
                          )}
                        </button>
                      )}

                      {status === 'completed' && (
                        <button
                          onClick={() =>
                            setSelectedCollabForReview({
                              creatorId: collab.brandId?._id || collab.brandId,
                              creatorName: brandName,
                              campaignTitle: campaignTitle,
                              collabId: collabId
                            })
                          }
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                        >
                          <Star className="w-3.5 h-3.5" /> Rate & Review Brand
                        </button>
                      )}
                    </div>

                    <CollaborationActivity collaborationId={collabId} role="creator" />
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setSelectedCollabId(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 rounded-xl"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-[#EC4899] hover:bg-pink-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Submit for Approval
            </button>
          </div>
        </form>
      </Modal>

      {/* Review Modal */}
      {selectedCollabForReview && (
        <WriteReviewModal
          isOpen={!!selectedCollabForReview}
          onClose={() => setSelectedCollabForReview(null)}
          creatorId={selectedCollabForReview.creatorId}
          creatorName={selectedCollabForReview.creatorName}
          campaignTitle={selectedCollabForReview.campaignTitle}
          collabId={selectedCollabForReview.collabId}
          onSuccess={() => {
            fetchCollaborations();
          }}
        />
      )}
      <ReportUserModal
        isOpen={!!reportTarget}
        onClose={() => setReportTarget(null)}
        targetName={reportTarget?.name || 'Brand'}
        targetRole="brand"
        onSubmit={async (data) => {
          if (!reportTarget) return;
          await reportBrand({ reportedAgainst: reportTarget.id, ...data });
        }}
      />
    </div>
  );
};
