import React from 'react';
import { AlertTriangle, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FRESHNESS_ALERTS } from '../../data/farmerData';

export default function FreshnessAlert({ alerts = FRESHNESS_ALERTS, className = '' }) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className={`bg-amber-50/70 border border-amber-200/90 rounded-2xl p-5 shadow-soft ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-amber-200/60">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-950">
              Freshness Alerts ({alerts.length})
            </h4>
            <p className="text-[11px] text-amber-800">
              Produce approaching expiry window
            </p>
          </div>
        </div>

        <Link
          to="/farmer/products?filter=expiring"
          className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 hover:text-amber-950 bg-white/80 hover:bg-white px-2.5 py-1.5 rounded-lg border border-amber-200 transition-colors shadow-xs"
        >
          <span>Review Products</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Alert Items */}
      <div className="mt-3.5 space-y-2.5">
        {alerts.map((item) => (
          <div
            key={item.id}
            className="p-3 bg-white/90 rounded-xl border border-amber-200/60 flex items-start justify-between gap-3 text-xs"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-xs sm:text-sm">
                  {item.productName}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    item.expiryDays <= 1
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  Expires {item.expiryDays === 1 ? 'Tomorrow' : `in ${item.expiryDays} days`}
                </span>
              </div>
              <p className="text-slate-600 text-xs">
                {item.message}
              </p>
              <p className="text-[11px] font-medium text-slate-500">
                Stock: <span className="font-semibold text-slate-700">{item.currentStock}</span> • Valid till: {item.expiryDate}
              </p>
            </div>

            <Link
              to={`/farmer/products/${item.productId}/edit`}
              className="text-xs font-bold text-slate-700 hover:text-emerald-700 whitespace-nowrap self-center px-2 py-1 rounded bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 transition-colors"
            >
              Adjust
            </Link>
          </div>
        ))}
      </div>

      {/* AI monitor footnote */}
      <div className="mt-3 pt-2.5 border-t border-amber-200/50 flex items-center justify-between text-[11px] text-amber-900/80">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-700" />
          <span>Will connect to the AI Freshness Monitoring Agent in upcoming session</span>
        </span>
      </div>
    </div>
  );
}
