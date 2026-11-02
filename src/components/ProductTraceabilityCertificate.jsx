import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

/**
 * ProductTraceabilityCertificate
 * A dedicated, single-page A4 print certificate conforming to agricultural provenance standards.
 * Rendered strictly during @media print. Completely hidden during normal web browsing.
 * Encodes strictly zero sensitive data into the QR code.
 */
export default function ProductTraceabilityCertificate({
  productId,
  productName = 'Farm Product',
  farmerName = 'FarmDirect Producer',
  location = 'Salem, Tamil Nadu',
  isVerified = true,
  origin = '',
  harvestDate = '',
  packingDate = '',
  expiryDate = '',
  batchNumber = '',
  ingredients = '',
  category = '',
  timeline = null,
  hasPurchased = false
}) {
  const [qrDataUrl, setQrDataUrl] = useState('');

  // Compute public traceability URL dynamically
  const baseUrl =
    import.meta.env.VITE_PUBLIC_APP_URL ||
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173');

  const traceabilityUrl = productId ? `${baseUrl}/trace/${productId}` : '';

  useEffect(() => {
    if (!traceabilityUrl) return;

    QRCode.toDataURL(
      traceabilityUrl,
      {
        width: 480, // High resolution for 300dpi print
        margin: 1,
        color: {
          dark: '#0f172a', // Clean dark slate
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      },
      (err, url) => {
        if (!err && url) {
          setQrDataUrl(url);
        }
      }
    );
  }, [traceabilityUrl]);

  // Determine timeline steps
  let steps = [];
  if (timeline && Array.isArray(timeline) && timeline.length > 0) {
    steps = timeline;
  } else {
    steps = [
      {
        stage: 'FARM',
        title: 'Farm Origin',
        subtitle: origin || location || farmerName,
        completed: true
      },
      {
        stage: 'HARVESTED',
        title: 'Harvested',
        subtitle: harvestDate || 'Not provided',
        completed: Boolean(harvestDate && harvestDate !== 'Not provided')
      },
      {
        stage: 'PACKED',
        title: 'Packed',
        subtitle: packingDate || 'Not provided',
        completed: Boolean(packingDate && packingDate !== 'Not provided')
      },
      {
        stage: 'LISTED',
        title: 'Listed on FarmDirect',
        subtitle: 'Marketplace Active',
        completed: true
      }
    ];

    if (hasPurchased) {
      steps.push({
        stage: 'PURCHASED',
        title: 'Purchased',
        subtitle: 'Verified Order',
        completed: true
      });
    }
  }

  const certificateId = productId
    ? `FD-CERT-${productId.slice(-8).toUpperCase()}`
    : 'FD-CERT-UNASSIGNED';

  return (
    <aside
      aria-label="Printable Product Traceability Certificate"
      className="farmdirect-print-certificate hidden print:block"
    >
      <div className="cert-card">
        {/* Certificate Outer Double Border Wrapper */}
        <div className="cert-border-inner">
          {/* HEADER */}
          <header className="cert-header">
            <div className="cert-brand-row">
              <div className="cert-logo-box">
                <span className="cert-brand-title">FARMDIRECT</span>
                <span className="cert-brand-tagline">
                  PRODUCT TRACEABILITY
                </span>
              </div>
              <div className="cert-id-badge">
                <span className="cert-id-label">CERTIFICATE ID</span>
                <span className="cert-id-val">{certificateId}</span>
              </div>
            </div>
            <div className="cert-rule-primary" />
          </header>

          {/* PRODUCT INFORMATION BANNER */}
          <section className="cert-product-banner">
            <div className="cert-product-main">
              <div className="cert-product-meta">
                {category && (
                  <span className="cert-category-badge">{category}</span>
                )}
                <span className="cert-provenance-status">
                  {isVerified ? '✓ Verified Origin' : 'Origin Stated'}
                </span>
              </div>
              <h1 className="cert-product-name">{productName}</h1>
              <div className="cert-farmer-meta">
                <span className="cert-farmer-name">
                  <strong>Producer:</strong> {farmerName}
                </span>
                <span className="cert-dot">•</span>
                <span className="cert-location">
                  <strong>Location:</strong> {location || origin || 'Salem, Tamil Nadu'}
                </span>
              </div>
            </div>
          </section>

          {/* MAIN SECTION: 40% QR CODE (LEFT) + 60% PROVENANCE ATTRIBUTES (RIGHT) */}
          <section className="cert-main-grid">
            {/* LEFT: Large Scannable QR Code */}
            <div className="cert-qr-column">
              <div className="cert-qr-frame">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`QR Code for ${productName}`}
                    className="cert-qr-image"
                  />
                ) : (
                  <div className="cert-qr-placeholder">Generating QR...</div>
                )}
              </div>
              <div className="cert-qr-caption">
                <span className="cert-qr-action">SCAN WITH PHONE CAMERA</span>
                <span className="cert-qr-sub">TO VIEW DIGITAL PROVENANCE</span>
                <span className="cert-qr-url">
                  {traceabilityUrl
                    ? traceabilityUrl.replace(/^https?:\/\//, '')
                    : 'farmdirect.in/trace'}
                </span>
              </div>
            </div>

            {/* RIGHT: Aligned Provenance & Quality Attributes */}
            <div className="cert-info-column">
              <div className="cert-table-header">
                <span>VERIFIED BATCH SPECIFICATIONS</span>
              </div>

              <div className="cert-attr-table">
                {/* Farmer Verification */}
                <div className="cert-attr-row">
                  <span className="cert-attr-label">Farmer Status</span>
                  <span className="cert-attr-value font-bold">
                    {isVerified ? (
                      <span className="text-forest">✓ Verified Farmer</span>
                    ) : (
                      <span className="text-muted">Verification Pending</span>
                    )}
                  </span>
                </div>

                {/* Origin */}
                <div className="cert-attr-row">
                  <span className="cert-attr-label">Origin / Farm</span>
                  <span className="cert-attr-value">
                    {origin || location || 'Not provided'}
                  </span>
                </div>

                {/* Harvest Date */}
                <div className="cert-attr-row">
                  <span className="cert-attr-label">Harvest Date</span>
                  <span className="cert-attr-value">
                    {harvestDate || 'Not provided'}
                  </span>
                </div>

                {/* Packing Date */}
                <div className="cert-attr-row">
                  <span className="cert-attr-label">Packing Date</span>
                  <span className="cert-attr-value">
                    {packingDate || 'Not provided'}
                  </span>
                </div>

                {/* Expiry / Best Before */}
                <div className="cert-attr-row">
                  <span className="cert-attr-label">Best Before</span>
                  <span className="cert-attr-value">
                    {expiryDate || 'Not provided'}
                  </span>
                </div>

                {/* Batch Number */}
                <div className="cert-attr-row">
                  <span className="cert-attr-label">Batch Number</span>
                  <span className="cert-attr-value cert-batch-val">
                    {batchNumber || 'Not provided'}
                  </span>
                </div>

                {/* Ingredients */}
                <div className="cert-attr-row cert-attr-row-last">
                  <span className="cert-attr-label">Ingredients</span>
                  <span className="cert-attr-value">
                    {ingredients || 'Not provided'}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* TRACEABILITY TIMELINE SECTION */}
          <section className="cert-timeline-section">
            <div className="cert-timeline-header">
              <span className="cert-timeline-title">TRACEABILITY MILESTONES</span>
              <span className="cert-timeline-sub">SUPPLY CHAIN VERIFICATION</span>
            </div>

            <div className="cert-timeline-flow">
              {steps.map((item, idx) => {
                const stageName = item.stage || `STEP ${idx + 1}`;
                const title = item.title || stageName;
                const desc = item.subtitle || item.description || item.date || item.location || '';
                const isCompleted = item.status === 'completed' || item.completed !== false;

                return (
                  <React.Fragment key={idx}>
                    <div className="cert-timeline-node">
                      <div className={`cert-node-icon ${isCompleted ? 'cert-node-icon-done' : ''}`}>
                        <span>{idx + 1}</span>
                      </div>
                      <div className="cert-node-content">
                        <span className="cert-node-stage">{stageName}</span>
                        <span className="cert-node-title">{title}</span>
                        {desc && desc !== 'Not provided' && (
                          <span className="cert-node-desc">{desc}</span>
                        )}
                      </div>
                    </div>
                    {idx < steps.length - 1 && (
                      <div className="cert-timeline-arrow">→</div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </section>

          {/* FOOTER */}
          <footer className="cert-footer">
            <div className="cert-rule-secondary" />
            <div className="cert-footer-content">
              <div className="cert-footer-left">
                <p className="cert-footer-main-text">
                  Scan QR to view complete product traceability
                </p>
                <p className="cert-footer-disclaimer">
                  FarmDirect provides transparent provenance using verified data submitted by participating farmers.
                </p>
              </div>
              <div className="cert-footer-right">
                <span className="cert-seal-text">FarmDirect</span>
                <span className="cert-seal-sub">PRODUCT TRACEABILITY</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </aside>
  );
}
