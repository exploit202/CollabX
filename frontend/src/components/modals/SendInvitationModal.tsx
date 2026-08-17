import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { getBrandCampaigns, createInvitation } from '../../lib/api';
import { IndianRupee, Send, Check, Loader2, AlertCircle, Package, Clock, ShieldCheck } from 'lucide-react';

interface SendInvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  creator: any | null;
  onSuccess?: () => void;
}

export const SendInvitationModal: React.FC<SendInvitationModalProps> = ({
  isOpen,
  onClose,
  creator,
  onSuccess
}) => {
  const { formatCurrency } = useApp();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState<boolean>(true);

  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [proposedPrice, setProposedPrice] = useState<number>(5000);
  const [selectedDeliverables, setSelectedDeliverables] = useState<string[]>([]);
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch real campaigns created by currently logged-in Brand
  useEffect(() => {
    if (!isOpen) return;

    setLoadingCampaigns(true);
    setError(null);

    getBrandCampaigns()
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          setCampaigns(res.data);
          if (res.data.length > 0) {
            const firstCamp = res.data[0];
            setSelectedCampaignId(firstCamp.id || firstCamp._id);
          } else {
            setSelectedCampaignId('');
          }
        }
      })
      .catch((err) => {
        console.error('Error fetching brand campaigns for invitation:', err);
        setError(err?.data?.message || err?.message || 'Failed to load brand campaigns.');
      })
      .finally(() => {
        setLoadingCampaigns(false);
      });
  }, [isOpen]);

  // Reset/Initialize deliverables and pricing when selected creator changes
  useEffect(() => {
    if (!creator) return;

    const creatorPackages = Array.isArray(creator.pricing) ? creator.pricing : [];
    if (creatorPackages.length > 0) {
      const firstPkg = creatorPackages[0];
      const title = firstPkg.title || firstPkg.type || firstPkg.deliverableType || 'Custom Deliverable';
      setSelectedDeliverables([title]);
      setProposedPrice(Number(firstPkg.price) || Number(creator.minStartingPrice) || 5000);
    } else {
      setSelectedDeliverables(['Custom Deliverable Package']);
      setProposedPrice(Number(creator.minStartingPrice) || 5000);
    }
    setMessage(`Hi ${creator.name}, we would love to collaborate with you on our upcoming campaign!`);
  }, [creator]);

  if (!creator) return null;

  const creatorPackages = Array.isArray(creator.pricing) ? creator.pricing : [];

  const handleDeliverableToggle = (type: string, price?: number) => {
    setSelectedDeliverables((prev) => {
      let updated: string[];
      if (prev.includes(type)) {
        updated = prev.filter((t) => t !== type);
      } else {
        updated = [...prev, type];
      }

      // Automatically recalculate proposed budget if packages have prices
      if (creatorPackages.length > 0) {
        const total = creatorPackages
          .filter((p: any) => updated.includes(p.title || p.type || p.deliverableType))
          .reduce((sum: number, p: any) => sum + (Number(p.price) || 0), 0);
        if (total > 0) {
          setProposedPrice(total);
        }
      }

      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCampaignId) {
      setError('Please select a campaign created by your brand.');
      return;
    }

    if (!proposedPrice || Number(proposedPrice) <= 0) {
      setError('Please enter a valid offered budget greater than 0.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await createInvitation({
        campaignId: selectedCampaignId,
        creatorId: creator.id || creator._id,
        proposedPrice: Number(proposedPrice),
        deliverables: selectedDeliverables.length > 0 ? selectedDeliverables : ['Custom Deliverable Package'],
        message: message.trim() || `Hi ${creator.name}, we would love to collaborate with you on our upcoming campaign!`
      });

      if (res?.success) {
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setError(res?.message || 'Failed to send collaboration invitation.');
      }
    } catch (err: any) {
      console.error('Failed to send invitation:', err);
      setError(err?.data?.message || err?.message || 'Failed to send invitation to creator.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Invite ${creator.name} to Collaborate`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Select Campaign */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Select Campaign</label>
          {loadingCampaigns ? (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-400 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-pink-500" />
              Loading your brand campaigns...
            </div>
          ) : campaigns.length === 0 ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-800 space-y-1">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>No active campaigns found. Please create a campaign from your Brand Dashboard before sending an invitation.</span>
              </div>
            </div>
          ) : (
            <select
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500"
              disabled={isSubmitting}
            >
              {campaigns.map((c) => {
                const cid = c.id || c._id;
                return (
                  <option key={cid} value={cid}>
                    {c.title} ({formatCurrency(c.budget || 0)} Budget)
                  </option>
                );
              })}
            </select>
          )}
        </div>

        {/* Deliverables selection from selected creator's real packages */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
            <span>Choose Deliverables Needed</span>
            <span className="text-[10px] text-slate-400 font-normal">Real packages from creator profile</span>
          </label>
          {creatorPackages.length === 0 ? (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 italic">
              Creator has not added specific packages yet. A standard custom deliverable will be requested.
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto p-1">
              {creatorPackages.map((p: any) => {
                const pkgTitle = p.title || p.type || p.deliverableType || 'Deliverable Package';
                const isSelected = selectedDeliverables.includes(pkgTitle);
                const pkgId = p.id || p._id || pkgTitle;

                return (
                  <div
                    key={pkgId}
                    onClick={() => handleDeliverableToggle(pkgTitle, p.price)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#EC4899] bg-pink-50/50 text-pink-950 shadow-2xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 truncate">{pkgTitle}</span>
                        {p.platform && (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-pink-100 text-[#EC4899] uppercase">
                            {p.platform}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{p.description || 'High quality deliverable.'}</p>
                      {p.deliveryDays && (
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" /> {p.deliveryDays} business days turnaround
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-extrabold text-slate-900">{formatCurrency(p.price || 0)}</span>
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                          isSelected ? 'bg-[#EC4899] border-[#EC4899] text-white' : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Proposed Price / Offered Budget */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Offered Budget (₹)</label>
          <div className="relative">
            <IndianRupee className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="number"
              min="1"
              value={proposedPrice}
              onChange={(e) => setProposedPrice(Number(e.target.value))}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500 font-bold"
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Personal Message */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Personal Message</label>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Introduce your brand and describe why you think they'd be a great fit..."
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
            disabled={isSubmitting}
          />
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || campaigns.length === 0}
            className="px-5 py-2.5 bg-[#EC4899] hover:bg-pink-600 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Send Invitation
          </button>
        </div>
      </form>
    </Modal>
  );
};
