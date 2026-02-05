# MindMate-Talk - API Specification

> **Version**: 1.0 MVP
> **Last Updated**: 2025-01-27
> **Base URL**: `https://api.mindmate-talk.com/v1`

---

## 1. Overview

### 1.1 Base Configuration

```
Base URL: /api/v1
Content-Type: application/json
Authentication: Bearer Token (JWT)
```

### 1.2 Response Format

```typescript
// Success Response
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2025-01-27T10:30:00Z",
    "requestId": "req_abc123"
  }
}

// Error Response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": { ... }
  },
  "meta": {
    "timestamp": "2025-01-27T10:30:00Z",
    "requestId": "req_abc123"
  }
}
```

### 1.3 Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | No permission to access resource |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## 2. Authentication Endpoints

### 2.1 Register

```http
POST /auth/register
```

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "grade": "GRADE_10_11"
}
```

**Validation:**
- `email`: Required, valid email format
- `password`: Required, min 8 characters
- `grade`: Required, one of: `GRADE_6_7`, `GRADE_8_9`, `GRADE_10_11`, `GRADE_12`, `GRADUATED`

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_abc123",
      "email": "user@example.com",
      "grade": "GRADE_10_11",
      "createdAt": "2025-01-27T10:30:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 900
    }
  }
}
```

---

### 2.2 Login

```http
POST /auth/login
```

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_abc123",
      "email": "user@example.com",
      "grade": "GRADE_10_11",
      "nickname": null,
      "preferVoice": true,
      "moodReminder": true,
      "reminderTime": "20:00"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 900
    }
  }
}
```

**Error (401):**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Email hoặc mật khẩu không đúng"
  }
}
```

---

### 2.3 Refresh Token

```http
POST /auth/refresh
```

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 900
  }
}
```

---

### 2.4 Logout

```http
POST /auth/logout
Authorization: Bearer <accessToken>
```

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Đăng xuất thành công"
  }
}
```

---

### 2.5 Change Password

```http
PUT /auth/password
Authorization: Bearer <accessToken>
```

**Request:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Đổi mật khẩu thành công"
  }
}
```

---

## 3. User Endpoints

### 3.1 Get Current User

```http
GET /users/me
Authorization: Bearer <accessToken>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "user_abc123",
    "email": "user@example.com",
    "grade": "GRADE_10_11",
    "nickname": "Minh",
    "preferVoice": true,
    "moodReminder": true,
    "reminderTime": "20:00",
    "createdAt": "2025-01-27T10:30:00Z",
    "stats": {
      "totalConversations": 15,
      "totalMoodCheckins": 30,
      "streakDays": 5
    }
  }
}
```

---

### 3.2 Update User Profile

```http
PATCH /users/me
Authorization: Bearer <accessToken>
```

**Request:**
```json
{
  "nickname": "Minh",
  "grade": "GRADE_12",
  "preferVoice": false,
  "moodReminder": true,
  "reminderTime": "21:00"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "user_abc123",
    "email": "user@example.com",
    "grade": "GRADE_12",
    "nickname": "Minh",
    "preferVoice": false,
    "moodReminder": true,
    "reminderTime": "21:00"
  }
}
```

---

### 3.3 Export User Data

```http
GET /users/me/export
Authorization: Bearer <accessToken>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "exportedAt": "2025-01-27T10:30:00Z",
    "user": { ... },
    "conversations": [ ... ],
    "moods": [ ... ]
  }
}
```

---

### 3.4 Delete User Account

```http
DELETE /users/me
Authorization: Bearer <accessToken>
```

**Request:**
```json
{
  "password": "currentPassword123",
  "confirmation": "DELETE"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Tài khoản đã được xóa",
    "deletedAt": "2025-01-27T10:30:00Z"
  }
}
```

---

## 4. Conversation Endpoints

### 4.1 List Conversations

```http
GET /conversations
Authorization: Bearer <accessToken>
```

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page (max 50) |
| `search` | string | - | Search in content/title |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "conv_abc123",
        "title": "Lo lắng về kỳ thi",
        "summary": "Cuộc trò chuyện về áp lực học tập và kỳ thi sắp tới...",
        "tags": ["học tập", "stress"],
        "startedAt": "2025-01-27T14:30:00Z",
        "endedAt": "2025-01-27T14:45:00Z",
        "messageCount": 12,
        "lastMessageAt": "2025-01-27T14:45:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalItems": 45,
      "totalPages": 3
    }
  }
}
```

---

### 4.2 Get Conversation Detail

