# MindMate-Talk - Crisis Protocol

> **Version**: 1.0 MVP
> **Last Updated**: 2025-01-27
> **Classification**: INTERNAL - Safety Critical

---

## 1. Overview

### 1.1 Purpose
Tài liệu này mô tả quy trình xử lý khi phát hiện user đang trong trạng thái khủng hoảng tâm lý (crisis state). Mục tiêu là **giữ chân user, hạ nhiệt (de-escalate), và kết nối với hỗ trợ chuyên nghiệp khi cần**.

### 1.2 Core Principles

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CRISIS RESPONSE PRINCIPLES                           │
└─────────────────────────────────────────────────────────────────────────────┘

1. SAFETY FIRST
   └── Tính mạng user là ưu tiên cao nhất

2. STAY CONNECTED
   └── Giữ user trong cuộc trò chuyện, không đẩy đi ngay

3. DE-ESCALATE BEFORE REFERRAL
   └── Hạ nhiệt trước, giới thiệu hotline sau

4. NO JUDGMENT
   └── Không phán xét, không làm user cảm thấy tội lỗi

5. RESPECT AUTONOMY
   └── Hotline là GỢI Ý, không phải ÉP BUỘC
```

---

## 2. Crisis Level Classification

### 2.1 Risk Level Matrix

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CRISIS LEVEL MATRIX                                │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────┬────────────────────────────────────────────────────────────────┐
│  Level   │  Indicators                                                    │
├──────────┼────────────────────────────────────────────────────────────────┤
│  NONE    │  Normal conversation, no distress indicators                   │
│          │  → Continue normal support                                     │
├──────────┼────────────────────────────────────────────────────────────────┤
│  LOW     │  Mild distress: stress, sadness, worry                         │
│          │  Keywords: "buồn", "chán", "mệt", "lo lắng"                    │
│          │  → Enhanced empathy, check-in                                  │
├──────────┼────────────────────────────────────────────────────────────────┤
│  MEDIUM  │  Moderate distress: hopelessness, isolation                    │
│          │  Keywords: "vô vọng", "cô đơn", "không ai hiểu"               │
│          │  → Active support, explore feelings deeply                     │
├──────────┼────────────────────────────────────────────────────────────────┤
│  HIGH    │  Serious concern: suicidal ideation (passive)                  │
│          │  Keywords: "muốn biến mất", "không muốn tồn tại"              │
│          │  "mọi người sẽ tốt hơn nếu không có mình"                     │
│          │  → De-escalation protocol, gently offer resources             │
├──────────┼────────────────────────────────────────────────────────────────┤
│  CRITICAL│  Immediate danger: active suicidal intent, self-harm          │
│          │  Keywords: "muốn chết", "muốn tự tử", "đã chuẩn bị"           │
│          │  "muốn kết thúc", "không muốn sống", "tự làm đau"             │
│          │  → Priority de-escalation, hotline prominently offered        │
└──────────┴────────────────────────────────────────────────────────────────┘
```

### 2.2 Keyword Detection (Vietnamese)

```typescript
// services/crisisService.ts

const CRISIS_KEYWORDS = {
  // CRITICAL - Immediate action required
  critical: [
    'muốn chết',
    'muốn tự tử',
    'tự tử',
    'kết thúc cuộc sống',
    'kết thúc tất cả',
    'không muốn sống',
    'không muốn sống nữa',
    'tự làm đau',
    'tự cắt',
    'tự hại',
    'đã chuẩn bị',
    'đã viết thư',
    'sẽ làm tối nay',
    'đây là lần cuối',
    'tạm biệt mọi người',
  ],

  // HIGH - Serious concern
  high: [
    'muốn biến mất',
    'không muốn tồn tại',
    'giá mà mình không được sinh ra',
    'mọi người sẽ tốt hơn không có mình',
    'không còn lý do để sống',
    'không có gì để mong chờ',
    'chẳng còn ý nghĩa gì',
    'muốn ngủ mãi không thức dậy',
  ],

  // MEDIUM - Moderate concern
  medium: [
    'vô vọng',
    'hoàn toàn một mình',
    'không ai hiểu mình',
    'không ai quan tâm',
    'ghét bản thân',
    'mình là gánh nặng',
    'mình vô dụng',
    'không có ai để nói chuyện',
  ],

  // LOW - Mild distress (monitor)
  low: [
    'rất buồn',
    'quá mệt mỏi',
    'không thể chịu được',
    'muốn khóc',
    'stress quá',
    'áp lực quá',
    'không ngủ được',
  ]
};

// Context-aware detection (not just keywords)
const CRISIS_PATTERNS = [
  /đã (quyết định|chuẩn bị|lên kế hoạch).*(chết|tự tử|kết thúc)/i,
  /không (muốn|còn muốn) sống.*(nữa|tiếp)/i,
  /muốn.*(biến mất|bay đi|không tồn tại)/i,
  /mọi người.*(tốt hơn|vui hơn).*không có mình/i,
];
```

