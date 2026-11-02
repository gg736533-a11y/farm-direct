import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Store, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

export default function UnauthorizedPage() {
  const { user } = useAuth();
  const location = useLocation();
  const isConsumer = user?.role === 'consumer';
  const isFarmer = user?.role === 'farmer';

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6 bg-[#FAF8F5]">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-cream-200 shadow-soft animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight">
            Access Restricted
          </h1>
          <p className="text-sm text-charcoal-600 leading-relaxed">
            You don't have permission to view this page.
          </p>
          {isConsumer && (
            <p className="text-xs text-charcoal-500 bg-cream-100 p-2.5 rounded-xl mt-2">
              This area is dedicated to verified farmers managing products and farm inventory.
            </p>
          )}
          {isFarmer && (
            <p className="text-xs text-charcoal-500 bg-cream-100 p-2.5 rounded-xl mt-2">
              This area is dedicated to consumer shopping and personal buyer accounts.
            </p>
          )}
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          {isFarmer ? (
            <Link
              to="/farmer/dashboard"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs shadow-soft transition-all"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Back to Farmer Dashboard</span>
            </Link>
          ) : (
            <Link
              to="/marketplace"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-forest-900 hover:bg-forest-800 text-cream-50 font-bold text-xs shadow-soft transition-all"
            >
              <Store className="w-4 h-4" />
              <span>Go to Marketplace</span>
            </Link>
          )}

          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-cream-100 hover:bg-cream-200 text-charcoal-800 font-bold text-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
