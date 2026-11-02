import { Router } from 'express';
import {
  createOrder,
  getConsumerOrders,
  getConsumerOrderById
} from '../controllers/orderController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { validateBody } from '../middleware/validationMiddleware.js';
import { createOrderSchema } from '../validations/schemas.js';

const router = Router();

// Consumer-only Order Routes
router.post(
  '/',
  requireAuth,
  requireRole('CONSUMER'),
  validateBody(createOrderSchema),
  createOrder
);

router.get(
  '/',
  requireAuth,
  requireRole('CONSUMER'),
  getConsumerOrders
);

router.get(
  '/:id',
  requireAuth,
  requireRole('CONSUMER'),
  getConsumerOrderById
);

export default router;
