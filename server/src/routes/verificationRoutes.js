import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { aiRateLimiter } from '../middleware/aiRateLimiter.js';
import {
  handleAnalyzeProduct,
  handleGetProductAnalysis,
  handleAnalyzeFarmer
} from '../controllers/verificationController.js';

const router = Router();

// Apply AI rate limiter to all verification endpoints
router.use(aiRateLimiter);

/**
 * 1. Analyze single product
 * Requires authentication. Farmers can only analyze their own products.
 */
router.post('/analyze-product/:productId', requireAuth, handleAnalyzeProduct);

/**
 * 2. Get single product analysis
 * Read-only, freshly calculated analysis.
 */
router.get('/product/:productId', requireAuth, handleGetProductAnalysis);

/**
 * 3. Analyze all products for the authenticated farmer
 * Strictly uses authenticated farmer identity from JWT.
 */
router.post('/analyze-farmer', requireAuth, requireRole('FARMER'), handleAnalyzeFarmer);

export default router;
