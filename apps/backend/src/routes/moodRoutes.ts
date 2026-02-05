import { Router } from 'express';
import {
  createMood,
  getMoods,
  getTodayMood,
  getMoodStats,
} from '../controllers/moodController.js';

const router = Router();

/**
 * @route   POST /api/v1/mood
 * @desc    Create a new mood entry
 * @access  Public (for now, will add auth later)
 */
router.post('/', createMood);

/**
 * @route   GET /api/v1/mood
 * @desc    Get mood history
 * @query   startDate, endDate, limit
 * @access  Public
 */
router.get('/', getMoods);

/**
 * @route   GET /api/v1/mood/today
 * @desc    Check if user has recorded mood today
 * @access  Public
 */
router.get('/today', getTodayMood);

/**
 * @route   GET /api/v1/mood/stats
 * @desc    Get mood statistics
 * @query   period (week, month, year)
 * @access  Public
 */
router.get('/stats', getMoodStats);

export default router;
