import type { Request, Response, NextFunction } from 'express';
import { crisisService } from '../services/crisisService.js';

/**
 * POST /api/v1/crisis/hotline-clicked
 * Record that user clicked a hotline link
 */
export async function hotlineClickedHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { crisisEventId } = req.body;

    if (!crisisEventId || typeof crisisEventId !== 'string') {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'crisisEventId is required',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || '',
        },
      });
      return;
    }

    await crisisService.recordHotlineClick(crisisEventId);

    res.json({
      success: true,
      data: { message: 'Recorded' },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || '',
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/crisis/hotlines
 * Get hotline information
 */
export async function getHotlinesHandler(
  _req: Request,
  res: Response,
): Promise<void> {
  const hotlines = crisisService.getHotlines();

  res.json({
    success: true,
    data: hotlines,
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
}
