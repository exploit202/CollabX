import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text' | 'card' | 'stat';
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  count = 1
}) => {
  const items = Array.from({ length: count });

  if (variant === 'stat') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 ${className}`}>
        {items.map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs animate-pulse space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-3.5 bg-slate-200 rounded-md w-24" />
              <div className="w-8 h-8 bg-slate-100 rounded-xl" />
            </div>
            <div className="h-7 bg-slate-200 rounded-lg w-32" />
            <div className="h-3 bg-slate-100 rounded-md w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
        {items.map((_, i) => (
          <div
            key={i}
            className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs animate-pulse space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-200 shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                <div className="h-3 bg-slate-100 rounded-md w-1/2" />
              </div>
            </div>
            <div className="space-y-2 py-2">
              <div className="h-3.5 bg-slate-100 rounded-md w-full" />
              <div className="h-3.5 bg-slate-100 rounded-md w-5/6" />
            </div>
            <div className="flex gap-2 pt-2">
              <div className="h-6 bg-slate-100 rounded-full w-16" />
              <div className="h-6 bg-slate-100 rounded-full w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'circular') {
    return (
      <div className={`rounded-full bg-slate-200 animate-pulse ${className}`} />
    );
  }

  if (variant === 'text') {
    return (
      <div className="space-y-2 w-full">
        {items.map((_, i) => (
          <div key={i} className={`h-3.5 bg-slate-200 rounded-md animate-pulse ${className}`} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3 w-full">
      {items.map((_, i) => (
        <div
          key={i}
          className={`h-20 rounded-2xl bg-slate-100 border border-slate-200/60 animate-pulse ${className}`}
        />
      ))}
    </div>
  );
};
