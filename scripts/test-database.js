const { PrismaClient } = require('@prisma/client');

async function testDatabase() {
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    console.log('🔍 Testing database connection...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');

    // Test if tables exist by querying them
    console.log('\n📊 Testing MBO tables...');
    
    // Test users table
    try {
      const userCount = await prisma.mboUser.count();
      console.log(`✅ mbo_users table exists - ${userCount} users found`);
    } catch (error) {
      console.log('❌ mbo_users table issue:', error.message);
    }

    // Test objectives table
    try {
      const objectiveCount = await prisma.mboObjective.count();
      console.log(`✅ mbo_objectives table exists - ${objectiveCount} objectives found`);
    } catch (error) {
      console.log('❌ mbo_objectives table issue:', error.message);
    }

    // Test reviews table
    try {
      const reviewCount = await prisma.mboReview.count();
      console.log(`✅ mbo_reviews table exists - ${reviewCount} reviews found`);
    } catch (error) {
      console.log('❌ mbo_reviews table issue:', error.message);
    }

    // Test bonuses table
    try {
      const bonusCount = await prisma.mboBonus.count();
      console.log(`✅ mbo_bonuses table exists - ${bonusCount} bonuses found`);
    } catch (error) {
      console.log('❌ mbo_bonuses table issue:', error.message);
    }

    // Test objective reviews table
    try {
      const objReviewCount = await prisma.mboObjectiveReview.count();
      console.log(`✅ mbo_objective_reviews table exists - ${objReviewCount} reviews found`);
    } catch (error) {
      console.log('❌ mbo_objective_reviews table issue:', error.message);
    }

    // Test a sample query with relationships
    console.log('\n🔗 Testing relationships...');
    try {
      const usersWithObjectives = await prisma.mboUser.findMany({
        include: {
          objectives: true
        },
        take: 3
      });
      console.log(`✅ User-Objective relationship working - ${usersWithObjectives.length} users with objectives`);
      
      if (usersWithObjectives.length > 0) {
        console.log('📝 Sample user:', {
          name: usersWithObjectives[0].name,
          email: usersWithObjectives[0].email,
          objectiveCount: usersWithObjectives[0].objectives.length
        });
      }
    } catch (error) {
      console.log('❌ Relationship test failed:', error.message);
    }

    console.log('\n🎉 Database test completed!');

  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.error('Connection string used:', process.env.DATABASE_URL?.replace(/password=[^;]+/, 'password=***'));
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
