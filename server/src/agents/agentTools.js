import { prisma } from '../config/db.js';
import { normalizeCategory, getCategoryMatchValues } from '../controllers/productController.js';

/**
 * FARMDIRECT SESSION 9: APPROVED READ-ONLY AGENT TOOLS
 * 
 * Strict allowlist of read-only tools.
 * No arbitrary SQL. No arbitrary HTTP requests.
 * No arbitrary code execution. No filesystem or shell access.
 * All data sourced directly from MySQL via Prisma ORM.
 */

export const APPROVED_TOOLS = [
  'searchProducts',
  'getProductDetails',
  'getFarmerDetails',
  'getFarmerProducts',
  'getProductAvailability',
  'getProductFreshness',
  'calculateCartTotal'
];

/**
 * TOOL 1: searchProducts
 * Queries real MySQL product data with structured filters.
 */
export async function searchProducts(args = {}) {
  const {
    category = null,
    maxPrice = null,
    minPrice = null,
    availableOnly = true,
    verifiedFarmersOnly = false,
    location = null,
    search = null,
    limit = 10
  } = args;

  const where = {
    status: 'ACTIVE'
  };

  if (availableOnly) {
    where.availableQuantity = { gt: 0 };
  }

  if (category && category !== 'ALL') {
    const normCat = normalizeCategory(category);
    where.category = {
      in: getCategoryMatchValues(normCat)
    };
  }

  if (minPrice !== null || maxPrice !== null) {
    where.price = {};
    if (minPrice !== null && !isNaN(Number(minPrice))) {
      where.price.gte = Number(minPrice);
    }
    if (maxPrice !== null && !isNaN(Number(maxPrice))) {
      where.price.lte = Number(maxPrice);
    }
  }

  if (location && typeof location === 'string' && location.trim()) {
    where.location = {
      contains: location.trim(),
      mode: 'insensitive'
    };
  }

  if (verifiedFarmersOnly) {
    where.farmer = {
      verified: true
    };
  }

  if (search && typeof search === 'string' && search.trim()) {
    const s = search.trim();
    where.OR = [
      { name: { contains: s, mode: 'insensitive' } },
      { description: { contains: s, mode: 'insensitive' } },
      { location: { contains: s, mode: 'insensitive' } }
    ];
  }

  const safeLimit = Math.min(Math.max(1, Number(limit) || 10), 20);

  const rawProducts = await prisma.product.findMany({
    where,
    include: {
      farmer: {
        select: {
          id: true,
          farmName: true,
          verified: true,
          location: true,
          user: {
            select: { name: true }
          }
        }
      },
      transparency: true
    },
    orderBy: { createdAt: 'desc' },
    take: safeLimit
  });

  return rawProducts.map((p) => ({
    productId: p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    unit: p.unit,
    availableQuantity: p.availableQuantity,
    location: p.location,
    farmerId: p.farmerId,
    farmerName: p.farmer?.farmName || p.farmer?.user?.name || 'Local Farmer',
    verified: Boolean(p.farmer?.verified),
    harvestDate: p.transparency?.harvestDate
      ? p.transparency.harvestDate.toISOString().split('T')[0]
      : (p.harvestDate ? p.harvestDate.toISOString().split('T')[0] : 'Not provided'),
    expiryDate: p.transparency?.expiryDate
      ? p.transparency.expiryDate.toISOString().split('T')[0]
      : (p.expiryDate ? p.expiryDate.toISOString().split('T')[0] : 'Not provided')
  }));
}

/**
 * TOOL 2: getProductDetails
 * Returns only approved public product information.
 * Explicitly excludes passwordHash, email, phone, JWT, private consumer data, delivery address.
 */
