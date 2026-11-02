import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import farmerRoutes from './farmerRoutes.js';
import consumerRoutes from './consumerRoutes.js';
import productRoutes from './productRoutes.js';
import orderRoutes from './orderRoutes.js';
import favoriteRoutes from './favoriteRoutes.js';
import traceabilityRoutes from './traceabilityRoutes.js';
import aiRoutes from './aiRoutes.js';
import agentRoutes from './agentRoutes.js';
import verificationRoutes from './verificationRoutes.js';
import { prisma } from '../config/db.js';

const router = Router();

// Health Check Endpoint
router.get('/health', async (req, res) => {
  try {
    // Quick probe to verify database connectivity
    await prisma.$queryRaw`SELECT 1`;
    return res.status(200).json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return res.status(200).json({
      status: 'ok',
      database: 'disconnected',
      error: 'Database probe failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Mount Sub-routers
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/farmers', farmerRoutes);
router.use('/farmer', farmerRoutes); // Alias for singular routes like /api/farmer/orders/:id/status
router.use('/consumers', consumerRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/traceability', traceabilityRoutes);
router.use('/ai', aiRoutes);
router.use('/agent', agentRoutes);
router.use('/verification', verificationRoutes);

export default router;

