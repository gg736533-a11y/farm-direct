import { prisma } from '../config/db.js';
import { analyzeProduct, analyzeFarmer } from '../services/anomalyDetectionService.js';
import { productIdParamSchema } from '../validations/verificationSchemas.js';

/**
 * Sanitizes product details for safe public/farmer output without exposing private fields.
 */
function sanitizeProduct(product) {
  if (!product) return null;
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    price: product.price,
    unit: product.unit,
    quantity: product.quantity,
    availableQuantity: product.availableQuantity,
    status: product.status,
    imageUrl: product.imageUrl,
    location: product.location,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt
  };
}

/**
 * POST /api/verification/analyze-product/:productId
 * Analyzes a single product owned by the authenticated farmer.
 */
export async function handleAnalyzeProduct(req, res, next) {
  try {
    // 1. Role enforcement: Consumer cannot access farmer product analysis
    if (req.user?.role !== 'FARMER') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Access restricted to authorized farmers only.'
      });
    }

    // 2. Validate product ID parameter
    const paramResult = productIdParamSchema.safeParse(req.params);
    if (!paramResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID parameter.',
        errors: paramResult.error.format()
      });
    }

    const { productId } = paramResult.data;

    // 3. Fetch product with transparency and farmer profile from MySQL
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        transparency: true,
        farmer: true
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    // 4. Ownership verification: Farmer can analyze ONLY their own products
    if (product.farmer.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only analyze your own products.'
      });
    }

    // 5. Fetch comparable products from DB for real market comparison
    const comparableProducts = await prisma.product.findMany({
      where: {
        category: product.category,
        status: 'ACTIVE',
        id: { not: product.id }
      },
      select: {
        id: true,
        category: true,
        price: true,
        unit: true,
        status: true
      }
    });

    // 6. Run safe, read-only anomaly analysis
    const analysis = await analyzeProduct(product, {
      farmerProfile: product.farmer,
      comparableProducts
    });

    return res.status(200).json({
      success: true,
      product: sanitizeProduct(product),
      riskLevel: analysis.riskLevel,
      flags: analysis.flags,
      summary: analysis.summary,
      recommendations: analysis.recommendations,
      checkedAt: analysis.checkedAt
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/verification/product/:productId
 * Read-only endpoint to get freshly calculated analysis for a product.
 */
export async function handleGetProductAnalysis(req, res, next) {
  return handleAnalyzeProduct(req, res, next);
}

/**
 * POST /api/verification/analyze-farmer
 * Farmer-only portfolio analysis endpoint.
 * Strictly uses authenticated farmer identity from JWT session.
 */
export async function handleAnalyzeFarmer(req, res, next) {
  try {
    // 1. Role enforcement
    if (req.user?.role !== 'FARMER') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Access restricted to authorized farmers only.'
      });
    }

    // 2. Identity extracted directly from server-side JWT session
    const farmerId = req.user.farmerProfile?.id;
    if (!farmerId) {
      return res.status(400).json({
        success: false,
        message: 'Farmer profile record not found for authenticated user.'
      });
    }

    // 3. Run portfolio anomaly analysis
    const result = await analyzeFarmer(farmerId);

    return res.status(200).json({
      success: true,
      riskLevel: result.riskLevel,
      totalProducts: result.totalProducts,
      productsRequiringReview: result.productsRequiringReview,
      totalFlags: result.totalFlags,
      highSeverity: result.highSeverity,
      mediumSeverity: result.mediumSeverity,
      lowSeverity: result.lowSeverity,
      flags: result.flags,
      summary: result.summary,
      recommendations: result.recommendations
    });
  } catch (error) {
    next(error);
  }
}
