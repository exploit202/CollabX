import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = false,
  glass = false,
  ...props
}) => {
  return (
    <div
      className={`${
        glass ? 'glass-card' : 'bg-white border border-slate-200/90 shadow-xs'
      } rounded-2xl p-5 transition-all duration-200 ${
        hoverable ? 'hover:border-pink-300 hover:shadow-md hover:-translate-y-0.5' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
