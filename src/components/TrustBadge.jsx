import React from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function TrustBadge({
  text = 'Verified Farmer',
  variant = 'default',
  size = 'md',
  className = ''
}) {
  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold',
  };

  const variants = {
    default: 'bg-forest-50 text-forest-800 border border-forest-200/80',
    subtle: 'bg-cream-100/90 text-forest-900 border border-cream-300/50',
    solid: 'bg-forest-800 text-cream-50',
    amber: 'bg-harvest-50 text-harvest-700 border border-harvest-200',
  };

  return (
    <span className={`inline-flex items-center rounded-full ${sizes[size]} ${variants[variant]} ${className}`}>
      <CheckCircle2 className={size === 'sm' ? 'w-3 h-3 text-fresh-600' : 'w-3.5 h-3.5 text-fresh-600'} />
      <span>{text}</span>
    </span>
  );
}
