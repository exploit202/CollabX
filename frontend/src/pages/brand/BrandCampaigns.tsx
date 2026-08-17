import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { CreateCampaignModal } from '../../components/modals/CreateCampaignModal';
import { Megaphone, Plus, Search, Calendar, Users, ChevronRight, Loader2 } from 'lucide-react';
import { getBrandCampaigns } from '../../lib/api';

const statusVariant = (status: string) => status === 'active' ? 'emerald' : status === 'draft' ? 'amber' : 'slate';

export const BrandCampaigns: React.FC = () => {
  const { formatCurrency, formatDate } = useApp();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchCampaigns = async () => {
    try {
      const res = await getBrandCampaigns();
      if (res.success) {
        setCampaigns(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching brand campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const visibleCampaigns = useMemo(() => {
    return campaigns.filter((c) =>
      (c.title || '').toLowerCase().includes(query.toLowerCase()) &&
      (statusFilter === 'all' || c.status === statusFilter)
    );
  }, [campaigns, query, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Campaign Briefs</h1>
          <p className="text-xs text-slate-500">Create, save, publish, and manage collaboration briefs.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 bg-[#EC4899] hover:bg-pink-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create campaign
        </button>
      </div>

      <Card className="p-4 border-slate-200/90 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search campaign title"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs"
          />
        </label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="completed">Completed</option>
        </select>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
        </div>
      ) : visibleCampaigns.length === 0 ? (
        <Card className="p-12 text-center">
          <Megaphone className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700">No campaigns found</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting the search or create a new brief.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {visibleCampaigns.map((camp) => (
            <Card key={camp._id || camp.id} className="p-5 border-slate-200/90 space-y-4">
              <div className="flex justify-between gap-3">
                <div>
                  <Badge variant={statusVariant(camp.status) as any}>{camp.status}</Badge>
                  <h3 className="text-base font-bold text-slate-900 mt-2">{camp.title}</h3>
                </div>
                <span className="text-lg font-black text-slate-900">{formatCurrency(camp.budget || 0)}</span>
              </div>
              <p className="text-xs text-slate-600 line-clamp-2">{camp.description}</p>
              <div className="grid grid-cols-2 text-xs bg-slate-50 p-3 rounded-xl">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <Users className="w-3.5 h-3.5 text-purple-600" /> Category: {camp.category}
                </span>
                <span className="flex items-center gap-1.5 text-slate-600">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> {formatDate(camp.deadline)}
                </span>
              </div>
              <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                <Link
                  to={`/brand/campaigns/${camp._id || camp.id}`}
                  className="text-xs font-bold text-[#EC4899] hover:underline flex gap-1 items-center"
                >
                  View details <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateCampaignModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => fetchCampaigns()}
        />
      )}
    </div>
  );
};
