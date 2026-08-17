import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, UserRole } from '../../context/AuthContext';
import { ArrowRight, Mail, Loader2, AlertCircle } from 'lucide-react';
import { AuthShell } from '../../components/common/AuthShell';
import { TextField, PasswordField } from '../../components/common/FormField';
import { loginBrand, loginCreator } from '../../lib/api';

interface FormErrors {
  email?: string;
  password?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const LoginPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const getInitialRole = (): UserRole => {
    const paramRole = searchParams.get('role') as UserRole;
    if (paramRole && ['brand', 'creator', 'admin'].includes(paramRole)) {
      return paramRole;
    }
    const savedRole = localStorage.getItem('collabx_role') as UserRole;
    if (savedRole && ['brand', 'creator', 'admin'].includes(savedRole)) {
      return savedRole;
    }
    return 'brand';
  };

  const [role, setRole] = useState<UserRole>(getInitialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [showRoleHint, setShowRoleHint] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    setSearchParams({ role: newRole });
    localStorage.setItem('collabx_role', newRole);
    setFormError('');
    setShowRoleHint(false);
  };

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
    setShowRoleHint(false);
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (role === 'brand') {
        const res = await loginBrand({ email, password });
        if (res.success && res.data?.token) {
          login(res.data.token, res.data.user || res.data.profile, 'brand');
          navigate('/brand/dashboard');
        }
      } else if (role === 'creator') {
        const res = await loginCreator({ email, password });
        if (res.success && res.data?.token) {
          login(res.data.token, res.data.user || res.data.profile, 'creator');
          navigate('/creator/dashboard');
        }
      } else {
        const res = await loginBrand({ email, password });
        if (res.success && res.data?.token) {
          login(res.data.token, res.data.user, 'admin');
          navigate('/admin/dashboard');
        }
      }
    } catch (err: any) {
      const errMsg = err.message || 'Something went wrong while signing you in. Please try again.';
      setFormError(errMsg);
      if (errMsg.toLowerCase().includes('invalid email or password')) {
        setShowRoleHint(true);
      }
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
            onClick={() => handleRoleChange(r)}
            className={`py-2 text-xs font-bold rounded-lg capitalize transition-all disabled:opacity-60 ${
              role === r ? 'bg-[#EC4899] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {formError && (
        <div className="mb-4 px-3.5 py-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-600 space-y-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <p>{formError}</p>
              {showRoleHint && (
                <div className="mt-2 pt-2 border-t border-rose-200/60 text-[11px] text-rose-700 font-normal">
                  <p className="font-semibold mb-1">Role mismatch? You are currently signing in as <span className="uppercase font-bold underline">{role}</span>.</p>
                  <p>If your account was registered as a different role, click to switch tab:</p>
                  <div className="flex gap-2 mt-1.5">
                    {role !== 'creator' && (
                      <button
                        type="button"
                        onClick={() => handleRoleChange('creator')}
                        className="px-2.5 py-1 bg-rose-600 text-white font-bold text-[10px] rounded-lg hover:bg-rose-700 transition-all"
                      >
                        Switch to CREATOR Tab
                      </button>
                    )}
                    {role !== 'brand' && (
                      <button
                        type="button"
                        onClick={() => handleRoleChange('brand')}
                        className="px-2.5 py-1 bg-rose-600 text-white font-bold text-[10px] rounded-lg hover:bg-rose-700 transition-all"
                      >
                        Switch to BRAND Tab
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
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
