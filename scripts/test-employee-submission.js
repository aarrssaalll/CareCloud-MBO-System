async function testEmployeeSubmission() {
  try {
    // Test data
    const submissionData = {
      objectiveId: "test123",
      employeeRemarks: "I have completed this objective successfully. The target was achieved through consistent effort and collaboration with the team.",
      digitalSignature: "Test Employee"
    };

    console.log('🚀 Testing employee submission...');
    console.log('Data:', submissionData);

    const response = await fetch('http://localhost:3000/api/employee/submit-for-review', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(submissionData)
    });

    console.log('\n📊 Response Status:', response.status);

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Submission Result:');
      console.log('  Message:', result.message);
      console.log('  AI Scoring triggered:', result.aiScoring ? '❌ YES (Should be NO!)' : '✅ NO (Correct!)');
      
      if (result.objective) {
        console.log('  Updated Status:', result.objective.status);
        console.log('  Employee Remarks:', result.objective.employeeRemarks ? '✅ Saved' : '❌ Not saved');
        console.log('  AI Score:', result.objective.aiScore || 'None (Correct!)');
      }
    } else {
      const errorText = await response.text();
      console.error('❌ Submission failed:', response.status);
      console.error('Error:', errorText);
    }

  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
}

testEmployeeSubmission();
