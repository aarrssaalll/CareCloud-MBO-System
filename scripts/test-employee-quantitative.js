const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testQuantitativeAssignment() {
  try {
    console.log('🧪 Testing quantitative objective assignment to employee...\n');
    
    // Get a manager
    const manager = await prisma.mboUser.findFirst({
      where: { email: 'elizabeth@carecloud.com' }
    });
    
    // Get an employee managed by this manager
    const employee = await prisma.mboUser.findFirst({
      where: { managerId: manager?.id }
    });
    
    if (!manager || !employee) {
      console.log('❌ Manager or employee not found');
      return;
    }
    
    console.log(`👤 Manager: ${manager.name} (${manager.id})`);
    console.log(`👤 Employee: ${employee.name} (${employee.id})\n`);
    
    // Check existing employee objectives
    const existingObjectives = await prisma.mboObjective.findMany({
      where: { userId: employee.id },
      include: {
        quantitativeData: {
          include: {
            practiceRevenues: true
          }
        }
      }
    });
    
    console.log(`📋 Employee has ${existingObjectives.length} objectives:`);
    existingObjectives.forEach(obj => {
      console.log(`\n  - ${obj.title}`);
      console.log(`    Type: ${obj.isQuantitative ? 'Quantitative' : 'Qualitative'}`);
      console.log(`    ObjectiveType: ${obj.objectiveType}`);
      console.log(`    Status: ${obj.status}`);
      
      if (obj.isQuantitative && obj.quantitativeData) {
        console.log(`    📊 Quantitative Data:`);
        console.log(`       Total Target: $${obj.quantitativeData.totalTargetRevenue}`);
        console.log(`       Practices: ${obj.quantitativeData.practiceRevenues.length}`);
        obj.quantitativeData.practiceRevenues.forEach((p, i) => {
          console.log(`       ${i + 1}. ${p.practiceName}: $${p.targetRevenue} (${p.weight}% weight)`);
        });
      }
    });
    
    // Check if there are any qualitative objectives that should be quantitative
    const misclassified = existingObjectives.filter(obj => 
      obj.objectiveType === 'QUALITATIVE' && obj.isQuantitative === true
    );
    
    if (misclassified.length > 0) {
      console.log(`\n⚠️  Found ${misclassified.length} misclassified objectives:`);
      misclassified.forEach(obj => {
        console.log(`   - ${obj.title} (ID: ${obj.id})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testQuantitativeAssignment();
