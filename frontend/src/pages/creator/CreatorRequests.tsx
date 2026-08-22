import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { Check, MessageSquare, Loader2 } from 'lucide-react';
import { getCreatorRequests, respondToInvitation } from '../../lib/api';

export const CreatorRequests: React.FC = () => {
  const { formatCurrency } = useApp();
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchRequests = async () => {
    try {
      const res = await getCreatorRequests();
      if (res.success) {
        setInvitations(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching creator requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleRespond = async (id: string, status: 'accepted' | 'rejected' | 'negotiating') => {
    try {
      await respondToInvitation(id, status);
      if (status === 'negotiating') {
        navigate(`/creator/negotiations?invitationId=${id}`);
      } else {
        fetchRequests();
      }
    } catch (err) {
      console.error('Failed to respond to invitation:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Collaboration Requests</h1>
        <p className="text-xs text-slate-500">Incoming campaign invitations sent directly from brands</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
        </div>
      ) : (
        <div className="space-y-4">
          {invitations.length === 0 ? (
            <Card className="p-8 text-center text-xs text-slate-400">
              No brand collaboration invitations currently pending.
            </Card>
          ) : (
            invitations.map((inv) => {
              const invId = inv._id || inv.id;
              const brandLogo = inv.brandLogo || inv.brandId?.profileImage?.url || inv.brandId?.profileImage || inv.brandId?.companyLogo;

              return (
                <Card key={invId} className="p-6 border-slate-200/90 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={typeof brandLogo === 'object' ? brandLogo?.url : brandLogo}
                        name={inv.brandName}
                        size="w-12 h-12"
                        textSize="text-base"
                        className="rounded-2xl shrink-0"
                      />
                      <div>
                        <h3 className="text-base font-bold text-slate-900">{inv.brandName || 'Brand'}</h3>
                        <p className="text-xs text-slate-500">Campaign: {inv.campaignTitle}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Badge variant={inv.status === 'accepted' ? 'emerald' : inv.status === 'pending' ? 'amber' : 'purple'}>
                        {inv.status}
                      </Badge>
                      <span className="text-xl font-black text-slate-900">{formatCurrency(inv.proposedPrice || 0)}</span>
                    </div>
                  </div>

                  {inv.message && (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                      <span className="font-bold text-slate-700 block">Brand Pitch Message:</span>
                      <p className="text-slate-600 italic">"{inv.message}"</p>
                    </div>
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

                  <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100">
                    {inv.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleRespond(invId, 'accepted')}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                        >
                          <Check className="w-4 h-4" /> Accept Collaboration
                        </button>

                        <button
                          onClick={() => handleRespond(invId, 'negotiating')}
                          className="px-5 py-2.5 bg-[#EC4899] hover:bg-pink-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                        >
                          <MessageSquare className="w-4 h-4" /> Open Deal Room & Counter Offer
                        </button>

                        <button
                          onClick={() => handleRespond(invId, 'rejected')}
                          className="px-4 py-2.5 text-slate-500 hover:text-slate-800 text-xs font-semibold rounded-xl"
                        >
                          Decline
                        </button>
                      </>
                    )}

                    {inv.status === 'negotiating' && (
                      <button
                        onClick={() => navigate(`/creator/negotiations?invitationId=${invId}`)}
                        className="px-5 py-2.5 bg-[#EC4899] hover:bg-pink-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-4 h-4" /> Open Deal Room
                      </button>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
