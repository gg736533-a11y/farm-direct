import { Router } from 'express';
import { register, login, logout, getMe } from '../controllers/authController.js';
import { validateBody } from '../middleware/validationMiddleware.js';
import { registerSchema, loginSchema } from '../validations/schemas.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.post('/logout', logout);
router.get('/me', requireAuth, getMe);

export default router;
