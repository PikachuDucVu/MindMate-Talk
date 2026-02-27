import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Generate device fingerprint
function generateDeviceId(): string {
  // Use existing ID from localStorage if available
  const existingId = localStorage.getItem('mindmate_device_id');
  if (existingId) return existingId;

  // Generate new unique ID
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  const id = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');

  localStorage.setItem('mindmate_device_id', id);
  return id;
}

export interface User {
  id: string;
  email: string | null;
  nickname: string | null;
  isGuest: boolean;
  grade: string;
  createdAt: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  guestLogin: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, nickname?: string) => Promise<void>;
  linkAccount: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { nickname?: string; grade?: string; preferVoice?: boolean; concerns?: string[] }) => Promise<void>;
  clearError: () => void;
}

const API_BASE = '/api/v1/auth';

async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error?.message || 'Có lỗi xảy ra');
  }

  return data.data;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isLoading: false,
      isInitialized: false,
      error: null,

      initialize: async () => {
        const { tokens } = get();

        // If no tokens, do guest login
        if (!tokens) {
          await get().guestLogin();
          set({ isInitialized: true });
          return;
        }

        // Verify existing token
        try {
          set({ isLoading: true });
          const data = await apiCall<{ user: User }>('/me', {}, tokens.accessToken);
          set({ user: data.user, isLoading: false, isInitialized: true });
        } catch {
          // Token expired, try refresh
          try {
            const refreshData = await apiCall<{ tokens: AuthTokens }>('/refresh', {
              method: 'POST',
              body: JSON.stringify({ refreshToken: tokens.refreshToken }),
            });

            const meData = await apiCall<{ user: User }>('/me', {}, refreshData.tokens.accessToken);

            set({
              tokens: refreshData.tokens,
              user: meData.user,
              isLoading: false,
              isInitialized: true,
            });
          } catch {
            // Refresh failed, do guest login
            await get().guestLogin();
            set({ isInitialized: true });
          }
        }
      },

      guestLogin: async () => {
        try {
          set({ isLoading: true, error: null });

          const deviceId = generateDeviceId();
          const data = await apiCall<{ user: User; tokens: AuthTokens }>('/guest', {
            method: 'POST',
            body: JSON.stringify({ deviceId }),
          });

          set({
            user: data.user,
            tokens: data.tokens,
            isLoading: false,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Không thể đăng nhập',
          });
        }
      },

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });

          const data = await apiCall<{ user: User; tokens: AuthTokens }>('/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
          });

          set({
            user: data.user,
            tokens: data.tokens,
            isLoading: false,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Đăng nhập thất bại',
          });
          throw error;
        }
      },

      register: async (email: string, password: string, nickname?: string) => {
        try {
          set({ isLoading: true, error: null });

          const { tokens } = get();
          const data = await apiCall<{ user: User; tokens: AuthTokens }>(
            '/register',
            {
              method: 'POST',
              body: JSON.stringify({ email, password, nickname }),
            },
            tokens?.accessToken
          );

          set({
            user: data.user,
            tokens: data.tokens,
            isLoading: false,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Đăng ký thất bại',
          });
          throw error;
        }
      },

      linkAccount: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });

          const { tokens } = get();
          if (!tokens) throw new Error('Vui lòng đăng nhập');

          const data = await apiCall<{ user: User; tokens: AuthTokens }>(
            '/link',
            {
              method: 'POST',
              body: JSON.stringify({ email, password }),
            },
            tokens.accessToken
          );

          set({
            user: data.user,
            tokens: data.tokens,
            isLoading: false,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Liên kết thất bại',
          });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('mindmate_device_id');
        set({
          user: null,
          tokens: null,
          error: null,
        });
        // Re-initialize as guest
        get().guestLogin();
      },

      updateProfile: async (data: { nickname?: string; grade?: string; preferVoice?: boolean; concerns?: string[] }) => {
        try {
          set({ isLoading: true, error: null });

          const { tokens } = get();
          if (!tokens) throw new Error('Vui lòng đăng nhập');

          const result = await apiCall<{ user: User }>(
            '/profile',
            {
              method: 'PATCH',
              body: JSON.stringify(data),
            },
            tokens.accessToken
          );

          set({
            user: result.user,
            isLoading: false,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Cập nhật thất bại',
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'mindmate-auth',
      partialize: (state) => ({
        tokens: state.tokens,
        user: state.user,
      }),
    }
  )
);

// Helper to get current access token
export function getAccessToken(): string | null {
  return useAuthStore.getState().tokens?.accessToken || null;
}
