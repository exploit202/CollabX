import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  glass?: boolean;
  variant?: 'default' | 'subtle' | 'gradient' | 'dark';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = false,
  glass = false,
  variant = 'default',
  ...props
}) => {
  const baseClasses = glass
    ? 'glass-card'
    : variant === 'dark'
    ? 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-white shadow-xl'
    : variant === 'gradient'
    ? 'bg-gradient-to-br from-white via-slate-50/90 to-purple-50/30 border border-purple-100/80 shadow-xs'
    : variant === 'subtle'
    ? 'bg-slate-50/80 border border-slate-200/70 shadow-2xs'
    : 'bg-white border border-slate-200/90 shadow-xs';

  const hoverClasses = hoverable
    ? 'hover:border-purple-300/90 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0'
    : '';

  return (
    <div
      className={`rounded-2xl transition-all duration-300 ${baseClasses} ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
