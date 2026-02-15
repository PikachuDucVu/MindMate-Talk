import { create } from 'zustand';
import type { Message, CrisisLevel } from '../types';
import { sendTextMessage, getChatHistory, getConversationDetail, type ConversationSummary } from '../services/api';

interface ChatStore {
  conversationId: string | null;
  messages: Message[];
  isLoading: boolean;
  isRecording: boolean;
  crisisLevel: CrisisLevel;
  error: string | null;

  // History state
  conversations: ConversationSummary[];
  isLoadingHistory: boolean;
  showHistorySheet: boolean;

  // Actions
  sendMessage: (text: string) => Promise<void>;
  setRecording: (isRecording: boolean) => void;
  clearConversation: () => void;
  setError: (error: string | null) => void;

  // History actions
  fetchHistory: () => Promise<void>;
  loadConversation: (conversationId: string) => Promise<void>;
  setShowHistorySheet: (show: boolean) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  conversationId: null,
  messages: [],
  isLoading: false,
  isRecording: false,
  crisisLevel: 'NONE',
  error: null,

  // History state
  conversations: [],
  isLoadingHistory: false,
  showHistorySheet: false,

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

      // Refresh history after new message
      get().fetchHistory();
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

  // History actions
  fetchHistory: async () => {
    set({ isLoadingHistory: true });
    try {
      const data = await getChatHistory(20);
      set({
        conversations: data.conversations,
        isLoadingHistory: false,
      });
    } catch (error) {
      console.error('Failed to fetch history:', error);
      set({ isLoadingHistory: false });
    }
  },

  loadConversation: async (conversationId: string) => {
    set({ isLoading: true, error: null, showHistorySheet: false });
    try {
      const data = await getConversationDetail(conversationId);

      // Convert to Message format
      const messages: Message[] = data.messages.map((m, index) => ({
        id: `${m.role}-${index}-${Date.now()}`,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        timestamp: new Date(data.createdAt),
      }));

      set({
        conversationId: data.id,
        messages,
        isLoading: false,
        crisisLevel: 'NONE',
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Không thể tải cuộc trò chuyện',
      });
    }
  },

  setShowHistorySheet: (show: boolean) => set({ showHistorySheet: show }),
}));
