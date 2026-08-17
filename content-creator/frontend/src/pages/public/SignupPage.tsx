import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { ArrowRight, Building2, User, FileText, Mail, Loader2 } from 'lucide-react';
import { AuthShell } from '../../components/common/AuthShell';
import { TextField, PasswordField, SelectField } from '../../components/common/FormField';
import { CreatorSignupWizard } from '../../components/auth/CreatorSignupWizard';

const INDUSTRY_OPTIONS = [
  'Tech & Gadgets',
  'Fashion & Lifestyle',
  'Fitness & Wellness',
  'Gaming',
  'Travel',
  'Beauty & Skincare',
];

interface BrandFormState {
  name: string;
  email: string;
  password: string;
  category: string;
  bio: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Single-step signup form for Brand accounts. */
const BrandSignupForm: React.FC = () => {
  const [form, setForm] = useState<BrandFormState>({
    name: '',
    email: '',
    password: '',
    category: INDUSTRY_OPTIONS[0],
    bio: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof BrandFormState, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const update = (field: keyof BrandFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const errs: Partial<Record<keyof BrandFormState, string>> = {};
    if (!form.name.trim()) errs.name = 'Company / brand name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!EMAIL_RE.test(form.email)) errs.email = 'Enter a valid email address';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 8) errs.password = 'Use at least 8 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    // Placeholder for real registration call - backend integration pending.
    await new Promise((resolve) => setTimeout(resolve, 700));
    login('brand', { name: form.name, email: form.email, bio: form.bio, category: form.category });
    setIsSubmitting(false);
    navigate('/brand/dashboard');
  };

  return (
    <form onSubmit={handleSignup} className="space-y-4" noValidate>
      <TextField
        label="Company / Brand Name"
        required
        value={form.name}
        onChange={(v) => update('name', v)}
        error={errors.name}
        disabled={isSubmitting}
        placeholder="e.g. Acme Tech Studio"
      />
      <TextField
        label="Work Email"
        icon={Mail}
        type="email"
        required
        value={form.email}
        onChange={(v) => update('email', v)}
        error={errors.email}
        disabled={isSubmitting}
        placeholder="name@domain.com"
      />
      <SelectField
        label="Industry"
        value={form.category}
        onChange={(v) => update('category', v)}
        options={INDUSTRY_OPTIONS.map((n) => ({ value: n, label: n }))}
        disabled={isSubmitting}
      />
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-semibold text-slate-700">
            About Your Brand <span className="text-slate-400 font-medium">(optional)</span>
          </label>
          <span className={`text-[10px] font-semibold ${form.bio.length > 200 ? 'text-rose-500' : 'text-slate-400'}`}>
            {form.bio.length}/200
          </span>
        </div>
        <div className="relative">
          <FileText className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <textarea
            value={form.bio}
            onChange={(e) => update('bio', e.target.value)}
            rows={3}
            maxLength={200}
            disabled={isSubmitting}
            placeholder="e.g. We build smart home gadgets for young professionals — looking for tech creators who can show real use cases."
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none disabled:opacity-60"
          />
        </div>
      </div>
      <PasswordField
        label="Password"
        required
        showStrength
        value={form.password}
        onChange={(v) => update('password', v)}
        error={errors.password}
        disabled={isSubmitting}
        placeholder="At least 8 characters"
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 bg-[#EC4899] hover:bg-pink-600 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Creating Account...
          </>
        ) : (
          <>
            Create Brand Account
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
};

export const SignupPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialRole = (searchParams.get('role') as UserRole) === 'creator' ? 'creator' : 'brand';
  const [role, setRole] = useState<'brand' | 'creator'>(initialRole);

  return (
    <AuthShell
      title="Create Your Account"
      subtitle="Join the leading creator collaboration marketplace"
      maxWidth="max-w-lg"
    >
      {/* Account Role Selection */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        <button
          type="button"
          onClick={() => {
            setRole('brand');
            setSearchParams({ role: 'brand' });
          }}
          className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            role === 'brand'
              ? 'border-[#EC4899] bg-pink-50 text-[#EC4899] shadow-xs'
              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Sign Up as Brand
        </button>
        <button
          type="button"
          onClick={() => {
            setRole('creator');
            setSearchParams({ role: 'creator' });
          }}
          className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            role === 'creator'
              ? 'border-[#EC4899] bg-pink-50 text-[#EC4899] shadow-xs'
              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <User className="w-4 h-4" />
          Sign Up as Creator
        </button>
      </div>

      {role === 'brand' ? <BrandSignupForm /> : <CreatorSignupWizard />}

      <p className="text-center text-xs text-slate-500 mt-6">
        Already have an account?{' '}
        <Link to={`/login?role=${role}`} className="font-bold text-pink-600 hover:underline">
          Log In
        </Link>
      </p>
    </AuthShell>
  );
};
