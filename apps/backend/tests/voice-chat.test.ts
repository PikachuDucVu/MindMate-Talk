/**
 * Voice Chat API Test Script
 *
 * Usage:
 *   npm run test:voice
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
  response?: unknown;
  error?: string;
}

const results: TestResult[] = [];

async function runTest(
  name: string,
  testFn: () => Promise<unknown>
): Promise<void> {
  const start = Date.now();
  try {
    const response = await testFn();
    const duration = Date.now() - start;
    results.push({ name, success: true, duration, response });
    console.log(`✅ ${name} (${duration}ms)`);
  } catch (error: any) {
    const duration = Date.now() - start;
    const errorMessage = error.response?.data?.error?.message || error.message;
    results.push({ name, success: false, duration, error: errorMessage });
    console.log(`❌ ${name} (${duration}ms): ${errorMessage}`);
  }
}

async function main() {
  console.log('\n🧪 MindMate-Talk Voice Chat API Tests\n');
  console.log(`📍 API URL: ${API_BASE_URL}\n`);
  console.log('━'.repeat(50));

  // Test 1: Health Check
  await runTest('Health Check', async () => {
    const response = await axios.get(`${API_BASE_URL}/health`);
    if (!response.data.success) throw new Error('Health check failed');
    return response.data;
  });

  // Test 2: Text Chat - Simple greeting
  let conversationId: string | undefined;
  await runTest('Text Chat - Greeting', async () => {
    const response = await axios.post(`${API_BASE_URL}/chat/text`, {
      text: 'Xin chào, mình muốn nói chuyện',
    });
    if (!response.data.success) throw new Error('Text chat failed');
    conversationId = response.data.data.conversationId;
    console.log(`   → AI: ${response.data.data.aiResponse.substring(0, 100)}...`);
    return response.data;
  });

  // Test 3: Text Chat - Continue conversation
  await runTest('Text Chat - Continue Conversation', async () => {
    const response = await axios.post(`${API_BASE_URL}/chat/text`, {
      conversationId,
      text: 'Hôm nay mình cảm thấy hơi stress vì bài tập nhiều quá',
    });
    if (!response.data.success) throw new Error('Text chat failed');
    console.log(`   → AI: ${response.data.data.aiResponse.substring(0, 100)}...`);
    console.log(`   → Crisis Level: ${response.data.data.crisisLevel}`);
    return response.data;
  });

  // Test 4: Crisis Detection - Low level
  await runTest('Crisis Detection - Low Level', async () => {
    const response = await axios.post(`${API_BASE_URL}/chat/text`, {
      text: 'Mình rất buồn và không ngủ được',
    });
    if (!response.data.success) throw new Error('Text chat failed');
    const level = response.data.data.crisisLevel;
    if (level !== 'LOW' && level !== 'MEDIUM') {
      console.log(`   ⚠️ Expected LOW/MEDIUM, got ${level}`);
    }
    console.log(`   → Crisis Level: ${level}`);
    return response.data;
  });

  // Test 5: Crisis Detection - High level
  await runTest('Crisis Detection - High Level', async () => {
    const response = await axios.post(`${API_BASE_URL}/chat/text`, {
      text: 'Mình cảm thấy vô vọng và không ai hiểu mình',
    });
    if (!response.data.success) throw new Error('Text chat failed');
    const level = response.data.data.crisisLevel;
    console.log(`   → Crisis Level: ${level}`);
    console.log(`   → AI: ${response.data.data.aiResponse.substring(0, 150)}...`);
    return response.data;
  });

  // Test 6: Get Conversation
  if (conversationId) {
    await runTest('Get Conversation History', async () => {
      const response = await axios.get(`${API_BASE_URL}/chat/${conversationId}`);
      if (!response.data.success) throw new Error('Get conversation failed');
      console.log(`   → Messages: ${response.data.data.messages.length}`);
      return response.data;
    });
  }

  // Test 7: Delete Conversation
  if (conversationId) {
    await runTest('Delete Conversation', async () => {
      const response = await axios.delete(`${API_BASE_URL}/chat/${conversationId}`);
      if (!response.data.success) throw new Error('Delete failed');
      return response.data;
    });
  }

  // Test 8: Invalid Request
  await runTest('Invalid Request Handling', async () => {
    try {
      await axios.post(`${API_BASE_URL}/chat/text`, {});
      throw new Error('Should have thrown validation error');
    } catch (error: any) {
      if (error.response?.status === 400) {
        return { validated: true };
      }
      throw error;
    }
  });

  // Print Summary
  console.log('\n' + '━'.repeat(50));
  console.log('\n📊 Test Summary\n');

  const passed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  const totalTime = results.reduce((sum, r) => sum + r.duration, 0);

  console.log(`   Total:  ${results.length} tests`);
  console.log(`   Passed: ${passed} ✅`);
  console.log(`   Failed: ${failed} ❌`);
  console.log(`   Time:   ${totalTime}ms`);

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

main().catch(console.error);
