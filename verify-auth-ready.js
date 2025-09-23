const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyUsersForAuth() {
  try {
    console.log('🔐 Verifying user data for authentication...\n');

    const users = await prisma.mboUser.findMany({
      select: {
        id: true,
        employeeId: true,
        email: true,
        name: true,
        role: true,
        password: true,
        bonusAmount: true,
        department: {
          select: { name: true }
        },
        team: {
          select: { name: true }
        }
      },
      orderBy: { employeeId: 'asc' }
    });

    console.log('📊 User Authentication Data Status:');
    console.log('═'.repeat(80));

    let authReadyCount = 0;
    let issuesFound = [];

    users.forEach((user, index) => {
      const hasEmail = !!user.email;
      const hasPassword = !!user.password;
      const hasBonusAmount = user.bonusAmount !== null && user.bonusAmount !== undefined;
      const isAuthReady = hasEmail && hasPassword && hasBonusAmount;
      
      if (isAuthReady) authReadyCount++;

      console.log(`${index + 1}. ${user.name} (${user.employeeId})`);
      console.log(`   Email: ${user.email} ${hasEmail ? '✅' : '❌'}`);
      console.log(`   Password: ${hasPassword ? '✅ Set' : '❌ Missing'}`);
      console.log(`   Bonus Amount: ${hasBonusAmount ? `✅ $${user.bonusAmount?.toLocaleString()}` : '❌ Missing'}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Department: ${user.department?.name || 'N/A'}`);
      console.log(`   Team: ${user.team?.name || 'N/A'}`);
      console.log(`   Auth Ready: ${isAuthReady ? '✅ YES' : '❌ NO'}`);
      console.log('');

      if (!isAuthReady) {
        const issues = [];
        if (!hasEmail) issues.push('Missing email');
        if (!hasPassword) issues.push('Missing password');
        if (!hasBonusAmount) issues.push('Missing bonusAmount');
        issuesFound.push(`${user.name}: ${issues.join(', ')}`);
      }
    });

    console.log('═'.repeat(80));
    console.log('📈 AUTHENTICATION READINESS SUMMARY:');
    console.log(`Total Users: ${users.length}`);
    console.log(`Auth Ready: ${authReadyCount} ✅`);
    console.log(`Issues: ${users.length - authReadyCount} ❌`);
    console.log(`Success Rate: ${((authReadyCount / users.length) * 100).toFixed(1)}%`);

    if (issuesFound.length > 0) {
      console.log('\n⚠️ USERS WITH AUTHENTICATION ISSUES:');
      issuesFound.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
    } else {
      console.log('\n🎉 ALL USERS ARE READY FOR AUTHENTICATION!');
    }

    // Test key users for login
    console.log('\n🔑 KEY LOGIN CREDENTIALS (password: password123):');
    console.log('Senior Management:');
    console.log('- crystal.williams@carecloud.com (President - Operations)');
    console.log('- hadi.chaudhary@carecloud.com (President - IT & AI)');
    console.log('\nManagers:');
    console.log('- sarah.johnson.it@carecloud.com (IT Department Manager)');
    console.log('- michael.davis.ops@carecloud.com (Operations Department Manager)');
    console.log('\nHR Team:');
    console.log('- sarah.johnson@carecloud.com (HR Director)');
    console.log('- michael.davis@carecloud.com (Senior HR Specialist)');
    console.log('- jennifer.white@carecloud.com (HR Coordinator)');
    console.log('\nTeam Leads:');
    console.log('- alex.chen@carecloud.com (AI Team Lead)');
    console.log('- maria.rodriguez@carecloud.com (Database Team Lead)');
    console.log('- david.kim@carecloud.com (Networks Team Lead)');

    console.log(`\n💰 Total Company Bonus Pool: $${users.reduce((sum, user) => sum + (user.bonusAmount || 0), 0).toLocaleString()}`);

  } catch (error) {
    console.error('❌ Error verifying users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyUsersForAuth();