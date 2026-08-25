import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, ShieldCheck, Sparkles, Zap, Award } from 'lucide-react';

interface AuthShellProps {
  title: string;
  subtitle?: string;
  maxWidth?: string;
  children: React.ReactNode;
}

export const AuthShell: React.FC<AuthShellProps> = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden bg-[#F8FAFC]">
      {/* Ambient Orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-3xl pointer-events-none -z-10 animate-float" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-5xl bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px] animate-scale-in">
        {/* Left Side Product Showcase (Desktop) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden hidden lg:flex">
          <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-6 relative z-10">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#EC4899] to-[#8B5CF6] flex items-center justify-center text-white shadow-lg shadow-pink-500/25">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] bg-clip-text text-transparent tracking-tight">
                CollabX
              </span>
            </Link>

            <div className="space-y-3 pt-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 text-[10px] font-black uppercase tracking-wider">
                <Sparkles className="w-3 h-3" /> Creator × Brand SaaS
              </span>
              <h2 className="text-2xl font-black tracking-tight leading-snug">
                Where Top Brands & Verified Creators Establish Impactful Partnerships.
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Streamline direct brief invitations, automated deal negotiations, milestone content reviews, and secure escrow payouts.
              </p>
            </div>
          </div>

          <div className="space-y-3 relative z-10 pt-8 border-t border-white/10">
            <div className="flex items-center gap-3 text-xs font-bold text-slate-200">
              <div className="w-7 h-7 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span>Automated Escrow Milestone Payouts</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold text-slate-200">
              <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <span>Real-Time Counter-Offer Deal Rooms</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold text-slate-200">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <span>Verified Audience & Rating Metrics</span>
            </div>
          </div>
        </div>

        {/* Right Side Form Shell */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          <div className="lg:hidden text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#EC4899] to-[#8B5CF6] flex items-center justify-center text-white shadow-md">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-xl font-black bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] bg-clip-text text-transparent">
                CollabX
              </span>
            </Link>
          </div>

          <div className="mb-6 space-y-1">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
};
