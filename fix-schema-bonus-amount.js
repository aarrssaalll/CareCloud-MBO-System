const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixSchemaAndAddBonusAmount() {
  try {
    console.log('🔧 Fixing schema issues and adding bonusAmount column...\n');

    // First, let's try to drop the problematic constraint
    console.log('🗑️ Removing problematic constraints...');
    
    try {
      await prisma.$executeRaw`
        IF EXISTS (SELECT * FROM sys.default_constraints WHERE name = 'DF__mbo_objec__workf__2739D489')
        BEGIN
          ALTER TABLE mbo_objectives DROP CONSTRAINT DF__mbo_objec__workf__2739D489;
          PRINT 'Dropped constraint DF__mbo_objec__workf__2739D489';
        END
      `;
    } catch (error) {
      console.log('ℹ️ Constraint might not exist or already removed');
    }

    // Try to drop the workflowStatus column if it exists
    try {
      await prisma.$executeRaw`
        IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('mbo_objectives') AND name = 'workflowStatus')
        BEGIN
          ALTER TABLE mbo_objectives DROP COLUMN workflowStatus;
          PRINT 'Dropped workflowStatus column';
        END
      `;
    } catch (error) {
      console.log('ℹ️ workflowStatus column might not exist');
    }

    // Now add the bonusAmount column if it doesn't exist
    console.log('💰 Adding bonusAmount column...');
    
    try {
      await prisma.$executeRaw`
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('mbo_users') AND name = 'bonusAmount')
        BEGIN
          ALTER TABLE mbo_users ADD bonusAmount FLOAT DEFAULT 0;
          PRINT 'Added bonusAmount column';
        END
        ELSE
        BEGIN
          PRINT 'bonusAmount column already exists';
        END
      `;
    } catch (error) {
      console.log('ℹ️ bonusAmount column handling:', error.message);
    }

    console.log('✅ Schema fixes applied');

    // Now update all users with appropriate bonus amounts
    console.log('\n💰 Setting bonusAmount for all users...');

    const users = await prisma.mboUser.findMany();
    console.log(`Found ${users.length} users in database`);

    for (const user of users) {
      let bonusAmount = 0;

      // Calculate bonus based on role and salary
      if (user.role === 'SENIOR_MANAGEMENT') {
        bonusAmount = user.salary ? Math.floor(user.salary * 0.15) : 50000; // 15% of salary or $50k
      } else if (user.role === 'MANAGER') {
        bonusAmount = user.salary ? Math.floor(user.salary * 0.12) : 18000; // 12% of salary or $18k
      } else if (user.role === 'HR') {
        bonusAmount = user.salary ? Math.floor(user.salary * 0.10) : 12000; // 10% of salary or $12k
      } else if (user.role === 'EMPLOYEE') {
        bonusAmount = user.salary ? Math.floor(user.salary * 0.08) : 8000; // 8% of salary or $8k
      }

      // Ensure minimum amounts
      if (user.role === 'SENIOR_MANAGEMENT' && bonusAmount < 40000) bonusAmount = 50000;
      if (user.role === 'MANAGER' && bonusAmount < 15000) bonusAmount = 18000;
      if (user.role === 'HR' && bonusAmount < 8000) bonusAmount = 12000;
      if (user.role === 'EMPLOYEE' && bonusAmount < 5000) bonusAmount = 8000;

      try {
        await prisma.mboUser.update({
          where: { id: user.id },
          data: { bonusAmount: bonusAmount }
        });

        console.log(`✅ ${user.name} (${user.role}): $${bonusAmount.toLocaleString()}`);
      } catch (error) {
        console.log(`❌ Failed to update ${user.name}: ${error.message}`);
      }
    }

    console.log('\n🎉 All users updated with bonusAmount!');

    // Verify the results
    const updatedUsers = await prisma.mboUser.findMany({
      select: {
        name: true,
        employeeId: true,
        role: true,
        salary: true,
        bonusAmount: true
      },
      orderBy: { employeeId: 'asc' }
    });

    console.log('\n📋 Final user bonus amounts:');
    updatedUsers.forEach(user => {
      console.log(`${user.name} (${user.employeeId})`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Salary: $${user.salary?.toLocaleString() || '0'}`);
      console.log(`  Bonus: $${user.bonusAmount?.toLocaleString() || '0'}`);
      console.log('');
    });

    // Calculate totals
    const totalSalaries = updatedUsers.reduce((sum, user) => sum + (user.salary || 0), 0);
    const totalBonuses = updatedUsers.reduce((sum, user) => sum + (user.bonusAmount || 0), 0);

    console.log('📊 Summary:');
    console.log(`Total users: ${updatedUsers.length}`);
    console.log(`Total salaries: $${totalSalaries.toLocaleString()}`);
    console.log(`Total bonus pool: $${totalBonuses.toLocaleString()}`);
    console.log(`Bonus as % of salaries: ${((totalBonuses / totalSalaries) * 100).toFixed(1)}%`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixSchemaAndAddBonusAmount();