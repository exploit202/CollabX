import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Mail, MessageSquare, Trash2, ChevronRight, IndianRupee } from 'lucide-react';
import { Modal } from '../../components/common/Modal';

export const BrandInvitations: React.FC = () => {
  const { invitations, cancelInvitation, respondToInvitation } = useApp();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Collaboration Invitations</h1>
          <p className="text-xs text-slate-500">Track pending, accepted, or negotiated creator collaboration invitations</p>
        </div>
      </div>

      <div className="space-y-4">
        {invitations.length === 0 ? (
          <Card className="p-8 text-center text-xs text-slate-400">
            No collaboration invitations sent yet.
          </Card>
        ) : (
          invitations.map((inv) => (
            <Card key={inv.id} className="p-5 border-slate-200/90 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={inv.creatorAvatar}
                    alt={inv.creatorName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{inv.creatorName}</h3>
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
                    {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                  </Badge>
                  <span className="text-sm font-black text-slate-900">₹{inv.proposedPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                "{inv.message}"
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-400 text-[10px]">Sent on {inv.sentDate}</span>

                <div className="flex items-center gap-2">
                  {inv.status !== 'cancelled' && <button
                    onClick={() => setConfirming(inv.id)}
                    className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Cancel
                  </button>}

                  {inv.status !== 'cancelled' && inv.status !== 'accepted' && <button
                    onClick={() => {
                      respondToInvitation(inv.id, 'negotiating');
                      navigate('/brand/negotiations');
                    }}
                    className="px-4 py-1.5 bg-[#EC4899] hover:bg-pink-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Open Negotiation
                  </button>}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
      <Modal isOpen={!!confirming} onClose={() => setConfirming(null)} title="Cancel invitation?">
        <p className="text-xs text-slate-600">The creator will see this invitation as cancelled and can no longer accept it.</p>
        <div className="mt-6 flex justify-end gap-2"><button onClick={() => setConfirming(null)} className="px-4 py-2 text-xs font-bold text-slate-600">Keep invitation</button><button onClick={() => { if (confirming) cancelInvitation(confirming); setConfirming(null); }} className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold">Cancel invitation</button></div>
      </Modal>
    </div>
  );
};
