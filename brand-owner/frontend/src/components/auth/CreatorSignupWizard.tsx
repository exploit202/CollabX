import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Instagram,
  Youtube,
  Twitter,
  User as UserIcon,
  Mail,
  Phone,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  RotateCw,
  PartyPopper,
  LucideIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { StepProgress } from '../common/StepProgress';
import { TextField, PasswordField, SelectField } from '../common/FormField';
import { OtpInput } from '../common/OtpInput';

const STEP_LABELS = ['Basic Info', 'Platforms', 'Verify Links', 'Confirm Email', 'Done'];

const NICHE_OPTIONS = [
  'Tech & Gadgets',
  'Fashion & Lifestyle',
  'Fitness & Wellness',
  'Gaming',
  'Travel',
  'Beauty & Skincare',
];

type PlatformKey = 'instagram' | 'youtube' | 'twitter';

const PLATFORM_OPTIONS: { key: PlatformKey; label: string; icon: LucideIcon; placeholder: string; color: string }[] = [
  { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: '@yourhandle', color: 'from-pink-500 to-purple-500' },
  { key: 'youtube', label: 'YouTube', icon: Youtube, placeholder: 'youtube.com/@yourchannel', color: 'from-red-500 to-red-600' },
  { key: 'twitter', label: 'Twitter / X', icon: Twitter, placeholder: '@yourhandle', color: 'from-sky-500 to-sky-600' },
];

type LinkStatus = 'idle' | 'verifying' | 'verified' | 'error';

interface BasicInfo {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  category: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const CreatorSignupWizard: React.FC = () => {
  const [step, setStep] = useState(0);
  const { login } = useAuth();
  const { addToast } = useApp();
  const navigate = useNavigate();