---

## 3. Response Protocol

### 3.1 Level-Based Response Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CRISIS RESPONSE FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

                        ┌──────────────────┐
                        │  Detect Crisis   │
                        │     Level        │
                        └────────┬─────────┘
                                 │
         ┌───────────┬───────────┼───────────┬───────────┐
         │           │           │           │           │
         ▼           ▼           ▼           ▼           ▼
      ┌──────┐   ┌──────┐   ┌──────┐   ┌──────┐   ┌──────────┐
      │ NONE │   │ LOW  │   │MEDIUM│   │ HIGH │   │ CRITICAL │
      └──┬───┘   └──┬───┘   └──┬───┘   └──┬───┘   └────┬─────┘
         │          │          │          │            │
         ▼          ▼          ▼          ▼            ▼
    Continue    Enhanced    Active    De-escalate   Priority
    normally    empathy     support   + Offer       de-escalate
                                      hotline       + Show
                                                    hotline
```

### 3.2 Response Templates

#### Level: LOW
```
AI Response Style:
- Acknowledge feelings with warmth
- Normalize the experience
- Explore what's happening
- NO mention of hotline yet

Example:
"Mình nghe thấy bạn đang cảm thấy rất mệt mỏi. Điều đó hoàn toàn có thể
hiểu được - ai cũng có những lúc như vậy. Bạn có muốn kể cho mình nghe
chuyện gì đang xảy ra không?"
```

#### Level: MEDIUM
```
AI Response Style:
- Deep acknowledgment of pain
- Validate without minimizing
- Ask about support system
- Explore what might help
- Still NO hotline (unless asked or escalates)

Example:
"Mình hiểu. Cảm giác như không ai hiểu mình là rất cô đơn và đau đớn.
Mình muốn bạn biết rằng, ngay lúc này, mình đang ở đây lắng nghe bạn.
Bạn có thể chia sẻ thêm về những gì bạn đang trải qua không?"
```

#### Level: HIGH
```
AI Response Style:
- Express genuine care for their wellbeing
- Acknowledge the pain without judgment
- Gently assess safety
- Begin de-escalation
- Softly mention professional support as an option

Example:
"Mình thật sự lo lắng khi nghe bạn nói như vậy. Những gì bạn đang cảm
thấy nghe rất nặng nề. Mình muốn hỏi - bạn có an toàn ngay bây giờ không?

Mình biết bạn đang đau, và mình muốn ở đây với bạn. Nếu bạn cần nói
chuyện với người có thể giúp đỡ chuyên sâu hơn, có đường dây hỗ trợ
1800-599-920 hoạt động 24/7, miễn phí. Nhưng ngay lúc này, mình đang
ở đây với bạn."
```

#### Level: CRITICAL
```
AI Response Style:
- Express deep concern
- Priority: Keep them engaged
- Safety assessment
- De-escalation first
- Hotline info prominently but not forcefully

Example:
"Mình rất lo lắng cho bạn ngay bây giờ. Cảm ơn bạn đã chia sẻ điều này
với mình - đó là điều rất dũng cảm.

Bạn ơi, mình muốn ở đây với bạn. Bạn có thể cho mình biết bạn đang ở
đâu không? Có ai ở bên cạnh bạn không?

Nếu bạn đang trong tình trạng nguy hiểm, xin hãy gọi 1800-599-920 ngay -
đó là đường dây hỗ trợ tâm lý 24/7, hoàn toàn miễn phí và bảo mật.
Họ có thể giúp bạn ngay bây giờ.

