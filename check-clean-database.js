const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('Checking if database is clean...\n');

    // Check all tables for data
    const userCount = await prisma.mboUser.count();
    const departmentCount = await prisma.mboDepartment.count();
    const teamCount = await prisma.mboTeam.count();
    const objectiveCount = await prisma.mboObjective.count();
    const reviewCount = await prisma.mboReview.count();
    const bonusCount = await prisma.mboBonus.count();
    const approvalCount = await prisma.mboApproval.count();
    const notificationCount = await prisma.mboNotification.count();
    const objectiveReviewCount = await prisma.mboObjectiveReview.count();

    console.log('=== DATABASE TABLE COUNTS ===');
    console.log(`Users: ${userCount}`);
    console.log(`Departments: ${departmentCount}`);
    console.log(`Teams: ${teamCount}`);
    console.log(`Objectives: ${objectiveCount}`);
    console.log(`Objective Reviews: ${objectiveReviewCount}`);
    console.log(`Reviews: ${reviewCount}`);
    console.log(`Bonuses: ${bonusCount}`);
    console.log(`Approvals: ${approvalCount}`);
    console.log(`Notifications: ${notificationCount}`);

    const totalRecords = userCount + departmentCount + teamCount + objectiveCount + 
                        reviewCount + bonusCount + approvalCount + notificationCount + objectiveReviewCount;

    console.log(`\nTotal records in database: ${totalRecords}`);
    
    if (totalRecords === 0) {
      console.log('✅ Database is completely clean and ready for fresh data!');
    } else {
      console.log('⚠️ Database still contains some data');
    }

  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();