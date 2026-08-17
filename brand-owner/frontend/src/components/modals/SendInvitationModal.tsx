import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { CreatorProfile } from '../../types';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { IndianRupee, Send, Check } from 'lucide-react';

interface SendInvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  creator: CreatorProfile | null;
}

export const SendInvitationModal: React.FC<SendInvitationModalProps> = ({
  isOpen,
  onClose,
  creator,
}) => {
  const { campaigns, sendInvitation } = useApp();
  const { user } = useAuth();

  const [selectedCampaignId, setSelectedCampaignId] = useState(campaigns[0]?.id || '');
  const [proposedPrice, setProposedPrice] = useState<number>(creator?.pricing[0]?.price || 1000);
  const [selectedDeliverables, setSelectedDeliverables] = useState<string[]>([]);
  const [message, setMessage] = useState('');

  if (!creator) return null;

  const handleDeliverableToggle = (type: string) => {
    setSelectedDeliverables((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const campaign = campaigns.find((c) => c.id === selectedCampaignId) || campaigns[0];

    sendInvitation({
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      brandId: user?.id || '',
      brandName: (user as any)?.companyName || 'TechFlow Innovations',
      brandLogo: (user as any)?.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200',
      creatorId: creator.id,
      creatorName: creator.name,
      creatorAvatar: creator.avatar,
      proposedPrice,
      deliverables: selectedDeliverables.length > 0 ? selectedDeliverables : ['Custom Deliverable Package'],
      message: message || `Hi ${creator.name}, we would love to collaborate with you on our upcoming campaign!`,
    });

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Invite ${creator.name} to Collaborate`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Select Campaign */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Select Campaign</label>
          <select
            value={selectedCampaignId}
            onChange={(e) => setSelectedCampaignId(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} (₹{c.budget.toLocaleString('en-IN')} Budget)
              </option>
            ))}
          </select>
        </div>

        {/* Deliverables selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Choose Deliverables Needed
          </label>
          <div className="space-y-2 max-h-40 overflow-y-auto p-1">
            {creator.pricing.map((p) => {
              const isSelected = selectedDeliverables.includes(p.type);
              return (
                <div
                  key={p.id}
                  onClick={() => handleDeliverableToggle(p.type)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#EC4899] bg-pink-50/50 text-pink-950'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <span className="font-semibold text-slate-900 block">{p.type}</span>
                    <span className="text-[11px] text-slate-500">{p.description}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">₹{p.price.toLocaleString('en-IN')}</span>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border ${
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
        </div>

        {/* Proposed Price */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Offered Budget (₹)</label>
          <div className="relative">
            <IndianRupee className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="number"
              value={proposedPrice}
              onChange={(e) => setProposedPrice(Number(e.target.value))}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500 font-semibold"
              required
            />
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Personal Message</label>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Introduce your brand and describe why you think they'd be a great fit..."
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>

        {/* Action button */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#EC4899] hover:bg-pink-600 text-white font-semibold text-xs rounded-xl transition-all shadow-md flex items-center gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            Send Invitation
          </button>
        </div>
      </form>
    </Modal>
  );
};
