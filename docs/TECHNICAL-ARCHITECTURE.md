# MindMate-Talk - Technical Architecture

> **Version**: 1.0 MVP
> **Last Updated**: 2025-01-27

---

## 1. System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MINDMATE-TALK ARCHITECTURE                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────┐     ┌─────────────────────────────────────────────────────────┐
│   Client    │     │                      Backend                            │
│  (React +   │     │                                                         │
│  WebView)   │     │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│             │────▶│  │   Node.js   │  │   Gemini    │  │ ElevenLabs  │     │
│  - Web App  │     │  │   Express   │  │     API     │  │    API      │     │
│  - PWA      │     │  └──────┬──────┘  └─────────────┘  └─────────────┘     │
│             │     │         │                                               │
└─────────────┘     │         ▼                                               │
                    │  ┌─────────────┐  ┌─────────────┐                       │
                    │  │ PostgreSQL  │  │    Redis    │                       │
                    │  │  (Primary)  │  │   (Cache)   │                       │
                    │  └─────────────┘  └─────────────┘                       │
                    └─────────────────────────────────────────────────────────┘
```

---

## 2. Tech Stack

### 2.1 Frontend

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | React 18 | UI library |
| **Build Tool** | Vite | Fast development & build |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **State** | Zustand | Lightweight state management |
| **Routing** | React Router v6 | Client-side routing |
| **HTTP Client** | Axios | API calls |
| **Audio** | Web Audio API | Voice recording/playback |
| **WebSocket** | Socket.io-client | Real-time communication |
| **PWA** | Vite PWA Plugin | Offline support, installable |

### 2.2 Backend

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Runtime** | Node.js 20 LTS | JavaScript runtime |
| **Framework** | Express.js | Web framework |
| **Language** | TypeScript | Type safety |
| **Validation** | Zod | Schema validation |
| **Auth** | JWT + bcrypt | Authentication |
| **ORM** | Prisma | Database access |
| **WebSocket** | Socket.io | Real-time events |
| **Queue** | BullMQ | Background jobs |

### 2.3 Database & Cache

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Primary DB** | PostgreSQL 15 | Persistent data storage |
| **Cache** | Redis 7 | Session, rate limiting, queue |

### 2.4 External Services

| Service | Provider | Purpose |
|---------|----------|---------|
| **LLM** | Google Gemini API | AI conversation |
| **TTS** | ElevenLabs API | Text-to-speech (Vietnamese) |
| **STT** | Whisper API / Google Cloud Speech | Speech-to-text |

### 2.5 Infrastructure (Production)

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Hosting** | Railway / Render / DigitalOcean | App hosting |
| **CDN** | Cloudflare | Static assets, DDoS protection |
| **Storage** | AWS S3 / Cloudflare R2 | Audio file storage (optional) |
| **Monitoring** | Sentry | Error tracking |
| **Analytics** | Mixpanel / PostHog | Usage analytics |

---

## 3. Architecture Patterns

### 3.1 Layered Architecture (Backend)

```
┌─────────────────────────────────────────────────────────────────┐
│                        API Layer (Routes)                        │
│   /api/auth  │  /api/chat  │  /api/mood  │  /api/user           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Service Layer (Business Logic)              │
│   AuthService │ ChatService │ MoodService │ UserService          │
│               │ AIService   │ VoiceService│                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Repository Layer (Data Access)              │
│   UserRepository │ ConversationRepository │ MoodRepository       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Database (PostgreSQL + Redis)               │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Project Structure

