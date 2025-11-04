const { PrismaClient } = require('@prisma/client');

async function checkFields() {
  const prisma = new PrismaClient();
  
  try {
    // Get first objective to see available fields
    const objective = await prisma.mboObjective.findFirst();
    console.log('MboObjective fields:', Object.keys(objective || {}));
    
    // Get first manager objective to see available fields
    const managerObj = await prisma.mboManagerObjective.findFirst();
    console.log('MboManagerObjective fields:', Object.keys(managerObj || {}));
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkFields();