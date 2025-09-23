const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkHRObjectives() {
  try {
    console.log('🔍 Checking objectives that should be visible to HR...\n');
    
    // Check for objectives submitted to HR
    const submittedToHR = await prisma.mboObjective.findMany({
      where: { workflowStatus: 'SUBMITTED_TO_HR' },
      include: { user: { select: { name: true } } }
    });
    
    console.log(`Objectives with SUBMITTED_TO_HR status: ${submittedToHR.length}`);
    submittedToHR.forEach(obj => {
      console.log(`- ${obj.title} (${obj.user.name}) - Status: ${obj.status}, Workflow: ${obj.workflowStatus}`);
    });
    
    // Check for AI scored objectives that should be ready for manager final review
    const aiScored = await prisma.mboObjective.findMany({
      where: { workflowStatus: 'AI_SCORED' },
      include: { user: { select: { name: true } } }
    });
    
    console.log(`\nObjectives with AI_SCORED status: ${aiScored.length}`);
    aiScored.slice(0, 5).forEach(obj => {
      console.log(`- ${obj.title} (${obj.user.name}) - Status: ${obj.status}, Workflow: ${obj.workflowStatus}`);
    });

    // Check all workflow statuses for context
    const allStatuses = await prisma.mboObjective.groupBy({
      by: ['workflowStatus'],
      _count: { _all: true }
    });
    
    console.log('\nAll workflow statuses in database:');
    allStatuses.forEach(status => {
      console.log(`- ${status.workflowStatus || 'NULL'}: ${status._count._all} objectives`);
    });

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkHRObjectives();