Nhưng nếu bạn muốn tiếp tục nói chuyện với mình, mình ở đây. Bạn không
phải đối mặt với điều này một mình."
```

---

## 4. De-escalation Techniques

### 4.1 Grounding Techniques

```typescript
const GROUNDING_PROMPTS = {
  breathing: `
    Bạn có thể thử thở cùng mình được không?

    Hít vào chậm... 1... 2... 3... 4...
    Giữ... 1... 2... 3... 4...
    Thở ra... 1... 2... 3... 4... 5... 6...

    Bạn cảm thấy thế nào?
  `,

  fiveSenses: `
    Mình muốn thử một điều nhỏ cùng bạn. Bạn có thể nhìn quanh và nói
    cho mình:
    - 5 thứ bạn THẤY
    - 4 thứ bạn có thể CHẠM vào
    - 3 thứ bạn NGHE
    - 2 thứ bạn NGỬI được
    - 1 thứ bạn có thể NẾM

    Bạn thử được không?
  `,

  safePlace: `
    Bạn có thể nghĩ về một nơi mà bạn cảm thấy an toàn không?
    Có thể là một nơi thực, hoặc tưởng tượng cũng được.
    Bạn có thể mô tả nơi đó cho mình nghe không?
  `
};
```

### 4.2 Conversation Strategies

```
DO:
├── Stay calm and present
├── Use "mình" (I) instead of formal language
├── Acknowledge their pain: "Mình nghe thấy bạn đang..."
├── Ask open questions: "Bạn có thể kể thêm không?"
├── Validate feelings: "Cảm xúc của bạn là có thật"
├── Express care: "Mình lo lắng cho bạn"
├── Offer to stay: "Mình ở đây với bạn"
└── Small steps: "Ngay bây giờ, bạn chỉ cần..."

DON'T:
├── Say "Bạn không nên cảm thấy như vậy"
├── Promise things will get better immediately
├── Make them feel guilty about their feelings
├── Rush them to call hotline
├── Share personal experiences/stories
├── Give advice like "Bạn nên..."
├── Minimize: "Chuyện nhỏ thôi mà"
└── End conversation abruptly
```

---

## 5. Hotline Information

### 5.1 Primary Resources

```typescript
const HOTLINES = {
  primary: {
    name: 'Đường dây nóng Sức khỏe Tâm thần',
    number: '1800-599-920',
    hours: '24/7',
    cost: 'Miễn phí',
    description: 'Hỗ trợ tâm lý, khủng hoảng'
  },

  childProtection: {
    name: 'Tổng đài Bảo vệ Trẻ em',
    number: '111',
    hours: '24/7',
    cost: 'Miễn phí',
    description: 'Bảo vệ trẻ em, bạo lực, xâm hại'
  },

  emergency: {
    name: 'Cấp cứu',
    number: '115',
    hours: '24/7',
    cost: 'Miễn phí',
    description: 'Cấp cứu y tế'
  },

  // NGO & Tổ chức hỗ trợ
  blueDragon: {
    name: 'Blue Dragon Children\'s Foundation',
    number: '1800-599-199',
    hours: '24/7',
    cost: 'Miễn phí',
    description: 'Hỗ trợ trẻ em đường phố, nạn nhân buôn người',
    website: 'https://bluedragon.org'
  },

  hagar: {
    name: 'Hagar International Vietnam',
    number: '024-3715-5012',
    hours: 'Giờ hành chính',
    cost: 'Miễn phí',
    description: 'Hỗ trợ phụ nữ và trẻ em bị bạo lực, xâm hại',
    website: 'https://hagarinternational.org'
  },

  saigonChildren: {
    name: 'Saigon Children\'s Charity',
    number: '028-3824-2706',
    hours: 'Giờ hành chính',
    cost: 'Miễn phí',
    description: 'Hỗ trợ giáo dục và tâm lý cho trẻ em',
    website: 'https://saigonchildren.com'
  }
};
```

### 5.2 How to Present Hotline

```
GOOD (Soft offer):
"Nếu bạn muốn nói chuyện với người có thể hỗ trợ chuyên sâu hơn,
có đường dây 1800-599-920, miễn phí và bảo mật. Nhưng mình vẫn
ở đây nếu bạn muốn tiếp tục nói chuyện."

