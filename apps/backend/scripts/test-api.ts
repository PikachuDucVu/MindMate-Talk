#!/usr/bin/env node
/**
 * Quick test script to verify the API is working
 *
 * Usage:
 *   1. Start the server: npm run dev (in another terminal)
 *   2. Run this script: npx tsx scripts/test-api.ts
 */

const API_URL = process.env.API_URL || 'http://localhost:3000/api/v1';

async function main() {
  console.log('\n🧪 Quick API Test\n');
  console.log(`API: ${API_URL}\n`);

  try {
    // Health check
    console.log('1. Health Check...');
    const healthRes = await fetch(`${API_URL}/health`);
    const health = await healthRes.json();
    if (health.success) {
      console.log('   ✅ Server is healthy\n');
    } else {
      throw new Error('Health check failed');
    }

    // Text chat
    console.log('2. Text Chat...');
    const chatRes = await fetch(`${API_URL}/chat/text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Xin chào' }),
    });
    const chat = await chatRes.json();
    if (chat.success) {
      console.log(`   ✅ Got response: "${chat.data.aiResponse.substring(0, 50)}..."`);
      console.log(`   📍 Conversation ID: ${chat.data.conversationId}`);
      console.log(`   🚨 Crisis Level: ${chat.data.crisisLevel}\n`);
    } else {
      console.log(`   ❌ Error: ${chat.error?.message || 'Unknown'}\n`);
    }

    console.log('✅ All tests passed!\n');
  } catch (error: any) {
    if (error.cause?.code === 'ECONNREFUSED') {
      console.log('❌ Server is not running. Start it with: npm run dev\n');
    } else {
      console.log(`❌ Error: ${error.message}\n`);
    }
    process.exit(1);
  }
}

main();
