const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkStatuses() {
  const objectives = await prisma.mboObjective.findMany({
    select: { id: true, status: true, title: true }
  });
  
  console.log('📊 Current objective statuses:');
  objectives.forEach(obj => {
    console.log(`- ${obj.title.substring(0, 30)}... [${obj.status}]`);
  });
  
  const uniqueStatuses = [...new Set(objectives.map(obj => obj.status))];
  console.log('\n🎯 Unique status values:', uniqueStatuses);
  
  await prisma.$disconnect();
}

checkStatuses().catch(console.error);