BAD (Pushy):
"Bạn CẦN gọi ngay 1800-599-920 NGAY BÂY GIỜ!"
"Mình không thể giúp bạn, bạn phải gọi hotline."
```

---

## 6. Technical Implementation

### 6.1 Crisis Detection Service

```typescript
// services/crisisService.ts

import { CrisisLevel } from '@prisma/client';

interface CrisisAssessment {
  level: CrisisLevel;
  confidence: number;
  triggers: string[];
  suggestedResponse: string;
  shouldShowHotline: boolean;
}

export class CrisisService {
  async assessMessage(
    message: string,
    conversationHistory: string[]
  ): Promise<CrisisAssessment> {
    // Step 1: Keyword detection
    const keywordLevel = this.detectKeywords(message);

    // Step 2: Pattern matching
    const patternLevel = this.detectPatterns(message);

    // Step 3: Context analysis (using Gemini)
    const contextLevel = await this.analyzeContext(
      message,
      conversationHistory
    );

    // Step 4: Combine signals
    const finalLevel = this.combineSignals(
      keywordLevel,
      patternLevel,
      contextLevel
    );

    return {
      level: finalLevel,
      confidence: this.calculateConfidence(keywordLevel, patternLevel, contextLevel),
      triggers: this.extractTriggers(message),
      suggestedResponse: this.getSuggestedResponse(finalLevel),
      shouldShowHotline: finalLevel === 'HIGH' || finalLevel === 'CRITICAL'
    };
  }

  private detectKeywords(message: string): CrisisLevel {
    const normalizedMessage = message.toLowerCase();

    for (const keyword of CRISIS_KEYWORDS.critical) {
      if (normalizedMessage.includes(keyword)) {
        return 'CRITICAL';
      }
    }

    for (const keyword of CRISIS_KEYWORDS.high) {
      if (normalizedMessage.includes(keyword)) {
        return 'HIGH';
      }
    }

    // ... continue for other levels

    return 'NONE';
  }

  private async analyzeContext(
    message: string,
    history: string[]
  ): Promise<CrisisLevel> {
    // Use Gemini to analyze the emotional context
    const prompt = `
      Analyze the following message for signs of psychological distress.
      Consider the conversation history for context.

      Message: "${message}"

      Recent history: ${history.slice(-5).join('\n')}

      Assess the crisis level:
      - NONE: No distress indicators
      - LOW: Mild distress (stress, sadness)
      - MEDIUM: Moderate distress (hopelessness, isolation)
      - HIGH: Serious concern (passive suicidal ideation)
      - CRITICAL: Immediate danger (active suicidal intent)

      Respond with ONLY the level (e.g., "MEDIUM")
    `;

    const response = await this.geminiService.generate(prompt);
    return this.parseLevel(response);
  }
}
```

### 6.2 AI System Prompt Modification

```typescript
// prompts/crisisPrompt.ts

export const CRISIS_AWARE_SYSTEM_PROMPT = `
You are MindMate, a supportive companion for Vietnamese students.

CRISIS RESPONSE GUIDELINES:

When you detect signs of crisis (suicidal thoughts, self-harm, severe distress):

1. STAY CALM - Don't panic or alarm the user
2. ACKNOWLEDGE - "Mình nghe thấy bạn đang..."
3. VALIDATE - Their feelings are real and valid
4. STAY PRESENT - "Mình ở đây với bạn"
5. ASSESS SAFETY - Gently ask if they're safe
6. DE-ESCALATE - Use grounding techniques if appropriate
7. OFFER RESOURCES - Mention hotline gently, not forcefully

NEVER:
- Tell them to "not feel that way"
- Promise everything will be okay immediately
- Make them feel guilty
- End the conversation abruptly
- Force them to call hotline

HOTLINE INFO (only mention in HIGH/CRITICAL situations):
- Đường dây hỗ trợ: 1800-599-920 (24/7, miễn phí)

Remember: Your goal is to keep them talking until they feel calmer,
not to push them away to a hotline.
`;
```

### 6.3 Logging Crisis Events

```typescript
// services/crisisService.ts

async logCrisisEvent(
  userId: string,
  conversationId: string,
  assessment: CrisisAssessment,
  aiResponse: string
): Promise<void> {
  await prisma.crisisEvent.create({
    data: {
      userId,
      conversationId,
      level: assessment.level,
      triggerContent: assessment.triggers.join(', '),
      aiResponse,
      hotlineShown: assessment.shouldShowHotline
    }
  });

  // If CRITICAL, alert monitoring (if implemented)
  if (assessment.level === 'CRITICAL') {
    await this.alertMonitoring(userId, conversationId);
  }
}
```

---

## 7. UI/UX Guidelines

### 7.1 Hotline Display Component

```typescript
// components/HotlineCard.tsx

