import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { MessageSquare, Loader2, Flag } from 'lucide-react';
import { getBrandInvitations, createNegotiation, reportCreator } from '../../lib/api';
import { ReportUserModal } from '../../components/modals/ReportUserModal';

export const BrandInvitations: React.FC = () => {
  const { formatCurrency, formatDate, addToast } = useApp();
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [reportTarget, setReportTarget] = useState<{ id: string; name: string } | null>(null);
  const navigate = useNavigate();

  const fetchInvitations = async () => {
    try {
      const res = await getBrandInvitations();
      if (res.success) {
        setInvitations(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching brand invitations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleOpenDealRoom = async (invId: string) => {
    setOpeningId(invId);
    try {
      await createNegotiation({ invitationId: invId });
      navigate(`/brand/negotiations?invitationId=${invId}`);
    } catch (err) {
      console.error('Error opening deal room:', err);
      // Fallback navigation
      navigate(`/brand/negotiations?invitationId=${invId}`);
    } finally {
      setOpeningId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Collaboration Invitations & Requests</h1>
          <p className="text-xs text-slate-500">Track pending, accepted, or negotiated creator collaboration invitations and interest requests</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
        </div>
      ) : (
        <div className="space-y-4">
          {invitations.length === 0 ? (
            <Card className="p-8 text-center text-xs text-slate-400">
              No collaboration invitations or creator interest requests found.
            </Card>
          ) : (
            invitations.map((inv) => {
              const invId = inv._id || inv.id;
              const isOpening = openingId === invId;
              const creatorAvatar = inv.creatorAvatar || inv.creatorId?.profileImage?.url || inv.creatorId?.profileImage;

              return (
                <Card key={invId} className="p-5 border-slate-200/90 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={typeof creatorAvatar === 'object' ? creatorAvatar?.url : creatorAvatar}
                        name={inv.creatorName}
                        size="w-10 h-10"
                        textSize="text-xs"
                      />
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{inv.creatorName || 'Creator'}</h3>
                        <p className="text-xs text-slate-500">Campaign: {inv.campaignTitle}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          inv.status === 'accepted'
                            ? 'emerald'
                            : inv.status === 'negotiating'
                            ? 'purple'
                            : inv.status === 'rejected' || inv.status === 'cancelled'
                            ? 'rose'
                            : 'amber'
                        }
                      >
                        {inv.status}
                      </Badge>
                      <span className="text-sm font-black text-slate-900">{formatCurrency(inv.proposedPrice || inv.price || 0)}</span>
                    </div>
                  </div>

                  {inv.message && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      "{inv.message}"
                    </p>
                  )}

                  {inv.deliverables && (
                    <div className="space-y-1 text-xs">
                      <span className="font-bold text-slate-700">Requested Deliverables:</span>
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(inv.deliverables) ? inv.deliverables : [inv.deliverables]).map((del: string, i: number) => (
                          <span key={i} className="px-2.5 py-1 bg-pink-50 text-[#EC4899] rounded-lg font-semibold text-[11px]">
                            {del}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-400 text-[10px]">
                      Sent {formatDate(inv.createdAt || inv.sentDate)}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setReportTarget({
                          id: String(inv.creatorId?._id || inv.creatorId),
                          name: inv.creatorName || 'Creator'
                        })}
                        disabled={!inv.creatorId?._id && !inv.creatorId}
                        className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 rounded-xl text-xs font-bold flex items-center gap-1 transition-all disabled:opacity-50"
                        title="Report Creator"
                      >
                        <Flag className="w-3 h-3" /> Report
                      </button>

                      {(inv.status === 'pending' || inv.status === 'negotiating') && (
                        <button
                          onClick={() => handleOpenDealRoom(invId)}
                          disabled={isOpening}
                          className="px-4 py-1.5 bg-[#EC4899] hover:bg-pink-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
                        >
                          {isOpening ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <MessageSquare className="w-3.5 h-3.5" />
                          )}
                          Open Deal Room
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {reportTarget && (
        <ReportUserModal
          isOpen={!!reportTarget}
          onClose={() => setReportTarget(null)}
          targetName={reportTarget.name}
          targetRole="creator"
          onSubmit={async (data) => {
            try {
              await reportCreator({ reportedAgainst: reportTarget.id, ...data });
              addToast('success', 'Report Submitted', `Your report against ${reportTarget.name} has been submitted for admin review.`);
            } catch (err: any) {
              addToast('error', 'Report Failed', err?.message || 'Failed to submit report.');
            }
          }}
        />
      )}
    </div>
  );
};
