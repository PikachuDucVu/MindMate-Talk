# MindMate-Talk - Database Schema

> **Version**: 1.0 MVP
> **Last Updated**: 2025-01-27
> **Database**: PostgreSQL 15

---

## 1. Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ENTITY RELATIONSHIP DIAGRAM                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     users       │       │  conversations  │       │    messages     │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id              │──┐    │ id              │──┐    │ id              │
│ email           │  │    │ user_id         │  │    │ conversation_id │
│ password_hash   │  └───▶│ title           │  └───▶│ role            │
│ grade           │       │ summary         │       │ content         │
│ created_at      │       │ tags            │       │ audio_url       │
│ updated_at      │       │ created_at      │       │ created_at      │
└─────────────────┘       │ updated_at      │       └─────────────────┘
        │                 └─────────────────┘
        │
        │         ┌─────────────────┐       ┌─────────────────┐
        │         │     moods       │       │  mood_emotions  │
        │         ├─────────────────┤       ├─────────────────┤
        └────────▶│ id              │──────▶│ id              │
                  │ user_id         │       │ mood_id         │
                  │ note            │       │ emotion_type    │
                  │ recorded_at     │       └─────────────────┘
                  │ created_at      │
                  └─────────────────┘

        │         ┌─────────────────┐
        │         │ crisis_events   │
        │         ├─────────────────┤
        └────────▶│ id              │
                  │ user_id         │
                  │ conversation_id │
                  │ level           │
                  │ trigger_content │
                  │ ai_response     │
                  │ hotline_shown   │
                  │ created_at      │
                  └─────────────────┘
