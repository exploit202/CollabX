import React from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Settings, Shield, Percent } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { addToast } = useApp();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Configuration</h1>
        <p className="text-xs text-slate-500">Platform-wide fee percentages, payout hold periods, and API integrations</p>
      </div>

      <Card className="p-6 md:p-8 border-slate-200/90 shadow-md space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Percent className="w-4 h-4 text-pink-500" /> Platform Fee Take-Rate
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Brand Service Fee (%)</label>
              <input
                type="number"
                defaultValue={10}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Creator Commission Fee (%)</label>
              <input
                type="number"
                defaultValue={5}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-900"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-3">
          <button
            onClick={() => addToast('success', 'System Config Updated!')}
            className="px-6 py-2.5 bg-[#EC4899] hover:bg-pink-600 text-white font-bold text-xs rounded-xl shadow-md"
          >
            Save System Config
          </button>
        </div>
      </Card>
    </div>
  );
};
