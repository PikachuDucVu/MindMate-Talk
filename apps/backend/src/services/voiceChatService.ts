import { llmService } from './llmService.js';
import { ttsService } from './ttsService.js';
import { sttService } from './sttService.js';
import { crisisService } from './crisisService.js';
import { conversationService } from './conversationService.js';
import moodService from './moodService.js';
import { prisma } from '../config/database.js';
import {
  MINDMATE_SYSTEM_PROMPT,
  getContextualPrompt,
  buildUserProfileContext,
  buildPastConversationsContext,
  buildMoodHistoryContext,
} from '../prompts/systemPrompt.js';
import type {
  VoiceChatRequest,
  VoiceChatResponse,
  ConversationContext,
  Message,
} from '../types/index.js';

// Emotion labels in Vietnamese
const EMOTION_LABELS: Record<string, string> = {
  HAPPY: 'vui vẻ',
  CALM: 'bình yên',
  NEUTRAL: 'bình thường',
  TIRED: 'mệt mỏi',
  ANXIOUS: 'lo lắng',
  SAD: 'buồn',
  CONFUSED: 'rối bời',
  LONELY: 'cô đơn',
  NUMB: 'trống rỗng',
  ANGRY: 'tức giận',
  OVERWHELMED: 'quá tải',
};

/**
 * Build mood context for system prompt
 */
function buildMoodContext(emotions: string[], note?: string | null): string {
  if (emotions.length === 0) return '';

  const emotionLabels = emotions.map(e => EMOTION_LABELS[e] || e.toLowerCase()).join(', ');

  let context = `\n\n[TRẠNG THÁI CẢM XÚC HÔM NAY CỦA USER]
User đã chia sẻ cảm xúc hôm nay: ${emotionLabels}.`;

  if (note) {
    context += `\nGhi chú của user: "${note}"`;
  }

  context += `\nHãy thể hiện sự thấu hiểu về trạng thái cảm xúc này trong cuộc trò chuyện. Không cần hỏi lại "hôm nay bạn cảm thấy thế nào" vì user đã chia sẻ rồi.`;

  return context;
}

// In-memory cache for active conversations (faster than DB for frequent access)
const conversationCache = new Map<string, { messages: Message[] }>();

