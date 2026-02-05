import axios from 'axios';
import FormData from 'form-data';
import { env } from '../config/env.js';
import { whisperConfig } from '../config/services.js';
import type { STTRequest, STTResponse } from '../types/index.js';

export class STTService {
  private apiKey: string | undefined;
  private baseUrl: string;

  constructor() {
    this.apiKey = env.WHISPER_API_KEY;
    this.baseUrl = whisperConfig.baseUrl;
  }

  /**
   * Transcribe audio to text using Whisper API
   */
  async transcribe(request: STTRequest): Promise<STTResponse> {
    if (!this.apiKey) {
      throw new Error('WHISPER_API_KEY is not configured');
    }

    const formData = new FormData();
    formData.append('file', request.audioBuffer, {
      filename: 'audio.webm',
      contentType: 'audio/webm',
    });
    formData.append('model', whisperConfig.model);
    formData.append('language', request.language ?? whisperConfig.language);
    formData.append('response_format', 'json');

    try {
      const response = await axios.post(
        `${this.baseUrl}/audio/transcriptions`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            ...formData.getHeaders(),
          },
          timeout: 30000,
        }
      );

      return {
        text: response.data.text,
        confidence: response.data.confidence,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Whisper STT Error:', error.response?.data ?? error.message);
        throw new Error(`STT Error: ${error.response?.status} - ${error.message}`);
      }
      throw error;
    }
  }
}

export const sttService = new STTService();
