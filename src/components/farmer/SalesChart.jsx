import React, { useState } from 'react';
import { TrendingUp, Calendar, Info } from 'lucide-react';
import { SALES_CHART_DATA } from '../../data/farmerData';

export default function SalesChart() {
  const [activeFilter, setActiveFilter] = useState('7d');
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const currentData = SALES_CHART_DATA[activeFilter] || SALES_CHART_DATA['7d'];
  const points = currentData.points;
  const maxValue = Math.max(...points.map((p) => p.value), 1);

  // SVG dimensions
  const height = 180;
  const width = 500;
  const paddingBottom = 25;
  const paddingTop = 20;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Sales Overview
            </h3>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <TrendingUp className="w-3 h-3" />
              {currentData.growth}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Total sales {currentData.total} across {currentData.title.toLowerCase()}
          </p>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          {[
            { id: '7d', label: '7 Days' },
            { id: '30d', label: '30 Days' },
            { id: '3m', label: '3 Months' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveFilter(tab.id);
                setHoveredIndex(null);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeFilter === tab.id
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive SVG Bar & Trend Visualizer */}
      <div className="mt-6">
        {/* Dynamic Tooltip */}
        <div className="h-6 flex items-center justify-between text-xs text-slate-500 mb-2 px-1">
          {hoveredIndex !== null ? (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">
                {points[hoveredIndex].label}:
              </span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                {points[hoveredIndex].formatted}
              </span>
              <span className="text-[11px] text-slate-400">
                ({points[hoveredIndex].orders} orders)
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-slate-400">
              <Info className="w-3.5 h-3.5" />
              <span>Hover over bars to inspect daily breakdown</span>
            </div>
          )}
          <span className="text-[11px] font-mono text-slate-400">
            Peak: ₹{maxValue.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Bars Container */}
        <div className="relative pt-6 pb-2">
          {/* Subtle Gridlines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
            <div className="border-b border-dashed border-slate-200 w-full" />
            <div className="border-b border-dashed border-slate-200 w-full" />
            <div className="border-b border-dashed border-slate-200 w-full" />
          </div>

          <div className="relative grid grid-flow-col auto-cols-fr gap-2 sm:gap-4 items-end h-44 px-2">
            {points.map((point, index) => {
              const heightPercent = Math.max(12, Math.round((point.value / maxValue) * 100));
              const isHovered = hoveredIndex === index;
              const isHighest = point.value === maxValue;

              return (
                <div
                  key={point.label}
                  className="flex flex-col items-center h-full justify-end group cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Floating value on peak or hover */}
                  <div
                    className={`text-[10px] font-bold font-mono transition-all duration-150 mb-1.5 ${
                      isHovered
                        ? 'opacity-100 -translate-y-1 text-emerald-800'
                        : isHighest
                        ? 'opacity-80 text-slate-600'
                        : 'opacity-0 group-hover:opacity-100 text-slate-500'
                    }`}
                  >
                    {point.formatted}
                  </div>

                  {/* Bar */}
                  <div className="w-full max-w-[36px] bg-slate-100 rounded-t-xl overflow-hidden flex flex-col justify-end transition-all h-full">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-xl transition-all duration-300 ${
                        isHovered
                          ? 'bg-gradient-to-t from-emerald-600 to-fresh-500 shadow-md scale-105'
                          : isHighest
                          ? 'bg-gradient-to-t from-forest-800 to-emerald-600'
                          : 'bg-gradient-to-t from-slate-300 to-emerald-500/80 group-hover:from-emerald-600 group-hover:to-fresh-500'
                      }`}
                    />
                  </div>

                  {/* Label */}
                  <span
                    className={`mt-2 text-[11px] transition-colors font-medium ${
                      isHovered
                        ? 'text-emerald-800 font-bold'
                        : 'text-slate-600'
                    }`}
                  >
                    {point.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