```

---

## 2. Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// USER
// ============================================

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String    @map("password_hash")

  // Profile
  grade         Grade     @default(GRADE_10_11)
  nickname      String?   // Optional display name

  // Preferences
  preferVoice   Boolean   @default(true) @map("prefer_voice")
  moodReminder  Boolean   @default(true) @map("mood_reminder")
  reminderTime  String?   @default("20:00") @map("reminder_time") // HH:mm format

  // Timestamps
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  lastActiveAt  DateTime? @map("last_active_at")

  // Relations
  conversations Conversation[]
  moods         Mood[]
  crisisEvents  CrisisEvent[]
  refreshTokens RefreshToken[]

  @@map("users")
}

enum Grade {
  GRADE_6_7
  GRADE_8_9
  GRADE_10_11
  GRADE_12
  GRADUATED
}

// ============================================
// REFRESH TOKEN (for JWT refresh)
// ============================================

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String   @map("user_id")
  expiresAt DateTime @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("refresh_tokens")
}

// ============================================
// CONVERSATION
// ============================================

model Conversation {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")

  // Metadata
  title     String?  // Auto-generated from first message or AI summary
  summary   String?  // AI-generated summary of conversation
  tags      String[] // AI-detected topics: ["học tập", "stress", "gia đình"]

  // Duration tracking
  startedAt DateTime @default(now()) @map("started_at")
  endedAt   DateTime? @map("ended_at")

  // Timestamps
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // Relations
  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages     Message[]
  crisisEvents CrisisEvent[]

  @@index([userId, createdAt(sort: Desc)])
  @@map("conversations")
}

// ============================================
// MESSAGE
// ============================================

model Message {
  id             String   @id @default(cuid())
  conversationId String   @map("conversation_id")

  // Content
  role           MessageRole
  content        String      // Text content (encrypted in production)
  contentType    ContentType @default(TEXT) @map("content_type")

  // Audio (optional)
  audioUrl       String?     @map("audio_url")  // S3/R2 URL if voice message
  audioDuration  Int?        @map("audio_duration") // Duration in seconds

  // AI metadata (for AI messages only)
  tokensUsed     Int?        @map("tokens_used")
  modelVersion   String?     @map("model_version")

  // Timestamps
  createdAt      DateTime    @default(now()) @map("created_at")

  // Relations
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  @@index([conversationId, createdAt])
  @@map("messages")
}

enum MessageRole {
  USER
  ASSISTANT
  SYSTEM  // For system messages like crisis protocol triggers
}

enum ContentType {
  TEXT
  VOICE
}

// ============================================
// MOOD
// ============================================

model Mood {
  id         String   @id @default(cuid())
  userId     String   @map("user_id")

  // Mood data
  note       String?  // Optional user note (encrypted)

  // When was this mood recorded
  recordedAt DateTime @default(now()) @map("recorded_at")

  // Timestamps
  createdAt  DateTime @default(now()) @map("created_at")

  // Relations
  user       User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  emotions   MoodEmotion[]

  @@index([userId, recordedAt(sort: Desc)])
  @@map("moods")
}

// ============================================
// MOOD EMOTION (Many-to-Many: Mood can have 1-3 emotions)
// ============================================

model MoodEmotion {
  id          String      @id @default(cuid())
  moodId      String      @map("mood_id")
  emotionType EmotionType @map("emotion_type")

  // Relations
  mood        Mood        @relation(fields: [moodId], references: [id], onDelete: Cascade)

  @@unique([moodId, emotionType])
  @@map("mood_emotions")
}

enum EmotionType {
  HAPPY       // Vui vẻ 😊
  CALM        // Bình yên 😌
  NEUTRAL     // Ổn thôi 😐
  TIRED       // Mệt mỏi 😩
  ANXIOUS     // Lo lắng 😰
  SAD         // Buồn 😢
  CONFUSED    // Rối bời 😵‍💫
  LONELY      // Cô đơn 🥺
  NUMB        // Trống rỗng 😶
  ANGRY       // Tức giận 😤
  OVERWHELMED // Quá tải 🤯
}

// ============================================
// CRISIS EVENT (for safety monitoring & improvement)
// ============================================

model CrisisEvent {
  id             String      @id @default(cuid())
  userId         String      @map("user_id")
  conversationId String?     @map("conversation_id")

  // Crisis details
  level          CrisisLevel
  triggerContent String      @map("trigger_content") // What triggered the detection
  aiResponse     String      @map("ai_response")     // How AI responded

  // User actions
  hotlineShown   Boolean     @default(false) @map("hotline_shown")
  hotlineClicked Boolean     @default(false) @map("hotline_clicked")

  // Resolution
  resolved       Boolean     @default(false)
  resolvedAt     DateTime?   @map("resolved_at")

  // Timestamps
  createdAt      DateTime    @default(now()) @map("created_at")

  // Relations
  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  conversation   Conversation? @relation(fields: [conversationId], references: [id], onDelete: SetNull)

  @@index([userId, createdAt(sort: Desc)])
  @@index([level, createdAt(sort: Desc)])
  @@map("crisis_events")
}

enum CrisisLevel {
  LOW       // Mild distress, normal support
  MEDIUM    // Moderate concern, enhanced support
  HIGH      // Serious concern, offer hotline
  CRITICAL  // Immediate danger, prioritize hotline
}
```

---

## 3. Raw SQL Schema (Reference)

