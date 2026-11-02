import { Router } from 'express';
import { getConsumerMe } from '../controllers/userController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

// Authenticated consumer profile details
router.get('/me', requireAuth, requireRole('CONSUMER'), getConsumerMe);

export default router;