interface HotlineCardProps {
  level: 'subtle' | 'prominent';
  onCallClick: () => void;
}

// Subtle (for HIGH level - after de-escalation)
const SubtleHotline = () => (
  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
    <p className="text-sm text-blue-800">
      Nếu bạn cần hỗ trợ chuyên sâu hơn:
    </p>
    <a href="tel:1800599920" className="text-blue-600 font-medium">
      1800-599-920 (24/7, miễn phí)
    </a>
  </div>
);

// Prominent (for CRITICAL level)
const ProminentHotline = () => (
  <div className="mt-4 p-4 bg-red-50 rounded-lg border-2 border-red-300">
    <p className="text-red-800 font-medium mb-2">
      Mình muốn bạn được an toàn.
    </p>
    <p className="text-red-700 text-sm mb-3">
      Nếu bạn đang trong tình trạng nguy hiểm, xin hãy gọi:
    </p>
    <a
      href="tel:1800599920"
      className="block w-full py-3 bg-red-600 text-white rounded-lg
                 text-center font-bold text-lg"
    >
      Gọi 1800-599-920
    </a>
    <p className="text-xs text-red-600 mt-2 text-center">
      24/7 - Miễn phí - Bảo mật
    </p>
  </div>
);
```

### 7.2 In-Chat Crisis Indication

```
DO NOT:
- Show scary red warnings
- Popup modal that blocks chat
- Play alarming sounds
- Make user feel they're being "flagged"

DO:
- Seamlessly integrate support info into AI response
- Use warm, caring colors (blue, teal) not alarming red
- Allow user to continue chatting
- Make hotline clickable but not mandatory
```

---

## 8. Testing & Monitoring

### 8.1 Crisis Detection Testing

```typescript
// tests/crisis.test.ts

describe('Crisis Detection', () => {
  test('detects CRITICAL level keywords', async () => {
    const assessment = await crisisService.assessMessage(
      'Mình không muốn sống nữa',
      []
    );
    expect(assessment.level).toBe('CRITICAL');
    expect(assessment.shouldShowHotline).toBe(true);
  });

  test('detects HIGH level passive ideation', async () => {
    const assessment = await crisisService.assessMessage(
      'Mọi người sẽ tốt hơn nếu không có mình',
      []
    );
    expect(assessment.level).toBe('HIGH');
  });

  test('does not over-trigger on normal sadness', async () => {
    const assessment = await crisisService.assessMessage(
      'Hôm nay mình hơi buồn vì điểm thấp',
      []
    );
    expect(assessment.level).toBe('LOW');
    expect(assessment.shouldShowHotline).toBe(false);
  });
});
```

### 8.2 Monitoring Dashboard Metrics

```
Key Metrics to Track:
├── Crisis events by level (daily/weekly/monthly)
├── Hotline shown rate
├── Hotline click-through rate
├── Average conversation length after crisis detection
├── User return rate after crisis event
└── False positive rate (from user feedback)
```

---

## 9. Review & Improvement

### 9.1 Regular Review Process

```
Monthly:
├── Review all CRITICAL events
├── Analyze AI responses for appropriateness
├── Update keyword lists if needed
└── Check false positive/negative rates

Quarterly:
├── Review with mental health professional
├── Update response templates
├── User feedback analysis
└── Benchmark against best practices
```

### 9.2 Continuous Improvement

```typescript
// Feedback loop for crisis response improvement

interface CrisisReviewData {
  eventId: string;
  aiResponseAppropriate: boolean;
  levelAccurate: boolean;
  userContinuedTalking: boolean;
  hotlineWasHelpful: boolean;
  suggestedImprovements: string;
}

