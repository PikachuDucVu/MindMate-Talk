import type { EmotionType } from './types.js';

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

export const HOTLINES = {
  mentalHealth: {
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
