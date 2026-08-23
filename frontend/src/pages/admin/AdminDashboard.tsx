import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Users,
  RefreshCw,
  ShieldCheck,
  Building2,
  Megaphone,
  Briefcase,
  DollarSign,
  Sparkles,
  CheckCircle2,
  UserCheck
} from 'lucide-react';
import { getAdminDashboard, updateAdminUserVerification } from '../../lib/api';
import { useApp } from '../../context/AppContext';

export const AdminDashboard: React.FC = () => {
  const { addToast, formatCurrency } = useApp();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getAdminDashboard();
      if (res?.success) {
        setData(res.data);
      }
    } catch (e: any) {
      addToast('error', 'Dashboard load failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const st = data?.stats || {};

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Command Center Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-7 md:p-9 rounded-3xl shadow-2xl border border-slate-800">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-[#EC4899]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-black uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" /> Platform Master Command Center
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              CollabX System Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              Live platform metrics, user moderation queues, verification requests, and overall collaboration volume.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/admin/users"
              className="px-5 py-3 bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] hover:opacity-95 text-white font-bold text-xs rounded-2xl transition-all shadow-lg hover:shadow-pink-500/25 flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <Users className="w-4 h-4" /> Manage Users
            </Link>
            <button
              onClick={loadData}
              className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl border border-white/20 backdrop-blur-md transition-all active:scale-95 cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <SkeletonLoader variant="stat" count={5} />
          <SkeletonLoader variant="card" count={1} />
        </div>
      ) : (
        <>
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
            <Card className="p-5 border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Platform Revenue</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl font-black text-slate-900 mt-2">
                {formatCurrency(st.totalRevenue || 0)}
              </p>
              <span className="text-[10px] text-emerald-600 font-bold mt-1 block">Live DB Escrow Volume</span>
            </Card>

            <Card className="p-5 border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Creators</span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl font-black text-slate-900 mt-2">{st.totalCreators || 0}</p>
              <span className="text-[10px] text-purple-600 font-bold mt-1 block">Registered Creators</span>
            </Card>

            <Card className="p-5 border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Active Brands</span>
                <div className="w-8 h-8 rounded-xl bg-pink-50 text-[#EC4899] flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl font-black text-slate-900 mt-2">{st.activeBrands || 0}</p>
              <span className="text-[10px] text-pink-600 font-bold mt-1 block">Company Workspaces</span>
            </Card>

            <Card className="p-5 border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Campaigns</span>
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Megaphone className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl font-black text-slate-900 mt-2">{st.totalCampaigns || 0}</p>
              <span className="text-[10px] text-sky-600 font-bold mt-1 block">Total Campaign Briefs</span>
            </Card>

            <Card className="p-5 border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Collaborations</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl font-black text-slate-900 mt-2">{st.totalCollaborations || 0}</p>
              <span className="text-[10px] text-amber-600 font-bold mt-1 block">Total Active Deals</span>
            </Card>
          </div>

          {/* Pending Creator Verifications Card */}
          <Card className="p-6 border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight">Creator Verification Approvals Queue</h3>
                <p className="text-xs text-slate-500 font-medium">Review and issue official verified badges to qualified creators.</p>
              </div>
              <Badge variant="amber" dot pulse>
                {data?.pendingCreators?.length || 0} Pending
              </Badge>
            </div>

            {(!data?.pendingCreators || data.pendingCreators.length === 0) ? (
              <EmptyState
                icon={UserCheck}
                title="Queue Empty"
                description="No creators are currently waiting for verification approval."
                variant="card"
              />
            ) : (
              <div className="divide-y divide-slate-100 overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="text-[10px] font-black uppercase tracking-wider text-slate-400 pb-2">
                      <th className="py-2">Creator Name</th>
                      <th className="py-2">Email</th>
                      <th className="py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.pendingCreators.map((u: any) => (
                      <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 font-bold text-slate-900">{u.fullName || u.name}</td>
                        <td className="py-3 text-slate-500 font-medium">{u.email}</td>
                        <td className="py-3 text-right">
                          <button
                            onClick={async () => {
                              try {
                                await updateAdminUserVerification(u._id, true);
                                addToast('success', 'Creator verified successfully!');
                                loadData();
                              } catch (e: any) {
                                addToast('error', 'Verification failed', e.message);
                              }
                            }}
                            className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-extrabold text-[11px] rounded-xl transition-all shadow-xs flex items-center gap-1.5 ml-auto cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve Badge
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};
