import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/userController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validationMiddleware.js';
import { updateProfileSchema } from '../validations/schemas.js';

const router = Router();

router.get('/me', requireAuth, getProfile);
router.patch('/me', requireAuth, validateBody(updateProfileSchema), updateProfile);

export default router;
