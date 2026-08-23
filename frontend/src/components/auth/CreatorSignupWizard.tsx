import React, { useState } from 'react';
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
  XCircle,
  LucideIcon,
  Link as LinkIcon,
  ShieldCheck,
  PartyPopper,
  Send
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCreatorSignup } from '../../context/CreatorSignupContext';
import { StepProgress } from '../common/StepProgress';
import { TextField, PasswordField, SelectField } from '../common/FormField';
import { OtpInput } from '../common/OtpInput';
import {
  registerCreator,
  updateCreatorPlatforms,
  verifyCreatorPlatformUrl,
  requestCreatorOtp,
  verifyCreatorOtp,
  setToken
} from '../../lib/api';

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
  { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/yourhandle', color: 'from-pink-500 to-purple-500' },
  { key: 'youtube', label: 'YouTube', icon: Youtube, placeholder: 'https://youtube.com/@yourchannel', color: 'from-red-500 to-red-600' },
  { key: 'twitter', label: 'Twitter / X', icon: Twitter, placeholder: 'https://x.com/yourhandle', color: 'from-sky-500 to-sky-600' },
];

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
  const { creator, setCreator, clearCreator } = useCreatorSignup();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    category: NICHE_OPTIONS[0],
  });
  const [basicErrors, setBasicErrors] = useState<Partial<Record<keyof BasicInfo, string>>>();
  const [apiError, setApiError] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformKey[]>(['instagram']);
  const [links, setLinks] = useState<Record<string, string>>({});
  const [verifying, setVerifying] = useState<Record<string, boolean>>({});
  const [verifiedLinks, setVerifiedLinks] = useState<Record<string, boolean>>({});
  const [linkErrors, setLinkErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [platformError, setPlatformError] = useState('');

  // OTP State
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpSuccessMsg, setOtpSuccessMsg] = useState('');
  const [otpError, setOtpError] = useState('');

  const updateBasic = (field: keyof BasicInfo, value: string) => {
    setBasicInfo((prev) => ({ ...prev, [field]: value }));
    if (basicErrors?.[field]) setBasicErrors((prev) => ({ ...prev, [field]: undefined }));
    if (apiError) setApiError('');
  };

  const validateBasicInfo = (): boolean => {
    const errs: Partial<Record<keyof BasicInfo, string>> = {};
    if (!basicInfo.name.trim()) errs.name = 'Full name is required';
    if (!basicInfo.email.trim()) errs.email = 'Email is required';
    else if (!EMAIL_RE.test(basicInfo.email)) errs.email = 'Enter a valid email address';
    if (!basicInfo.phone.trim()) errs.phone = 'Phone number is required';
    if (!basicInfo.password) errs.password = 'Password is required';
    else if (basicInfo.password.length < 6) errs.password = 'Password must be at least 6 characters';
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
    setVerifiedLinks((prev) => ({ ...prev, [key]: false }));
    setLinkErrors((prev) => ({ ...prev, [key]: '' }));
    setPlatformError('');
  };

  const handleVerifyLink = async (platform: PlatformKey) => {
    const url = links[platform]?.trim();
    if (!url) {
      setLinkErrors((prev) => ({ ...prev, [platform]: 'Please enter a profile URL first.' }));
      return;
    }

    setVerifying((prev) => ({ ...prev, [platform]: true }));
    setLinkErrors((prev) => ({ ...prev, [platform]: '' }));

    try {
      const res = await verifyCreatorPlatformUrl(platform, url);
      if (res.success && res.data?.verified) {
        setVerifiedLinks((prev) => ({ ...prev, [platform]: true }));
      } else {
        setVerifiedLinks((prev) => ({ ...prev, [platform]: false }));
        setLinkErrors((prev) => ({
          ...prev,
          [platform]: `Verification failed for ${platform}. Ensure URL is reachable and points to a valid profile.`
        }));
      }
    } catch (err: any) {
      setVerifiedLinks((prev) => ({ ...prev, [platform]: false }));
      setLinkErrors((prev) => ({
        ...prev,
        [platform]: err.message || `Unable to verify ${platform} profile URL.`
      }));
    } finally {
      setVerifying((prev) => ({ ...prev, [platform]: false }));
    }
  };

  const handleRegisterBasicInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateBasicInfo()) return;
    setIsSubmitting(true);
    setApiError('');

    try {
      const res = await registerCreator({
        fullName: basicInfo.name,
        email: basicInfo.email,
        phoneNumber: basicInfo.phone,
        primaryContentNiche: basicInfo.category,
        password: basicInfo.password,
        confirmPassword: basicInfo.confirmPassword,
      });

      if (res.success && res.data?.user) {
        if (res.data.signupToken) {
          setToken(res.data.signupToken);
        }
        const u = res.data.user;
        setCreator({
          userId: u._id || u.userId || u.id,
          fullName: u.fullName || basicInfo.name,
          email: u.email || basicInfo.email,
          role: 'creator'
        });
        setStep(1);
      }
    } catch (err: any) {
      setApiError(err.message || 'Creator registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSavePlatforms = async () => {
    if (selectedPlatforms.length === 0) {
      setPlatformError('Select at least one platform to continue');
      return;
    }

    setIsSubmitting(true);
    setPlatformError('');

    try {
      await updateCreatorPlatforms(selectedPlatforms);
      setStep(2);
    } catch (err: any) {
      setPlatformError(err.message || 'Failed to save selected platforms.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const allLinksVerified = selectedPlatforms.every((p) => verifiedLinks[p] === true);

  const handleSaveVerifiedPlatformLinks = async () => {
    if (!allLinksVerified) {
      setPlatformError('All selected platform links must be verified before continuing.');
      return;
    }

    setIsSubmitting(true);
    setPlatformError('');

    try {
      const platformsPayload = selectedPlatforms.map((platform) => ({
        platform,
        link: links[platform]?.trim() || ''
      }));

      await updateCreatorPlatforms(platformsPayload);
      setStep(3);
    } catch (err: any) {
      setPlatformError(err.message || 'Failed to save platform links.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestOtp = async () => {
    setOtpSending(true);
    setOtpError('');
    setOtpSuccessMsg('');

    try {
      const res = await requestCreatorOtp();
      if (res.success) {
        setOtpSent(true);
        setOtpSuccessMsg(`Verification code sent successfully to ${creator?.email || basicInfo.email}. Please check your inbox.`);
      }
    } catch (err: any) {
      setOtpError(err.message || 'Failed to send verification email. Please try again.');
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      setOtpError('Please enter the complete 6-digit code.');
      return;
    }

    setOtpVerifying(true);
    setOtpError('');

    try {
      const res = await verifyCreatorOtp(otp);
      if (res.success && res.data?.token && res.data?.user) {
        login(res.data.token, res.data.user, 'creator');
        clearCreator();
        setStep(4);
      }
    } catch (err: any) {
      setOtpError(err.message || 'Invalid or expired verification code. Please check and try again.');
    } finally {
      setOtpVerifying(false);
    }
  };

  return (
    <div>
      <StepProgress steps={STEP_LABELS} currentStep={step} className="mb-6" />

      {apiError && (
        <div className="mb-4 p-3 text-xs bg-rose-50 border border-rose-200 text-rose-600 rounded-xl font-medium">
          {apiError}
        </div>
      )}

      {/* Step 0: Basic Information */}
      {step === 0 && (
        <form onSubmit={handleRegisterBasicInfo} className="space-y-4">
          <TextField
            label="Full Name or Alias"
            icon={UserIcon}
            required
            value={basicInfo.name}
            onChange={(v) => updateBasic('name', v)}
            error={basicErrors?.name}
            placeholder="e.g. Alex Chen"
          />
          <TextField
            label="Email Address"
            icon={Mail}
            type="email"
            required
            value={basicInfo.email}
            onChange={(v) => updateBasic('email', v)}
            error={basicErrors?.email}
            placeholder="creator@example.com"
          />
          <TextField
            label="Phone Number"
            icon={Phone}
            type="tel"
            required
            value={basicInfo.phone}
            onChange={(v) => updateBasic('phone', v)}
            error={basicErrors?.phone}
            placeholder="+1 555 019 2831"
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
            error={basicErrors?.password}
            placeholder="At least 6 characters"
          />
          <PasswordField
            label="Confirm Password"
            required
            value={basicInfo.confirmPassword}
            onChange={(v) => updateBasic('confirmPassword', v)}
            error={basicErrors?.confirmPassword}
            placeholder="Re-enter password"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-[#EC4899] hover:bg-pink-600 disabled:opacity-70 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Initializing Pending Profile...
              </>
            ) : (
              <>
                Next: Select Platforms
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* Step 1: Platform Selection */}
      {step === 1 && (
        <div className="space-y-4">
          <p className="text-xs text-slate-500">Select the social platforms where you actively create content:</p>
          <div className="grid grid-cols-3 gap-3">
            {PLATFORM_OPTIONS.map(({ key, label, icon: Icon, color }) => {
              const active = selectedPlatforms.includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => togglePlatform(key)}
                  className={`relative p-3.5 rounded-xl border text-left transition-all ${
                    active ? 'border-[#EC4899] bg-pink-50/60 shadow-xs' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {active && <CheckCircle2 className="w-4 h-4 text-[#EC4899] absolute top-2 right-2" />}
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${color} flex items-center justify-center text-white mb-2`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-bold text-slate-800">{label}</p>
                </button>
              );
            })}
          </div>

          {platformError && <p className="text-xs font-semibold text-rose-500">{platformError}</p>}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setStep(0)}
              disabled={isSubmitting}
              className="px-4 py-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold flex items-center gap-1 hover:bg-slate-50"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <button
              type="button"
              onClick={handleSavePlatforms}
              disabled={isSubmitting}
              className="flex-1 py-3 bg-[#EC4899] hover:bg-pink-600 disabled:opacity-70 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving Platforms...
                </>
              ) : (
                <>
                  Next: Verify Profile Links
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Live Platform Link Verification */}
      {step === 2 && (
        <div className="space-y-4">
          <p className="text-xs text-slate-500">Provide and verify your profile URL for each selected platform:</p>
          <div className="space-y-4">
            {selectedPlatforms.map((key) => {
              const opt = PLATFORM_OPTIONS.find((p) => p.key === key)!;
              const isVerifying = verifying[key];
              const isVerified = verifiedLinks[key];
              const errMsg = linkErrors[key];

              return (
                <div key={key} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <opt.icon className="w-3.5 h-3.5 text-slate-600" /> {opt.label} Profile URL
                    </label>
                    {isVerified ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-400">Unverified</span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <LinkIcon className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        value={links[key] || ''}
                        onChange={(e) => handleLinkChange(key, e.target.value)}
                        placeholder={opt.placeholder}
                        disabled={isSubmitting || isVerifying}
                        className={`w-full text-xs bg-white border rounded-xl pl-9 pr-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 ${
                          isVerified ? 'border-emerald-400 focus:ring-emerald-500' : 'border-slate-200 focus:ring-pink-500'
                        }`}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleVerifyLink(key)}
                      disabled={isSubmitting || isVerifying || isVerified}
                      className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
                        isVerified
                          ? 'bg-emerald-100 text-emerald-700 cursor-default'
                          : 'bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-60'
                      }`}
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying...
                        </>
                      ) : isVerified ? (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5" /> Verified
                        </>
                      ) : (
                        'Verify'
                      )}
                    </button>
                  </div>

                  {errMsg && (
                    <div className="flex items-center gap-1 text-[11px] text-rose-600 font-medium pt-0.5">
                      <XCircle className="w-3 h-3 flex-shrink-0 text-rose-500" />
                      <span>{errMsg}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {platformError && <p className="text-xs font-semibold text-rose-500">{platformError}</p>}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              disabled={isSubmitting}
              className="px-4 py-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold flex items-center gap-1 hover:bg-slate-50"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <button
              type="button"
              onClick={handleSaveVerifiedPlatformLinks}
              disabled={isSubmitting || !allLinksVerified}
              className="flex-1 py-3 bg-[#EC4899] hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving Verified Links...
                </>
              ) : (
                <>
                  Save Verified Links & Continue
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Email OTP Verification */}
      {step === 3 && (
        <form onSubmit={handleVerifyOtpSubmit} className="space-y-5 py-2">
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 rounded-full bg-pink-50 text-[#EC4899] flex items-center justify-center mx-auto mb-2 border border-pink-100 shadow-xs">
              <Mail className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Verify Your Email Address</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              We need to confirm your email address <span className="font-semibold text-slate-800">{creator?.email || basicInfo.email}</span> before completing your registration.
            </p>
          </div>

          {!otpSent ? (
            <button
              type="button"
              onClick={handleRequestOtp}
              disabled={otpSending}
              className="w-full py-3 bg-[#EC4899] hover:bg-pink-600 disabled:opacity-70 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              {otpSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Sending Code...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Send Verification Code
                </>
              )}
            </button>
          ) : (
            <div className="space-y-4">
              {otpSuccessMsg && (
                <div className="p-3 text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl font-medium text-center">
                  {otpSuccessMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 text-center mb-2">
                  Enter 6-Digit Verification Code
                </label>
                <OtpInput
                  length={6}
                  value={otp}
                  onChange={(v) => {
                    setOtp(v);
                    if (otpError) setOtpError('');
                  }}
                  error={otpError}
                  disabled={otpVerifying}
                />
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={otpSending}
                  className="font-bold text-pink-600 hover:underline disabled:opacity-60"
                >
                  {otpSending ? 'Resending Code...' : 'Resend Code'}
                </button>
                <span className="text-slate-400">Expires in 10 minutes</span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={otpVerifying}
                  className="px-4 py-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold flex items-center gap-1 hover:bg-slate-50"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <button
                  type="submit"
                  disabled={otpVerifying || otp.length < 6}
                  className="flex-1 py-3 bg-[#EC4899] hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {otpVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Verifying Code...
                    </>
                  ) : (
                    <>
                      Verify & Complete Registration
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {otpError && !otpSent && (
            <p className="text-xs font-semibold text-rose-500 text-center">{otpError}</p>
          )}
        </form>
      )}

      {/* Step 4: Done / Success */}
      {step === 4 && (
        <div className="text-center space-y-4 py-6">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#EC4899] to-[#8B5CF6] text-white flex items-center justify-center mx-auto shadow-lg">
            <PartyPopper className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-slate-900">Welcome to CollabX, {basicInfo.name || creator?.fullName || 'Creator'}!</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Your email has been verified and your creator profile is fully activated. Explore brand campaigns and start collaborating.
            </p>
          </div>
          <button
            onClick={() => navigate('/creator/dashboard')}
            className="w-full py-3 bg-[#EC4899] hover:bg-pink-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            Go to Creator Dashboard
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
