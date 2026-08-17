import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  ArrowRight,
  Search,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  Zap,
  Star,
  CheckCircle2,
  ChevronRight,
  Layers,
  Award,
  Users,
  Building2,
  DollarSign
} from 'lucide-react';
import { motion } from 'motion/react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { mockCreators } from '../../data/mockData';

export const LandingPage: React.FC = () => {
  const { enterGuestMode } = useAuth();
  const { formatCurrency } = useApp();
  const navigate = useNavigate();

  const handleDiscoverClick = () => {
    enterGuestMode();
    navigate('/brand/discover');
  };

  return (
    <div className="space-y-24 pb-20 overflow-hidden">
      {/* Background Decorative Blur Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-96 h-96 rounded-full bg-gradient-to-tr from-pink-500/15 to-purple-500/10 blur-3xl" />
        <div className="absolute top-20 right-1/4 w-80 h-80 rounded-full bg-gradient-to-br from-indigo-500/15 to-pink-500/10 blur-3xl" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mx-auto space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200/80 text-[#EC4899] text-xs font-extrabold tracking-wide shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            Centralized Influencer Marketing & Negotiation SaaS
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            Connect Brands with Top Creators{' '}
            <span className="bg-gradient-to-r from-[#EC4899] via-purple-600 to-[#8B5CF6] bg-clip-text text-transparent">
              In Seconds
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            CollabX empowers brands to discover verified content creators, negotiate custom campaign deliverables in real-time, and manage active collaborations with escrow protection.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <button
              type="button"
              onClick={handleDiscoverClick}
              className="w-full sm:w-auto px-7 py-3.5 bg-[#EC4899] hover:bg-pink-600 active:scale-98 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-pink-500/25 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              Explore Creator Marketplace
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <Link
              to="/signup?role=creator"
              className="w-full sm:w-auto px-7 py-3.5 bg-white border border-slate-200/90 hover:border-slate-300 text-slate-800 font-bold text-sm rounded-2xl transition-all hover:bg-slate-50 shadow-2xs flex items-center justify-center gap-2"
            >
              Join as Content Creator
            </Link>
          </div>

          {/* Social Proof Stats */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-slate-500 text-xs font-semibold">
            <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200/60">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 10,000+ Verified Creators
            </span>
            <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200/60">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 500+ Active SaaS Brands
            </span>
            <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200/60">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {formatCurrency(40000000)} Creator Earnings
            </span>
          </div>
        </motion.div>

        {/* Featured Creator Cards Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-14 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-left"
        >
          {mockCreators.slice(0, 3).map((creator) => (
            <Card key={creator.id} hoverable glass className="p-5 animate-fade-in">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={creator.avatar}
                  alt={creator.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white ring-2 ring-slate-100 shadow-2xs shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{creator.name}</h4>
                    {creator.verified && <CheckCircle2 className="w-3.5 h-3.5 text-pink-500 fill-pink-50 shrink-0" />}
                  </div>
                  <p className="text-xs text-slate-500 truncate">{creator.category}</p>
                </div>
              </div>

              <div className="flex items-center justify-between py-2.5 px-3 bg-slate-50/80 rounded-xl border border-slate-100 text-xs my-2">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Followers</span>
                  <span className="font-extrabold text-slate-900">
                    {(creator.socials[0].followers / 1000).toFixed(0)}K
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Engagement</span>
                  <span className="font-extrabold text-emerald-600">{creator.socials[0].engagementRate}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Rating</span>
                  <span className="font-extrabold text-amber-500 flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {creator.rating}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">
                  Starts at {formatCurrency(creator.pricing[0]?.price || 5000)}
                </span>
                <Link
                  to={`/brand/creator/${creator.id}`}
                  className="text-xs font-bold text-[#EC4899] hover:underline flex items-center gap-1"
                >
                  View Profile <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </Card>
          ))}
        </motion.div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <Badge variant="purple">Built for Modern Marketing</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Everything Brands & Creators Need to Scale
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Ditch messy email threads and spreadsheets. CollabX structures the entire influencer campaign workflow in one seamless platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card glass hoverable className="p-6 space-y-3 border-pink-100">
            <div className="w-11 h-11 rounded-2xl bg-pink-100/80 text-[#EC4899] flex items-center justify-center shadow-2xs">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Advanced Creator Discovery</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Filter creators across Instagram, YouTube, and X by category, follower threshold, engagement rate, pricing, and geography.
            </p>
          </Card>

          <Card glass hoverable className="p-6 space-y-3 border-purple-100">
            <div className="w-11 h-11 rounded-2xl bg-purple-100/80 text-purple-600 flex items-center justify-center shadow-2xs">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">In-App Negotiation Room</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Send formal collaboration proposals, make real-time price counter-offers, and confirm agreed deliverables in a structured chat.
            </p>
          </Card>

          <Card glass hoverable className="p-6 space-y-3 border-emerald-100">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center shadow-2xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Campaign & Deliverable Tracker</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Track content submission links, review draft b-rolls, provide feedback, and release escrow payouts upon campaign completion.
            </p>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-slate-100/80 py-16 rounded-3xl border border-slate-200/70 shadow-2xs">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
          <Badge variant="pink">Simple 3-Step Workflow</Badge>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">How CollabX Works</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="space-y-3 text-center md:text-left bg-white p-6 rounded-2xl border border-slate-200/60 shadow-2xs">
            <span className="w-10 h-10 rounded-xl bg-[#EC4899] text-white font-black text-sm flex items-center justify-center shadow-2xs">
              1
            </span>
            <h4 className="text-base font-bold text-slate-900">Discover & Invite</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Brands post campaigns or browse creators directly to send tailored collaboration invitations with starting budgets.
            </p>
          </div>

          <div className="space-y-3 text-center md:text-left bg-white p-6 rounded-2xl border border-slate-200/60 shadow-2xs">
            <span className="w-10 h-10 rounded-xl bg-[#8B5CF6] text-white font-black text-sm flex items-center justify-center shadow-2xs">
              2
            </span>
            <h4 className="text-base font-bold text-slate-900">Negotiate Terms</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Creators review campaign briefs, accept terms, or send counter-offers with customized deliverable packages.
            </p>
          </div>

          <div className="space-y-3 text-center md:text-left bg-white p-6 rounded-2xl border border-slate-200/60 shadow-2xs">
            <span className="w-10 h-10 rounded-xl bg-emerald-500 text-white font-black text-sm flex items-center justify-center shadow-2xs">
              3
            </span>
            <h4 className="text-base font-bold text-slate-900">Execute & Review</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Creators submit live post links for brand approval and both parties leave verified marketplace reviews.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Banner Section */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-gradient-to-r from-[#EC4899] via-purple-600 to-[#8B5CF6] rounded-3xl p-10 md:p-14 text-center text-white space-y-6 shadow-2xl shadow-pink-500/20">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready to Accelerate Your Influencer Campaigns?
          </h2>
          <p className="text-sm opacity-90 max-w-xl mx-auto font-medium leading-relaxed">
            Join hundreds of brands and top content creators transforming their marketing partnerships today.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup?role=brand"
              className="px-8 py-3.5 bg-white text-slate-900 font-extrabold text-xs rounded-2xl shadow-md hover:bg-slate-100 active:scale-98 transition-all"
            >
              Get Started as Brand
            </Link>
            <Link
              to="/signup?role=creator"
              className="px-8 py-3.5 bg-white/20 hover:bg-white/30 text-white font-extrabold text-xs rounded-2xl transition-all backdrop-blur-xs border border-white/30 active:scale-98"
            >
              Sign Up as Creator
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 pt-12 border-t border-slate-200/80 text-slate-500 text-xs">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pb-8">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#EC4899] to-[#8B5CF6] flex items-center justify-center text-white shadow-2xs">
              <Layers className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-slate-900">CollabX SaaS Platform</span>
          </div>

          <div className="flex items-center gap-6 font-semibold">
            <Link to="/#features" className="hover:text-slate-900 transition-colors">Features</Link>
            <button type="button" onClick={handleDiscoverClick} className="hover:text-slate-900 transition-colors cursor-pointer">Discover Creators</button>
            <Link to="/login" className="hover:text-slate-900 transition-colors">Sign In</Link>
          </div>

          <p className="text-slate-400 font-medium">© 2026 CollabX. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
