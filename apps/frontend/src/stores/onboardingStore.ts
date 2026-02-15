import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EmotionType } from '../types';

export type OnboardingStep = 'welcome' | 'grade' | 'mood' | 'concerns' | 'signup' | 'permission';

const STEPS: OnboardingStep[] = ['welcome', 'grade', 'mood', 'concerns', 'signup', 'permission'];

interface OnboardingState {
  hasCompleted: boolean;
  currentStep: OnboardingStep;
  selectedGrade: string | null;
  selectedMoods: EmotionType[];
  selectedConcerns: string[];

  // Actions
  nextStep: () => void;
  prevStep: () => void;
  setGrade: (grade: string) => void;
  toggleMood: (mood: EmotionType) => void;
  toggleConcern: (concern: string) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      hasCompleted: false,
      currentStep: 'welcome',
      selectedGrade: null,
      selectedMoods: [],
      selectedConcerns: [],

      nextStep: () => {
        const { currentStep } = get();
        const currentIndex = STEPS.indexOf(currentStep);
        if (currentIndex < STEPS.length - 1) {
          set({ currentStep: STEPS[currentIndex + 1] });
        }
      },

      prevStep: () => {
        const { currentStep } = get();
        const currentIndex = STEPS.indexOf(currentStep);
        if (currentIndex > 0) {
          set({ currentStep: STEPS[currentIndex - 1] });
        }
      },

      setGrade: (grade: string) => {
        set({ selectedGrade: grade });
      },

      toggleMood: (mood: EmotionType) => {
        const { selectedMoods } = get();
        if (selectedMoods.includes(mood)) {
          set({ selectedMoods: selectedMoods.filter(m => m !== mood) });
        } else {
          set({ selectedMoods: [...selectedMoods, mood] });
        }
      },

      toggleConcern: (concern: string) => {
        const { selectedConcerns } = get();
        if (selectedConcerns.includes(concern)) {
          set({ selectedConcerns: selectedConcerns.filter(c => c !== concern) });
        } else {
          set({ selectedConcerns: [...selectedConcerns, concern] });
        }
      },

      completeOnboarding: () => {
        set({ hasCompleted: true });
      },

      resetOnboarding: () => {
        set({
          hasCompleted: false,
          currentStep: 'welcome',
          selectedGrade: null,
          selectedMoods: [],
          selectedConcerns: [],
        });
      },
    }),
    {
      name: 'mindmate-onboarding',
      partialize: (state) => ({
        hasCompleted: state.hasCompleted,
        selectedGrade: state.selectedGrade,
      }),
    }
  )
);