```
mindmate-talk/
├── client/                      # React Frontend
│   ├── public/
│   │   ├── manifest.json
│   │   └── icons/
│   ├── src/
│   │   ├── assets/              # Images, fonts
│   │   ├── components/          # Reusable UI components
│   │   │   ├── common/          # Button, Input, Modal...
│   │   │   ├── chat/            # Chat-specific components
│   │   │   ├── mood/            # Mood-related components
│   │   │   └── layout/          # Header, Footer, Navigation
│   │   ├── pages/               # Page components
│   │   │   ├── Home.tsx
│   │   │   ├── Chat.tsx
│   │   │   ├── MoodCheckin.tsx
│   │   │   ├── MoodHistory.tsx
│   │   │   ├── ChatHistory.tsx
│   │   │   ├── Profile.tsx
│   │   │   ├── Login.tsx
│   │   │   └── Onboarding.tsx
│   │   ├── hooks/               # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useVoiceRecorder.ts
│   │   │   ├── useAudioPlayer.ts
│   │   │   └── useSocket.ts
│   │   ├── services/            # API service calls
│   │   │   ├── api.ts
│   │   │   ├── authService.ts
│   │   │   ├── chatService.ts
│   │   │   └── moodService.ts
│   │   ├── stores/              # Zustand stores
│   │   │   ├── authStore.ts
│   │   │   ├── chatStore.ts
│   │   │   └── moodStore.ts
│   │   ├── types/               # TypeScript types
│   │   ├── utils/               # Helper functions
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                      # Node.js Backend
│   ├── src/
│   │   ├── config/              # Configuration
│   │   │   ├── database.ts
│   │   │   ├── redis.ts
│   │   │   └── env.ts
│   │   ├── controllers/         # Route handlers
│   │   │   ├── authController.ts
│   │   │   ├── chatController.ts
│   │   │   ├── moodController.ts
│   │   │   └── userController.ts
│   │   ├── services/            # Business logic
│   │   │   ├── authService.ts
│   │   │   ├── chatService.ts
│   │   │   ├── aiService.ts
│   │   │   ├── voiceService.ts
│   │   │   ├── moodService.ts
│   │   │   └── crisisService.ts
│   │   ├── repositories/        # Data access
│   │   │   ├── userRepository.ts
│   │   │   ├── conversationRepository.ts
│   │   │   └── moodRepository.ts
│   │   ├── middleware/          # Express middleware
│   │   │   ├── auth.ts
│   │   │   ├── errorHandler.ts
│   │   │   ├── rateLimiter.ts
│   │   │   └── validator.ts
│   │   ├── routes/              # API routes
│   │   │   ├── index.ts
│   │   │   ├── authRoutes.ts
│   │   │   ├── chatRoutes.ts
│   │   │   ├── moodRoutes.ts
│   │   │   └── userRoutes.ts
│   │   ├── socket/              # WebSocket handlers
│   │   │   ├── index.ts
│   │   │   └── chatSocket.ts
│   │   ├── prompts/             # AI prompts
│   │   │   ├── systemPrompt.ts
│   │   │   └── crisisPrompt.ts
│   │   ├── types/               # TypeScript types
│   │   ├── utils/               # Helper functions
│   │   └── app.ts               # Express app
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── tests/
│   ├── package.json
│   └── tsconfig.json
│
├── docs/                        # Documentation
├── docker-compose.yml           # Local development
├── .env.example
└── README.md
```

---

## 4. Core Components

### 4.1 Voice Chat Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          VOICE CHAT FLOW                                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────┐    Audio    ┌──────────┐    WebSocket    ┌──────────┐
│  User    │────Blob────▶│  Client  │────Stream──────▶│  Server  │
│  speaks  │             │  (React) │                 │ (Node.js)│
└──────────┘             └──────────┘                 └────┬─────┘
                                                           │
                         ┌─────────────────────────────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │   Speech-to-Text    │
              │  (Whisper/Google)   │
              └──────────┬──────────┘
                         │ Text
                         ▼
              ┌─────────────────────┐
              │    Gemini API       │
              │  (AI Processing)    │
              │  + Crisis Check     │
              └──────────┬──────────┘
                         │ AI Response Text
                         ▼
              ┌─────────────────────┐
              │   ElevenLabs TTS    │
              │  (Vietnamese Voice) │
              └──────────┬──────────┘
                         │ Audio Stream
                         ▼
┌──────────┐    Audio    ┌──────────┐    WebSocket    ┌──────────┐
│  User    │◀───Stream───│  Client  │◀───Stream──────│  Server  │
│  hears   │             │  (React) │                 │ (Node.js)│
└──────────┘             └──────────┘                 └──────────┘
```

### 4.2 Real-time Communication (Socket.io)

```typescript
// Socket Events

