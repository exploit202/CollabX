import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { IndianRupee, Plus, Trash2, Edit, Save } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { DeliverablePricing } from '../../types';
import { EmptyState } from '../../components/common/EmptyState';
import { Skeleton } from '../../components/common/Skeleton';
import { AlertCircle, PackageOpen } from 'lucide-react';

export const CreatorPricing: React.FC = () => {
  const { user } = useAuth();
  const { creators, addToast } = useApp();

  const creator = creators.find((c) => c.id === user?.id) || creators[0];
  const [packages, setPackages] = useState(creator.pricing);

  const [newType, setNewType] = useState('');
  const [newPrice, setNewPrice] = useState(500);
  const [newDays, setNewDays] = useState(3);
  const [newDesc, setNewDesc] = useState('');
  const [editing, setEditing] = useState<DeliverablePricing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 250);
    return () => window.clearTimeout(timer);
  }, []);

  const handleAddPackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newType) return;

    const newItem = {
      id: `p-${Date.now()}`,
      type: newType,
      platform: 'instagram' as const,
      price: newPrice,
      deliveryDays: newDays,
      description: newDesc || 'High quality custom video deliverable.',
    };

    setPackages([...packages, newItem]);
    setNewType('');
    setNewDesc('');
    addToast('success', 'New Deliverable Package Added!');
  };

  const handleDeletePackage = (id: string) => {
    setPackages(packages.filter((p) => p.id !== id));
    addToast('info', 'Package removed');
  };

  const saveEdit = () => {
    if (!editing || !editing.type.trim() || editing.price < 1 || editing.deliveryDays < 1) return;
    setPackages((prev) => prev.map((pkg) => pkg.id === editing.id ? editing : pkg));
    setEditing(null);
    addToast('success', 'Package updated');
  };

  if (loading) return <div className="space-y-5 max-w-4xl"><Skeleton className="h-9 w-72"/><Skeleton className="h-32 w-full"/><Skeleton className="h-64 w-full"/></div>;
  if (error) return <EmptyState icon={AlertCircle} title="Packages could not be loaded" description={error} actionLabel="Try again" onAction={() => setError('')} />;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Pricing & Deliverable Packages</h1>
        <p className="text-xs text-slate-500">Define your base starting rates and deliverable terms visible to brands</p>
      </div>

      <div className="space-y-4">
        {packages.length === 0 ? <EmptyState icon={PackageOpen} title="No packages yet" description="Add your first offering to show brands your pricing and deliverables."/> : packages.map((pkg) => (
          <Card key={pkg.id} className="p-5 border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-sm font-bold text-slate-900 block">{pkg.type}</span>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{pkg.platform}</p>
              <p className="text-xs text-slate-500 max-w-xl"><span className="font-semibold text-slate-700">Includes: </span>{pkg.description}</p>
              <span className="text-[11px] text-purple-600 font-semibold block">
                Turnaround: {pkg.deliveryDays} business days
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xl font-black text-slate-900">₹{pkg.price.toLocaleString('en-IN')}</span>
              <button onClick={() => setEditing({ ...pkg })} className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl" aria-label={`Edit ${pkg.type}`}><Edit className="w-4 h-4" /></button>
              <button
                onClick={() => handleDeletePackage(pkg.id)}
                className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Package Card */}
      <Card className="p-6 border-slate-200/90 space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Add New Deliverable Option</h3>
        <form onSubmit={handleAddPackage} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Package Name / Deliverable</label>
            <input
              type="text"
              placeholder="e.g. Instagram Story Series (3 Stories)"
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Price Rate (₹)</label>
              <input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(Number(e.target.value))}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Turnaround Days</label>
              <input
                type="number"
                value={newDays}
                onChange={(e) => setNewDays(Number(e.target.value))}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Deliverable Specifications</label>
            <textarea
              rows={2}
              placeholder="What is included? e.g. 4K footage, brand tag in caption, 30 days usage rights..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-[#EC4899] hover:bg-pink-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Save Package
          </button>
        </form>
      </Card>
      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Edit package">
        {editing && <div className="space-y-3"><input value={editing.type} onChange={e => setEditing({...editing, type:e.target.value})} className="w-full rounded-xl border bg-slate-50 p-3 text-xs"/><div className="grid grid-cols-2 gap-3"><input type="number" min="1" value={editing.price} onChange={e => setEditing({...editing, price:Number(e.target.value)})} className="rounded-xl border bg-slate-50 p-3 text-xs"/><input type="number" min="1" value={editing.deliveryDays} onChange={e => setEditing({...editing, deliveryDays:Number(e.target.value)})} className="rounded-xl border bg-slate-50 p-3 text-xs"/></div><textarea value={editing.description} onChange={e => setEditing({...editing, description:e.target.value})} rows={3} className="w-full rounded-xl border bg-slate-50 p-3 text-xs"/><div className="flex justify-end gap-2"><button onClick={() => setEditing(null)} className="px-4 py-2 text-xs">Cancel</button><button onClick={saveEdit} className="px-4 py-2 rounded-xl bg-[#EC4899] text-white text-xs font-bold">Save changes</button></div></div>}
      </Modal>
    </div>
  );
};
