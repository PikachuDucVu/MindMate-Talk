export type CrisisLevel = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type EmotionType =
  | 'HAPPY'
  | 'CALM'
  | 'NEUTRAL'
  | 'TIRED'
  | 'ANXIOUS'
  | 'SAD'
  | 'CONFUSED'
  | 'LONELY'
  | 'NUMB'
  | 'ANGRY'
  | 'OVERWHELMED';

export type Grade =
  | 'GRADE_6_7'
  | 'GRADE_8_9'
  | 'GRADE_10_11'
  | 'GRADE_12'
  | 'GRADUATED';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  contentType: 'TEXT' | 'VOICE';
  audioUrl?: string;
  audioDuration?: number;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  title?: string;
  summary?: string;
  tags: string[];
  messages: Message[];
  startedAt: Date;
  endedAt?: Date;
}

export interface VoiceChatResponse {
  conversationId: string;
  userTranscript: string;
  aiResponse: string;
  audioUrl?: string;
  crisisLevel: CrisisLevel;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId: string;
  };
}
