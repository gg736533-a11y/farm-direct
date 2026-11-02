import React, { useState } from 'react';
import {
  Sprout,
  Store,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Users,
  Smartphone,
  ArrowRight,
  Sparkles,
  BarChart3,
  Calendar,
  Layers
} from 'lucide-react';
import Button from '../components/Button';
import { useAuth } from '../auth/AuthContext';

export default function ForFarmersPage() {
  const { user, isAuthenticated } = useAuth();
  const isFarmer = isAuthenticated && user?.role === 'farmer';
  const farmerTarget = isFarmer ? '/farmer/dashboard' : '/register?role=farmer';

  const steps = [
    {
      step: '1',
      title: 'Quick Farm Registration',
      desc: 'Submit basic details about your farm location, cultivated crops, and land area using your phone.',
      icon: Smartphone,
    },
    {
      step: '2',
      title: 'Free Provenance Verification',
      desc: 'Our local agriculture coordinator visits for soil and practice verification at zero cost.',
      icon: ShieldCheck,
    },
    {
      step: '3',
      title: 'List & Receive Direct Orders',
      desc: 'Set your farm-gate price, post harvest dates, and dispatch directly to nearby consumers.',
      icon: Store,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-16 sm:space-y-24">
      {/* Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-forest-100 text-forest-800 border border-forest-200 inline-block">
            Empowering Local Growers
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-charcoal-900 tracking-tight leading-tight">
            Grow More. <br />
            <span className="text-fresh-600">Sell Direct.</span>
          </h1>
          <p className="text-base sm:text-lg text-charcoal-700 leading-relaxed max-w-xl">
            FarmDirect gives farmers a simple digital storefront to showcase their products, manage listings and connect directly with consumers — keeping 100% of your deserved harvest income.
          </p>

          <div className="flex flex-col sm:flex-row gap-3.5 pt-2">
            <Button
              to={farmerTarget}
              variant="primary"
              size="lg"
              icon={ArrowRight}
              iconPosition="right"
            >
              {isFarmer ? 'Go to Farmer Dashboard' : 'Start Selling Today'}
            </Button>
            <Button
              to="/marketplace"
              variant="outline"
              size="lg"
            >
              Browse Active Farm Stores
            </Button>
          </div>

          <div className="flex items-center gap-6 pt-4 text-xs font-semibold text-charcoal-700">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-fresh-600" />
              <span>Zero Listing Fees</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-fresh-600" />
              <span>Support in Tamil & English</span>
            </span>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="rounded-3xl overflow-hidden shadow-elevated border border-cream-200 bg-white">
            <img
              src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80"
              alt="Farmer holding bountiful organic vegetables"
              className="w-full h-80 sm:h-96 object-cover"
            />
            <div className="p-6 bg-forest-950 text-cream-50">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-base text-white">Direct Farm Settlement</h4>
                  <p className="text-xs text-cream-200/80">No 30-day distributor credit delays</p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-fresh-600 text-white text-xs font-bold font-mono">
                  100% Fair Gate
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Step Onboarding */}
      <section className="space-y-10">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-forest-700">Simple Onboarding</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-charcoal-900 mt-1">
            How to Join FarmDirect in 3 Steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="bg-white rounded-2xl p-7 border border-cream-200 shadow-soft relative flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-forest-900 text-fresh-400 flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-3xl font-black text-forest-200 absolute top-6 right-6">
                    {item.step}
                  </span>
                  <h3 className="text-lg font-bold text-charcoal-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-charcoal-700 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Mock Farmer Dashboard Preview */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-cream-200 shadow-soft space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-200 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-forest-100 text-forest-800 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-fresh-600" />
              <span>Farmer Storefront Preview</span>
            </div>
            <h3 className="text-2xl font-bold text-charcoal-900">
              Your Digital Farmer Dashboard
            </h3>
            <p className="text-xs text-charcoal-700 mt-0.5">
              A clean, distraction-free interface built for both smartphones and computers.
            </p>
          </div>
          <Button variant="primary" size="md" onClick={() => setAuthModalOpen(true)}>
            Claim Your Dashboard
          </Button>
        </div>

        {/* Dashboard Mock Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-cream-50 p-4 rounded-2xl border border-cream-200">
            <span className="text-[11px] font-bold text-charcoal-700 uppercase tracking-wider">Active Harvests</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-extrabold text-forest-950">4 Crops</span>
              <span className="text-xs font-semibold text-fresh-700">100% Verified</span>
            </div>
          </div>

          <div className="bg-cream-50 p-4 rounded-2xl border border-cream-200">
            <span className="text-[11px] font-bold text-charcoal-700 uppercase tracking-wider">Today&apos;s Dispatches</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-extrabold text-forest-950">18 Orders</span>
              <span className="text-xs font-semibold text-fresh-700">En Route</span>
            </div>
          </div>

          <div className="bg-cream-50 p-4 rounded-2xl border border-cream-200">
            <span className="text-[11px] font-bold text-charcoal-700 uppercase tracking-wider">Average Farm-Gate Realization</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-extrabold text-forest-950">+38%</span>
              <span className="text-xs font-semibold text-fresh-700">vs Wholesale Mandi</span>
            </div>
          </div>

          <div className="bg-cream-50 p-4 rounded-2xl border border-cream-200">
            <span className="text-[11px] font-bold text-charcoal-700 uppercase tracking-wider">Trust Label Rating</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-extrabold text-forest-950">4.9 / 5.0</span>
              <span className="text-xs font-semibold text-harvest-600">★★★★★</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <div className="bg-forest-900 text-white rounded-3xl p-8 sm:p-12 text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
          Ready to Start Selling Directly?
        </h2>
        <p className="text-cream-200/80 max-w-xl mx-auto text-base">
          Join leading farmers in Salem, Erode, Namakkal, and Karur who are building lasting direct connections with conscious consumers.
        </p>
        <div>
          <Button
            to={farmerTarget}
            variant="accent"
            size="lg"
            icon={ArrowRight}
            iconPosition="right"
          >
            {isFarmer ? 'Go to Farmer Dashboard' : 'Register Your Farm Now'}
          </Button>
        </div>
      </div>
    </div>
  );
}
