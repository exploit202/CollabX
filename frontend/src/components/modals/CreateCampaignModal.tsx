import React, { useEffect, useState } from 'react';
import { Modal } from '../common/Modal';
import { Plus, Save, Loader2 } from 'lucide-react';
import { createCampaign } from '../../lib/api';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign?: any | null;
}

type CampaignPlatform = 'instagram' | 'youtube';

const empty = {
  title: '',
  description: '',
  category: 'Tech & Gadgets',
  budget: 5000,
  minFollowers: 10000,
  deadline: '2026-12-31',
  targetPlatforms: ['instagram', 'youtube'] as CampaignPlatform[]
};

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({ isOpen, onClose, campaign }) => {
  const [form, setForm] = useState(empty);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setForm(
      campaign
        ? {
            title: campaign.title,
            description: campaign.description,
            category: campaign.category,
            budget: campaign.budget,
            minFollowers: campaign.minFollowers || 10000,
            deadline: campaign.deadline ? campaign.deadline.split('T')[0] : '2026-12-31',
            targetPlatforms: campaign.targetPlatforms || ['instagram', 'youtube']
          }
        : empty
    );
    setErrorMsg('');
  }, [campaign, isOpen]);

  const toggle = (platform: CampaignPlatform) =>
    setForm((prev) => ({
      ...prev,
      targetPlatforms: prev.targetPlatforms.includes(platform)
        ? prev.targetPlatforms.filter((x) => x !== platform)
        : [...prev.targetPlatforms, platform]
    }));

  const submit = async (status: 'active' | 'draft') => {
    setErrorMsg('');
    if (!form.title.trim() || !form.description.trim()) {
      setErrorMsg('Title and description are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createCampaign({
        ...form,
        status
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create campaign.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const text = 'w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={campaign ? 'Edit Campaign' : 'Create New Collaboration Campaign'}>
      {errorMsg && (
        <div className="mb-3 p-2.5 text-xs bg-rose-50 border border-rose-200 text-rose-600 rounded-xl font-medium">
          {errorMsg}
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit('active');
        }}
        className="space-y-4"
      >
        <label className="block text-xs font-semibold text-slate-700">
          Campaign Title
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Summer Product Launch 2026"
            className={`${text} mt-1`}
            required
            disabled={isSubmitting}
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs font-semibold text-slate-700">
            Category
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className={`${text} mt-1`}
              disabled={isSubmitting}
            >
              {['Tech & Gadgets', 'Fashion & Lifestyle', 'Fitness & Wellness', 'Gaming', 'Travel', 'Beauty & Skincare'].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-700">
            Total Budget ($)
            <input
              type="number"
              min="1"
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })}
              className={`${text} mt-1`}
              required
              disabled={isSubmitting}
            />
          </label>
        </div>
        <label className="block text-xs font-semibold text-slate-700">
          Campaign Description & Goals
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={`${text} mt-1`}
            required
            disabled={isSubmitting}
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs font-semibold text-slate-700">
            Submission Deadline
            <input
              type="date"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              className={`${text} mt-1`}
              disabled={isSubmitting}
            />
          </label>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-700 mb-2">Target Platforms</p>
          <div className="flex gap-2">
            {(['instagram', 'youtube'] as const).map((platform) => (
              <button
                key={platform}
                type="button"
                onClick={() => toggle(platform)}
                disabled={isSubmitting}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border capitalize transition-all ${
                  form.targetPlatforms.includes(platform)
                    ? 'bg-[#EC4899] text-white border-[#EC4899]'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                {platform}
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-3 border-t">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </button>
          {!campaign && (
            <button
              type="button"
              onClick={() => submit('draft')}
              disabled={isSubmitting}
              className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl flex gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              Save Draft
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-[#EC4899] hover:bg-pink-600 disabled:opacity-70 text-white font-semibold text-xs rounded-xl transition-all shadow-md flex gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Publishing...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                {campaign ? 'Save Changes' : 'Publish Campaign'}
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
