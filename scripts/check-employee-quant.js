const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkEmployeeQuantitativeObjectives() {
  const objs = await prisma.mboObjective.findMany({
    where: { isQuantitative: true },
    include: {
      user: { select: { name: true, email: true } },
      assignedBy: { select: { name: true } },
      quantitativeData: {
        include: { practiceRevenues: true }
      }
    }
  });
  
  console.log(`\n📊 Found ${objs.length} quantitative employee objectives:\n`);
  
  objs.forEach(o => {
    console.log(`- ${o.title}`);
    console.log(`  Employee: ${o.user.name}`);
    console.log(`  Assigned by: ${o.assignedBy?.name || 'N/A'}`);
    console.log(`  Has quantitative data: ${o.quantitativeData ? 'YES ✅' : 'NO ❌'}`);
    console.log(`  ObjectiveType: ${o.objectiveType}`);
    
    if (o.quantitativeData) {
      console.log(`  Practices: ${o.quantitativeData.practiceRevenues.length}`);
    }
    console.log('');
  });
  
  await prisma.$disconnect();
}

checkEmployeeQuantitativeObjectives();
