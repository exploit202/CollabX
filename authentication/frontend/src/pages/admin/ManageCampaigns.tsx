import React from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Megaphone, Trash2, ShieldAlert } from 'lucide-react';

export const ManageCampaigns: React.FC = () => {
  const { campaigns, addToast } = useApp();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Campaign Brief Moderation</h1>
        <p className="text-xs text-slate-500">Review brand brief compliance, budget allocation, and content policies</p>
      </div>

      <div className="space-y-4">
        {campaigns.map((camp) => (
          <Card key={camp.id} className="p-5 border-slate-200/90 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <Badge variant={camp.status === 'active' ? 'emerald' : 'slate'}>{camp.status}</Badge>
                <h3 className="text-base font-bold text-slate-900 mt-1">{camp.title}</h3>
                <p className="text-xs text-slate-500">Brand: {camp.brandName}</p>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xl font-black text-slate-900">${camp.budget.toLocaleString()}</span>
                <button
                  onClick={() => addToast('error', `Campaign brief "${camp.title}" taken down for moderation`)}
                  className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-bold flex items-center gap-1"
                >
                  <ShieldAlert className="w-4 h-4" /> Flag Brief
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
              {camp.description}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
};
