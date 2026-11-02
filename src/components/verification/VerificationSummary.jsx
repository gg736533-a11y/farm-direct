import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  AlertCircle,
  AlertTriangle,
  Info,
  RotateCw,
  Sparkles,
  CheckCircle2,
  Lock
} from 'lucide-react';

export default function VerificationSummary({
  riskLevel = 'LOW',
  totalProducts = 0,
  productsRequiringReview = 0,
  highSeverity = 0,
  mediumSeverity = 0,
  lowSeverity = 0,
  summary = '',
  recommendations = [],
  onRunCheck,
  loading = false
}) {
  const normRisk = (riskLevel || 'LOW').toUpperCase();

  const getRiskStyle = () => {
    switch (normRisk) {
      case 'HIGH':
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-800',
          badge: 'bg-rose-600 text-white',
          dot: 'bg-rose-400',
          icon: ShieldAlert,
          title: 'High Attention Recommended'
        };
      case 'MEDIUM':
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-800',
          badge: 'bg-amber-600 text-white',
          dot: 'bg-amber-300',
          icon: ShieldAlert,
          title: 'Review Recommended'
        };
      case 'LOW':
      default:
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
          badge: 'bg-emerald-700 text-white',
          dot: 'bg-emerald-300',
          icon: ShieldCheck,
          title: 'Healthy Listing Health'
        };
    }
  };

  const riskStyle = getRiskStyle();
  const RiskIcon = riskStyle.icon;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-6">
      {/* Top Header & Run Check Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-700" />
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              AI Verification & Product Health
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Real-time consistency audit comparing pricing, stock, dates, and transparency.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${riskStyle.bg}`}
          >
            <RiskIcon className="w-4 h-4" />
            <span>Overall Risk: {normRisk}</span>
          </div>

          {onRunCheck && (
            <button
              type="button"
              id="run-verification-check-btn"
              onClick={onRunCheck}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Analyzing product data...' : 'Run Verification Check'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Dashboard Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Products Analyzed
          </span>
          <span className="text-2xl font-black text-slate-900 block">
            {totalProducts}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/70 space-y-1">
          <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider block">
            High Risk Flags
          </span>
          <span className="text-2xl font-black text-rose-900 block">
            {highSeverity}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/70 space-y-1">
          <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">
            Medium Risk Flags
          </span>
          <span className="text-2xl font-black text-amber-900 block">
            {mediumSeverity}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-200/70 space-y-1">
          <span className="text-[11px] font-semibold text-sky-700 uppercase tracking-wider block">
            Low Risk Flags
          </span>
          <span className="text-2xl font-black text-sky-900 block">
            {lowSeverity}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/70 space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
            Require Review
          </span>
          <span className="text-2xl font-black text-emerald-950 block">
            {productsRequiringReview}
          </span>
        </div>
      </div>

      {/* Summary Box & Recommendations */}
      {summary && (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3 text-xs">
          <div className="flex items-center gap-2 text-slate-800 font-bold">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>AI Review Summary</span>
          </div>
          <p className="text-slate-700 leading-relaxed font-sans">{summary}</p>

          {recommendations && recommendations.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
              <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                Recommended Actions:
              </span>
              <ul className="space-y-1">
                {recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Important Advisory Disclaimer Banner */}
      <div className="p-3.5 rounded-2xl bg-slate-100/70 border border-slate-200/80 flex items-center gap-2.5 text-xs text-slate-500">
        <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <span className="font-medium">
          This is an automated review aid. It does not replace human verification.
        </span>
      </div>
    </div>
  );
}
