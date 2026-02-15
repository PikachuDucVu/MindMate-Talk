import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/database.js';
import { env } from '../config/env.js';
import type { User } from '@prisma/client';

// Use a default secret for development, require proper secret in production
const JWT_SECRET = env.JWT_SECRET || 'mindmate-dev-secret-key-32chars!!';
const JWT_EXPIRES_IN = env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_EXPIRES_IN = env.JWT_REFRESH_EXPIRES_IN || '30d';

export interface TokenPayload {
  userId: string;
  deviceId?: string;
  isGuest: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserInfo {
  id: string;
  email: string | null;
  nickname: string | null;
  isGuest: boolean;
  grade: string;
  createdAt: Date;
}

export class AuthService {
  /**
   * Login or create guest user by device ID
   */
  async guestLogin(deviceId: string): Promise<{ user: UserInfo; tokens: AuthTokens }> {
    // Find existing user by deviceId or create new
    let user = await prisma.user.findFirst({
      where: {
        // Store deviceId in email field with prefix for guests
        email: `guest_${deviceId}`,
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: `guest_${deviceId}`,
          nickname: null,
          grade: 'GRADE_10_11',
        },
      });
    }

    // Update last active
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    });

    const tokens = this.generateTokens({
      userId: user.id,
      deviceId,
      isGuest: true,
    });

    return {
      user: this.toUserInfo(user, true),
      tokens,
    };
  }

  /**
   * Register new account (upgrade from guest or new user)
   */
  async register(
    email: string,
    password: string,
    nickname?: string,
    existingUserId?: string
  ): Promise<{ user: UserInfo; tokens: AuthTokens }> {
    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      throw new Error('Email đã được sử dụng');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    let user: User;

    if (existingUserId) {
      // Upgrade guest account
      user = await prisma.user.update({
        where: { id: existingUserId },
        data: {
          email,
          passwordHash,
          nickname: nickname || undefined,
        },
      });
    } else {
      // Create new account
      user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          nickname,
          grade: 'GRADE_10_11',
        },
      });
    }

    const tokens = this.generateTokens({
      userId: user.id,
      isGuest: false,
    });

    return {
      user: this.toUserInfo(user, false),
      tokens,
    };
  }

  /**
   * Login with email/password
   */
  async login(email: string, password: string): Promise<{ user: UserInfo; tokens: AuthTokens }> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      throw new Error('Email hoặc mật khẩu không đúng');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new Error('Email hoặc mật khẩu không đúng');
    }

    // Update last active
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    });

    const tokens = this.generateTokens({
      userId: user.id,
      isGuest: false,
    });

    return {
      user: this.toUserInfo(user, false),
      tokens,
    };
  }

  /**
   * Link guest account to email
   */
  async linkAccount(
    userId: string,
    email: string,
    password: string
  ): Promise<{ user: UserInfo; tokens: AuthTokens }> {
    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      throw new Error('Email đã được sử dụng');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        email,
        passwordHash,
      },
    });

    const tokens = this.generateTokens({
      userId: user.id,
      isGuest: false,
    });

    return {
      user: this.toUserInfo(user, false),
      tokens,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = jwt.verify(refreshToken, JWT_SECRET) as TokenPayload & { type: string };

      if (payload.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      // Verify user still exists
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      return this.generateTokens({
        userId: payload.userId,
        deviceId: payload.deviceId,
        isGuest: payload.isGuest,
      });
    } catch {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Verify access token
   */
  verifyToken(token: string): TokenPayload {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as TokenPayload & { type: string };

      if (payload.type !== 'access') {
        throw new Error('Invalid token type');
      }

      return {
        userId: payload.userId,
        deviceId: payload.deviceId,
        isGuest: payload.isGuest,
      };
    } catch {
      throw new Error('Invalid access token');
    }
  }

  /**
   * Get user by ID
   */
  async getUser(userId: string): Promise<UserInfo | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return null;

    const isGuest = user.email?.startsWith('guest_') ?? true;
    return this.toUserInfo(user, isGuest);
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    data: { nickname?: string; grade?: string; preferVoice?: boolean; concerns?: string[] }
  ): Promise<UserInfo> {
    // Serialize concerns array to JSON string for SQLite
    const dbData: Record<string, unknown> = { ...data };
    if (data.concerns) {
      dbData.concerns = JSON.stringify(data.concerns);
      delete dbData.concerns;
      // Re-assign after delete to ensure correct type
    }

    const updatePayload: Record<string, unknown> = {};
    if (data.nickname !== undefined) updatePayload.nickname = data.nickname;
    if (data.grade !== undefined) updatePayload.grade = data.grade;
    if (data.preferVoice !== undefined) updatePayload.preferVoice = data.preferVoice;
    if (data.concerns !== undefined) updatePayload.concerns = JSON.stringify(data.concerns);

    const user = await prisma.user.update({
      where: { id: userId },
      data: updatePayload,
    });

    const isGuest = user.email?.startsWith('guest_') ?? true;
    return this.toUserInfo(user, isGuest);
  }

  private generateTokens(payload: TokenPayload): AuthTokens {
    const accessToken = jwt.sign(
      { ...payload, type: 'access' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
    );

    const refreshToken = jwt.sign(
      { ...payload, type: 'refresh' },
      JWT_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions
    );

    // Parse expiration time
    const expiresIn = this.parseExpiration(JWT_EXPIRES_IN);

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  private parseExpiration(exp: string): number {
    const match = exp.match(/^(\d+)([smhd])$/);
    if (!match) return 3600; // Default 1 hour

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 3600;
      case 'd': return value * 86400;
      default: return 3600;
    }
  }

  private toUserInfo(user: User, isGuest: boolean): UserInfo {
    return {
      id: user.id,
      email: isGuest ? null : user.email,
      nickname: user.nickname,
      isGuest,
      grade: user.grade,
      createdAt: user.createdAt,
    };
  }
}

export const authService = new AuthService();
