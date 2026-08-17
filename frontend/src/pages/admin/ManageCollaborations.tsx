import React from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Briefcase, IndianRupee, ShieldCheck } from 'lucide-react';

export const ManageCollaborations: React.FC = () => {
  const { collaborations } = useApp();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Escrow Deals & Active Transactions</h1>
        <p className="text-xs text-slate-500">Global audit view of active contracts and payment releases</p>
      </div>

      <div className="space-y-4">
        {collaborations.map((collab) => (
          <Card key={collab.id} className="p-5 border-slate-200/90 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">{collab.campaignTitle}</h3>
                <Badge variant={collab.stage === 'completed' ? 'emerald' : 'purple'}>
                  {collab.stage}
                </Badge>
              </div>
              <p className="text-xs text-slate-500">
                Brand: <span className="font-semibold text-slate-700">{collab.brandName}</span> • Creator:{' '}
                <span className="font-semibold text-slate-700">{collab.creatorName}</span>
              </p>
            </div>

            <div className="text-right">
              <span className="text-lg font-black text-slate-900 block">₹{collab.agreedPrice.toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center justify-end gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Escrow Protected
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
