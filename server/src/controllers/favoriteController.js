import { prisma } from '../config/db.js';

/**
 * GET /api/favorites
 * Protected: CONSUMER role only.
 * Returns array of favorited products and product IDs for authenticated consumer.
 */
export async function getFavorites(req, res, next) {
  try {
    const consumerProfileId = req.user.consumerProfile?.id;
    if (!consumerProfileId) {
      return res.status(400).json({
        success: false,
        message: 'Consumer profile record is missing.'
      });
    }

    const favorites = await prisma.favorite.findMany({
      where: {
        consumerId: consumerProfileId
      },
      include: {
        product: {
          include: {
            farmer: {
              select: {
                id: true,
                farmName: true,
                location: true,
                verified: true
              }
            },
            transparency: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const productIds = favorites.map((f) => f.productId);
    const products = favorites.map((f) => ({
      ...f.product,
      image: f.product.imageUrl || '',
      farmerName: f.product.farmer?.farmName || 'Verified Farm',
      verified: f.product.farmer?.verified || false,
      harvestFreshness: f.product.transparency?.harvestDate
        ? `Harvested on ${new Date(f.product.transparency.harvestDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
        : 'Farm Fresh Batch'
    }));

    return res.status(200).json({
      success: true,
      data: {
        favorites: productIds,
        products
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/favorites/:productId
 * Protected: CONSUMER role only.
 * Adds product to favorites, handling duplicates gracefully.
 */
export async function addFavorite(req, res, next) {
  try {
    const productId = req.params.productId || req.body.productId;
    const consumerProfileId = req.user.consumerProfile?.id;

    if (!consumerProfileId) {
      return res.status(400).json({
        success: false,
        message: 'Consumer profile record is missing.'
      });
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    // Upsert to guarantee idempotency and prevent duplicate error
    const favorite = await prisma.favorite.upsert({
      where: {
        consumerId_productId: {
          consumerId: consumerProfileId,
          productId
        }
      },
      create: {
        consumerId: consumerProfileId,
        productId
      },
      update: {}
    });

    return res.status(201).json({
      success: true,
      message: 'Product added to favorites.',
      data: {
        productId,
        favorite
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/favorites/:productId
 * Protected: CONSUMER role only.
 * Removes product from favorites.
 */
export async function removeFavorite(req, res, next) {
  try {
    const { productId } = req.params;
    const consumerProfileId = req.user.consumerProfile?.id;

    if (!consumerProfileId) {
      return res.status(400).json({
        success: false,
        message: 'Consumer profile record is missing.'
      });
    }

    // Delete if exists
    await prisma.favorite.deleteMany({
      where: {
        consumerId: consumerProfileId,
        productId
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Product removed from favorites.',
      data: {
        productId
      }
    });
  } catch (error) {
    next(error);
  }
}