// Client → Server
'voice:start'          // User started recording
'voice:chunk'          // Audio chunk (streaming)
'voice:end'            // User stopped recording
'chat:message'         // Text message (fallback)

// Server → Client
'ai:thinking'          // AI is processing
'ai:response:start'    // AI response starting (for streaming)
'ai:response:chunk'    // Audio chunk (streaming TTS)
'ai:response:end'      // AI response complete
'ai:error'             // Error occurred
'crisis:detected'      // Crisis protocol triggered
```

### 4.3 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          AUTHENTICATION FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

SIGNUP:
┌──────────┐     POST /auth/signup      ┌──────────┐
│  Client  │───────────────────────────▶│  Server  │
│          │  {email, password, grade}  │          │
└──────────┘                            └────┬─────┘
                                             │
                        ┌────────────────────┘
                        ▼
              ┌─────────────────────┐
              │  Hash password      │
              │  Create user        │
              │  Generate JWT       │
              └──────────┬──────────┘
                         │
                         ▼
┌──────────┐     {token, user}          ┌──────────┐
│  Client  │◀───────────────────────────│  Server  │
│  Store   │                            │          │
│  token   │                            │          │
└──────────┘                            └──────────┘


PROTECTED REQUEST:
┌──────────┐     Authorization: Bearer <token>     ┌──────────┐
│  Client  │──────────────────────────────────────▶│  Server  │
└──────────┘                                       └────┬─────┘
                                                        │
                              ┌──────────────────────────┘
                              ▼
                    ┌─────────────────────┐
                    │  Verify JWT         │
                    │  Extract userId     │
                    │  Attach to request  │
                    └─────────────────────┘
```

### 4.4 AI Service Architecture

```typescript
// AIService.ts - Simplified structure

interface AIService {
  // Main conversation method
  processMessage(
    userId: string,
    message: string,
    conversationHistory: Message[]
  ): Promise<AIResponse>;

  // Crisis detection (runs in parallel)
  checkCrisisIndicators(message: string): Promise<CrisisLevel>;

  // Generate conversation summary (for history)
  summarizeConversation(messages: Message[]): Promise<string>;
}

interface AIResponse {
  text: string;
  crisisLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  suggestedTags: string[];
  shouldOfferHotline: boolean;
}
```

---

## 5. Security Architecture

### 5.1 Security Layers

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SECURITY LAYERS                                     │
└─────────────────────────────────────────────────────────────────────────────┘

Layer 1: Network
├── HTTPS only (TLS 1.3)
├── Cloudflare DDoS protection
└── Rate limiting (Redis-based)

Layer 2: Authentication
├── JWT with short expiry (15 min access, 7 day refresh)
├── Password hashing (bcrypt, cost 12)
├── Secure cookie settings (httpOnly, secure, sameSite)
└── Session invalidation on password change

Layer 3: Authorization
├── User can only access own data
├── Resource-level access control
└── No admin/guardian access to user conversations

