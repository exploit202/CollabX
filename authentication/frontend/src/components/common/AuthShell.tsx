import React from 'react';
import { Link } from 'react-router-dom';
import { Layers } from 'lucide-react';
import { Card } from './Card';

interface AuthShellProps {
  title: string;
  subtitle?: string;
  maxWidth?: string; // tailwind max-w-* class
  children: React.ReactNode;
}

/**
 * Shared wrapper for all public auth pages: logo, title/subtitle, and the
 * white card container. Keeps the auth flows visually identical without
 * repeating the header markup on every page.
 */
export const AuthShell: React.FC<AuthShellProps> = ({ title, subtitle, maxWidth = 'max-w-md', children }) => {
  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className={`${maxWidth} w-full p-8 shadow-xl border-slate-200`}>
        <div className="text-center space-y-2 mb-6">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#EC4899] to-[#8B5CF6] flex items-center justify-center text-white shadow-md">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] bg-clip-text text-transparent">
              CollabX
            </span>
          </Link>
          <h2 className="text-xl font-bold text-slate-900 pt-2">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
        {children}
      </Card>
    </div>
  );
};
