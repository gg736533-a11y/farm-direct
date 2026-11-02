import React from 'react';
import { Sprout, Scissors, PackageCheck, Store, ShoppingBag, CheckCircle2, Clock } from 'lucide-react';

const stageIcons = {
  FARM: Sprout,
  HARVESTED: Scissors,
  PACKED: PackageCheck,
  LISTED: Store,
  PURCHASED: ShoppingBag
};

/**
 * TraceabilityTimeline Component
 * Renders milestone progression derived directly from PostgreSQL data.
 * Displays only authentic events (Farm, Harvested, Packed, Listed, and Verified Purchase).
 */
export default function TraceabilityTimeline({
  timeline = [],
  className = ''
}) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-charcoal-500">
        No timeline events recorded for this product yet.
      </div>
    );
  }

  return (
    <div className={`w-full py-4 ${className}`}>
      {/* Desktop / Tablet Horizontal Timeline */}
      <div className={`hidden md:grid gap-4 relative`} style={{ gridTemplateColumns: `repeat(${timeline.length}, minmax(0, 1fr))` }}>
        {/* Horizontal Connector Line */}
        <div className="absolute top-7 left-10 right-10 h-0.5 bg-forest-200/80 -z-0" />

        {timeline.map((item, idx) => {
          const Icon = stageIcons[item.stage] || Sprout;
          const isDone = item.status === 'completed';

          return (
            <div key={idx} className="flex flex-col items-center text-center relative z-10 px-2">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform hover:scale-105 shadow-sm ${
                  isDone
                    ? 'bg-forest-900 text-cream-100 ring-4 ring-forest-100'
                    : 'bg-white text-charcoal-400 border border-cream-300'
                }`}
              >
                <Icon className="w-6 h-6" />
              </div>

              <span className="mt-3 text-[10px] font-bold uppercase tracking-wider text-forest-700">
                Step {idx + 1} • {item.stage}
              </span>
              <h5 className="text-xs font-bold text-charcoal-900 mt-0.5">{item.title}</h5>
              {item.date && (
                <p className="text-[11px] font-semibold text-charcoal-700 mt-1">{item.date}</p>
              )}
              {item.description && (
                <p className="text-[11px] text-charcoal-500 mt-0.5 leading-tight">{item.description}</p>
              )}
              {item.location && (
                <span className="text-[10px] text-fresh-700 font-medium mt-1 truncate max-w-full">
                  {item.location}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Stacked Vertical Timeline */}
      <div className="md:hidden relative pl-6 border-l-2 border-forest-200 space-y-6 ml-4">
        {timeline.map((item, idx) => {
          const Icon = stageIcons[item.stage] || Sprout;
          const isDone = item.status === 'completed';

          return (
            <div key={idx} className="relative">
              {/* Node Bullet */}
              <div
                className={`absolute -left-[35px] top-0 w-8 h-8 rounded-xl flex items-center justify-center ${
                  isDone
                    ? 'bg-forest-900 text-cream-100'
                    : 'bg-white text-charcoal-400 border border-cream-300'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="bg-white p-4 rounded-2xl border border-cream-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700">
                    Step {idx + 1} — {item.stage}
                  </span>
                  {isDone ? (
                    <span className="inline-flex items-center gap-1 text-[10px] text-fresh-700 font-semibold">
                      <CheckCircle2 className="w-3 h-3" /> Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] text-charcoal-400 font-semibold">
                      <Clock className="w-3 h-3" /> Pending
                    </span>
                  )}
                </div>
                <h5 className="text-sm font-bold text-charcoal-900 mt-1">{item.title}</h5>
                {item.date && (
                  <p className="text-xs font-semibold text-charcoal-800 mt-0.5">{item.date}</p>
                )}
                {item.description && (
                  <p className="text-xs text-charcoal-600 mt-1">{item.description}</p>
                )}
                {item.location && (
                  <p className="text-[11px] font-medium text-fresh-700 mt-1">{item.location}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
