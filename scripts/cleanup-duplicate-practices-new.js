const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupDuplicatePractices() {
  try {
    console.log('🧹 Cleaning up duplicate practice revenues...\n');
    
    // Get all quantitative objectives
    const quantObjectives = await prisma.mboQuantitativeObjective.findMany({
      include: {
        practiceRevenues: {
          orderBy: { createdAt: 'desc' } // Latest first
        },
        managerObjective: {
          select: { title: true }
        }
      }
    });
    
    for (const quantObj of quantObjectives) {
      console.log(`\n📊 Processing: ${quantObj.managerObjective.title}`);
      console.log(`   Total practices: ${quantObj.practiceRevenues.length}`);
      
      // Group by practice name and keep only the latest one
      const practicesByName = new Map();
      
      for (const practice of quantObj.practiceRevenues) {
        if (!practicesByName.has(practice.practiceName)) {
          // Keep the first (latest) occurrence
          practicesByName.set(practice.practiceName, practice);
        }
      }
      
      // Get IDs to keep
      const idsToKeep = Array.from(practicesByName.values()).map(p => p.id);
      
      // Delete duplicates
      const allIds = quantObj.practiceRevenues.map(p => p.id);
      const idsToDelete = allIds.filter(id => !idsToKeep.includes(id));
      
      if (idsToDelete.length > 0) {
        console.log(`   🗑️  Removing ${idsToDelete.length} duplicate(s)...`);
        
        await prisma.mboPracticeRevenue.deleteMany({
          where: {
            id: { in: idsToDelete }
          }
        });
        
        console.log(`   ✅ Kept ${idsToKeep.length} unique practice(s)`);
        
        // Recalculate totals
        const remaining = await prisma.mboPracticeRevenue.findMany({
          where: { quantitativeObjectiveId: quantObj.id }
        });
        
        const totalAchieved = remaining.reduce((sum, p) => sum + (p.achievedRevenue || 0), 0);
        const overallProgress = (totalAchieved / quantObj.totalTargetRevenue) * 100;
        
        await prisma.mboQuantitativeObjective.update({
          where: { id: quantObj.id },
          data: {
            totalAchievedRevenue: totalAchieved,
            overallProgress: overallProgress
          }
        });
        
        console.log(`   📈 Updated totals: $${totalAchieved} / $${quantObj.totalTargetRevenue} (${overallProgress.toFixed(2)}%)`);
      } else {
        console.log(`   ✅ No duplicates found`);
      }
    }
    
    console.log('\n✅ Cleanup complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDuplicatePractices();
