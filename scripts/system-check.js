console.log('🚀 CareCloud MBO System - Status Check');
console.log('==========================================');

// Check environment variables
console.log('\n📊 Environment Configuration:');
console.log('✅ DATABASE_URL configured:', !!process.env.DATABASE_URL);
console.log('✅ Database Server:', process.env.DATABASE_URL?.includes('172.16.0.66') ? '172.16.0.66' : 'Not configured');
console.log('✅ Database Name:', process.env.DATABASE_URL?.includes('ds_test') ? 'ds_test' : 'Not configured');

// Check if Prisma client is working
const { PrismaClient } = require('@prisma/client');

async function fullSystemCheck() {
  const prisma = new PrismaClient();

  try {
    console.log('\n🔐 Database Connection Test:');
    await prisma.$connect();
    console.log('✅ Connected to SQL Server successfully');

    console.log('\n📋 Table Status:');
    const userCount = await prisma.mboUser.count();
    const objectiveCount = await prisma.mboObjective.count();
    const reviewCount = await prisma.mboReview.count();
    const bonusCount = await prisma.mboBonus.count();
    const objReviewCount = await prisma.mboObjectiveReview.count();

    console.log(`✅ Users: ${userCount} records`);
    console.log(`✅ Objectives: ${objectiveCount} records`);
    console.log(`✅ Reviews: ${reviewCount} records`);
    console.log(`✅ Bonuses: ${bonusCount} records`);
    console.log(`✅ Objective Reviews: ${objReviewCount} records`);

    console.log('\n👥 Sample Data:');
    const sampleUsers = await prisma.mboUser.findMany({
      include: {
        objectives: true
      },
      take: 3
    });

    sampleUsers.forEach(user => {
      console.log(`👤 ${user.name} (${user.role}) - ${user.objectives.length} objectives`);
    });

    console.log('\n📈 Sample Objectives:');
    const sampleObjectives = await prisma.mboObjective.findMany({
      include: {
        user: true
      },
      take: 3
    });

    sampleObjectives.forEach(obj => {
      const progress = ((obj.current / obj.target) * 100).toFixed(1);
      console.log(`🎯 ${obj.title} - ${progress}% complete (${obj.user.name})`);
    });

    console.log('\n🎉 System Status: READY');
    console.log('📍 Application URL: http://localhost:3000');
    console.log('📍 API Endpoints: http://localhost:3000/api/objectives');
    console.log('📍 Network Access: http://0.0.0.0:3000 (if using dev:network)');

  } catch (error) {
    console.error('\n❌ System Check Failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fullSystemCheck();
