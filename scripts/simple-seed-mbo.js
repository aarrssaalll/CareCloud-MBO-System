const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clear existing data (in reverse order due to foreign key constraints)
    console.log('🧹 Clearing existing data...');
    await prisma.mboObjectiveReview.deleteMany();
    await prisma.mboObjective.deleteMany();
    await prisma.mboBonus.deleteMany();
    await prisma.mboReview.deleteMany();
    await prisma.mboUser.deleteMany();

    console.log('👥 Creating users...');

    // Create sample users
    const user1 = await prisma.mboUser.create({
      data: {
        id: 'user1',
        email: 'john.doe@carecloud.com',
        name: 'John Doe',
        role: 'EMPLOYEE',
      },
    });

    const user2 = await prisma.mboUser.create({
      data: {
        id: 'user2',
        email: 'jane.smith@carecloud.com',
        name: 'Jane Smith',
        role: 'MANAGER',
      },
    });

    const user3 = await prisma.mboUser.create({
      data: {
        id: 'user3',
        email: 'hr.admin@carecloud.com',
        name: 'HR Admin',
        role: 'HR',
      },
    });

    const user4 = await prisma.mboUser.create({
      data: {
        email: 'crystal.williams@carecloud.com',
        name: 'Crystal Williams',
        role: 'SENIOR_MANAGEMENT',
      },
    });

    const user5 = await prisma.mboUser.create({
      data: {
        email: 'alex.chen@carecloud.com',
        name: 'Alex Chen',
        role: 'MANAGER',
      },
    });

    console.log('🎯 Creating objectives...');

    // Create sample objectives
    await prisma.mboObjective.create({
      data: {
        id: 'obj1',
        title: 'Q1 Revenue Target',
        description: 'Achieve 15% increase in quarterly revenue',
        category: 'Revenue',
        target: 115,
        current: 98,
        dueDate: new Date('2025-03-31'),
        quarter: 'Q1',
        year: 2025,
        userId: user1.id,
      },
    });

    await prisma.mboObjective.create({
      data: {
        id: 'obj2',
        title: 'Customer Satisfaction',
        description: 'Maintain NPS score above 85',
        category: 'Quality',
        target: 85,
        current: 88,
        dueDate: new Date('2025-03-15'),
        quarter: 'Q1',
        year: 2025,
        userId: user1.id,
      },
    });

    await prisma.mboObjective.create({
      data: {
        id: 'obj3',
        title: 'Team Leadership',
        description: 'Successfully lead 3 major projects',
        category: 'Leadership',
        target: 3,
        current: 2,
        dueDate: new Date('2025-03-30'),
        quarter: 'Q1',
        year: 2025,
        userId: user2.id,
      },
    });

    await prisma.mboObjective.create({
      data: {
        title: 'AI Model Performance',
        description: 'Improve machine learning model accuracy by 20%',
        category: 'Technical',
        target: 20,
        current: 12,
        dueDate: new Date('2025-03-31'),
        quarter: 'Q1',
        year: 2025,
        userId: user4.id,
      },
    });

    await prisma.mboObjective.create({
      data: {
        title: 'Process Optimization',
        description: 'Reduce processing time by 30% through automation',
        category: 'Efficiency',
        target: 30,
        current: 18,
        dueDate: new Date('2025-03-28'),
        quarter: 'Q1',
        year: 2025,
        userId: user5.id,
      },
    });

    console.log('📊 Creating sample reviews...');

    // Create sample reviews
    await prisma.mboReview.create({
      data: {
        quarter: 'Q4',
        year: 2024,
        overallScore: 4.2,
        comments: 'Excellent performance throughout Q4. Exceeded all targets.',
        status: 'APPROVED',
        submittedAt: new Date('2024-12-15'),
        approvedAt: new Date('2024-12-20'),
        employeeId: user1.id,
      },
    });

    await prisma.mboReview.create({
      data: {
        quarter: 'Q4',
        year: 2024,
        overallScore: 3.8,
        comments: 'Good leadership skills demonstrated. Room for improvement in delegation.',
        status: 'SUBMITTED',
        submittedAt: new Date('2024-12-10'),
        employeeId: user2.id,
      },
    });

    console.log('💰 Creating sample bonuses...');

    // Create sample bonuses
    await prisma.mboBonus.create({
      data: {
        quarter: 'Q4',
        year: 2024,
        baseAmount: 15000.0,
        performanceMultiplier: 1.2,
        finalAmount: 18000.0,
        status: 'APPROVED',
        employeeId: user1.id,
      },
    });

    await prisma.mboBonus.create({
      data: {
        quarter: 'Q4',
        year: 2024,
        baseAmount: 12000.0,
        performanceMultiplier: 1.1,
        finalAmount: 13200.0,
        status: 'CALCULATED',
        employeeId: user2.id,
      },
    });

    console.log('⭐ Creating objective reviews...');

    // Create sample objective reviews
    const objectives = await prisma.mboObjective.findMany();
    
    if (objectives.length > 0) {
      await prisma.mboObjectiveReview.create({
        data: {
          score: 4.5,
          comments: 'Outstanding progress on revenue targets. Keep up the excellent work!',
          objectiveId: objectives[0].id,
          reviewerId: user2.id,
        },
      });

      await prisma.mboObjectiveReview.create({
        data: {
          score: 4.8,
          comments: 'Customer satisfaction levels are exceptional. Great job!',
          objectiveId: objectives[1].id,
          reviewerId: user2.id,
        },
      });
    }

    // Verify the data was created
    const userCount = await prisma.mboUser.count();
    const objectiveCount = await prisma.mboObjective.count();
    const reviewCount = await prisma.mboReview.count();
    const bonusCount = await prisma.mboBonus.count();
    const objectiveReviewCount = await prisma.mboObjectiveReview.count();

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   👥 Users: ${userCount}`);
    console.log(`   🎯 Objectives: ${objectiveCount}`);
    console.log(`   📋 Reviews: ${reviewCount}`);
    console.log(`   💰 Bonuses: ${bonusCount}`);
    console.log(`   ⭐ Objective Reviews: ${objectiveReviewCount}`);
    
    console.log('\n🔑 Sample Login Users:');
    console.log('   📧 john.doe@carecloud.com (Employee)');
    console.log('   📧 jane.smith@carecloud.com (Manager)');
    console.log('   📧 hr.admin@carecloud.com (HR)');
    console.log('   📧 crystal.williams@carecloud.com (Senior Management)');
    console.log('   📧 alex.chen@carecloud.com (Manager)');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
