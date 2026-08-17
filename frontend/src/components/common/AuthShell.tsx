import React from 'react';
import { Link } from 'react-router-dom';
import { Layers } from 'lucide-react';

interface AuthShellProps {
  title: string;
  subtitle?: string;
  maxWidth?: string;
  children: React.ReactNode;
}

/**
 * Shared wrapper for all public auth pages: logo, title/subtitle, and the
 * glassmorphic card container.
 */
export const AuthShell: React.FC<AuthShellProps> = ({ title, subtitle, maxWidth = 'max-w-md', children }) => {
  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Background Glow Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-96 pointer-events-none -z-10">
        <div className="absolute -top-10 left-10 w-72 h-72 rounded-full bg-pink-500/10 blur-3xl" />
        <div className="absolute -bottom-10 right-10 w-72 h-72 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <div className={`${maxWidth} w-full bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-8 shadow-2xl animate-scale-in`}>
        <div className="text-center space-y-2 mb-6">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#EC4899] to-[#8B5CF6] flex items-center justify-center text-white shadow-md shadow-pink-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] bg-clip-text text-transparent tracking-tight">
              CollabX
            </span>
          </Link>
          <h2 className="text-xl font-black text-slate-900 pt-2 tracking-tight">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
};
