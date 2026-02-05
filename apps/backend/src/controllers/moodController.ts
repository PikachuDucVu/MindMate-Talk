import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import moodService from '../services/moodService.js';
import type { EmotionType, ApiResponse } from '@mindmate/shared';

// Validation schemas
const VALID_EMOTIONS: EmotionType[] = [
  'HAPPY', 'CALM', 'NEUTRAL', 'TIRED', 'ANXIOUS',
  'SAD', 'CONFUSED', 'LONELY', 'NUMB', 'ANGRY', 'OVERWHELMED'
];

const createMoodSchema = z.object({
  emotions: z.array(z.enum(VALID_EMOTIONS as [EmotionType, ...EmotionType[]]))
    .min(1, 'Chọn ít nhất 1 cảm xúc')
    .max(3, 'Chọn tối đa 3 cảm xúc'),
  note: z.string().max(500, 'Ghi chú tối đa 500 ký tự').optional(),
});

const getMoodsQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 30)),
});

const getMoodStatsQuerySchema = z.object({
  period: z.enum(['week', 'month', 'year']).optional().default('month'),
});

/**
 * POST /api/v1/mood
 * Create a new mood entry
 */
export async function createMood(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const validation = createMoodSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.error.errors[0].message,
          details: validation.error.errors,
        },
      });
      return;
    }

    const { emotions, note } = validation.data;

    // For now, userId is optional (anonymous users)
    // In future, get from auth middleware
    const userId = (req as any).userId || undefined;

    const mood = await moodService.createMood({
      userId,
      emotions,
      note,
    });

    res.status(201).json({
      success: true,
      data: mood,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: (req as any).requestId || 'unknown',
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/mood
 * Get mood history
 */
export async function getMoods(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const validation = getMoodsQuerySchema.safeParse(req.query);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid query parameters',
          details: validation.error.errors,
        },
      });
      return;
    }

    const { limit } = validation.data;
    const userId = (req as any).userId || undefined;

    // Default date range: last 30 days
    const endDate = validation.data.endDate
      ? new Date(validation.data.endDate)
      : new Date();

    const startDate = validation.data.startDate
      ? new Date(validation.data.startDate)
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const moods = await moodService.getMoodHistory(userId, startDate, endDate, limit);
    const stats = await moodService.getMoodStats(userId, 30);

    res.json({
      success: true,
      data: {
        moods,
        summary: stats,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: (req as any).requestId || 'unknown',
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/mood/today
 * Get today's mood
 */
export async function getTodayMood(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const userId = (req as any).userId || undefined;
    const mood = await moodService.getTodayMood(userId);

    res.json({
      success: true,
      data: {
        hasRecordedToday: mood !== null,
        mood,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: (req as any).requestId || 'unknown',
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/mood/stats
 * Get mood statistics
 */
export async function getMoodStats(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const validation = getMoodStatsQuerySchema.safeParse(req.query);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid query parameters',
        },
      });
      return;
    }

    const { period } = validation.data;
    const userId = (req as any).userId || undefined;

    // Convert period to days
    const periodDays = {
      week: 7,
      month: 30,
      year: 365,
    }[period];

    const stats = await moodService.getMoodStats(userId, periodDays);

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    res.json({
      success: true,
      data: {
        period,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        ...stats,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: (req as any).requestId || 'unknown',
      },
    });
  } catch (error) {
    next(error);
  }
}
