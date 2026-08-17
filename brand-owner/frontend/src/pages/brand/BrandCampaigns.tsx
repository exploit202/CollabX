import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { CreateCampaignModal } from '../../components/modals/CreateCampaignModal';
import { Edit3, Megaphone, Plus, Search, Trash2, Calendar, Users, ChevronRight, Save } from 'lucide-react';
import { Campaign } from '../../types';

const statusVariant = (status: Campaign['status']) => status === 'active' ? 'emerald' : status === 'draft' ? 'amber' : 'slate';

export const BrandCampaigns: React.FC = () => {
  const { campaigns, updateCampaignStatus, deleteCampaign } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const [platform, setPlatform] = useState('all');
  const [sort, setSort] = useState('latest');
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [deleting, setDeleting] = useState<Campaign | null>(null);

  const visibleCampaigns = useMemo(() => [...campaigns].filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase()) &&
    (status === 'all' || c.status === status) &&
    (category === 'all' || c.category === category) &&
    (platform === 'all' || c.targetPlatforms.includes(platform as any))
  ).sort((a, b) => {
    if (sort === 'budget-high') return b.budget - a.budget;
    if (sort === 'budget-low') return a.budget - b.budget;
    return sort === 'oldest' ? a.createdAt.localeCompare(b.createdAt) : b.createdAt.localeCompare(a.createdAt);
  }), [campaigns, query, status, category, platform, sort]);
  const categories = [...new Set(campaigns.map((c) => c.category))];

  return <div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div><h1 className="text-2xl font-black text-slate-900 tracking-tight">Campaign Briefs</h1><p className="text-xs text-slate-500">Create, save, publish, and manage collaboration briefs.</p></div>
      <button onClick={() => setShowCreateModal(true)} className="px-5 py-2.5 bg-[#EC4899] hover:bg-pink-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 self-start"><Plus className="w-4 h-4"/>Create campaign</button>
    </div>
    <Card className="p-4 border-slate-200/90 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
      <label className="relative sm:col-span-2 xl:col-span-1"><Search className="w-4 h-4 text-slate-400 absolute left-3 top-3"/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search campaign title" className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs"/></label>
      <select value={status} onChange={e => setStatus(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-500"><option value="all">All statuses</option>{['active','draft','paused','completed'].map(x=><option key={x}>{x}</option>)}</select>
      <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-500"><option value="all">All categories</option>{categories.map(x=><option key={x}>{x}</option>)}</select>
      <select value={platform} onChange={e => setPlatform(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-500"><option value="all">All platforms</option>{['instagram','youtube'].map(x=><option key={x}>{x}</option>)}</select>
      <select value={sort} onChange={e => setSort(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-500"><option value="latest">Latest First</option><option value="oldest">Oldest First</option><option value="budget-high">Budget: High to Low</option><option value="budget-low">Budget: Low to High</option></select>
    </Card>
    {visibleCampaigns.length === 0 ? <Card className="p-12 text-center"><Megaphone className="w-8 h-8 text-slate-300 mx-auto mb-3"/><p className="text-sm font-bold text-slate-700">No campaigns match these filters</p><p className="text-xs text-slate-400 mt-1">Try adjusting the search or create a new brief.</p></Card> : <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{visibleCampaigns.map(camp => <Card key={camp.id} className="p-5 border-slate-200/90 space-y-4">
      <div className="flex justify-between gap-3"><div><Badge variant={statusVariant(camp.status) as any}>{camp.status}</Badge><h3 className="text-base font-bold text-slate-900 mt-2">{camp.title}</h3></div><span className="text-lg font-black text-slate-900">₹{camp.budget.toLocaleString('en-IN')}</span></div>
      <p className="text-xs text-slate-600 line-clamp-2">{camp.description}</p><div className="flex flex-wrap gap-1">{camp.targetPlatforms.filter(p => p === 'instagram' || p === 'youtube').map(p=><span key={p} className="px-2 py-1 rounded-lg bg-slate-100 text-[10px] font-bold text-slate-600 capitalize">{p}</span>)}</div>
      <div className="grid grid-cols-2 text-xs bg-slate-50 p-3 rounded-xl"><span className="flex items-center gap-1.5 text-slate-600"><Users className="w-3.5 h-3.5"/>{camp.applicantsCount} applicants</span><span className="flex items-center gap-1.5 text-slate-600"><Calendar className="w-3.5 h-3.5"/>{camp.deadline}</span></div>
      <div className="border-t border-slate-100 pt-3 flex items-center justify-between"><Link to={`/brand/campaigns/${camp.id}`} className="text-xs font-bold text-[#EC4899] hover:underline flex gap-1">View details <ChevronRight className="w-3.5 h-3.5"/></Link><div className="flex gap-1"><button onClick={()=>updateCampaignStatus(camp.id, 'draft')} title="Save as draft" className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"><Save className="w-4 h-4"/></button><button onClick={()=>setEditing(camp)} title="Edit campaign" className="p-2 rounded-xl text-slate-500 hover:bg-pink-50 hover:text-[#EC4899] transition-colors"><Edit3 className="w-4 h-4"/></button><button onClick={()=>setDeleting(camp)} title="Delete campaign" className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors"><Trash2 className="w-4 h-4"/></button></div></div>
    </Card>)}</div>}
    <CreateCampaignModal isOpen={showCreateModal} onClose={()=>setShowCreateModal(false)}/>
    <CreateCampaignModal isOpen={!!editing} onClose={()=>setEditing(null)} campaign={editing}/>
    <Modal isOpen={!!deleting} onClose={()=>setDeleting(null)} title="Delete campaign?"><p className="text-xs text-slate-600">This removes <b>{deleting?.title}</b> from your campaign list. This action cannot be undone.</p><div className="flex justify-end gap-2 mt-6"><button onClick={()=>setDeleting(null)} className="px-4 py-2 text-xs font-bold text-slate-600">Keep campaign</button><button onClick={()=>{if(deleting) deleteCampaign(deleting.id);setDeleting(null)}} className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold">Delete campaign</button></div></Modal>
  </div>;
};
