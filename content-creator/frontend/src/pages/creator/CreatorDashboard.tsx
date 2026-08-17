import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { getDashboard, respondToCreatorRequest } from '../../lib/api';
import { Mail, FolderKanban, Search, RefreshCw } from 'lucide-react';

export const CreatorDashboard: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const { addToast } = useApp();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getDashboard();
      setDashboard(response.data);
      if (response.data?.profile) {
        updateUserProfile({
          name: response.data.profile?.user?.fullName || user?.name || '',
          bio: response.data.profile?.bio || '',
        } as any);
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to load dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  const stats = dashboard?.stats || {
    totalEarnings: 0,
    brandInvitations: 0,
    activeCampaigns: 0,
    openNegotiations: 0,
    profileViews: 0,
  };

  const pendingRequests = (dashboard?.recentRequests || []).filter(
    (request: any) => request.status === 'pending'
  );

  const handleResponse = async (
    invitationId: string,
    status: 'accepted' | 'negotiating'
  ) => {
    try {
      setBusyId(invitationId);
      await respondToCreatorRequest(invitationId, status);
      addToast('success', status === 'accepted' ? 'Invitation accepted' : 'Negotiation started');
      if (status === 'negotiating') navigate('/creator/negotiations');
      await loadDashboard();
    } catch (err: any) {
      addToast('error', err?.message || 'Unable to update invitation');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-xl">
        <div className="space-y-2">
          <Badge variant="purple" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
            Creator Studio
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, {user?.name || 'Creator'}!
          </h1>
          <p className="text-xs text-slate-300 max-w-lg">
            Review incoming brand collaboration requests, monitor negotiations, and track your active campaigns.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => void loadDashboard()}
            className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all border border-white/20 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <Link
            to="/creator/requests"
            className="px-5 py-3 bg-[#EC4899] hover:bg-pink-600 text-white font-bold text-xs rounded-xl transition-all shadow-lg flex items-center gap-2"
          >
            <Mail className="w-4 h-4" /> Brand Offers
          </Link>
          <Link
            to="/creator/discover"
            className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all border border-white/20 flex items-center gap-2"
          >
            <Search className="w-4 h-4" /> Discover Brands
          </Link>
          <Link
            to="/creator/portfolio"
            className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all border border-white/20 flex items-center gap-2"
          >
            <FolderKanban className="w-4 h-4" /> Portfolio
          </Link>
        </div>
      </div>

      {error && (
        <Card className="p-4 border-rose-200 bg-rose-50 text-xs text-rose-700">
          {error}
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5 border-slate-200/80">
          <span className="text-xs font-semibold text-slate-500 block">Total Earnings</span>
          <p className="text-2xl font-black text-slate-900 mt-2">₹{Number(stats.totalEarnings || 0).toLocaleString('en-IN')}</p>
          <span className="text-[10px] text-slate-400 font-medium mt-1 block">Completed collaborations</span>
        </Card>
        <Card className="p-5 border-slate-200/80">
          <span className="text-xs font-semibold text-slate-500 block">Brand Invitations</span>
          <p className="text-2xl font-black text-slate-900 mt-2">{stats.brandInvitations}</p>
          <span className="text-[10px] text-pink-600 font-bold mt-1 block">Awaiting your reply</span>
        </Card>
        <Card className="p-5 border-slate-200/80">
          <span className="text-xs font-semibold text-slate-500 block">Active Campaigns</span>
          <p className="text-2xl font-black text-slate-900 mt-2">{stats.activeCampaigns}</p>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 block">Not yet completed</span>
        </Card>
        <Card className="p-5 border-slate-200/80">
          <span className="text-xs font-semibold text-slate-500 block">Profile Views</span>
          <p className="text-2xl font-black text-slate-900 mt-2">{Number(stats.profileViews || 0).toLocaleString('en-IN')}</p>
          <span className="text-[10px] text-slate-400 font-medium mt-1 block">Tracked by backend</span>
        </Card>
      </div>

      <Card className="p-6 border-slate-200/80 space-y-4">
        <h3 className="text-base font-bold text-slate-900">Incoming Requests</h3>
        {loading ? (
          <p className="text-xs text-slate-400">Loading requests...</p>
        ) : pendingRequests.length === 0 ? (
          <p className="text-xs text-slate-400">No pending brand invitations</p>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map((inv: any) => (
              <div key={inv._id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{inv.brandName}</span>
                  <span className="text-xs font-black text-pink-600">₹{Number(inv.proposedPrice || 0).toLocaleString('en-IN')}</span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1">{inv.campaignTitle}</p>
                <div className="flex gap-2 pt-1">
                  <button
                    disabled={busyId === inv._id}
                    onClick={() => void handleResponse(inv._id, 'accepted')}
                    className="flex-1 py-1 text-[11px] font-bold bg-[#EC4899] text-white rounded-lg disabled:opacity-60"
                  >
                    Accept
                  </button>
                  <button
                    disabled={busyId === inv._id}
                    onClick={() => void handleResponse(inv._id, 'negotiating')}
                    className="flex-1 py-1 text-[11px] font-bold bg-white border border-slate-200 text-slate-700 rounded-lg disabled:opacity-60"
                  >
                    Counter
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <Link to="/creator/requests" className="block text-center text-xs font-semibold text-purple-600 hover:underline pt-2 border-t border-slate-100">
          Manage All Requests
        </Link>
      </Card>
    </div>
  );
};
