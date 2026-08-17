import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, ArrowRight, Loader2, RotateCw, KeyRound } from 'lucide-react';
import { AuthShell } from '../../components/common/AuthShell';
import { TextField } from '../../components/common/FormField';
import { OtpInput } from '../../components/common/OtpInput';
import { StepProgress } from '../../components/common/StepProgress';
import { useApp } from '../../context/AppContext';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STEPS = ['Enter Email', 'Verify Code'];

export const ForgotPasswordPage: React.FC = () => {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSendingLink, setIsSendingLink] = useState(false);

  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(30);

  const { addToast } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (step !== 1 || resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [step, resendCooldown]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }
    if (!EMAIL_RE.test(email)) {
      setEmailError('Enter a valid email address');
      return;
    }
    setIsSendingLink(true);
    // Placeholder for real "send OTP" call - backend integration pending.
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSendingLink(false);
    setStep(1);
    addToast('success', 'Verification Code Sent', `We sent a 6-digit code to ${email}`);
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;
    setResendCooldown(30);
    addToast('info', 'Code Resent', `A new code was sent to ${email}`);
  };

  const handleVerify = () => {
    setOtpError('');
    if (otp.length !== 6) {
      setOtpError('Enter the complete 6-digit code');
      return;
    }
    setIsVerifying(true);
    // Mock OTP check - UI only. Any complete 6-digit code is accepted.
    setTimeout(() => {
      setIsVerifying(false);
      navigate('/reset-password', { state: { email } });
    }, 800);
  };

  return (
    <AuthShell
      title="Forgot Password"
      subtitle={step === 0 ? "Enter your email and we'll send a verification code" : 'Enter the code we sent to your email'}
    >
      <StepProgress steps={STEPS} currentStep={step} className="mb-6" />

      {step === 0 && (
        <form onSubmit={handleSendCode} className="space-y-4" noValidate>
          <TextField
            label="Email Address"
            icon={Mail}
            type="email"
            required
            value={email}
            onChange={setEmail}
            error={emailError}
            disabled={isSendingLink}
            placeholder="name@company.com"
          />
          <button
            type="submit"
            disabled={isSendingLink}
            className="w-full py-3 bg-[#EC4899] hover:bg-pink-600 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            {isSendingLink ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Sending Code...
              </>
            ) : (
              <>
                Send Verification Code
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {step === 1 && (
        <div className="space-y-5 text-center py-2">
          <div className="w-12 h-12 rounded-full bg-pink-50 text-[#EC4899] flex items-center justify-center mx-auto">
            <KeyRound className="w-6 h-6" />
          </div>
          <p className="text-xs text-slate-500">
            Code sent to <b>{email}</b>
          </p>
          <OtpInput value={otp} onChange={setOtp} error={otpError} disabled={isVerifying} />
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0}
            className="text-[11px] font-semibold text-pink-600 hover:underline disabled:text-slate-400 disabled:no-underline flex items-center gap-1 mx-auto"
          >
            <RotateCw className="w-3 h-3" />
            {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}
          </button>
          <button
            type="button"
            onClick={handleVerify}
            disabled={isVerifying || otp.length !== 6}
            className="w-full py-3 bg-[#EC4899] hover:bg-pink-600 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
              </>
            ) : (
              <>
                Verify Code
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}

      <div className="pt-6 border-t border-slate-100 mt-6 text-center">
        <Link to="/login" className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Login
        </Link>
      </div>
    </AuthShell>
  );
};
