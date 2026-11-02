import React from 'react';
import TrustLabel from '../TrustLabel';

/**
 * TrustLabelPreview Component
 * Used in Farmer Product Add and Edit pages to provide real-time feedback
 * on how the customer Trust Label seal will appear based on current form inputs.
 */
export default function TrustLabelPreview({ product = {} }) {
  return (
    <TrustLabel
      product={{
        id: product.id || '',
        name: product.name || 'Produce Item',
        farmerName: product.farmerName || 'Verified Farm',
        verified: product.verified ?? true,
        harvestDate: product.harvestDate || null,
        packingDate: product.packingDate || null,
        expiryDate: product.expiryDate || null,
        origin: product.origin || null,
        ingredients: product.ingredients || null,
        batchNumber: product.batchNumber || null
      }}
      showTraceLink={Boolean(product.id)}
      showQRButton={Boolean(product.id)}
      className="shadow-soft border-forest-600/30"
    />
  );
}
