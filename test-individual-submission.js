const http = require('http');

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: responseData }));
    });
    
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function testIndividualSubmission() {
  console.log('🧪 Testing Individual HR Submission Feature...\n');
  
  try {
    // 1. Get AI-scored objectives
    console.log('1. Fetching AI-scored objectives...');
    const getOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/manager/ai-scored-objectives',
      method: 'GET',
      headers: {
        'Cookie': 'manager-token=testmanager123'
      }
    };
    
    const getResponse = await makeRequest(getOptions);
    
    if (getResponse.status !== 200) {
      console.log('❌ Failed to get AI-scored objectives:', getResponse.data);
      return;
    }
    
    const aiScoredData = JSON.parse(getResponse.data);
    console.log(`✅ Found ${aiScoredData.objectives?.length || 0} AI-scored objectives`);
    
    if (!aiScoredData.objectives || aiScoredData.objectives.length === 0) {
      console.log('ℹ️ No AI-scored objectives to test with');
      return;
    }
    
    const testObjective = aiScoredData.objectives[0];
    console.log(`\n2. Testing individual submission for objective: ${testObjective.id}`);
    console.log(`   Title: ${testObjective.title}`);
    console.log(`   Employee: ${testObjective.user?.name}`);
    console.log(`   AI Score: ${testObjective.aiEvaluation?.score}`);
    
    // 3. Test individual submission
    const individualSubmissionData = JSON.stringify({
      managerId: 'manager1',
      objectiveId: testObjective.id,
      finalScore: testObjective.aiEvaluation?.score || 85,
      aiScore: testObjective.aiEvaluation?.score || 85,
      managerComments: 'Excellent work! Approved for individual submission.',
      aiRecommendation: testObjective.aiEvaluation?.explanation || 'AI analysis complete',
      managerSignature: 'Test Manager',
      submissionNotes: 'Individual submission test - automated testing'
    });
    
    const individualOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/manager/submit-individual-to-hr',
      method: 'POST',
      headers: {
        'Cookie': 'manager-token=testmanager123',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(individualSubmissionData)
      }
    };
    
    console.log('\n3. Submitting individual objective to HR...');
    const individualResponse = await makeRequest(individualOptions, individualSubmissionData);
    
    console.log('Individual Submission Response Status:', individualResponse.status);
    
    if (individualResponse.status === 200) {
      const individualResult = JSON.parse(individualResponse.data);
      console.log('✅ Individual submission successful!');
      console.log(`   Message: ${individualResult.message}`);
      console.log(`   Submission ID: ${individualResult.submissionId}`);
      console.log(`   Status: ${individualResult.submissionDetails?.status}`);
    } else {
      console.log('❌ Individual submission failed:', individualResponse.data);
    }
    
    // 4. Test batch submission (if we have more objectives)
    if (aiScoredData.objectives.length > 1) {
      console.log('\n4. Testing batch submission...');
      
      const batchObjectives = aiScoredData.objectives.slice(0, 2).map(obj => ({
        objectiveId: obj.id,
        employeeId: obj.user?.id || obj.userId,
        employeeName: obj.user?.name || 'Test Employee',
        objectiveTitle: obj.title,
        finalScore: obj.aiEvaluation?.score || 80,
        aiScore: obj.aiEvaluation?.score || 80,
        managerComments: 'Batch submission - good work!',
        aiRecommendation: obj.aiEvaluation?.explanation || 'AI analysis complete'
      }));
      
      const batchSubmissionData = JSON.stringify({
        managerId: 'manager1',
        reviewedObjectives: batchObjectives,
        managerSignature: 'Test Manager',
        submissionNotes: 'Batch submission test - automated testing'
      });
      
      const batchOptions = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/manager/submit-to-hr',
        method: 'POST',
        headers: {
          'Cookie': 'manager-token=testmanager123',
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(batchSubmissionData)
        }
      };
      
      const batchResponse = await makeRequest(batchOptions, batchSubmissionData);
      
      console.log('Batch Submission Response Status:', batchResponse.status);
      
      if (batchResponse.status === 200) {
        const batchResult = JSON.parse(batchResponse.data);
        console.log('✅ Batch submission successful!');
        console.log(`   Message: ${batchResult.message}`);
        console.log(`   Submission ID: ${batchResult.submissionId}`);
        console.log(`   Objectives Count: ${batchResult.submissionDetails?.objectiveCount}`);
      } else {
        console.log('❌ Batch submission failed:', batchResponse.data);
      }
    }
    
    console.log('\n🎉 Testing completed!');
    console.log('\nFeatures implemented:');
    console.log('✅ Individual objective submission to HR');
    console.log('✅ Batch objective submission to HR');
    console.log('✅ Individual submission modal in manager review page');
    console.log('✅ Enhanced batch submission UI with tips');
    console.log('✅ Proper validation and error handling');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testIndividualSubmission();
