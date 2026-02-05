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

// Emotion display data
export const EMOTION_DATA: Record<EmotionType, { label: string; emoji: string }> = {
  HAPPY: { label: 'Vui vẻ', emoji: '😊' },
  CALM: { label: 'Bình yên', emoji: '😌' },
  NEUTRAL: { label: 'Ổn thôi', emoji: '😐' },
  TIRED: { label: 'Mệt mỏi', emoji: '😩' },
  ANXIOUS: { label: 'Lo lắng', emoji: '😰' },
  SAD: { label: 'Buồn', emoji: '😢' },
  CONFUSED: { label: 'Rối bời', emoji: '😵‍💫' },
  LONELY: { label: 'Cô đơn', emoji: '🥺' },
  NUMB: { label: 'Trống rỗng', emoji: '😶' },
  ANGRY: { label: 'Tức giận', emoji: '😤' },
  OVERWHELMED: { label: 'Quá tải', emoji: '🤯' },
};

export const ALL_EMOTIONS: EmotionType[] = [
  'HAPPY', 'CALM', 'NEUTRAL', 'TIRED', 'ANXIOUS',
  'SAD', 'CONFUSED', 'LONELY', 'NUMB', 'ANGRY', 'OVERWHELMED'
];

// Mood interfaces
export interface Mood {
  id: string;
  emotions: EmotionType[];
  note: string | null;
  recordedAt: Date | string;
  createdAt: Date | string;
}

export interface MoodStats {
  totalEntries: number;
  topEmotions: { emotion: EmotionType; count: number }[];
  streakDays: number;
}

export interface MoodHistoryResponse {
  moods: Mood[];
  summary: MoodStats;
}

export interface TodayMoodResponse {
  hasRecordedToday: boolean;
  mood: Mood | null;
}

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
