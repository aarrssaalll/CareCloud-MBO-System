// Debug the submit-to-HR API issue
async function debugSubmitToHR() {
  try {
    console.log('🔍 Debugging submit-to-HR API...\n');

    // Test using curl instead
    console.log('Testing with curl command...');
    console.log('Run this command manually:');
    console.log('curl -X GET "http://localhost:3001/api/manager/ai-scored-objectives?managerId=cmev046tz000nhz6sn9vkj77c"');
    
  } catch (error) {
    console.error('❌ Debug test failed:', error.message);
  }
}

debugSubmitToHR();

debugSubmitToHR();
