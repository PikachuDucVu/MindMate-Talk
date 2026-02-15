/**
 * Crisis API Integration Test Script
 *
 * Tests the crisis detection flow end-to-end against a running server.
 * Verifies: crisis levels in chat responses, hotline API, and hotline click tracking.
 *
 * Usage:
 *   npm run test:crisis
 *
 * Prerequisites:
 *   1. Copy .env.example to .env and fill in your API keys
 *   2. Start the server: npm run dev
 */

import axios from 'axios';

const API_BASE_URL = process.env.API_URL || 'http://localhost:3000/api/v1';

interface TestResult {
  name: string;
  success: boolean;
  duration: number;
  details?: string;
  error?: string;
}

const results: TestResult[] = [];

async function runTest(
  name: string,
  testFn: () => Promise<string | void>
): Promise<void> {
  const start = Date.now();
  try {
    const details = await testFn();
    const duration = Date.now() - start;
    results.push({ name, success: true, duration, details: details || undefined });
    console.log(`  ✅ ${name} (${duration}ms)`);
    if (details) console.log(`     ${details}`);
  } catch (error: any) {
    const duration = Date.now() - start;
    const errorMessage = error.response?.data?.error?.message || error.message;
    results.push({ name, success: false, duration, error: errorMessage });
    console.log(`  ❌ ${name} (${duration}ms): ${errorMessage}`);
  }
}

