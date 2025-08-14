// Simple test to verify API endpoints are working
const testAuth = async () => {
  try {
    console.log('🧪 Testing authentication API...');
    
    // Test GET request first
    const getResponse = await fetch('http://localhost:3000/api/mbo/auth');
    const getResult = await getResponse.json();
    console.log('GET /api/mbo/auth:', getResult);

    // Test POST request
    const postResponse = await fetch('http://localhost:3000/api/mbo/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email: 'crystal.williams@company.com',
        password: 'test' 
      }),
    });
    
    const postResult = await postResponse.json();
    console.log('POST /api/mbo/auth result:', postResult);
    
    // Test data API
    const dataResponse = await fetch('http://localhost:3000/api/mbo/data?type=users');
    const dataResult = await dataResponse.json();
    console.log('GET /api/mbo/data?type=users:', dataResult);
    
  } catch (error) {
    console.error('API test error:', error);
  }
};

// Only run if this is executed directly
if (typeof window === 'undefined') {
  testAuth();
}
