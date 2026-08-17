import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Mail, Check, X, MessageSquare, IndianRupee } from 'lucide-react';

export const CreatorRequests: React.FC = () => {
  const { invitations, respondToInvitation } = useApp();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Collaboration Requests</h1>
        <p className="text-xs text-slate-500">Incoming campaign invitations sent directly from brands</p>
      </div>

      <div className="space-y-4">
        {invitations.length === 0 ? (
          <Card className="p-8 text-center text-xs text-slate-400">
            No brand collaboration invitations currently pending.
          </Card>
        ) : (
          invitations.map((inv) => (
            <Card key={inv.id} className="p-6 border-slate-200/90 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={inv.brandLogo}
                    alt={inv.brandName}
                    className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{inv.brandName}</h3>
                    <p className="text-xs text-slate-500">Campaign: {inv.campaignTitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Badge variant={inv.status === 'accepted' ? 'emerald' : inv.status === 'pending' ? 'amber' : 'purple'}>
                    {inv.status}
                  </Badge>
                  <span className="text-xl font-black text-slate-900">₹{inv.proposedPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                <span className="font-bold text-slate-700 block">Brand Pitch Message:</span>
                <p className="text-slate-600 italic">"{inv.message}"</p>
              </div>

              <div className="space-y-1 text-xs">
                <span className="font-bold text-slate-700">Requested Deliverables:</span>
                <div className="flex flex-wrap gap-2">
                  {inv.deliverables.map((del, i) => (
                    <span key={i} className="px-2.5 py-1 bg-pink-50 text-[#EC4899] rounded-lg font-semibold text-[11px]">
                      {del}
                    </span>
                  ))}
                </div>
              </div>

              {inv.status === 'pending' && (
                <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => respondToInvitation(inv.id, 'accepted')}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Accept Collaboration
                  </button>

                  <button
                    onClick={() => {
                      respondToInvitation(inv.id, 'negotiating');
                      navigate('/creator/negotiations');
                    }}
                    className="px-5 py-2.5 bg-[#EC4899] hover:bg-pink-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-4 h-4" /> Open Deal Room & Counter Offer
                  </button>

                  <button
                    onClick={() => respondToInvitation(inv.id, 'rejected')}
                    className="px-4 py-2.5 text-slate-500 hover:text-slate-800 text-xs font-semibold rounded-xl"
                  >
                    Decline
                  </button>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
