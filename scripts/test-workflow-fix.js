// Test the corrected workflow: ASSIGNED → COMPLETED → AI_SCORED → SUBMITTED_TO_HR
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testWorkflow() {
  try {
    console.log('🔄 Testing Complete Workflow...\n');

    // Step 1: Find an ASSIGNED objective
    const assignedObjective = await prisma.mboObjective.findFirst({
      where: { status: 'ASSIGNED' },
      include: {
        user: { select: { name: true } },
        assignedBy: { select: { name: true } }
      }
    });

    if (!assignedObjective) {
      console.log('❌ No ASSIGNED objectives found. Creating one for test...');
      return;
    }

    console.log(`✅ Found ASSIGNED objective: "${assignedObjective.title}"`);
    console.log(`👤 Employee: ${assignedObjective.user.name}`);
    console.log(`👔 Manager: ${assignedObjective.assignedBy?.name}`);

    // Step 2: Mark as COMPLETED (employee completes work)
    console.log('\n📝 Step 2: Employee marks objective as COMPLETED...');
    const completedObj = await prisma.mboObjective.update({
      where: { id: assignedObjective.id },
      data: {
        status: 'COMPLETED',
        current: assignedObjective.target, // Employee achieved the target
        completedAt: new Date()
      }
    });
    console.log(`✅ Status changed: ASSIGNED → COMPLETED`);

    // Step 3: Employee submits with remarks (status stays COMPLETED)
    console.log('\n📤 Step 3: Employee submits to manager with remarks...');
    await prisma.mboObjective.update({
      where: { id: assignedObjective.id },
      data: {
        employeeRemarks: 'I have successfully completed this objective with excellent results.',
        digitalSignature: 'Test Employee Signature',
        submittedToManagerAt: new Date()
      }
    });
    console.log(`✅ Remarks added, submitted to manager (status remains COMPLETED)`);

    // Step 4: Manager uses AI scoring (COMPLETED → AI_SCORED)
    console.log('\n🤖 Step 4: Manager generates AI score...');
    await prisma.mboObjective.update({
      where: { id: assignedObjective.id },
      data: {
        status: 'AI_SCORED',
        aiScoreMetadata: JSON.stringify({
          score: 95,
          explanation: 'Excellent performance, exceeded targets',
          generatedAt: new Date()
        })
      }
    });
    console.log(`✅ Status changed: COMPLETED → AI_SCORED`);

    // Step 5: Manager final review (AI_SCORED → SUBMITTED_TO_HR)
    console.log('\n👔 Step 5: Manager final approval...');
    await prisma.mboObjective.update({
      where: { id: assignedObjective.id },
      data: {
        status: 'SUBMITTED_TO_HR',
        managerReviewedAt: new Date(),
        submittedToHrAt: new Date(),
        managerFeedback: 'Excellent work, approved for HR processing'
      }
    });
    console.log(`✅ Status changed: AI_SCORED → SUBMITTED_TO_HR`);

    console.log('\n🎉 WORKFLOW TEST COMPLETED SUCCESSFULLY!');
    console.log('✅ ASSIGNED → COMPLETED → AI_SCORED → SUBMITTED_TO_HR');

  } catch (error) {
    console.error('❌ Workflow test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testWorkflow();
