export type CrisisLevel = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  audioUrl?: string;
  timestamp: Date;
  isPlaying?: boolean;
}

export interface ChatState {
  conversationId: string | null;
  messages: Message[];
  isLoading: boolean;
  isRecording: boolean;
  isPlaying: boolean;
  crisisLevel: CrisisLevel;
  error: string | null;
}

export interface VoiceChatResponse {
  conversationId: string;
  userTranscript: string;
  aiResponse: string;
  audioUrl?: string;
  crisisLevel: CrisisLevel;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
