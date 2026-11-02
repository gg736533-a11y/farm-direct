import { Router } from 'express';
import { requireAuth, optionalAuth } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { aiRateLimiter } from '../middleware/aiRateLimiter.js';
import {
  handleSmartShoppingAgent,
  handleFarmerInsightAgent
} from '../controllers/agentController.js';

const router = Router();

// Apply AI rate limiter to all Agentic AI endpoints
router.use(aiRateLimiter);

/**
 * 1. Smart Shopping Agent
 * Natural-language shopping agent: understands goal, formulates plan, selects approved tools,
 * searches real MySQL products, checks freshness, and calculates cart combinations.
 * Accessible to authenticated consumers and shoppers.
 */
router.post('/smart-shopping', optionalAuth, handleSmartShoppingAgent);

/**
 * 2. Farmer Insight Agent
 * Scoped strictly to authenticated farmer.
 * Protected: Requires FARMER role.
 * Audits stock, identifies low inventory (<= 5), expiry risks (within 3 days),
 * and missing transparency data.
 */
router.post('/farmer-insights', requireAuth, requireRole('FARMER'), handleFarmerInsightAgent);

export default router;
