const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function streamlineStatus() {
  try {
    console.log('🔄 Starting status streamlining...');
    
    // First, let's see current status combinations
    const currentObjectives = await prisma.mboObjective.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        workflowStatus: true,
        aiScoreMetadata: true
      }
    });
    
    console.log('📊 Current status combinations:');
    const statusMap = {};
    currentObjectives.forEach(obj => {
      const key = `${obj.status}|${obj.workflowStatus}|${obj.aiScoreMetadata ? 'hasAI' : 'noAI'}`;
      if (!statusMap[key]) statusMap[key] = 0;
      statusMap[key]++;
    });
    
    Object.entries(statusMap).forEach(([key, count]) => {
      console.log(`  ${key}: ${count} objectives`);
    });
    
    // Update logic:
    // If workflowStatus exists and is more advanced, use it
    // Otherwise, keep current status
    
    console.log('\n🔧 Updating objectives...');
    
    for (const obj of currentObjectives) {
      let newStatus = obj.status;
      
      // Priority workflow: use workflowStatus if it's more advanced
      if (obj.workflowStatus === 'HR_APPROVED') {
        newStatus = 'HR_APPROVED';
      } else if (obj.workflowStatus === 'SUBMITTED_TO_HR') {
        newStatus = 'SUBMITTED_TO_HR';
      } else if (obj.workflowStatus === 'REVIEWED') {
        newStatus = 'REVIEWED';
      } else if (obj.workflowStatus === 'AI_SCORED') {
        newStatus = 'AI_SCORED';
      } else if (obj.status === 'COMPLETED' && obj.workflowStatus === 'COMPLETED') {
        newStatus = 'COMPLETED';
      } else if (obj.workflowStatus === 'ACTIVE') {
        newStatus = 'ACTIVE';
      }
      
      // Update the status
      await prisma.mboObjective.update({
        where: { id: obj.id },
        data: { status: newStatus }
      });
      
      console.log(`✅ Updated "${obj.title}": ${obj.status}|${obj.workflowStatus} → ${newStatus}`);
    }
    
    console.log('\n✨ Status streamlining complete!');
    
    // Show final status distribution
    const updatedObjectives = await prisma.mboObjective.findMany({
      select: {
        status: true
      }
    });
    
    const finalStatusMap = {};
    updatedObjectives.forEach(obj => {
      if (!finalStatusMap[obj.status]) finalStatusMap[obj.status] = 0;
      finalStatusMap[obj.status]++;
    });
    
    console.log('\n📈 Final status distribution:');
    Object.entries(finalStatusMap).forEach(([status, count]) => {
      console.log(`  ${status}: ${count} objectives`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

streamlineStatus();
