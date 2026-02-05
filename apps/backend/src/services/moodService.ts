import prisma from '../config/database.js';
import type { EmotionType } from '@mindmate/shared';

export interface CreateMoodInput {
  userId?: string;
  emotions: EmotionType[];
  note?: string;
}

export interface MoodWithEmotions {
  id: string;
  emotions: EmotionType[];
  note: string | null;
  recordedAt: Date;
  createdAt: Date;
}

export interface MoodStats {
  totalEntries: number;
  topEmotions: { emotion: EmotionType; count: number }[];
  streakDays: number;
}

class MoodService {
  /**
   * Create a new mood entry
   */
  async createMood(input: CreateMoodInput): Promise<MoodWithEmotions> {
    const mood = await prisma.mood.create({
      data: {
        userId: input.userId,
        emotions: JSON.stringify(input.emotions),
        note: input.note,
      },
    });

    return this.transformMood(mood);
  }

  /**
   * Get mood history for a user within a date range
   */
  async getMoodHistory(
    userId: string | undefined,
    startDate: Date,
    endDate: Date,
    limit: number = 30
  ): Promise<MoodWithEmotions[]> {
    const moods = await prisma.mood.findMany({
      where: {
        userId,
        recordedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { recordedAt: 'desc' },
      take: limit,
    });

    return moods.map((mood) => this.transformMood(mood));
  }

  /**
   * Get today's mood for a user
   */
  async getTodayMood(userId?: string): Promise<MoodWithEmotions | null> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const mood = await prisma.mood.findFirst({
      where: {
        userId,
        recordedAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: { recordedAt: 'desc' },
    });

    return mood ? this.transformMood(mood) : null;
  }

  /**
   * Get mood statistics for a user
   */
  async getMoodStats(
    userId: string | undefined,
    days: number = 30
  ): Promise<MoodStats> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const moods = await prisma.mood.findMany({
      where: {
        userId,
        recordedAt: {
          gte: startDate,
        },
      },
      orderBy: { recordedAt: 'desc' },
    });

    // Count emotions
    const emotionCounts: Record<string, number> = {};
    moods.forEach((mood) => {
      const emotions = JSON.parse(mood.emotions) as EmotionType[];
      emotions.forEach((emotion) => {
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      });
    });

    // Sort by count
    const topEmotions = Object.entries(emotionCounts)
      .map(([emotion, count]) => ({ emotion: emotion as EmotionType, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate streak
    const streakDays = this.calculateStreak(moods);

    return {
      totalEntries: moods.length,
      topEmotions,
      streakDays,
    };
  }

  /**
   * Calculate consecutive days streak
   */
  private calculateStreak(moods: { recordedAt: Date }[]): number {
    if (moods.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Group moods by date
    const moodDates = new Set(
      moods.map((mood) => {
        const date = new Date(mood.recordedAt);
        date.setHours(0, 0, 0, 0);
        return date.toISOString();
      })
    );

    // Count consecutive days from today
    const checkDate = new Date(today);
    while (moodDates.has(checkDate.toISOString())) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    return streak;
  }

  /**
   * Transform database mood to API response format
   */
  private transformMood(mood: {
    id: string;
    emotions: string;
    note: string | null;
    recordedAt: Date;
    createdAt: Date;
  }): MoodWithEmotions {
    return {
      id: mood.id,
      emotions: JSON.parse(mood.emotions) as EmotionType[],
      note: mood.note,
      recordedAt: mood.recordedAt,
      createdAt: mood.createdAt,
    };
  }
}

export const moodService = new MoodService();
export default moodService;