export class VoiceChatService {
  /**
   * Process a complete voice chat request
   * Audio → STT → LLM → TTS → Audio
   */
  async processVoiceChat(request: VoiceChatRequest): Promise<VoiceChatResponse> {
    let conversationId = request.conversationId;
    let isNewConversation = false;

    // Create new conversation in DB if needed
    if (!conversationId) {
      const conversation = await conversationService.createConversation(request.userId);
      conversationId = conversation.id;
      isNewConversation = true;
    }

    // Get messages from cache or load from DB
    let messages: Message[] = conversationCache.get(conversationId)?.messages || [];
    if (messages.length === 0) {
      const dbMessages = await conversationService.getMessages(conversationId, 20);
      messages = dbMessages.map(m => ({ role: m.role as Message['role'], content: m.content }));
      conversationCache.set(conversationId, { messages });
    }

    let userText: string;

    // Step 1: Speech-to-Text (if audio provided)
    if (request.audioBuffer) {
      const sttResult = await sttService.transcribe({
        audioBuffer: request.audioBuffer,
        language: 'vi',
      });
      userText = sttResult.text;
    } else if (request.text) {
      userText = request.text;
    } else {
      throw new Error('Either audioBuffer or text must be provided');
    }

    // Step 2: Crisis Assessment
    const crisisAssessment = crisisService.assessMessage(userText);

    // Step 3: Save user message to DB and add to cache
    await conversationService.addMessage(conversationId, {
      role: 'user',
      content: userText,
      contentType: request.audioBuffer ? 'VOICE' : 'TEXT',
    });
    messages.push({ role: 'user', content: userText });

    // Step 4: Build system prompt with full user context
    let systemPrompt = MINDMATE_SYSTEM_PROMPT;

    if (request.userId) {
      // Fetch user profile, past conversations, and mood history in parallel
      const [user, pastConversations, recentMoods, todayMood] = await Promise.all([
        prisma.user.findUnique({
          where: { id: request.userId },
          select: { nickname: true, grade: true, concerns: true },
        }),
        conversationService.getRecentConversationSummaries(
          request.userId,
          conversationId,
          5
        ),
        moodService.getMoodHistory(
          request.userId,
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // last 7 days
          new Date(),
          7
        ),
        moodService.getTodayMood(request.userId),
      ]);

      // Add user profile context (name, grade)
      if (user) {
        systemPrompt += buildUserProfileContext(user);
        systemPrompt += getContextualPrompt(user.grade);
      }

      // Add past conversation summaries for cross-session memory
      if (pastConversations.length > 0) {
        systemPrompt += buildPastConversationsContext(pastConversations);
      }

      // Add mood history (last 7 days) for emotional trend awareness
      if (recentMoods.length > 0) {
        systemPrompt += buildMoodHistoryContext(recentMoods);
      }

      // Add today's mood (more specific/immediate context)
      if (todayMood) {
        systemPrompt += buildMoodContext(todayMood.emotions, todayMood.note);
      }
    } else {
      systemPrompt += getContextualPrompt();
    }

    systemPrompt += crisisService.getCrisisPromptAddition(crisisAssessment.level);

    // Step 5: Generate AI response
    const llmResponse = await llmService.generateResponse({
      messages,
      systemPrompt,
    });

    // Step 6: Save AI response to DB and add to cache
    await conversationService.addMessage(conversationId, {
      role: 'assistant',
      content: llmResponse.content,
      tokensUsed: llmResponse.tokensUsed,
    });
    messages.push({ role: 'assistant', content: llmResponse.content });

    // Limit cache to last 20 messages
    if (messages.length > 20) {
      messages = messages.slice(-20);
      conversationCache.set(conversationId, { messages });
    }

    // Log crisis event (MEDIUM and above) - fire and forget
    if (crisisAssessment.level !== 'NONE' && crisisAssessment.level !== 'LOW') {
      crisisService.logCrisisEvent({
        userId: request.userId,
        conversationId,
        level: crisisAssessment.level,
        triggerContent: userText,
        aiResponse: llmResponse.content,
        hotlineShown: crisisAssessment.shouldShowHotline,
      }).catch(console.error);
    }

    // Generate title for new conversations
    if (isNewConversation) {
      conversationService.generateTitle(conversationId).catch(console.error);
    }

    // Step 7: Text-to-Speech
    const audioBuffer = await ttsService.textToSpeech({
      text: llmResponse.content,
      voiceId: '',
    });

    return {
      conversationId,
      userTranscript: userText,
      aiResponse: llmResponse.content,
      audioBuffer,
      crisisLevel: crisisAssessment.level,
    };
  }

