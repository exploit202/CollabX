import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { CreatorProfile } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { SendInvitationModal } from '../../components/modals/SendInvitationModal';
import {
  Search,
  Filter,
  Star,
  Bookmark,
  Send,
  CheckCircle2,
  SlidersHorizontal,
  Instagram,
  Youtube,
  Twitter,
  Sparkles,
  ChevronRight,
  Users,
  GitCompareArrows,
} from 'lucide-react';

export const DiscoverCreators: React.FC = () => {
  const { creators, savedCreatorIds, toggleSaveCreator } = useApp();
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
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>(['Tech creators in India', 'Verified beauty creators']);
  const [selectedCreatorForInvite, setSelectedCreatorForInvite] = useState<CreatorProfile | null>(null);

  const categories = ['All', 'Tech & Gadgets', 'Fashion & Lifestyle', 'Fitness & Wellness', 'Gaming', 'Travel'];
  const platforms = ['All', 'instagram', 'youtube', 'twitter'];
  const locations = ['All', ...Array.from(new Set(creators.map((c) => c.country)))];

  // Filtering Logic
  const filteredCreators = useMemo(() => {
    return creators.filter((c) => {
      const matchesQuery =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.bio.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;

      const matchesPlatform =
        selectedPlatform === 'All' || c.socials.some((s) => s.platform === selectedPlatform);

      const minPrice = Math.min(...c.pricing.map((p) => p.price), 5000);
      let matchesPrice = true;
      if (priceRange === '0-10k') {
        matchesPrice = minPrice <= 10000;
      } else if (priceRange === '10k-50k') {
        matchesPrice = minPrice >= 10000 && minPrice <= 50000;
      } else if (priceRange === '50k-100k') {
        matchesPrice = minPrice >= 50000 && minPrice <= 100000;
      } else if (priceRange === '100k+') {
        matchesPrice = minPrice >= 100000;
      }

      const totalFollowers = c.socials.reduce((sum, s) => sum + s.followers, 0);
      const matchesFollowers = totalFollowers >= minFollowers;

      const matchesLocation = selectedLocation === 'All' || c.country === selectedLocation;

      const maxEngagement = Math.max(...c.socials.map((s) => s.engagementRate), 0);
      const matchesEngagement = maxEngagement >= minEngagement;

      const matchesVerified = !verifiedOnly || !!c.verified;

      return (
        matchesQuery &&
        matchesCategory &&
        matchesPlatform &&
        matchesPrice &&
        matchesFollowers &&
        matchesLocation &&
        matchesEngagement &&
        matchesVerified
      );
    }).sort((a, b) => {
      const followers = (creator: CreatorProfile) => creator.socials.reduce((sum, social) => sum + social.followers, 0);
      const engagement = (creator: CreatorProfile) => Math.max(...creator.socials.map(social => social.engagementRate), 0);
      if (sortBy === 'followers') return followers(b) - followers(a);
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'engagement') return engagement(b) - engagement(a);
      return (b.matchScore || 0) - (a.matchScore || 0);
    });
  }, [
    creators,
    searchQuery,
    selectedCategory,
    selectedPlatform,
    priceRange,
    minFollowers,
    selectedLocation,
    minEngagement,
    verifiedOnly,
    sortBy,
  ]);

  const toggleCompare = (id: string) => setCompareIds((prev) => prev.includes(id) ? prev.filter((value) => value !== id) : prev.length < 3 ? [...prev, id] : prev);
  const comparedCreators = creators.filter((creator) => compareIds.includes(creator.id));
  const handleSearchBlur = () => {
    const term = searchQuery.trim();
    if (term && !recentSearches.includes(term)) setRecentSearches((prev) => [term, ...prev].slice(0, 3));
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
        <div className="flex items-center gap-3"><select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"><option value="match">Best match</option><option value="followers">Most followers</option><option value="rating">Highest rating</option><option value="engagement">Highest engagement</option></select><div className="text-xs font-semibold text-slate-600">Showing <span className="text-[#EC4899] font-bold">{filteredCreators.length}</span> creators</div></div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4"><p className="text-[10px] font-bold uppercase text-slate-400">Available creators</p><p className="text-xl font-black mt-1">{creators.length}</p></Card>
        <Card className="p-4"><p className="text-[10px] font-bold uppercase text-slate-400">Verified</p><p className="text-xl font-black mt-1 text-[#EC4899]">{creators.filter(c => c.verified).length}</p></Card>
        <Card className="p-4"><p className="text-[10px] font-bold uppercase text-slate-400">Avg. rating</p><p className="text-xl font-black mt-1 text-amber-500">{(creators.reduce((sum,c)=>sum+c.rating,0)/creators.length).toFixed(1)}</p></Card>
        <Card className="p-4"><p className="text-[10px] font-bold uppercase text-slate-400">Starting rate</p><p className="text-xl font-black mt-1">₹{Math.min(...creators.flatMap(c=>c.pricing.map(p=>p.price))).toLocaleString('en-IN')}</p></Card>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 border-slate-200/80 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by creator name, niche, bio keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={handleSearchBlur}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 font-medium"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500"
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
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 font-semibold capitalize focus:outline-none focus:ring-2 focus:ring-pink-500"
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
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                Location: {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Range Sliders & Clear */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Pricing Filter</label>
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="All">All Ranges</option>
              <option value="0-10k">₹0 – ₹10,000</option>
              <option value="10k-50k">₹10,000 – ₹50,000</option>
              <option value="50k-100k">₹50,000 – ₹1,00,000</option>
              <option value="100k+">₹1,00,000+</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
              <span>Min Follower Reach</span>
              <span className="text-[#EC4899] font-bold">{(minFollowers / 1000).toFixed(0)}K+</span>
            </div>
            <input
              type="range"
              min="0"
              max="1000000"
              step="50000"
              value={minFollowers}
              onChange={(e) => setMinFollowers(Number(e.target.value))}
              className="w-full accent-[#EC4899]"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
              <span>Min Engagement Rate</span>
              <span className="text-[#EC4899] font-bold">{minEngagement}%+</span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              step="0.5"
              value={minEngagement}
              onChange={(e) => setMinEngagement(Number(e.target.value))}
              className="w-full accent-[#EC4899]"
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="w-3.5 h-3.5 rounded accent-[#EC4899]"
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
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline shrink-0"
            >
              Reset All
            </button>
          </div>
        </div>

        {recentSearches.length > 0 && <div className="flex flex-wrap gap-2 items-center"><span className="text-[10px] font-bold text-slate-400 uppercase">Recent searches</span>{recentSearches.map(term => <button key={term} onClick={() => setSearchQuery(term)} className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 text-slate-600 hover:bg-pink-50 hover:text-pink-600">{term}</button>)}</div>}
      </Card>

      {/* Creator Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCreators.map((creator) => {
          const isSaved = savedCreatorIds.includes(creator.id);
          const topSocial = creator.socials[0];
          const minStartingPrice = Math.min(...creator.pricing.map((p) => p.price));

          const isComparing = compareIds.includes(creator.id);
          return (
            <Card key={creator.id} hoverable className="p-5 border-slate-200/90 flex flex-col justify-between">
              <div>
                {/* Header info */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={creator.avatar}
                      alt={creator.name}
                      className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <h3 className="text-sm font-bold text-slate-900 truncate">{creator.name}</h3>
                        {creator.verified && <CheckCircle2 className="w-3.5 h-3.5 text-pink-500 fill-pink-50 shrink-0" />}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        <Badge variant="purple">
                          {creator.category}
                        </Badge>
                        {creator.matchScore && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-0.5 shadow-2xs">
                            <Sparkles className="w-3 h-3 text-emerald-600 fill-emerald-100" />
                            {creator.matchScore}% Match
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bookmark Button */}
                  {!isGuest && (
                  <button
                    onClick={() => toggleSaveCreator(creator.id)}
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

                {creator.matchReasons && creator.matchReasons.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4 items-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Reasons:</span>
                    {creator.matchReasons.map((reason) => (
                      <span key={reason} className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/50">
                        {reason}
                      </span>
                    ))}
                  </div>
                )}

                {/* Social Metrics */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-center mb-4">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Followers</span>
                    <span className="text-xs font-black text-slate-900">
                      {(topSocial.followers / 1000).toFixed(0)}K
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Engagement</span>
                    <span className="text-xs font-black text-emerald-600">{topSocial.engagementRate}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Rating</span>
                    <span className="text-xs font-black text-amber-500 flex items-center justify-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {creator.rating}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div>
                <div className="flex items-center justify-between pb-3 text-xs border-b border-slate-100 mb-3">
                  <span className="text-slate-500">Starting from:</span>
                  <span className="font-extrabold text-slate-900">₹{minStartingPrice.toLocaleString('en-IN')}</span>
                </div>

                <div className={`grid gap-2 ${isGuest ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  <Link
                    to={`/brand/creator/${creator.id}`}
                    className="py-2 text-center text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                  >
                    View Profile
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
                {!isGuest && <button onClick={() => toggleCompare(creator.id)} className={`mt-2 w-full py-2 rounded-xl text-[10px] font-bold border transition-colors ${isComparing ? 'border-purple-300 bg-purple-50 text-purple-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>{isComparing ? 'Selected for comparison' : 'Compare creator'}</button>}
              </div>
            </Card>
          );
        })}
      </div>

      {compareIds.length > 0 && <Card className="p-4 border-purple-200 bg-purple-50/40 sticky bottom-4 z-10"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div className="flex items-center gap-2"><GitCompareArrows className="w-4 h-4 text-purple-600"/><p className="text-xs font-bold text-slate-800">{compareIds.length}/3 creators selected for comparison</p></div><div className="flex gap-2"><button onClick={() => setCompareIds([])} className="px-3 py-2 text-xs font-bold text-slate-600">Clear</button><button onClick={() => alert(comparedCreators.map(c => `${c.name}: ${c.rating}★ · ${Math.max(...c.socials.map(s=>s.engagementRate))}% engagement`).join('\n'))} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl">Compare</button></div></div></Card>}

      <SendInvitationModal
        isOpen={!!selectedCreatorForInvite}
        onClose={() => setSelectedCreatorForInvite(null)}
        creator={selectedCreatorForInvite}
      />
    </div>
  );
};
