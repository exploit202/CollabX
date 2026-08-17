import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
} from 'lucide-react';
import { motion } from 'motion/react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { mockCreators } from '../../data/mockData';

export const LandingPage: React.FC = () => {
  const { enterGuestMode } = useAuth();
  const navigate = useNavigate();

  const handleDiscoverClick = () => {
    enterGuestMode();
    navigate('/brand/discover');
  };

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-50 border border-pink-200 text-[#EC4899] text-xs font-bold tracking-wide shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            Centralized Influencer Marketing & Negotiation SaaS
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            Connect Brands with Top Creators{' '}
            <span className="bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] bg-clip-text text-transparent">
              In Seconds
            </span>
          </h1>

          <p className="text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            CollabX empowers brands to discover verified content creators, negotiate custom campaign deliverables in real-time, and manage collaborations with end-to-end transparency.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              type="button"
              onClick={handleDiscoverClick}
              className="w-full sm:w-auto px-7 py-3.5 bg-[#EC4899] hover:bg-pink-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-pink-500/25 transition-all flex items-center justify-center gap-2 group"
            >
              Explore Creator Marketplace
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <Link
              to="/signup?role=creator"
              className="w-full sm:w-auto px-7 py-3.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-800 font-bold text-sm rounded-2xl transition-all hover:bg-slate-50 shadow-xs flex items-center justify-center gap-2"
            >
              Join as Content Creator
            </Link>
          </div>

          {/* Social Proof Stats */}
          <div className="pt-10 flex flex-wrap items-center justify-center gap-8 text-slate-500 text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 10,000+ Verified Creators
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 500+ Active SaaS Brands
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> ₹40Cr+ Creator Earnings
            </span>
          </div>
        </motion.div>

        {/* Featured Creator Cards Preview */}
        <div className="mt-14 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {mockCreators.slice(0, 3).map((creator) => (
            <Card key={creator.id} hoverable className="p-5 border-slate-200/90 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={creator.avatar}
                  alt={creator.name}
                  className="w-12 h-12 rounded-full object-cover border border-slate-200"
                />
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 truncate">{creator.name}</h4>
                  <p className="text-xs text-slate-500 truncate">{creator.category}</p>
                </div>
              </div>

              <div className="flex items-center justify-between py-2 border-y border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] font-medium">Followers</span>
                  <span className="font-extrabold text-slate-800">
                    {(creator.socials[0].followers / 1000).toFixed(0)}K
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-medium">Engagement</span>
                  <span className="font-extrabold text-emerald-600">{creator.socials[0].engagementRate}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-medium">Rating</span>
                  <span className="font-extrabold text-amber-500 flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {creator.rating}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">
                  Starts at ₹{(creator.pricing[0]?.price || 5000).toLocaleString('en-IN')}
                </span>
                <Link
                  to={`/brand/creator/${creator.id}`}
                  className="text-xs font-semibold text-[#EC4899] hover:underline flex items-center gap-1"
                >
                  View Profile <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <Badge variant="purple">Built for Modern Marketing</Badge>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Everything Brands & Creators Need to Scale
          </h2>
          <p className="text-sm text-slate-500">
            Ditch messy email threads and spreadsheets. CollabX structures the entire influencer campaign workflow in one seamless platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-6 space-y-3 hover:border-pink-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-pink-100 text-[#EC4899] flex items-center justify-center">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Advanced Creator Discovery</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Filter creators across Instagram, YouTube, and X by category, follower threshold, engagement rate, pricing, and geography.
            </p>
          </Card>

          <Card className="p-6 space-y-3 hover:border-purple-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">In-App Negotiation Room</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Send formal collaboration proposals, make real-time price counter-offers, and confirm agreed deliverables in a structured chat.
            </p>
          </Card>

          <Card className="p-6 space-y-3 hover:border-pink-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Campaign & Deliverable Tracker</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Track content submission links, review draft b-rolls, provide feedback, and leave verified ratings upon campaign completion.
            </p>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-slate-100/60 py-16 rounded-3xl">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
          <Badge variant="pink">Simple 3-Step Workflow</Badge>
          <h2 className="text-3xl font-extrabold text-slate-900">How CollabX Works</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="space-y-3 text-center md:text-left">
            <span className="w-9 h-9 rounded-xl bg-[#EC4899] text-white font-black text-sm flex items-center justify-center">
              1
            </span>
            <h4 className="text-base font-bold text-slate-900">Discover & Invite</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Brands post campaigns or browse creators directly to send tailored collaboration invitations with starting budgets.
            </p>
          </div>

          <div className="space-y-3 text-center md:text-left">
            <span className="w-9 h-9 rounded-xl bg-[#8B5CF6] text-white font-black text-sm flex items-center justify-center">
              2
            </span>
            <h4 className="text-base font-bold text-slate-900">Negotiate Terms</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Creators review campaign briefs, accept terms, or send counter-offers with customized deliverable packages.
            </p>
          </div>

          <div className="space-y-3 text-center md:text-left">
            <span className="w-9 h-9 rounded-xl bg-emerald-500 text-white font-black text-sm flex items-center justify-center">
              3
            </span>
            <h4 className="text-base font-bold text-slate-900">Execute & Review</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Creators submit live post links for brand approval and both parties leave verified marketplace reviews.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] rounded-3xl p-10 md:p-14 text-center text-white space-y-6 shadow-2xl shadow-pink-500/20">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready to Accelerate Your Influencer Campaigns?
          </h2>
          <p className="text-sm opacity-90 max-w-xl mx-auto font-medium">
            Join hundreds of brands and top content creators transforming their marketing partnerships today.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup?role=brand"
              className="px-8 py-3.5 bg-white text-slate-900 font-extrabold text-xs rounded-2xl shadow-md hover:bg-slate-100 transition-all"
            >
              Get Started as Brand
            </Link>
            <Link
              to="/signup?role=creator"
              className="px-8 py-3.5 bg-white/20 hover:bg-white/30 text-white font-extrabold text-xs rounded-2xl transition-all backdrop-blur-xs"
            >
              Sign Up as Creator
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 pt-12 border-t border-slate-200 text-slate-500 text-xs">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pb-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#EC4899] to-[#8B5CF6] flex items-center justify-center text-white">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-800">CollabX SaaS Platform</span>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <Link to="/#features" className="hover:text-slate-900">Features</Link>
            <button type="button" onClick={handleDiscoverClick} className="hover:text-slate-900">Discover Creators</button>
            <Link to="/login" className="hover:text-slate-900">Sign In</Link>
          </div>

          <p className="text-slate-400">© 2026 CollabX. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
