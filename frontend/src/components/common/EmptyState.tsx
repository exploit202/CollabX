import React from 'react';
import { LucideIcon, FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'default' | 'card' | 'panel';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = FolderOpen,
  title,
  description,
  actionLabel,
  onAction,
  variant = 'default'
}) => {
  const containerClass = variant === 'card'
    ? 'p-8 bg-white border border-slate-200/80 shadow-xs rounded-2xl'
    : variant === 'panel'
    ? 'p-12 bg-gradient-to-b from-slate-50/80 to-purple-50/20 border border-slate-200/90 rounded-3xl shadow-xs'
    : 'p-10 bg-slate-50/70 border border-dashed border-slate-200/90 rounded-2xl';

  return (
    <div className={`flex flex-col items-center justify-center text-center my-4 animate-fade-in ${containerClass}`}>
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-100 via-purple-100 to-indigo-100 flex items-center justify-center text-[#EC4899] mb-4 shadow-sm border border-pink-200/60 ring-4 ring-pink-500/5">
        <Icon className="w-7 h-7" />
      </div>
      <h4 className="text-sm font-black text-slate-900 tracking-tight">{title}</h4>
      <p className="text-xs text-slate-500 max-w-md mt-1.5 leading-relaxed font-medium">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 px-5 py-2.5 bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] hover:opacity-95 active:scale-95 text-white font-bold text-xs rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
