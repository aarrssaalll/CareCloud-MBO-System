console.log('🧪 Testing Submit to HR Workflow Fix...');

const http = require('http');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data,
          headers: res.headers
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function testSubmitToHR() {
  try {
    // First, check if we have any AI_SCORED objectives
    console.log('\n1. Checking for AI_SCORED objectives...');
    
    const checkOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/manager/ai-scored-objectives',
      method: 'GET',
      headers: {
        'Cookie': 'manager-token=testmanager123',
        'Content-Type': 'application/json'
      }
    };
    
    const checkResponse = await makeRequest(checkOptions);
    
    if (checkResponse.status !== 200) {
      console.log('❌ Failed to fetch AI-scored objectives:', checkResponse.status);
      console.log('Response:', checkResponse.data);
      return;
    }
    
    const aiScoredData = JSON.parse(checkResponse.data);
    console.log('📊 AI-scored objectives found:', aiScoredData.objectives?.length || 0);
    
    if (!aiScoredData.objectives || aiScoredData.objectives.length === 0) {
      console.log('ℹ️ No AI-scored objectives to test with');
      return;
    }
    
    const testObjective = aiScoredData.objectives[0];
    console.log('\n2. Testing submit to HR for objective:', testObjective.id);
    console.log('   Title:', testObjective.title);
    console.log('   Current Status:', testObjective.status);
    
    // Submit to HR
    const submitData = JSON.stringify({
      objectiveId: testObjective.id,
      managerRemarks: 'Final approval - good work!',
      overrideScore: null
    });
    
    const submitOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/manager/submit-to-hr',
      method: 'POST',
      headers: {
        'Cookie': 'manager-token=testmanager123',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(submitData)
      }
    };
    
    const submitResponse = await makeRequest(submitOptions, submitData);
    
    console.log('\n3. Submit to HR Response Status:', submitResponse.status);
    
    if (submitResponse.status !== 200) {
      console.log('❌ Submit to HR failed:', submitResponse.data);
      return;
    }
    
    const submitResult = JSON.parse(submitResponse.data);
    console.log('✅ Submit to HR successful:', submitResult.message);
    
    // Verify the objective is no longer in AI-scored list
    console.log('\n4. Verifying objective removed from manager review...');
    
    const verifyResponse = await makeRequest(checkOptions);
    
    if (verifyResponse.status === 200) {
      const verifyData = JSON.parse(verifyResponse.data);
      const stillThere = verifyData.objectives?.find(obj => obj.id === testObjective.id);
      
      if (stillThere) {
        console.log('❌ Objective still in manager review page');
      } else {
        console.log('✅ Objective successfully removed from manager review page');
      }
      
      console.log('📊 Remaining AI-scored objectives:', verifyData.objectives?.length || 0);
    }
    
    console.log('\n🎉 Submit to HR workflow test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSubmitToHR();
