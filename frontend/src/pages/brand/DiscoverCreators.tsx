import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { SendInvitationModal } from '../../components/modals/SendInvitationModal';
import { getDiscoverCreators } from '../../lib/api';
import {
  Search,
  Star,
  Bookmark,
  Send,
  CheckCircle2,
  Instagram,
  Youtube,
  Twitter,
  Users,
  MapPin,
  Package,
  Clock,
  Loader2
} from 'lucide-react';

export const DiscoverCreators: React.FC = () => {
  const { savedCreatorIds, toggleSaveCreator, formatCurrency } = useApp();
  const { isGuest } = useAuth();
  const [searchParams] = useSearchParams();
  const queryFromUrl = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(queryFromUrl);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('All');
  const [priceRange, setPriceRange] = useState<string>('All');
  const [minFollowers, setMinFollowers] = useState<number>(0);
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [minEngagement, setMinEngagement] = useState<number>(0);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState('match');

  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentSearches, setRecentSearches] = useState<string[]>(['Tech creators in India', 'Verified beauty creators']);
  const [selectedCreatorForInvite, setSelectedCreatorForInvite] = useState<any | null>(null);

  const categories = ['All', 'Tech & Gadgets', 'Fashion & Lifestyle', 'Fitness & Wellness', 'Gaming', 'Travel'];
  const platforms = ['All', 'instagram', 'youtube', 'twitter'];
  const locations = ['All', 'Pune, India', 'Mumbai, India', 'Delhi, India', 'Bengaluru, India'];

  const fetchRealCreators = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getDiscoverCreators({
        searchQuery,
        category: selectedCategory,
        platform: selectedPlatform,
        priceRange,
        minFollowers,
        location: selectedLocation,
        minEngagement,
        verifiedOnly,
        sortBy
      });

      if (res?.success && Array.isArray(res.data)) {
        setCreators(res.data);
      }
    } catch (err) {
      console.error('Error fetching real discover creators:', err);
    } finally {
      setLoading(false);
    }
  }, [
    searchQuery,
    selectedCategory,
    selectedPlatform,
    priceRange,
    minFollowers,
    selectedLocation,
    minEngagement,
    verifiedOnly,
    sortBy
  ]);

  useEffect(() => {
    fetchRealCreators();
  }, [fetchRealCreators]);

  const handleSearchBlur = () => {
    const term = searchQuery.trim();
    if (term && !recentSearches.includes(term)) setRecentSearches((prev) => [term, ...prev].slice(0, 3));
  };

  const renderPlatformIcon = (plat: string) => {
    const p = plat.toLowerCase();
    if (p.includes('instagram')) return <Instagram className="w-3.5 h-3.5 text-pink-600" />;
    if (p.includes('youtube')) return <Youtube className="w-3.5 h-3.5 text-red-600" />;
    if (p.includes('twitter') || p.includes('x')) return <Twitter className="w-3.5 h-3.5 text-sky-600" />;
    return <Users className="w-3.5 h-3.5 text-purple-600" />;
  };

  const calculateAvgRating = () => {
    if (creators.length === 0) return '0.0';
    const totalRating = creators.reduce((sum, c) => sum + (c.rating || 0), 0);
    const avg = totalRating / creators.length;
    return avg > 0 ? avg.toFixed(1) : '0.0';
  };

  return (
    <div className="space-y-6">
      {/* Header title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Discover Creators</h1>
          <p className="text-xs text-slate-500">
            {isGuest
              ? 'Browse verified influencers — sign in to invite or save creators'
              : 'Find and invite top verified influencers matching your brand criteria'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <option value="match">Best match</option>
            <option value="followers">Most followers</option>
            <option value="rating">Highest rating</option>
            <option value="engagement">Highest engagement</option>
          </select>
          <div className="text-xs font-semibold text-slate-600">
            Showing <span className="text-[#EC4899] font-bold">{creators.length}</span> creators
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4"><p className="text-[10px] font-bold uppercase text-slate-400">Available creators</p><p className="text-xl font-black mt-1">{creators.length}</p></Card>
        <Card className="p-4"><p className="text-[10px] font-bold uppercase text-slate-400">Verified</p><p className="text-xl font-black mt-1 text-[#EC4899]">{creators.filter(c => c.verified).length}</p></Card>
        <Card className="p-4"><p className="text-[10px] font-bold uppercase text-slate-400">Avg. rating</p><p className="text-xl font-black mt-1 text-amber-500">{calculateAvgRating()}</p></Card>
        <Card className="p-4"><p className="text-[10px] font-bold uppercase text-slate-400">Starting rate</p><p className="text-xl font-black mt-1">₹{(creators.length > 0 ? Math.min(...creators.map(c=>c.minStartingPrice || 5000)) : 5000).toLocaleString('en-IN')}</p></Card>
      </div>

      {/* Filter Bar */}
      <Card className="p-5 border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by creator name, niche, bio keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={handleSearchBlur}
              className="w-full text-xs bg-slate-50 border border-slate-200/90 rounded-2xl pl-10 pr-3.5 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 font-semibold transition-all"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200/90 rounded-2xl px-4 py-3 text-slate-800 font-extrabold focus:outline-none focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 cursor-pointer"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                Category: {cat}
              </option>
            ))}
          </select>

          {/* Platform Dropdown */}
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200/90 rounded-2xl px-4 py-3 text-slate-800 font-extrabold capitalize focus:outline-none focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 cursor-pointer"
          >
            {platforms.map((plat) => (
              <option key={plat} value={plat}>
                Platform: {plat}
              </option>
            ))}
          </select>

          {/* Location Dropdown */}
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200/90 rounded-2xl px-4 py-3 text-slate-800 font-extrabold focus:outline-none focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 cursor-pointer"
          >
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                Location: {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Range Sliders & Clear */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
          <div>
            <label className="block text-[11px] font-extrabold text-slate-600 mb-1">Pricing Filter</label>
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200/90 rounded-xl px-3 py-2.5 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="All">All Ranges</option>
              <option value="0-10k">₹0 – ₹10,000</option>
              <option value="10k-50k">₹10,000 – ₹50,000</option>
              <option value="50k-100k">₹50,000 – ₹1,00,000</option>
              <option value="100k+">₹1,00,000+</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between text-[11px] font-extrabold text-slate-600 mb-1">
              <span>Min Audience Reach</span>
              <span className="text-[#EC4899] font-black">{(minFollowers / 1000).toFixed(0)}K+</span>
            </div>
            <input
              type="range"
              min="0"
              max="1000000"
              step="50000"
              value={minFollowers}
              onChange={(e) => setMinFollowers(Number(e.target.value))}
              className="w-full accent-[#EC4899] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] font-extrabold text-slate-600 mb-1">
              <span>Min Engagement Rate</span>
              <span className="text-[#EC4899] font-black">{minEngagement}%+</span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              step="0.5"
              value={minEngagement}
              onChange={(e) => setMinEngagement(Number(e.target.value))}
              className="w-full accent-[#EC4899] cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-[11px] font-extrabold text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="w-4 h-4 rounded accent-[#EC4899] cursor-pointer"
              />
              Verified only
            </label>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedPlatform('All');
                setPriceRange('All');
                setMinFollowers(0);
                setSelectedLocation('All');
                setMinEngagement(0);
                setVerifiedOnly(false);
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-900 underline shrink-0 cursor-pointer"
            >
              Reset All
            </button>
          </div>
        </div>

        {recentSearches.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center pt-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Recent searches</span>
            {recentSearches.map(term => (
              <button key={term} onClick={() => setSearchQuery(term)} className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-slate-100/90 text-slate-700 hover:bg-pink-50 hover:text-[#EC4899] transition-all cursor-pointer">
                {term}
              </button>
            ))}
          </div>
        )}
      </Card>

      {loading ? (
        <SkeletonLoader variant="card" count={6} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {creators.length === 0 ? (
            <Card className="p-8 text-center text-xs text-slate-400 col-span-full">
              No creators found matching your filter criteria. Try broadening your search!
            </Card>
          ) : (
            creators.map((creator) => {
              const cid = creator.id || creator._id;
              const isSaved = savedCreatorIds.includes(cid);
              const topSocial = creator.socials?.[0] || { followers: 15000, engagementRate: 4.5 };
              const minStartingPrice = creator.minStartingPrice || 5000;
              const creatorLocation = creator.country || 'Pune, India';
              const ratingDisplay = creator.reviewCount > 0 ? `${creator.rating} Rating (${creator.reviewCount})` : 'No reviews yet (0.0)';

              return (
                <Card key={cid} hoverable className="p-5 border-slate-200/90 flex flex-col justify-between shadow-xs hover:shadow-lg transition-all duration-200 animate-fade-in">
                  <div>
                    {/* Header identity info */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar
                          src={creator.profileImage?.url || creator.userId?.profileImage || creator.avatar || null}
                          name={creator.name}
                          size="w-12 h-12"
                          textSize="text-sm"
                          className="border-2 border-white shadow-xs shrink-0 ring-2 ring-slate-100"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <h3 className="text-sm font-bold text-slate-900 truncate">{creator.name}</h3>
                            {creator.verified && <CheckCircle2 className="w-3.5 h-3.5 text-pink-500 fill-pink-50 shrink-0" />}
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-1 items-center">
                            <Badge variant="purple">{creator.category}</Badge>
                            <span className="text-[10px] font-medium text-slate-500 flex items-center gap-0.5">
                              <MapPin className="w-3 h-3 text-slate-400" /> {creatorLocation}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bookmark Button */}
                      {!isGuest && (
                        <button
                          onClick={() => toggleSaveCreator(cid)}
                          className={`p-1.5 rounded-xl border transition-colors ${
                            isSaved
                              ? 'bg-pink-50 border-pink-200 text-[#EC4899]'
                              : 'border-slate-200 text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-[#EC4899]' : ''}`} />
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed font-normal">
                      {creator.bio}
                    </p>

                    {/* Platform-Specific Audience Metrics Breakdown */}
                    <div className="space-y-2 mb-3 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Audience Metrics
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {(creator.socials || []).map((social: any) => (
                          <div key={social.platform} className="flex items-center justify-between p-1.5 bg-white rounded-lg border border-slate-200/60 text-xs">
                            <div className="flex items-center gap-1.5">
                              {renderPlatformIcon(social.platform)}
                              <span className="capitalize text-[11px] font-bold text-slate-700">{social.platform}</span>
                            </div>
                            <span className="font-extrabold text-slate-900 text-[11px]">
                              {(social.followers / 1000).toFixed(0)}K
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Available Deliverable Packages Preview */}
                    <div className="space-y-1.5 mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <Package className="w-3 h-3 text-pink-500" /> Available Packages ({creator.pricing?.length || 0})
                      </span>
                      <div className="space-y-1.5">
                        {(!creator.pricing || creator.pricing.length === 0) ? (
                          <div className="p-2 bg-slate-50 rounded-lg text-[11px] text-slate-400 italic">No packages created yet.</div>
                        ) : (
                          creator.pricing.slice(0, 2).map((pkg: any) => (
                            <div key={pkg.id || pkg._id || pkg.title} className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-xs">
                              <div className="min-w-0 pr-2">
                                <span className="font-semibold text-slate-800 block truncate">{pkg.title || pkg.type}</span>
                                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                  <Clock className="w-2.5 h-2.5" /> {pkg.deliveryDays} Days Turnaround
                                </span>
                              </div>
                              <span className="font-extrabold text-slate-900 shrink-0">{formatCurrency(pkg.price)}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Rating & Engagement Footer Bar */}
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 bg-slate-50 px-3 py-2 rounded-xl mb-4 border border-slate-100">
                      <span className="flex items-center gap-1 text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {ratingDisplay}
                      </span>
                      <span className="text-emerald-600">
                        {topSocial.engagementRate}% Eng. Rate
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div>
                    <div className="flex items-center justify-between pb-3 text-xs border-b border-slate-100 mb-3">
                      <span className="text-slate-500 font-medium">Starting Rate:</span>
                      <span className="font-black text-slate-900">{formatCurrency(minStartingPrice)}</span>
                    </div>

                    <div className={`grid gap-2 ${isGuest ? 'grid-cols-1' : 'grid-cols-2'}`}>
                      <Link
                        to={`/brand/creator/${cid}`}
                        className="py-2 text-center text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                      >
                        View Details
                      </Link>
                      {!isGuest && (
                        <button
                          onClick={() => setSelectedCreatorForInvite(creator)}
                          className="py-2 px-3 text-center text-xs font-bold text-white bg-[#EC4899] hover:bg-pink-600 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
                        >
                          <Send className="w-3 h-3" />
                          Invite
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      <SendInvitationModal
        isOpen={!!selectedCreatorForInvite}
        onClose={() => setSelectedCreatorForInvite(null)}
        creator={selectedCreatorForInvite}
      />
    </div>
  );
};
