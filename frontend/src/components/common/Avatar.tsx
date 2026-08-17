import React from 'react';

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: string; // tailwind size classes, e.g. "w-8 h-8"
  textSize?: string; // tailwind text size class for the initials
  className?: string;
}

const COLOR_PAIRS = [
  'bg-pink-100 text-pink-700',
  'bg-purple-100 text-purple-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-sky-100 text-sky-700',
  'bg-rose-100 text-rose-700',
  'bg-indigo-100 text-indigo-700',
];

function getInitials(name?: string | null): string {
  if (!name || !name.trim()) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getColorForName(name?: string | null): string {
  if (!name) return COLOR_PAIRS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLOR_PAIRS[Math.abs(hash) % COLOR_PAIRS.length];
}

/**
 * Shows the user's real photo when one is set. Since this demo has no actual
 * photo upload, freshly created accounts don't get a real avatar - so this
 * falls back to a deterministic initials badge instead of a stranger's stock
 * photo pretending to be them.
 */
export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'w-8 h-8',
  textSize = 'text-xs',
  className = '',
}) => {
  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Profile'}
        className={`${size} rounded-full object-cover border border-slate-200 shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${size} ${textSize} rounded-full flex items-center justify-center font-bold shrink-0 border border-white/50 ${getColorForName(
        name
      )} ${className}`}
    >
      {getInitials(name)}
    </div>
  );
};
