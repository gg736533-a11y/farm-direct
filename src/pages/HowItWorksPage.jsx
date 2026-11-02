import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sprout,
  PackageCheck,
  QrCode,
  Users,
  Search,
  Check,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import TrustLabel from '../components/TrustLabel';
import TraceabilityTimeline from '../components/TraceabilityTimeline';
import Button from '../components/Button';

export default function HowItWorksPage() {
  const [openFaq, setOpenFaq] = useState(null);

  const pillars = [
    {
      title: 'Farmer Verification',
      desc: 'Every farmer is verified on-site. We inspect land records, soil management practices, and confirm zero-chemical pesticide usage.',
      icon: ShieldCheck,
    },
    {
      title: 'Real Harvest Dates',
      desc: 'No cold-storage guessing. Harvest dates and times are stamped on the package before leaving the farm gate.',
      icon: Clock,
    },
    {
      title: 'Batch Traceability',
      desc: 'Every product carries a digital batch code linked to field plot coordinates, irrigation methods, and harvest logs.',
      icon: QrCode,
    },
    {
      title: 'Direct Farmer Income',
      desc: 'Farmers set their prices without wholesale price depression. 100% of the sale goes directly to the grower.',
      icon: Sprout,
    },
  ];

  const faqs = [
    {
      q: 'How does FarmDirect guarantee harvest dates?',
      a: 'Farmers log harvest batches the day of collection. Our local field coordinators verify harvest schedules and attach tamper-evident digital seals before dispatch.'
    },
    {
      q: 'What does the Verified Farmer badge indicate?',
      a: 'A Verified Farmer has completed land verification, identity checks, sustainable farming assessment, and signed FarmDirect’s Zero-Hidden-Chemicals covenant.'
    },
    {
      q: 'How is FarmDirect different from standard e-commerce grocery apps?',
      a: 'Standard apps buy wholesale, store produce in central cold hubs for days, and hide the farmer’s identity. FarmDirect connects you directly to individual farms with full transparency on origin, soil, and harvest timestamps.'
    },
    {
      q: 'Can I visit the farm where my produce was grown?',
      a: 'Yes! Verified farmers frequently host open harvest days. You can reach out directly via the "Contact Farmer" link on their farm profile.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-16 sm:space-y-24">
      {/* Top Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-forest-100 text-forest-800 border border-forest-200 inline-block">
          Transparency & Provenance
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-charcoal-900 tracking-tight">
          How FarmDirect Works
        </h1>
        <p className="text-base sm:text-lg text-charcoal-700 leading-relaxed">
          We eliminate the black box of modern food supply chains by empowering growers and consumers with transparent harvest information.
        </p>
      </div>

      {/* 4 Pillars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {pillars.map((pillar, idx) => {
          const Icon = pillar.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-cream-200 shadow-soft flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-fresh-600" />
                </div>
                <h3 className="text-lg font-bold text-charcoal-900 mb-2">{pillar.title}</h3>
                <p className="text-sm text-charcoal-700 leading-relaxed">{pillar.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Traceability Spotlight Section */}
      <section id="traceability" className="scroll-mt-24 bg-white rounded-3xl p-6 sm:p-12 border border-cream-200 shadow-soft">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-fresh-100 text-fresh-800 inline-block mb-3">
            End-to-End Visibility
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-charcoal-900">
            The Journey of Your Food
          </h2>
          <p className="text-sm sm:text-base text-charcoal-700 mt-2">
            Follow product information step-by-step from the farm field to your kitchen counter.
          </p>
        </div>

        <TraceabilityTimeline />
      </section>

      {/* The Trust Label Breakdown */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-6 space-y-5">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-forest-100 text-forest-800 inline-block">
            Standard of Authenticity
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-charcoal-900">
            The FarmDirect Trust Label
          </h2>
          <p className="text-sm sm:text-base text-charcoal-700 leading-relaxed">
            Every product on our platform displays this standard digital stamp. No marketing jargon, no misleading labels — just transparent agricultural facts.
          </p>

          <div className="space-y-3 pt-2 text-sm text-charcoal-800">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-fresh-100 text-fresh-700 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <p><strong>Harvest & Packing Timestamps:</strong> Know whether your food was harvested hours or days ago.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-fresh-100 text-fresh-700 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <p><strong>Specific Geographic Origin:</strong> Pinpoints the district, village, and farm name.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-fresh-100 text-fresh-700 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <p><strong>Single-Ingredient Purity:</strong> 100% natural, unadulterated produce.</p>
            </div>
          </div>

          <div className="pt-3">
            <Button to="/marketplace" variant="primary" size="md">
              Explore Products With Trust Labels
            </Button>
          </div>
        </div>

        <div className="lg:col-span-6 flex justify-center">
          <TrustLabel />
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="max-w-3xl mx-auto space-y-6">
        <div className="text-center">
          <h3 className="text-2xl sm:text-3xl font-bold text-charcoal-900">Frequently Asked Questions</h3>
          <p className="text-sm text-charcoal-700 mt-1">Everything you need to know about our sourcing transparency.</p>
        </div>

        <div className="space-y-3 pt-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-cream-200 overflow-hidden transition-all shadow-sm"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-charcoal-900"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-forest-700 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-charcoal-700 leading-relaxed border-t border-cream-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
