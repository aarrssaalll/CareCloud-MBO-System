// Set the service account path explicitly
process.env.GOOGLE_APPLICATION_CREDENTIALS = 'c:\\Users\\muhammadarsal3\\Music\\MBO\\carecloud-mbo-system\\google-service-account.json';

const { VertexAI } = require('@google-cloud/vertexai');

async function testVertexDirect() {
  try {
    console.log('🧪 Testing Vertex AI directly...');
    
    // Using your exact environment values
    const vertex = new VertexAI({ 
      project: 'aiml-365220', 
      location: 'us-central1' 
    });
    
    const model = vertex.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = 'Respond with JSON only: {"score": 85, "feedback": "Test response from Vertex AI", "recommendations": ["Test recommendation"]}';
    
    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }]
    });
    
    const candidates = result?.response?.candidates || [];
    const text = candidates[0]?.content?.parts?.[0]?.text || '';
    
    console.log('✅ Vertex AI Response:', text);
    
    try {
      const parsed = JSON.parse(text);
      console.log('✅ Parsed JSON:', parsed);
      console.log('🎉 SUCCESS: Vertex AI is working with your service account!');
    } catch (parseError) {
      console.log('⚠️  Response received but not valid JSON:', text);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('permission')) {
      console.log('💡 Tip: Your service account needs Vertex AI permissions');
    } else if (error.message.includes('not found')) {
      console.log('💡 Tip: Check if Vertex AI API is enabled in your project');
    }
  }
}

testVertexDirect();
