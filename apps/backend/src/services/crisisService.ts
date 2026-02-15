import type { CrisisLevel } from '../types/index.js';
import { prisma } from '../config/database.js';

// Crisis keywords categorized by severity
const CRISIS_KEYWORDS = {
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

  low: [
    'rất buồn',
    'quá mệt mỏi',
    'không thể chịu được',
    'muốn khóc',
    'stress quá',
    'áp lực quá',
    'không ngủ được',
  ],
};

// Context-aware patterns
const CRISIS_PATTERNS = [
  /đã (quyết định|chuẩn bị|lên kế hoạch).*(chết|tự tử|kết thúc)/i,
  /không (muốn|còn muốn) sống.*(nữa|tiếp)/i,
  /muốn.*(biến mất|bay đi|không tồn tại)/i,
  /mọi người.*(tốt hơn|vui hơn).*không có mình/i,
];

// De-escalation techniques
const DE_ESCALATION_PROMPTS = {
  breathing: `Bạn có thể thử thở cùng mình được không?

Hít vào chậm... 1... 2... 3... 4...
Giữ... 1... 2... 3... 4...
Thở ra... 1... 2... 3... 4... 5... 6...

Bạn cảm thấy thế nào?`,

  fiveSenses: `Mình muốn thử một điều nhỏ cùng bạn. Bạn có thể nhìn quanh và nói cho mình:
- 5 thứ bạn THẤY
- 4 thứ bạn có thể CHẠM vào
- 3 thứ bạn NGHE
- 2 thứ bạn NGỬI được
- 1 thứ bạn có thể NẾM

Bạn thử được không?`,

  safePlace: `Bạn có thể nghĩ về một nơi mà bạn cảm thấy an toàn không?
Có thể là một nơi thực, hoặc tưởng tượng cũng được.
Bạn có thể mô tả nơi đó cho mình nghe không?`,
};

// Hotline information
const HOTLINES = {
  primary: {
    name: 'Đường dây nóng Sức khỏe Tâm thần',
    number: '1800-599-920',
    hours: '24/7',
    cost: 'Miễn phí',
  },
  childProtection: {
    name: 'Tổng đài Bảo vệ Trẻ em',
    number: '111',
    hours: '24/7',
    cost: 'Miễn phí',
  },
  emergency: {
    name: 'Cấp cứu',
    number: '115',
    hours: '24/7',
    cost: 'Miễn phí',
  },
};

export interface CrisisAssessment {
  level: CrisisLevel;
  confidence: number;
  triggers: string[];
  shouldShowHotline: boolean;
}

export class CrisisService {
  /**
   * Assess a message for crisis indicators
   */
  assessMessage(message: string): CrisisAssessment {
    const normalizedMessage = message.toLowerCase();
    const triggers: string[] = [];
    let level: CrisisLevel = 'NONE';
    let confidence = 0;

    // Check CRITICAL keywords
    for (const keyword of CRISIS_KEYWORDS.critical) {
      if (normalizedMessage.includes(keyword)) {
        triggers.push(keyword);
        level = 'CRITICAL';
        confidence = 0.95;
      }
    }

    // Check HIGH keywords if not already CRITICAL
    if (level === 'NONE') {
      for (const keyword of CRISIS_KEYWORDS.high) {
        if (normalizedMessage.includes(keyword)) {
          triggers.push(keyword);
          level = 'HIGH';
          confidence = 0.85;
        }
      }
    }

    // Check MEDIUM keywords
    if (level === 'NONE') {
      for (const keyword of CRISIS_KEYWORDS.medium) {
        if (normalizedMessage.includes(keyword)) {
          triggers.push(keyword);
          level = 'MEDIUM';
          confidence = 0.7;
        }
      }
    }

    // Check LOW keywords
    if (level === 'NONE') {
      for (const keyword of CRISIS_KEYWORDS.low) {
        if (normalizedMessage.includes(keyword)) {
          triggers.push(keyword);
          level = 'LOW';
          confidence = 0.5;
        }
      }
    }

    // Check patterns for additional context
    for (const pattern of CRISIS_PATTERNS) {
      if (pattern.test(normalizedMessage)) {
        // Upgrade level if pattern matches
        if (level === 'NONE' || level === 'LOW') {
          level = 'HIGH';
          confidence = Math.max(confidence, 0.8);
        }
        triggers.push(`pattern: ${pattern.source}`);
      }
    }

    return {
      level,
      confidence,
      triggers,
      shouldShowHotline: level === 'HIGH' || level === 'CRITICAL',
    };
  }

