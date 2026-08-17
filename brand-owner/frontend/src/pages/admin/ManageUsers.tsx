import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Users, Shield, CheckCircle2, XCircle, Search, Trash2 } from 'lucide-react';

export const ManageUsers: React.FC = () => {
  const { creators, addToast } = useApp();
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Manage Platform Users</h1>
          <p className="text-xs text-slate-500">View, verify, suspend, or audit all registered Brand and Creator accounts</p>
        </div>
      </div>

      <Card className="p-4 border-slate-200/80">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search users by name, email, role, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-800"
          />
        </div>
      </Card>

      <Card className="p-6 border-slate-200/80 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="pb-3">User Profile</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Category / Industry</th>
                <th className="pb-3">Verification</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {creators.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="py-3.5 flex items-center gap-3">
                    <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{user.name}</h4>
                      <span className="text-[10px] text-slate-400">ID: {user.id}</span>
                    </div>
                  </td>
                  <td className="py-3.5">
                    <Badge variant="purple">Creator</Badge>
                  </td>
                  <td className="py-3.5 text-slate-600">{user.category}</td>
                  <td className="py-3.5">
                    <Badge variant={user.verified ? 'emerald' : 'amber'}>
                      {user.verified ? 'Verified' : 'Unverified'}
                    </Badge>
                  </td>
                  <td className="py-3.5 text-right space-x-2">
                    <button
                      onClick={() => addToast('success', `${user.name} verification status updated`)}
                      className="px-3 py-1 bg-emerald-100 text-emerald-700 font-bold rounded-lg text-[11px]"
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => addToast('error', `Account ${user.name} suspended`)}
                      className="px-3 py-1 bg-rose-100 text-rose-700 font-bold rounded-lg text-[11px]"
                    >
                      Suspend
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
