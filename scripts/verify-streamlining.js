const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyStreamlining() {
  try {
    console.log('📊 Verifying streamlined status workflow...\n');
    
    // Check status distribution
    const statusCounts = await prisma.mboObjective.groupBy({
      by: ['status'],
      _count: true
    });
    
    console.log('📈 Current status distribution:');
    statusCounts.forEach(group => {
      console.log(`  ${group.status}: ${group._count} objectives`);
    });
    
    // Show objectives that need AI scoring (status=COMPLETED)
    const needsAIScoring = await prisma.mboObjective.findMany({
      where: { status: 'COMPLETED' },
      select: {
        id: true,
        title: true,
        status: true,
        user: { select: { name: true } },
        assignedBy: { select: { name: true } }
      }
    });
    
    console.log(`\n🤖 Objectives ready for AI scoring (status=COMPLETED): ${needsAIScoring.length}`);
    needsAIScoring.forEach(obj => {
      console.log(`  - "${obj.title}" by ${obj.user.name} (Manager: ${obj.assignedBy?.name})`);
    });
    
    // Show objectives ready for manager review (status=AI_SCORED)
    const needsReview = await prisma.mboObjective.findMany({
      where: { status: 'AI_SCORED' },
      select: {
        id: true,
        title: true,
        status: true,
        user: { select: { name: true } },
        assignedBy: { select: { name: true } }
      }
    });
    
    console.log(`\n👨‍💼 Objectives ready for manager review (status=AI_SCORED): ${needsReview.length}`);
    if (needsReview.length <= 5) {
      needsReview.forEach(obj => {
        console.log(`  - "${obj.title}" by ${obj.user.name} (Manager: ${obj.assignedBy?.name})`);
      });
    } else {
      console.log(`  (${needsReview.length} objectives - too many to list)`);
    }
    
    console.log('\n✅ Status streamlining verification complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyStreamlining();
