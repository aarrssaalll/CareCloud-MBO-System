const path = require('path');

// Test Google Cloud authentication
async function testGoogleCloudAuth() {
  try {
    console.log('Testing Google Cloud Service Account...');
    
    // Check if service account file exists
    const serviceAccountPath = path.join(__dirname, 'google-service-account.json');
    const fs = require('fs');
    
    if (!fs.existsSync(serviceAccountPath)) {
      console.error('❌ Service account file not found');
      return;
    }
    
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    console.log('✅ Service account file loaded');
    console.log('📋 Project ID:', serviceAccount.project_id);
    console.log('📧 Service account email:', serviceAccount.client_email);
    
    // Test Vertex AI connection
    try {
      const { VertexAI } = require('@google-cloud/vertexai');
      
      // Set environment variable for authentication
      process.env.GOOGLE_APPLICATION_CREDENTIALS = serviceAccountPath;
      
      const vertex = new VertexAI({ 
        project: serviceAccount.project_id, 
        location: 'us-central1' 
      });
      
      console.log('✅ Vertex AI client initialized');
      
      // Try to get a model (this will test permissions)
      const model = vertex.getGenerativeModel({ model: 'gemini-1.5-flash' });
      console.log('✅ Gemini model accessed successfully');
      
      // Try a simple generation
      const result = await model.generateContent({
        contents: [{
          role: 'user',
          parts: [{ text: 'Respond with just "Hello from Gemini!" and nothing else.' }]
        }]
      });
      
      const response = result.response?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
      console.log('🤖 Gemini response:', response.trim());
      
    } catch (vertexError) {
      console.error('❌ Vertex AI error:', vertexError.message);
      
      // Test Google Generative AI (API key method) as fallback
      console.log('\n🔄 Testing Google Generative AI (API key method)...');
      console.log('You would need to set GEMINI_API_KEY in .env file');
    }
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
  }
}

testGoogleCloudAuth();
