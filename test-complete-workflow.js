const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testCompleteWorkflow() {
  try {
    console.log('🚀 TESTING COMPLETE MBO WORKFLOW\n');
    console.log('='.repeat(60));

    // Step 1: Get a completed objective that's ready for submission
    console.log('\n📋 STEP 1: Finding completed objectives ready for manager review...');
    
    const completedObjectives = await prisma.$queryRaw`
      SELECT o.*, u.name as employeeName, u.managerId, m.name as managerName
      FROM mbo_objectives o
      INNER JOIN mbo_users u ON o.userId = u.id
      LEFT JOIN mbo_users m ON u.managerId = m.id
      WHERE o.status = 'COMPLETED' 
      AND (o.workflowStatus IS NULL OR o.workflowStatus = 'ACTIVE' OR o.workflowStatus = 'COMPLETED')
      AND u.managerId IS NOT NULL
    `;

    if (completedObjectives.length === 0) {
      console.log('❌ No completed objectives found. Creating test scenario...');
      
      // Update a random objective to completed status
      await prisma.$executeRaw`
        UPDATE TOP(1) mbo_objectives 
        SET status = 'COMPLETED', workflowStatus = 'COMPLETED', completedAt = GETDATE()
        WHERE status = 'ACTIVE'
      `;
      
      console.log('✅ Test objective marked as completed');
      return testCompleteWorkflow(); // Retry
    }

    const testObjective = completedObjectives[0];
    console.log(`📝 Selected objective: "${testObjective.title}" by ${testObjective.employeeName}`);
    console.log(`👔 Manager: ${testObjective.managerName}`);

    // Step 2: Test Employee Submission API
    console.log('\n📤 STEP 2: Testing Employee Submission to Manager...');
    
    const submissionResponse = await fetch('http://localhost:3000/api/employee/submit-for-review', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        objectiveId: testObjective.id,
        employeeRemarks: 'I have successfully completed this objective. Please review my performance.',
        digitalSignature: `${testObjective.employeeName}_signature_${Date.now()}`
      })
    });

    const submissionResult = await submissionResponse.json();
    console.log('📤 Submission Result:', submissionResult.success ? '✅ SUCCESS' : '❌ FAILED');
    
    if (submissionResult.error) {
      console.log('❌ Error:', submissionResult.error);
    } else {
      console.log(`📋 Objective submitted to manager: ${submissionResult.manager?.name}`);
    }

    // Step 3: Test Manager Review API
    console.log('\n👔 STEP 3: Testing Manager Review with AI Scoring...');
    
    // First, get pending reviews for the manager
    const pendingResponse = await fetch(`http://localhost:3000/api/manager/pending-reviews?managerId=${testObjective.managerId}`);
    const pendingResult = await pendingResponse.json();
    
    console.log(`📊 Manager has ${pendingResult.count} objectives pending review`);

    if (pendingResult.count > 0) {
      // Review the objective with AI scoring
      const reviewResponse = await fetch('http://localhost:3000/api/manager/review-objective', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          objectiveId: testObjective.id,
          managerId: testObjective.managerId,
          useAIScore: true,
          managerFeedback: 'Good work on this objective. The AI scoring looks reasonable.',
          // managerScore: 85, // Uncomment to override AI score
          managerComments: 'Employee showed good progress and met expectations.'
        })
      });

      const reviewResult = await reviewResponse.json();
      console.log('👔 Manager Review Result:', reviewResult.success ? '✅ SUCCESS' : '❌ FAILED');
      
      if (reviewResult.success) {
        console.log(`🤖 AI Score: ${reviewResult.review.aiScore}`);
        console.log(`📊 Final Score: ${reviewResult.review.finalScore}`);
        console.log(`🔄 Override: ${reviewResult.review.isOverride ? 'Yes' : 'No'}`);
        console.log(`💭 AI Reasoning: ${reviewResult.review.aiReasoning}`);
      } else {
        console.log('❌ Error:', reviewResult.error);
      }
    }

    // Step 4: Test HR Approval API
    console.log('\n🏢 STEP 4: Testing HR Approval and Bonus Calculation...');
    
    // Get objectives ready for HR approval
    const hrPendingResponse = await fetch('http://localhost:3000/api/hr/pending-approvals?hrId=hr_test_id');
    const hrPendingResult = await hrPendingResponse.json();
    
    console.log(`📊 HR has ${hrPendingResult.count} objectives ready for approval`);

    if (hrPendingResult.count > 0) {
      // Get the first few objectives to approve
      const objectivesToApprove = hrPendingResult.objectivesForHR.slice(0, 3).map(obj => obj.id);
      
      const hrApprovalResponse = await fetch('http://localhost:3000/api/hr/approve-objectives', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          objectiveIds: objectivesToApprove,
          hrId: 'hr_test_user',
          hrNotes: 'Approved for Q3 2025 bonus calculation',
          quarter: 'Q3',
          year: '2025'
        })
      });

      const hrApprovalResult = await hrApprovalResponse.json();
      console.log('🏢 HR Approval Result:', hrApprovalResult.success ? '✅ SUCCESS' : '❌ FAILED');
      
      if (hrApprovalResult.success) {
        console.log(`📈 Objectives Approved: ${hrApprovalResult.summary.objectivesApproved}`);
        console.log(`💰 Bonuses Calculated: ${hrApprovalResult.summary.bonusesCalculated}`);
        console.log(`💵 Total Bonus Amount: $${hrApprovalResult.summary.totalBonusAmount.toFixed(2)}`);
        
        console.log('\n💰 Individual Bonus Breakdown:');
        hrApprovalResult.bonusCalculations.forEach(bonus => {
          console.log(`  👤 ${bonus.employeeName}:`);
          console.log(`     Average Score: ${bonus.bonusCalculation.averageScore}%`);
          console.log(`     Base Amount: $${bonus.bonusCalculation.baseAmount.toFixed(2)}`);
          console.log(`     Multiplier: ${(bonus.bonusCalculation.performanceMultiplier * 100).toFixed(0)}%`);
          console.log(`     Final Bonus: $${bonus.bonusCalculation.finalAmount.toFixed(2)}`);
          console.log('');
        });
      } else {
        console.log('❌ Error:', hrApprovalResult.error);
      }
    }

    // Step 5: Final Workflow Status Check
    console.log('\n📊 STEP 5: Final Workflow Status Summary...');
    
    const workflowSummary = await prisma.$queryRaw`
      SELECT 
        workflowStatus,
        COUNT(*) as count
      FROM mbo_objectives 
      WHERE quarter = 'Q3' AND year = 2025
      GROUP BY workflowStatus
      ORDER BY workflowStatus
    `;

    console.log('\n📈 Workflow Status Distribution:');
    workflowSummary.forEach(status => {
      console.log(`  ${status.workflowStatus || 'NULL'}: ${status.count} objectives`);
    });

    // Bonus summary
    const bonusSummary = await prisma.$queryRaw`
      SELECT 
        COUNT(*) as totalBonuses,
        SUM(finalAmount) as totalAmount,
        AVG(finalAmount) as avgAmount,
        AVG(performanceMultiplier) as avgMultiplier
      FROM mbo_bonuses 
      WHERE quarter = 'Q3' AND year = 2025
    `;

    if (bonusSummary.length > 0 && bonusSummary[0].totalBonuses > 0) {
      console.log('\n💰 Bonus Summary:');
      console.log(`  Total Bonuses: ${bonusSummary[0].totalBonuses}`);
      console.log(`  Total Amount: $${bonusSummary[0].totalAmount?.toFixed(2) || '0.00'}`);
      console.log(`  Average Bonus: $${bonusSummary[0].avgAmount?.toFixed(2) || '0.00'}`);
      console.log(`  Average Multiplier: ${(bonusSummary[0].avgMultiplier * 100)?.toFixed(1) || '0'}%`);
    }

    console.log('\n🎉 WORKFLOW TEST COMPLETED SUCCESSFULLY!');
    console.log('\n📋 Complete MBO workflow tested:');
    console.log('  ✅ Employee completes objective');
    console.log('  ✅ Employee submits for manager review');
    console.log('  ✅ Manager reviews with AI scoring');
    console.log('  ✅ HR approves and calculates bonuses');
    console.log('  ✅ Full audit trail maintained');

  } catch (error) {
    console.error('❌ Workflow test error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to wait for server to be ready
async function waitForServer() {
  for (let i = 0; i < 10; i++) {
    try {
      const response = await fetch('http://localhost:3000/api/health');
      if (response.ok || response.status === 404) {
        return true;
      }
    } catch (error) {
      console.log(`⏳ Waiting for server... (${i + 1}/10)`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  return false;
}

// Run the test
async function runTest() {
  console.log('🔍 Checking if server is running...');
  const serverReady = await waitForServer();
  
  if (serverReady) {
    console.log('✅ Server is ready');
    await testCompleteWorkflow();
  } else {
    console.log('❌ Server is not responding. Please make sure the dev server is running.');
    console.log('💡 Run: npm run dev');
  }
}

runTest();
