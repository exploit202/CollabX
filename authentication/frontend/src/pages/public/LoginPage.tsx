import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { ArrowRight, Mail, Loader2 } from 'lucide-react';
import { AuthShell } from '../../components/common/AuthShell';
import { TextField, PasswordField } from '../../components/common/FormField';

import { loginBrandAccount } from '../../services/brandRegistrationApi';
import { loginCreatorAccount } from '../../services/creatorRegistrationApi';

interface FormErrors {
  email?: string;
  password?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const LoginPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialRole = (searchParams.get('role') as UserRole) || 'brand';

  const [role, setRole] = useState<UserRole>(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!email.trim()) next.email = 'Email is required';
    else if (!EMAIL_RE.test(email)) next.email = 'Enter a valid email address';
    if (!password) next.password = 'Password is required';
    else if (password.length < 6) next.password = 'Password must be at least 6 characters';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (role === 'brand') {
        const user = await loginBrandAccount({ email, password });
        login('brand', {
          name: user.fullName || email.split('@')[0].replace(/[._]/g, ' '),
          email: user.email,
        });
        navigate('/brand/dashboard');
      } else if (role === 'creator') {
        const user = await loginCreatorAccount({ email, password });
        login('creator', {
          name: user.fullName || email.split('@')[0].replace(/[._]/g, ' '),
          email: user.email,
        });
        navigate('/creator/dashboard');
      } else {
        // Placeholder for admin authentication - backend integration pending.
        await new Promise((resolve) => setTimeout(resolve, 700));
        const derivedName = email.split('@')[0].replace(/[._]/g, ' ');
        login(role, { name: derivedName, email });
        navigate(`/${role}/dashboard`);
      }
    } catch (err: any) {
      setFormError(err.message || 'Something went wrong while signing you in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell title="Welcome Back" subtitle="Sign in to manage your influencer collaborations">
      {/* Role Selection Tabs */}
      <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl mb-6">
        {(['brand', 'creator', 'admin'] as const).map((r) => (
          <button
            key={r}
            type="button"
            disabled={isSubmitting}
            onClick={() => {
              setRole(r);
              setSearchParams({ role: r });
            }}
            className={`py-2 text-xs font-bold rounded-lg capitalize transition-all disabled:opacity-60 ${
              role === r ? 'bg-[#EC4899] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {formError && (
        <div className="mb-4 px-3 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-[11px] font-semibold text-rose-600">
          {formError}
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
        <TextField
          label="Email Address"
          icon={Mail}
          type="email"
          required
          value={email}
          onChange={setEmail}
          error={errors.email}
          disabled={isSubmitting}
          placeholder={role === 'brand' ? 'brand@company.com' : role === 'creator' ? 'creator@example.com' : 'admin@collabx.com'}
          autoComplete="email"
        />

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700">Password</label>
            <Link to="/forgot-password" className="text-[11px] font-semibold text-pink-600 hover:underline">
              Forgot password?
            </Link>
          </div>
          <PasswordField
            value={password}
            onChange={setPassword}
            error={errors.password}
            disabled={isSubmitting}
            autoComplete="current-password"
          />
        </div>

        <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            disabled={isSubmitting}
            className="w-3.5 h-3.5 rounded accent-[#EC4899]"
          />
          Remember me on this device
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-[#EC4899] hover:bg-pink-600 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing In...
            </>
          ) : (
            <>
              Sign In as {role.toUpperCase()}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-xs text-slate-500 mt-6">
        Don't have an account?{' '}
        <Link to={`/signup?role=${role === 'admin' ? 'brand' : role}`} className="font-bold text-pink-600 hover:underline">
          Create an Account
        </Link>
      </p>
    </AuthShell>
  );
};
