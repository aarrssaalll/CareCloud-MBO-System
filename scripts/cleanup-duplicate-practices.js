const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupDuplicates() {
  try {
    console.log('🔍 Checking for duplicate current practice records...\n');

    // Get all quantitative objectives
    const quantitativeObjectives = await prisma.quantitativeObjective.findMany({
      include: {
        practiceRevenues: {
          where: {
            isCurrent: true
          },
          orderBy: {
            createdAt: 'desc' // Most recent first
          }
        }
      }
    });

    let totalDuplicates = 0;
    let objectivesWithDuplicates = 0;

    for (const objective of quantitativeObjectives) {
      const practices = objective.practiceRevenues;
      
      // Group by practice name
      const practiceGroups = {};
      practices.forEach(practice => {
        if (!practiceGroups[practice.practiceName]) {
          practiceGroups[practice.practiceName] = [];
        }
        practiceGroups[practice.practiceName].push(practice);
      });

      // Check for duplicates
      let hasDuplicates = false;
      for (const [practiceName, practiceList] of Object.entries(practiceGroups)) {
        if (practiceList.length > 1) {
          hasDuplicates = true;
          totalDuplicates += practiceList.length - 1;

          console.log(`❌ Found ${practiceList.length} current records for "${practiceName}" in objective ${objective.id}`);
          
          // Keep the most recent one (first in list), mark others as not current
          const toKeep = practiceList[0];
          const toMarkHistorical = practiceList.slice(1);

          console.log(`   ✅ Keeping: ${toKeep.id} (version ${toKeep.version}, created ${toKeep.createdAt})`);
          
          for (const duplicate of toMarkHistorical) {
            console.log(`   ⚠️  Marking historical: ${duplicate.id} (version ${duplicate.version}, created ${duplicate.createdAt})`);
            
            await prisma.practiceRevenue.update({
              where: { id: duplicate.id },
              data: { isCurrent: false }
            });
          }
          console.log('');
        }
      }

      if (hasDuplicates) {
        objectivesWithDuplicates++;
      }
    }

    console.log('\n📊 Cleanup Summary:');
    console.log(`   Total Quantitative Objectives: ${quantitativeObjectives.length}`);
    console.log(`   Objectives with Duplicates: ${objectivesWithDuplicates}`);
    console.log(`   Total Duplicates Fixed: ${totalDuplicates}`);
    console.log('\n✅ Cleanup complete!');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDuplicates();
