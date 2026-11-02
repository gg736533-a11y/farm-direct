import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  Calendar,
  MapPin,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Users,
  Languages,
  Bot,
  AlertCircle,
  Clock,
  Sprout,
  Store,
  Layers,
  Search,
  Check
} from 'lucide-react';
import Button from '../components/Button';
import SectionHeader from '../components/SectionHeader';
import ProductCard from '../components/ProductCard';
import TrustLabel from '../components/TrustLabel';
import AuthModal from '../components/AuthModal';
import FarmerCard from '../components/FarmerCard';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../auth/AuthContext';
import { PRODUCTS, getFeaturedProducts } from '../data/products';

export default function HomePage() {
  const { products, farmers } = useShop();
  const { user, isAuthenticated } = useAuth();
  const isFarmer = isAuthenticated && user?.role === 'farmer';
  const startSellingTarget = isFarmer ? '/farmer/dashboard' : '/register?role=farmer';
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('register');
  const featuredProducts = getFeaturedProducts();

  const trustIndicators = [
    { title: 'Direct from farmers', desc: 'No middle warehouse markups', icon: Sprout },
    { title: 'Transparent product information', desc: 'Harvest dates & soil origins', icon: ShieldCheck },
    { title: 'Traceable products', desc: 'Verifiable batch QR tracking', icon: Layers },
    { title: 'Support local farming', desc: 'Fair revenue direct to growers', icon: Users },
  ];

  const whyFeatures = [
    {
      title: 'Transparent Information',
      desc: 'See important product details before you buy — including soil type, water source, and zero-synthetic certifications.',
      icon: ShieldCheck,
      highlight: 'Know Every Detail'
    },
    {
      title: 'Freshness First',
      desc: 'Know when your product was harvested or packed. Most greens and fruits are dispatched within 24 hours of cutting.',
      icon: Clock,
      highlight: 'Harvest Timestamps'
    },
    {
      title: 'Direct Connection',
      desc: 'Buy directly from the people who grow your food. Visit their digital farm profile and connect directly.',
      icon: Users,
      highlight: 'True Farm-to-Fork'
    },
    {
      title: 'Traceable Products',
      desc: 'Follow product information from farm to you with verifiable batch IDs and digital journey timelines.',
      icon: Layers,
      highlight: 'End-to-End Audit'
    },
  ];

  const howSteps = [
    {
      number: '01',
      title: 'Farmers List',
      desc: 'Farmers add their products and transparent product information including harvest date, origin, and soil health.',
      icon: Store,
    },
    {
      number: '02',
      title: 'Consumers Discover',
      desc: 'Consumers browse products from verified farmers in their region with transparent pricing and real photos.',
      icon: Search,
    },
    {
      number: '03',
      title: 'Verify',
      desc: 'View freshness, origin, ingredients, harvest timelines and batch traceability details on the FarmDirect Trust Label.',
      icon: ShieldCheck,
    },
    {
      number: '04',
      title: 'Buy Direct',
      desc: 'Connect directly with the farmer and place an order, receiving fresh produce straight from the harvest field.',
      icon: CheckCircle2,
    },
  ];

  const farmerBenefits = [
    { title: 'Better Visibility', desc: 'Reach thousands of conscious consumers directly without distributor gatekeeping.' },
    { title: 'Direct Customer Connection', desc: 'Build long-term relationships and brand loyalty for your farm.' },
    { title: 'Transparent Pricing', desc: 'You set the farm-gate price and keep 100% of your earnings with zero hidden cuts.' },
    { title: 'Simple Product Management', desc: 'Easy digital listings via mobile in regional languages like Tamil & English.' },
  ];

  const aiCards = [
    {
      title: 'AI Product Descriptions',
      desc: 'AI-generated product descriptions from simple farmer voice or photo inputs.',
      icon: Bot,
      tag: 'Smart Input'
    },
    {
      title: 'Multilingual Listings',
      desc: 'Create listings in Tamil, English, and regional dialects with automated translation.',
      icon: Languages,
      tag: 'Vernacular'
    },
    {
      title: 'AI Shopping Assistant',
      desc: 'Help consumers find products based on their dietary needs, location, and freshness preference.',
      icon: Sparkles,
      tag: 'Personalized'
    },
    {
      title: 'Freshness Monitoring',
      desc: 'Identify products approaching expiry and dynamically suggest dispatch or discounts.',
      icon: TrendingUp,
      tag: 'Zero Waste'
    },
  ];

  return (
    <div className="space-y-20 sm:space-y-28 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative pt-6 sm:pt-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
              {/* Trust Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-100 text-forest-900 border border-forest-200/80 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-fresh-500 animate-ping" />
                <span>Verified Farmer-to-Consumer Platform</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-forest-950 leading-[1.12]">
                Fresh From Farmers. <br className="hidden sm:inline" />
                <span className="text-fresh-600">Direct To You.</span>
              </h1>

              {/* Supporting Text */}
              <p className="text-lg sm:text-xl text-charcoal-700 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Discover fresh, traceable products directly from local farmers — with transparent information about where your food comes from.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Button
                  to="/marketplace"
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto shadow-md"
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  Explore Marketplace
                </Button>

                <Button
                  to="/farmers"
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Sell on FarmDirect
                </Button>
              </div>

              {/* Quick Proof Counters */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-cream-200 max-w-md mx-auto lg:mx-0">
                <div>
                  <span className="block text-2xl font-extrabold text-forest-950">100%</span>
                  <span className="text-xs text-charcoal-700">Farm Verified</span>
                </div>
                <div>
                  <span className="block text-2xl font-extrabold text-forest-950">24 Hrs</span>
                  <span className="text-xs text-charcoal-700">Harvest to Dispatch</span>
                </div>
                <div>
                  <span className="block text-2xl font-extrabold text-forest-950">Zero</span>
                  <span className="text-xs text-charcoal-700">Intermediaries</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-elevated border border-cream-200/80 bg-white">
                <img
                  src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=1000&q=80"
                  alt="Authentic Indian farmer with fresh harvest in lush green agricultural field"
                  className="w-full h-[420px] sm:h-[480px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 via-transparent to-black/10" />

                {/* Floating Farm Origin Card */}
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/95 backdrop-blur-md shadow-lg border border-white/60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-forest-900 text-cream-50 flex items-center justify-center font-bold">
                        <Sprout className="w-6 h-6 text-fresh-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-sm text-charcoal-900">Ravi Farms</h4>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-fresh-100 text-forest-800 font-bold">✓ VERIFIED</span>
                        </div>
                        <p className="text-xs text-charcoal-700">Salem, Tamil Nadu • 12 Acres</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700">Harvest</span>
                      <p className="text-xs font-bold text-forest-950">This Morning</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Leaf Glow */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-fresh-400/20 rounded-full blur-3xl -z-10" />
              <div className="absolute -bottom-6 -left-6 w-36 h-36 bg-forest-700/20 rounded-full blur-3xl -z-10" />
            </div>
          </div>
        </div>

        {/* TRUST INDICATOR BAR */}
        <div className="mt-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white rounded-2xl p-6 shadow-soft border border-cream-200">
            {trustIndicators.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex items-center gap-3.5 p-2">
                  <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-fresh-600" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-charcoal-900">{item.title}</h5>
                    <p className="text-xs text-charcoal-700">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION A — WHY FARMDIRECT? */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          tag="Why FarmDirect?"
          title="Know What You Buy."
          subtitle="Consumers can see complete farmer information, harvest date, packing date, ingredients, product origin, and freshness information before every purchase."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {whyFeatures.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-cream-200/80 shadow-soft hover:shadow-card transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-forest-50 group-hover:bg-forest-900 text-forest-800 group-hover:text-cream-50 transition-colors flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-fresh-700 block mb-1">
                    {card.highlight}
                  </span>
                  <h3 className="text-lg font-bold text-charcoal-900 mb-2.5">{card.title}</h3>
                  <p className="text-sm text-charcoal-700 leading-relaxed">{card.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION B — FEATURED PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-forest-100/70 text-forest-800 border border-forest-200/50 mb-2">
              Nearby Harvests
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-charcoal-900">
              Fresh From Nearby Farms
            </h2>
            <p className="text-sm sm:text-base text-charcoal-700 mt-2">
              Hand-picked within the last 24–48 hours with verified farmer provenance.
            </p>
          </div>

          <Button
            to="/marketplace"
            variant="secondary"
            size="md"
            icon={ArrowRight}
            iconPosition="right"
          >
            View All in Marketplace
          </Button>
        </div>

        {/* Static Product Cards (6 realistic samples) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.slice(0, 6).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* SECTION C — HOW FARMDIRECT WORKS */}
      <section className="bg-forest-900 text-white py-16 sm:py-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 rounded-3xl relative overflow-hidden">
        {/* Subtle background ambient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-fresh-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-forest-800 text-fresh-300 border border-forest-700 inline-block mb-3">
              Simple 4-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              How FarmDirect Works
            </h2>
            <p className="text-cream-200/80 text-base mt-3">
              A streamlined, transparent direct bridge between growers and consumers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="bg-forest-950/70 border border-forest-800/80 rounded-2xl p-6 relative flex flex-col justify-between hover:border-fresh-500/50 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-forest-800 text-fresh-400 flex items-center justify-center">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-2xl font-black text-forest-700">{step.number}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-sm text-cream-200/70 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION D — TRUST / TRANSPARENCY & TRUST LABEL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-forest-100/70 text-forest-800 border border-forest-200/50">
              Verified Provenance
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-charcoal-900 tracking-tight leading-tight">
              Transparency You Can See
            </h2>
            <p className="text-base text-charcoal-700 leading-relaxed">
              Every food listing on FarmDirect carries a tamper-evident digital <strong>Trust Label</strong>. You no longer have to guess who harvested your food, when it was plucked from the earth, or whether artificial chemicals were applied.
            </p>

            <div className="space-y-3 pt-2">
              {[
                'Exact harvest time down to the hour',
                'Zero mystery middleman packing centers',
                'Soil type, water source & seed origin disclosed',
                'Verifiable QR batch tracking code'
              ].map((point, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-fresh-100 text-fresh-700 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm font-medium text-charcoal-800">{point}</span>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <Button
                to="/how-it-works"
                variant="outline"
                size="md"
                icon={ArrowRight}
                iconPosition="right"
              >
                Learn How We Verify Farms
              </Button>
            </div>
          </div>

          {/* Right: The Mock Trust Label Component */}
          <div className="lg:col-span-6 flex justify-center">
            <TrustLabel />
          </div>
        </div>
      </section>

      {/* SECTION E — FOR FARMERS BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-cream-100 via-white to-fresh-50 rounded-3xl p-8 sm:p-12 border border-cream-300 shadow-soft">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-forest-900 text-cream-50 inline-block">
                For Local Growers & Farmers
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-forest-950 tracking-tight">
                Grow More. Sell Direct.
              </h2>
              <p className="text-base text-charcoal-700 leading-relaxed max-w-xl">
                FarmDirect gives farmers a simple digital storefront to showcase their products, manage listings and connect directly with consumers.
              </p>

              {/* Benefits Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {farmerBenefits.map((b, idx) => (
                  <div key={idx} className="bg-white p-3.5 rounded-xl border border-cream-200">
                    <h5 className="font-bold text-sm text-forest-900">{b.title}</h5>
                    <p className="text-xs text-charcoal-700 mt-1">{b.desc}</p>
                  </div>
                ))}
              </div>

              <div className="pt-3">
                <Button
                  to={startSellingTarget}
                  variant="primary"
                  size="lg"
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  {isFarmer ? 'Go to Farmer Dashboard' : 'Start Selling'}
                </Button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl overflow-hidden shadow-card border border-cream-200 bg-white">
                <img
                  src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80"
                  alt="Farmer smiling in organic farm"
                  className="w-full h-72 object-cover"
                />
                <div className="p-4 bg-forest-900 text-white text-center">
                  <p className="text-xs font-semibold text-fresh-300 uppercase tracking-wider">Farmer Onboarding</p>
                  <p className="text-sm font-bold text-white mt-0.5">Free Verification & Support in Your Native Language</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION F — AI FUTURE SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-cream-200 shadow-soft relative overflow-hidden">
          {/* Subtle tech grid background accent */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-forest-50 rounded-full blur-3xl -z-0 pointer-events-none" />

          <div className="relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-forest-100 text-forest-900 border border-forest-300 inline-block mb-3">
                AI POWERED — COMING SOON
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-charcoal-900 tracking-tight">
                Smarter Farming. Smarter Shopping.
              </h2>
              <p className="text-base text-charcoal-700 mt-3">
                Next-generation intelligent features to make farm direct listing and consumer discovery effortless.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {aiCards.map((card, idx) => {
                const Icon = card.icon;
                return (
                  <div
                    key={idx}
                    className="bg-[#FAF8F5] rounded-2xl p-6 border border-cream-300 hover:border-forest-600/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-11 h-11 rounded-xl bg-forest-900 text-fresh-400 flex items-center justify-center">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cream-200 text-forest-900">
                          {card.tag}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-charcoal-900 mb-2">{card.title}</h3>
                      <p className="text-xs text-charcoal-700 leading-relaxed">{card.desc}</p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-cream-300/60 flex items-center gap-1.5 text-[11px] font-semibold text-forest-700">
                      <Sparkles className="w-3.5 h-3.5 text-fresh-600" />
                      <span>In Development</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION G — FINAL CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-forest-950 text-white rounded-3xl p-8 sm:p-14 text-center relative overflow-hidden shadow-elevated">
          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-forest-900 text-fresh-300 border border-forest-800 inline-block">
              Direct Connection
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              From Our Farms To Your Table.
            </h2>
            <p className="text-base sm:text-lg text-cream-200/80 font-normal leading-relaxed">
              Build a more transparent connection between farmers and consumers. Taste the genuine difference of food harvested just hours ago.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                to="/marketplace"
                variant="accent"
                size="lg"
                className="w-full sm:w-auto shadow-md"
              >
                Explore Products
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  setAuthMode('register');
                  setAuthModalOpen(true);
                }}
                className="w-full sm:w-auto bg-white/10 text-white border-white/30 hover:bg-white/20 hover:text-white"
              >
                Join FarmDirect
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Auth Modal Trigger */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
      />
    </div>
  );
}
