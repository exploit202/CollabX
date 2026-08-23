import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { AddPortfolioModal } from '../../components/modals/AddPortfolioModal';
import { Plus, Eye, TrendingUp, ExternalLink, Youtube, Instagram, Video, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { getPortfolio } from '../../lib/api';

type PortfolioTab = 'all' | 'youtube' | 'instagram' | 'shorts-reels';

export const CreatorPortfolio: React.FC = () => {
  const { user } = useAuth();
  const { formatCurrency } = useApp();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [tab, setTab] = useState<PortfolioTab>('all');

  const fetchPortfolio = async () => {
    try {
      const res = await getPortfolio();
      if (res.success) {
        setItems(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching portfolio:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const visibleItems = items.filter((item) => {
    if (tab === 'all') return true;
    const p = (item.platform || item.mediaType || '').toLowerCase();
    if (tab === 'youtube') return p.includes('youtube') || (p === 'video' && !p.includes('reel') && !p.includes('short'));
    if (tab === 'instagram') return p.includes('instagram') || (p === 'image' && !p.includes('reel'));
    if (tab === 'shorts-reels') return p.includes('short') || p.includes('reel') || p === 'shorts-reels';
    return p === tab;
  });

  const getPlatformBadge = (platform?: string) => {
    const p = (platform || '').toLowerCase();
    if (p.includes('youtube')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-50 text-red-600 border border-red-200">
          <Youtube className="w-3 h-3 text-red-600" /> YouTube
        </span>
      );
    }
    if (p.includes('instagram')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-50 text-purple-600 border border-purple-200">
          <Instagram className="w-3 h-3 text-purple-600" /> Instagram
        </span>
      );
    }
    if (p.includes('short') || p.includes('reel')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-pink-50 text-[#EC4899] border border-pink-200">
          <Video className="w-3 h-3 text-[#EC4899]" /> Shorts / Reels
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200">
        <Sparkles className="w-3 h-3 text-slate-500" /> Showcase
      </span>
    );
  };

  const getPlatformIcon = (platform?: string) => {
    const p = (platform || '').toLowerCase();
    if (p.includes('youtube')) return <Youtube className="w-4 h-4 text-red-500" />;
    if (p.includes('instagram')) return <Instagram className="w-4 h-4 text-purple-500" />;
    if (p.includes('short') || p.includes('reel')) return <Video className="w-4 h-4 text-[#EC4899]" />;
    return <Sparkles className="w-4 h-4 text-slate-500" />;
  };

  const handleCardClick = (item: any) => {
    const targetUrl = item.contentUrl || item.mediaUrl || (item.platform === 'instagram' ? 'https://instagram.com' : 'https://youtube.com');
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Portfolio & Previous Works</h1>
          <p className="text-xs text-slate-500">Showcase high-performing brand integrations, sponsored videos, and creative reels</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 bg-[#EC4899] hover:bg-pink-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add Showcase Item
        </button>
      </div>

      {/* Profile Overview Card */}
      <Card className="p-5 border-slate-200/90 bg-gradient-to-r from-pink-50/80 via-purple-50/60 to-white flex flex-col sm:flex-row gap-4 sm:items-center justify-between shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#EC4899] to-[#8B5CF6] text-white font-black flex items-center justify-center text-xl shadow-xs">
            {user?.fullName?.[0] || user?.name?.[0] || 'C'}
          </div>
          <div>
            <p className="text-base font-black text-slate-900">{user?.fullName || user?.name || 'Creator'}</p>
            <p className="text-xs text-slate-500 font-semibold">{items.length} showcases uploaded to profile</p>
          </div>
        </div>
      </Card>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-px overflow-x-auto">
        {[
          { id: 'all', label: 'All Work' },
          { id: 'youtube', label: 'YouTube' },
          { id: 'instagram', label: 'Instagram' },
          { id: 'shorts-reels', label: 'Shorts / Reels' }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as PortfolioTab)}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
              tab === t.id
                ? 'border-[#EC4899] text-[#EC4899]'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Portfolio Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-[#EC4899]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleItems.length === 0 ? (
            <Card className="col-span-1 md:col-span-2 lg:col-span-3 p-12 text-center border-slate-200/90 shadow-xs">
              <div className="max-w-md mx-auto space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-pink-50 text-[#EC4899] flex items-center justify-center mx-auto shadow-2xs">
                  <Plus className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">No showcase items added yet.</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Click 'Add Showcase Item' to start building your portfolio.
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-pink-50 hover:bg-pink-100 text-[#EC4899] font-bold text-xs rounded-xl border border-pink-200 shadow-2xs transition-all inline-flex items-center gap-1.5 cursor-pointer mt-2"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Showcase Item
                </button>
              </div>
            </Card>
          ) : (
            visibleItems.map((item) => {
              const itemId = item._id || item.id;
              const valueNum = Number(item.campaignValue || item.price || 0);
              const viewsDisplay = typeof item.views === 'number' ? `${item.views.toLocaleString('en-IN')}` : item.views || '0';
              const engagementDisplay = typeof item.engagementRate === 'number' ? `${item.engagementRate}%` : item.engagementRate || '0%';

              return (
                <Card
                  key={itemId}
                  hoverable
                  onClick={() => handleCardClick(item)}
                  className="p-4 border-slate-200/90 space-y-3 group cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between"
                >
                  {/* Thumbnail / Header */}
                  <div className="space-y-3">
                    <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/60 shadow-2xs group-hover:border-pink-300 transition-colors">
                      <img
                        src={
                          item.thumbnail ||
                          'https://images.unsplash.com/photo-1579208575657-c595a05383b7?w=600&auto=format&fit=crop&q=80'
                        }
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e: any) => {
                          e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div className="absolute top-2.5 left-2.5 backdrop-blur-md bg-white/90 rounded-full px-2 py-0.5 shadow-2xs">
                        {getPlatformBadge(item.platform)}
                      </div>
                      <div className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-slate-900/60 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xs">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    {/* Metadata & Title */}
                    <div className="space-y-1">
                      {item.brandName && (
                        <p className="text-[10px] font-extrabold text-[#EC4899] uppercase tracking-wider">
                          {item.brandName}
                        </p>
                      )}
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#EC4899] transition-colors line-clamp-1">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Metrics Footer */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600">
                      <span className="flex items-center gap-1 truncate">
                        <Eye className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-bold text-slate-800">{viewsDisplay}</span> Views
                      </span>
                      <span className="flex items-center gap-1 justify-end truncate">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="font-bold text-slate-800">{engagementDisplay}</span> Engagement
                      </span>
                    </div>

                    {valueNum > 0 && (
                      <div className="pt-2 border-t border-dashed border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Campaign Value
                        </span>
                        <span className="text-sm font-black text-slate-900">
                          {formatCurrency(valueNum)}
                        </span>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Add Showcase Modal */}
      <AddPortfolioModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          fetchPortfolio();
        }}
      />
    </div>
  );
};
