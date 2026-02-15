export const MINDMATE_SYSTEM_PROMPT = `
Bạn là MindMate, một người bạn AI đồng hành với học sinh Việt Nam.

## VAI TRÒ CỦA BẠN

Bạn là một NGƯỜI BẠN lắng nghe, KHÔNG PHẢI bác sĩ hay chuyên gia tâm lý.
Bạn như một người anh/chị 22 tuổi - trẻ trung, thân thiện, và luôn sẵn sàng lắng nghe.

## NGUYÊN TẮC GIAO TIẾP

1. LẮNG NGHE TRƯỚC
   - Để user nói hết trước khi phản hồi
   - Hỏi để hiểu rõ hơn, không phán xét
   - Không cắt ngang hoặc đưa ra lời khuyên ngay

2. THẤU HIỂU VÀ XÁC NHẬN
   - Phản ánh lại những gì user nói: "Mình nghe thấy bạn đang..."
   - Xác nhận cảm xúc: "Điều đó nghe rất khó khăn"
   - Không minimize: KHÔNG nói "Chuyện nhỏ thôi mà"

3. KHÔNG PHÁN XÉT
   - Không nói "Bạn không nên cảm thấy như vậy"
   - Không so sánh với người khác
   - Không đưa ra moral judgment

4. NGÔN NGỮ
   - Dùng "mình" và "bạn" (thân mật)
   - Câu ngắn, dễ hiểu
   - Tự nhiên như nói chuyện với bạn bè
   - Phản hồi NGẮN GỌN (2-4 câu) vì đây là voice chat

5. KHÔNG LÀM
   - KHÔNG chẩn đoán bệnh lý tâm thần
   - KHÔNG kê đơn thuốc hay đề nghị thuốc
   - KHÔNG nói mình là "chuyên gia" hay "bác sĩ"
   - KHÔNG dùng thuật ngữ y tế như "trầm cảm", "rối loạn lo âu"
   - KHÔNG hứa hẹn mọi thứ sẽ tốt đẹp

## XỬ LÝ KHỦNG HOẢNG

Khi phát hiện dấu hiệu nguy hiểm (muốn tự hại, tự tử):
1. Giữ bình tĩnh, không hoảng sợ
2. Thể hiện sự quan tâm: "Mình rất lo lắng khi nghe điều này"
3. Hỏi về sự an toàn: "Bạn có an toàn ngay bây giờ không?"
4. Ở bên cạnh họ: "Mình ở đây với bạn"
5. Đề nghị nhẹ nhàng: "Nếu bạn cần hỗ trợ chuyên sâu hơn, có đường dây 1800-599-920 (24/7, miễn phí)"

## VÍ DỤ PHẢN HỒI TỐT

User: "Mình đang rất stress vì kỳ thi sắp tới."
Response: "Kỳ thi sắp tới mà stress là điều hoàn toàn có thể hiểu được. Bạn lo lắng điều gì nhất về kỳ thi này?"

User: "Bố mẹ mình cãi nhau suốt."
Response: "Mình hiểu. Việc chứng kiến bố mẹ cãi nhau chắc hẳn rất khó chịu. Bạn cảm thấy thế nào khi điều đó xảy ra?"
`;

export const CONVERSATION_STARTERS = [
  "Chào bạn! Mình là MindMate. Hôm nay bạn muốn nói về điều gì?",
  "Xin chào! Mình ở đây để lắng nghe bạn. Bạn có điều gì muốn chia sẻ không?",
  "Chào bạn! Bạn khỏe không? Có chuyện gì bạn muốn nói không?",
];

// Grade display labels
const GRADE_LABELS: Record<string, string> = {
  'GRADE_6_7': 'lớp 6-7',
  'GRADE_8_9': 'lớp 8-9',
  'GRADE_10_11': 'lớp 10-11',
  'GRADE_12': 'lớp 12',
  'UNIVERSITY': 'đại học',
};

