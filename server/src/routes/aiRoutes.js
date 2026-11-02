import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { validateBody } from '../middleware/validationMiddleware.js';
import { aiRateLimiter } from '../middleware/aiRateLimiter.js';
import {
  productDescriptionSchema,
  productSummarySchema,
  translateSchema,
  simpleEnglishSchema,
  smartShoppingSchema
} from '../validations/aiSchemas.js';
import {
  generateDescription,
  generateSummary,
  translate,
  simplify,
  smartShopping
} from '../controllers/aiController.js';

const router = Router();

// Apply AI rate limiter to all AI endpoints
router.use(aiRateLimiter);

// 1. Farmer-only product description generator
router.post(
  '/product-description',
  requireAuth,
  requireRole('FARMER'),
  validateBody(productDescriptionSchema),
  generateDescription
);

// 2. Product summary generator for authenticated users
router.post(
  '/product-summary',
  requireAuth,
  validateBody(productSummarySchema),
  generateSummary
);

// 3. Translation utility for authenticated users
router.post(
  '/translate',
  requireAuth,
  validateBody(translateSchema),
  translate
);

// 4. Simple English utility for authenticated users
router.post(
  '/simple-english',
  requireAuth,
  validateBody(simpleEnglishSchema),
  simplify
);

// 5. Smart Shopping assistant (accessible to consumers/shoppers)
router.post(
  '/smart-shopping',
  validateBody(smartShoppingSchema),
  smartShopping
);

export default router;
