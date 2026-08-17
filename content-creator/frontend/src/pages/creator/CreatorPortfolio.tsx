import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { AddPortfolioModal } from '../../components/modals/AddPortfolioModal';
import { Plus, Eye, Heart, MessageSquare, ExternalLink, CheckCircle2, BarChart3 } from 'lucide-react';

export const CreatorPortfolio: React.FC = () => {
  const { user } = useAuth();
  const { creators } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);

  const creator = creators.find((c) => c.id === user?.id) || creators[0];
  const [tab, setTab] = useState<'all' | 'image' | 'video'>('all');
  const visibleItems = creator.portfolio.filter((item) => tab === 'all' || item.mediaType === tab);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Portfolio & Previous Works</h1>
          <p className="text-xs text-slate-500">Showcase high-performing brand integrations, b-roll shots, and video clips</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 bg-[#EC4899] hover:bg-pink-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Showcase Item
        </button>
      </div>

      <Card className="p-5 border-slate-200/90 bg-gradient-to-r from-pink-50 to-purple-50 flex flex-col sm:flex-row gap-4 sm:items-center justify-between"><div className="flex items-center gap-3"><img src={creator.avatar} className="w-14 h-14 rounded-2xl object-cover"/><div><p className="text-base font-black text-slate-900">{creator.name} {creator.verified && <CheckCircle2 className="inline w-4 h-4 text-pink-500"/>}</p><p className="text-xs text-slate-500">{creator.category} · {creator.totalCollaborations} collaborations</p></div></div><div className="grid grid-cols-2 gap-4 text-center"><span className="text-xs"><b className="block text-base text-slate-900">{creator.portfolio.length}</b>Showcases</span><span className="text-xs"><b className="block text-base text-slate-900">{creator.rating}</b>Rating</span></div></Card>
      <div className="flex gap-2 border-b border-slate-200">{(['all','image','video'] as const).map(value => <button key={value} onClick={() => setTab(value)} className={`px-3 py-2 text-xs font-bold capitalize border-b-2 ${tab===value?'border-[#EC4899] text-[#EC4899]':'border-transparent text-slate-500'}`}>{value === 'all' ? 'All work' : value + ' work'}</button>)}</div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleItems.length === 0 ? (
          <Card className="col-span-3 p-8 text-center text-xs text-slate-400">
            No portfolio items added yet. Click "Add Showcase Item" to start building your portfolio!
          </Card>
        ) : (
          visibleItems.map((item) => (
            <Card key={item.id} hoverable className="p-4 border-slate-200/90 space-y-3">
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-full h-44 object-cover rounded-xl border border-slate-100"
              />
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-pink-600 uppercase tracking-wider block">
                  {item.brandName || 'Brand Integration'}
                </span>
                <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-100 font-semibold">
                <span className="flex items-center gap-1 text-slate-700">
                  <Eye className="w-3.5 h-3.5 text-slate-400" /> {item.views} views
                </span>
                <span className="flex items-center gap-1 text-slate-700">
                  <Heart className="w-3.5 h-3.5 text-rose-400" /> {item.likes} likes
                </span>
              </div>
            </Card>
          ))
        )}
      </div>

      <AddPortfolioModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
    </div>
  );
};
