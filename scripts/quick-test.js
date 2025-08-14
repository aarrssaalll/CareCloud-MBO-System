const fetch = require('node-fetch');

async function quickTest() {
  console.log('🧪 Quick API test...');
  
  try {
    // Test if server is responding
    const response = await fetch('http://localhost:3000/api/mbo/auth', {
      method: 'GET'
    });
    
    console.log('✅ Server is responding!');
    console.log('Status:', response.status);
    console.log('Response:', await response.text());
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

quickTest();
