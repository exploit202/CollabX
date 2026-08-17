import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'pink' | 'purple' | 'emerald' | 'amber' | 'slate' | 'rose' | 'sky';
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'pink', className = '', dot = false }) => {
  const variantStyles = {
    pink: 'bg-pink-50/90 text-pink-700 border-pink-200/80 shadow-2xs',
    purple: 'bg-purple-50/90 text-purple-700 border-purple-200/80 shadow-2xs',
    emerald: 'bg-emerald-50/90 text-emerald-700 border-emerald-200/80 shadow-2xs',
    amber: 'bg-amber-50/90 text-amber-800 border-amber-200/80 shadow-2xs',
    slate: 'bg-slate-100/90 text-slate-700 border-slate-200/80 shadow-2xs',
    rose: 'bg-rose-50/90 text-rose-700 border-rose-200/80 shadow-2xs',
    sky: 'bg-sky-50/90 text-sky-700 border-sky-200/80 shadow-2xs',
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
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-tight border backdrop-blur-2xs transition-all ${variantStyles[variant]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  );
};
