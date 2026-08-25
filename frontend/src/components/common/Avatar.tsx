import React from 'react';

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: string; // tailwind size classes, e.g. "w-8 h-8"
  textSize?: string; // tailwind text size class for the initials
  className?: string;
  ring?: boolean;
}

const COLOR_PAIRS = [
  'bg-gradient-to-tr from-pink-500 to-rose-400 text-white',
  'bg-gradient-to-tr from-purple-600 to-indigo-500 text-white',
  'bg-gradient-to-tr from-emerald-500 to-teal-400 text-white',
  'bg-gradient-to-tr from-amber-500 to-orange-400 text-white',
  'bg-gradient-to-tr from-sky-500 to-blue-600 text-white',
  'bg-gradient-to-tr from-indigo-600 to-purple-500 text-white',
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

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'w-8 h-8',
  textSize = 'text-xs',
  className = '',
  ring = false
}) => {
  const ringClass = ring ? 'ring-2 ring-pink-500/20 ring-offset-2 ring-offset-white' : '';

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Profile'}
        className={`${size} rounded-full object-cover border border-slate-200/90 shadow-2xs shrink-0 transition-transform duration-200 hover:scale-105 ${ringClass} ${className}`}
      />
    );
  }

  return (
    <div
      className={`${size} ${textSize} rounded-full flex items-center justify-center font-black tracking-tight shrink-0 border border-white/60 shadow-2xs ${getColorForName(
        name
      )} ${ringClass} ${className}`}
    >
      {getInitials(name)}
    </div>
  );
};
