require('dotenv').config();
const fetch = require('node-fetch');

async function testAuthenticationFlow() {
  console.log('🧪 Testing MBO Authentication Flow...\n');

  try {
    // Test with all seeded users
    const testUsers = [
      'admin@company.com',
      'john.manager@company.com', 
      'jane.developer@company.com',
      'bob.support@company.com'
    ];

    for (const email of testUsers) {
      console.log(`📝 Testing login for: ${email}`);
      
      const response = await fetch('http://localhost:3000/api/mbo/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Success! User: ${result.user.name} (${result.user.role})`);
        console.log(`   Department: ${result.user.departmentName || 'N/A'}`);
        console.log(`   Team: ${result.user.teamName || 'N/A'}`);
      } else {
        const errorText = await response.text();
        console.log(`❌ Failed: ${response.status} - ${errorText}`);
      }
      console.log('');
    }

    // Test data endpoint
    console.log('📊 Testing data retrieval...');
    const dataResponse = await fetch('http://localhost:3000/api/mbo/data');
    
    if (dataResponse.ok) {
      const data = await dataResponse.json();
      console.log('✅ Data endpoint working!');
      console.log(`   Users: ${data.users?.length || 0}`);
      console.log(`   Departments: ${data.departments?.length || 0}`);
      console.log(`   Teams: ${data.teams?.length || 0}`);
      console.log(`   Objectives: ${data.objectives?.length || 0}`);
    } else {
      const errorText = await dataResponse.text();
      console.log(`❌ Data retrieval failed: ${dataResponse.status} - ${errorText}`);
    }

    console.log('\n🎉 Authentication flow test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAuthenticationFlow();