Layer 4: Data Protection
├── Database encryption at rest
├── Sensitive fields encrypted (conversation content)
├── PII minimization (only collect what's needed)
└── Audit logging for data access

Layer 5: Input Validation
├── Zod schema validation
├── SQL injection prevention (Prisma parameterized queries)
├── XSS prevention (React's default escaping)
└── Content Security Policy headers
```

### 5.2 Data Encryption

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DATA ENCRYPTION                                     │
└─────────────────────────────────────────────────────────────────────────────┘

Encrypted Fields:
├── conversation.messages[] → AES-256-GCM
├── mood.note → AES-256-GCM
└── user.email → Searchable encryption (for login)

Key Management:
├── Master key in environment variable
├── Per-user derived keys for conversation data
└── Key rotation every 90 days

Encryption Flow:
┌──────────┐     plaintext     ┌──────────┐     ciphertext     ┌──────────┐
│  Service │───────────────────▶│ Crypto   │───────────────────▶│ Database │
│          │                    │ Utility  │                    │          │
└──────────┘                    └──────────┘                    └──────────┘
```

### 5.3 Rate Limiting Strategy

```typescript
// Rate limits per endpoint

const rateLimits = {
  // Auth endpoints (prevent brute force)
  'POST /auth/login': { window: '15m', max: 5 },
  'POST /auth/signup': { window: '1h', max: 3 },

  // Voice chat (expensive - API costs)
  'POST /chat/voice': { window: '1m', max: 10 },

  // Text chat (less expensive)
  'POST /chat/message': { window: '1m', max: 30 },

  // Mood endpoints
  'POST /mood': { window: '1h', max: 10 },

  // General API
  'default': { window: '1m', max: 100 }
};
```

---

## 6. Performance Considerations

### 6.1 Latency Optimization

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    VOICE CHAT LATENCY TARGETS                                │
└─────────────────────────────────────────────────────────────────────────────┘

Total target: < 2000ms (from user stops speaking to AI starts speaking)

Breakdown:
├── Audio upload + STT:     ~500ms  (stream processing)
├── Gemini API:             ~800ms  (use streaming response)
├── TTS generation:         ~500ms  (stream first chunk)
└── Network overhead:       ~200ms
                           ─────────
                Total:     ~2000ms

Optimizations:
1. WebSocket streaming (not HTTP polling)
2. Audio chunking (process while still speaking)
3. Gemini streaming response
4. ElevenLabs streaming TTS (play while generating)
5. Edge caching for static assets
```

### 6.2 Caching Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CACHING LAYERS                                      │
└─────────────────────────────────────────────────────────────────────────────┘

Redis Cache:
├── User session: 24 hours
├── Recent conversation context: 1 hour (for AI context window)
├── Rate limit counters: per-window expiry
└── AI response cache: DISABLED (conversations should be unique)

CDN Cache (Cloudflare):
├── Static assets: 1 year (with content hash)
├── API responses: NO CACHE (dynamic, private data)
└── PWA manifest: 1 day

Browser Cache:
├── Service Worker: offline-first for static assets
├── IndexedDB: draft messages, pending mood entries
└── LocalStorage: auth token, user preferences
```

### 6.3 Database Optimization

```sql
-- Key Indexes

-- Fast user lookup
CREATE INDEX idx_users_email ON users(email);

-- Conversation queries
CREATE INDEX idx_conversations_user_created
  ON conversations(user_id, created_at DESC);

-- Mood history queries
CREATE INDEX idx_moods_user_date
  ON moods(user_id, recorded_at DESC);

-- Message search within conversation
CREATE INDEX idx_messages_conversation
  ON messages(conversation_id, created_at);
```

---

## 7. External API Integration

### 7.1 Google Gemini API

```typescript
// Gemini Configuration

const geminiConfig = {
  model: 'gemini-1.5-pro',  // or 'gemini-1.5-flash' for speed
  temperature: 0.7,          // Balanced creativity
  maxOutputTokens: 500,      // Keep responses concise
  safetySettings: [
    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }, // For crisis handling
  ],
  systemInstruction: MINDMATE_PERSONA_PROMPT  // See AI-PERSONA.md
};
```

### 7.2 ElevenLabs API

```typescript
// ElevenLabs Configuration

const elevenLabsConfig = {
  voiceId: 'YOUR_VIETNAMESE_VOICE_ID',  // Custom or premade Vietnamese voice
  modelId: 'eleven_multilingual_v2',     // Supports Vietnamese
  voiceSettings: {
    stability: 0.5,        // Natural variation
    similarityBoost: 0.75, // Consistent but not robotic
    style: 0.3,            // Subtle expressiveness
    speakerBoost: true     // Clearer pronunciation
  },
  outputFormat: 'mp3_44100_128',  // Good quality, reasonable size
  streaming: true                  // Stream audio chunks
};
```

### 7.3 Speech-to-Text (Options)

```typescript
// Option A: OpenAI Whisper API
const whisperConfig = {
  model: 'whisper-1',
  language: 'vi',
  responseFormat: 'json'
};

// Option B: Google Cloud Speech-to-Text
const googleSTTConfig = {
  encoding: 'WEBM_OPUS',
  sampleRateHertz: 48000,
  languageCode: 'vi-VN',
  enableAutomaticPunctuation: true,
  model: 'latest_long'
};

// Recommendation: Start with Whisper for simplicity,
// switch to Google STT if Vietnamese accuracy is an issue
```

---

## 8. Deployment Architecture

### 8.1 Development Environment

```yaml
# docker-compose.yml

version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: mindmate
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### 8.2 Production Environment

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      PRODUCTION ARCHITECTURE                                 │
└─────────────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────┐
                    │   Cloudflare    │
                    │   (CDN + WAF)   │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
    ┌─────────────────┐          ┌─────────────────┐
    │  Static Assets  │          │   API Server    │
    │  (Cloudflare    │          │  (Railway/      │
    │   Pages)        │          │   Render)       │
    └─────────────────┘          └────────┬────────┘
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    │                     │                     │
                    ▼                     ▼                     ▼
          ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
          │   PostgreSQL    │   │     Redis       │   │   External      │
          │   (Managed -    │   │   (Managed -    │   │   APIs          │
          │    Supabase/    │   │    Upstash)     │   │   (Gemini,      │
          │    Neon)        │   │                 │   │    ElevenLabs)  │
          └─────────────────┘   └─────────────────┘   └─────────────────┘
```

### 8.3 Environment Variables

```bash
# .env.example

# Server
NODE_ENV=production
PORT=3000
API_URL=https://api.mindmate-talk.com

# Database
DATABASE_URL=postgresql://user:pass@host:5432/mindmate

# Redis
REDIS_URL=redis://default:pass@host:6379

# Auth
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Encryption
ENCRYPTION_KEY=your-32-byte-encryption-key

# Google Gemini
GEMINI_API_KEY=your-gemini-api-key

# ElevenLabs
ELEVENLABS_API_KEY=your-elevenlabs-api-key
ELEVENLABS_VOICE_ID=your-voice-id

# Speech-to-Text (choose one)
WHISPER_API_KEY=your-openai-key
# or
GOOGLE_CLOUD_CREDENTIALS=path/to/credentials.json

# Monitoring
SENTRY_DSN=your-sentry-dsn
```

---

## 9. Monitoring & Observability

### 9.1 Key Metrics to Track

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          MONITORING METRICS                                  │
└─────────────────────────────────────────────────────────────────────────────┘

Application Metrics:
├── API response time (p50, p95, p99)
├── Voice chat latency (end-to-end)
├── Error rate by endpoint
├── Active WebSocket connections
└── Queue depth (BullMQ)

Business Metrics:
├── DAU/MAU
├── Sessions per user
├── Avg conversation duration
├── Mood check-in rate
├── Crisis detection events
└── Hotline referrals

Infrastructure Metrics:
├── CPU/Memory usage
├── Database connection pool
├── Redis memory usage
├── API quota usage (Gemini, ElevenLabs)
└── Bandwidth consumption
```

### 9.2 Alerting Rules

```yaml
# Critical Alerts (PagerDuty/Slack)
- name: High Error Rate
  condition: error_rate > 5% for 5 minutes
  severity: critical

- name: Voice Chat Latency
  condition: p95_latency > 3000ms for 5 minutes
  severity: warning

- name: Database Connection Pool Exhausted
  condition: available_connections < 5
  severity: critical

- name: API Quota Near Limit
  condition: api_usage > 80% of quota
  severity: warning

- name: Crisis Event
  condition: crisis_level == 'CRITICAL'
  severity: info  # For audit, not technical alert
```

---

## 10. Future Considerations (Post-MVP)

### 10.1 Scalability Path

```
Phase 1 (MVP):
- Single server, vertical scaling
- Managed PostgreSQL (Supabase/Neon)
- Managed Redis (Upstash)

Phase 2 (1000+ DAU):
- Horizontal scaling (load balancer)
- Read replicas for database
- CDN for all static assets

Phase 3 (10000+ DAU):
- Microservices (separate voice processing)
- Dedicated AI inference service
- Regional deployment for latency
```

### 10.2 Feature Toggles

```typescript
// Feature flags for gradual rollout

const features = {
  voiceEmotionDetection: false,  // Detect emotion from voice tone
  aiSentimentAnalysis: true,     // Analyze text sentiment
  offlineMode: false,            // Offline-first PWA
  multiLanguage: false,          // Beyond Vietnamese
  groupChat: false,              // Peer support groups
};
```
