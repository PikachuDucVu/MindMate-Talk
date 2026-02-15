import { Router } from 'express';
import { hotlineClickedHandler, getHotlinesHandler } from '../controllers/crisisController.js';
import { optionalAuthMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.use(optionalAuthMiddleware);

// Record hotline click
router.post('/hotline-clicked', hotlineClickedHandler);

// Get hotline information
router.get('/hotlines', getHotlinesHandler);

export default router;
