import type { Request, Response, NextFunction } from 'express';
import { voiceChatService } from '../services/index.js';
import type { ApiResponse, VoiceChatResponse } from '../types/index.js';
import { env } from '../config/env.js';
import { prisma } from '../config/database.js';
import { conversationService } from '../services/conversationService.js';
import moodService from '../services/moodService.js';
import {
  MINDMATE_SYSTEM_PROMPT,
  getContextualPrompt,
  buildUserProfileContext,
  buildPastConversationsContext,
  buildMoodHistoryContext,
} from '../prompts/systemPrompt.js';

// Emotion labels for mood context
const EMOTION_LABELS: Record<string, string> = {
  HAPPY: 'vui vẻ', CALM: 'bình yên', NEUTRAL: 'bình thường',
  TIRED: 'mệt mỏi', ANXIOUS: 'lo lắng', SAD: 'buồn',
  CONFUSED: 'rối bời', LONELY: 'cô đơn', NUMB: 'trống rỗng',
  ANGRY: 'tức giận', OVERWHELMED: 'quá tải',
};

function buildMoodContext(emotions: string[], note?: string | null): string {
  if (emotions.length === 0) return '';
  const emotionLabels = emotions.map(e => EMOTION_LABELS[e] || e.toLowerCase()).join(', ');
  let context = `\n\n[TRẠNG THÁI CẢM XÚC HÔM NAY CỦA USER]\nUser đã chia sẻ cảm xúc hôm nay: ${emotionLabels}.`;
  if (note) context += `\nGhi chú của user: "${note}"`;
  context += `\nHãy thể hiện sự thấu hiểu về trạng thái cảm xúc này. Không cần hỏi lại "hôm nay bạn cảm thấy thế nào" vì user đã chia sẻ rồi.`;
  return context;
}

/**
 * Build full dynamic prompt for a user (used by text chat)
 */
async function buildDynamicPrompt(userId?: string): Promise<string> {
  let systemPrompt = MINDMATE_SYSTEM_PROMPT;

  if (userId) {
    systemPrompt += await buildUserContext(userId);
  } else {
    systemPrompt += getContextualPrompt();
  }

  return systemPrompt;
}

/**
 * Build user-specific context only (used by voice agent contextual update)
 */
async function buildUserContext(userId: string): Promise<string> {
  let context = '';

  const [user, pastConversations, recentMoods, todayMood] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { nickname: true, grade: true, concerns: true },
    }),
    conversationService.getRecentConversationSummaries(userId, undefined, 5),
    moodService.getMoodHistory(
      userId,
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      new Date(),
      7
    ),
    moodService.getTodayMood(userId),
  ]);

  if (user) {
    context += buildUserProfileContext(user);
    context += getContextualPrompt(user.grade);
  }

  if (pastConversations.length > 0) {
    context += buildPastConversationsContext(pastConversations);
  }

  if (recentMoods.length > 0) {
    context += buildMoodHistoryContext(recentMoods);
  }

  if (todayMood) {
    context += buildMoodContext(todayMood.emotions, todayMood.note);
  }

  return context;
}

/**
 * POST /api/v1/chat/text
 * Process text-only chat
 */
export async function textChatHandler(
  req: Request,
  res: Response<ApiResponse<Omit<VoiceChatResponse, 'audioBuffer'>>>,
  next: NextFunction
): Promise<void> {
  try {
    const { conversationId, text } = req.body;
    const userId = req.user?.userId;

    if (!text || typeof text !== 'string') {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Text is required',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || '',
        },
      });
      return;
    }

    const result = await voiceChatService.processTextChat({
      conversationId,
      text,
      userId,
    });

    res.json({
      success: true,
      data: result,
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
 * POST /api/v1/chat/voice
 * Process voice chat (audio upload)
 */
export async function voiceChatHandler(
  req: Request,
  res: Response<ApiResponse<VoiceChatResponse>>,
  next: NextFunction
): Promise<void> {
  try {
    const { conversationId } = req.body;
    const userId = req.user?.userId;

    // Check if file was uploaded
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Audio file is required',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || '',
        },
      });
      return;
    }

    const result = await voiceChatService.processVoiceChat({
      conversationId,
      audioBuffer: req.file.buffer,
      userId,
    });

    // Convert audio buffer to base64 for JSON response
    const audioBase64 = result.audioBuffer?.toString('base64');

    res.json({
      success: true,
      data: {
        ...result,
        audioBuffer: undefined,
        audioUrl: audioBase64 ? `data:audio/mpeg;base64,${audioBase64}` : undefined,
      },
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
 * GET /api/v1/chat/history
 * Get list of recent conversations
 */
export async function getConversationHistoryHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const userId = req.user?.userId;

    const conversations = await voiceChatService.getRecentConversations(userId, limit);

    res.json({
      success: true,
      data: {
        conversations: conversations.map((conv) => ({
          id: conv.id,
          title: conv.title || 'Cuộc trò chuyện',
          lastMessage: conv.lastMessage?.content?.slice(0, 100) || '',
          updatedAt: conv.updatedAt,
          createdAt: conv.createdAt,
        })),
      },
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
 * GET /api/v1/chat/:conversationId
 * Get conversation history
 */
export async function getConversationHandler(
  req: Request<{ conversationId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { conversationId } = req.params;

    const conversation = await voiceChatService.getConversation(conversationId);

    if (!conversation) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Conversation not found',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || '',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: conversation,
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
 * DELETE /api/v1/chat/:conversationId
 * Delete conversation
 */
export async function deleteConversationHandler(
  req: Request<{ conversationId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { conversationId } = req.params;

    const deleted = await voiceChatService.clearConversation(conversationId);

    if (!deleted) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Conversation not found',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || '',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        message: 'Conversation deleted successfully',
      },
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
 * GET /api/v1/chat/agent/signed-url
 * Get signed URL for ElevenLabs voice agent + dynamic prompt
 */
export async function getAgentSignedUrlHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.userId;

    // Fetch signed URL and user context in parallel
    const [elevenLabsResponse, userContext] = await Promise.all([
      fetch(
        `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${env.ELEVENLABS_AGENT_ID}`,
        {
          headers: {
            'xi-api-key': env.ELEVENLABS_API_KEY as string,
          },
        }
      ),
      userId ? buildUserContext(userId) : Promise.resolve(''),
    ]);

    if (!elevenLabsResponse.ok) {
      const errorText = await elevenLabsResponse.text();
      res.status(elevenLabsResponse.status).json({
        success: false,
        error: {
          code: 'ELEVENLABS_ERROR',
          message: `Failed to get signed URL: ${errorText}`,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || '',
        },
      });
      return;
    }

    const data = await elevenLabsResponse.json() as { signed_url: string };

    res.json({
      success: true,
      data: {
        signedUrl: data.signed_url,
        dynamicPrompt: userContext,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || '',
      },
    });
  } catch (error) {
    next(error);
  }
}