```sql
-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE "Grade" AS ENUM (
  'GRADE_6_7',
  'GRADE_8_9',
  'GRADE_10_11',
  'GRADE_12',
  'GRADUATED'
);

CREATE TYPE "MessageRole" AS ENUM (
  'USER',
  'ASSISTANT',
  'SYSTEM'
);

CREATE TYPE "ContentType" AS ENUM (
  'TEXT',
  'VOICE'
);

CREATE TYPE "EmotionType" AS ENUM (
  'HAPPY',
  'CALM',
  'NEUTRAL',
  'TIRED',
  'ANXIOUS',
  'SAD',
  'CONFUSED',
  'LONELY',
  'NUMB',
  'ANGRY',
  'OVERWHELMED'
);

CREATE TYPE "CrisisLevel" AS ENUM (
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL'
);

-- ============================================
-- TABLES
-- ============================================

CREATE TABLE users (
  id VARCHAR(25) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  grade "Grade" DEFAULT 'GRADE_10_11',
  nickname VARCHAR(50),
  prefer_voice BOOLEAN DEFAULT true,
  mood_reminder BOOLEAN DEFAULT true,
  reminder_time VARCHAR(5) DEFAULT '20:00',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_active_at TIMESTAMP
);

CREATE TABLE refresh_tokens (
  id VARCHAR(25) PRIMARY KEY,
  token VARCHAR(255) UNIQUE NOT NULL,
  user_id VARCHAR(25) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE conversations (
  id VARCHAR(25) PRIMARY KEY,
  user_id VARCHAR(25) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  summary TEXT,
  tags TEXT[],
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
  id VARCHAR(25) PRIMARY KEY,
  conversation_id VARCHAR(25) NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role "MessageRole" NOT NULL,
  content TEXT NOT NULL,
  content_type "ContentType" DEFAULT 'TEXT',
  audio_url VARCHAR(500),
  audio_duration INTEGER,
  tokens_used INTEGER,
  model_version VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE moods (
  id VARCHAR(25) PRIMARY KEY,
  user_id VARCHAR(25) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  note TEXT,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mood_emotions (
  id VARCHAR(25) PRIMARY KEY,
  mood_id VARCHAR(25) NOT NULL REFERENCES moods(id) ON DELETE CASCADE,
  emotion_type "EmotionType" NOT NULL,
  UNIQUE(mood_id, emotion_type)
);

CREATE TABLE crisis_events (
  id VARCHAR(25) PRIMARY KEY,
  user_id VARCHAR(25) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  conversation_id VARCHAR(25) REFERENCES conversations(id) ON DELETE SET NULL,
  level "CrisisLevel" NOT NULL,
  trigger_content TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  hotline_shown BOOLEAN DEFAULT false,
  hotline_clicked BOOLEAN DEFAULT false,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_conversations_user_created ON conversations(user_id, created_at DESC);
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at);
CREATE INDEX idx_moods_user_recorded ON moods(user_id, recorded_at DESC);
CREATE INDEX idx_crisis_events_user_created ON crisis_events(user_id, created_at DESC);
CREATE INDEX idx_crisis_events_level_created ON crisis_events(level, created_at DESC);
```

---

## 4. Data Models (TypeScript)

```typescript
// types/database.ts

// ============================================
// USER
// ============================================

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  grade: Grade;
  nickname: string | null;
  preferVoice: boolean;
  moodReminder: boolean;
  reminderTime: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt: Date | null;
}

export type Grade =
  | 'GRADE_6_7'
  | 'GRADE_8_9'
  | 'GRADE_10_11'
  | 'GRADE_12'
  | 'GRADUATED';

export interface UserPublic {
  id: string;
  email: string;
  grade: Grade;
  nickname: string | null;
  preferVoice: boolean;
  moodReminder: boolean;
  reminderTime: string | null;
  createdAt: Date;
}

// ============================================
// CONVERSATION
// ============================================

export interface Conversation {
  id: string;
  userId: string;
  title: string | null;
  summary: string | null;
  tags: string[];
  startedAt: Date;
  endedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[];
}

export interface ConversationPreview {
  id: string;
  title: string | null;
  summary: string | null;
  tags: string[];
  startedAt: Date;
  endedAt: Date | null;
  messageCount: number;
  lastMessageAt: Date;
}

// ============================================
// MESSAGE
// ============================================

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  contentType: ContentType;
  audioUrl: string | null;
  audioDuration: number | null;
  tokensUsed: number | null;
  modelVersion: string | null;
  createdAt: Date;
}

export type MessageRole = 'USER' | 'ASSISTANT' | 'SYSTEM';
export type ContentType = 'TEXT' | 'VOICE';

// ============================================
// MOOD
// ============================================

export interface Mood {
  id: string;
  userId: string;
  note: string | null;
  recordedAt: Date;
  createdAt: Date;
}

export interface MoodWithEmotions extends Mood {
  emotions: EmotionType[];
}

export type EmotionType =
  | 'HAPPY'
  | 'CALM'
  | 'NEUTRAL'
  | 'TIRED'
  | 'ANXIOUS'
  | 'SAD'
  | 'CONFUSED'
  | 'LONELY'
  | 'NUMB'
  | 'ANGRY'
  | 'OVERWHELMED';

export const EMOTION_LABELS: Record<EmotionType, string> = {
  HAPPY: 'Vui vẻ',
  CALM: 'Bình yên',
  NEUTRAL: 'Ổn thôi',
  TIRED: 'Mệt mỏi',
  ANXIOUS: 'Lo lắng',
  SAD: 'Buồn',
  CONFUSED: 'Rối bời',
  LONELY: 'Cô đơn',
  NUMB: 'Trống rỗng',
  ANGRY: 'Tức giận',
  OVERWHELMED: 'Quá tải',
};

export const EMOTION_EMOJIS: Record<EmotionType, string> = {
  HAPPY: '😊',
  CALM: '😌',
  NEUTRAL: '😐',
  TIRED: '😩',
  ANXIOUS: '😰',
  SAD: '😢',
  CONFUSED: '😵‍💫',
  LONELY: '🥺',
  NUMB: '😶',
  ANGRY: '😤',
  OVERWHELMED: '🤯',
};

// ============================================
// CRISIS EVENT
// ============================================

export interface CrisisEvent {
  id: string;
  userId: string;
  conversationId: string | null;
  level: CrisisLevel;
  triggerContent: string;
  aiResponse: string;
  hotlineShown: boolean;
  hotlineClicked: boolean;
  resolved: boolean;
  resolvedAt: Date | null;
  createdAt: Date;
}

export type CrisisLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
```

