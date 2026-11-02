import React from 'react';
import { Clock, Sparkles } from 'lucide-react';

export default function FreshnessBadge({
  text = 'Freshly Harvested',
  size = 'md',
  className = ''
}) {
  const isToday = text.toLowerCase().includes('morning') || text.toLowerCase().includes('today') || text.toLowerCase().includes('yesterday');

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold',
  };

  const badgeStyle = isToday
    ? 'bg-fresh-50 text-fresh-700 border border-fresh-200 shadow-sm'
    : 'bg-cream-100 text-charcoal-700 border border-cream-300/60';

  const Icon = isToday ? Sparkles : Clock;

  return (
    <span className={`inline-flex items-center rounded-full ${sizes[size]} ${badgeStyle} ${className}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3 text-fresh-600' : 'w-3.5 h-3.5 text-fresh-600'} />
      <span>{text}</span>
    </span>
  );
}