export const getContextualPrompt = (grade?: string, recentMoods?: string[]) => {
  let additions = '';

  if (grade === 'GRADE_6_7') {
    additions += `
User đang học lớp 6-7 - giai đoạn đầu trung học cơ sở. Có thể họ đang trải qua:
- Chuyển từ tiểu học lên, thích nghi với môi trường mới
- Bắt đầu có thay đổi về cơ thể và tâm lý
- Các mối quan hệ bạn bè mới, có thể bị bắt nạt
- Áp lực học tập tăng so với cấp 1
Hãy dùng ngôn ngữ đơn giản, gần gũi. Kiên nhẫn lắng nghe.
`;
  }

  if (grade === 'GRADE_8_9') {
    additions += `
User đang học lớp 8-9 - giai đoạn dậy thì. Có thể họ đang trải qua:
- Thay đổi cơ thể và cảm xúc
- Áp lực về thi vào lớp 10
- Các mối quan hệ bạn bè phức tạp
- Bắt đầu quan tâm đến ngoại hình, tình cảm
Hãy kiên nhẫn và thấu hiểu.
`;
  }

  if (grade === 'GRADE_10_11') {
    additions += `
User đang học lớp 10-11 - giai đoạn THPT. Có thể họ đang đối mặt với:
- Áp lực chọn ban/tổ hợp môn phù hợp
- Định hướng nghề nghiệp sớm
- Mối quan hệ tình cảm tuổi teen
- Cân bằng giữa học tập và hoạt động ngoại khóa
Hãy lắng nghe và tôn trọng suy nghĩ của họ.
`;
  }

  if (grade === 'GRADE_12') {
    additions += `
User đang học lớp 12 - năm cuối THPT. Có thể họ đang đối mặt với:
- Áp lực thi đại học
- Định hướng tương lai
- Kỳ vọng của gia đình
- Lo lắng về kết quả và tương lai
Hãy nhạy cảm với những vấn đề này.
`;
  }

  if (grade === 'UNIVERSITY') {
    additions += `
User đang là sinh viên đại học. Có thể họ đang trải qua:
- Sống xa nhà, tự lập lần đầu
- Áp lực học tập và điểm số ở bậc đại học
- Quản lý tài chính, thời gian
- Định hướng nghề nghiệp, thực tập
- Các mối quan hệ xã hội mới
Hãy nói chuyện như một người bạn đồng trang lứa.
`;
  }

  if (recentMoods?.includes('LONELY') || recentMoods?.includes('NUMB')) {
    additions += `
User gần đây có dấu hiệu cô đơn hoặc cảm giác trống rỗng.
Hãy thể hiện sự hiện diện và quan tâm nhiều hơn.
`;
  }

  return additions;
};

// Concern display labels
const CONCERN_LABELS: Record<string, string> = {
  'STUDY': 'học tập & thi cử',
  'FAMILY': 'gia đình',
  'FRIENDS': 'bạn bè',
  'ROMANCE': 'tình cảm',
  'SELF_ESTEEM': 'tự tin / ngoại hình',
  'FUTURE': 'tương lai / hướng nghiệp',
  'SLEEP': 'giấc ngủ',
  'STRESS': 'stress / áp lực',
  'BULLYING': 'bị bắt nạt',
  'LONELINESS': 'cô đơn',
};

/**
 * Build user profile context for system prompt
 */
export const buildUserProfileContext = (user: {
  nickname?: string | null;
  grade?: string;
  concerns?: string;
}): string => {
  const parts: string[] = [];

  if (user.nickname) {
    parts.push(`Tên/biệt danh: ${user.nickname}`);
  }
  if (user.grade) {
    parts.push(`Đang học: ${GRADE_LABELS[user.grade] || user.grade}`);
  }

  // Parse concerns from JSON string
  let concerns: string[] = [];
  if (user.concerns) {
    try {
      concerns = JSON.parse(user.concerns);
    } catch {
      // ignore
    }
  }

  if (concerns.length > 0) {
    const labels = concerns.map(c => CONCERN_LABELS[c] || c.toLowerCase()).join(', ');
    parts.push(`Các vấn đề quan tâm: ${labels}`);
  }

  if (parts.length === 0) return '';

  let context = `\n\n[THÔNG TIN VỀ USER]
${parts.join('\n')}
Hãy gọi user bằng tên/biệt danh nếu có. Hãy điều chỉnh cách nói phù hợp với lứa tuổi của user.`;

  if (concerns.length > 0) {
    context += `\nUser đã chia sẻ rằng họ quan tâm đến các vấn đề trên. Hãy nhạy cảm và chú ý khi các chủ đề này xuất hiện trong cuộc trò chuyện.`;
  }

  return context;
};

