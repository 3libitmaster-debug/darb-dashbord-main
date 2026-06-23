import React, { ReactNode } from 'react';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

export const Badge = ({ variant = 'neutral', children, className = '' }: BadgeProps) => {
  const styles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border-amber-100',
    danger: 'bg-rose-50 text-rose-700 border-rose-100',
    info: 'bg-sky-50 text-sky-700 border-sky-100',
    neutral: 'bg-slate-50 text-slate-600 border-slate-100/80',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black rounded-xl border ${styles[variant]} transition-all tracking-wide ${className}`}>
      {children}
    </span>
  );
};
