import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { validateBody, validateQuery } from '../middleware/validationMiddleware.js';
import {
  productQuerySchema,
  createProductSchema,
  updateProductSchema
} from '../validations/schemas.js';

const router = Router();

// Public product queries
router.get('/', validateQuery(productQuerySchema), getProducts);
router.get('/:id', getProductById);

// Farmer-protected mutations
router.post(
  '/',
  requireAuth,
  requireRole('FARMER'),
  validateBody(createProductSchema),
  createProduct
);

router.patch(
  '/:id',
  requireAuth,
  requireRole('FARMER'),
  validateBody(updateProductSchema),
  updateProduct
);

router.delete(
  '/:id',
  requireAuth,
  requireRole('FARMER'),
  deleteProduct
);

export default router;
