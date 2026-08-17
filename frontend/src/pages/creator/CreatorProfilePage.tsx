import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Avatar } from '../../components/common/Avatar';
import {
  Save,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Instagram,
  Youtube,
  Twitter,
  Mail,
  Tag,
  FileText,
  Globe,
  LucideIcon,
  BarChart3,
  AlertTriangle,
  Info,
  MapPin,
  Plus,
  X,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { getCreatorProfile, updateCreatorProfile, verifyCreatorPlatformUrl } from '../../lib/api';

const NICHE_OPTIONS = [
  'Tech & Gadgets',
  'Fashion & Lifestyle',
  'Fitness & Wellness',
  'Gaming',
  'Travel',
  'Beauty & Skincare',
];

type PlatformKey = 'instagram' | 'youtube' | 'twitter';

const PLATFORM_META: Record<
  PlatformKey,
  { label: string; icon: LucideIcon; color: string; bg: string; metricName: string; placeholder: string }
> = {
  instagram: {
    label: 'Instagram',
    icon: Instagram,
    color: 'text-pink-600',
    bg: 'bg-pink-50 text-pink-700 border-pink-200',
    metricName: 'Reel Views',
    placeholder: 'https://instagram.com/yourusername'
  },
  youtube: {
    label: 'YouTube',
    icon: Youtube,
    color: 'text-red-600',
    bg: 'bg-red-50 text-red-700 border-red-200',
    metricName: 'Channel Views',
    placeholder: 'https://youtube.com/@yourchannel'
  },
  twitter: {
    label: 'Twitter / X',
    icon: Twitter,
    color: 'text-sky-600',
    bg: 'bg-sky-50 text-sky-700 border-sky-200',
    metricName: 'Impressions',
    placeholder: 'https://twitter.com/yourusername'
  },
};

export const CreatorProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useApp();
  const [profileData, setProfileData] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);

  const [niche, setNiche] = useState<string>(NICHE_OPTIONS[0]);
  const [bio, setBio] = useState<string>('');
  const [locationCity, setLocationCity] = useState<string>('Pune');
  const [locationCountry, setLocationCountry] = useState<string>('India');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [metricError, setMetricError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Platform Audience Metrics state
  const [youtubeMetrics, setYoutubeMetrics] = useState({ subscribers: '', averageViews: '', engagementRate: '' });
  const [instagramMetrics, setInstagramMetrics] = useState({ followers: '', averageReelViews: '', engagementRate: '' });
  const [twitterMetrics, setTwitterMetrics] = useState({ followers: '', averageImpressions: '', engagementRate: '' });

  // Add Platform Modal UI state
  const [showAddPlatformModal, setShowAddPlatformModal] = useState(false);
  const [addPlatformKey, setAddPlatformKey] = useState<PlatformKey>('youtube');
  const [addPlatformLink, setAddPlatformLink] = useState('');
  const [isVerifyingPlatform, setIsVerifyingPlatform] = useState(false);
  const [platformVerifyError, setPlatformVerifyError] = useState<string | null>(null);
  const [platformVerifySuccess, setPlatformVerifySuccess] = useState<string | null>(null);
  const [customPlatformsList, setCustomPlatformsList] = useState<{ key: PlatformKey; link: string }[]>([]);

  const fetchProfile = async () => {
    try {
      const res = await getCreatorProfile();
      if (res.success && (res.data?.profile || res.data?.user)) {
        const p = res.data.profile || {};
        const u = res.data.user || {};
        setProfileData(p);
        setUserData(u);

        const currentNiche =
          (Array.isArray(p.niche) && p.niche[0]) ||
          p.primaryContentNiche ||
          NICHE_OPTIONS[0];

        setNiche(currentNiche);
        setBio(p.bio || '');
        setLocationCity(p.location?.city || 'Pune');
        setLocationCountry(p.location?.country || 'India');

        if (p.audienceMetrics) {
          if (p.audienceMetrics.youtube) {
            setYoutubeMetrics({
              subscribers: p.audienceMetrics.youtube.subscribers ?? '',
              averageViews: p.audienceMetrics.youtube.averageViews ?? '',
              engagementRate: p.audienceMetrics.youtube.engagementRate ?? ''
            });
          }
          if (p.audienceMetrics.instagram) {
            setInstagramMetrics({
              followers: p.audienceMetrics.instagram.followers ?? '',
              averageReelViews: p.audienceMetrics.instagram.averageReelViews ?? '',
              engagementRate: p.audienceMetrics.instagram.engagementRate ?? ''
            });
          }
          if (p.audienceMetrics.twitter) {
            setTwitterMetrics({
              followers: p.audienceMetrics.twitter.followers ?? '',
              averageImpressions: p.audienceMetrics.twitter.averageImpressions ?? '',
              engagementRate: p.audienceMetrics.twitter.engagementRate ?? ''
            });
          }
        }

        // Initialize platforms list
        const initialPlatforms: { key: PlatformKey; link: string }[] = [];
        if (Array.isArray(p.platforms) && p.platforms.length > 0) {
          p.platforms.forEach((item: any) => {
            const k = (typeof item === 'string' ? item : item?.platform)?.toLowerCase() as PlatformKey;
            if (k && PLATFORM_META[k]) {
              initialPlatforms.push({
                key: k,
                link: typeof item === 'object' ? item.link || '' : ''
              });
            }
          });
        } else if (p.socialLinks || p.platformLinks) {
          const linksObj = { ...p.platformLinks, ...p.socialLinks };
          (['instagram', 'youtube', 'twitter'] as PlatformKey[]).forEach((k) => {
            if (linksObj[k]) {
              initialPlatforms.push({ key: k, link: linksObj[k] });
            }
          });
        }
        if (initialPlatforms.length === 0) {
          initialPlatforms.push({ key: 'instagram', link: 'https://instagram.com/creator' });
        }
        setCustomPlatformsList(initialPlatforms);

        if (u.fullName || u.email) {
          setUserData({ ...u, avatar: u.profileImage });
        }
      }
    } catch (err) {
      console.error('Failed to fetch creator profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const selectedPlatforms = customPlatformsList;
  const ALL_SUPPORTED_PLATFORMS: PlatformKey[] = ['youtube', 'instagram', 'twitter'];
  const connectedPlatformKeys = customPlatformsList.map((p) => p.key);
  const availablePlatformKeys = ALL_SUPPORTED_PLATFORMS.filter((key) => !connectedPlatformKeys.includes(key));

  const isPlatformComplete = (key: PlatformKey) => {
    if (key === 'youtube') {
      return youtubeMetrics.subscribers !== '' && youtubeMetrics.averageViews !== '' && youtubeMetrics.engagementRate !== '';
    }
    if (key === 'instagram') {
      return instagramMetrics.followers !== '' && instagramMetrics.averageReelViews !== '' && instagramMetrics.engagementRate !== '';
    }
    if (key === 'twitter') {
      return twitterMetrics.followers !== '' && twitterMetrics.averageImpressions !== '' && twitterMetrics.engagementRate !== '';
    }
    return false;
  };

  const isAudienceComplete = selectedPlatforms.length > 0 && selectedPlatforms.every(({ key }) => isPlatformComplete(key));
  const hasLocation = Boolean(locationCity.trim() && locationCountry.trim());
  const hasNiche = Boolean(niche);
  const hasBio = Boolean(bio.trim());

  // Calculate Profile Completion Score
  const completionCriteria = [
    { label: 'Social Platform & Links', met: selectedPlatforms.length > 0, weight: 25 },
    { label: 'Audience Metrics', met: isAudienceComplete, weight: 25 },
    { label: 'Location Details', met: hasLocation, weight: 25 },
    { label: 'Content Niche & Bio', met: hasNiche && hasBio, weight: 25 }
  ];

  const completionPercentage = completionCriteria.reduce((sum, item) => sum + (item.met ? item.weight : 0), 0);

  const validateMetrics = () => {
    setMetricError(null);

    const checkMetric = (val: any, label: string, isRate = false) => {
      if (val === '' || val === null || val === undefined) return true;
      const num = Number(val);
      if (isNaN(num)) {
        setMetricError(`${label} must be a valid number.`);
        return false;
      }
      if (num < 0) {
        setMetricError(`${label} cannot be negative.`);
        return false;
      }
      if (isRate && num > 100) {
        setMetricError(`${label} percentage cannot exceed 100%.`);
        return false;
      }
      return true;
    };

    if (selectedPlatforms.some((p) => p.key === 'youtube')) {
      if (!checkMetric(youtubeMetrics.subscribers, 'YouTube Subscribers')) return false;
      if (!checkMetric(youtubeMetrics.averageViews, 'YouTube Avg. Views')) return false;
      if (!checkMetric(youtubeMetrics.engagementRate, 'YouTube Engagement Rate', true)) return false;
    }
    if (selectedPlatforms.some((p) => p.key === 'instagram')) {
      if (!checkMetric(instagramMetrics.followers, 'Instagram Followers')) return false;
      if (!checkMetric(instagramMetrics.averageReelViews, 'Instagram Avg. Reel Views')) return false;
      if (!checkMetric(instagramMetrics.engagementRate, 'Instagram Engagement Rate', true)) return false;
    }
    if (selectedPlatforms.some((p) => p.key === 'twitter')) {
      if (!checkMetric(twitterMetrics.followers, 'Twitter Followers')) return false;
      if (!checkMetric(twitterMetrics.averageImpressions, 'Twitter Avg. Impressions')) return false;
      if (!checkMetric(twitterMetrics.engagementRate, 'Twitter Engagement Rate', true)) return false;
    }

    return true;
  };

  const handleOpenAddPlatformModal = () => {
    if (availablePlatformKeys.length === 0) return;
    setAddPlatformKey(availablePlatformKeys[0]);
    setAddPlatformLink('');
    setPlatformVerifyError(null);
    setPlatformVerifySuccess(null);
    setShowAddPlatformModal(true);
  };

  const handleAddPlatformSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addPlatformKey) return;
    const rawLink = addPlatformLink.trim();

    if (!rawLink) {
      setPlatformVerifyError('Please enter your channel/profile link.');
      return;
    }

    setIsVerifyingPlatform(true);
    setPlatformVerifyError(null);
    setPlatformVerifySuccess(null);

    try {
      // Call backend verification endpoint
      const res = await verifyCreatorPlatformUrl(addPlatformKey, rawLink);

      if (res?.success && res.data?.verified) {
        const verifiedUrl = res.data.url || rawLink;
        setCustomPlatformsList((prev) => [
          ...prev.filter((item) => item.key !== addPlatformKey),
          { key: addPlatformKey, link: verifiedUrl }
        ]);

        const platformName = PLATFORM_META[addPlatformKey]?.label || addPlatformKey;
        setPlatformVerifySuccess(`${platformName} profile link verified successfully!`);
        addToast('success', `${platformName} Verified!`, 'Platform link verified and added to your profile.');

        setTimeout(() => {
          setAddPlatformLink('');
          setPlatformVerifySuccess(null);
          setShowAddPlatformModal(false);
        }, 1000);
      } else {
        setPlatformVerifyError(
          `We couldn't verify this ${PLATFORM_META[addPlatformKey]?.label || addPlatformKey} account. Please check the link and try again.`
        );
      }
    } catch (err: any) {
      const errorMsg =
        err?.data?.message ||
        err?.message ||
        `We couldn't verify this ${PLATFORM_META[addPlatformKey]?.label || addPlatformKey} channel/profile. Please check the link and try again.`;
      setPlatformVerifyError(errorMsg);
    } finally {
      setIsVerifyingPlatform(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateMetrics()) return;

    setIsSubmitting(true);
    setSuccessMsg('');

    const parseNum = (val: any) => (val === '' || val === null || val === undefined ? null : Number(val));

    const audienceMetricsPayload = {
      youtube: {
        subscribers: parseNum(youtubeMetrics.subscribers),
        averageViews: parseNum(youtubeMetrics.averageViews),
        engagementRate: parseNum(youtubeMetrics.engagementRate)
      },
      instagram: {
        followers: parseNum(instagramMetrics.followers),
        averageReelViews: parseNum(instagramMetrics.averageReelViews),
        engagementRate: parseNum(instagramMetrics.engagementRate)
      },
      twitter: {
        followers: parseNum(twitterMetrics.followers),
        averageImpressions: parseNum(twitterMetrics.averageImpressions),
        engagementRate: parseNum(twitterMetrics.engagementRate)
      }
    };

    const platformsPayload = customPlatformsList.map((item) => ({
      platform: item.key,
      link: item.link
    }));

    try {
      const res = await updateCreatorProfile({
        primaryContentNiche: niche,
        bio,
        location: {
          city: locationCity.trim(),
          country: locationCountry.trim()
        },
        platforms: platformsPayload,
        audienceMetrics: audienceMetricsPayload
      });

      if (res.success) {
        setSuccessMsg('Creator profile updated successfully!');
        addToast('success', 'Profile Saved!', 'Your changes have been saved.');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err: any) {
      setMetricError(err?.message || 'Failed to update creator profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  const displayName = userData?.fullName || user?.fullName || 'Content Creator';
  const displayEmail = userData?.email || user?.email || '';
  const displayAvatar = userData?.avatar || user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Creator Profile</h1>
        <p className="text-xs text-slate-500">Manage your public creator bio, connected platforms, and audience metrics.</p>
      </div>

      {/* Completion Banner */}
      <Card className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border-none shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-lg">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-pink-500/20 text-pink-300 font-bold text-[10px] uppercase rounded-full border border-pink-500/30">
                Profile Status
              </span>
              <span className="text-xs font-bold text-slate-300">
                {completionPercentage === 100 ? '100% Complete — Ready for Collaborations' : `${completionPercentage}% Completed`}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white">
              {completionPercentage === 100 ? 'Your Creator Profile is Fully Complete!' : 'Complete your profile to unlock Brand Deals'}
            </h2>
            <p className="text-xs text-slate-300">
              {completionPercentage === 100
                ? 'Your location, connected platforms, and audience metrics are verified and visible to discovering brands.'
                : 'Brands filter creators by verified platforms, location, and subscriber/follower counts.'}
            </p>

            {/* Criteria checklist */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              {completionCriteria.map((c) => (
                <div key={c.label} className="flex items-center gap-1.5 text-[11px] font-medium text-slate-300">
                  {c.met ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  )}
                  <span className={c.met ? 'text-white font-semibold' : 'text-slate-400'}>{c.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end justify-center shrink-0 border-t md:border-t-0 md:border-l border-slate-700/60 pt-4 md:pt-0 md:pl-6">
            <div className="text-center md:text-right mb-2">
              <span className="text-3xl font-black text-pink-400">{completionPercentage}%</span>
              <span className="text-[10px] block font-semibold text-slate-400 uppercase">Completion Rate</span>
            </div>

            <div className="w-32 bg-slate-700/80 rounded-full h-2 overflow-hidden mb-3">
              <div className="bg-gradient-to-r from-pink-500 to-rose-400 h-full transition-all duration-500" style={{ width: `${completionPercentage}%` }} />
            </div>

            {completionPercentage < 100 && (
              <a
                href="#profile-form"
                className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                Complete Profile <ArrowRight className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </Card>

      {/* Main Profile Card */}
      <Card className="p-6 md:p-8 border-slate-200/90 shadow-md">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <Avatar src={displayAvatar} alt={displayName} size="lg" className="border-2 border-pink-500/20" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900">{displayName}</h2>
              {user?.isVerified && <CheckCircle2 className="w-4 h-4 text-pink-500 fill-pink-50" />}
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 font-medium">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> {displayEmail}
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Account Verified
              </span>
            </div>
          </div>
        </div>

        {/* Global Messages */}
        {successMsg && (
          <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {successMsg}
          </div>
        )}
        {metricError && (
          <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
            {metricError}
          </div>
        )}

        <form id="profile-form" onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Section 1: Basic Profile */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-pink-500" /> Primary Content Niche & Bio
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Content Category / Niche</label>
                <select
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                  disabled={isSubmitting}
                >
                  {NICHE_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location (City & Country)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="City (e.g. Pune)"
                    value={locationCity}
                    onChange={(e) => setLocationCity(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                    disabled={isSubmitting}
                  />
                  <input
                    type="text"
                    placeholder="Country (e.g. India)"
                    value={locationCountry}
                    onChange={(e) => setLocationCountry(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Creator Bio</label>
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Describe your content style, audience engagement, and brand collaboration focus..."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                disabled={isSubmitting}
              />
            </div>

            {/* Selected Social Platforms with Add Platform Option */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-pink-500" /> Selected Social Platforms
                </label>
                {availablePlatformKeys.length > 0 ? (
                  <button
                    type="button"
                    onClick={handleOpenAddPlatformModal}
                    className="px-2.5 py-1 text-[11px] font-bold text-pink-600 bg-pink-50 border border-pink-200 rounded-lg hover:bg-pink-100 transition-all flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Platform
                  </button>
                ) : (
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                    All platforms connected
                  </span>
                )}
              </div>

              {selectedPlatforms.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No social platforms selected. Click "+ Add Platform" to add one.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedPlatforms.map(({ key, link }) => {
                    const meta = PLATFORM_META[key];
                    if (!meta) return null;
                    const Icon = meta.icon;
                    return (
                      <div
                        key={key}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border ${meta.bg}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{meta.label}</span>
                        <span className="text-[10px] font-normal text-slate-500 max-w-[120px] truncate">{link}</span>
                        <span className="text-[9px] font-black text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-md">Verified</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Platform Audience Metrics */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-pink-500" /> Platform Audience & Engagement Metrics
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Manually enter your platform metrics below. Brands use these numbers to evaluate deliverable package reach.
              </p>
            </div>

            {selectedPlatforms.map(({ key }) => {
              const meta = PLATFORM_META[key];
              if (!meta) return null;
              const Icon = meta.icon;

              const metricsState =
                key === 'youtube'
                  ? youtubeMetrics
                  : key === 'instagram'
                  ? instagramMetrics
                  : twitterMetrics;

              const setMetricsState =
                key === 'youtube'
                  ? setYoutubeMetrics
                  : key === 'instagram'
                  ? setInstagramMetrics
                  : setTwitterMetrics;

              return (
                <div key={key} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
                    <Icon className={`w-4 h-4 ${meta.color}`} />
                    <span className="text-xs font-bold text-slate-900">{meta.label} Metrics</span>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">({key === 'youtube' ? 'Subscribers' : 'Followers'})</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        {key === 'youtube' ? 'Subscribers' : 'Followers'} Count
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 25000"
                        value={metricsState.followers || (metricsState as any).subscribers || ''}
                        onChange={(e) =>
                          setMetricsState((prev: any) => ({
                            ...prev,
                            followers: e.target.value,
                            subscribers: e.target.value
                          }))
                        }
                        className="w-full text-xs bg-white border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Avg. {meta.metricName}
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 15000"
                        value={(metricsState as any).averageViews || (metricsState as any).averageReelViews || (metricsState as any).averageImpressions || ''}
                        onChange={(e) =>
                          setMetricsState((prev: any) => ({
                            ...prev,
                            averageViews: e.target.value,
                            averageReelViews: e.target.value,
                            averageImpressions: e.target.value
                          }))
                        }
                        className="w-full text-xs bg-white border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Engagement Rate (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        placeholder="e.g. 4.8"
                        value={metricsState.engagementRate}
                        onChange={(e) =>
                          setMetricsState((prev: any) => ({ ...prev, engagementRate: e.target.value }))
                        }
                        className="w-full text-xs bg-white border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[11px] text-slate-400">All fields are saved securely to your creator profile.</p>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-[#EC4899] hover:bg-pink-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Profile Changes
                </>
              )}
            </button>
          </div>
        </form>
      </Card>

      {/* ADD SOCIAL PLATFORM MODAL UI WITH LINK VERIFICATION FLOW */}
      {showAddPlatformModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 bg-white border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add Social Platform</h3>
              <button
                type="button"
                disabled={isVerifyingPlatform}
                onClick={() => setShowAddPlatformModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPlatformSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Platform</label>
                <select
                  value={addPlatformKey}
                  disabled={isVerifyingPlatform}
                  onChange={(e) => {
                    setAddPlatformKey(e.target.value as PlatformKey);
                    setPlatformVerifyError(null);
                    setPlatformVerifySuccess(null);
                  }}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-60"
                >
                  {availablePlatformKeys.map((key) => (
                    <option key={key} value={key}>
                      {PLATFORM_META[key]?.label || key}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {PLATFORM_META[addPlatformKey]?.label} Channel / Profile Link
                </label>
                <input
                  type="url"
                  disabled={isVerifyingPlatform}
                  placeholder={PLATFORM_META[addPlatformKey]?.placeholder || 'https://...'}
                  value={addPlatformLink}
                  onChange={(e) => {
                    setAddPlatformLink(e.target.value);
                    setPlatformVerifyError(null);
                    setPlatformVerifySuccess(null);
                  }}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500 font-medium disabled:opacity-60"
                />
              </div>

              {/* Status Feedback Messages */}
              {platformVerifyError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{platformVerifyError}</span>
                </div>
              )}

              {platformVerifySuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{platformVerifySuccess}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isVerifyingPlatform}
                  onClick={() => setShowAddPlatformModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifyingPlatform || !addPlatformLink.trim()}
                  className="px-5 py-2 bg-[#EC4899] hover:bg-pink-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isVerifyingPlatform ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying...
                    </>
                  ) : (
                    'Continue'
                  )}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
