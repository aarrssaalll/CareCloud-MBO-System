require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findAssignedObjective() {
  try {
    const assigned = await prisma.mboObjective.findMany({
      where: { status: 'ASSIGNED' },
      include: { user: true },
      take: 3
    });
    
    console.log('Found', assigned.length, 'ASSIGNED objectives:');
    assigned.forEach(obj => {
      console.log(`  ID: ${obj.id} | User: ${obj.user.name} | Title: ${obj.title}`);
    });
    
    // Test with the first one if available
    if (assigned.length > 0) {
      const testObj = assigned[0];
      console.log(`\n🧪 Testing submission with objective: ${testObj.id}`);
      
      const submissionData = {
        objectiveId: testObj.id,
        employeeRemarks: "I have completed this objective successfully. The target was achieved through consistent effort and collaboration with the team.",
        digitalSignature: testObj.user.name
      };

      const response = await fetch('http://localhost:3000/api/employee/submit-for-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });

      console.log('📊 Response Status:', response.status);

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
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    await prisma.$disconnect();
  }
}

findAssignedObjective();
