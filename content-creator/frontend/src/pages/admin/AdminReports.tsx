import React from 'react';
import { Card } from '../../components/common/Card';
import { ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const AdminReports: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Platform Audit & Security Disputes</h1>
        <p className="text-xs text-slate-500">Review flagged user disputes, contract breaches, and compliance logs</p>
      </div>

      <div className="space-y-4">
        <Card className="p-5 border-slate-200/90 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Deliverable Deadline Extended Dispute
            </span>
            <span className="text-[10px] text-slate-400">2 hours ago</span>
          </div>
          <p className="text-xs text-slate-700 font-medium">
            Brand "Apex Fitness" reported delay on reel delivery from Creator "Fitness Pro".
          </p>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg">Dismiss</button>
            <button className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-lg">Open Mediation</button>
          </div>
        </Card>
      </div>
    </div>
  );
};