  // Step 1 - Basic Information
  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    category: NICHE_OPTIONS[0],
  });
  const [basicErrors, setBasicErrors] = useState<Partial<Record<keyof BasicInfo, string>>>({});

  // Step 2 - Platform Selection
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformKey[]>([]);
  const [platformError, setPlatformError] = useState('');

  // Step 3 - Platform Links + Mock Verification
  const [links, setLinks] = useState<Record<string, string>>({});
  const [linkStatus, setLinkStatus] = useState<Record<string, LinkStatus>>({});

  // Step 4 - OTP
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(30);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  useEffect(() => {
    if (step !== 3) return;
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [step, resendCooldown]);

  const updateBasic = (field: keyof BasicInfo, value: string) => {
    setBasicInfo((prev) => ({ ...prev, [field]: value }));
    if (basicErrors[field]) setBasicErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateBasicInfo = (): boolean => {
    const errs: Partial<Record<keyof BasicInfo, string>> = {};
    if (!basicInfo.name.trim()) errs.name = 'Full name or creator alias is required';
    if (!basicInfo.email.trim()) errs.email = 'Email is required';
    else if (!EMAIL_RE.test(basicInfo.email)) errs.email = 'Enter a valid email address';
    if (!basicInfo.phone.trim()) errs.phone = 'Phone number is required';
    if (!basicInfo.password) errs.password = 'Password is required';
    else if (basicInfo.password.length < 8) errs.password = 'Use at least 8 characters';
    if (basicInfo.confirmPassword !== basicInfo.password) errs.confirmPassword = 'Passwords do not match';
    setBasicErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const togglePlatform = (key: PlatformKey) => {
    setPlatformError('');
    setSelectedPlatforms((prev) => (prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]));
  };

  const handleLinkChange = (key: string, value: string) => {
    setLinks((prev) => ({ ...prev, [key]: value }));
    setLinkStatus((prev) => ({ ...prev, [key]: 'idle' }));
  };

  const verifyLink = (key: string) => {
    if (!links[key]?.trim()) return;
    setLinkStatus((prev) => ({ ...prev, [key]: 'verifying' }));
    // Mock verification - UI only, no real backend call.
    setTimeout(() => {
      setLinkStatus((prev) => ({ ...prev, [key]: 'verified' }));
    }, 1200);
  };

  const allLinksVerified = selectedPlatforms.every((p) => linkStatus[p] === 'verified');

  const goNext = () => {
    if (step === 0) {
      if (!validateBasicInfo()) return;
    }
    if (step === 1) {
      if (selectedPlatforms.length === 0) {
        setPlatformError('Select at least one platform to continue');
        return;
      }
    }
    if (step === 2 && !allLinksVerified) return;
    setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleResendOtp = () => {
    if (resendCooldown > 0) return;
    setResendCooldown(30);
    addToast('info', 'OTP Resent', `A new code was sent to ${basicInfo.email}`);
  };

  const handleVerifyOtp = () => {
    setOtpError('');
    if (otp.length !== 6) {
      setOtpError('Enter the complete 6-digit code');
      return;
    }
    setOtpVerifying(true);
    // Mock OTP check - UI only. Any complete 6-digit code is accepted.
    setTimeout(() => {
      setOtpVerifying(false);
      setIsCreatingAccount(true);
      setTimeout(() => {
        setIsCreatingAccount(false);
        login('creator', {
          name: basicInfo.name,
          email: basicInfo.email,
          phone: basicInfo.phone,
          category: basicInfo.category,
        });
        setStep(4);
      }, 900);
    }, 900);
  };

  return (
    <div>
      <StepProgress steps={STEP_LABELS} currentStep={step} className="mb-7" />

      {/* Step 1: Basic Information */}
      {step === 0 && (
        <div className="space-y-4">
          <TextField
            label="Full Name or Creator Alias"
            icon={UserIcon}
            required
            value={basicInfo.name}
            onChange={(v) => updateBasic('name', v)}
            error={basicErrors.name}
            placeholder="e.g. Aria Chen"
          />
          <TextField
            label="Email Address"
            icon={Mail}
            type="email"
            required
            value={basicInfo.email}
            onChange={(v) => updateBasic('email', v)}
            error={basicErrors.email}
            placeholder="creator@example.com"
          />
          <TextField
            label="Phone Number"
            icon={Phone}
            type="tel"
            required
            value={basicInfo.phone}
            onChange={(v) => updateBasic('phone', v)}
            error={basicErrors.phone}
            placeholder="+91 98765 43210"
          />
          <SelectField
            label="Primary Content Niche"
            value={basicInfo.category}
            onChange={(v) => updateBasic('category', v)}
            options={NICHE_OPTIONS.map((n) => ({ value: n, label: n }))}
          />
          <PasswordField
            label="Password"
            required
            showStrength
            value={basicInfo.password}
            onChange={(v) => updateBasic('password', v)}
            error={basicErrors.password}
            placeholder="At least 8 characters"
          />
          <PasswordField
            label="Confirm Password"
            required
            value={basicInfo.confirmPassword}
            onChange={(v) => updateBasic('confirmPassword', v)}
            error={basicErrors.confirmPassword}
            placeholder="Re-enter password"
          />
        </div>
      )}

      {/* Step 2: Platform Selection */}
      {step === 1 && (
        <div className="space-y-4">
          <p className="text-xs text-slate-500">Select the platforms where you create content. You can add more later from your profile.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PLATFORM_OPTIONS.map(({ key, label, icon: Icon, color }) => {
              const active = selectedPlatforms.includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => togglePlatform(key)}
                  className={`relative p-4 rounded-xl border text-left transition-all ${
                    active ? 'border-[#EC4899] bg-pink-50/60 shadow-xs' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {active && (
                    <CheckCircle2 className="w-4 h-4 text-[#EC4899] absolute top-3 right-3" />
                  )}
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-tr ${color} flex items-center justify-center text-white mb-2`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-bold text-slate-800">{label}</p>
                </button>
              );
            })}
          </div>
          {platformError && <p className="text-[10px] font-semibold text-rose-500">{platformError}</p>}
        </div>
      )}

      {/* Step 3: Platform Links with Mock Verification */}
      {step === 2 && (
        <div className="space-y-4">
          <p className="text-xs text-slate-500">Add your handle or profile link for each platform, then verify ownership.</p>
          {selectedPlatforms.map((key) => {
            const opt = PLATFORM_OPTIONS.find((p) => p.key === key)!;
            const status = linkStatus[key] || 'idle';
            return (
              <div key={key}>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1">
                  <opt.icon className="w-3.5 h-3.5" /> {opt.label}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={links[key] || ''}
                    onChange={(e) => handleLinkChange(key, e.target.value)}
                    disabled={status === 'verified'}
                    placeholder={opt.placeholder}
                    className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-70 disabled:bg-emerald-50/50"
                  />
                  <button
                    type="button"
                    onClick={() => verifyLink(key)}
                    disabled={!links[key]?.trim() || status === 'verifying' || status === 'verified'}
                    className={`px-3.5 py-2 rounded-xl text-[11px] font-bold flex items-center gap-1.5 shrink-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                      status === 'verified'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {status === 'verifying' ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying
                      </>
                    ) : status === 'verified' ? (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" /> Verified
                      </>
                    ) : (
                      'Verify'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Step 4: Email OTP Verification */}
      {step === 3 && (
        <div className="space-y-5 text-center py-2">
          <div className="w-12 h-12 rounded-full bg-pink-50 text-[#EC4899] flex items-center justify-center mx-auto">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Verify Your Email</h4>
            <p className="text-xs text-slate-500 mt-1">
              We've sent a 6-digit code to <b>{basicInfo.email || 'your email'}</b>
            </p>
          </div>
          <OtpInput value={otp} onChange={setOtp} error={otpError} disabled={otpVerifying || isCreatingAccount} />
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resendCooldown > 0}
            className="text-[11px] font-semibold text-pink-600 hover:underline disabled:text-slate-400 disabled:no-underline flex items-center gap-1 mx-auto"
          >
            <RotateCw className="w-3 h-3" />
            {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}
          </button>
        </div>
      )}

      {/* Step 5: Success */}
      {step === 4 && (
        <div className="text-center space-y-4 py-6">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#EC4899] to-[#8B5CF6] text-white flex items-center justify-center mx-auto shadow-lg">
            <PartyPopper className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-slate-900">You're All Set, {basicInfo.name.split(' ')[0] || 'Creator'}!</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Your creator account has been created and your email is verified. Let's build out your profile.
            </p>
          </div>
          <button
            onClick={() => navigate('/creator/dashboard')}
            className="w-full py-3 bg-[#EC4899] hover:bg-pink-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation */}
      {step < 3 && (
        <div className="flex items-center gap-3 mt-6">
          {step > 0 && (
            <button
              type="button"
              onClick={goBack}
              className="px-4 py-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-50 transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}
          <button
            type="button"
            onClick={goNext}
            disabled={step === 2 && !allLinksVerified}
            className="flex-1 py-3 bg-[#EC4899] hover:bg-pink-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            {step === 2 && !allLinksVerified ? 'Verify all links to continue' : 'Continue'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="flex items-center gap-3 mt-6">
          <button
            type="button"
            onClick={goBack}
            disabled={otpVerifying || isCreatingAccount}
            className="px-4 py-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-50 transition-all disabled:opacity-60"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button
            type="button"
            onClick={handleVerifyOtp}
            disabled={otpVerifying || isCreatingAccount || otp.length !== 6}
            className="flex-1 py-3 bg-[#EC4899] hover:bg-pink-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            {otpVerifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Verifying Code...
              </>
            ) : isCreatingAccount ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Creating Account...
              </>
            ) : (
              <>
                Verify & Create Account
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
