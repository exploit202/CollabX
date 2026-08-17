import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { CreateCampaignModal } from '../../components/modals/CreateCampaignModal';
import {
  Megaphone,
  Mail,
  Briefcase,
  Bookmark,
  Plus,
  Search,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  MessageSquare,
} from 'lucide-react';

export const BrandDashboard: React.FC = () => {
  const { user } = useAuth();
  const { campaigns, invitations, collaborations, savedCreatorIds, refreshData } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    refreshData();
  }, []);

  const activeCampaigns = campaigns.filter((c) => c.status === 'active');
  const pendingInvs = invitations.filter((i) => i.status === 'pending');
  const activeCollabs = collaborations.filter((c) => c.stage !== 'completed');

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 md:p-8 rounded-3xl shadow-xl">
        <div className="space-y-2">
          <Badge variant="pink" className="bg-pink-500/20 text-pink-300 border-pink-500/30">
            Brand Workspace
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, {(user as any)?.companyName || 'TechFlow Innovations'}!
          </h1>
          <p className="text-xs text-slate-300 max-w-lg">
            Manage your active influencer campaigns, review pending creator invitations, and negotiate collaboration terms.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-3 bg-[#EC4899] hover:bg-pink-600 text-white font-bold text-xs rounded-xl transition-all shadow-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Campaign
          </button>
          <Link
            to="/brand/discover"
            className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all border border-white/20 flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Discover Creators
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5 border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Campaigns</span>
            <div className="w-8 h-8 rounded-xl bg-pink-50 text-[#EC4899] flex items-center justify-center">
              <Megaphone className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{activeCampaigns.length}</p>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> {activeCampaigns.length ? '+1 this month' : 'Create your first campaign'}</span>
        </Card>

        <Card className="p-5 border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending Invitations</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{pendingInvs.length}</p>
          <span className="text-[10px] text-amber-600 font-bold mt-1 block">{pendingInvs.length ? `${pendingInvs.length} need attention` : 'All caught up'}</span>
        </Card>

        <Card className="p-5 border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Collaborations</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{activeCollabs.length}</p>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3 h-3" /> Content in progress
          </span>
        </Card>

        <Card className="p-5 border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Saved Creators</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{savedCreatorIds.length}</p>
          <span className="text-[10px] text-slate-400 font-medium mt-1 block">Ready for outreach</span>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 p-5 border-slate-200/80"><div className="flex items-center justify-between"><div><h2 className="text-sm font-bold text-slate-900">Quick actions</h2><p className="text-xs text-slate-500 mt-1">Move your next collaboration forward.</p></div><MessageSquare className="w-5 h-5 text-pink-500"/></div><div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4"><button onClick={()=>setShowCreateModal(true)} className="quick-action">Create campaign</button><Link to="/brand/discover" className="quick-action">Find creators</Link><Link to="/brand/saved" className="quick-action">Invite shortlist</Link><Link to="/brand/invitations" className="quick-action">Review invites</Link></div></Card>
        <Card className="p-5 border-amber-200 bg-amber-50/40"><h2 className="text-sm font-bold text-slate-900">Attention needed</h2><p className="text-xs text-slate-600 mt-2">{pendingInvs.length ? `${pendingInvs.length} invitation${pendingInvs.length > 1 ? 's are' : ' is'} awaiting a response.` : 'No pending actions right now.'}</p><Link to={pendingInvs.length ? '/brand/invitations' : '/brand/discover'} className="inline-block mt-3 text-xs font-bold text-[#EC4899] hover:underline">{pendingInvs.length ? 'Review invitations' : 'Discover creators'}</Link></Card>
      </div>

      {/* Active Collaborations */}
      <Card className="p-6 border-slate-200/80 space-y-4">
        <h3 className="text-base font-bold text-slate-900">Active Collaborations</h3>
        <div className="space-y-3">
          {collaborations.length === 0 ? (
            <p className="text-xs text-slate-400">No active collaborations</p>
          ) : (
            collaborations.map((collab) => (
              <div key={collab.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img src={collab.creatorAvatar} alt={collab.creatorName} className="w-8 h-8 rounded-full object-cover" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{collab.creatorName}</p>
                    <span className="text-[10px] text-slate-500 capitalize">{collab.stage.replace('_', ' ')}</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-900">₹{collab.agreedPrice.toLocaleString('en-IN')}</span>
              </div>
            ))
          )}
        </div>
        <Link
          to="/brand/collaborations"
          className="block text-center text-xs font-semibold text-[#EC4899] hover:underline pt-2 border-t border-slate-100"
        >
          Manage All Collaborations
        </Link>
      </Card>

      {/* Recent Campaigns Table */}
      <Card className="p-6 border-slate-200/80 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Campaigns</h3>
            <p className="text-xs text-slate-400">Overview of active and draft collaboration briefs</p>
          </div>
          <Link to="/brand/campaigns" className="text-xs font-semibold text-[#EC4899] hover:underline flex items-center gap-1">
            View All Campaigns <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="pb-3">Campaign Title</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Budget</th>
                <th className="pb-3">Applications</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {campaigns.map((camp) => (
                <tr key={camp.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 font-bold text-slate-900 max-w-xs truncate">{camp.title}</td>
                  <td className="py-3.5 text-slate-600">{camp.category}</td>
                  <td className="py-3.5 font-bold text-slate-900">₹{camp.budget.toLocaleString('en-IN')}</td>
                  <td className="py-3.5 text-slate-600">{camp.applicantsCount} creators</td>
                  <td className="py-3.5">
                    <Badge variant={camp.status === 'active' ? 'emerald' : 'slate'}>
                      {camp.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 text-right">
                    <Link
                      to={`/brand/campaigns/${camp.id}`}
                      className="text-xs font-semibold text-[#EC4899] hover:underline"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <CreateCampaignModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </div>
  );
};
