export interface VoiceChatRequest {
  conversationId?: string;
  audioBuffer?: Buffer;
  text?: string;
  userId?: string;
}

export interface VoiceChatResponse {
  conversationId: string;
  userTranscript: string;
  aiResponse: string;
  audioBuffer?: Buffer;
  audioUrl?: string;
  crisisLevel: CrisisLevel;
}

export type CrisisLevel = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ConversationContext {
  id: string;
  messages: Message[];
  createdAt: Date;
  lastMessageAt: Date;
}

export interface LLMRequest {
  messages: Message[];
  systemPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMResponse {
  content: string;
  tokensUsed?: number;
}

export interface TTSRequest {
  text: string;
  voiceId: string;
  stream?: boolean;
}

export interface STTRequest {
  audioBuffer: Buffer;
  language?: string;
}

export interface STTResponse {
  text: string;
  confidence?: number;
}
