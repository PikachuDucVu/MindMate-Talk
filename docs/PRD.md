# MindMate-Talk - Product Requirements Document (PRD)

> **Version**: 1.0 MVP
> **Last Updated**: 2025-01-27
> **Status**: Draft

---

## 1. Tổng quan sản phẩm

### 1.1 Vision Statement
MindMate-Talk là ứng dụng đồng hành sức khỏe tâm lý dành cho học sinh THCS-THPT, sử dụng AI voice chat để tạo không gian an toàn, riêng tư cho các em chia sẻ và được lắng nghe.

### 1.2 Problem Statement
- **70%** học sinh Việt Nam từng trải qua stress học tập nhưng không biết chia sẻ cùng ai
- Rào cản tâm lý khi nói chuyện với người lớn (sợ bị đánh giá, không được hiểu)
- Thiếu tiếp cận dịch vụ tâm lý chuyên nghiệp (chi phí, địa lý, thời gian)
- Học sinh cần được lắng nghe ngay lập tức, không phải đặt lịch hẹn

### 1.3 Solution
Một người bạn AI **luôn sẵn sàng 24/7**, giao tiếp bằng **giọng nói tự nhiên**, với persona **trẻ trung, thân thiện như anh/chị** - không phán xét, không báo cáo ai.

---

## 2. Đối tượng người dùng

### 2.1 Primary Persona: Học sinh THCS-THPT

| Attribute | Detail |
|-----------|--------|
| **Độ tuổi** | 12-18 tuổi |
| **Cấp học** | Lớp 6 - Lớp 12 |
| **Pain points** | Stress thi cử, áp lực gia đình, bắt nạt, tình cảm, định hướng tương lai, cô đơn |
| **Behavior** | Quen dùng smartphone, thích voice message hơn gõ văn bản dài |
| **Privacy concern** | CỰC KỲ CAO - không muốn bố mẹ/thầy cô biết |

### 2.2 User Segments

```
┌─────────────────────────────────────────────────────────┐
│  Segment A: Stress nhẹ (60%)                            │
│  - Cần chia sẻ, xả stress hàng ngày                     │
│  - Tần suất: 2-3 lần/tuần                               │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  Segment B: Vấn đề cụ thể (30%)                         │
│  - Đang đối mặt khó khăn: bắt nạt, gia đình, tình cảm   │
│  - Tần suất: hàng ngày trong giai đoạn khó khăn         │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  Segment C: Khủng hoảng (10%)                           │
│  - Trạng thái nguy hiểm: trầm cảm nặng, tự hại          │
│  - Cần được de-escalate và kết nối chuyên gia           │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Nguyên tắc thiết kế cốt lõi

### 3.1 Privacy First
- **KHÔNG** báo cáo cho bất kỳ ai (phụ huynh, nhà trường)
- **KHÔNG** có chế độ Guardian/Giám sát
- Dữ liệu thuộc về user, user có quyền xóa bất cứ lúc nào
- Mã hóa end-to-end cho conversation

### 3.2 Trust Building
- AI là "Companion" (bạn đồng hành) - KHÔNG phải "Bác sĩ" hay "Chuyên gia"
- Disclaimer rõ ràng: AI hỗ trợ tinh thần, không thay thế điều trị y tế
- Giọng điệu: Trẻ trung, thân thiện, không lên lớp

### 3.3 Accessibility
- Onboarding tối giản - vào chat trong <30 giây
- Voice-first nhưng vẫn hỗ trợ text
- Hoạt động tốt trên mạng 3G/4G

### 3.4 Safety Net
- Crisis detection thông minh
- De-escalation protocol trước khi suggest hotline
- Hotline là OPTION, không phải ép buộc

---

## 4. Tính năng MVP

### 4.1 Feature Priority Matrix

| Feature | Priority | Effort | Description |
|---------|----------|--------|-------------|
| Voice Chat với AI | P0 | High | Core feature - realtime voice conversation |
| Onboarding tối giản | P0 | Low | Chỉ hỏi tuổi → vào chat ngay |
| Auth (Email/Password) | P0 | Medium | Đăng ký/đăng nhập cơ bản |
| Mood Check-in | P1 | Medium | Chọn từ khóa cảm xúc (chips) |
| Mood History | P1 | Medium | Xem lại trend cảm xúc |
| Chat History | P1 | Medium | Xem lại các cuộc trò chuyện |
| Crisis Protocol | P0 | High | Xử lý tình huống khủng hoảng |
| Profile Settings | P2 | Low | Cài đặt cá nhân, đổi mật khẩu |
| Kết nối Hotline | P1 | Low | Hiển thị thông tin hotline tâm lý |
| Gamification | P3 | Medium | Streak, badges (sau MVP) |

### 4.2 Feature Details

#### 4.2.1 Voice Chat với AI (P0)
```
┌────────────────────────────────────────┐
│  Input: User voice (Vietnamese)        │
│           ↓                            │
│  Speech-to-Text (ElevenLabs/Whisper)   │
│           ↓                            │
│  LLM Processing (Gemini)               │
│           ↓                            │
│  Text-to-Speech (ElevenLabs)           │
│           ↓                            │
│  Output: AI voice response             │
└────────────────────────────────────────┘
```

**Requirements:**
- Latency 3-4 giây từ lúc user nói xong đến AI phản hồi (target thực tế)
- Optimal target: < 2.5 giây (với streaming optimization)
- Hỗ trợ tiếng Việt (primary), tiếng Anh (secondary)
- Giọng AI: Trẻ trung, tự nhiên, ấm áp
- Có thể chuyển sang text mode bất cứ lúc nào

**Latency Breakdown (Realistic):**
```
Audio upload + STT:     ~800ms  (Whisper API)
LLM Processing:         ~1000ms (Gemini với streaming)
TTS Generation:         ~1000ms (ElevenLabs streaming)
Network overhead:       ~200-400ms
                        ─────────
