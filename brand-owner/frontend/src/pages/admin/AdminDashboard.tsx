import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import {
  Users,
  Building2,
  Megaphone,
  Briefcase,
  IndianRupee,
  ShieldCheck,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { creators, campaigns, collaborations } = useApp();

  return (
    <div className="space-y-8">
      {/* Admin Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-6 md:p-8 rounded-3xl shadow-xl">
        <div className="space-y-2">
          <Badge variant="purple" className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
            Platform Master Admin
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            CollabX Platform Control Center
          </h1>
          <p className="text-xs text-slate-300 max-w-lg">
            Monitor SaaS growth metrics, moderate brand campaigns, verify new creator profiles, and inspect active deal transactions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/users"
            className="px-5 py-3 bg-[#EC4899] hover:bg-pink-600 text-white font-bold text-xs rounded-xl transition-all shadow-lg flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Manage Users
          </Link>
          <Link
            to="/admin/reports"
            className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all border border-white/20 flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            Audit Reports
          </Link>
        </div>
      </div>

      {/* Global Admin Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <Card className="p-5 border-slate-200/80">
          <span className="text-xs font-semibold text-slate-500 block">Total Revenue</span>
          <p className="text-2xl font-black text-slate-900 mt-2">₹12,40,000</p>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 block">+24.5% MoM</span>
        </Card>

        <Card className="p-5 border-slate-200/80">
          <span className="text-xs font-semibold text-slate-500 block">Total Creators</span>
          <p className="text-2xl font-black text-[#8B5CF6] mt-2">{creators.length * 150}</p>
          <span className="text-[10px] text-slate-400 font-medium mt-1 block">Registered Influencers</span>
        </Card>

        <Card className="p-5 border-slate-200/80">
          <span className="text-xs font-semibold text-slate-500 block">Active Brands</span>
          <p className="text-2xl font-black text-[#EC4899] mt-2">1,240</p>
          <span className="text-[10px] text-slate-400 font-medium mt-1 block">Verified Accounts</span>
        </Card>

        <Card className="p-5 border-slate-200/80">
          <span className="text-xs font-semibold text-slate-500 block">Active Campaigns</span>
          <p className="text-2xl font-black text-slate-900 mt-2">{campaigns.length}</p>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 block">Live on Platform</span>
        </Card>

        <Card className="p-5 border-slate-200/80">
          <span className="text-xs font-semibold text-slate-500 block">Collaborations</span>
          <p className="text-2xl font-black text-slate-900 mt-2">{collaborations.length}</p>
          <span className="text-[10px] text-slate-400 font-medium mt-1 block">Escrow Deals</span>
        </Card>
      </div>

      {/* Verification & Moderation Desk */}
      <Card className="p-6 border-slate-200/80 space-y-4">
        <h3 className="text-base font-bold text-slate-900">Creator Verification Approvals Queue</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="pb-3">Creator Name</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Follower Reach</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {creators.map((c) => (
                <tr key={c.id}>
                  <td className="py-3 flex items-center gap-2">
                    <img src={c.avatar} alt={c.name} className="w-7 h-7 rounded-full object-cover" />
                    <span className="font-bold text-slate-900">{c.name}</span>
                  </td>
                  <td className="py-3 text-slate-600">{c.category}</td>
                  <td className="py-3 font-bold text-slate-900">
                    {(c.socials[0].followers / 1000).toFixed(0)}K
                  </td>
                  <td className="py-3">
                    <Badge variant={c.verified ? 'emerald' : 'amber'}>
                      {c.verified ? 'Verified' : 'Pending Review'}
                    </Badge>
                  </td>
                  <td className="py-3 text-right">
                    <button className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-[11px] font-bold">
                      {c.verified ? 'Verified' : 'Approve Badge'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
