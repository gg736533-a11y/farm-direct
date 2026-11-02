import { Router } from 'express';
import { getTraceabilityByProductId } from '../controllers/traceabilityController.js';

const router = Router();

// Public: GET /api/traceability/:productId
// No authentication required. Public consumer & QR scan endpoint.
router.get('/:productId', getTraceabilityByProductId);

export default router;
