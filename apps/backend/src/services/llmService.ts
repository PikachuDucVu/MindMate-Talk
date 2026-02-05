import axios from 'axios';
import { env } from '../config/env.js';
import { llmConfig } from '../config/services.js';
import type { LLMRequest, LLMResponse, Message } from '../types/index.js';

export class LLMService {
  private apiUrl: string;
  private apiKey: string;
  private model: string;

  constructor() {
    this.apiUrl = env.LLM_API_URL || '';
    this.apiKey = env.LLM_API_KEY || '';
    this.model = env.LLM_MODEL || '';
  }

  async generateResponse(request: LLMRequest): Promise<LLMResponse> {
    // Return mock response if LLM not configured
    if (!this.apiUrl || !this.apiKey) {
      console.warn('LLM not configured, returning mock response');
      return {
        content: '[LLM not configured] Xin chào! Mình là MindMate.',
        tokensUsed: 0,
      };
    }

    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: request.systemPrompt },
      ...request.messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    ];

    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          messages,
          temperature: request.temperature ?? llmConfig.temperature,
          max_tokens: request.maxTokens ?? llmConfig.maxTokens,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      // Handle OpenAI-compatible response format
      const content = response.data.choices?.[0]?.message?.content
        ?? response.data.content
        ?? response.data.text
        ?? '';

      const tokensUsed = response.data.usage?.total_tokens
        ?? response.data.tokens_used;

      return {
        content: content.trim(),
        tokensUsed,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('LLM API Error:', error.response?.data ?? error.message);
        throw new Error(`LLM API Error: ${error.response?.status} - ${error.message}`);
      }
      throw error;
    }
  }

  async generateStreamingResponse(
    request: LLMRequest,
    onChunk: (text: string) => void
  ): Promise<LLMResponse> {
    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: request.systemPrompt },
      ...request.messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    ];

    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          messages,
          temperature: request.temperature ?? llmConfig.temperature,
          max_tokens: request.maxTokens ?? llmConfig.maxTokens,
          stream: true,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          responseType: 'stream',
          timeout: 60000,
        }
      );

      let fullContent = '';

      return new Promise((resolve, reject) => {
        response.data.on('data', (chunk: Buffer) => {
          const lines = chunk.toString().split('\n').filter(line => line.trim());

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content ?? '';
                if (content) {
                  fullContent += content;
                  onChunk(content);
                }
              } catch {
                // Ignore parse errors for incomplete chunks
              }
            }
          }
        });

        response.data.on('end', () => {
          resolve({ content: fullContent });
        });

        response.data.on('error', reject);
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('LLM Streaming Error:', error.response?.data ?? error.message);
        throw new Error(`LLM API Error: ${error.response?.status} - ${error.message}`);
      }
      throw error;
    }
  }
}

export const llmService = new LLMService();
