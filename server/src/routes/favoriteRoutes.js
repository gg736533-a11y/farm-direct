import { Router } from 'express';
import {
  getFavorites,
  addFavorite,
  removeFavorite
} from '../controllers/favoriteController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

// Consumer-only Favorites Routes
router.get(
  '/',
  requireAuth,
  requireRole('CONSUMER'),
  getFavorites
);

router.post(
  '/',
  requireAuth,
  requireRole('CONSUMER'),
  addFavorite
);

router.post(
  '/:productId',
  requireAuth,
  requireRole('CONSUMER'),
  addFavorite
);

router.delete(
  '/:productId',
  requireAuth,
  requireRole('CONSUMER'),
  removeFavorite
);

export default router;
