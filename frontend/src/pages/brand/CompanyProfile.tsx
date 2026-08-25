import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Building2, Save, Upload, Instagram, Linkedin, Loader2 } from 'lucide-react';
import { getBrandProfile, updateBrandProfile, uploadBrandProfileImage } from '../../lib/api';

const categories = ['Tech & Gadgets', 'Fashion & Lifestyle', 'Fitness & Wellness', 'Gaming', 'Travel', 'Beauty & Skincare'];
const platforms = ['Instagram', 'YouTube', 'X / Twitter'];

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="block text-xs font-semibold text-slate-700">
    <span className="block mb-1">{label}</span>
    {children}
  </label>
);

const input = 'w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-pink-500';

export const CompanyProfile: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const { addToast } = useApp();
  const brand = user as any;

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [logo, setLogo] = useState(brand?.logo || brand?.companyLogo || brand?.profileImage?.url || brand?.profileImage || '');
  const [companyName, setCompanyName] = useState(brand?.companyName || brand?.name || '');
  const [industry, setIndustry] = useState(brand?.industry || '');
  const [website, setWebsite] = useState(brand?.website || '');
  const [country, setCountry] = useState(brand?.country || '');
  const [description, setDescription] = useState(brand?.description || brand?.aboutBrand || '');
  const [contactName, setContactName] = useState(brand?.contactName || brand?.name || '');
  const [contactRole, setContactRole] = useState(brand?.contactRole || '');
  const [instagramUrl, setInstagramUrl] = useState(brand?.instagramUrl || brand?.socialLinks?.instagram || '');
  const [linkedinUrl, setLinkedinUrl] = useState(brand?.linkedinUrl || brand?.socialLinks?.linkedin || '');
  const [targetAudience, setTargetAudience] = useState(brand?.targetAudience || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(brand?.preferredCreatorCategories || []);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(brand?.preferredPlatforms || []);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchBrandProfile = async () => {
      try {
        const res = await getBrandProfile();
        if (res.success && res.data?.profile) {
          const p = res.data.profile;
          const imgUrl = p.profileImage?.url || p.companyLogo || p.userId?.profileImage || null;
          if (imgUrl) setLogo(imgUrl);
          if (p.companyName) setCompanyName(p.companyName);
          if (p.industry) setIndustry(p.industry);
          if (p.website) setWebsite(p.website);
          if (p.location?.country) setCountry(p.location.country);
          if (p.aboutBrand) setDescription(p.aboutBrand);
          if (p.contactName) setContactName(p.contactName);
          if (p.contactRole) setContactRole(p.contactRole);
          if (p.socialLinks?.instagram) setInstagramUrl(p.socialLinks.instagram);
          if (p.socialLinks?.linkedin) setLinkedinUrl(p.socialLinks.linkedin);
          if (p.targetAudience) setTargetAudience(p.targetAudience);
          if (p.preferredCreatorCategories) setSelectedCategories(p.preferredCreatorCategories);
          if (p.preferredPlatforms) setSelectedPlatforms(p.preferredPlatforms);
        }
      } catch (err) {
        console.error('Failed to fetch brand profile:', err);
      }
    };
    fetchBrandProfile();
  }, []);

  const toggle = (value: string, values: string[], set: (v: string[]) => void) =>
    set(values.includes(value) ? values.filter((x) => x !== value) : [...values, value]);

  const handleImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate File Type
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    if (!allowedMimeTypes.includes(file.type) && !allowedExtensions.includes(ext)) {
      addToast('error', 'Unsupported File Type', 'Please select a JPG, JPEG, PNG, or WEBP image.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate File Size (5 MB max)
    if (file.size > 5 * 1024 * 1024) {
      addToast('error', 'File Size Limit Exceeded', 'Brand image size must not exceed 5 MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploadingImage(true);

    try {
      const res = await uploadBrandProfileImage(file);
      if (res.success && (res.data?.profileImage?.url || res.data?.user?.profileImage)) {
        const imageUrl = res.data.profileImage?.url || res.data.user?.profileImage;

        setLogo(imageUrl);
        updateUserProfile({ logo: imageUrl, companyLogo: imageUrl, profileImage: imageUrl });

        addToast('success', 'Brand Logo Updated!', 'Your brand image has been uploaded successfully.');
      }
    } catch (err: any) {
      console.error('Failed to upload brand profile image:', err);
      const errMsg = err?.message || err?.data?.message || 'Failed to upload brand profile image. Please try again.';
      addToast('error', 'Upload Failed', errMsg);
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      addToast('error', 'Please enter your company name');
      return;
    }
    setSaving(true);
    const profilePayload = {
      companyName,
      industry,
      website,
      country,
      description,
      logo,
      contactName,
      contactRole,
      instagramUrl,
      linkedinUrl,
      targetAudience,
      preferredCreatorCategories: selectedCategories,
      preferredPlatforms: selectedPlatforms
    };

    try {
      await updateBrandProfile(profilePayload);
      updateUserProfile({ ...profilePayload, name: companyName });
      addToast('success', 'Company profile updated');
    } catch (err) {
      console.error('Failed to update brand profile:', err);
      addToast('error', 'Failed to update company profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Hidden File Input for Brand Logo Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleImageFileSelect}
        className="hidden"
      />

      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Company Profile</h1>
        <p className="text-xs text-slate-500">Manage the information creators see before accepting your invitations.</p>
      </div>

      <Card className="p-6 md:p-8 border-slate-200/90 shadow-md">
        <form onSubmit={submit} className="space-y-6">
          <div className="flex items-center gap-5 pb-5 border-b border-slate-100">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200/80 overflow-hidden flex items-center justify-center shrink-0">
              {logo ? (
                <img src={logo} alt="Company logo" className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-8 h-8 text-slate-400" />
              )}
            </div>
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
              >
                {isUploadingImage ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading Logo...
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" /> Upload Brand Logo
                  </>
                )}
              </button>
              <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, or WEBP · max 5 MB</p>
            </div>
          </div>

          <section className="space-y-4">
            <h2 className="text-sm font-bold">Company details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Company name">
                <input required value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={input} />
              </Field>
              <Field label="Industry">
                <input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. Technology, Fashion" className={input} />
              </Field>
              <Field label="Website">
                <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" className={input} />
              </Field>
              <Field label="Country">
                <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. India, United States" className={input} />
              </Field>
            </div>
            <Field label="Short company description">
              <textarea
                maxLength={260}
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={input}
              />
              <span className="text-[10px] text-slate-400">{description.length}/260</span>
            </Field>
          </section>

          <section className="space-y-4 pt-5 border-t">
            <h2 className="text-sm font-bold">Contact & social links</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Primary contact name">
                <input value={contactName} onChange={(e) => setContactName(e.target.value)} className={input} />
              </Field>
              <Field label="Contact role">
                <input
                  value={contactRole}
                  onChange={(e) => setContactRole(e.target.value)}
                  placeholder="e.g. Influencer Marketing Manager"
                  className={input}
                />
              </Field>
              <Field label="Instagram link">
                <div className="relative">
                  <Instagram className="w-4 h-4 absolute left-3 top-3 text-pink-500" />
                  <input
                    type="url"
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    placeholder="https://instagram.com/..."
                    className={`${input} pl-9`}
                  />
                </div>
              </Field>
              <Field label="LinkedIn link">
                <div className="relative">
                  <Linkedin className="w-4 h-4 absolute left-3 top-3 text-sky-600" />
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/company/..."
                    className={`${input} pl-9`}
                  />
                </div>
              </Field>
            </div>
          </section>

          <section className="space-y-4 pt-5 border-t">
            <h2 className="text-sm font-bold">Creator preferences</h2>
            <Field label="Target audience">
              <textarea
                rows={2}
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g. Young professionals interested in tech and productivity"
                className={input}
              />
            </Field>
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-2">Preferred creator categories</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((x) => (
                  <button
                    type="button"
                    key={x}
                    onClick={() => toggle(x, selectedCategories, setSelectedCategories)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                      selectedCategories.includes(x)
                        ? 'bg-pink-50 border-pink-300 text-pink-600'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    {x}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-2">Preferred platforms</p>
              <div className="flex flex-wrap gap-2">
                {platforms.map((x) => (
                  <button
                    type="button"
                    key={x}
                    onClick={() => toggle(x, selectedPlatforms, setSelectedPlatforms)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                      selectedPlatforms.includes(x)
                        ? 'bg-pink-50 border-pink-300 text-pink-600'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    {x}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <div className="flex justify-end pt-4 border-t">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#EC4899] hover:bg-pink-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save company profile
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};
