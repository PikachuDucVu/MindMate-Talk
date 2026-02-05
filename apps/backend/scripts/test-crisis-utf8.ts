// Quick test for crisis detection with proper UTF-8
const testCases = [
  { text: 'Mình cảm thấy vô vọng', expectedLevel: 'MEDIUM' },
  { text: 'Không ai hiểu mình', expectedLevel: 'MEDIUM' },
  { text: 'Mình rất buồn', expectedLevel: 'LOW' },
  { text: 'Hôm nay mình đi học', expectedLevel: 'NONE' },
];

async function runTests() {
  console.log('\n🧪 Crisis Detection UTF-8 Tests\n');

  for (const tc of testCases) {
    try {
      const res = await fetch('http://localhost:3000/api/v1/chat/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: tc.text }),
      });
      const data = await res.json();

      const level = data.data?.crisisLevel || 'ERROR';
      const match = level === tc.expectedLevel ? '✅' : '⚠️';

      console.log(`${match} "${tc.text}"`);
      console.log(`   Expected: ${tc.expectedLevel}, Got: ${level}`);
      console.log(`   AI: ${data.data?.aiResponse?.substring(0, 60)}...\n`);
    } catch (err: any) {
      console.log(`❌ "${tc.text}": ${err.message}\n`);
    }
  }
}

runTests();
