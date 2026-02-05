import axios from 'axios';
import type { ApiResponse, VoiceChatResponse, Mood, MoodHistoryResponse, TodayMoodResponse, EmotionType } from '../types';

const API_BASE_URL = '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function sendTextMessage(
  text: string,
  conversationId?: string | null
): Promise<VoiceChatResponse> {
  const response = await api.post<ApiResponse<VoiceChatResponse>>('/chat/text', {
    text,
    conversationId,
  });

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Failed to send message');
  }

  return response.data.data;
}

export async function sendVoiceMessage(
  audioBlob: Blob,
  conversationId?: string | null
): Promise<VoiceChatResponse> {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm');
  if (conversationId) {
    formData.append('conversationId', conversationId);
  }

  const response = await api.post<ApiResponse<VoiceChatResponse>>('/chat/voice', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Failed to send voice message');
  }

  return response.data.data;
}

export async function getConversation(conversationId: string) {
  const response = await api.get(`/chat/${conversationId}`);
  return response.data;
}

export async function deleteConversation(conversationId: string) {
  const response = await api.delete(`/chat/${conversationId}`);
  return response.data;
}

export async function checkHealth() {
  const response = await api.get('/health');
  return response.data;
}

export async function getAgentSignedUrl(): Promise<string> {
  const response = await api.get<ApiResponse<{ signedUrl: string }>>('/chat/agent/signed-url');

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Failed to get signed URL');
  }

  return response.data.data.signedUrl;
}

// ============================================
// MOOD API
// ============================================

export async function createMood(
  emotions: EmotionType[],
  note?: string
): Promise<Mood> {
  const response = await api.post<ApiResponse<Mood>>('/mood', {
    emotions,
    note,
  });

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Không thể lưu mood');
  }

  return response.data.data;
}

export async function getMoodHistory(
  startDate?: string,
  endDate?: string,
  limit?: number
): Promise<MoodHistoryResponse> {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (limit) params.append('limit', limit.toString());

  const response = await api.get<ApiResponse<MoodHistoryResponse>>(`/mood?${params.toString()}`);

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Không thể tải lịch sử mood');
  }

  return response.data.data;
}

export async function getTodayMood(): Promise<TodayMoodResponse> {
  const response = await api.get<ApiResponse<TodayMoodResponse>>('/mood/today');

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Không thể kiểm tra mood hôm nay');
  }

  return response.data.data;
}

export async function getMoodStats(
  period: 'week' | 'month' | 'year' = 'month'
): Promise<any> {
  const response = await api.get<ApiResponse<any>>(`/mood/stats?period=${period}`);

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Không thể tải thống kê mood');
  }

  return response.data.data;
}
