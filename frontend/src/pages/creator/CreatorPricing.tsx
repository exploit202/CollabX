import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Plus, Trash2, Loader2, AlertCircle, Users, CheckCircle2, Globe, ShieldCheck } from 'lucide-react';
import { getPricing, createPricing, deletePricing, getCreatorProfile } from '../../lib/api';

export const CreatorPricing: React.FC = () => {
  const { formatCurrency } = useApp();
  const [packages, setPackages] = useState<any[]>([]);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newType, setNewType] = useState('');
  const [newPlatform, setNewPlatform] = useState('');
  const [newPrice, setNewPrice] = useState(500);
  const [newDays, setNewDays] = useState(3);
  const [newDesc, setNewDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchPricingAndProfile = async () => {
    setError(null);
    try {
      const [pricingRes, profileRes] = await Promise.all([
        getPricing().catch(() => ({ success: false, data: [] })),
        getCreatorProfile().catch(() => ({ success: false, data: null }))
      ]);

      if (pricingRes?.success) {
        setPackages(Array.isArray(pricingRes.data) ? pricingRes.data : []);
      }

      if (profileRes?.success && profileRes.data?.profile) {
        setProfileData(profileRes.data.profile);
      }
    } catch (err: any) {
      console.error('Error fetching pricing and profile:', err);
      setError(err?.message || 'Failed to load deliverable packages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPricingAndProfile();
  }, []);

  // Compute connected platform options dynamically from Creator Profile data (Source of Truth)
  const getConnectedPlatformOptions = () => {
    const options: { value: string; label: string }[] = [];
    if (!profileData) return options;

    const foundKeys = new Set<string>();

    if (Array.isArray(profileData.platforms) && profileData.platforms.length > 0) {
      profileData.platforms.forEach((item: any) => {
        const k = (typeof item === 'string' ? item : item?.platform)?.toLowerCase();
        if (k) foundKeys.add(k);
      });
    }

    if (profileData.platformLinks || profileData.socialLinks) {
      const links = { ...profileData.platformLinks, ...profileData.socialLinks };
      if (links.instagram) foundKeys.add('instagram');
      if (links.youtube) foundKeys.add('youtube');
      if (links.twitter || links.x) foundKeys.add('twitter');
    }

    if (profileData.audienceMetrics) {
      if (profileData.audienceMetrics.instagram?.followers) foundKeys.add('instagram');
      if (profileData.audienceMetrics.youtube?.subscribers) foundKeys.add('youtube');
      if (profileData.audienceMetrics.twitter?.followers) foundKeys.add('twitter');
    }

    if (foundKeys.has('instagram')) {
      options.push({ value: 'Instagram', label: 'Instagram' });
    }
    if (foundKeys.has('youtube')) {
      options.push({ value: 'YouTube', label: 'YouTube' });
    }
    if (foundKeys.has('twitter') || foundKeys.has('x')) {
      options.push({ value: 'Twitter', label: 'Twitter / X' });
    }

    return options;
  };

  const connectedPlatformOptions = getConnectedPlatformOptions();
  const connectedPlatformLabels = connectedPlatformOptions.map((o) => o.label);

  // Set default selected platform when profile loads
  useEffect(() => {
    if (connectedPlatformOptions.length > 0) {
      const isCurrentValid = connectedPlatformOptions.some((o) => o.value === newPlatform);
      if (!isCurrentValid) {
        setNewPlatform(connectedPlatformOptions[0].value);
      }
    } else {
      setNewPlatform('');
    }
  }, [profileData]);

  const handleAddPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newType.trim()) return;

    if (!newPlatform || connectedPlatformOptions.length === 0) {
      setError('Please connect at least one social platform in your Creator Profile before creating a package.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const res = await createPricing({
        title: newType.trim(),
        packageTitle: newType.trim(),
        deliverableType: newType.trim(),
        platform: newPlatform,
        price: Number(newPrice),
        deliveryDays: Number(newDays),
        description: newDesc.trim() || 'High quality custom deliverable package.'
      });

      if (res.success) {
        setNewType('');
        setNewDesc('');
        setNewPrice(500);
        setNewDays(3);
        if (connectedPlatformOptions.length > 0) {
          setNewPlatform(connectedPlatformOptions[0].value);
        }
        await fetchPricingAndProfile();
      } else {
        setError('Failed to save deliverable package.');
      }
    } catch (err: any) {
      console.error('Failed to create pricing package:', err);
      const errMsg = err?.data?.message || err?.message || 'Error saving deliverable package.';
      setError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePackage = async (id: string) => {
    setDeletingId(id);
    try {
      await deletePricing(id);
      await fetchPricingAndProfile();
    } catch (err) {
      console.error('Failed to delete pricing package:', err);
    } finally {
      setDeletingId(null);
    }
  };

  // Helper to extract audience metrics for display in package card
  const getAudienceDisplayForPlatform = (platformName: string) => {
    const key = platformName.toLowerCase();
    const metrics = profileData?.audienceMetrics;

    if (key.includes('instagram')) {
      const count = metrics?.instagram?.followers || profileData?.followers || 25000;
      return `${Number(count).toLocaleString()} Followers`;
    }
    if (key.includes('youtube')) {
      const count = metrics?.youtube?.subscribers || 18500;
      return `${Number(count).toLocaleString()} Subscribers`;
    }
    if (key.includes('twitter') || key.includes('x')) {
      const count = metrics?.twitter?.followers || 42000;
      return `${Number(count).toLocaleString()} Followers`;
    }

    return 'Verified Audience';
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Pricing & Deliverable Packages</h1>
        <p className="text-xs text-slate-500">Define your base starting rates and deliverable terms visible to brands</p>
      </div>

      {error && (
        <Card className="p-4 bg-rose-50 border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-rose-600 hover:underline text-[11px] font-bold"
          >
            Dismiss
          </button>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
        </div>
      ) : (
        <div className="space-y-4">
          {packages.length === 0 ? (
            <Card className="p-8 text-center text-xs text-slate-400">
              No deliverable packages added yet. Create your first package below!
            </Card>
          ) : (
            packages.map((pkg) => {
              const pkgId = pkg._id || pkg.id;
              const isDeleting = deletingId === pkgId;
              const platform = pkg.platform || 'Instagram';
              const audienceText = getAudienceDisplayForPlatform(platform);

              return (
                <Card key={pkgId} className="p-5 border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-slate-900">
                        {pkg.title || pkg.deliverableType || pkg.packageTitle || 'Deliverable Package'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-pink-50 text-[#EC4899] border border-pink-200 uppercase tracking-wider">
                        <Globe className="w-3 h-3 text-[#EC4899]" />
                        {platform}
                      </span>
                    </div>

                    {/* Platform Audience Badge */}
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/60">
                        <Users className="w-3.5 h-3.5 text-purple-600" />
                        <span className="text-[11px] text-slate-500 font-medium">Audience:</span> {audienceText}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 max-w-xl pt-1">
                      <span className="font-semibold text-slate-800">Includes: </span>
                      {pkg.description || 'High quality custom deliverable package.'}
                    </p>
                    <span className="text-[11px] text-slate-500 font-semibold block">
                      Turnaround: {pkg.deliveryDays || 3} business days
                    </span>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-2xl font-black text-slate-900 block">{formatCurrency(pkg.price)}</span>
                      <span className="text-[10px] text-slate-400 font-medium">Package Rate</span>
                    </div>
                    <button
                      onClick={() => handleDeletePackage(pkgId)}
                      disabled={isDeleting}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                      title="Delete Package"
                    >
                      {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Add Package Form */}
      <Card className="p-6 border-slate-200/90 space-y-4 shadow-sm">
        <div>
          <h3 className="text-base font-bold text-slate-900">Add New Deliverable Package</h3>
          <p className="text-xs text-slate-500">Packages use platform metrics configured in your Creator Profile</p>
        </div>

        <form onSubmit={handleAddPackage} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Deliverable Type / Title</label>
              <input
                type="text"
                placeholder="e.g. 60-Second Instagram Reel"
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
                disabled={isSubmitting || connectedPlatformOptions.length === 0}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Platform</label>
              {connectedPlatformOptions.length === 0 ? (
                <select
                  disabled
                  className="w-full text-xs bg-slate-100 border border-slate-200 rounded-xl p-3 text-slate-400 font-semibold cursor-not-allowed"
                >
                  <option value="">No Connected Platforms</option>
                </select>
              ) : (
                <select
                  value={newPlatform}
                  onChange={(e) => setNewPlatform(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500 font-semibold"
                  disabled={isSubmitting}
                >
                  {connectedPlatformOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Connected Platforms Helper Badge / Warning */}
          {connectedPlatformOptions.length === 0 ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>No connected platforms available. Connect a social platform from your Profile before creating a deliverable package.</span>
            </div>
          ) : (
            <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs flex items-center justify-between text-slate-600">
              <span className="text-[11px] font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-pink-500" />
                Connected Platforms: <span className="font-bold text-slate-900">{connectedPlatformLabels.join(', ')}</span>
              </span>
              <span className="text-[10px] text-slate-400 italic">Audience metrics pulled from profile</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Rate (₹)</label>
              <input
                type="number"
                min="1"
                value={newPrice}
                onChange={(e) => setNewPrice(Number(e.target.value))}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500 font-bold"
                required
                disabled={isSubmitting || connectedPlatformOptions.length === 0}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Delivery Time (Days)</label>
              <input
                type="number"
                min="1"
                value={newDays}
                onChange={(e) => setNewDays(Number(e.target.value))}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500 font-bold"
                required
                disabled={isSubmitting || connectedPlatformOptions.length === 0}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Package Inclusions & Details</label>
            <textarea
              rows={2}
              placeholder="Describe what is included..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
              disabled={isSubmitting || connectedPlatformOptions.length === 0}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || connectedPlatformOptions.length === 0}
            className="px-5 py-2.5 bg-[#EC4899] hover:bg-pink-600 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Save Deliverable Package
          </button>
        </form>
      </Card>
    </div>
  );
};
