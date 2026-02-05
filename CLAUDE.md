# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MindMate-Talk is an AI Voice Chat Companion for Vietnamese students. It's a Turborepo monorepo with a Node.js/Express backend and React/Vite frontend.

## Setup

```bash
npm install
cp .env.example .env     # Then fill in API keys
```

Required environment variables: `LLM_API_URL`, `LLM_API_KEY`, `LLM_MODEL`, `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`. All env vars are validated in `apps/backend/src/config/env.ts`.

## Commands

### Development
```bash
npm run dev              # Run all apps (Turbo)
npm run dev:backend      # Backend only
npm run dev:frontend     # Frontend only
```

### Testing
```bash
npm run test             # Run all tests
npm run test:backend     # Backend tests only
cd apps/backend && npm run test:voice  # Voice integration tests (requires running server)
cd apps/backend && npm run test:api    # API tests

# Run single test file
cd apps/backend && npx vitest run tests/crisis.test.ts

# Run tests in watch mode
cd apps/backend && npm run test:watch
```

### Build & Lint
```bash
npm run build            # Build all
npm run lint             # Lint all
```

## Architecture

```
Voice Chat Flow:
Audio Input → Whisper (STT) → Custom LLM → ElevenLabs (TTS)
                                   ↓
                            Crisis Detection
```

### Backend (`apps/backend/src/`)
- `services/` - Core logic: `llmService.ts` (LLM API), `sttService.ts` (Whisper), `ttsService.ts` (ElevenLabs), `crisisService.ts`, `voiceChatService.ts`
- `prompts/systemPrompt.ts` - AI persona and behavior rules
- `controllers/chatController.ts` - Request handlers for chat endpoints
- `routes/chatRoutes.ts` - API route definitions
- `config/env.ts` - Environment variable validation with Zod (all env vars must be defined here)
- `middleware/` - Error handling, request ID

### Frontend (`apps/frontend/src/`)
- `stores/chatStore.ts` - Zustand state management
- `hooks/` - `useVoiceRecorder.ts`, `useAudioPlayer.ts`
- `components/chat/` - Message, ChatInput, MessageList, VoiceWave
- `components/layout/` - Header, Disclaimer
- `pages/ChatPage.tsx` - Main chat page
- `services/api.ts` - Backend API client

### Shared (`packages/shared/`)
- Shared TypeScript types and constants

## Code Conventions

- **TypeScript** throughout the monorepo
- **Backend imports**: Use `.js` extension (e.g., `import { x } from './y.js'`)
- **Input validation**: Use Zod schemas
- **Error handling**: Use central `errorHandler` middleware
- **Frontend styling**: Tailwind CSS
- **State management**: Zustand

## API Endpoints

- `POST /api/v1/chat/text` - Text chat
- `POST /api/v1/chat/voice` - Voice chat (multipart/form-data with audio file)
- `GET /api/v1/chat/:conversationId` - Get conversation
- `DELETE /api/v1/chat/:conversationId` - Delete conversation

## AI Persona

MindMate is a supportive companion (NOT a therapist/doctor):
- Vietnamese language, informal tone ("mình"/"bạn")
- Keep responses short (2-4 sentences) for natural voice chat
- Crisis detection integrated into LLM flow
