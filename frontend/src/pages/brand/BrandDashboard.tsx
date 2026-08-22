import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { CreateCampaignModal } from '../../components/modals/CreateCampaignModal';
import {
  getBrandDashboard,
  getBrandCampaigns,
  getBrandCollaborations,
  getBrandAnalytics
} from '../../lib/api';
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
  Loader2,
  DollarSign,
  Star,
  Users,
  Award,
  Sparkles
} from 'lucide-react';

export const BrandDashboard: React.FC = () => {
  const { user } = useAuth();
  const { formatCurrency } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [collaborations, setCollaborations] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const [dashRes, campRes, collabRes, analyticsRes] = await Promise.all([
        getBrandDashboard().catch(() => null),
        getBrandCampaigns().catch(() => ({ success: false, data: [] })),
        getBrandCollaborations().catch(() => ({ success: false, data: [] })),
        getBrandAnalytics().catch(() => ({ success: false, data: null }))
      ]);

      if (dashRes?.success) {
        setDashboardData(dashRes.data);
      }
      if (campRes?.success) {
        setCampaigns(campRes.data || []);
      }
      if (collabRes?.success) {
        setCollaborations(collabRes.data || []);
      }
      if (analyticsRes?.success) {
        setAnalytics(analyticsRes.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const stats = dashboardData?.summary || {
    activeCampaigns: campaigns.filter((c) => c.status === 'active').length,
    pendingInvitations: dashboardData?.pendingInvitations?.length || 0,
    activeCollaborations: collaborations.length
  };

  const companyName = user?.companyName || dashboardData?.brand?.name || user?.name || 'Your Brand';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Brand Workspace Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 text-white p-7 md:p-9 rounded-3xl shadow-2xl border border-slate-800">
        {/* Ambient Light Accents */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 text-[11px] font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Enterprise Brand Command Center
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              Welcome back, <span className="bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent">{companyName}</span>!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              Manage your active influencer campaigns, review pending creator invitations, inspect content deliverables, and release secure escrow payouts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-3 bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] hover:opacity-95 text-white font-bold text-xs rounded-2xl transition-all shadow-lg hover:shadow-pink-500/25 flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Create Campaign
            </button>
            <Link
              to="/brand/discover"
              className="px-4.5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-2xl transition-all border border-white/20 backdrop-blur-md flex items-center gap-2 active:scale-95"
            >
              <Search className="w-4 h-4" />
              Discover Creators
            </Link>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <SkeletonLoader variant="stat" count={4} />
          <SkeletonLoader variant="card" count={2} />
        </div>
      ) : (
        <>
          {/* Stats & Analytics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-5 border-slate-200/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Active Campaigns</span>
                <div className="w-8 h-8 rounded-xl bg-pink-50 text-[#EC4899] flex items-center justify-center">
                  <Megaphone className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">{analytics?.activeCampaigns ?? stats.activeCampaigns ?? 0}</p>
              <span className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Total: {analytics?.totalCampaigns ?? campaigns.length}
              </span>
            </Card>

            <Card className="p-5 border-slate-200/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Completed Collabs</span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">{analytics?.completedCollaborations ?? 0}</p>
              <span className="text-[10px] text-purple-600 font-bold mt-1 block">
                Completion Rate: {analytics?.collaborationCompletionRate ?? 0}%
              </span>
            </Card>

            <Card className="p-5 border-slate-200/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Creators Worked With</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">{analytics?.totalCreatorsWorkedWith ?? 0}</p>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                <Award className="w-3 h-3" /> Avg Rating: {analytics?.averageCreatorRating ?? 0} ⭐
              </span>
            </Card>

            <Card hoverable className="p-5 border-slate-200/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Released Payouts</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">{formatCurrency(analytics?.totalReleasedAmount ?? 0)}</p>
              <span className="text-[10px] text-slate-400 font-medium mt-1 block">
                Escrowed: {formatCurrency(analytics?.totalEscrowedAmount ?? 0)}
              </span>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <Card className="lg:col-span-2 p-5 border-slate-200/80">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Quick Actions</h2>
                  <p className="text-xs text-slate-500 mt-1">Move your next collaboration forward.</p>
                </div>
                <MessageSquare className="w-5 h-5 text-pink-500"/>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                <button onClick={() => setShowCreateModal(true)} className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 text-center transition-all">Create campaign</button>
                <Link to="/brand/discover" className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 text-center transition-all">Find creators</Link>
                <Link to="/brand/collaborations" className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 text-center transition-all">Active collabs</Link>
                <Link to="/brand/saved-creators" className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 text-center transition-all">Shortlisted</Link>
              </div>
            </Card>

            <Card className="p-5 border-slate-200/80 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Brand Insights</h3>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Total Campaigns Created:</span>
                  <span className="font-bold text-slate-900">{analytics?.totalCampaigns ?? 0}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Total Collaborations:</span>
                  <span className="font-bold text-slate-900">{analytics?.totalCollaborations ?? 0}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Total Reviews Submitted:</span>
                  <span className="font-bold text-slate-900">{analytics?.totalReviews ?? 0}</span>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}

      {showCreateModal && (
        <CreateCampaignModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => fetchDashboard()}
        />
      )}
    </div>
  );
};
