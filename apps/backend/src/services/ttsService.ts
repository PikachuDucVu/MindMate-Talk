import axios from 'axios';
import { env } from '../config/env.js';
import { elevenLabsConfig } from '../config/services.js';
import type { TTSRequest } from '../types/index.js';

export class TTSService {
  private apiKey: string;
  private voiceId: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = env.ELEVENLABS_API_KEY;
    this.voiceId = env.ELEVENLABS_VOICE_ID;
    this.baseUrl = elevenLabsConfig.baseUrl;
  }

  /**
   * Generate speech audio from text (non-streaming)
   */
  async textToSpeech(request: TTSRequest): Promise<Buffer> {
    const voiceId = request.voiceId || this.voiceId;

    try {
      const response = await axios.post(
        `${this.baseUrl}/text-to-speech/${voiceId}`,
        {
          text: request.text,
          model_id: elevenLabsConfig.modelId,
          voice_settings: elevenLabsConfig.voiceSettings,
        },
        {
          headers: {
            'xi-api-key': this.apiKey,
            'Content-Type': 'application/json',
            'Accept': 'audio/mpeg',
          },
          responseType: 'arraybuffer',
          timeout: 30000,
        }
      );

      return Buffer.from(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('ElevenLabs TTS Error:', error.response?.data ?? error.message);
        throw new Error(`TTS Error: ${error.response?.status} - ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Generate speech audio with streaming
   */
  async textToSpeechStream(
    request: TTSRequest,
    onChunk: (chunk: Buffer) => void
  ): Promise<void> {
    const voiceId = request.voiceId || this.voiceId;

    try {
      const response = await axios.post(
        `${this.baseUrl}/text-to-speech/${voiceId}/stream`,
        {
          text: request.text,
          model_id: elevenLabsConfig.modelId,
          voice_settings: elevenLabsConfig.voiceSettings,
        },
        {
          headers: {
            'xi-api-key': this.apiKey,
            'Content-Type': 'application/json',
            'Accept': 'audio/mpeg',
          },
          responseType: 'stream',
          timeout: 60000,
        }
      );

      return new Promise((resolve, reject) => {
        response.data.on('data', (chunk: Buffer) => {
          onChunk(chunk);
        });

        response.data.on('end', () => {
          resolve();
        });

        response.data.on('error', (error: Error) => {
          reject(error);
        });
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('ElevenLabs Stream Error:', error.response?.data ?? error.message);
        throw new Error(`TTS Stream Error: ${error.response?.status} - ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get available voices
   */
  async getVoices(): Promise<Array<{ voice_id: string; name: string }>> {
    try {
      const response = await axios.get(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      return response.data.voices;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('ElevenLabs Voices Error:', error.response?.data ?? error.message);
        throw new Error(`Voices Error: ${error.response?.status} - ${error.message}`);
      }
      throw error;
    }
  }
}

export const ttsService = new TTSService();
