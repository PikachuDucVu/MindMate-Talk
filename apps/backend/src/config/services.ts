// ElevenLabs TTS Configuration
export const elevenLabsConfig = {
  baseUrl: 'https://api.elevenlabs.io/v1',
  modelId: 'eleven_multilingual_v2', // Supports Vietnamese
  voiceSettings: {
    stability: 0.5,           // Natural variation
    similarity_boost: 0.75,   // Consistent but not robotic
    style: 0.3,               // Subtle expressiveness
    use_speaker_boost: true,  // Clearer pronunciation
  },
  outputFormat: 'mp3_44100_128',
  streaming: true,
};

// Custom LLM Configuration
export const llmConfig = {
  temperature: 0.7,
  maxTokens: 500,
};

// Whisper STT Configuration
export const whisperConfig = {
  baseUrl: 'https://api.openai.com/v1',
  model: 'whisper-1',
  language: 'vi',
};
