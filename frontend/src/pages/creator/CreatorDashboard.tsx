import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { getCreatorDashboard, respondToInvitation, getCreatorAnalytics } from '../../lib/api';
import {
  Mail,
  FolderKanban,
  Search,
  Loader2,
  DollarSign,
  Briefcase,
  CheckCircle2,
  Users,
  Award,
  Star,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  UserCheck,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { formatRelativeTime } from '../../utils/dateTime';
import { getNotificationRoute } from '../../utils/notificationRoutes';

export const CreatorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { formatCurrency, notifications, markNotificationRead } = useApp();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const [dashRes, analyticsRes] = await Promise.all([
        getCreatorDashboard().catch(() => null),
        getCreatorAnalytics().catch(() => ({ success: false, data: null }))
      ]);

      if (dashRes?.success) {
        setDashboardData(dashRes.data);
      }
      if (analyticsRes?.success) {
        setAnalytics(analyticsRes.data);
      }
    } catch (err) {
      console.error('Error fetching creator dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleResponse = async (id: string, status: 'accepted' | 'rejected' | 'negotiating') => {
    try {
      await respondToInvitation(id, status);
      fetchDashboard();
    } catch (err) {
      console.error('Failed to respond to invitation:', err);
    }
  };

  const checkAudienceMetricsCompletion = (profile: any) => {
    if (!profile) return false;

    const platforms: string[] = [];
    if (Array.isArray(profile.platforms) && profile.platforms.length > 0) {
      profile.platforms.forEach((item: any) => {
        const key = (typeof item === 'string' ? item : item?.platform)?.toLowerCase();
        if (key && ['youtube', 'instagram', 'twitter'].includes(key)) {
          platforms.push(key);
        }
      });
    } else if (profile.socialLinks || profile.platformLinks) {
      const linksObj = { ...profile.platformLinks, ...profile.socialLinks };
      ['youtube', 'instagram', 'twitter'].forEach((key) => {
        if (linksObj[key]) platforms.push(key);
      });
    }

    if (platforms.length === 0) return false;

    const metrics = profile.audienceMetrics || {};

    return platforms.every((p) => {
      const m = metrics[p];
      if (!m) return false;
      if (p === 'youtube') {
        return m.subscribers !== null && m.subscribers !== undefined &&
               m.averageViews !== null && m.averageViews !== undefined &&
               m.engagementRate !== null && m.engagementRate !== undefined;
      }
      if (p === 'instagram') {
        return m.followers !== null && m.followers !== undefined &&
               m.averageReelViews !== null && m.averageReelViews !== undefined &&
               m.engagementRate !== null && m.engagementRate !== undefined;
      }
      if (p === 'twitter') {
        return m.followers !== null && m.followers !== undefined &&
               m.averageImpressions !== null && m.averageImpressions !== undefined &&
               m.engagementRate !== null && m.engagementRate !== undefined;
      }
      return false;
    });
  };

  const isProfileMetricsComplete = checkAudienceMetricsCompletion(dashboardData?.profile);

  const stats = dashboardData?.stats || {
    totalEarnings: 0,
    brandInvitations: 0,
    activeCampaigns: 0,
    openNegotiations: 0
  };

  const creatorName = user?.fullName || user?.name || 'Creator';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white p-7 md:p-9 rounded-3xl shadow-2xl border border-slate-800">
        {/* Ambient Light Accents */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 text-[11px] font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Creator Studio Workspace
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              Welcome back, <span className="bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent">{creatorName}</span>!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              Review incoming brand collaboration requests, manage negotiation offers, update deliverable pricing, and track your escrow earnings in real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/creator/requests"
              className="px-5 py-3 bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] hover:opacity-95 text-white font-bold text-xs rounded-2xl transition-all shadow-lg hover:shadow-pink-500/25 flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              Brand Offers
            </Link>
            <Link
              to="/creator/discover"
              className="px-4.5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-2xl transition-all border border-white/20 backdrop-blur-md flex items-center gap-2 active:scale-95"
            >
              <Search className="w-4 h-4" />
              Browse Briefs
            </Link>
            <Link
              to="/creator/portfolio"
              className="px-4.5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-2xl transition-all border border-white/20 backdrop-blur-md flex items-center gap-2 active:scale-95"
            >
              <FolderKanban className="w-4 h-4" />
              Portfolio
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
          {/* PROFILE COMPLETION REMINDER BANNER */}
          {!isProfileMetricsComplete ? (
            <Card className="p-5 bg-gradient-to-r from-amber-500/10 via-pink-500/10 to-purple-500/10 border border-amber-200/90 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0" />
                  <h3 className="text-sm font-bold text-slate-900">Complete Your Creator Profile</h3>
                </div>
                <p className="text-xs text-slate-600 max-w-xl">
                  Your audience information is incomplete. Add your followers, subscribers, average views, and engagement metrics so brands can better discover and evaluate your profile.
                </p>
              </div>
              <Link
                to="/creator/profile"
                className="px-4 py-2.5 bg-[#EC4899] hover:bg-pink-600 text-white font-bold text-xs rounded-xl shadow-xs shrink-0 flex items-center gap-1.5 transition-all"
              >
                Complete Profile <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Card>
          ) : (
            <Card className="p-4 bg-emerald-50/80 border border-emerald-200/90 rounded-2xl flex items-center justify-between text-xs shadow-xs">
              <div className="flex items-center gap-2.5 text-emerald-900 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Creator Profile Complete — Your audience information is ready for brand discovery.</span>
              </div>
              <Link to="/creator/profile" className="text-emerald-700 hover:underline font-semibold text-[11px]">
                View Profile
              </Link>
            </Card>
          )}

          {/* Creator Analytics & Performance Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card hoverable className="p-5 border-slate-200/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Total Earnings</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">
                {formatCurrency(analytics?.totalReleasedEarnings ?? stats.totalEarnings ?? 0)}
              </p>
              <span className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Escrowed: {formatCurrency(analytics?.totalEscrowedAmount ?? 0)}
              </span>
            </Card>

            <Card className="p-5 border-slate-200/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Completed Collabs</span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">
                {analytics?.completedCollaborations ?? 0}
              </p>
              <span className="text-[10px] text-purple-600 font-bold mt-1 block">
                Completion Rate: {analytics?.collaborationCompletionRate ?? 0}%
              </span>
            </Card>

            <Card className="p-5 border-slate-200/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Brands Worked With</span>
                <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">
                {analytics?.totalBrandsWorkedWith ?? 0}
              </p>
              <span className="text-[10px] text-pink-600 font-bold mt-1 block">
                Active: {analytics?.activeCollaborations ?? stats.activeCampaigns ?? 0}
              </span>
            </Card>

            <Card className="p-5 border-slate-200/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Reputation Rating</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Star className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">
                {analytics?.averageRating ?? 0} ⭐
              </p>
              <span className="text-[10px] text-slate-400 font-medium mt-1 block">
                Total Reviews: {analytics?.totalReviews ?? 0}
              </span>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <Card className="lg:col-span-2 p-5 border-slate-200/80">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Recent Notifications & Activity</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Latest briefs, counter offers, approvals, and payout updates.</p>
                </div>
                <Link to="/creator/notifications" className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1">
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-2.5 mt-4">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No recent notifications.</p>
                ) : (
                  notifications.slice(0, 5).map((n: any) => {
                    const isUnread = !n.read && !n.isRead;
                    const nid = n._id || n.id;
                    return (
                      <Link
                        key={nid}
                        to={getNotificationRoute(n, 'creator')}
                        onClick={() => markNotificationRead(nid)}
                        className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                          isUnread
                            ? 'bg-purple-50/50 border-purple-200 hover:bg-purple-50'
                            : 'bg-slate-50/70 border-slate-100 hover:bg-slate-100/80'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {isUnread && <span className="w-2 h-2 rounded-full bg-[#EC4899] shrink-0" />}
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block truncate">{n.title || n.message}</span>
                            <span className="text-slate-500 text-[11px] block truncate">{n.message}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 shrink-0 ml-3">
                          {formatRelativeTime(n.createdAt || n.timestamp)}
                        </span>
                      </Link>
                    );
                  })
                )}
              </div>
            </Card>

            <Card className="p-5 border-slate-200/80 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Creator Summary</h3>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Total Collaborations:</span>
                  <span className="font-bold text-slate-900">{analytics?.totalCollaborations ?? 0}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Open Negotiations:</span>
                  <span className="font-bold text-slate-900">{stats.openNegotiations ?? 0}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Verified Rating:</span>
                  <span className="font-bold text-slate-900">{analytics?.averageRating ?? 0} ⭐</span>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};
