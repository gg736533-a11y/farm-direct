import { Router } from 'express';
import {
  getPublicFarmers,
  getFarmerById,
  getMyFarmerProfile,
  getMyFarmerProducts,
  getMyFarmerOrders,
  getMyFarmerOrderById,
  updateFarmerOrderStatus,
  getFarmerDashboardStats
} from '../controllers/farmerController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { validateBody } from '../middleware/validationMiddleware.js';
import { updateOrderStatusSchema } from '../validations/schemas.js';

const router = Router();

// Authenticated Farmer Operations
router.get('/me', requireAuth, requireRole('FARMER'), getMyFarmerProfile);
router.get('/me/dashboard', requireAuth, requireRole('FARMER'), getFarmerDashboardStats);
router.get('/me/products', requireAuth, requireRole('FARMER'), getMyFarmerProducts);
router.get('/me/orders', requireAuth, requireRole('FARMER'), getMyFarmerOrders);
router.get('/me/orders/:id', requireAuth, requireRole('FARMER'), getMyFarmerOrderById);
router.patch(
  '/me/orders/:id/status',
  requireAuth,
  requireRole('FARMER'),
  validateBody(updateOrderStatusSchema),
  updateFarmerOrderStatus
);

// Convenient alias for /orders/:id/status
router.patch(
  '/orders/:id/status',
  requireAuth,
  requireRole('FARMER'),
  validateBody(updateOrderStatusSchema),
  updateFarmerOrderStatus
);

// Public farmer directory & storefronts
router.get('/', getPublicFarmers);
router.get('/:id', getFarmerById);

export default router;
