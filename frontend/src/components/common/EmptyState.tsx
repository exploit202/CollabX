import React from 'react';
import { LucideIcon, FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = FolderOpen,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-10 bg-slate-50/70 border border-dashed border-slate-200/90 rounded-2xl my-4 animate-fade-in">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-100 to-purple-100 flex items-center justify-center text-[#EC4899] mb-3.5 shadow-2xs border border-pink-200/50">
        <Icon className="w-7 h-7" />
      </div>
      <h4 className="text-sm font-extrabold text-slate-900">{title}</h4>
      <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-4 py-2 bg-[#EC4899] hover:bg-pink-600 active:scale-95 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
