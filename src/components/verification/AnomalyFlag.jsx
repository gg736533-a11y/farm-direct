import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle2, ChevronRight } from 'lucide-react';

export default function AnomalyFlag({
  type,
  severity = 'LOW',
  title,
  message,
  evidence,
  recommendation
}) {
  const normSeverity = (severity || 'LOW').toUpperCase();

  const getSeverityBadge = () => {
    switch (normSeverity) {
      case 'HIGH':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-200/80',
          dot: 'bg-rose-500',
          icon: AlertCircle,
          label: 'HIGH SEVERITY'
        };
      case 'MEDIUM':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200/80',
          dot: 'bg-amber-500',
          icon: AlertTriangle,
          label: 'MEDIUM SEVERITY'
        };
      case 'LOW':
      default:
        return {
          bg: 'bg-sky-50 text-sky-800 border-sky-200/80',
          dot: 'bg-sky-500',
          icon: Info,
          label: 'NOTICE'
        };
    }
  };

  const badge = getSeverityBadge();
  const IconComponent = badge.icon;

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 transition-all space-y-3 ${
        normSeverity === 'HIGH'
          ? 'bg-rose-50/40 border-rose-200/70'
          : normSeverity === 'MEDIUM'
          ? 'bg-amber-50/30 border-amber-200/70'
          : 'bg-slate-50/70 border-slate-200/80'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
              normSeverity === 'HIGH'
                ? 'bg-rose-100 text-rose-700'
                : normSeverity === 'MEDIUM'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-sky-100 text-sky-800'
            }`}
          >
            <IconComponent className="w-4 h-4" />
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-slate-900">{title}</h4>
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${badge.bg}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                <span>{badge.label}</span>
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{message}</p>
          </div>
        </div>
      </div>

      {/* Evidence section if available */}
      {evidence && Object.keys(evidence).length > 0 && (
        <div className="bg-white/80 backdrop-blur-xs rounded-xl p-3 border border-slate-200/60 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
            Observation Evidence
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-700">
            {Object.entries(evidence).map(([key, val]) => (
              <div key={key} className="space-y-0.5">
                <span className="text-[11px] text-slate-500 font-medium capitalize">
                  {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                </span>
                <span className="font-bold text-slate-800 block truncate">
                  {typeof val === 'number' && (key.toLowerCase().includes('price') || key.toLowerCase().includes('average'))
                    ? `₹${val}`
                    : typeof val === 'number' && key.toLowerCase().includes('percent')
                    ? `${val}%`
                    : String(val)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended action */}
      {recommendation && (
        <div className="flex items-start gap-2 pt-1 text-xs text-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold text-slate-900">Recommendation: </span>
            <span className="text-slate-600">{recommendation}</span>
          </div>
        </div>
      )}
    </div>
  );
}