Total:                  ~3000-3500ms
```

**Optimization Strategies:**
- Stream audio chunks while user still speaking
- Use Gemini streaming response
- Start TTS while LLM still generating
- Edge caching for static assets

#### 4.2.2 Mood Check-in (P1)
**UI: Emotion Chips**
```
┌────────────────────────────────────────────────────┐
│  "Hôm nay bạn cảm thấy thế nào?"                   │
│                                                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Vui vẻ   │ │ Bình yên │ │ Ổn thôi  │           │
│  └──────────┘ └──────────┘ └──────────┘           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Mệt mỏi  │ │ Lo lắng  │ │ Buồn     │           │
│  └──────────┘ └──────────┘ └──────────┘           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Rối bời  │ │ Cô đơn   │ │ Trống rỗng│          │
│  └──────────┘ └──────────┘ └──────────┘           │
│  ┌──────────┐ ┌──────────┐                        │
│  │ Tức giận │ │ Quá tải  │                        │
│  └──────────┘ └──────────┘                        │
│                                                    │
│  [Bạn có thể chọn 1-3 cảm xúc]                    │
└────────────────────────────────────────────────────┘
```

**Emotion Types:**
- HAPPY (Vui vẻ)
- CALM (Bình yên)
- NEUTRAL (Ổn thôi)
- TIRED (Mệt mỏi)
- ANXIOUS (Lo lắng)
- SAD (Buồn)
- CONFUSED (Rối bời)
- LONELY (Cô đơn)
- NUMB (Trống rỗng)
- ANGRY (Tức giận)
- OVERWHELMED (Quá tải)

#### 4.2.3 Crisis Protocol (P0)
Xem chi tiết tại [CRISIS-PROTOCOL.md](./CRISIS-PROTOCOL.md)

---

## 5. Out of Scope (MVP)

| Feature | Reason | Future Phase |
|---------|--------|--------------|
| Guardian Mode | Phá vỡ trust, gây fake mood | Never |
| School Integration | Phức tạp, privacy concern | V2 (optional) |
| Group Chat | Focus cá nhân trước | V3 |
| Video Call | Bandwidth, complexity | V2 |
| Gamification đầy đủ | Ưu tiên thấp | V1.5 |
| Multi-language | Focus tiếng Việt trước | V2 |

---

## 6. Success Metrics (KPIs)

### 6.1 Engagement Metrics
| Metric | Target (Month 1) | Target (Month 3) |
|--------|------------------|------------------|
| DAU (Daily Active Users) | 100 | 500 |
| Avg. session duration | 5 min | 8 min |
| Sessions per user/week | 2 | 3 |
| Mood check-in rate | 30% | 50% |

### 6.2 Quality Metrics
| Metric | Target |
|--------|--------|
| Voice latency (p50) | < 3s |
| Voice latency (p95) | < 4s |
| App crash rate | < 0.5% |
| User satisfaction (in-app rating) | > 4.0/5 |

### 6.3 Safety Metrics
| Metric | Target |
|--------|--------|
| Crisis detection accuracy | > 90% |
| False positive rate (crisis) | < 10% |
| Successful de-escalation | > 80% |

---

## 7. Assumptions & Risks

### 7.1 Assumptions
- Học sinh có smartphone và data internet
- ElevenLabs hỗ trợ tốt tiếng Việt
- Gemini có thể được fine-tune cho context tâm lý Việt Nam

### 7.2 Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| AI nói sai, gây hại | Critical | Extensive testing, guardrails, disclaimer |
| User lạm dụng (spam, nội dung xấu) | Medium | Rate limiting, content moderation |
| Dữ liệu bị leak | Critical | Encryption, security audit, minimal data collection |
| ElevenLabs giá cao | Medium | Caching, optimize token usage |
| Trẻ em dưới 13 tuổi sử dụng | High | Age verification, ToS |

---

## 8. Legal & Compliance

### 8.1 Disclaimers (Bắt buộc hiển thị)
```
⚠️ MindMate-Talk là ứng dụng hỗ trợ tinh thần, KHÔNG thay thế
tư vấn y tế chuyên nghiệp. Nếu bạn đang trong tình trạng
khẩn cấp, hãy liên hệ hotline: 1800-599-920 (miễn phí, 24/7)
```

### 8.2 Data Privacy
- Tuân thủ PDPA (Vietnam Personal Data Protection)
- User có quyền: Xem, xuất, xóa dữ liệu
- Không chia sẻ dữ liệu với bên thứ 3
- Retention policy: Xóa sau 1 năm inactive

**Data Deletion Policy (Chi tiết):**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATA DELETION POLICY                                 │
└─────────────────────────────────────────────────────────────────────────────┘

Khi user yêu cầu XÓA TÀI KHOẢN:

1. XÓA NGAY LẬP TỨC (Immediate):
   ├── Conversations (tất cả tin nhắn)
   ├── Moods (tất cả mood check-in)
   ├── Audio files (nếu có lưu trữ)
   ├── User profile
   └── Refresh tokens

2. XÓA SAU 30 NGÀY (Grace period):
   └── Email (để ngăn đăng ký lại spam)
       → Sau 30 ngày, email cũng bị xóa hoàn toàn

3. GIỮ LẠI VÔ THỜI HẠN (Anonymized):
   └── Crisis events (đã anonymized, không liên kết user)
       → Lý do: Cải thiện hệ thống phát hiện khủng hoảng
       → Chỉ giữ: level, trigger_content (anonymized), ai_response
       → KHÔNG giữ: user_id, conversation_id

QUAN TRỌNG:
- Xóa là VĨNH VIỄN, KHÔNG THỂ PHỤC HỒI
- Hiển thị cảnh báo rõ ràng trước khi xóa
- Yêu cầu xác nhận password để xóa
```

