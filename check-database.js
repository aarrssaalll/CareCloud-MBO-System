const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Checking database connection and structure...\n');
    
    // Check users
    const userCount = await prisma.mboUser.count();
    console.log(`👥 Total Users: ${userCount}`);
    
    if (userCount > 0) {
      const users = await prisma.mboUser.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          departmentId: true,
          teamId: true
        },
        take: 5
      });
      console.log('First 5 users:', JSON.stringify(users, null, 2));
    }
    
    // Check departments
    const deptCount = await prisma.mboDepartment.count();
    console.log(`\n🏢 Total Departments: ${deptCount}`);
    
    if (deptCount > 0) {
      const departments = await prisma.mboDepartment.findMany({
        select: {
          id: true,
          name: true,
          managerId: true
        }
      });
      console.log('Departments:', JSON.stringify(departments, null, 2));
    }
    
    // Check objectives
    const objCount = await prisma.mboObjective.count();
    console.log(`\n🎯 Total Objectives: ${objCount}`);
    
    if (objCount > 0) {
      const objectives = await prisma.mboObjective.findMany({
        select: {
          id: true,
          title: true,
          userId: true,
          status: true,
          quarter: true,
          year: true
        },
        take: 5
      });
      console.log('First 5 objectives:', JSON.stringify(objectives, null, 2));
    }
    
    // Check teams
    const teamCount = await prisma.mboTeam.count();
    console.log(`\n🏆 Total Teams: ${teamCount}`);
    
    if (teamCount > 0) {
      const teams = await prisma.mboTeam.findMany({
        select: {
          id: true,
          name: true,
          departmentId: true,
          leaderId: true
        }
      });
      console.log('Teams:', JSON.stringify(teams, null, 2));
    }
    
    // Check reviews
    const reviewCount = await prisma.mboReview.count();
    console.log(`\n📋 Total Reviews: ${reviewCount}`);
    
    // Check bonuses
    const bonusCount = await prisma.mboBonus.count();
    console.log(`\n💰 Total Bonuses: ${bonusCount}`);
    
    console.log('\n✅ Database connection successful!');
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
