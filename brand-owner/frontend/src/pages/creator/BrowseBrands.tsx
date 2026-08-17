import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import {
  Search,
  CheckCircle2,
  Send,
  Instagram,
  Youtube,
  Twitter,
  Calendar,
} from 'lucide-react';

const PLATFORM_ICONS: Record<string, React.ComponentType<any>> = {
  instagram: Instagram,
  youtube: Youtube,
  twitter: Twitter,
};

export const BrowseBrands: React.FC = () => {
  const { campaigns, brands, addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [budgetRange, setBudgetRange] = useState<string>('All');
  const [maxFollowerRequirement, setMaxFollowerRequirement] = useState<number>(1000000);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);

  const categories = ['All', 'Tech & Gadgets', 'Fashion & Lifestyle', 'Fitness & Wellness', 'Gaming', 'Travel'];
  const platforms = ['All', 'instagram', 'youtube', 'twitter'];
  const locations = ['All', ...Array.from(new Set(brands.map((b) => b.country)))];

  const brandById = useMemo(() => {
    const map = new Map(brands.map((b) => [b.id, b]));
    return map;
  }, [brands]);

  const activeCampaigns = useMemo(() => campaigns.filter((c) => c.status === 'active'), [campaigns]);

  const filteredCampaigns = useMemo(() => {
    return activeCampaigns.filter((c) => {
      const brand = brandById.get(c.brandId);

      const matchesQuery =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;

      const matchesPlatform = selectedPlatform === 'All' || c.targetPlatforms.includes(selectedPlatform as any);

      const matchesLocation = selectedLocation === 'All' || brand?.country === selectedLocation;

      let matchesBudget = true;
      if (budgetRange === '0-500000') matchesBudget = c.budget <= 500000;
      else if (budgetRange === '500000-1000000') matchesBudget = c.budget >= 500000 && c.budget <= 1000000;
      else if (budgetRange === '1000000+') matchesBudget = c.budget >= 1000000;

      const matchesFollowerRequirement = c.minFollowers <= maxFollowerRequirement;

      const matchesVerified = !verifiedOnly || !!brand?.verified;

      return (
        matchesQuery &&
        matchesCategory &&
        matchesPlatform &&
        matchesLocation &&
        matchesBudget &&
        matchesFollowerRequirement &&
        matchesVerified
      );
    });
  }, [
    activeCampaigns,
    brandById,
    searchQuery,
    selectedCategory,
    selectedPlatform,
    selectedLocation,
    budgetRange,
    maxFollowerRequirement,
    verifiedOnly,
  ]);

  const handleExpressInterest = (campaignTitle: string, brandName: string) => {
    addToast('success', 'Interest Sent!', `${brandName} has been notified of your interest in "${campaignTitle}".`);
  };

  return (
    <div className="space-y-6">
      {/* Header title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Discover Brands</h1>
          <p className="text-xs text-slate-500">Find open campaigns from verified brands looking for creators like you</p>
        </div>
        <div className="text-xs font-semibold text-slate-600">
          Showing <span className="text-[#EC4899] font-bold">{filteredCampaigns.length}</span> campaigns
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 border-slate-200/80 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by brand name, campaign, keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 font-medium"
            />
          </div>

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

        <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Budget Range</label>
            <select
              value={budgetRange}
              onChange={(e) => setBudgetRange(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="All">All Ranges</option>
              <option value="0-500000">Up to ₹5,00,000</option>
              <option value="500000-1000000">₹5,00,000 – ₹10,00,000</option>
              <option value="1000000+">₹10,00,000+</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
              <span>Max Follower Requirement</span>
              <span className="text-[#EC4899] font-bold">{(maxFollowerRequirement / 1000).toFixed(0)}K</span>
            </div>
            <input
              type="range"
              min="0"
              max="1000000"
              step="50000"
              value={maxFollowerRequirement}
              onChange={(e) => setMaxFollowerRequirement(Number(e.target.value))}
              className="w-full accent-[#EC4899]"
            />
            <p className="text-[10px] text-slate-400 mt-1">Only show campaigns you qualify for</p>
          </div>

          <div className="flex items-center">
            <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="w-3.5 h-3.5 rounded accent-[#EC4899]"
              />
              Verified brands only
            </label>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedPlatform('All');
                setSelectedLocation('All');
                setBudgetRange('All');
                setMaxFollowerRequirement(1000000);
                setVerifiedOnly(false);
              }}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline"
            >
              Reset All
            </button>
          </div>
        </div>
      </Card>

      {/* Campaign Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCampaigns.length === 0 ? (
          <p className="col-span-full text-xs text-slate-400 text-center py-10">
            No campaigns match your filters right now - try widening your search.
          </p>
        ) : (
          filteredCampaigns.map((campaign) => {
            const brand = brandById.get(campaign.brandId);
            return (
              <Card key={campaign.id} hoverable className="p-5 border-slate-200/90 flex flex-col justify-between">
                <div>
                  <div className="flex items-start gap-3 mb-3">
                    <img
                      src={campaign.brandLogo}
                      alt={campaign.brandName}
                      className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <h3 className="text-sm font-bold text-slate-900 truncate">{campaign.brandName}</h3>
                        {brand?.verified && <CheckCircle2 className="w-3.5 h-3.5 text-pink-500 fill-pink-50 shrink-0" />}
                      </div>
                      <Badge variant="purple" className="mt-1">
                        {campaign.category}
                      </Badge>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-slate-800 mb-1.5">{campaign.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">{campaign.description}</p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {campaign.targetPlatforms.map((p) => {
                      const Icon = PLATFORM_ICONS[p];
                      return (
                        <span
                          key={p}
                          className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-slate-100 text-slate-600 flex items-center gap-1 capitalize"
                        >
                          {Icon && <Icon className="w-3 h-3" />}
                          {p}
                        </span>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-center mb-4">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">Budget</span>
                      <span className="text-xs font-black text-slate-900">₹{campaign.budget.toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">Min Followers</span>
                      <span className="text-xs font-black text-slate-900">
                        {(campaign.minFollowers / 1000).toFixed(0)}K+
                      </span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 flex items-center gap-1 mb-4">
                    <Calendar className="w-3 h-3" />
                    Deadline: {new Date(campaign.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>

                <button
                  onClick={() => handleExpressInterest(campaign.title, campaign.brandName)}
                  className="w-full py-2 text-center text-xs font-bold text-white bg-[#EC4899] hover:bg-pink-600 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Express Interest
                </button>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
