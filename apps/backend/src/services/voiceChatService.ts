import { v4 as uuidv4 } from 'uuid';
import { llmService } from './llmService.js';
import { ttsService } from './ttsService.js';
import { sttService } from './sttService.js';
import { crisisService, type CrisisAssessment } from './crisisService.js';
import { MINDMATE_SYSTEM_PROMPT, getContextualPrompt } from '../prompts/systemPrompt.js';
import type {
  VoiceChatRequest,
  VoiceChatResponse,
  Message,
  ConversationContext,
  CrisisLevel,
} from '../types/index.js';

// In-memory conversation store (replace with Redis/DB in production)
const conversationStore = new Map<string, ConversationContext>();

export class VoiceChatService {
  /**
   * Process a complete voice chat request
   * Audio → STT → LLM → TTS → Audio
   */
  async processVoiceChat(request: VoiceChatRequest): Promise<VoiceChatResponse> {
    const conversationId = request.conversationId || uuidv4();

    // Get or create conversation context
    let context = conversationStore.get(conversationId);
    if (!context) {
      context = {
        id: conversationId,
        messages: [],
        createdAt: new Date(),
        lastMessageAt: new Date(),
      };
      conversationStore.set(conversationId, context);
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

    // Step 3: Add user message to context
    context.messages.push({
      role: 'user',
      content: userText,
    });
    context.lastMessageAt = new Date();

    // Step 4: Build system prompt with crisis context
    let systemPrompt = MINDMATE_SYSTEM_PROMPT;
    systemPrompt += getContextualPrompt();
    systemPrompt += crisisService.getCrisisPromptAddition(crisisAssessment.level);

    // Step 5: Generate AI response
    const llmResponse = await llmService.generateResponse({
      messages: context.messages,
      systemPrompt,
    });

    // Step 6: Add AI response to context
    context.messages.push({
      role: 'assistant',
      content: llmResponse.content,
    });

    // Limit conversation history to last 20 messages
    if (context.messages.length > 20) {
      context.messages = context.messages.slice(-20);
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
    const conversationId = request.conversationId || uuidv4();

    // Get or create conversation context
    let context = conversationStore.get(conversationId);
    if (!context) {
      context = {
        id: conversationId,
        messages: [],
        createdAt: new Date(),
        lastMessageAt: new Date(),
      };
      conversationStore.set(conversationId, context);
    }

    if (!request.text) {
      throw new Error('Text must be provided');
    }

    // Crisis Assessment
    const crisisAssessment = crisisService.assessMessage(request.text);

    // Add user message
    context.messages.push({
      role: 'user',
      content: request.text,
    });
    context.lastMessageAt = new Date();

    // Build system prompt
    let systemPrompt = MINDMATE_SYSTEM_PROMPT;
    systemPrompt += getContextualPrompt();
    systemPrompt += crisisService.getCrisisPromptAddition(crisisAssessment.level);

    // Generate response
    const llmResponse = await llmService.generateResponse({
      messages: context.messages,
      systemPrompt,
    });

    // Add AI response
    context.messages.push({
      role: 'assistant',
      content: llmResponse.content,
    });

    // Limit history
    if (context.messages.length > 20) {
      context.messages = context.messages.slice(-20);
    }

    return {
      conversationId,
      userTranscript: request.text,
      aiResponse: llmResponse.content,
      crisisLevel: crisisAssessment.level,
    };
  }

  /**
   * Get conversation history
   */
  getConversation(conversationId: string): ConversationContext | undefined {
    return conversationStore.get(conversationId);
  }

  /**
   * Clear conversation
   */
  clearConversation(conversationId: string): boolean {
    return conversationStore.delete(conversationId);
  }

  /**
   * Get all active conversations (for debugging)
   */
  getAllConversations(): ConversationContext[] {
    return Array.from(conversationStore.values());
  }
}

export const voiceChatService = new VoiceChatService();
