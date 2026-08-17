import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
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
  Award
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
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 md:p-8 rounded-3xl shadow-xl">
        <div className="space-y-2">
          <Badge variant="pink" className="bg-pink-500/20 text-pink-300 border-pink-500/30">
            Brand Workspace
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, {companyName}!
          </h1>
          <p className="text-xs text-slate-300 max-w-lg">
            Manage your active influencer campaigns, review pending creator invitations, and track analytics performance.
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

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
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
