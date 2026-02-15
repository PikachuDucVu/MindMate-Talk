import { Router } from 'express';
import {
  createMood,
  getMoods,
  getTodayMood,
  getMoodStats,
} from '../controllers/moodController.js';
import { optionalAuthMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// Apply optional auth to all routes
router.use(optionalAuthMiddleware);

/**
 * @route   POST /api/v1/mood
 * @desc    Create a new mood entry
 * @access  Authenticated (optional - uses userId if available)
 */
router.post('/', createMood);

/**
 * @route   GET /api/v1/mood
 * @desc    Get mood history
 * @query   startDate, endDate, limit
 * @access  Authenticated (optional)
 */
router.get('/', getMoods);

/**
 * @route   GET /api/v1/mood/today
 * @desc    Check if user has recorded mood today
 * @access  Authenticated (optional)
 */
router.get('/today', getTodayMood);

/**
 * @route   GET /api/v1/mood/stats
 * @desc    Get mood statistics
 * @query   period (week, month, year)
 * @access  Authenticated (optional)
 */
router.get('/stats', getMoodStats);

export default router;