```http
GET /conversations/:id
Authorization: Bearer <accessToken>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "conv_abc123",
    "title": "Lo lắng về kỳ thi",
    "summary": "Cuộc trò chuyện về áp lực học tập...",
    "tags": ["học tập", "stress"],
    "startedAt": "2025-01-27T14:30:00Z",
    "endedAt": "2025-01-27T14:45:00Z",
    "messages": [
      {
        "id": "msg_001",
        "role": "USER",
        "content": "Mình đang lo lắng về kỳ thi sắp tới...",
        "contentType": "VOICE",
        "audioUrl": "https://storage.../audio/msg_001.mp3",
        "audioDuration": 8,
        "createdAt": "2025-01-27T14:30:00Z"
      },
      {
        "id": "msg_002",
        "role": "ASSISTANT",
        "content": "Mình hiểu. Kỳ thi thường mang lại nhiều áp lực...",
        "contentType": "TEXT",
        "createdAt": "2025-01-27T14:30:15Z"
      }
    ]
  }
}
```

---

### 4.3 Create Conversation

```http
POST /conversations
Authorization: Bearer <accessToken>
```

**Request:**
```json
{
  "message": "Xin chào, mình muốn nói chuyện",
  "contentType": "TEXT"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "conv_xyz789",
    "messages": [
      {
        "id": "msg_001",
        "role": "USER",
        "content": "Xin chào, mình muốn nói chuyện",
        "createdAt": "2025-01-27T15:00:00Z"
      }
    ],
    "createdAt": "2025-01-27T15:00:00Z"
  }
}
```

---

### 4.4 Send Message (Text)

```http
POST /conversations/:id/messages
Authorization: Bearer <accessToken>
```

**Request:**
```json
{
  "content": "Mình đang cảm thấy lo lắng",
  "contentType": "TEXT"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "userMessage": {
      "id": "msg_003",
      "role": "USER",
      "content": "Mình đang cảm thấy lo lắng",
      "createdAt": "2025-01-27T15:01:00Z"
    },
    "aiResponse": {
      "id": "msg_004",
      "role": "ASSISTANT",
      "content": "Mình hiểu bạn đang lo lắng. Bạn có thể chia sẻ thêm về điều gì khiến bạn lo không?",
      "createdAt": "2025-01-27T15:01:02Z"
    },
    "crisisLevel": "NONE"
  }
}
```

---

### 4.5 Delete Conversation

```http
DELETE /conversations/:id
Authorization: Bearer <accessToken>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Cuộc trò chuyện đã được xóa"
  }
}
```

---

## 5. Voice Chat Endpoints

### 5.1 Send Voice Message

```http
POST /conversations/:id/voice
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data
```

**Request (Form Data):**
| Field | Type | Description |
|-------|------|-------------|
| `audio` | file | Audio file (webm, mp3, wav) |
| `duration` | number | Duration in seconds |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "userMessage": {
      "id": "msg_005",
      "role": "USER",
      "content": "Transcribed text from audio...",
      "contentType": "VOICE",
      "audioUrl": "https://storage.../audio/msg_005.webm",
      "audioDuration": 5,
      "createdAt": "2025-01-27T15:05:00Z"
    },
    "aiResponse": {
      "id": "msg_006",
      "role": "ASSISTANT",
      "content": "AI response text...",
      "audioUrl": "https://storage.../audio/msg_006.mp3",
      "audioDuration": 8,
      "createdAt": "2025-01-27T15:05:03Z"
    },
    "crisisLevel": "NONE"
  }
}
```

---

### 5.2 Get Audio Stream (TTS)

```http
GET /audio/:messageId
Authorization: Bearer <accessToken>
```

**Response:**
- Content-Type: `audio/mpeg`
- Streams audio file

---

## 6. Mood Endpoints

### 6.1 Record Mood

```http
POST /moods
Authorization: Bearer <accessToken>
```

**Request:**
```json
{
  "emotions": ["ANXIOUS", "TIRED"],
  "note": "Sắp thi học kỳ, nhiều bài quá"
}
```

**Validation:**
- `emotions`: Required, array of 1-3 valid emotion types
- `note`: Optional, max 500 characters

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "mood_abc123",
    "emotions": ["ANXIOUS", "TIRED"],
    "note": "Sắp thi học kỳ, nhiều bài quá",
    "recordedAt": "2025-01-27T20:00:00Z"
  }
}
```

---

### 6.2 Get Mood History

