import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authService } from '../services/authService.js';

// Validation schemas
const guestLoginSchema = z.object({
  deviceId: z.string().min(16).max(128),
});

const registerSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  nickname: z.string().min(2).max(50).optional(),
});

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

const linkAccountSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

const updateProfileSchema = z.object({
  nickname: z.string().min(2).max(50).optional(),
  grade: z.enum(['GRADE_6_7', 'GRADE_8_9', 'GRADE_10_11', 'GRADE_12', 'UNIVERSITY']).optional(),
  preferVoice: z.boolean().optional(),
  concerns: z.array(z.string()).optional(),
});

/**
 * POST /api/v1/auth/guest
 * Guest login with device ID
 */
export async function guestLoginHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = guestLoginSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.errors[0].message,
        },
      });
      return;
    }

    const result = await authService.guestLogin(parsed.data.deviceId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/auth/register
 * Register new account
 */
export async function registerHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.errors[0].message,
        },
      });
      return;
    }

    // If user is logged in as guest, upgrade their account
    const existingUserId = req.user?.isGuest ? req.user.userId : undefined;

    const result = await authService.register(
      parsed.data.email,
      parsed.data.password,
      parsed.data.nickname,
      existingUserId
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('đã được sử dụng')) {
      res.status(409).json({
        success: false,
        error: {
          code: 'EMAIL_EXISTS',
          message: error.message,
        },
      });
      return;
    }
    next(error);
  }
}

/**
 * POST /api/v1/auth/login
 * Login with email/password
 */
export async function loginHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.errors[0].message,
        },
      });
      return;
    }

    const result = await authService.login(parsed.data.email, parsed.data.password);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('không đúng')) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: error.message,
        },
      });
      return;
    }
    next(error);
  }
}

/**
 * POST /api/v1/auth/link
 * Link guest account to email (requires auth)
 */
export async function linkAccountHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Vui lòng đăng nhập',
        },
      });
      return;
    }

    if (!req.user.isGuest) {
      res.status(400).json({
        success: false,
        error: {
          code: 'ALREADY_LINKED',
          message: 'Tài khoản đã được liên kết',
        },
      });
      return;
    }

    const parsed = linkAccountSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.errors[0].message,
        },
      });
      return;
    }

    const result = await authService.linkAccount(
      req.user.userId,
      parsed.data.email,
      parsed.data.password
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('đã được sử dụng')) {
      res.status(409).json({
        success: false,
        error: {
          code: 'EMAIL_EXISTS',
          message: error.message,
        },
      });
      return;
    }
    next(error);
  }
}

/**
 * POST /api/v1/auth/refresh
 * Refresh access token
 */
export async function refreshTokenHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = refreshTokenSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Refresh token không hợp lệ',
        },
      });
      return;
    }

    const tokens = await authService.refreshToken(parsed.data.refreshToken);

    res.json({
      success: true,
      data: { tokens },
    });
  } catch {
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Refresh token hết hạn hoặc không hợp lệ',
      },
    });
  }
}

/**
 * GET /api/v1/auth/me
 * Get current user info (requires auth)
 */
export async function getMeHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Vui lòng đăng nhập',
        },
      });
      return;
    }

    const user = await authService.getUser(req.user.userId);

    if (!user) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Người dùng không tồn tại',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/auth/profile
 * Update user profile (requires auth)
 */
export async function updateProfileHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Vui lòng đăng nhập',
        },
      });
      return;
    }

    const parsed = updateProfileSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.errors[0].message,
        },
      });
      return;
    }

    const user = await authService.updateProfile(req.user.userId, parsed.data);

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}
