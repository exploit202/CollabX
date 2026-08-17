import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { ArrowLeft, Calendar, IndianRupee, Users, Megaphone, Send, CheckCircle2 } from 'lucide-react';

export const CampaignDetailPage: React.FC = () => {
  const id = useParams<{ id: string }>().id;
  const { campaigns, updateCampaignStatus } = useApp();

  const campaign = campaigns.find((c) => c.id === id) || campaigns[0];

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
            <div className="flex items-center gap-2">
              <Badge variant={campaign.status === 'active' ? 'emerald' : 'slate'}>
                {campaign.status}
              </Badge>
              <Badge variant="purple">{campaign.category}</Badge>
            </div>
            <h1 className="text-2xl font-black text-slate-900">{campaign.title}</h1>
            <p className="text-xs text-slate-500">Created on {campaign.createdAt}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                updateCampaignStatus(
                  campaign.id,
                  campaign.status === 'active' ? 'paused' : 'active'
                )
              }
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl"
            >
              {campaign.status === 'active' ? 'Pause Campaign' : 'Resume Campaign'}
            </button>
            <Link
              to="/brand/discover"
              className="px-4 py-2 bg-[#EC4899] hover:bg-pink-600 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Invite Creators
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Total Allocated Budget</span>
            <span className="text-lg font-black text-slate-900">₹{campaign.budget.toLocaleString('en-IN')}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Min Follower Reach</span>
            <span className="text-lg font-black text-slate-900">
              {(campaign.minFollowers / 1000).toFixed(0)}K+
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Deadline</span>
            <span className="text-lg font-black text-slate-900">{campaign.deadline}</span>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Campaign Guidelines & Description</h3>
          <p className="text-xs text-slate-600 leading-relaxed">{campaign.description}</p>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Deliverable Requirements</h3>
          <div className="space-y-2">
            {campaign.requirements.map((req, idx) => (
              <div
                key={idx}
                className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="font-semibold text-slate-800">{req.contentType}</span>
                </div>
                <span className="text-slate-500 capitalize">{req.platform}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};