export async function getProductDetails(args = {}) {
  const { productId } = args;
  if (!productId || typeof productId !== 'string') {
    throw new Error('Valid productId is required.');
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      farmer: {
        select: {
          id: true,
          farmName: true,
          location: true,
          verified: true,
          verificationStatus: true,
          user: {
            select: { name: true }
          }
        }
      },
      transparency: true
    }
  });

  if (!product) {
    return null;
  }

  return {
    productId: product.id,
    name: product.name,
    category: product.category,
    description: product.description,
    price: product.price,
    unit: product.unit,
    availableQuantity: product.availableQuantity,
    availability: product.availableQuantity > 0 ? 'In Stock' : 'Out of Stock',
    status: product.status,
    location: product.location,
    farmer: {
      id: product.farmer?.id,
      farmName: product.farmer?.farmName || product.farmer?.user?.name || 'Local Farm',
      location: product.farmer?.location,
      verified: Boolean(product.farmer?.verified)
    },
    verificationStatus: product.farmer?.verificationStatus || 'PENDING',
    transparency: product.transparency ? {
      harvestDate: product.transparency.harvestDate ? product.transparency.harvestDate.toISOString().split('T')[0] : 'Not provided',
      packingDate: product.transparency.packingDate ? product.transparency.packingDate.toISOString().split('T')[0] : 'Not provided',
      expiryDate: product.transparency.expiryDate ? product.transparency.expiryDate.toISOString().split('T')[0] : 'Not provided',
      origin: product.transparency.origin || 'Not provided',
      batchNumber: product.transparency.batchNumber || 'Not provided',
      ingredients: product.transparency.ingredients || 'Not provided'
    } : null
  };
}

/**
 * TOOL 3: getFarmerDetails
 * Returns approved public farmer information only.
 * Excludes email, phone, passwordHash, and private credentials.
 */
export async function getFarmerDetails(args = {}) {
  const { farmerId } = args;
  if (!farmerId || typeof farmerId !== 'string') {
    throw new Error('Valid farmerId is required.');
  }

  const farmer = await prisma.farmerProfile.findUnique({
    where: { id: farmerId },
    include: {
      user: {
        select: { name: true }
      }
    }
  });

  if (!farmer) {
    return null;
  }

  return {
    farmerId: farmer.id,
    farmerName: farmer.user?.name || farmer.farmName,
    farmName: farmer.farmName,
    location: farmer.location,
    verificationStatus: farmer.verificationStatus,
    verified: Boolean(farmer.verified),
    description: farmer.description || 'No description provided.',
    farmAcreage: farmer.farmAcreage || null
  };
}

/**
 * TOOL 4: getFarmerProducts
 * Returns the farmer's active public products from database.
 */
export async function getFarmerProducts(args = {}, context = {}) {
  const { farmerId } = args;
  if (!farmerId || typeof farmerId !== 'string') {
    throw new Error('Valid farmerId is required.');
  }

  // If in farmer context, enforce that farmer can only inspect their own products
  if (context?.farmerId && context.farmerId !== farmerId) {
    throw new Error('Unauthorized: Farmers may only inspect their own products.');
  }

  const products = await prisma.product.findMany({
    where: { farmerId },
    include: {
      transparency: true
    },
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  return products.map((p) => ({
    productId: p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    unit: p.unit,
    quantity: p.quantity,
    availableQuantity: p.availableQuantity,
    status: p.status,
    location: p.location,
    harvestDate: p.transparency?.harvestDate
      ? p.transparency.harvestDate.toISOString().split('T')[0]
      : 'Not provided',
    packingDate: p.transparency?.packingDate
      ? p.transparency.packingDate.toISOString().split('T')[0]
      : 'Not provided',
    expiryDate: p.transparency?.expiryDate
      ? p.transparency.expiryDate.toISOString().split('T')[0]
      : 'Not provided'
  }));
}

/**
 * TOOL 5: getProductAvailability
 * Always comes directly from MySQL product records.
 */
export async function getProductAvailability(args = {}) {
  const { productId } = args;
  if (!productId || typeof productId !== 'string') {
    throw new Error('Valid productId is required.');
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      availableQuantity: true,
      status: true
    }
  });

  if (!product) {
    return {
      productId,
      availableQuantity: 0,
      status: 'NOT_FOUND',
      available: false
    };
  }

  return {
    productId: product.id,
    availableQuantity: product.availableQuantity,
    status: product.status,
    available: product.status === 'ACTIVE' && product.availableQuantity > 0
  };
}

/**
 * TOOL 6: getProductFreshness
 * Sourced strictly from actual harvest, packing, and expiry dates.
 * Never invents freshness info. If dates are missing, returns 'Not provided'.
 */
