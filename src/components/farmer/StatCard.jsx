import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function StatCard({
  title,
  value,
  supportingText,
  icon: Icon,
  trend = 'up',
  colorScheme = 'emerald'
}) {
  const colorMap = {
    emerald: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      badge: 'text-emerald-700 bg-emerald-50 border-emerald-200/60'
    },
    blue: {
      bg: 'bg-blue-50 text-blue-700 border-blue-100',
      badge: 'text-blue-700 bg-blue-50 border-blue-200/60'
    },
    amber: {
      bg: 'bg-amber-50 text-amber-700 border-amber-100',
      badge: 'text-amber-700 bg-amber-50 border-amber-200/60'
    },
    purple: {
      bg: 'bg-purple-50 text-purple-700 border-purple-100',
      badge: 'text-purple-700 bg-purple-50 border-purple-200/60'
    }
  };

  const currentScheme = colorMap[colorScheme] || colorMap.emerald;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-soft hover:shadow-card transition-all duration-200">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${currentScheme.bg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {value}
        </div>

        {supportingText && (
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            {trend === 'up' && <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 font-bold" />}
            {trend === 'down' && <ArrowDownRight className="w-3.5 h-3.5 text-rose-600 font-bold" />}
            {trend === 'neutral' && <Minus className="w-3.5 h-3.5 text-amber-600 font-bold" />}
            <span className="text-slate-600 font-medium">
              {supportingText}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
