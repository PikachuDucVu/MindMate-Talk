import type { Request, Response, NextFunction } from 'express';
import { voiceChatService } from '../services/index.js';
import type { ApiResponse, VoiceChatResponse } from '../types/index.js';
import { env } from '../config/env.js';

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

    const conversation = voiceChatService.getConversation(conversationId);

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

    const deleted = voiceChatService.clearConversation(conversationId);

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
 * Get signed URL for ElevenLabs voice agent
 */
export async function getAgentSignedUrlHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${env.ELEVENLABS_AGENT_ID}`,
      {
        headers: {
          'xi-api-key': env.ELEVENLABS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      res.status(response.status).json({
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

    const data = await response.json();

    res.json({
      success: true,
      data: {
        signedUrl: data.signed_url,
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