  /**
   * Get appropriate response additions based on crisis level
   */
  getCrisisPromptAddition(level: CrisisLevel): string {
    switch (level) {
      case 'CRITICAL':
        return `
QUAN TRỌNG: User đang trong tình trạng KHỦNG HOẢNG NGHIÊM TRỌNG.
1. Thể hiện sự quan tâm sâu sắc
2. Hỏi về sự an toàn: "Bạn có an toàn ngay bây giờ không?"
3. Ở bên cạnh họ: "Mình ở đây với bạn"
4. Đề nghị hotline: "Nếu bạn cần hỗ trợ ngay, gọi ${HOTLINES.primary.number} (${HOTLINES.primary.hours}, ${HOTLINES.primary.cost})"
5. KHÔNG kết thúc cuộc trò chuyện đột ngột
6. Có thể gợi ý kỹ thuật thở để hạ nhiệt nếu phù hợp
`;

      case 'HIGH':
        return `
QUAN TRỌNG: User đang có dấu hiệu khủng hoảng.
1. Thể hiện sự lo lắng và quan tâm
2. Xác nhận cảm xúc của họ
3. Nhẹ nhàng đề cập đến hỗ trợ: "Nếu bạn cần nói chuyện với người có thể giúp đỡ chuyên sâu, có đường dây ${HOTLINES.primary.number}"
4. Tiếp tục lắng nghe và đồng hành
5. Có thể gợi ý kỹ thuật grounding (5 giác quan) nếu user đang hoảng loạn
`;

      case 'MEDIUM':
        return `
User đang có dấu hiệu lo lắng hoặc buồn bã ở mức trung bình.
Hãy thể hiện sự thấu hiểu sâu sắc và khám phá thêm về cảm xúc của họ.
Hỏi về hệ thống hỗ trợ của họ (bạn bè, gia đình, người lớn đáng tin cậy).
`;

      case 'LOW':
        return `
User có vẻ đang stress nhẹ hoặc mệt mỏi.
Hãy lắng nghe và thể hiện sự đồng cảm.
`;

      default:
        return '';
    }
  }

  /**
   * Get de-escalation technique prompt
   */
  getDeEscalationPrompt(technique: 'breathing' | 'fiveSenses' | 'safePlace'): string {
    return DE_ESCALATION_PROMPTS[technique];
  }

  /**
   * Log a crisis event to the database
   */
  async logCrisisEvent(params: {
    userId?: string;
    conversationId?: string;
    level: CrisisLevel;
    triggerContent: string;
    aiResponse: string;
    hotlineShown: boolean;
  }): Promise<string | null> {
    // Only log MEDIUM and above
    if (params.level === 'NONE' || params.level === 'LOW') {
      return null;
    }

    try {
      const event = await prisma.crisisEvent.create({
        data: {
          userId: params.userId || null,
          conversationId: params.conversationId || null,
          level: params.level,
          triggerContent: params.triggerContent,
          aiResponse: params.aiResponse,
          hotlineShown: params.hotlineShown,
        },
      });

      return event.id;
    } catch (error) {
      // Don't let logging failures break the chat flow
      console.error('Failed to log crisis event:', error);
      return null;
    }
  }

  /**
   * Record that user clicked a hotline
   */
  async recordHotlineClick(crisisEventId: string): Promise<boolean> {
    try {
      await prisma.crisisEvent.update({
        where: { id: crisisEventId },
        data: { hotlineClicked: true },
      });
      return true;
    } catch (error) {
      console.error('Failed to record hotline click:', error);
      return false;
    }
  }

  /**
   * Get hotline information
   */
  getHotlines() {
    return HOTLINES;
  }
}

export const crisisService = new CrisisService();
