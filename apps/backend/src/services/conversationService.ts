import { prisma } from '../config/database.js';
import type { Message as PrismaMessage, Conversation } from '@prisma/client';

export interface ConversationWithMessages extends Conversation {
  messages: PrismaMessage[];
}

export interface MessageInput {
  role: 'user' | 'assistant' | 'system';
  content: string;
  contentType?: 'TEXT' | 'VOICE';
  audioUrl?: string;
  audioDuration?: number;
  tokensUsed?: number;
}

export class ConversationService {
  /**
   * Create a new conversation
   */
  async createConversation(userId?: string): Promise<Conversation> {
    return prisma.conversation.create({
      data: {
        userId,
        startedAt: new Date(),
      },
    });
  }

  /**
   * Get conversation by ID with messages
   */
  async getConversation(conversationId: string): Promise<ConversationWithMessages | null> {
    return prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  /**
   * Get recent conversations for history list
   */
  async getRecentConversations(
    userId?: string,
    limit = 20
  ): Promise<Array<Conversation & { messages: PrismaMessage[]; lastMessage?: PrismaMessage }>> {
    const conversations = await prisma.conversation.findMany({
      where: userId ? { userId } : {},
      orderBy: { updatedAt: 'desc' },
      take: limit,
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1, // Only get last message for preview
        },
      },
    });

    return conversations.map((conv) => ({
      ...conv,
      lastMessage: conv.messages[0],
    }));
  }

  /**
   * Add a message to conversation
   */
  async addMessage(conversationId: string, message: MessageInput): Promise<PrismaMessage> {
    // Update conversation's updatedAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return prisma.message.create({
      data: {
        conversationId,
        role: message.role,
        content: message.content,
        contentType: message.contentType || 'TEXT',
        audioUrl: message.audioUrl,
        audioDuration: message.audioDuration,
        tokensUsed: message.tokensUsed,
      },
    });
  }

  /**
   * Get messages for a conversation (for LLM context)
   */
  async getMessages(
    conversationId: string,
    limit = 20
  ): Promise<Array<{ role: string; content: string }>> {
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: limit,
      select: {
        role: true,
        content: true,
      },
    });

    return messages;
  }

  /**
   * Update conversation title/summary
   */
  async updateConversation(
    conversationId: string,
    data: { title?: string; summary?: string; endedAt?: Date }
  ): Promise<Conversation> {
    return prisma.conversation.update({
      where: { id: conversationId },
      data,
    });
  }

  /**
   * Delete conversation and all messages
   */
  async deleteConversation(conversationId: string): Promise<boolean> {
    try {
      await prisma.conversation.delete({
        where: { id: conversationId },
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get summaries of recent conversations for cross-conversation context
   * This allows AI to remember what was discussed in previous sessions
   */
  async getRecentConversationSummaries(
    userId?: string,
    excludeConversationId?: string,
    limit = 5
  ): Promise<Array<{ title: string | null; summary: string | null; lastMessages: string[]; createdAt: Date }>> {
    if (!userId) return [];

    const conversations = await prisma.conversation.findMany({
      where: {
        userId,
        ...(excludeConversationId ? { id: { not: excludeConversationId } } : {}),
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 4, // Last 4 messages per conversation for context
          select: {
            role: true,
            content: true,
          },
        },
      },
    });

    return conversations.map((conv) => ({
      title: conv.title,
      summary: conv.summary,
      lastMessages: conv.messages.reverse().map(
        (m) => `${m.role === 'user' ? 'User' : 'MindMate'}: ${m.content.slice(0, 150)}`
      ),
      createdAt: conv.createdAt,
    }));
  }

  /**
   * Generate auto-title from first user message
   */
  async generateTitle(conversationId: string): Promise<string> {
    const firstMessage = await prisma.message.findFirst({
      where: {
        conversationId,
        role: 'user',
      },
      orderBy: { createdAt: 'asc' },
    });

    if (!firstMessage) return 'Cuộc trò chuyện mới';

    // Truncate to 50 chars
    const title = firstMessage.content.slice(0, 50) + (firstMessage.content.length > 50 ? '...' : '');

    await this.updateConversation(conversationId, { title });

    return title;
  }
}

export const conversationService = new ConversationService();
