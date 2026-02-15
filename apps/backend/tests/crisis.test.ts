/**
 * Comprehensive Unit Tests for Crisis Service
 *
 * Tests: keyword detection, pattern matching, confidence scoring,
 * prompt additions, de-escalation, and hotline info.
 *
 * Run: npm run test
 */
import { describe, it, expect } from 'vitest';
import { crisisService } from '../src/services/crisisService.js';
import type { CrisisLevel } from '../src/types/index.js';

describe('CrisisService', () => {
  // ============================================
  // assessMessage - CRITICAL level
  // ============================================
  describe('assessMessage - CRITICAL', () => {
    const criticalPhrases = [
      'Mình không muốn sống nữa',
      'Mình muốn chết',
      'Mình muốn tự tử',
      'Mình muốn kết thúc cuộc sống',
      'Mình muốn kết thúc tất cả',
      'Mình đã tự cắt tay',
      'Mình tự làm đau bản thân',
      'Mình đã viết thư cho mọi người',
      'Đây là lần cuối mình nói chuyện',
      'Tạm biệt mọi người',
      'Mình sẽ làm tối nay',
    ];

    criticalPhrases.forEach((phrase) => {
      it(`should detect CRITICAL: "${phrase}"`, () => {
        const assessment = crisisService.assessMessage(phrase);
        expect(assessment.level).toBe('CRITICAL');
        expect(assessment.shouldShowHotline).toBe(true);
        expect(assessment.confidence).toBeGreaterThanOrEqual(0.9);
        expect(assessment.triggers.length).toBeGreaterThan(0);
      });
    });

    it('should detect CRITICAL regardless of case', () => {
      const assessment = crisisService.assessMessage('MÌNH MUỐN CHẾT');
      expect(assessment.level).toBe('CRITICAL');
    });

    it('should detect CRITICAL within longer message', () => {
      const assessment = crisisService.assessMessage(
        'Mình đã suy nghĩ rất lâu rồi, mình không muốn sống nữa, mình mệt mỏi lắm'
      );
      expect(assessment.level).toBe('CRITICAL');
    });
  });

  // ============================================
  // assessMessage - HIGH level
  // ============================================
  describe('assessMessage - HIGH', () => {
    const highPhrases = [
      'Mình muốn biến mất khỏi thế giới này',
      'Mình không muốn tồn tại nữa',
      'Giá mà mình không được sinh ra',
      'Mọi người sẽ tốt hơn không có mình',
      'Mình không còn lý do để sống',
      'Mình không có gì để mong chờ',
      'Chẳng còn ý nghĩa gì nữa',
      'Mình muốn ngủ mãi không thức dậy',
    ];

    highPhrases.forEach((phrase) => {
      it(`should detect HIGH: "${phrase}"`, () => {
        const assessment = crisisService.assessMessage(phrase);
        expect(assessment.level).toBe('HIGH');
        expect(assessment.shouldShowHotline).toBe(true);
        expect(assessment.confidence).toBeGreaterThanOrEqual(0.8);
      });
    });
  });

  // ============================================
  // assessMessage - MEDIUM level
  // ============================================
  describe('assessMessage - MEDIUM', () => {
    const mediumPhrases = [
      'Mình cảm thấy vô vọng',
      'Mình hoàn toàn một mình',
      'Không ai hiểu mình cả',
      'Không ai quan tâm đến mình',
      'Mình ghét bản thân mình',
      'Mình là gánh nặng cho mọi người',
      'Mình vô dụng quá',
      'Mình không có ai để nói chuyện',
    ];

    mediumPhrases.forEach((phrase) => {
      it(`should detect MEDIUM: "${phrase}"`, () => {
        const assessment = crisisService.assessMessage(phrase);
        expect(assessment.level).toBe('MEDIUM');
        expect(assessment.shouldShowHotline).toBe(false);
        expect(assessment.confidence).toBeGreaterThanOrEqual(0.6);
      });
    });

    it('should detect MEDIUM with multiple keywords', () => {
      const assessment = crisisService.assessMessage(
        'Mình cảm thấy vô vọng và không ai hiểu mình'
      );
      expect(assessment.level).toBe('MEDIUM');
      expect(assessment.triggers.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ============================================
  // assessMessage - LOW level
  // ============================================
  describe('assessMessage - LOW', () => {
    const lowPhrases = [
      'Mình rất buồn hôm nay',
      'Quá mệt mỏi rồi',
      'Mình không thể chịu được nữa',
      'Mình muốn khóc quá',
      'Stress quá đi',
      'Áp lực quá nhiều',
      'Mình không ngủ được mấy đêm rồi',
    ];

    lowPhrases.forEach((phrase) => {
      it(`should detect LOW: "${phrase}"`, () => {
        const assessment = crisisService.assessMessage(phrase);
        expect(assessment.level).toBe('LOW');
        expect(assessment.shouldShowHotline).toBe(false);
      });
    });
  });

  // ============================================
  // assessMessage - NONE level
  // ============================================
  describe('assessMessage - NONE', () => {
    const normalPhrases = [
      'Hôm nay mình đi học về và làm bài tập',
      'Mình vừa ăn cơm xong',
      'Bạn ơi cho mình hỏi bài toán này',
      'Mình thích chơi game',
      'Hôm nay trời đẹp quá',
      'Mình đang nghe nhạc',
      'Tuần sau mình có bài kiểm tra',
      '',
      'abc',
    ];

    normalPhrases.forEach((phrase) => {
      it(`should return NONE: "${phrase || '(empty)'}"`, () => {
        const assessment = crisisService.assessMessage(phrase);
        expect(assessment.level).toBe('NONE');
        expect(assessment.shouldShowHotline).toBe(false);
        expect(assessment.triggers.length).toBe(0);
        expect(assessment.confidence).toBe(0);
      });
    });
  });

  // ============================================
  // assessMessage - Pattern matching
  // ============================================
  describe('assessMessage - Pattern matching', () => {
    it('should detect "đã quyết định...chết" pattern', () => {
      const assessment = crisisService.assessMessage(
        'Mình đã quyết định sẽ kết thúc cuộc sống'
      );
      expect(['HIGH', 'CRITICAL']).toContain(assessment.level);
      expect(assessment.triggers.some(t => t.startsWith('pattern:'))).toBe(true);
    });

    it('should detect "không muốn sống nữa" pattern', () => {
      const assessment = crisisService.assessMessage(
        'Mình không còn muốn sống tiếp nữa'
      );
      expect(['HIGH', 'CRITICAL']).toContain(assessment.level);
    });

    it('should detect "muốn biến mất" pattern', () => {
      const assessment = crisisService.assessMessage(
        'Mình muốn bay đi khỏi nơi này'
      );
      expect(assessment.level).toBe('HIGH');
    });

    it('should detect "mọi người tốt hơn không có mình" pattern', () => {
      const assessment = crisisService.assessMessage(
        'Mọi người sẽ vui hơn nếu không có mình ở đây'
      );
      expect(assessment.level).toBe('HIGH');
    });

    it('should upgrade LOW to HIGH when pattern matches', () => {
      const assessment = crisisService.assessMessage(
        'Mình đã lên kế hoạch để kết thúc rồi'
      );
      expect(assessment.level).toBe('HIGH');
      expect(assessment.confidence).toBeGreaterThanOrEqual(0.8);
    });
  });

  // ============================================
  // assessMessage - Priority ordering
  // ============================================
  describe('assessMessage - Level priority', () => {
    it('CRITICAL should take priority over HIGH keywords', () => {
      const assessment = crisisService.assessMessage(
        'Mình muốn chết, mình muốn biến mất'
      );
      expect(assessment.level).toBe('CRITICAL');
    });

    it('CRITICAL should take priority over MEDIUM keywords', () => {
      const assessment = crisisService.assessMessage(
        'Mình vô vọng, mình muốn tự tử'
      );
      expect(assessment.level).toBe('CRITICAL');
    });

    it('CRITICAL should take priority over LOW keywords', () => {
      const assessment = crisisService.assessMessage(
        'Mình rất buồn và muốn chết'
      );
      expect(assessment.level).toBe('CRITICAL');
    });
  });

  // ============================================
  // assessMessage - Edge cases
  // ============================================
  describe('assessMessage - Edge cases', () => {
    it('should handle very long messages', () => {
      const longMessage = 'Mình hôm nay đi học '.repeat(100) + 'và muốn chết';
      const assessment = crisisService.assessMessage(longMessage);
      expect(assessment.level).toBe('CRITICAL');
    });

    it('should handle unicode and diacritics', () => {
      const assessment = crisisService.assessMessage('muốn chết');
      expect(assessment.level).toBe('CRITICAL');
    });

    it('should handle mixed case Vietnamese', () => {
      const assessment = crisisService.assessMessage('Muốn Tự Tử');
      expect(assessment.level).toBe('CRITICAL');
    });

    it('common expression "muốn chết cười" may trigger (known limitation)', () => {
      const assessment = crisisService.assessMessage(
        'Mình muốn chết cười vì bạn kể chuyện hài'
      );
      // This is a known false positive - keyword matching can't distinguish context
      // Real system would use LLM context analysis to handle this
      expect(assessment).toBeDefined();
    });
  });

  // ============================================
  // getCrisisPromptAddition
  // ============================================
  describe('getCrisisPromptAddition', () => {
    it('should return empty string for NONE', () => {
      expect(crisisService.getCrisisPromptAddition('NONE')).toBe('');
    });

    it('should contain empathy guidance for LOW', () => {
      const addition = crisisService.getCrisisPromptAddition('LOW');
      expect(addition).toContain('stress');
      expect(addition).toContain('đồng cảm');
    });

    it('should mention support system for MEDIUM', () => {
      const addition = crisisService.getCrisisPromptAddition('MEDIUM');
      expect(addition).toContain('thấu hiểu');
      expect(addition).toContain('hỗ trợ');
    });

    it('should contain hotline for HIGH', () => {
      const addition = crisisService.getCrisisPromptAddition('HIGH');
      expect(addition).toContain('khủng hoảng');
      expect(addition).toContain('1800-599-920');
    });

    it('should contain urgent guidance for CRITICAL', () => {
      const addition = crisisService.getCrisisPromptAddition('CRITICAL');
      expect(addition).toContain('KHỦNG HOẢNG');
      expect(addition).toContain('1800-599-920');
      expect(addition).toContain('an toàn');
      expect(addition).toContain('KHÔNG kết thúc');
    });

    it('should handle all CrisisLevel values', () => {
      const levels: CrisisLevel[] = ['NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
      levels.forEach((level) => {
        const result = crisisService.getCrisisPromptAddition(level);
        expect(typeof result).toBe('string');
      });
    });
  });

  // ============================================
  // getDeEscalationPrompt
  // ============================================
  describe('getDeEscalationPrompt', () => {
    it('should return breathing exercise with counting', () => {
      const prompt = crisisService.getDeEscalationPrompt('breathing');
      expect(prompt).toContain('Hít vào');
      expect(prompt).toContain('Giữ');
      expect(prompt).toContain('Thở ra');
      expect(prompt).toContain('1');
      expect(prompt).toContain('4');
    });

    it('should return 5-4-3-2-1 grounding technique', () => {
      const prompt = crisisService.getDeEscalationPrompt('fiveSenses');
      expect(prompt).toContain('5 thứ bạn THẤY');
      expect(prompt).toContain('4 thứ bạn có thể CHẠM');
      expect(prompt).toContain('3 thứ bạn NGHE');
      expect(prompt).toContain('2 thứ bạn NGỬI');
      expect(prompt).toContain('1 thứ bạn có thể NẾM');
    });

    it('should return safe place visualization', () => {
      const prompt = crisisService.getDeEscalationPrompt('safePlace');
      expect(prompt).toContain('an toàn');
      expect(prompt).toContain('mô tả');
    });

    it('all techniques should be non-empty strings', () => {
      const techniques = ['breathing', 'fiveSenses', 'safePlace'] as const;
      techniques.forEach((t) => {
        const prompt = crisisService.getDeEscalationPrompt(t);
        expect(prompt.length).toBeGreaterThan(20);
      });
    });
  });

  // ============================================
  // getHotlines
  // ============================================
  describe('getHotlines', () => {
    it('should return hotline info', () => {
      const hotlines = crisisService.getHotlines();
      expect(hotlines).toBeDefined();
      expect(hotlines.primary).toBeDefined();
      expect(hotlines.primary.number).toBe('1800-599-920');
      expect(hotlines.primary.hours).toBe('24/7');
      expect(hotlines.primary.cost).toBe('Miễn phí');
    });

    it('should include child protection hotline', () => {
      const hotlines = crisisService.getHotlines();
      expect(hotlines.childProtection).toBeDefined();
      expect(hotlines.childProtection.number).toBe('111');
    });

    it('should include emergency number', () => {
      const hotlines = crisisService.getHotlines();
      expect(hotlines.emergency).toBeDefined();
      expect(hotlines.emergency.number).toBe('115');
    });
  });

  // ============================================
  // Integration: full flow simulation
  // ============================================
  describe('Full flow simulation', () => {
    it('should handle escalating conversation', () => {
      // Message 1: Normal
      const msg1 = crisisService.assessMessage('Hôm nay mình đi học');
      expect(msg1.level).toBe('NONE');

      // Message 2: Low stress
      const msg2 = crisisService.assessMessage('Mình stress quá vì bài tập');
      expect(msg2.level).toBe('LOW');
      const prompt2 = crisisService.getCrisisPromptAddition(msg2.level);
      expect(prompt2).toContain('đồng cảm');

      // Message 3: Medium distress
      const msg3 = crisisService.assessMessage('Mình cảm thấy vô vọng');
      expect(msg3.level).toBe('MEDIUM');

      // Message 4: High concern
      const msg4 = crisisService.assessMessage('Mình muốn biến mất khỏi đây');
      expect(msg4.level).toBe('HIGH');
      expect(msg4.shouldShowHotline).toBe(true);
      const prompt4 = crisisService.getCrisisPromptAddition(msg4.level);
      expect(prompt4).toContain('1800-599-920');

      // Message 5: Critical
      const msg5 = crisisService.assessMessage('Mình muốn chết');
      expect(msg5.level).toBe('CRITICAL');
      expect(msg5.shouldShowHotline).toBe(true);
      const prompt5 = crisisService.getCrisisPromptAddition(msg5.level);
      expect(prompt5).toContain('KHỦNG HOẢNG');
    });
  });
});