// Collect from:
// 1. Manual review of CRITICAL events
// 2. User feedback (optional, anonymous)
// 3. Comparison with professional standards
```

---

## 10. Emergency Contacts Summary

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EMERGENCY CONTACTS                                   │
└─────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│  Đường dây Sức khỏe Tâm thần     │  1800-599-920  │  24/7  │  Miễn phí   │
├────────────────────────────────────────────────────────────────────────────┤
│  Tổng đài Bảo vệ Trẻ em          │  111           │  24/7  │  Miễn phí   │
├────────────────────────────────────────────────────────────────────────────┤
│  Cấp cứu                         │  115           │  24/7  │  Miễn phí   │
├────────────────────────────────────────────────────────────────────────────┤
│  Blue Dragon Foundation          │  1800-599-199  │  24/7  │  Miễn phí   │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 11. SOS Button Integration

### 11.1 Overview

Nút SOS là tính năng bổ sung quan trọng, cho phép user chủ động tìm kiếm hỗ trợ
mà không cần đợi AI phát hiện từ khóa khủng hoảng.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SOS BUTTON FLOW                                      │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────────┐
    │  User taps SOS   │
    │  button in chat  │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │  Show Bottom     │
    │  Sheet with      │
    │  hotline options │
    └────────┬─────────┘
             │
      ┌──────┴──────┐
      │             │
      ▼             ▼
┌──────────┐  ┌──────────┐
│ User taps│  │ User taps│
│ "Gọi"    │  │ "Quay    │
│          │  │  lại"    │
└────┬─────┘  └────┬─────┘
     │             │
     ▼             ▼
┌──────────┐  ┌──────────┐
│ Open     │  │ Close    │
│ phone    │  │ sheet,   │
│ dialer   │  │ continue │
│          │  │ chat     │
└──────────┘  └──────────┘
```

### 11.2 Privacy Considerations

```typescript
// SOS Button KHÔNG được log các thông tin sau:
const SOS_PRIVACY_RULES = {
  // KHÔNG log việc user tap SOS button
  logSosTap: false,

  // KHÔNG log việc user xem hotline list
  logHotlineView: false,

  // KHÔNG log việc user gọi hotline
  logHotlineCall: false,

  // CHỈ log nếu user đồng ý feedback (optional)
  logWithConsent: true,

  // Lý do: Bảo vệ quyền riêng tư tuyệt đối của user
  // User có thể đang trong trạng thái nhạy cảm
  // và không muốn bất kỳ ai biết họ đã tìm kiếm hỗ trợ
};
```

### 11.3 SOS Button vs Crisis Detection

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                  SOS BUTTON vs CRISIS DETECTION                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────┬───────────────────────────────────────────────┐
│       SOS BUTTON            │          CRISIS DETECTION                     │
├─────────────────────────────┼───────────────────────────────────────────────┤
│ User-initiated              │ AI-initiated                                  │
│ (User chủ động)             │ (AI phát hiện)                                │
├─────────────────────────────┼───────────────────────────────────────────────┤
│ Ngay lập tức                │ Sau khi phân tích tin nhắn                    │
├─────────────────────────────┼───────────────────────────────────────────────┤
│ Không log                   │ Log để cải thiện hệ thống                     │
├─────────────────────────────┼───────────────────────────────────────────────┤
│ Hiển thị danh sách hotline  │ AI đưa hotline vào context phản hồi          │
├─────────────────────────────┼───────────────────────────────────────────────┤
│ Không làm gián đoạn chat    │ Có thể thay đổi tone của AI                   │
└─────────────────────────────┴───────────────────────────────────────────────┘

Cả hai cơ chế BỔ SUNG cho nhau, không thay thế:
- SOS Button: Cho user đang biết mình cần giúp đỡ
- Crisis Detection: Cho user chưa nhận ra mình cần giúp đỡ
```

### 11.4 Implementation Notes

```typescript
// components/SosButton.tsx

interface SosButtonProps {
  onPress: () => void;
}

const SosButton: React.FC<SosButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityLabel="Hỗ trợ khẩn cấp"
      accessibilityHint="Mở danh sách đường dây nóng hỗ trợ tâm lý"
      style={styles.sosButton}
    >
      {/* Icon: Lifebuoy hoặc SOS */}
      <LifebuoyIcon color="#0D9488" size={24} />
    </TouchableOpacity>
  );
};

// Styling Guidelines:
// - Màu: Teal (#0D9488) - nhẹ nhàng, không gây hoảng
// - Vị trí: Header bên phải, trước nút menu
// - Size: 24-28px icon
// - Padding: 8px để dễ tap
```
