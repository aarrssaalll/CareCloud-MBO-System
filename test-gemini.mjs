// Test Gemini API with manual environment variables
import fetch from 'node-fetch';

// Set environment variables manually since .env.local isn't loading
process.env.GOOGLE_APPLICATION_CREDENTIALS = "C:/Users/gulsherzahid/Documents/MBO/MBO keys/aiml.json";
process.env.GCP_PROJECT_ID = "aiml-365220";

const testData = {
  objective: {
    title: "Test Objective",
    description: "Testing Gemini API functionality",
    current: 60,
    target: 100
  },
  remarks: "This is a test with manual environment variables"
};

async function testGemini() {
  try {
    console.log('Environment variables:');
    console.log('GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
    console.log('GCP_PROJECT_ID:', process.env.GCP_PROJECT_ID);
    
    const response = await fetch('http://localhost:3000/api/ai-analyze-gemini?debug=1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log('Response status:', response.status);
    
    const result = await response.json();
    console.log('Response:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error testing Gemini API:', error);
  }
}

testGemini();
