import { create } from 'zustand';
import type { Mood, EmotionType, MoodStats } from '../types';
import { createMood, getMoodHistory, getTodayMood, getMoodStats } from '../services/api';

interface MoodState {
  // State
  moods: Mood[];
  todayMood: Mood | null;
  hasRecordedToday: boolean;
  stats: MoodStats | null;
  isLoading: boolean;
  error: string | null;

  // UI State
  showMoodModal: boolean;
  selectedEmotions: EmotionType[];
  note: string;

  // Actions
  fetchTodayMood: () => Promise<void>;
  fetchMoodHistory: (days?: number) => Promise<void>;
  fetchMoodStats: (period?: 'week' | 'month' | 'year') => Promise<void>;
  saveMood: () => Promise<boolean>;

  // UI Actions
  openMoodModal: () => void;
  closeMoodModal: () => void;
  toggleEmotion: (emotion: EmotionType) => void;
  setNote: (note: string) => void;
  resetForm: () => void;
}

export const useMoodStore = create<MoodState>((set, get) => ({
  // Initial State
  moods: [],
  todayMood: null,
  hasRecordedToday: false,
  stats: null,
  isLoading: false,
  error: null,

  // UI State
  showMoodModal: false,
  selectedEmotions: [],
  note: '',

  // Actions
  fetchTodayMood: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await getTodayMood();
      set({
        todayMood: response.mood,
        hasRecordedToday: response.hasRecordedToday,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Có lỗi xảy ra',
        isLoading: false,
      });
    }
  },

  fetchMoodHistory: async (days = 30) => {
    try {
      set({ isLoading: true, error: null });
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

      const response = await getMoodHistory(startDate, endDate);
      set({
        moods: response.moods,
        stats: response.summary,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Có lỗi xảy ra',
        isLoading: false,
      });
    }
  },

  fetchMoodStats: async (period = 'month') => {
    try {
      set({ isLoading: true, error: null });
      const response = await getMoodStats(period);
      set({
        stats: response,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Có lỗi xảy ra',
        isLoading: false,
      });
    }
  },

  saveMood: async () => {
    const { selectedEmotions, note } = get();

    if (selectedEmotions.length === 0) {
      set({ error: 'Vui lòng chọn ít nhất 1 cảm xúc' });
      return false;
    }

    try {
      set({ isLoading: true, error: null });
      const mood = await createMood(selectedEmotions, note || undefined);

      set((state) => ({
        moods: [mood, ...state.moods],
        todayMood: mood,
        hasRecordedToday: true,
        isLoading: false,
        showMoodModal: false,
        selectedEmotions: [],
        note: '',
      }));

      return true;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Không thể lưu mood',
        isLoading: false,
      });
      return false;
    }
  },

  // UI Actions
  openMoodModal: () => set({ showMoodModal: true, error: null }),
  closeMoodModal: () => set({ showMoodModal: false, selectedEmotions: [], note: '', error: null }),

  toggleEmotion: (emotion) => {
    set((state) => {
      const isSelected = state.selectedEmotions.includes(emotion);

      if (isSelected) {
        return {
          selectedEmotions: state.selectedEmotions.filter((e) => e !== emotion),
        };
      }

      // Maximum 3 emotions
      if (state.selectedEmotions.length >= 3) {
        return { error: 'Chọn tối đa 3 cảm xúc' };
      }

      return {
        selectedEmotions: [...state.selectedEmotions, emotion],
        error: null,
      };
    });
  },

  setNote: (note) => set({ note }),
  resetForm: () => set({ selectedEmotions: [], note: '', error: null }),
}));

export default useMoodStore;
