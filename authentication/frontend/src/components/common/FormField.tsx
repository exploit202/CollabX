import React, { useState } from 'react';
import { LucideIcon, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

interface BaseFieldProps {
  label?: string;
  icon?: LucideIcon;
  error?: string;
  success?: boolean;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

interface TextFieldProps extends BaseFieldProps {
  type?: 'text' | 'email' | 'tel';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  name?: string;
  autoComplete?: string;
  autoFocus?: boolean;
}

/**
 * Shared text input used across auth and form flows. Handles the label,
 * leading icon, error/success/helper text, and disabled styling so pages
 * don't repeat the same markup.
 */
export const TextField: React.FC<TextFieldProps> = ({
  label,
  icon: Icon,
  error,
  success,
  helperText,
  required,
  disabled,
  className = '',
  type = 'text',
  value,
  onChange,
  placeholder,
  maxLength,
  name,
  autoComplete,
  autoFocus,
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          {label} {required && <span className="text-pink-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && <Icon className="w-4 h-4 absolute left-3 top-3 text-slate-400" />}
        <input
          type={type}
          name={name}
          required={required}
          disabled={disabled}
          value={value}
          maxLength={maxLength}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-invalid={!!error}
          className={`w-full text-xs bg-slate-50 border rounded-xl ${Icon ? 'pl-9' : 'pl-3'} pr-9 py-2.5 text-slate-800 focus:outline-none focus:ring-2 transition-all font-medium disabled:opacity-60 disabled:cursor-not-allowed ${
            error
              ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/40'
              : success
                ? 'border-emerald-300 focus:ring-emerald-400'
                : 'border-slate-200 focus:ring-pink-500'
          }`}
        />
        {error && <AlertCircle className="w-4 h-4 absolute right-3 top-3 text-rose-500" />}
        {!error && success && <CheckCircle2 className="w-4 h-4 absolute right-3 top-3 text-emerald-500" />}
      </div>
      {error ? (
        <p className="text-[10px] font-semibold text-rose-500 mt-1 flex items-center gap-1">{error}</p>
      ) : helperText ? (
        <p className="text-[10px] text-slate-400 mt-1">{helperText}</p>
      ) : null}
    </div>
  );
};

interface PasswordFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  name?: string;
  autoComplete?: string;
  showStrength?: boolean;
}

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: '', color: 'bg-slate-200' };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: 'Very Weak', color: 'bg-rose-400' },
    { label: 'Weak', color: 'bg-orange-400' },
    { label: 'Fair', color: 'bg-amber-400' },
    { label: 'Good', color: 'bg-lime-500' },
    { label: 'Strong', color: 'bg-emerald-500' },
  ];
  return { score, ...levels[score] };
}

/**
 * Password input with a show/hide toggle and an optional strength meter.
 * Reused by Login, Signup, and Reset Password.
 */
export const PasswordField: React.FC<PasswordFieldProps> = ({
  label,
  error,
  helperText,
  required,
  disabled,
  className = '',
  value,
  onChange,
  placeholder = '••••••••',
  name,
  autoComplete,
  showStrength = false,
}) => {
  const [visible, setVisible] = useState(false);
  const strength = getPasswordStrength(value);

  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          {label} {required && <span className="text-pink-500">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type={visible ? 'text' : 'password'}
          name={name}
          required={required}
          disabled={disabled}
          value={value}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-invalid={!!error}
          className={`w-full text-xs bg-slate-50 border rounded-xl pl-3 pr-9 py-2.5 text-slate-800 focus:outline-none focus:ring-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
            error ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/40' : 'border-slate-200 focus:ring-pink-500'
          }`}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {showStrength && value && (
        <div className="mt-1.5">
          <div className="flex gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${i < strength.score ? strength.color : 'bg-slate-200'}`}
              />
            ))}
          </div>
          <p className="text-[10px] font-semibold text-slate-400 mt-1">{strength.label}</p>
        </div>
      )}

      {error ? (
        <p className="text-[10px] font-semibold text-rose-500 mt-1">{error}</p>
      ) : helperText ? (
        <p className="text-[10px] text-slate-400 mt-1">{helperText}</p>
      ) : null}
    </div>
  );
};

interface SelectFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  name?: string;
}

/** Shared select dropdown, styled to match TextField. */
export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  error,
  helperText,
  required,
  disabled,
  className = '',
  value,
  onChange,
  options,
  name,
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          {label} {required && <span className="text-pink-500">*</span>}
        </label>
      )}
      <select
        name={name}
        required={required}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full text-xs bg-slate-50 border rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 font-medium disabled:opacity-60 disabled:cursor-not-allowed ${
          error ? 'border-rose-300 focus:ring-rose-400' : 'border-slate-200 focus:ring-pink-500'
        }`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? (
        <p className="text-[10px] font-semibold text-rose-500 mt-1">{error}</p>
      ) : helperText ? (
        <p className="text-[10px] text-slate-400 mt-1">{helperText}</p>
      ) : null}
    </div>
  );
};
