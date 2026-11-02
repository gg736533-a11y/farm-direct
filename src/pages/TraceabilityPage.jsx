import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Calendar,
  Layers,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Store,
  Clock,
  Sparkles
} from 'lucide-react';
import traceabilityApi from '../api/traceability';
import TrustLabel from '../components/TrustLabel';
import TraceabilityTimeline from '../components/TraceabilityTimeline';
import QRCodeLabel from '../components/QRCodeLabel';
import TrustBadge from '../components/TrustBadge';
import ProductTraceabilityCertificate from '../components/ProductTraceabilityCertificate';

export default function TraceabilityPage() {
  const { productId } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchTraceability() {
      try {
        setLoading(true);
        setError(null);
        const res = await traceabilityApi.getTraceability(productId);
        if (res && res.success && isMounted) {
          setData(res);
        } else if (isMounted) {
          setError(res?.message || 'Traceability information unavailable');
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching traceability:', err);
          setError(err.message || 'Traceability information unavailable');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (productId) {
      fetchTraceability();
    } else {
      setError('Product ID is required.');
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-forest-700 animate-spin" />
        <h2 className="text-base font-bold text-charcoal-900">Loading Product Traceability...</h2>
        <p className="text-xs text-charcoal-500">Querying verified agricultural harvest records...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[60vh] max-w-lg mx-auto px-4 py-16 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-charcoal-900">
          Traceability Information Unavailable
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed max-w-md">
          {error || 'The requested product either does not exist or does not currently have public traceability data registered.'}
        </p>
        <div className="pt-2">
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-cream-50 text-xs font-bold transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Browse Marketplace</span>
          </Link>
        </div>
      </div>
    );
  }

  const { product, farmer, transparency, traceability } = data;
  const isExpired = traceability.expiryStatus === 'EXPIRED';
  const isExpiringSoon = traceability.expiryStatus === 'EXPIRING_SOON';
  const isComplete = traceability.isComplete;

  return (
    <>
      <div className="web-page-wrapper print:hidden max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10 animate-fade-in">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to={`/product/${product.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-800 hover:text-fresh-600 transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Product Details</span>
        </Link>

        <span className="text-xs text-charcoal-500 font-medium">
          Category: <span className="font-bold text-forest-900 capitalize">{product.category}</span>
        </span>
      </div>

      {/* Main Provenance Header Banner */}
      <div className="bg-forest-950 text-cream-50 rounded-3xl p-6 sm:p-10 shadow-elevated relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 opacity-10 pointer-events-none">
          <ShieldCheck className="w-72 h-72 text-white" />
        </div>

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-900/80 border border-fresh-400/40 text-fresh-400 text-xs font-bold tracking-wide uppercase">
            <ShieldCheck className="w-4 h-4" />
            <span>Digital Provenance Certificate</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-cream-50">
            {product.name}
          </h1>

          <p className="text-xs sm:text-sm text-cream-200/90 leading-relaxed">
            Verified agricultural traceability record documenting the direct journey from {farmer.farmName} to consumer.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            {farmer.verified ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-fresh-300 bg-fresh-950/60 px-3 py-1 rounded-lg border border-fresh-500/30">
                <CheckCircle2 className="w-3.5 h-3.5 text-fresh-400" />
                <span>Verified Farmer: {farmer.farmName}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-cream-300 bg-forest-900/60 px-3 py-1 rounded-lg border border-cream-200/20">
                <span>Verification Pending: {farmer.farmName}</span>
              </span>
            )}

            {/* Expiry Pill */}
            <span
              className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-lg border ${
                isExpired
                  ? 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                  : isExpiringSoon
                  ? 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                  : 'bg-fresh-950/60 border-fresh-500/30 text-fresh-300'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{traceability.expiryMessage}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid: Left (Product + Timeline), Right (Trust Label + QR) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Product Info & Timeline */}
        <div className="lg:col-span-7 space-y-8">
          {/* Product Overview Card */}
          <div className="bg-white rounded-3xl p-6 border border-cream-200 shadow-soft flex flex-col sm:flex-row gap-5 items-start">
            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full sm:w-36 h-36 object-cover rounded-2xl border border-cream-200 shadow-xs flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-forest-700 bg-forest-50 px-2.5 py-0.5 rounded-md border border-forest-200/60">
                {product.category}
              </span>
              <h2 className="text-xl font-extrabold text-charcoal-900">
                {product.name}
              </h2>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-forest-950">₹{product.price}</span>
                <span className="text-xs text-charcoal-600 font-semibold">/ {product.unit}</span>
              </div>
              <p className="text-xs text-charcoal-600 line-clamp-2 leading-relaxed">
                {product.description}
              </p>
              <div className="pt-1 flex items-center gap-1.5 text-xs text-charcoal-700">
                <MapPin className="w-3.5 h-3.5 text-forest-700" />
                <span className="font-semibold">{farmer.farmName}</span>
                <span>•</span>
                <span>{product.location}</span>
              </div>
            </div>
          </div>

          {/* Traceability Timeline Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-soft space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-cream-200">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-forest-700">
                  Verified Journey
                </span>
                <h3 className="text-lg font-extrabold text-charcoal-900">
                  Traceability Timeline
                </h3>
              </div>
              <span className="text-xs font-semibold text-charcoal-500">
                Milestones from PostgreSQL
              </span>
            </div>

            <TraceabilityTimeline timeline={traceability.timeline} />
          </div>

          {/* Detailed Transparency Data Grid */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-soft space-y-4">
            <h3 className="text-base font-extrabold text-charcoal-900 pb-2 border-b border-cream-100">
              Transparency & Batch Records
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-cream-50/70 p-3.5 rounded-2xl border border-cream-200/80">
                <span className="text-charcoal-500 font-semibold uppercase text-[10px] block">
                  Harvest Date
                </span>
                <span className="font-bold text-charcoal-900 mt-0.5 block text-sm">
                  {transparency.harvestDateFormatted || 'Not provided'}
                </span>
              </div>

              <div className="bg-cream-50/70 p-3.5 rounded-2xl border border-cream-200/80">
                <span className="text-charcoal-500 font-semibold uppercase text-[10px] block">
                  Packing Date
                </span>
                <span className="font-bold text-charcoal-900 mt-0.5 block text-sm">
                  {transparency.packingDateFormatted || 'Not provided'}
                </span>
              </div>

              <div className="bg-cream-50/70 p-3.5 rounded-2xl border border-cream-200/80">
                <span className="text-charcoal-500 font-semibold uppercase text-[10px] block">
                  Best Before / Expiry
                </span>
                <span className="font-bold text-forest-900 mt-0.5 block text-sm">
                  {transparency.expiryDateFormatted || 'Not provided'}
                </span>
              </div>

              <div className="bg-cream-50/70 p-3.5 rounded-2xl border border-cream-200/80">
                <span className="text-charcoal-500 font-semibold uppercase text-[10px] block">
                  Batch Number
                </span>
                <span className="font-mono font-bold text-forest-950 mt-0.5 block text-sm">
                  {transparency.batchNumber || 'Not assigned'}
                </span>
              </div>
            </div>

            <div className="pt-2 text-xs space-y-2">
              <div className="flex justify-between py-1.5 border-b border-cream-200/60">
                <span className="text-charcoal-600 font-semibold">Cultivation Origin:</span>
                <span className="font-bold text-charcoal-900 text-right">{transparency.origin || product.location}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-cream-200/60">
                <span className="text-charcoal-600 font-semibold">Ingredients:</span>
                <span className="font-medium text-forest-900 text-right">{transparency.ingredients || `100% ${product.name}`}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-charcoal-600 font-semibold">Traceability Status:</span>
                <span className={`font-bold uppercase ${isExpired ? 'text-rose-600' : isComplete ? 'text-fresh-700' : 'text-amber-700'}`}>
                  {traceability.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Trust Label Seal & Printable QR Label */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          {/* Trust Label Component */}
          <TrustLabel
            product={{
              id: product.id,
              name: product.name,
              farmerName: farmer.farmName,
              verified: farmer.verified,
              harvestDate: transparency.harvestDateFormatted,
              packingDate: transparency.packingDateFormatted,
              expiryDate: transparency.expiryDateFormatted,
              origin: transparency.origin,
              ingredients: transparency.ingredients,
              batchNumber: transparency.batchNumber
            }}
            showTraceLink={false}
            showQRButton={false}
          />

          {/* QRCodeLabel with Download & Print actions */}
          <QRCodeLabel
            productId={product.id}
            productName={product.name}
            farmerName={farmer.farmName}
            batchNumber={transparency.batchNumber}
            harvestDate={transparency.harvestDateFormatted}
            packingDate={transparency.packingDateFormatted}
            expiryDate={transparency.expiryDateFormatted}
            origin={transparency.origin}
          />

          {/* Neutral Trust Disclaimer (Section 18) */}
          <div className="p-4 rounded-2xl bg-cream-100/70 border border-cream-200 text-charcoal-600 text-xs leading-relaxed text-center">
            <p className="font-semibold text-charcoal-800 mb-1">Authenticity & Neutrality Statement</p>
            <p className="text-[11px] text-charcoal-500">
              FarmDirect provides transparency using information submitted and maintained by participating farmers.
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Dedicated Single-Page A4 Product Traceability Certificate for Print / PDF */}
    <ProductTraceabilityCertificate
      productId={product.id}
      productName={product.name}
      farmerName={farmer.farmName}
      location={farmer.location || product.location}
      isVerified={farmer.verified}
      origin={transparency.origin || product.location}
      harvestDate={transparency.harvestDateFormatted}
      packingDate={transparency.packingDateFormatted}
      expiryDate={transparency.expiryDateFormatted}
      batchNumber={transparency.batchNumber}
      ingredients={transparency.ingredients}
      category={product.category}
      timeline={traceability.timeline}
      hasPurchased={traceability.timeline?.some((t) => t.stage === 'PURCHASED')}
    />
  </>
  );
}
