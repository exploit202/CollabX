import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Mail,
  FileText,
  ArrowRight,
  ArrowLeft,
  Loader2,
  PartyPopper,
  Send
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StepProgress } from '../common/StepProgress';
import { TextField, PasswordField, SelectField } from '../common/FormField';
import { OtpInput } from '../common/OtpInput';
import {
  registerBrand,
  requestBrandOtp,
  verifyBrandOtp,
  setToken
} from '../../lib/api';

const STEP_LABELS = ['Brand Info', 'Verify Email', 'Done'];

const INDUSTRY_OPTIONS = [
  'Tech & Gadgets',
  'Fashion & Lifestyle',
  'Fitness & Wellness',
  'Gaming',
  'Travel',
  'Beauty & Skincare',
];

interface BrandInfo {
  name: string;
  email: string;
  category: string;
  bio: string;
  password: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const BrandSignupWizard: React.FC = () => {
  const [step, setStep] = useState(0);
  const { login } = useAuth();
  const navigate = useNavigate();

  const [brandInfo, setBrandInfo] = useState<BrandInfo>({
    name: '',
    email: '',
    category: INDUSTRY_OPTIONS[0],
    bio: '',
    password: '',
  });
  const [brandErrors, setBrandErrors] = useState<Partial<Record<keyof BrandInfo, string>>>();
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [brandUser, setBrandUser] = useState<any>(null);

  // OTP State
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpSuccessMsg, setOtpSuccessMsg] = useState('');
  const [otpError, setOtpError] = useState('');

  const updateBrand = (field: keyof BrandInfo, value: string) => {
    setBrandInfo((prev) => ({ ...prev, [field]: value }));
    if (brandErrors?.[field]) setBrandErrors((prev) => ({ ...prev, [field]: undefined }));
    if (apiError) setApiError('');
  };

  const validateBrandInfo = (): boolean => {
    const errs: Partial<Record<keyof BrandInfo, string>> = {};
    if (!brandInfo.name.trim()) errs.name = 'Company / Brand name is required';
    if (!brandInfo.email.trim()) errs.email = 'Work Email is required';
    else if (!EMAIL_RE.test(brandInfo.email)) errs.email = 'Enter a valid work email address';
    if (!brandInfo.password) errs.password = 'Password is required';
    else if (brandInfo.password.length < 8) errs.password = 'Password must be at least 8 characters';
    setBrandErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegisterBrandInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateBrandInfo()) return;
    setIsSubmitting(true);
    setApiError('');

    try {
      const res = await registerBrand({
        companyName: brandInfo.name,
        workEmail: brandInfo.email,
        industryType: brandInfo.category,
        aboutBrand: brandInfo.bio,
        password: brandInfo.password,
      });

      if (res.success && res.data?.user) {
        const authToken = (res.data as any).signupToken || res.data.token;
        if (authToken) {
          setToken(authToken);
        }
        setBrandUser(res.data.user);
        setStep(1);
        // Auto-dispatch OTP email upon completing basic info
        await handleRequestOtp(res.data.user?.email || brandInfo.email);
      }
    } catch (err: any) {
      setApiError(err.message || 'Brand Owner registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestOtp = async (targetEmail?: string) => {
    setOtpSending(true);
    setOtpError('');
    setOtpSuccessMsg('');

    try {
      const res = await requestBrandOtp();
      if (res.success) {
        setOtpSent(true);
        setOtpSuccessMsg(`Verification code sent successfully to ${targetEmail || brandUser?.email || brandInfo.email}. Please check your inbox.`);
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
      const res = await verifyBrandOtp(otp);
      if (res.success && res.data?.token && res.data?.user) {
        login(res.data.token, res.data.user, 'brand');
        setStep(2);
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

      {/* Step 0: Brand Info */}
      {step === 0 && (
        <form onSubmit={handleRegisterBrandInfo} className="space-y-4">
          <TextField
            label="Company / Brand Name"
            icon={Building2}
            required
            value={brandInfo.name}
            onChange={(v) => updateBrand('name', v)}
            error={brandErrors?.name}
            placeholder="e.g. Acme Tech Studio"
          />
          <TextField
            label="Work Email"
            icon={Mail}
            type="email"
            required
            value={brandInfo.email}
            onChange={(v) => updateBrand('email', v)}
            error={brandErrors?.email}
            placeholder="name@domain.com"
          />
          <SelectField
            label="Industry"
            value={brandInfo.category}
            onChange={(v) => updateBrand('category', v)}
            options={INDUSTRY_OPTIONS.map((n) => ({ value: n, label: n }))}
          />
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                About Your Brand <span className="text-slate-400 font-medium">(optional)</span>
              </label>
              <span className={`text-[10px] font-semibold ${brandInfo.bio.length > 200 ? 'text-rose-500' : 'text-slate-400'}`}>
                {brandInfo.bio.length}/200
              </span>
            </div>
            <div className="relative">
              <FileText className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <textarea
                value={brandInfo.bio}
                onChange={(e) => updateBrand('bio', e.target.value)}
                rows={3}
                maxLength={200}
                placeholder="e.g. We build smart home gadgets for young professionals — looking for tech creators who can show real use cases."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
              />
            </div>
          </div>
          <PasswordField
            label="Password"
            required
            showStrength
            value={brandInfo.password}
            onChange={(v) => updateBrand('password', v)}
            error={brandErrors?.password}
            placeholder="At least 8 characters"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-[#EC4899] hover:bg-pink-600 disabled:opacity-70 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Initializing Brand Profile...
              </>
            ) : (
              <>
                Next: Verify Work Email
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* Step 1: Email OTP Verification */}
      {step === 1 && (
        <form onSubmit={handleVerifyOtpSubmit} className="space-y-5 py-2">
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 rounded-full bg-pink-50 text-[#EC4899] flex items-center justify-center mx-auto mb-2 border border-pink-100 shadow-xs">
              <Mail className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Verify Your Work Email</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              We need to confirm your email address <span className="font-semibold text-slate-800">{brandUser?.email || brandInfo.email}</span> before completing your Brand account setup.
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
                  onClick={() => setStep(0)}
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
                      Verify & Complete Setup
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

      {/* Step 2: Done / Success */}
      {step === 2 && (
        <div className="text-center space-y-4 py-6">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#EC4899] to-[#8B5CF6] text-white flex items-center justify-center mx-auto shadow-lg">
            <PartyPopper className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-slate-900">Welcome to CollabX, {brandInfo.name || brandUser?.fullName || 'Brand Owner'}!</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Your work email has been verified and your Brand account is fully activated. Discover top creators and launch your first campaign.
            </p>
          </div>
          <button
            onClick={() => navigate('/brand/dashboard')}
            className="w-full py-3 bg-[#EC4899] hover:bg-pink-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            Go to Brand Dashboard
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
