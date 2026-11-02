import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, QrCode, ExternalLink, Sparkles, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import QRCodeLabel from './QRCodeLabel';

/**
 * TrustLabel Component
 * Displays verified provenance claims with checkmarks ONLY for fields that actually exist
 * in the database. Clearly identifies incomplete transparency when fields are missing.
 */
export default function TrustLabel({
  product = {},
  className = '',
  showQRButton = true,
  showTraceLink = true
}) {
  const [showQRModal, setShowQRModal] = useState(false);

  // Extract real values safely
  const productId = product.id || product.productId || '';
  const productName = product.name || 'Produce Item';
  const farmerName = product.farmer?.farmName || product.farmerName || 'Verified Farm';
  const isFarmerVerified = Boolean(product.farmer?.verified ?? product.verified);

  // Transparency fields
  const origin = product.transparency?.origin || product.origin || null;
  const harvestDate = product.transparency?.harvestDateFormatted || product.harvestDate || null;
  const packingDate = product.transparency?.packingDateFormatted || product.packingDate || null;
  const expiryDate = product.transparency?.expiryDateFormatted || product.expiryDate || null;
  const batchNumber = product.transparency?.batchNumber || product.batchNumber || null;
  const ingredients = product.transparency?.ingredients || product.ingredients || null;

  // Determine completeness
  const isComplete = Boolean(
    isFarmerVerified &&
    origin &&
    harvestDate &&
    packingDate &&
    batchNumber
  );

  return (
    <>
      <div className={`relative max-w-md w-full mx-auto bg-white rounded-3xl border-2 border-dashed border-forest-600/35 p-6 shadow-elevated overflow-hidden ${className}`}>
        {/* Top Header Badge */}
        <div className="flex items-center justify-between pb-4 border-b border-forest-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-forest-900 flex items-center justify-center text-cream-50 shadow-xs">
              <ShieldCheck className="w-5 h-5 text-fresh-400" />
            </div>
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-widest text-forest-700">
                Digital Provenance Seal
              </span>
              <h4 className="text-base font-extrabold tracking-tight text-forest-950">
                FARMDIRECT TRUST LABEL
              </h4>
            </div>
          </div>
          <div
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase border ${
              isComplete
                ? 'bg-fresh-50 border-fresh-200 text-fresh-700'
                : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}
          >
            {isComplete ? 'VERIFIED' : 'PARTIAL'}
          </div>
        </div>

        {/* Incomplete Transparency Alert Banner */}
        {!isComplete && (
          <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Transparency information incomplete</p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                This product does not currently have all traceability fields provided.
              </p>
            </div>
          </div>
        )}

        {/* Verification Checkmarks List (Section 5) */}
        <div className="mt-5 space-y-2.5 text-xs bg-cream-50/70 p-4 rounded-2xl border border-cream-200/80">
          {/* Farmer Verification */}
          <div className="flex items-center justify-between py-1 border-b border-cream-200/60">
            <span className="text-charcoal-700 font-medium">Farmer Verification</span>
            {isFarmerVerified ? (
              <span className="inline-flex items-center gap-1 font-bold text-fresh-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-fresh-600" />
                <span>Verified Farmer</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-semibold text-charcoal-500">
                <span>Verification Pending</span>
              </span>
            )}
          </div>

          {/* Origin */}
          <div className="flex items-center justify-between py-1 border-b border-cream-200/60">
            <span className="text-charcoal-700 font-medium">Origin</span>
            {origin ? (
              <span className="inline-flex items-center gap-1 font-bold text-fresh-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-fresh-600" />
                <span className="max-w-[170px] truncate text-right">{origin}</span>
              </span>
            ) : (
              <span className="text-charcoal-500 italic">Origin: Not provided</span>
            )}
          </div>

          {/* Harvest Date */}
          <div className="flex items-center justify-between py-1 border-b border-cream-200/60">
            <span className="text-charcoal-700 font-medium">Harvest Date</span>
            {harvestDate ? (
              <span className="inline-flex items-center gap-1 font-bold text-fresh-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-fresh-600" />
                <span>{harvestDate}</span>
              </span>
            ) : (
              <span className="text-charcoal-500 italic">Harvest Date: Not provided</span>
            )}
          </div>

          {/* Packing Date */}
          <div className="flex items-center justify-between py-1 border-b border-cream-200/60">
            <span className="text-charcoal-700 font-medium">Packing Date</span>
            {packingDate ? (
              <span className="inline-flex items-center gap-1 font-bold text-fresh-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-fresh-600" />
                <span>{packingDate}</span>
              </span>
            ) : (
              <span className="text-charcoal-500 italic">Packing Date: Not provided</span>
            )}
          </div>

          {/* Expiry Date */}
          <div className="flex items-center justify-between py-1 border-b border-cream-200/60">
            <span className="text-charcoal-700 font-medium">Expiry / Best Before</span>
            {expiryDate ? (
              <span className="inline-flex items-center gap-1 font-bold text-fresh-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-fresh-600" />
                <span>{expiryDate}</span>
              </span>
            ) : (
              <span className="text-charcoal-500 italic">Expiry Date: Not provided</span>
            )}
          </div>

          {/* Batch Number */}
          <div className="flex items-center justify-between py-1">
            <span className="text-charcoal-700 font-medium">Batch Number</span>
            {batchNumber ? (
              <span className="inline-flex items-center gap-1 font-bold text-forest-950 font-mono text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-fresh-600" />
                <span>{batchNumber}</span>
              </span>
            ) : (
              <span className="text-charcoal-500 italic">Batch Number: Not provided</span>
            )}
          </div>
        </div>

        {/* Detailed Metadata Grid */}
        <div className="mt-4 space-y-2 text-xs">
          <div className="flex justify-between items-baseline py-1 border-b border-cream-200/60">
            <span className="text-charcoal-500 font-medium text-[11px] uppercase">Farmer</span>
            <span className="font-bold text-charcoal-900">{farmerName}</span>
          </div>

          {ingredients && (
            <div className="flex justify-between items-baseline py-1 border-b border-cream-200/60">
              <span className="text-charcoal-500 font-medium text-[11px] uppercase">Ingredients</span>
              <span className="font-medium text-forest-900 text-right max-w-[200px] truncate">{ingredients}</span>
            </div>
          )}
        </div>

        {/* Bottom Interactive Actions (Section 5) */}
        {(showTraceLink || showQRButton) && (
          <div className="mt-5 pt-4 border-t border-forest-100 flex items-center justify-between gap-3">
            {showTraceLink && productId && (
              <Link
                to={`/trace/${productId}`}
                className="flex-1 py-2.5 px-3 rounded-xl bg-forest-900 hover:bg-forest-800 text-cream-50 text-xs font-bold transition-colors shadow-xs text-center flex items-center justify-center gap-1.5"
              >
                <span>View Traceability</span>
                <ExternalLink className="w-3 h-3 text-fresh-400" />
              </Link>
            )}

            {showQRButton && productId && (
              <button
                type="button"
                onClick={() => setShowQRModal(true)}
                className="py-2.5 px-3 rounded-xl border border-forest-300 hover:bg-cream-100 text-xs font-bold text-forest-950 transition-colors flex items-center justify-center gap-1.5"
                title="Scan or View QR Code"
              >
                <QrCode className="w-4 h-4 text-forest-700" />
                <span>Scan / View QR</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {showQRModal && productId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/60 backdrop-blur-xs animate-fade-in">
          <div
            className="relative w-full max-w-sm bg-white rounded-3xl shadow-elevated border border-cream-200 p-6 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-charcoal-400 hover:text-charcoal-700 hover:bg-cream-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <QRCodeLabel
              productId={productId}
              productName={productName}
              farmerName={farmerName}
              batchNumber={batchNumber}
              harvestDate={harvestDate}
              packingDate={packingDate}
              expiryDate={expiryDate}
              origin={origin}
            />
          </div>
        </div>
      )}
    </>
  );
}
