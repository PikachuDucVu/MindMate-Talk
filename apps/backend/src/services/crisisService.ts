import type { CrisisLevel } from '../types/index.js';

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
4. Đề nghị hotline: "Nếu bạn cần hỗ trợ ngay, gọi 1800-599-920 (24/7, miễn phí)"
5. KHÔNG kết thúc cuộc trò chuyện đột ngột
`;

      case 'HIGH':
        return `
QUAN TRỌNG: User đang có dấu hiệu khủng hoảng.
1. Thể hiện sự lo lắng và quan tâm
2. Xác nhận cảm xúc của họ
3. Nhẹ nhàng đề cập đến hỗ trợ: "Nếu bạn cần nói chuyện với người có thể giúp đỡ chuyên sâu, có đường dây 1800-599-920"
4. Tiếp tục lắng nghe và đồng hành
`;

      case 'MEDIUM':
        return `
User đang có dấu hiệu lo lắng hoặc buồn bã ở mức trung bình.
Hãy thể hiện sự thấu hiểu sâu sắc và khám phá thêm về cảm xúc của họ.
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
}

export const crisisService = new CrisisService();
