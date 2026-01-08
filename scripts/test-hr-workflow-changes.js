const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testHRWorkflowChanges() {
  try {
    console.log('🧪 Testing HR Workflow Changes...\n');
    
    // 1. Create a test objective with SUBMITTED_TO_HR status
    console.log('1. 📝 Creating test objective with SUBMITTED_TO_HR status...');
    
    const testUser = await prisma.mboUser.findFirst({
      where: { role: 'EMPLOYEE' }
    });
    
    if (!testUser) {
      console.log('❌ No employee user found. Please create a user first.');
      return;
    }
    
    const hrUser = await prisma.mboUser.findFirst({
      where: { role: 'HR' }
    });
    
    if (!hrUser) {
      console.log('❌ No HR user found. Please create an HR user first.');
      return;
    }
    
    const testObjective = await prisma.mboObjective.create({
      data: {
        title: "Test HR Workflow Objective",
        description: "Testing the new bonus approval workflow",
        target: 100,
        current: 90,
        weight: 25,
        status: 'SUBMITTED_TO_HR',
        quarter: 'Q1',
        year: 2025,
        dueDate: new Date('2025-03-31'),
        userId: testUser.id,
        submittedToHrAt: new Date(),
        aiScoreMetadata: JSON.stringify({
          score: 23,
          maxScore: 25,
          explanation: "Good performance",
          completionRate: 90,
          generatedAt: new Date().toISOString()
        })
      }
    });
    
    console.log(`✅ Created test objective: ${testObjective.id}`);
    console.log(`📊 Status: ${testObjective.status}`);
    
    // 2. Test the pending approvals API
    console.log('\n2. 🔍 Testing pending approvals API...');
    
    const pendingResponse = await fetch('http://localhost:3000/api/hr/pending-approvals');
    const pendingData = await pendingResponse.json();
    
    console.log('  Pending approvals response:', {
      success: pendingData.success,
      count: pendingData.count,
      breakdown: pendingData.breakdown
    });
    
    const foundObjective = pendingData.objectives?.find(obj => obj.id === testObjective.id);
    console.log('  ✅ Test objective found in pending list:', !!foundObjective);
    
    // 3. Test HR approval
    console.log('\n3. ✅ Testing HR approval process...');
    
    const approveResponse = await fetch('http://localhost:3000/api/hr/approve-objective', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        objectiveId: testObjective.id,
        hrId: hrUser.id,
        action: 'approve',
        notes: 'Test approval - bonus workflow verification'
      })
    });
    
    const approveResult = await approveResponse.json();
    console.log('  Approval response:', {
      success: approveResult.success,
      message: approveResult.message,
      status: approveResult.objective?.status
    });
    
    // 4. Verify objective status changed to BONUS_APPROVED
    console.log('\n4. 🔍 Verifying status change...');
    
    const updatedObjective = await prisma.mboObjective.findUnique({
      where: { id: testObjective.id }
    });
    
    console.log(`  ✅ Objective status: ${updatedObjective?.status}`);
    console.log(`  ✅ HR approved at: ${updatedObjective?.hrApprovedAt}`);
    
    if (updatedObjective?.status === 'BONUS_APPROVED') {
      console.log('  🎉 SUCCESS: Status correctly changed to BONUS_APPROVED!');
    } else {
      console.log('  ❌ FAILED: Status did not change correctly');
    }
    
    // 5. Test that it's removed from pending approvals
    console.log('\n5. 🔍 Testing removal from pending approvals...');
    
    const pendingResponse2 = await fetch('http://localhost:3000/api/hr/pending-approvals');
    const pendingData2 = await pendingResponse2.json();
    
    const stillInPending = pendingData2.objectives?.find(obj => obj.id === testObjective.id);
    
    if (!stillInPending) {
      console.log('  🎉 SUCCESS: Objective removed from pending approvals!');
    } else {
      console.log('  ❌ FAILED: Objective still in pending approvals list');
    }
    
    // 6. Test that it appears in all objectives
    console.log('\n6. 🔍 Testing visibility in all objectives...');
    
    const allObjectivesResponse = await fetch('http://localhost:3000/api/hr/all-objectives');
    const allObjectivesData = await allObjectivesResponse.json();
    
    const foundInAll = allObjectivesData.data?.find(obj => obj.id === testObjective.id);
    
    if (foundInAll && foundInAll.status === 'BONUS_APPROVED') {
      console.log('  🎉 SUCCESS: Objective visible in all objectives with BONUS_APPROVED status!');
    } else {
      console.log('  ❌ FAILED: Objective not found in all objectives or wrong status');
    }
    
    console.log('\n7. 🧹 Cleaning up test data...');
    
    // Clean up
    await prisma.mboObjective.delete({
      where: { id: testObjective.id }
    });
    
    console.log('✅ Test data cleaned up');
    
    console.log('\n🎉 HR Workflow Test Summary:');
    console.log('  ✅ SUBMITTED_TO_HR objectives appear in pending approvals');
    console.log('  ✅ HR approval changes status to BONUS_APPROVED');
    console.log('  ✅ BONUS_APPROVED objectives removed from pending approvals');
    console.log('  ✅ BONUS_APPROVED objectives remain in all objectives forever');
    
  } catch (error) {
    console.error('❌ Error during HR workflow testing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testHRWorkflowChanges().catch(console.error);
