import * as aiService from '../services/aiService.js';
import { prisma } from '../config/db.js';
import { getCategoryMatchValues, normalizeCategory } from './productController.js';

/**
 * POST /api/ai/product-description
 * Protected: Farmer only
 */
export async function generateDescription(req, res) {
  try {
    const description = await aiService.generateProductDescription(req.body);
    return res.status(200).json({
      success: true,
      description,
      disclaimer: 'AI-generated content — review before publishing.'
    });
  } catch (error) {
    console.error('AI Description Generation error:', error.message);
    return res.status(503).json({
      success: false,
      message: 'AI service is temporarily unavailable.'
    });
  }
}

/**
 * POST /api/ai/product-summary
 * Protected: Authenticated users
 */
export async function generateSummary(req, res) {
  try {
    const summary = await aiService.generateProductSummary(req.body);
    return res.status(200).json({
      success: true,
      summary,
      disclaimer: 'AI-generated summary'
    });
  } catch (error) {
    console.error('AI Summary Generation error:', error.message);
    return res.status(503).json({
      success: false,
      message: 'AI service is temporarily unavailable.'
    });
  }
}

/**
 * POST /api/ai/translate
 * Protected: Authenticated users
 */
export async function translate(req, res) {
  try {
    const { text, targetLanguage } = req.body;
    const translatedText = await aiService.translateProductContent({ text, targetLanguage });
    return res.status(200).json({
      success: true,
      translatedText,
      targetLanguage,
      disclaimer: 'AI-generated translation — based only on original content.'
    });
  } catch (error) {
    console.error('AI Translation error:', error.message);
    return res.status(503).json({
      success: false,
      message: 'AI service is temporarily unavailable.'
    });
  }
}

/**
 * POST /api/ai/simple-english
 * Protected: Authenticated users
 */
export async function simplify(req, res) {
  try {
    const { text } = req.body;
    const simplifiedText = await aiService.generateSimpleEnglish({ text });
    return res.status(200).json({
      success: true,
      simplifiedText,
      disclaimer: 'AI-generated simple English explanation'
    });
  } catch (error) {
    console.error('AI Simplify error:', error.message);
    return res.status(503).json({
      success: false,
      message: 'AI service is temporarily unavailable.'
    });
  }
}

/**
 * POST /api/ai/smart-shopping
 * Natural language shopping assistant.
 * Interprets query into structured filters, then executes real MySQL database query.
 * The AI NEVER fabricates or invents products.
 */
export async function smartShopping(req, res) {
  try {
    const { query } = req.body;

    // 1. Interpret query into structured filters
    const interpretedFilters = await aiService.interpretShoppingQuery(query);

    // 2. Build real MySQL Prisma query based on interpreted filters
    const where = {
      status: 'ACTIVE'
    };

    if (interpretedFilters.category && interpretedFilters.category !== 'ALL') {
      const normCat = normalizeCategory(interpretedFilters.category);
      where.category = {
        in: getCategoryMatchValues(normCat)
      };
    }

    if (interpretedFilters.maxPrice !== null || interpretedFilters.minPrice !== null) {
      where.price = {};
      if (interpretedFilters.minPrice !== null) where.price.gte = interpretedFilters.minPrice;
      if (interpretedFilters.maxPrice !== null) where.price.lte = interpretedFilters.maxPrice;
    }

    if (interpretedFilters.location) {
      where.location = {
        contains: interpretedFilters.location,
        mode: 'insensitive'
      };
    }

    if (interpretedFilters.verifiedOnly) {
      where.farmer = {
        verified: true
      };
    }

    if (interpretedFilters.inStockOnly) {
      where.availableQuantity = {
        gt: 0
      };
    }

    if (interpretedFilters.search) {
      const s = interpretedFilters.search;
      where.OR = [
        { name: { contains: s, mode: 'insensitive' } },
        { description: { contains: s, mode: 'insensitive' } },
        { location: { contains: s, mode: 'insensitive' } }
      ];
    }

    // 3. Query real database
    const rawProducts = await prisma.product.findMany({
      where,
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
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    // 4. Map real products matching standard API catalog structure
    const products = rawProducts.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      description: p.description,
      price: p.price,
      unit: p.unit,
      quantity: p.quantity,
      availableQuantity: p.availableQuantity,
      image: p.imageUrl,
      imageUrl: p.imageUrl,
      location: p.location,
      origin: p.origin || p.transparency?.origin || p.location,
      status: p.status,
      harvestDate: p.harvestDate || (p.transparency?.harvestDate ? p.transparency.harvestDate.toISOString().split('T')[0] : null),
      packingDate: p.packingDate || (p.transparency?.packingDate ? p.transparency.packingDate.toISOString().split('T')[0] : null),
      expiryDate: p.expiryDate || (p.transparency?.expiryDate ? p.transparency.expiryDate.toISOString().split('T')[0] : null),
      batchNumber: p.batchNumber || p.transparency?.batchNumber,
      ingredients: p.ingredients || p.transparency?.ingredients,
      farmerId: p.farmerId,
      farmerName: p.farmer?.farmName || p.farmer?.user?.name || 'Local Farmer',
      farmer: {
        id: p.farmer?.id,
        farmName: p.farmer?.farmName,
        verified: p.farmer?.verified ?? false,
        location: p.farmer?.location
      },
      transparency: p.transparency ? {
        batchNumber: p.transparency.batchNumber,
        harvestDate: p.transparency.harvestDate,
        packingDate: p.transparency.packingDate,
        expiryDate: p.transparency.expiryDate,
        origin: p.transparency.origin,
        ingredients: p.transparency.ingredients
      } : null
    }));

    return res.status(200).json({
      success: true,
      query,
      interpretedFilters,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Smart Shopping error:', error.message);
    return res.status(503).json({
      success: false,
      message: 'AI service is temporarily unavailable.'
    });
  }
}
