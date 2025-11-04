const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkModels() {
  console.log('🏗️ Available Prisma models:');
  const models = Object.keys(prisma).filter(key => 
    typeof prisma[key] === 'object' && 
    prisma[key] !== null && 
    key !== '_' && 
    !key.startsWith('$')
  );
  
  models.forEach(model => console.log(`- ${model}`));
  
  // Let's specifically check for review-related models
  console.log('\n🔍 Looking for review-related models...');
  const reviewModels = models.filter(model => 
    model.toLowerCase().includes('review') || 
    model.toLowerCase().includes('score')
  );
  
  if (reviewModels.length > 0) {
    reviewModels.forEach(model => console.log(`✅ Found: ${model}`));
  } else {
    console.log('❌ No review/score models found');
  }
  
  await prisma.$disconnect();
}

checkModels().catch(console.error);