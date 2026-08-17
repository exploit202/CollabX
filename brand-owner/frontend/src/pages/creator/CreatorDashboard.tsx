import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import {
  Mail,
  Briefcase,
  CheckCircle2,
  FolderKanban,
  Search,
} from 'lucide-react';

export const CreatorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { invitations, collaborations, respondToInvitation } = useApp();
  const navigate = useNavigate();

  const activeCollabs = collaborations.filter((c) => c.stage !== 'completed');
  const totalEarned = collaborations
    .filter((c) => c.stage === 'completed')
    .reduce((sum, c) => sum + c.agreedPrice, 0);

  const pendingInvitations = invitations.filter((inv) => inv.status === 'pending');

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-xl">
        <div className="space-y-2">
          <Badge variant="purple" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
            Creator Studio
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, {user?.name || 'Aria'}!
          </h1>
          <p className="text-xs text-slate-300 max-w-lg">
            Review incoming brand collaboration requests, update package pricing, and upload content deliverables.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/creator/requests"
            className="px-5 py-3 bg-[#EC4899] hover:bg-pink-600 text-white font-bold text-xs rounded-xl transition-all shadow-lg flex items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            Brand Offers
          </Link>
          <Link
            to="/creator/discover"
            className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all border border-white/20 flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Discover Brands
          </Link>
          <Link
            to="/creator/portfolio"
            className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all border border-white/20 flex items-center gap-2"
          >
            <FolderKanban className="w-4 h-4" />
            Portfolio
          </Link>
        </div>
      </div>

      {/* Creator Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5 border-slate-200/80">
          <span className="text-xs font-semibold text-slate-500 block">Total Earnings</span>
          <p className="text-2xl font-black text-slate-900 mt-2">₹{totalEarned.toLocaleString('en-IN')}</p>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 block">+18% this month</span>
        </Card>

        <Card className="p-5 border-slate-200/80">
          <span className="text-xs font-semibold text-slate-500 block">Brand Invitations</span>
          <p className="text-2xl font-black text-slate-900 mt-2">{pendingInvitations.length}</p>
          <span className="text-[10px] text-pink-600 font-bold mt-1 block">Awaiting your reply</span>
        </Card>

        <Card className="p-5 border-slate-200/80">
          <span className="text-xs font-semibold text-slate-500 block">Active Campaigns</span>
          <p className="text-2xl font-black text-slate-900 mt-2">{activeCollabs.length}</p>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 block">Content in progress</span>
        </Card>

        <Card className="p-5 border-slate-200/80">
          <span className="text-xs font-semibold text-slate-500 block">Profile Views</span>
          <p className="text-2xl font-black text-slate-900 mt-2">14.2K</p>
          <span className="text-[10px] text-slate-400 font-medium mt-1 block">Last 30 days</span>
        </Card>
      </div>

      {/* Incoming Requests */}
      <Card className="p-6 border-slate-200/80 space-y-4">
          <h3 className="text-base font-bold text-slate-900">Incoming Requests</h3>
          <div className="space-y-3">
            {pendingInvitations.length === 0 ? (
              <p className="text-xs text-slate-400">No pending brand invitations</p>
            ) : (
              pendingInvitations.map((inv) => (
                <div key={inv.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{inv.brandName}</span>
                    <span className="text-xs font-black text-pink-600">₹{inv.proposedPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{inv.campaignTitle}</p>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => respondToInvitation(inv.id, 'accepted')}
                      className="flex-1 py-1 text-[11px] font-bold bg-[#EC4899] text-white rounded-lg"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => {
                        respondToInvitation(inv.id, 'negotiating');
                        navigate('/creator/negotiations');
                      }}
                      className="flex-1 py-1 text-[11px] font-bold bg-white border border-slate-200 text-slate-700 rounded-lg"
                    >
                      Counter
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          <Link
            to="/creator/requests"
            className="block text-center text-xs font-semibold text-purple-600 hover:underline pt-2 border-t border-slate-100"
          >
          Manage All Requests
        </Link>
      </Card>
    </div>
  );
};
