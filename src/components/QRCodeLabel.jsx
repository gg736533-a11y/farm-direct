import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { ExternalLink, Download, Printer, ShieldCheck, QrCode as QrIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * QRCodeLabel Component
 * Generates an authentic, high-resolution scannable QR code linking to the
 * public product traceability route (/trace/:productId).
 * Encodes strictly zero sensitive information.
 */
export default function QRCodeLabel({
  productId,
  productName = 'Farm Product',
  farmerName = 'FarmDirect Producer',
  batchNumber = '',
  harvestDate = '',
  packingDate = '',
  expiryDate = '',
  origin = '',
  className = '',
  compact = false,
  showActions = true
}) {
  const canvasRef = useRef(null);
  const [dataUrl, setDataUrl] = useState('');
  const [error, setError] = useState(null);

  // Compute public traceability URL dynamically
  const baseUrl =
    import.meta.env.VITE_PUBLIC_APP_URL ||
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173');

  const traceabilityUrl = productId ? `${baseUrl}/trace/${productId}` : '';

  useEffect(() => {
    if (!traceabilityUrl) return;

    // Generate high contrast scannable QR code
    QRCode.toDataURL(
      traceabilityUrl,
      {
        width: 320,
        margin: 2,
        color: {
          dark: '#0e261a', // Forest 950
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      },
      (err, url) => {
        if (err) {
          console.error('QR code generation failed:', err);
          setError('Failed to generate QR code');
          return;
        }
        setDataUrl(url);
      }
    );
  }, [traceabilityUrl]);

  // Download QR Code PNG with sanitized filename
  const handleDownload = () => {
    if (!dataUrl) return;
    const sanitizedName = productName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    const filename = `farmdirect-${sanitizedName || 'product'}-qr.png`;

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Printable Trust Label
  const handlePrint = () => {
    window.print();
  };

  if (!productId) {
    return (
      <div className={`p-4 rounded-2xl bg-cream-100/70 border border-cream-300 text-center text-xs text-charcoal-600 ${className}`}>
        <QrIcon className="w-8 h-8 text-charcoal-400 mx-auto mb-2" />
        <p className="font-semibold">QR Code unavailable</p>
        <p className="text-[11px] text-charcoal-500 mt-0.5">Product ID required for public traceability.</p>
      </div>
    );
  }

  return (
    <div
      className={`print-label-container print:hidden bg-white rounded-2xl border border-forest-600/25 p-5 shadow-soft flex flex-col items-center text-center relative overflow-hidden ${className}`}
    >
      {/* Decorative Brand Header */}
      <div className="flex items-center gap-1.5 text-forest-900 font-extrabold text-xs tracking-tight uppercase">
        <ShieldCheck className="w-4 h-4 text-fresh-600" />
        <span>FarmDirect</span>
      </div>
      <p className="text-[11px] font-semibold text-charcoal-600 mt-0.5">Trace this product</p>

      {/* Scannable QR Code Canvas / Image */}
      <div className="my-3.5 p-2.5 bg-white rounded-xl border border-forest-200 shadow-xs inline-block">
        {dataUrl ? (
          <img
            src={dataUrl}
            alt={`QR Traceability Code for ${productName}`}
            className="w-36 h-36 sm:w-40 sm:h-40 object-contain mx-auto"
          />
        ) : (
          <div className="w-36 h-36 sm:w-40 sm:h-40 bg-cream-100 flex items-center justify-center text-xs text-charcoal-400 font-mono">
            Generating QR...
          </div>
        )}
      </div>

      {/* Batch Identification */}
      <div className="w-full pt-2 border-t border-cream-200 space-y-1">
        <div className="text-[10px] uppercase font-bold text-charcoal-500 tracking-wider">
          Batch Number
        </div>
        <div className="font-mono text-xs font-bold text-forest-950 bg-cream-100/80 px-2.5 py-1 rounded-lg inline-block border border-cream-300">
          {batchNumber || 'Not assigned'}
        </div>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="mt-4 pt-3 border-t border-cream-200/80 w-full flex flex-col gap-2 print:hidden">
          <Link
            to={`/trace/${productId}`}
            className="w-full py-2 px-3 rounded-xl bg-forest-900 hover:bg-forest-800 text-cream-50 text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5"
          >
            <span>Open Traceability</span>
            <ExternalLink className="w-3.5 h-3.5 text-fresh-400" />
          </Link>

          {!compact && (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDownload}
                disabled={!dataUrl}
                className="py-1.5 px-2.5 rounded-lg border border-cream-300 hover:bg-cream-100 text-[11px] font-bold text-charcoal-800 transition-colors flex items-center justify-center gap-1"
                title="Download QR Code image"
              >
                <Download className="w-3 h-3 text-forest-700" />
                <span>Download</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="py-1.5 px-2.5 rounded-lg border border-cream-300 hover:bg-cream-100 text-[11px] font-bold text-charcoal-800 transition-colors flex items-center justify-center gap-1"
                title="Print packaging label"
              >
                <Printer className="w-3 h-3 text-forest-700" />
                <span>Print Label</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
