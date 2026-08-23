import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { UserRole } from '../../types';
import { Building2, User } from 'lucide-react';
import { AuthShell } from '../../components/common/AuthShell';
import { BrandSignupWizard } from '../../components/auth/BrandSignupWizard';
import { CreatorSignupWizard } from '../../components/auth/CreatorSignupWizard';
import { CreatorSignupProvider } from '../../context/CreatorSignupContext';

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

      {role === 'brand' ? (
        <BrandSignupWizard />
      ) : (
        <CreatorSignupProvider>
          <CreatorSignupWizard />
        </CreatorSignupProvider>
      )}

      <p className="text-center text-xs text-slate-500 mt-6">
        Already have an account?{' '}
        <Link to={`/login?role=${role}`} className="font-bold text-pink-600 hover:underline">
          Log In
        </Link>
      </p>
    </AuthShell>
  );
};
