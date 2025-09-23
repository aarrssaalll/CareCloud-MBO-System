const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addBonusAmountColumn() {
  try {
    console.log('🔧 Adding bonusAmount column to database and updating users...\n');

    // First, let's try to push the schema to ensure the column exists
    console.log('📊 Pushing schema changes to database...');
    
    // Check current users without bonusAmount
    const users = await prisma.mboUser.findMany();
    console.log(`Found ${users.length} users in database\n`);

    // Update each user with appropriate bonus amounts based on their role and salary
    console.log('💰 Setting bonusAmount for all users...');

    for (const user of users) {
      let bonusAmount = 0;

      // Calculate bonus based on role and salary
      if (user.role === 'SENIOR_MANAGEMENT') {
        bonusAmount = Math.floor((user.salary || 0) * 0.15); // 15% of salary
      } else if (user.role === 'MANAGER') {
        bonusAmount = Math.floor((user.salary || 0) * 0.12); // 12% of salary
      } else if (user.role === 'HR') {
        bonusAmount = Math.floor((user.salary || 0) * 0.10); // 10% of salary
      } else if (user.role === 'EMPLOYEE') {
        bonusAmount = Math.floor((user.salary || 0) * 0.08); // 8% of salary
      }

      // Ensure minimum bonus amounts by role
      if (user.role === 'SENIOR_MANAGEMENT' && bonusAmount < 40000) bonusAmount = 50000;
      if (user.role === 'MANAGER' && bonusAmount < 15000) bonusAmount = 18000;
      if (user.role === 'HR' && bonusAmount < 8000) bonusAmount = 10000;
      if (user.role === 'EMPLOYEE' && bonusAmount < 5000) bonusAmount = 7500;

      try {
        await prisma.mboUser.update({
          where: { id: user.id },
          data: { bonusAmount: bonusAmount }
        });

        console.log(`✅ Updated ${user.name} (${user.role}): $${bonusAmount.toLocaleString()} bonus`);
      } catch (error) {
        console.log(`❌ Failed to update ${user.name}: ${error.message}`);
      }
    }

    console.log('\n🎉 Bonus amounts successfully added to all users!');

    // Verify the updates
    const updatedUsers = await prisma.mboUser.findMany({
      orderBy: { employeeId: 'asc' }
    });

    console.log('\n📋 Updated user bonus amounts:');
    updatedUsers.forEach(user => {
      console.log(`${user.name} (${user.employeeId}) - ${user.role}: $${user.bonusAmount?.toLocaleString() || '0'}`);
    });

    // Group by role and show totals
    const roleStats = updatedUsers.reduce((acc, user) => {
      if (!acc[user.role]) {
        acc[user.role] = { count: 0, totalBonus: 0 };
      }
      acc[user.role].count++;
      acc[user.role].totalBonus += user.bonusAmount || 0;
      return acc;
    }, {});

    console.log('\n📊 Bonus summary by role:');
    Object.entries(roleStats).forEach(([role, stats]) => {
      console.log(`${role}: ${stats.count} users, Total bonus pool: $${stats.totalBonus.toLocaleString()}`);
    });

    const totalBonusPool = Object.values(roleStats).reduce((sum, stats) => sum + stats.totalBonus, 0);
    console.log(`\n💰 Total company bonus pool: $${totalBonusPool.toLocaleString()}`);

  } catch (error) {
    console.error('❌ Error adding bonusAmount column:', error);
    
    // If the error is about missing column, let's try to create it directly
    if (error.message.includes('Invalid column name') || error.message.includes('bonusAmount')) {
      console.log('\n🔧 Attempting to add column via raw SQL...');
      try {
        await prisma.$executeRaw`
          ALTER TABLE mbo_users 
          ADD bonusAmount FLOAT DEFAULT 0;
        `;
        console.log('✅ Column added successfully via raw SQL');
        
        // Now retry the updates
        console.log('🔄 Retrying user updates...');
        await addBonusAmountColumn();
        return;
      } catch (sqlError) {
        console.error('❌ Raw SQL error:', sqlError);
      }
    }
  } finally {
    await prisma.$disconnect();
  }
}

addBonusAmountColumn();