---

## 5. Sample Queries

### 5.1 Common Read Queries

```typescript
// Get user's recent conversations with preview
const getRecentConversations = async (userId: string, limit = 10) => {
  return prisma.conversation.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      _count: {
        select: { messages: true }
      }
    }
  });
};

// Get mood history for a date range
const getMoodHistory = async (
  userId: string,
  startDate: Date,
  endDate: Date
) => {
  return prisma.mood.findMany({
    where: {
      userId,
      recordedAt: {
        gte: startDate,
        lte: endDate,
      }
    },
    orderBy: { recordedAt: 'desc' },
    include: {
      emotions: true
    }
  });
};

// Get full conversation with all messages
const getConversationWithMessages = async (
  conversationId: string,
  userId: string
) => {
  return prisma.conversation.findFirst({
    where: {
      id: conversationId,
      userId // Security: ensure user owns this conversation
    },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' }
      }
    }
  });
};
```

### 5.2 Common Write Queries

```typescript
// Create new conversation with first message
const createConversation = async (
  userId: string,
  firstMessage: string,
  contentType: ContentType = 'TEXT'
) => {
  return prisma.conversation.create({
    data: {
      userId,
      messages: {
        create: {
          role: 'USER',
          content: firstMessage,
          contentType,
        }
      }
    },
    include: {
      messages: true
    }
  });
};

// Add message to conversation
const addMessage = async (
  conversationId: string,
  role: MessageRole,
  content: string,
  options?: {
    contentType?: ContentType;
    audioUrl?: string;
    audioDuration?: number;
    tokensUsed?: number;
    modelVersion?: string;
  }
) => {
  return prisma.message.create({
    data: {
      conversationId,
      role,
      content,
      ...options
    }
  });
};

// Record mood with emotions
const recordMood = async (
  userId: string,
  emotions: EmotionType[],
  note?: string
) => {
  return prisma.mood.create({
    data: {
      userId,
      note,
      emotions: {
        create: emotions.map(emotionType => ({ emotionType }))
      }
    },
    include: {
      emotions: true
    }
  });
};

// Log crisis event
const logCrisisEvent = async (
  userId: string,
  conversationId: string,
  level: CrisisLevel,
  triggerContent: string,
  aiResponse: string
) => {
  return prisma.crisisEvent.create({
    data: {
      userId,
      conversationId,
      level,
      triggerContent,
      aiResponse,
    }
  });
};
```

### 5.3 Analytics Queries

