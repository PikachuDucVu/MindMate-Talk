import { create } from 'zustand';
import type { Message, CrisisLevel } from '../types';
import { sendTextMessage } from '../services/api';

interface ChatStore {
  conversationId: string | null;
  messages: Message[];
  isLoading: boolean;
  isRecording: boolean;
  crisisLevel: CrisisLevel;
  error: string | null;

  // Actions
  sendMessage: (text: string) => Promise<void>;
  setRecording: (isRecording: boolean) => void;
  clearConversation: () => void;
  setError: (error: string | null) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  conversationId: null,
  messages: [],
  isLoading: false,
  isRecording: false,
  crisisLevel: 'NONE',
  error: null,

  sendMessage: async (text: string) => {
    const { conversationId, messages } = get();

    // Add user message immediately
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    set({
      messages: [...messages, userMessage],
      isLoading: true,
      error: null,
    });

    try {
      const response = await sendTextMessage(text, conversationId);

      // Add AI response
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response.aiResponse,
        audioUrl: response.audioUrl,
        timestamp: new Date(),
      };

      set((state) => ({
        conversationId: response.conversationId,
        messages: [...state.messages, aiMessage],
        isLoading: false,
        crisisLevel: response.crisisLevel,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Có lỗi xảy ra',
      });
    }
  },

  setRecording: (isRecording: boolean) => set({ isRecording }),

  clearConversation: () =>
    set({
      conversationId: null,
      messages: [],
      crisisLevel: 'NONE',
      error: null,
    }),

  setError: (error: string | null) => set({ error }),
}));
