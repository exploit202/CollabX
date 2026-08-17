import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { AuthShell } from '../../components/common/AuthShell';
import { PasswordField } from '../../components/common/FormField';
import { useApp } from '../../context/AppContext';

interface FormErrors {
  password?: string;
  confirmPassword?: string;
}

export const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const { addToast } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string } | null)?.email;

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!password) next.password = 'Password is required';
    else if (password.length < 8) next.password = 'Use at least 8 characters';
    if (confirmPassword !== password) next.confirmPassword = 'Passwords do not match';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    // Placeholder for real "reset password" call - backend integration pending.
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSubmitting(false);
    setResetSuccess(true);
    addToast('success', 'Password reset successful!');
  };

  return (
    <AuthShell title="Set New Password" subtitle={email ? `Choose a new password for ${email}` : 'Enter a secure new password for your account'}>
      {resetSuccess ? (
        <div className="text-center space-y-4 py-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">Password Changed!</h4>
          <p className="text-xs text-slate-500">Your account password has been updated securely.</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-3 bg-[#EC4899] hover:bg-pink-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            Sign In Now
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <form onSubmit={handleReset} className="space-y-4" noValidate>
          <PasswordField
            label="New Password"
            required
            showStrength
            value={password}
            onChange={setPassword}
            error={errors.password}
            disabled={isSubmitting}
            placeholder="At least 8 characters"
          />
          <PasswordField
            label="Confirm New Password"
            required
            value={confirmPassword}
            onChange={setConfirmPassword}
            error={errors.confirmPassword}
            disabled={isSubmitting}
            placeholder="Re-enter password"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-[#EC4899] hover:bg-pink-600 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Updating Password...
              </>
            ) : (
              'Update Password'
            )}
          </button>
        </form>
      )}
    </AuthShell>
  );
};
