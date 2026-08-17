import React from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Settings, Lock, Bell, CreditCard } from 'lucide-react';

export const CreatorSettings: React.FC = () => {
  const { addToast } = useApp();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Account & Payout Settings</h1>
        <p className="text-xs text-slate-500">Manage security details, bank payout methods, and brand pitch alerts</p>
      </div>

      <Card className="p-6 md:p-8 border-slate-200/90 shadow-md space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-600" /> Payout Method (Stripe Direct Connect)
          </h3>
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-emerald-900 block">Connected Bank Account: Stripe ****4829</span>
              <span className="text-emerald-700 text-[11px]">Automatic 48-hour payout upon brand deliverable approval</span>
            </div>
            <button
              onClick={() => addToast('info', 'Redirecting to Stripe Express Portal...')}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-[11px]"
            >
              Manage Payouts
            </button>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-purple-600" /> Security & Password
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800"
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
