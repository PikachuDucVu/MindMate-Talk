# MindMate-Talk

> AI Voice Chat Companion for Vietnamese Students

## Project Structure

```
mindmate-talk/
├── apps/
│   ├── backend/          # Node.js Express API
│   └── frontend/         # React Web App (coming soon)
├── packages/
│   ├── shared/           # Shared types and utilities
│   └── database/         # Prisma schema (coming soon)
├── docs/                 # Documentation
├── turbo.json           # Turborepo config
└── package.json         # Root package.json
```

## Quick Start

### Prerequisites

- Node.js 20+
- npm 10+

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Fill in your API keys in .env
```

### Environment Variables

```env
# Custom LLM API (required)
LLM_API_URL=https://your-llm-api-url
LLM_API_KEY=your-api-key
LLM_MODEL=your-model-name

# ElevenLabs TTS (required)
ELEVENLABS_API_KEY=your-elevenlabs-key
ELEVENLABS_VOICE_ID=your-voice-id

# Whisper STT (optional, for voice input)
WHISPER_API_KEY=your-openai-key
```

### Development

```bash
# Start backend server
npm run dev:backend

# Run all tests
npm run test:backend

# Run integration tests (requires running server)
cd apps/backend && npm run test:voice
```

## API Endpoints

### Text Chat

```http
POST /api/v1/chat/text
Content-Type: application/json

{
  "text": "Xin chào, mình muốn nói chuyện",
  "conversationId": "optional-existing-id"
}
```

### Voice Chat

```http
POST /api/v1/chat/voice
Content-Type: multipart/form-data

audio: <audio-file>
conversationId: optional-existing-id
```

### Get Conversation

```http
GET /api/v1/chat/:conversationId
```

### Delete Conversation

```http
DELETE /api/v1/chat/:conversationId
```

## Architecture

```
Voice Chat Flow:
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Audio   │───▶│   STT    │───▶│   LLM    │───▶│   TTS    │
│  Input   │    │ (Whisper)│    │ (Custom) │    │(Elevenlabs)│
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                                     │
                              ┌──────┴──────┐
                              │   Crisis    │
                              │  Detection  │
                              └─────────────┘
```

## Features

- **Voice Chat**: Real-time voice-to-voice conversation
- **Text Chat**: Text-based chat as fallback
- **Crisis Detection**: Automatic detection of mental health crisis indicators
- **AI Companion**: Trained as a friendly companion, not a therapist
- **Vietnamese Support**: Full Vietnamese language support

## License

Private - All rights reserved
