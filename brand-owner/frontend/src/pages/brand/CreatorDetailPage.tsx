import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { SendInvitationModal } from '../../components/modals/SendInvitationModal';
import { WriteReviewModal } from '../../components/modals/WriteReviewModal';
import {
  Star,
  CheckCircle2,
  MapPin,
  Globe,
  Send,
  Bookmark,
  Instagram,
  Youtube,
  Twitter,
  Linkedin,
  Sparkles,
  Eye,
  Heart,
  MessageSquare,
  ArrowLeft,
} from 'lucide-react';

export const CreatorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { creators, savedCreatorIds, toggleSaveCreator } = useApp();
  const { isGuest } = useAuth();

  const creator = creators.find((c) => c.id === id) || creators[0];
  const isSaved = savedCreatorIds.includes(creator.id);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'pricing' | 'portfolio' | 'reviews'>('overview');

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        to="/brand/discover"
        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Discover
      </Link>

      {/* Profile Header */}
      <Card className="p-6 md:p-8 border-slate-200/90 shadow-md relative">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start md:items-center gap-5">
            <img
              src={creator.avatar}
              alt={creator.name}
              className="w-20 h-20 rounded-full object-cover border-2 border-slate-200 shadow-sm shrink-0"
            />
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900">{creator.name}</h1>
                {creator.verified && <CheckCircle2 className="w-5 h-5 text-pink-500 fill-pink-50" />}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <Badge variant="purple">{creator.category}</Badge>
                {creator.matchScore && (
                  <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full font-bold text-[10px] shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                    {creator.matchScore}% AI Match ({creator.matchReasons?.join(', ')})
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {creator.country}
                </span>
                <span className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-slate-400" /> {creator.language.join(', ')}
                </span>
                <span className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {creator.rating} ({creator.reviewCount} reviews)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {!isGuest && (
            <>
            <button
              onClick={() => toggleSaveCreator(creator.id)}
              className={`p-3 rounded-2xl border transition-all ${
                isSaved ? 'bg-pink-50 border-pink-200 text-[#EC4899]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-[#EC4899]' : ''}`} />
            </button>

            <button
              onClick={() => setShowInviteModal(true)}
              className="flex-1 md:flex-none px-6 py-3 bg-[#EC4899] hover:bg-pink-600 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send Collaboration Request
            </button>
            </>
            )}
            {isGuest && (
              <Link
                to="/login"
                className="flex-1 md:flex-none px-6 py-3 bg-[#EC4899] hover:bg-pink-600 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                Sign In to Collaborate
              </Link>
            )}
          </div>
        </div>

        {/* Social Accounts Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
          {creator.socials.map((social) => (
            <div key={social.platform} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-pink-100 text-[#EC4899] flex items-center justify-center font-bold text-xs capitalize">
                {social.platform[0]}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  {(social.followers / 1000).toFixed(0)}K
                </span>
                <span className="text-[10px] text-slate-400 block font-medium">
                  {social.engagementRate}% Eng. Rate
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Tabs navigation */}
      <div className="flex border-b border-slate-200 text-xs font-semibold gap-4 sm:gap-6 overflow-x-auto scrollbar-none pb-0.5">
        {(['overview', 'pricing', 'portfolio', 'reviews'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 capitalize border-b-2 transition-all ${
              activeTab === tab
                ? 'border-[#EC4899] text-[#EC4899] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <Card className="p-6 border-slate-200/90 space-y-3">
            <h3 className="text-base font-bold text-slate-900">About Creator</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{creator.bio}</p>
          </Card>

          <Card className="p-6 border-slate-200/90 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Popular Deliverable Packages</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {creator.pricing.map((p) => (
                <div key={p.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-900 block">{p.type}</span>
                  <p className="text-xs text-slate-500">{p.description}</p>
                  <div className="pt-2 flex items-center justify-between text-xs font-extrabold text-slate-900">
                    <span>₹{p.price.toLocaleString('en-IN')}</span>
                    <span className="text-[10px] font-normal text-slate-400">{p.deliveryDays} days turnaround</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'pricing' && (
        <div className="space-y-4">
          {creator.pricing.map((p) => (
            <Card key={p.id} className="p-5 border-slate-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-sm font-bold text-slate-900 block">{p.type}</span>
                <p className="text-xs text-slate-500 max-w-xl">{p.description}</p>
                <span className="text-[11px] text-pink-600 font-medium block">
                  Guaranteed turnaround: {p.deliveryDays} days
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xl font-black text-slate-900 block">₹{p.price.toLocaleString('en-IN')}</span>
                {!isGuest && (
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="mt-2 px-4 py-2 bg-[#EC4899] text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Select Package
                </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'portfolio' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {creator.portfolio.length === 0 ? (
            <p className="text-xs text-slate-400 col-span-2">No portfolio items added yet.</p>
          ) : (
            creator.portfolio.map((item) => (
              <Card key={item.id} hoverable className="p-4 border-slate-200/90 space-y-3">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-48 object-cover rounded-xl border border-slate-100"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.description}</p>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <Eye className="w-3.5 h-3.5 text-slate-400" /> {item.views} views
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <Heart className="w-3.5 h-3.5 text-rose-400" /> {item.likes} likes
                  </span>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Client Reviews ({creator.reviews.length})</h3>
            {!isGuest && (
            <button
              onClick={() => setShowReviewModal(true)}
              className="px-3.5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
            >
              Write Review
            </button>
            )}
          </div>

          <div className="space-y-3">
            {creator.reviews.length === 0 ? (
              <p className="text-xs text-slate-400">No reviews yet.</p>
            ) : (
              creator.reviews.map((rev) => (
                <Card key={rev.id} className="p-4 border-slate-200/90 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img src={rev.reviewerAvatar} alt={rev.reviewerName} className="w-7 h-7 rounded-full object-cover" />
                      <span className="text-xs font-bold text-slate-900">{rev.reviewerName}</span>
                    </div>
                    <div className="flex items-center text-amber-500 font-bold text-xs gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400" /> {rev.rating}.0
                    </div>
                  </div>
                  <p className="text-xs text-slate-600">{rev.comment}</p>
                  <span className="text-[10px] text-slate-400 block">{rev.date}</span>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      <SendInvitationModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        creator={creator}
      />

      <WriteReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        creatorId={creator.id}
        creatorName={creator.name}
      />
    </div>
  );
};