```http
GET /moods
Authorization: Bearer <accessToken>
```

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `startDate` | ISO date | 30 days ago | Start of date range |
| `endDate` | ISO date | today | End of date range |
| `limit` | number | 30 | Max items to return |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "moods": [
      {
        "id": "mood_abc123",
        "emotions": ["ANXIOUS", "TIRED"],
        "note": "Sắp thi học kỳ",
        "recordedAt": "2025-01-27T20:00:00Z"
      },
      {
        "id": "mood_abc122",
        "emotions": ["CALM"],
        "note": null,
        "recordedAt": "2025-01-26T20:00:00Z"
      }
    ],
    "summary": {
      "totalEntries": 25,
      "topEmotions": [
        { "emotion": "ANXIOUS", "count": 8 },
        { "emotion": "CALM", "count": 6 },
        { "emotion": "TIRED", "count": 5 }
      ],
      "streakDays": 5
    }
  }
}
```

---

### 6.3 Get Today's Mood

```http
GET /moods/today
Authorization: Bearer <accessToken>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "hasRecordedToday": true,
    "mood": {
      "id": "mood_abc123",
      "emotions": ["ANXIOUS", "TIRED"],
      "note": "Sắp thi học kỳ",
      "recordedAt": "2025-01-27T20:00:00Z"
    }
  }
}
```

**Response (if not recorded):**
```json
{
  "success": true,
  "data": {
    "hasRecordedToday": false,
    "mood": null
  }
}
```

---

### 6.4 Get Mood Statistics

```http
GET /moods/stats
Authorization: Bearer <accessToken>
```

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `period` | string | "month" | "week", "month", "year" |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "period": "month",
    "startDate": "2025-01-01",
    "endDate": "2025-01-27",
    "totalEntries": 25,
    "distribution": {
      "HAPPY": 3,
      "CALM": 6,
      "NEUTRAL": 4,
      "TIRED": 5,
      "ANXIOUS": 8,
      "SAD": 2,
      "CONFUSED": 1,
      "LONELY": 0,
      "NUMB": 0,
      "ANGRY": 1,
      "OVERWHELMED": 3
    },
    "trend": [
      { "date": "2025-01-27", "dominantEmotion": "ANXIOUS" },
      { "date": "2025-01-26", "dominantEmotion": "CALM" },
      { "date": "2025-01-25", "dominantEmotion": "HAPPY" }
    ],
    "streakDays": 5
  }
}
```

---

## 7. Crisis Endpoints (Internal Use)

### 7.1 Report Hotline Click

```http
POST /crisis/hotline-clicked
Authorization: Bearer <accessToken>
```

**Request:**
```json
{
  "crisisEventId": "crisis_abc123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Recorded"
  }
}
```

---

## 8. WebSocket Events

### 8.1 Connection

```javascript
// Connect with auth token
const socket = io('wss://api.mindmate-talk.com', {
  auth: {
    token: 'Bearer <accessToken>'
  }
});
```

### 8.2 Client → Server Events

```typescript
// Start voice recording
socket.emit('voice:start', {
  conversationId: 'conv_abc123'
});

// Send audio chunk (streaming)
socket.emit('voice:chunk', {
  conversationId: 'conv_abc123',
  chunk: ArrayBuffer, // Audio data
  sequence: 1
});

// End voice recording
socket.emit('voice:end', {
  conversationId: 'conv_abc123',
  totalChunks: 5
});

// Send text message (fallback)
socket.emit('chat:message', {
  conversationId: 'conv_abc123',
  content: 'Hello'
});
```

### 8.3 Server → Client Events

```typescript
// AI is processing
socket.on('ai:thinking', () => {
  // Show loading indicator
});

// AI response starting (for streaming)
socket.on('ai:response:start', (data) => {
  // data: { messageId: 'msg_006' }
});

// AI audio chunk (streaming TTS)
socket.on('ai:response:chunk', (data) => {
  // data: { chunk: ArrayBuffer, sequence: 1 }
  // Play audio chunk
});

// AI response complete
socket.on('ai:response:end', (data) => {
  // data: { messageId: 'msg_006', content: '...', crisisLevel: 'NONE' }
});

// Error occurred
socket.on('ai:error', (data) => {
  // data: { code: 'PROCESSING_ERROR', message: '...' }
});

// Crisis detected
socket.on('crisis:detected', (data) => {
  // data: { level: 'HIGH', showHotline: true }
  // Show appropriate UI
});
```

---

## 9. Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `POST /auth/login` | 5 requests | 15 minutes |
| `POST /auth/register` | 3 requests | 1 hour |
| `POST /conversations/:id/voice` | 10 requests | 1 minute |
| `POST /conversations/:id/messages` | 30 requests | 1 minute |
| `POST /moods` | 10 requests | 1 hour |
| All other endpoints | 100 requests | 1 minute |

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1706354400
```

**Rate Limit Exceeded Response (429):**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Quá nhiều yêu cầu. Vui lòng thử lại sau.",
    "retryAfter": 60
  }
}
```

---

## 10. API Versioning

- Current version: `v1`
- Version is included in URL: `/api/v1/...`
- Breaking changes will create new version: `/api/v2/...`
- Deprecated versions will be announced 6 months before removal
