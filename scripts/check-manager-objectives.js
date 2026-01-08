const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkManagerObjectives() {
  try {
    console.log('🔍 Checking manager objectives in database...\n');
    
    // Get all managers
    const managers = await prisma.mboUser.findMany({
      where: {
        role: {
          in: ['MANAGER', 'manager']
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });
    
    console.log(`👥 Found ${managers.length} managers:`);
    managers.forEach(m => console.log(`  - ${m.name} (${m.email}) - ${m.id}`));
    
    // Check manager objectives
    const managerObjectives = await prisma.mboManagerObjective.findMany({
      include: {
        manager: {
          select: { name: true, email: true }
        },
        assignedBySeniorManager: {
          select: { name: true, title: true }
        },
        quantitativeData: {
          include: {
            practiceRevenues: true
          }
        }
      }
    });
    
    console.log(`\n🎯 Found ${managerObjectives.length} manager objectives in database:`);
    managerObjectives.forEach(obj => {
      console.log(`\n  📋 ${obj.title}`);
      console.log(`     Manager: ${obj.manager.name} (${obj.manager.email})`);
      console.log(`     Assigned by: ${obj.assignedBySeniorManager.name} (${obj.assignedBySeniorManager.title})`);
      console.log(`     Status: ${obj.status}`);
      console.log(`     Type: ${obj.isQuantitative ? 'Quantitative' : 'Qualitative'}`);
      console.log(`     Target: ${obj.target} | Current: ${obj.current || 0}`);
      console.log(`     Due: ${obj.dueDate.toISOString().split('T')[0]}`);
      
      if (obj.isQuantitative && obj.quantitativeData) {
        console.log(`     📊 Quantitative Data:`);
        console.log(`        Total Target: $${obj.quantitativeData.totalTargetRevenue.toLocaleString()}`);
        console.log(`        Total Achieved: $${obj.quantitativeData.totalAchievedRevenue.toLocaleString()}`);
        console.log(`        Progress: ${obj.quantitativeData.overallProgress.toFixed(2)}%`);
        console.log(`        Practices: ${obj.quantitativeData.practiceRevenues.length}`);
      }
    });
    
    if (managerObjectives.length === 0) {
      console.log('\n⚠️  No manager objectives found. You need to:');
      console.log('   1. Make sure you have senior management users');
      console.log('   2. Use the senior management interface to assign objectives to managers');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkManagerObjectives();
