const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTables() {
  console.log('📋 Checking all tables and their sample data...');
  
  try {
    // Check MboObjective (employee objectives)
    const empObjectives = await prisma.mboObjective.findMany({ take: 1 });
    console.log('📊 MboObjective sample:', empObjectives[0] ? JSON.stringify(empObjectives[0], null, 2) : 'No data');
    
    // Check obj_review (scores for employee objectives)
    const reviews = await prisma.obj_review.findMany({ take: 1 });
    console.log('\n📈 obj_review sample:', reviews[0] ? JSON.stringify(reviews[0], null, 2) : 'No data');
    
    // Check manager objectives table
    const managerObjectives = await prisma.mboManagerObjective.findMany({ take: 1 });
    console.log('\n👔 MboManagerObjective sample:', managerObjectives[0] ? JSON.stringify(managerObjectives[0], null, 2) : 'No data');
    
    // Check all available models in Prisma
    console.log('\n🏗️ Available Prisma models:');
    const models = Object.keys(prisma).filter(key => 
      typeof prisma[key] === 'object' && 
      prisma[key] !== null && 
      'findMany' in prisma[key]
    );
    models.forEach(model => console.log(`- ${model}`));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables().catch(console.error);