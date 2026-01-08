const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPracticeRevenues() {
  try {
    console.log('🔍 Checking practice revenues...\n');
    
    // Get Elizabeth's quantitative objective
    const elizabethObjective = await prisma.mboManagerObjective.findFirst({
      where: {
        manager: {
          email: 'elizabeth@carecloud.com'
        },
        isQuantitative: true
      },
      include: {
        manager: { select: { name: true, email: true } },
        quantitativeData: {
          include: {
            practiceRevenues: {
              orderBy: { practiceName: 'asc' }
            }
          }
        }
      }
    });
    
    if (elizabethObjective) {
      console.log(`📋 Objective: ${elizabethObjective.title}`);
      console.log(`   Manager: ${elizabethObjective.manager.name}`);
      console.log(`   Type: ${elizabethObjective.isQuantitative ? 'Quantitative' : 'Qualitative'}`);
      
      if (elizabethObjective.quantitativeData) {
        console.log(`\n📊 Quantitative Data:`);
        console.log(`   ID: ${elizabethObjective.quantitativeData.id}`);
        console.log(`   Total Target: $${elizabethObjective.quantitativeData.totalTargetRevenue}`);
        console.log(`   Total Achieved: $${elizabethObjective.quantitativeData.totalAchievedRevenue}`);
        console.log(`   Progress: ${elizabethObjective.quantitativeData.overallProgress}%`);
        
        console.log(`\n💼 Practice Revenues (${elizabethObjective.quantitativeData.practiceRevenues.length}):`);
        elizabethObjective.quantitativeData.practiceRevenues.forEach((p, i) => {
          console.log(`   ${i + 1}. ${p.practiceName}`);
          console.log(`      Target: $${p.targetRevenue} | Achieved: $${p.achievedRevenue}`);
          console.log(`      Weight: ${p.weight} | Progress: ${p.progressPercentage.toFixed(2)}%`);
          console.log(`      ID: ${p.id}`);
        });
        
        // Check for duplicates
        const practiceNames = elizabethObjective.quantitativeData.practiceRevenues.map(p => p.practiceName);
        const uniqueNames = new Set(practiceNames);
        
        if (practiceNames.length !== uniqueNames.size) {
          console.log(`\n⚠️  DUPLICATES FOUND!`);
          console.log(`   Total practices: ${practiceNames.length}`);
          console.log(`   Unique names: ${uniqueNames.size}`);
          
          // Show duplicates
          const duplicates = practiceNames.filter((name, index) => practiceNames.indexOf(name) !== index);
          console.log(`   Duplicate names: ${[...new Set(duplicates)].join(', ')}`);
        }
      }
    } else {
      console.log('❌ No quantitative objective found for Elizabeth');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPracticeRevenues();
