import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Search, Send, Instagram, Youtube, Twitter, Loader2 } from 'lucide-react';
import { discoverCampaigns, expressCampaignInterest } from '../../lib/api';

const PLATFORM_ICONS: Record<string, React.ComponentType<any>> = {
  instagram: Instagram,
  youtube: Youtube,
  twitter: Twitter,
};

export const BrowseBrands: React.FC = () => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [applyingId, setApplyingId] = useState<string | null>(null);

  const categories = ['All', 'Tech & Gadgets', 'Fashion & Lifestyle', 'Fitness & Wellness', 'Gaming', 'Travel'];

  const fetchCampaigns = async () => {
    try {
      const res = await discoverCampaigns();
      if (res.success) {
        const rawCampaigns = res.data || [];
        setCampaigns(rawCampaigns);
        const alreadyApplied = new Set<string>();
        rawCampaigns.forEach((c: any) => {
          if (c.hasApplied) {
            const campId = c._id || c.id;
            if (campId) alreadyApplied.add(String(campId));
          }
        });
        setAppliedIds(alreadyApplied);
      }
    } catch (err) {
      console.error('Error discovering campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      const matchesQuery =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.brandName && c.brandName.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
      return matchesQuery && matchesCategory;
    });
  }, [campaigns, searchQuery, selectedCategory]);

  const handleApply = async (id: string) => {
    setApplyingId(id);
    // Optimistic UI update
    setAppliedIds((prev) => new Set(prev).add(id));

    try {
      const res = await expressCampaignInterest(id);
      if (!res.success) {
        // Rollback optimistic update if API failed
        setAppliedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    } catch (err) {
      console.error('Failed to express interest on backend:', err);
      // Rollback on network error
      setAppliedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Discover Brand Briefs</h1>
          <p className="text-xs text-slate-500">Find open campaigns from verified brands looking for creators like you</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search campaigns by title, keyword, or brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="py-2.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCampaigns.length === 0 ? (
            <Card className="md:col-span-2 p-8 text-center text-xs text-slate-400">
              No matching active campaign briefs found in MongoDB.
            </Card>
          ) : (
            filteredCampaigns.map((camp) => {
              const campId = String(camp._id || camp.id);
              const hasApplied = appliedIds.has(campId);
              const isCurrentApplying = applyingId === campId;

              return (
                <Card key={campId} className="p-5 border-slate-200/90 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Badge variant="pink">{camp.category}</Badge>
                        <h3 className="text-base font-bold text-slate-900 mt-2">{camp.title}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{camp.brandName || 'Brand Partner'}</p>
                      </div>
                      <span className="text-lg font-black text-slate-900">${camp.budget}</span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-3">{camp.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      {camp.targetPlatforms?.map((p: string) => {
                        const Icon = PLATFORM_ICONS[p.toLowerCase()] || Instagram;
                        return <Icon key={p} className="w-4 h-4 text-slate-600" />;
                      })}
                    </div>

                    <button
                      onClick={() => handleApply(campId)}
                      disabled={hasApplied || isCurrentApplying}
                      className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                        hasApplied
                          ? 'bg-emerald-100 text-emerald-700 cursor-default'
                          : 'bg-[#EC4899] hover:bg-pink-600 text-white shadow-xs'
                      }`}
                    >
                      {isCurrentApplying ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      {hasApplied ? 'Interest Registered' : 'Apply / Express Interest'}
                    </button>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
