const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkReviewStructure() {
  try {
    console.log('📋 Checking review table structures...');
    
    // Check mboObjectiveReview
    const objReviews = await prisma.mboObjectiveReview.findMany({ take: 1 });
    console.log('📊 mboObjectiveReview sample:', objReviews[0] ? JSON.stringify(objReviews[0], null, 2) : 'No data');
    
    // Check mboReview 
    const reviews = await prisma.mboReview.findMany({ take: 1 });
    console.log('\n📈 mboReview sample:', reviews[0] ? JSON.stringify(reviews[0], null, 2) : 'No data');
    
    // Check manager objectives structure
    const managerObjectives = await prisma.mboManagerObjective.findMany({ take: 1 });
    console.log('\n👔 mboManagerObjective sample:', managerObjectives[0] ? JSON.stringify(managerObjectives[0], null, 2) : 'No data');
    
    // Count records in each table
    const objReviewCount = await prisma.mboObjectiveReview.count();
    const reviewCount = await prisma.mboReview.count();
    const managerObjCount = await prisma.mboManagerObjective.count();
    
    console.log('\n📊 Record counts:');
    console.log(`- mboObjectiveReview: ${objReviewCount}`);
    console.log(`- mboReview: ${reviewCount}`);
    console.log(`- mboManagerObjective: ${managerObjCount}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkReviewStructure().catch(console.error);