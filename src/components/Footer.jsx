import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, Leaf, Mail, ArrowRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-forest-950 text-cream-100 border-t border-forest-900 pt-16 pb-12 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-forest-900/80">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-forest-800 flex items-center justify-center text-cream-50 shadow-sm border border-forest-700">
                <svg className="w-6 h-6 text-fresh-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                </svg>
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white">
                Farm<span className="text-fresh-400">Direct</span>
              </span>
            </Link>

            <p className="text-sm text-cream-200/80 max-w-sm leading-relaxed">
              A transparent farmer-to-consumer marketplace platform. Reconnecting communities with genuine growers through direct farm sourcing, harvest dates, and verifiable traceability.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-forest-900 text-fresh-300 border border-forest-800">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% Verified Provenance</span>
              </span>
            </div>
          </div>

          {/* Column 1: Platform */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-fresh-300 mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/marketplace" className="text-cream-200/80 hover:text-white transition-colors">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-cream-200/80 hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/how-it-works#traceability" className="text-cream-200/80 hover:text-white transition-colors">
                  Traceability
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: For Farmers */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-fresh-300 mb-4">
              For Farmers
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/farmers" className="text-cream-200/80 hover:text-white transition-colors">
                  Sell on FarmDirect
                </Link>
              </li>
              <li>
                <Link to="/farmers" className="text-cream-200/80 hover:text-white transition-colors">
                  Farmer Dashboard
                </Link>
              </li>
              <li>
                <Link to="/farmers" className="text-cream-200/80 hover:text-white transition-colors">
                  Verification
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: For Consumers & Company */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-fresh-300 mb-4">
              For Consumers
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/marketplace" className="text-cream-200/80 hover:text-white transition-colors">
                  Browse Products
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-cream-200/80 hover:text-white transition-colors">
                  Orders
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-cream-200/80 hover:text-white transition-colors">
                  Product Transparency
                </Link>
              </li>
            </ul>

            <h4 className="text-sm font-bold uppercase tracking-wider text-fresh-300 mt-6 mb-3">
              Company
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/how-it-works" className="text-cream-200/80 hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-cream-200/80 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <span className="text-cream-300/60 cursor-not-allowed">Privacy</span>
              </li>
              <li>
                <span className="text-cream-300/60 cursor-not-allowed">Terms</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-cream-300/60">
          <p>© 2026 FarmDirect. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Empowering Indian Farmers with Direct Digital Access
          </p>
        </div>
      </div>
    </footer>
  );
}
