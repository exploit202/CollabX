import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'pink' | 'purple' | 'emerald' | 'amber' | 'slate' | 'rose' | 'sky';
  className?: string;
  dot?: boolean;
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'pink',
  className = '',
  dot = false,
  pulse = false
}) => {
  const variantStyles = {
    pink: 'bg-pink-50/90 text-pink-700 border-pink-200/90 shadow-2xs hover:bg-pink-100/90',
    purple: 'bg-purple-50/90 text-purple-700 border-purple-200/90 shadow-2xs hover:bg-purple-100/90',
    emerald: 'bg-emerald-50/90 text-emerald-700 border-emerald-200/90 shadow-2xs hover:bg-emerald-100/90',
    amber: 'bg-amber-50/90 text-amber-800 border-amber-200/90 shadow-2xs hover:bg-amber-100/90',
    slate: 'bg-slate-100/90 text-slate-700 border-slate-200/90 shadow-2xs hover:bg-slate-200/90',
    rose: 'bg-rose-50/90 text-rose-700 border-rose-200/90 shadow-2xs hover:bg-rose-100/90',
    sky: 'bg-sky-50/90 text-sky-700 border-sky-200/90 shadow-2xs hover:bg-sky-100/90',
  };

  const dotColors = {
    pink: 'bg-pink-500',
    purple: 'bg-purple-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    slate: 'bg-slate-500',
    rose: 'bg-rose-500',
    sky: 'bg-sky-500',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold tracking-wide uppercase border backdrop-blur-2xs transition-all duration-200 ${variantStyles[variant]} ${className}`}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5 items-center justify-center">
          {pulse && <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${dotColors[variant]}`} />}
          <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${dotColors[variant]}`} />
        </span>
      )}
      {children}
    </span>
  );
};