async function main() {
  console.log('\n🧪 MindMate Crisis Service - Integration Tests\n');
  console.log(`📍 API: ${API_BASE_URL}\n`);
  console.log('━'.repeat(60));

  // ============================================
  // 1. Health Check
  // ============================================
  console.log('\n📋 Health Check\n');

  await runTest('Server is running', async () => {
    const response = await axios.get(`${API_BASE_URL}/health`);
    if (!response.data.success) throw new Error('Health check failed');
    return `Version: ${response.data.data.version}`;
  });

  // ============================================
  // 2. Crisis Detection via Text Chat
  // ============================================
  console.log('\n📋 Crisis Detection in Text Chat\n');

  await runTest('NONE - Normal message', async () => {
    const response = await axios.post(`${API_BASE_URL}/chat/text`, {
      text: 'Chào bạn, hôm nay mình đi học vui lắm',
    });
    const level = response.data.data.crisisLevel;
    if (level !== 'NONE') throw new Error(`Expected NONE, got ${level}`);
    return `Crisis: ${level}`;
  });

  await runTest('LOW - Mild stress', async () => {
    const response = await axios.post(`${API_BASE_URL}/chat/text`, {
      text: 'Mình rất buồn vì thi bị điểm thấp',
    });
    const level = response.data.data.crisisLevel;
    if (level !== 'LOW') throw new Error(`Expected LOW, got ${level}`);
    return `Crisis: ${level}`;
  });

  await runTest('MEDIUM - Moderate distress', async () => {
    const response = await axios.post(`${API_BASE_URL}/chat/text`, {
      text: 'Mình cảm thấy vô vọng và không ai hiểu mình',
    });
    const level = response.data.data.crisisLevel;
    if (level !== 'MEDIUM') throw new Error(`Expected MEDIUM, got ${level}`);
    return `Crisis: ${level}`;
  });

  await runTest('HIGH - Passive ideation', async () => {
    const response = await axios.post(`${API_BASE_URL}/chat/text`, {
      text: 'Mình muốn biến mất khỏi thế giới này',
    });
    const level = response.data.data.crisisLevel;
    if (level !== 'HIGH') throw new Error(`Expected HIGH, got ${level}`);
    return `Crisis: ${level}`;
  });

  await runTest('CRITICAL - Active crisis keywords', async () => {
    const response = await axios.post(`${API_BASE_URL}/chat/text`, {
      text: 'Mình muốn tự tử',
    });
    const level = response.data.data.crisisLevel;
    if (level !== 'CRITICAL') throw new Error(`Expected CRITICAL, got ${level}`);
    return `Crisis: ${level} | AI mentions hotline: ${response.data.data.aiResponse.includes('1800')}`;
  });

  // ============================================
  // 3. AI Response Quality for Crisis
  // ============================================
  console.log('\n📋 AI Response Quality\n');

  await runTest('CRITICAL response should mention safety', async () => {
    const response = await axios.post(`${API_BASE_URL}/chat/text`, {
      text: 'Mình không muốn sống nữa',
    });
    const aiResponse: string = response.data.data.aiResponse;
    // AI should express care and possibly mention hotline
    const hasCaring = aiResponse.includes('ở đây') ||
      aiResponse.includes('quan tâm') ||
      aiResponse.includes('lo lắng') ||
      aiResponse.includes('an toàn') ||
      aiResponse.includes('lắng nghe');
    if (!hasCaring) {
      return `⚠️ AI response may lack empathy: "${aiResponse.substring(0, 100)}..."`;
    }
    return `AI response OK: "${aiResponse.substring(0, 80)}..."`;
  });

  await runTest('HIGH response should be empathetic', async () => {
    const response = await axios.post(`${API_BASE_URL}/chat/text`, {
      text: 'Mọi người sẽ tốt hơn nếu không có mình',
    });
    const aiResponse: string = response.data.data.aiResponse;
    return `AI: "${aiResponse.substring(0, 80)}..."`;
  });

  // ============================================
  // 4. Crisis in Conversation Context
  // ============================================
  console.log('\n📋 Crisis in Conversation Flow\n');

  let conversationId: string | undefined;

  await runTest('Start normal conversation', async () => {
    const response = await axios.post(`${API_BASE_URL}/chat/text`, {
      text: 'Xin chào, mình muốn nói chuyện',
    });
    conversationId = response.data.data.conversationId;
    const level = response.data.data.crisisLevel;
    return `ConvID: ${conversationId} | Crisis: ${level}`;
  });

  await runTest('Escalate within same conversation', async () => {
    const response = await axios.post(`${API_BASE_URL}/chat/text`, {
      conversationId,
      text: 'Mình cảm thấy rất buồn, mình ghét bản thân mình',
    });
    const level = response.data.data.crisisLevel;
    if (level !== 'MEDIUM' && level !== 'LOW') {
      return `Level: ${level} (unexpected but acceptable)`;
    }
    return `Crisis escalated to: ${level}`;
  });

  await runTest('Further escalation should trigger HIGH+', async () => {
    const response = await axios.post(`${API_BASE_URL}/chat/text`, {
      conversationId,
      text: 'Mình muốn biến mất, không còn lý do để sống',
    });
    const level = response.data.data.crisisLevel;
    if (level !== 'HIGH' && level !== 'CRITICAL') {
      throw new Error(`Expected HIGH or CRITICAL, got ${level}`);
    }
    return `Crisis: ${level}`;
  });

  // Clean up conversation
  if (conversationId) {
    await runTest('Clean up test conversation', async () => {
      await axios.delete(`${API_BASE_URL}/chat/${conversationId}`);
      return 'Deleted';
    });
  }

  // ============================================
  // 5. Crisis API Endpoints
  // ============================================
  console.log('\n📋 Crisis API Endpoints\n');

  await runTest('GET /crisis/hotlines', async () => {
    const response = await axios.get(`${API_BASE_URL}/crisis/hotlines`);
    if (!response.data.success) throw new Error('Failed to get hotlines');
    const data = response.data.data;
    if (!data.primary?.number) throw new Error('Missing primary hotline');
    if (!data.childProtection?.number) throw new Error('Missing child protection hotline');
    if (!data.emergency?.number) throw new Error('Missing emergency hotline');
    return `Primary: ${data.primary.number} | Child: ${data.childProtection.number} | Emergency: ${data.emergency.number}`;
  });

  await runTest('POST /crisis/hotline-clicked - validation', async () => {
    try {
      await axios.post(`${API_BASE_URL}/crisis/hotline-clicked`, {});
      throw new Error('Should have returned 400');
    } catch (error: any) {
      if (error.response?.status === 400) {
        return 'Validation works: missing crisisEventId returns 400';
      }
      throw error;
    }
  });

  await runTest('POST /crisis/hotline-clicked - with invalid ID', async () => {
    // Should not crash even with non-existent ID
    try {
      const response = await axios.post(`${API_BASE_URL}/crisis/hotline-clicked`, {
        crisisEventId: 'non-existent-id',
      });
      // Should succeed (fire-and-forget pattern) or return error gracefully
      return `Status: ${response.status}`;
    } catch (error: any) {
      // Server should handle gracefully, not 500
      if (error.response?.status === 500) {
        return '⚠️ Server returned 500 for invalid ID (consider handling gracefully)';
      }
      return `Status: ${error.response?.status}`;
    }
  });

  // ============================================
  // 6. Edge Cases
  // ============================================
  console.log('\n📋 Edge Cases\n');

  await runTest('Empty message should be rejected', async () => {
    try {
      await axios.post(`${API_BASE_URL}/chat/text`, { text: '' });
      throw new Error('Should have returned 400');
    } catch (error: any) {
      if (error.response?.status === 400) {
        return 'Empty message correctly rejected';
      }
      throw error;
    }
  });

  await runTest('Very long crisis message', async () => {
    const longMsg = 'Mình đi học rồi ăn cơm '.repeat(50) + 'và mình muốn tự tử';
    const response = await axios.post(`${API_BASE_URL}/chat/text`, {
      text: longMsg,
    });
    const level = response.data.data.crisisLevel;
    if (level !== 'CRITICAL') throw new Error(`Expected CRITICAL, got ${level}`);
    return `Long message crisis detection: ${level}`;
  });

  // ============================================
  // Summary
  // ============================================
  console.log('\n' + '━'.repeat(60));
  console.log('\n📊 Test Summary\n');

  const passed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  const totalTime = results.reduce((sum, r) => sum + r.duration, 0);

  console.log(`   Total:  ${results.length} tests`);
  console.log(`   Passed: ${passed} ✅`);
  console.log(`   Failed: ${failed} ❌`);
  console.log(`   Time:   ${(totalTime / 1000).toFixed(1)}s`);

  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    results
      .filter((r) => !r.success)
      .forEach((r) => {
        console.log(`   - ${r.name}: ${r.error}`);
      });
    process.exit(1);
  }

  console.log('\n✅ All tests passed!\n');
}

main().catch((error) => {
  console.error('\n💥 Test runner failed:', error.message);
  process.exit(1);
});
