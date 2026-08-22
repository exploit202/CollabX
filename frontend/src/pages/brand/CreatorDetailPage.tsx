import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { SendInvitationModal } from '../../components/modals/SendInvitationModal';
import { WriteReviewModal } from '../../components/modals/WriteReviewModal';
import { getCreatorById, reportCreator } from '../../lib/api';
import { ReportUserModal } from '../../components/modals/ReportUserModal';
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
  Sparkles,
  Eye,
  Heart,
  ArrowLeft,
  Users,
  Clock,
  Loader2,
  AlertCircle,
  Flag
} from 'lucide-react';

export const CreatorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { savedCreatorIds, toggleSaveCreator, formatCurrency } = useApp();
  const { isGuest } = useAuth();

  const [creator, setCreator] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'pricing' | 'portfolio' | 'reviews'>('overview');
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    getCreatorById(id)
      .then((res) => {
        if (res?.success && res.data) {
          setCreator(res.data);
        } else {
          setError('Creator profile not found.');
        }
      })
      .catch((err) => {
        console.error('Failed to load real creator details:', err);
        setError(err?.data?.message || err?.message || 'Failed to load creator profile details from backend.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const isSaved = creator ? savedCreatorIds.includes(creator.id || creator._id) : false;

  const getPlatformAudience = (platformName: string) => {
    if (!creator || !Array.isArray(creator.socials)) return 'Verified Reach';
    const p = (platformName || '').toLowerCase();
    const found = creator.socials.find((s: any) => s.platform.toLowerCase() === p);
    if (found) {
      return `${(found.followers / 1000).toFixed(0)}K Followers`;
    }
    const topSocial = creator.socials[0];
    return topSocial ? `${(topSocial.followers / 1000).toFixed(0)}K Followers` : 'Verified Reach';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  if (error || !creator) {
    return (
      <div className="max-w-xl mx-auto space-y-4 py-12">
        <Link
          to="/brand/discover"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Discover
        </Link>
        <Card className="p-8 text-center space-y-3 border-rose-200 bg-rose-50/50">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <h2 className="text-base font-bold text-slate-900">Unable to Load Creator Details</h2>
          <p className="text-xs text-rose-700">{error || 'The requested creator profile could not be found in MongoDB.'}</p>
        </Card>
      </div>
    );
  }

  const ratingDisplay = creator.reviewCount > 0 ? `${creator.rating} (${creator.reviewCount} reviews)` : 'No reviews yet (0.0)';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
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
            <Avatar
              src={creator.profileImage?.url || creator.userId?.profileImage || creator.avatar || null}
              name={creator.name}
              size="w-20 h-20"
              textSize="text-xl"
              className="border-2 border-slate-200 shadow-sm shrink-0"
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
                    {creator.matchScore}% AI Match
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {creator.country || 'India'}
                </span>
                <span className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-slate-400" /> {(creator.language || ['English', 'Hindi']).join(', ')}
                </span>
                <span className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {ratingDisplay}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0 justify-start md:justify-end">
            {!isGuest && (
              <>
                <button
                  onClick={() => toggleSaveCreator(creator.id || creator._id)}
                  className={`p-3 rounded-2xl border transition-all active:scale-95 cursor-pointer ${
                    isSaved ? 'bg-pink-50 border-pink-200 text-[#EC4899]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                  title={isSaved ? 'Remove from Saved' : 'Save Creator'}
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-[#EC4899]' : ''}`} />
                </button>

                <button
                  onClick={() => setShowInviteModal(true)}
                  className="flex-1 md:flex-none px-5 py-3 bg-gradient-to-r from-[#EC4899] to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-pink-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                  Send Collaboration Request
                </button>

                <button
                  onClick={() => setShowReportModal(true)}
                  className="px-3.5 py-3 bg-rose-50/80 hover:bg-rose-100 text-rose-700 border border-rose-200/80 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer shrink-0"
                  title="Report Creator Profile"
                >
                  <Flag className="w-3.5 h-3.5 text-rose-500" />
                  <span>Report</span>
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
          {(creator.socials || []).map((social: any) => (
            <div key={social.platform} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-pink-100 text-[#EC4899] flex items-center justify-center font-bold text-xs capitalize">
                {social.platform[0]}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block capitalize">
                  {social.platform}: {(social.followers / 1000).toFixed(0)}K
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
            <h3 className="text-base font-bold text-slate-900">Available Deliverable Packages ({creator.pricing?.length || 0})</h3>
            {(!creator.pricing || creator.pricing.length === 0) ? (
              <p className="text-xs text-slate-400 italic">No deliverable packages created yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {creator.pricing.map((p: any) => (
                  <div key={p.id || p._id || p.title} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 flex flex-col justify-between">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-900 block">{p.title || p.type}</span>
                      <span className="text-[10px] font-bold text-purple-600 uppercase block">{p.platform || 'Instagram'}</span>
                      <p className="text-xs text-slate-500">{p.description || 'High quality custom video deliverable.'}</p>
                    </div>
                    <div className="pt-2 flex items-center justify-between text-xs font-extrabold text-slate-900 border-t border-slate-200/60">
                      <span>{formatCurrency(p.price)}</span>
                      <span className="text-[10px] font-normal text-slate-400">{p.deliveryDays} days turnaround</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === 'pricing' && (
        <div className="space-y-4">
          {(!creator.pricing || creator.pricing.length === 0) ? (
            <Card className="p-8 text-center text-xs text-slate-400 italic">No deliverable packages available for this creator.</Card>
          ) : (
            creator.pricing.map((p: any) => (
              <Card key={p.id || p._id || p.title} className="p-5 border-slate-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 block">{p.title || p.type}</span>
                    <span className="text-[10px] font-extrabold text-[#EC4899] bg-pink-50 px-2 py-0.5 rounded-full border border-pink-200 uppercase">
                      {p.platform || 'Instagram'}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200/60">
                    <Users className="w-3 h-3 text-purple-600" /> Audience Reach: {getPlatformAudience(p.platform)}
                  </span>
                  <p className="text-xs text-slate-500 max-w-xl">{p.description || 'High quality custom video deliverable.'}</p>
                  <span className="text-[11px] text-slate-600 font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" /> Guaranteed turnaround: {p.deliveryDays} business days
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xl font-black text-slate-900 block">{formatCurrency(p.price)}</span>
                  {!isGuest && (
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="mt-2 px-4 py-2 bg-[#EC4899] hover:bg-pink-600 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <Send className="w-3 h-3" /> Select Package & Send Offer
                    </button>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === 'portfolio' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {(!creator.portfolio || creator.portfolio.length === 0) ? (
            <Card className="p-8 text-center text-xs text-slate-400 col-span-2">No portfolio items added yet.</Card>
          ) : (
            creator.portfolio.map((item: any) => (
              <Card key={item.id || item._id} hoverable className="p-4 border-slate-200/90 space-y-3">
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
            <h3 className="text-sm font-bold text-slate-900">Client Reviews ({creator.reviewCount || 0})</h3>
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
            {(!creator.reviews || creator.reviews.length === 0) ? (
              <Card className="p-8 text-center text-xs text-slate-400">No reviews yet.</Card>
            ) : (
              creator.reviews.map((rev: any) => (
                <Card key={rev.id || rev._id} className="p-4 border-slate-200/90 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Avatar src={typeof rev.reviewerAvatar === 'object' ? rev.reviewerAvatar?.url : (rev.reviewerAvatar || rev.reviewer?.profileImage?.url || rev.reviewer?.profileImage || null)} name={rev.reviewerName} size="w-7 h-7" textSize="text-[10px]" />
                      <span className="text-xs font-bold text-slate-900">{rev.reviewerName}</span>
                    </div>
                    <div className="flex items-center text-amber-500 font-bold text-xs gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400" /> {rev.rating}.0
                    </div>
                  </div>
                  <p className="text-xs text-slate-600">{rev.comment || rev.review}</p>
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
        creatorId={creator.id || creator._id}
        creatorName={creator.name}
      />
      <ReportUserModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetName={creator?.name || 'Creator'}
        targetRole="creator"
        onSubmit={async (data) => {
          const creatorId = String(creator?.id || creator?._id || creator?.userId || '');
          if (!creatorId) return;
          await reportCreator({ reportedAgainst: creatorId, ...data });
        }}
      />
    </div>
  );
};