```typescript
// Get mood distribution for a user
const getMoodDistribution = async (userId: string, days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return prisma.$queryRaw`
    SELECT
      me.emotion_type,
      COUNT(*) as count
    FROM moods m
    JOIN mood_emotions me ON m.id = me.mood_id
    WHERE m.user_id = ${userId}
      AND m.recorded_at >= ${startDate}
    GROUP BY me.emotion_type
    ORDER BY count DESC
  `;
};

// Get conversation stats
const getConversationStats = async (userId: string) => {
  return prisma.conversation.aggregate({
    where: { userId },
    _count: true,
    _avg: {
      // This would need a computed field, shown for illustration
    }
  });
};
```

---

## 6. Data Retention & Privacy

### 6.1 Retention Policy

```typescript
// Scheduled job: Clean up old data

const retentionPolicy = {
  // Conversations: Keep for 1 year, then delete
  conversations: 365, // days

  // Moods: Keep for 2 years (for trend analysis)
  moods: 730, // days

  // Crisis events: Keep for 5 years (legal requirement)
  crisisEvents: 1825, // days

  // Refresh tokens: Auto-expire after 7 days
  refreshTokens: 7, // days
};

const cleanupOldData = async () => {
  const now = new Date();

  // Delete old conversations
  const convoCutoff = new Date(now);
  convoCutoff.setDate(convoCutoff.getDate() - retentionPolicy.conversations);

  await prisma.conversation.deleteMany({
    where: {
      createdAt: { lt: convoCutoff }
    }
  });

  // Delete expired refresh tokens
  await prisma.refreshToken.deleteMany({
    where: {
      expiresAt: { lt: now }
    }
  });
};
```

### 6.2 User Data Export

```typescript
// Export all user data (GDPR compliance)
const exportUserData = async (userId: string) => {
  const [user, conversations, moods, crisisEvents] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        grade: true,
        nickname: true,
        preferVoice: true,
        moodReminder: true,
        reminderTime: true,
        createdAt: true,
      }
    }),
    prisma.conversation.findMany({
      where: { userId },
      include: { messages: true }
    }),
    prisma.mood.findMany({
      where: { userId },
      include: { emotions: true }
    }),
    prisma.crisisEvent.findMany({
      where: { userId }
    })
  ]);

  return {
    exportedAt: new Date().toISOString(),
    user,
    conversations,
    moods,
    crisisEvents
  };
};
```

### 6.3 User Data Deletion

```typescript
// Delete all user data (right to be forgotten)
const deleteUserData = async (userId: string) => {
  // Prisma cascade will handle related records
  await prisma.user.delete({
    where: { id: userId }
  });

  return { success: true, deletedAt: new Date().toISOString() };
};
```

---

## 7. Migration Strategy

### 7.1 Initial Migration

```bash
# Generate Prisma client
npx prisma generate

# Create initial migration
npx prisma migrate dev --name init

# Apply to production
npx prisma migrate deploy
```

### 7.2 Schema Changes

```bash
# After modifying schema.prisma
npx prisma migrate dev --name add_new_field

# Generate updated client
npx prisma generate
```

### 7.3 Seed Data (Development)

```typescript
// prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create test user
  const passwordHash = await hash('testpassword123', 12);

  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      passwordHash,
      grade: 'GRADE_10_11',
      nickname: 'TestUser',
    }
  });

  // Create sample conversation
  await prisma.conversation.create({
    data: {
      userId: user.id,
      title: 'Cuộc trò chuyện đầu tiên',
      messages: {
        create: [
          {
            role: 'USER',
            content: 'Xin chào, mình muốn nói chuyện',
          },
          {
            role: 'ASSISTANT',
            content: 'Chào bạn! Mình là MindMate. Bạn muốn chia sẻ điều gì hôm nay?',
          }
        ]
      }
    }
  });

  // Create sample mood
  await prisma.mood.create({
    data: {
      userId: user.id,
      note: 'Hôm nay cảm thấy ổn',
      emotions: {
        create: [
          { emotionType: 'CALM' },
          { emotionType: 'NEUTRAL' }
        ]
      }
    }
  });

  console.log('Seed completed');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```
