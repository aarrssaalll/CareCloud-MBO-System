const { PrismaClient } = require('@prisma/client');

async function performanceTest() {
  const prisma = new PrismaClient({
    log: ['query', 'info'],
  });

  console.log('🚀 Starting performance test...');

  try {
    // Test database connection speed
    const startConnection = performance.now();
    await prisma.$connect();
    const connectionTime = performance.now() - startConnection;
    console.log(`✅ Database connection: ${connectionTime.toFixed(2)}ms`);

    // Test query performance
    const startQuery = performance.now();
    const users = await prisma.mboUser.findMany({
      include: {
        objectives: {
          select: {
            id: true,
            title: true,
            status: true,
            current: true,
            target: true
          }
        }
      },
      take: 10
    });
    const queryTime = performance.now() - startQuery;
    console.log(`✅ User query with objectives: ${queryTime.toFixed(2)}ms`);
    console.log(`📊 Found ${users.length} users with ${users.reduce((acc, u) => acc + u.objectives.length, 0)} total objectives`);

    // Test individual objective query
    const startObjectiveQuery = performance.now();
    const objectives = await prisma.mboObjective.findMany({
      where: {
        userId: users[0]?.id
      },
      include: {
        reviews: {
          select: {
            id: true,
            score: true,
            reviewDate: true
          }
        }
      },
      take: 20
    });
    const objectiveQueryTime = performance.now() - startObjectiveQuery;
    console.log(`✅ Objective query: ${objectiveQueryTime.toFixed(2)}ms`);

    // Performance summary
    const totalTime = connectionTime + queryTime + objectiveQueryTime;
    console.log('\n📈 Performance Summary:');
    console.log(`   Connection: ${connectionTime.toFixed(2)}ms`);
    console.log(`   User Query: ${queryTime.toFixed(2)}ms`);
    console.log(`   Objectives: ${objectiveQueryTime.toFixed(2)}ms`);
    console.log(`   Total Time: ${totalTime.toFixed(2)}ms`);

    if (totalTime < 1000) {
      console.log('🎉 Performance: EXCELLENT (< 1s)');
    } else if (totalTime < 3000) {
      console.log('✅ Performance: GOOD (< 3s)');
    } else {
      console.log('⚠️  Performance: NEEDS IMPROVEMENT (> 3s)');
    }

  } catch (error) {
    console.error('❌ Performance test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

performanceTest();
