import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import {
  ArrowLeft,
  Calendar,
  Users,
  Megaphone,
  Send,
  CheckCircle2,
  Loader2,
  Eye,
  FileCheck,
  Pause,
  Play
} from 'lucide-react';
import { getCampaignById, updateCampaignStatusApi } from '../../lib/api';

export const CampaignDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { formatCurrency, formatDate, addToast } = useApp();

  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchCampaign = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getCampaignById(id);
      if (res.success && res.data) {
        setCampaign(res.data);
      } else {
        setError('Campaign not found.');
      }
    } catch (err: any) {
      console.error('Failed to fetch campaign details:', err);
      setError(err?.message || 'Failed to load campaign details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaign();
  }, [id]);

  const handleToggleStatus = async () => {
    if (!campaign) return;
    const campaignId = campaign._id || campaign.id;
    const nextStatus = campaign.status === 'active' ? 'paused' : 'active';
    setUpdatingStatus(true);
    try {
      const res = await updateCampaignStatusApi(campaignId, nextStatus);
      if (res.success) {
        setCampaign((prev: any) => ({ ...prev, status: nextStatus }));
        addToast(
          'info',
          'Campaign Status Updated',
          `Campaign is now ${nextStatus === 'active' ? 'active and accepting creators' : 'paused'}.`
        );
      }
    } catch (err: any) {
      addToast('error', 'Status Update Failed', err?.message || 'Could not update campaign status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Link
          to="/brand/campaigns"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Campaigns
        </Link>
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200 shadow-xs">
          <Loader2 className="w-8 h-8 animate-spin text-[#EC4899] mb-3" />
          <p className="text-xs font-bold text-slate-600">Loading campaign brief details…</p>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="space-y-6">
        <Link
          to="/brand/campaigns"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Campaigns
        </Link>
        <Card className="p-12 text-center border-slate-200 shadow-xs">
          <EmptyState
            icon={Megaphone}
            title="Campaign Not Found"
            description={error || "The requested campaign brief could not be located in your database."}
            actionLabel="Return to Campaigns"
            onAction={() => window.history.back()}
          />
        </Card>
      </div>
    );
  }

  const deliverablesList = Array.isArray(campaign.deliverables)
    ? campaign.deliverables
    : Array.isArray(campaign.requirements)
    ? campaign.requirements.map((r: any) => typeof r === 'string' ? r : `${r.contentType || 'Deliverable'} (${r.platform || 'General'})`)
    : [];

  const platformsList = campaign.targetPlatforms || campaign.platforms || [];

  return (
    <div className="space-y-6">
      <Link
        to="/brand/campaigns"
        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Campaigns
      </Link>

      <Card className="p-6 md:p-8 border-slate-200/90 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant={
                  campaign.status === 'active'
                    ? 'emerald'
                    : campaign.status === 'draft'
                    ? 'amber'
                    : campaign.status === 'paused'
                    ? 'rose'
                    : 'slate'
                }
              >
                {campaign.status}
              </Badge>
              <Badge variant="purple">{campaign.category || 'General'}</Badge>
              {campaign.brandName && (
                <span className="text-xs font-bold text-slate-500">by {campaign.brandName}</span>
              )}
            </div>
            <h1 className="text-2xl font-black text-slate-900">{campaign.title}</h1>
            <p className="text-xs text-slate-500">
              Created on {formatDate(campaign.createdAt)}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleToggleStatus}
              disabled={updatingStatus}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              {updatingStatus ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : campaign.status === 'active' ? (
                <Pause className="w-3.5 h-3.5 text-amber-500" />
              ) : (
                <Play className="w-3.5 h-3.5 text-emerald-500" />
              )}
              {campaign.status === 'active' ? 'Pause Campaign' : 'Resume Campaign'}
            </button>
            <Link
              to="/brand/discover"
              className="px-4 py-2 bg-[#EC4899] hover:bg-pink-600 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
            >
              <Send className="w-3.5 h-3.5" /> Invite Creators
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Total Allocated Budget</span>
            <span className="text-lg font-black text-slate-900">{formatCurrency(campaign.budget || 0)}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Min Follower Reach</span>
            <span className="text-lg font-black text-slate-900">
              {campaign.minFollowers ? `${(campaign.minFollowers / 1000).toFixed(0)}K+` : 'Open Reach'}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Deadline</span>
            <span className="text-lg font-black text-slate-900">{formatDate(campaign.deadline)}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Applications / Views</span>
            <span className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span>{campaign.applicantsCount || 0} applicants</span>
              <span className="text-xs text-slate-400 font-normal">({campaign.views || 0} views)</span>
            </span>
          </div>
        </div>

        {platformsList.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-700">Target Platforms:</span>
            {platformsList.map((p: string) => (
              <span
                key={p}
                className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg bg-pink-50 text-[#EC4899] border border-pink-200"
              >
                {p}
              </span>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900">Campaign Guidelines & Description</h3>
          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
            {campaign.description || 'No detailed description provided.'}
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Deliverable Requirements</h3>
          {deliverablesList.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No specific deliverables enumerated.</p>
          ) : (
            <div className="space-y-2">
              {deliverablesList.map((del: any, idx: number) => {
                const delText = typeof del === 'string' ? del : del.title || del.contentType || 'Deliverable';
                const delType = typeof del === 'object' && del.platform ? del.platform : 'Deliverable';

                return (
                  <div
                    key={idx}
                    className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="font-semibold text-slate-800">{delText}</span>
                    </div>
                    <span className="text-[10px] font-bold text-purple-600 uppercase bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                      {delType}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
