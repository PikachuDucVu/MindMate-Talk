import { Router } from 'express';
import chatRoutes from './chatRoutes.js';
import moodRoutes from './moodRoutes.js';
import authRoutes from './authRoutes.js';
import crisisRoutes from './crisisRoutes.js';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  });
});

// API v1 routes
router.use('/auth', authRoutes);
router.use('/chat', chatRoutes);
router.use('/mood', moodRoutes);
router.use('/crisis', crisisRoutes);

export default router;
