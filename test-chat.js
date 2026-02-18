
const fetch = require('node-fetch');

async function testChat() {
  const response = await fetch('http://localhost:5173/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // We need a token if it's protected
    },
    body: JSON.stringify({
      messages: [
        { id: '1', role: 'user', content: 'hello' }
      ],
      sessionId: 'test-session'
    })
  });

  const data = await response.text();
  console.log('Status:', response.status);
  console.log('Response:', data);
}

testChat();
