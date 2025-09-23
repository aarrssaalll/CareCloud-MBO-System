const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyDatabase() {
  console.log('🔍 Verifying CareCloud MBO Database Structure...\n');

  try {
    // Check departments
    const departments = await prisma.mboDepartment.findMany({
      include: {
        teams: {
          include: {
            leader: true,
            _count: {
              select: { users: true }
            }
          }
        },
        manager: true,
        _count: {
          select: { users: true }
        }
      }
    });

    console.log('🏢 DEPARTMENTS:');
    for (const dept of departments) {
      console.log(`  📁 ${dept.name}`);
      console.log(`     Manager: ${dept.manager?.name || 'Not assigned'}`);
      console.log(`     Budget: $${dept.budget?.toLocaleString() || 'Not set'}`);
      console.log(`     Total Users: ${dept._count.users}`);
      console.log(`     Teams: ${dept.teams.length}`);
      
      for (const team of dept.teams) {
        console.log(`       👥 ${team.name}`);
        console.log(`          Lead: ${team.leader?.name || 'Not assigned'}`);
        console.log(`          Members: ${team._count.users}`);
      }
      console.log('');
    }

    // Check user roles distribution
    const usersByRole = await prisma.mboUser.groupBy({
      by: ['role'],
      _count: {
        id: true
      }
    });

    console.log('👤 USER ROLES DISTRIBUTION:');
    for (const roleGroup of usersByRole) {
      console.log(`  ${roleGroup.role}: ${roleGroup._count.id} users`);
    }
    console.log('');

    // Check objectives
    const objectives = await prisma.mboObjective.findMany({
      include: {
        user: true,
        assignedBy: true
      }
    });

    console.log('🎯 OBJECTIVES:');
    for (const obj of objectives) {
      const progress = ((obj.current || 0) / obj.target * 100).toFixed(1);
      console.log(`  📊 ${obj.title}`);
      console.log(`     Assigned to: ${obj.user.name}`);
      console.log(`     Assigned by: ${obj.assignedBy?.name || 'System'}`);
      console.log(`     Progress: ${obj.current}/${obj.target} (${progress}%)`);
      console.log(`     Status: ${obj.status}`);
      console.log('');
    }

    // Check reviews and bonuses
    const reviewCount = await prisma.mboReview.count();
    const bonusCount = await prisma.mboBonus.count();
    const approvalCount = await prisma.mboApproval.count();

    console.log('📊 SUMMARY STATISTICS:');
    console.log(`  👥 Total Users: ${await prisma.mboUser.count()}`);
    console.log(`  🏢 Departments: ${departments.length}`);
    console.log(`  👥 Teams: ${departments.reduce((sum, dept) => sum + dept.teams.length, 0)}`);
    console.log(`  🎯 Objectives: ${objectives.length}`);
    console.log(`  📋 Reviews: ${reviewCount}`);
    console.log(`  💰 Bonuses: ${bonusCount}`);
    console.log(`  ✅ Approvals: ${approvalCount}`);

    console.log('\n🎉 Database verification complete! The CareCloud MBO system is ready for use.');

  } catch (error) {
    console.error('❌ Database verification failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDatabase();
