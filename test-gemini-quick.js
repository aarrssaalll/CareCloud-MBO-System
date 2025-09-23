const https = require('https');
const http = require('http');

const postData = JSON.stringify({
  objective: {
    title: 'Test Objective',
    description: 'Test Description',
    current: 80,
    target: 100
  },
  remarks: 'Test remarks'
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/ai-analyze-gemini',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('RESPONSE:');
    try {
      const json = JSON.parse(data);
      console.log(JSON.stringify(json, null, 2));
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (e) => {
  console.error(`ERROR: ${e.message}`);
});

req.write(postData);
req.end();