  /**
   * Process text-only chat (no audio)
   */
  async processTextChat(request: VoiceChatRequest): Promise<Omit<VoiceChatResponse, 'audioBuffer'>> {
    let conversationId = request.conversationId;
    let isNewConversation = false;

    // Create new conversation in DB if needed
    if (!conversationId) {
      const conversation = await conversationService.createConversation(request.userId);
      conversationId = conversation.id;
      isNewConversation = true;
    }

    // Get messages from cache or load from DB
    let messages: Message[] = conversationCache.get(conversationId)?.messages || [];
    if (messages.length === 0) {
      const dbMessages = await conversationService.getMessages(conversationId, 20);
      messages = dbMessages.map(m => ({ role: m.role as Message['role'], content: m.content }));
      conversationCache.set(conversationId, { messages });
    }

    if (!request.text) {
      throw new Error('Text must be provided');
    }

    // Crisis Assessment
    const crisisAssessment = crisisService.assessMessage(request.text);

    // Save user message to DB and add to cache
    await conversationService.addMessage(conversationId, {
      role: 'user',
      content: request.text,
      contentType: 'TEXT',
    });
    messages.push({ role: 'user', content: request.text });

    // Build system prompt with full user context
    let systemPrompt = MINDMATE_SYSTEM_PROMPT;

    if (request.userId) {
      // Fetch user profile, past conversations, and mood history in parallel
      const [user, pastConversations, recentMoods, todayMood] = await Promise.all([
        prisma.user.findUnique({
          where: { id: request.userId },
          select: { nickname: true, grade: true, concerns: true },
        }),
        conversationService.getRecentConversationSummaries(
          request.userId,
          conversationId,
          5
        ),
        moodService.getMoodHistory(
          request.userId,
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // last 7 days
          new Date(),
          7
        ),
        moodService.getTodayMood(request.userId),
      ]);

      // Add user profile context (name, grade)
      if (user) {
        systemPrompt += buildUserProfileContext(user);
        systemPrompt += getContextualPrompt(user.grade);
      }

      // Add past conversation summaries for cross-session memory
      if (pastConversations.length > 0) {
        systemPrompt += buildPastConversationsContext(pastConversations);
      }

      // Add mood history (last 7 days) for emotional trend awareness
      if (recentMoods.length > 0) {
        systemPrompt += buildMoodHistoryContext(recentMoods);
      }

      // Add today's mood (more specific/immediate context)
      if (todayMood) {
        systemPrompt += buildMoodContext(todayMood.emotions, todayMood.note);
      }
    } else {
      systemPrompt += getContextualPrompt();
    }

    systemPrompt += crisisService.getCrisisPromptAddition(crisisAssessment.level);

    // Generate response
    const llmResponse = await llmService.generateResponse({
      messages,
      systemPrompt,
    });

    // Save AI response to DB and add to cache
    await conversationService.addMessage(conversationId, {
      role: 'assistant',
      content: llmResponse.content,
      tokensUsed: llmResponse.tokensUsed,
    });
    messages.push({ role: 'assistant', content: llmResponse.content });

    // Limit cache
    if (messages.length > 20) {
      messages = messages.slice(-20);
      conversationCache.set(conversationId, { messages });
    }

    // Log crisis event (MEDIUM and above) - fire and forget
    if (crisisAssessment.level !== 'NONE' && crisisAssessment.level !== 'LOW') {
      crisisService.logCrisisEvent({
        userId: request.userId,
        conversationId,
        level: crisisAssessment.level,
        triggerContent: request.text,
        aiResponse: llmResponse.content,
        hotlineShown: crisisAssessment.shouldShowHotline,
      }).catch(console.error);
    }

    // Generate title for new conversations
    if (isNewConversation) {
      conversationService.generateTitle(conversationId).catch(console.error);
    }

    return {
      conversationId,
      userTranscript: request.text,
      aiResponse: llmResponse.content,
      crisisLevel: crisisAssessment.level,
    };
  }

  /**
   * Get conversation history from DB
   */
  async getConversation(conversationId: string): Promise<ConversationContext | null> {
    const conversation = await conversationService.getConversation(conversationId);
    if (!conversation) return null;

    return {
      id: conversation.id,
      messages: conversation.messages.map(m => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
      })),
      createdAt: conversation.createdAt,
      lastMessageAt: conversation.updatedAt,
    };
  }

  /**
   * Get recent conversations for history list
   */
  async getRecentConversations(userId?: string, limit = 20) {
    return conversationService.getRecentConversations(userId, limit);
  }

  /**
   * Clear conversation from cache and DB
   */
  async clearConversation(conversationId: string): Promise<boolean> {
    conversationCache.delete(conversationId);
    return conversationService.deleteConversation(conversationId);
  }

  /**
   * Clear conversation cache only (for memory management)
   */
  clearCache(conversationId?: string): void {
    if (conversationId) {
      conversationCache.delete(conversationId);
    } else {
      conversationCache.clear();
    }
  }
}

export const voiceChatService = new VoiceChatService();