export async function getProductFreshness(args = {}) {
  const { productId } = args;
  if (!productId || typeof productId !== 'string') {
    throw new Error('Valid productId is required.');
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      transparency: true
    }
  });

  if (!product) {
    return null;
  }

  const harvestDate = product.transparency?.harvestDate
    ? product.transparency.harvestDate.toISOString().split('T')[0]
    : 'Not provided';

  const packingDate = product.transparency?.packingDate
    ? product.transparency.packingDate.toISOString().split('T')[0]
    : 'Not provided';

  const expiryDate = product.transparency?.expiryDate
    ? product.transparency.expiryDate.toISOString().split('T')[0]
    : 'Not provided';

  // Deterministic freshness evaluation
  let freshnessNotes = 'Dates not provided by farmer.';
  if (product.transparency?.expiryDate) {
    const today = new Date();
    const expiry = new Date(product.transparency.expiryDate);
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      freshnessNotes = `Product expired ${Math.abs(diffDays)} day(s) ago.`;
    } else if (diffDays <= 3) {
      freshnessNotes = `Expiry alert: Only ${diffDays} day(s) remaining before expiry.`;
    } else {
      freshnessNotes = `Valid for ${diffDays} more day(s) until expiry.`;
    }
  } else if (harvestDate !== 'Not provided') {
    freshnessNotes = `Harvested on ${harvestDate}. Expiry date not provided.`;
  }

  return {
    productId: product.id,
    name: product.name,
    harvestDate,
    packingDate,
    expiryDate,
    freshnessNotes
  };
}

/**
 * TOOL 7: calculateCartTotal
 * Calculates subtotal, delivery fee, and grand total strictly using MySQL prices.
 * Calculation ONLY. Does NOT create an order. Does NOT modify stock or prices.
 */
export async function calculateCartTotal(args = {}) {
  const { items } = args;

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Items must be a non-empty array of { productId, quantity }.');
  }

  const productIds = items.map((i) => {
    if (!i.productId || typeof i.productId !== 'string') {
      throw new Error('Each item must contain a valid string productId.');
    }
    const q = Number(i.quantity);
    if (isNaN(q) || q <= 0) {
      throw new Error(`Invalid quantity for productId ${i.productId}: must be a positive number.`);
    }
    return i.productId;
  });

  const dbProducts = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      name: true,
      price: true,
      unit: true,
      availableQuantity: true,
      status: true
    }
  });

  const productMap = new Map(dbProducts.map((p) => [p.id, p]));
  let subtotal = 0;
  const itemTotals = [];

  for (const item of items) {
    const p = productMap.get(item.productId);
    if (!p) {
      throw new Error(`Product not found: ${item.productId}`);
    }

    const qty = parseInt(item.quantity, 10);
    const itemTotal = Number((p.price * qty).toFixed(2));
    subtotal += itemTotal;

    itemTotals.push({
      productId: p.id,
      name: p.name,
      unit: p.unit,
      unitPrice: p.price,
      quantity: qty,
      itemTotal,
      inStock: p.status === 'ACTIVE' && p.availableQuantity >= qty
    });
  }

  subtotal = Number(subtotal.toFixed(2));
  // FarmDirect standard checkout rule: ₹40 standard delivery fee when cart has items
  const deliveryFee = subtotal > 0 ? 40 : 0;
  const grandTotal = Number((subtotal + deliveryFee).toFixed(2));

  return {
    itemTotals,
    subtotal,
    deliveryFee,
    grandTotal,
    calculationOnly: true
  };
}

/**
 * TOOL REGISTRY MAP
 */
const TOOL_MAP = {
  searchProducts,
  getProductDetails,
  getFarmerDetails,
  getFarmerProducts,
  getProductAvailability,
  getProductFreshness,
  calculateCartTotal
};

/**
 * Safe tool executor with allowlist enforcement and argument validation
 */
export async function executeTool(toolName, args = {}, context = {}) {
  if (!APPROVED_TOOLS.includes(toolName) || typeof TOOL_MAP[toolName] !== 'function') {
    throw new Error(`Unknown or unauthorized tool: "${toolName}". Tool execution rejected.`);
  }

  // Execute tool within safety wrapper
  const result = await TOOL_MAP[toolName](args, context);

  // Sanitize result to ensure no private credentials leak
  return sanitizeToolResult(result);
}

/**
 * Strips any sensitive authentication or consumer personal data from tool outputs
 */
function sanitizeToolResult(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitizeToolResult);
  }

  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    if (
      lowerKey.includes('password') ||
      lowerKey.includes('jwt') ||
      lowerKey.includes('secret') ||
      lowerKey.includes('hash') ||
      lowerKey === 'email' ||
      lowerKey === 'phone' ||
      lowerKey === 'deliveryaddress'
    ) {
      continue;
    }
    cleaned[key] = sanitizeToolResult(value);
  }
  return cleaned;
}