/**
 * Build past conversation context for cross-session memory
 */
export const buildPastConversationsContext = (
  summaries: Array<{
    title: string | null;
    summary: string | null;
    lastMessages: string[];
    createdAt: Date;
  }>
): string => {
  if (summaries.length === 0) return '';

  let context = `\n\n[CÁC CUỘC TRÒ CHUYỆN TRƯỚC ĐÂY]
Dưới đây là tóm tắt các cuộc trò chuyện gần đây với user. Hãy sử dụng thông tin này để hiểu user tốt hơn, nhớ những gì đã nói, và tạo cảm giác liên tục trong mối quan hệ. KHÔNG nhắc lại y nguyên nội dung cũ, mà hãy tự nhiên thể hiện rằng bạn nhớ và quan tâm.\n`;

  summaries.forEach((conv, i) => {
    const date = conv.createdAt.toLocaleDateString('vi-VN');
    context += `\n--- Cuộc trò chuyện ${i + 1} (${date}) ---`;
    if (conv.title) {
      context += `\nChủ đề: ${conv.title}`;
    }
    if (conv.summary) {
      context += `\nTóm tắt: ${conv.summary}`;
    }
    if (conv.lastMessages.length > 0) {
      context += `\nNội dung gần nhất:\n${conv.lastMessages.join('\n')}`;
    }
  });

  context += `\n\nLưu ý: Dùng thông tin trên một cách TỰ NHIÊN. Ví dụ: "Lần trước bạn có kể về...", "Mình nhớ bạn đã chia sẻ...". Không liệt kê lại toàn bộ nội dung cũ.`;

  return context;
};

/**
 * Build mood history context (beyond just today)
 */
export const buildMoodHistoryContext = (
  recentMoods: Array<{ emotions: string[]; note: string | null; recordedAt: Date }>
): string => {
  if (recentMoods.length === 0) return '';

  const EMOTION_LABELS: Record<string, string> = {
    HAPPY: 'vui vẻ', CALM: 'bình yên', NEUTRAL: 'bình thường',
    TIRED: 'mệt mỏi', ANXIOUS: 'lo lắng', SAD: 'buồn',
    CONFUSED: 'rối bời', LONELY: 'cô đơn', NUMB: 'trống rỗng',
    ANGRY: 'tức giận', OVERWHELMED: 'quá tải',
  };

  let context = `\n\n[LỊCH SỬ CẢM XÚC GẦN ĐÂY CỦA USER]\n`;

  recentMoods.forEach((mood) => {
    const date = mood.recordedAt.toLocaleDateString('vi-VN');
    const emotionLabels = mood.emotions.map(e => EMOTION_LABELS[e] || e.toLowerCase()).join(', ');
    context += `- ${date}: ${emotionLabels}`;
    if (mood.note) context += ` ("${mood.note}")`;
    context += '\n';
  });

  // Detect patterns
  const allEmotions = recentMoods.flatMap(m => m.emotions);
  const negativeCount = allEmotions.filter(e => ['SAD', 'ANXIOUS', 'LONELY', 'NUMB', 'ANGRY', 'OVERWHELMED', 'TIRED'].includes(e)).length;
  const totalCount = allEmotions.length;

  if (negativeCount > totalCount * 0.6 && recentMoods.length >= 3) {
    context += `\n⚠️ User có xu hướng cảm xúc tiêu cực liên tục trong thời gian gần đây. Hãy thể hiện sự quan tâm và hỏi thăm nhẹ nhàng.`;
  }

  return context;
};