**Auto-Cleanup Policy:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AUTO-CLEANUP POLICY                                  │
└─────────────────────────────────────────────────────────────────────────────┘

Tự động xóa khi INACTIVE (không đăng nhập):

1. Sau 6 tháng inactive:
   └── Gửi email cảnh báo "Tài khoản sắp bị xóa"

2. Sau 9 tháng inactive:
   └── Gửi email nhắc nhở lần 2

3. Sau 12 tháng inactive:
   └── Xóa tài khoản và toàn bộ dữ liệu (theo policy trên)

NGOẠI LỆ:
- User có thể chọn "Giữ tài khoản vĩnh viễn" trong Settings
- Áp dụng cho user đã verify email
```

### 8.3 Age Requirement
- Tối thiểu: 12 tuổi
- 12-16 tuổi: Tự chịu trách nhiệm (không yêu cầu consent phụ huynh để giữ privacy)

---

## 9. Timeline MVP

```
Week 1-2: Setup & Core Infrastructure
├── Project setup (React, Node.js, PostgreSQL)
├── Auth system
├── Database schema
└── Basic UI components

Week 3-4: Voice Chat Integration
├── ElevenLabs integration
├── Gemini integration
├── Voice streaming
└── AI persona tuning

Week 5-6: Features & Polish
├── Mood check-in
├── Mood history
├── Chat history
├── Crisis protocol
└── Settings

Week 7-8: Testing & Launch
├── User testing
├── Security audit
├── Bug fixes
├── Soft launch
```

---

## 10. Appendix

### 10.1 Related Documents
- [USER-FLOW.md](./USER-FLOW.md) - User journey maps
- [TECHNICAL-ARCHITECTURE.md](./TECHNICAL-ARCHITECTURE.md) - System design
- [DATABASE-SCHEMA.md](./DATABASE-SCHEMA.md) - Data models
- [API-SPEC.md](./API-SPEC.md) - API documentation
- [CRISIS-PROTOCOL.md](./CRISIS-PROTOCOL.md) - Safety procedures
- [AI-PERSONA.md](./AI-PERSONA.md) - AI behavior guidelines

### 10.2 References
- Hotline Sức khỏe Tâm thần: 1800-599-920
- Tổng đài Bảo vệ Trẻ em: 111
