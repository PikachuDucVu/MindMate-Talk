import { Router } from 'express';
import chatRoutes from './chatRoutes.js';

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
router.use('/chat', chatRoutes);

export default router;
