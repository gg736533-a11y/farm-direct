import { prisma } from '../config/db.js';

/**
 * Format a date nicely as "DD MMM YYYY" (e.g., "18 Sep 2026")
 */
function formatDate(date) {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * GET /api/traceability/:productId
 * Public: Returns verified provenance, farmer status, timeline, and batch details.
 * Strictly conceals all sensitive consumer and farmer private data.
 */
export async function getTraceabilityByProductId(req, res, next) {
  try {
    const { productId } = req.params;

    if (!productId || typeof productId !== 'string' || productId.trim() === '') {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const cleanId = productId.trim();

    // Fetch product with transparency, farmer details, and check if order items exist
    const product = await prisma.product.findUnique({
      where: { id: cleanId },
      include: {
        farmer: {
          select: {
            id: true,
            farmName: true,
            location: true,
            verified: true,
            verificationStatus: true,
            user: {
              select: {
                name: true
              }
            }
          }
        },
        transparency: true
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // If transparency record is missing
    if (!product.transparency) {
      return res.status(404).json({
        success: false,
        message: 'Traceability information not found'
      });
    }

    const transparency = product.transparency;
    const now = new Date();

    // Determine Expiry Status
    let expiryStatus = 'ACTIVE';
    let expiryMessage = 'Fresh & Active Batch';
    const expiryDate = transparency.expiryDate ? new Date(transparency.expiryDate) : null;

    if (expiryDate && !isNaN(expiryDate.getTime())) {
      const diffDays = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) {
        expiryStatus = 'EXPIRED';
        expiryMessage = `Expired on ${formatDate(expiryDate)}`;
      } else if (diffDays <= 7) {
        expiryStatus = 'EXPIRING_SOON';
        expiryMessage = `Expiring soon (valid until ${formatDate(expiryDate)})`;
      } else {
        expiryStatus = 'ACTIVE';
        expiryMessage = `Valid until ${formatDate(expiryDate)}`;
      }
    }

    // Determine overall Traceability Status: ACTIVE | INCOMPLETE | EXPIRED
    // If essential fields (harvestDate, origin, batchNumber) are missing: INCOMPLETE
    const hasCoreTransparency = Boolean(
      transparency.harvestDate &&
      transparency.origin &&
      transparency.batchNumber
    );

    let traceabilityStatus = 'ACTIVE';
    if (!hasCoreTransparency) {
      traceabilityStatus = 'INCOMPLETE';
    } else if (expiryStatus === 'EXPIRED') {
      traceabilityStatus = 'EXPIRED';
    }

    // Check if any order items exist for this product (to safely show generic purchase event)
    const orderItemsCount = await prisma.orderItem.count({
      where: { productId: product.id }
    });

    // Build timeline milestones based strictly on existing DB records
    const timeline = [];

    // Milestone 1: Farm / Origin
    timeline.push({
      stage: 'FARM',
      step: 1,
      title: 'Farm of Origin',
      location: transparency.origin || product.farmer?.location || product.location || 'Farm of Origin',
      description: `Grown and cultivated by ${product.farmer?.farmName || product.farmer?.user?.name || 'Local Farm'}`,
      date: null,
      status: 'completed'
    });

    // Milestone 2: Harvested
    timeline.push({
      stage: 'HARVESTED',
      step: 2,
      title: 'Harvested',
      location: transparency.origin || product.location || 'Local Farm',
      description: transparency.harvestDate
        ? `Harvested on ${formatDate(transparency.harvestDate)}`
        : 'Harvest date not provided',
      date: transparency.harvestDate ? formatDate(transparency.harvestDate) : null,
      status: transparency.harvestDate ? 'completed' : 'pending'
    });

    // Milestone 3: Packed
    timeline.push({
      stage: 'PACKED',
      step: 3,
      title: 'Packed',
      location: product.farmer?.farmName || 'Farm Hub',
      description: transparency.packingDate
        ? `Packed on ${formatDate(transparency.packingDate)}`
        : 'Packing date not provided',
      date: transparency.packingDate ? formatDate(transparency.packingDate) : null,
      status: transparency.packingDate ? 'completed' : 'pending'
    });

    // Milestone 4: Listed on FarmDirect
    timeline.push({
      stage: 'LISTED',
      step: 4,
      title: 'Listed on FarmDirect',
      location: 'FarmDirect Marketplace',
      description: `Listed for direct farm-to-consumer purchase`,
      date: formatDate(product.createdAt),
      status: 'completed'
    });

    // Milestone 5: Purchased (Generic, strictly no consumer data)
    if (orderItemsCount > 0) {
      timeline.push({
        stage: 'PURCHASED',
        step: 5,
        title: 'Purchased through FarmDirect',
        location: 'Verified FarmDirect Order',
        description: 'Direct farm-to-consumer order fulfilled without intermediaries',
        date: null,
        status: 'completed'
      });
    }

    // Prepare strictly sanitized response (Zero sensitive fields)
    return res.status(200).json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        category: product.category,
        unit: product.unit,
        price: product.price,
        imageUrl: product.imageUrl || '',
        location: product.location,
        description: product.description,
        createdAt: product.createdAt
      },
      farmer: {
        name: product.farmer?.user?.name || product.farmer?.farmName || 'Verified Farm',
        farmName: product.farmer?.farmName || 'Verified Farm',
        location: product.farmer?.location || product.location,
        verified: Boolean(product.farmer?.verified)
      },
      transparency: {
        harvestDate: transparency.harvestDate ? transparency.harvestDate.toISOString().split('T')[0] : null,
        packingDate: transparency.packingDate ? transparency.packingDate.toISOString().split('T')[0] : null,
        expiryDate: transparency.expiryDate ? transparency.expiryDate.toISOString().split('T')[0] : null,
        harvestDateFormatted: formatDate(transparency.harvestDate),
        packingDateFormatted: formatDate(transparency.packingDate),
        expiryDateFormatted: formatDate(transparency.expiryDate),
        ingredients: transparency.ingredients || null,
        origin: transparency.origin || null,
        batchNumber: transparency.batchNumber || null
      },
      traceability: {
        status: traceabilityStatus,
        expiryStatus,
        expiryMessage,
        isComplete: hasCoreTransparency,
        timeline
      }
    });
  } catch (error) {
    // Never expose stack trace to public client
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve product traceability information.'
    });
  }
}
