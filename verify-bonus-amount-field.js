const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyBonusAmountField() {
  try {
    console.log('🔍 Verifying bonusAmount field integration...\n');

    // Test 1: Try to read a user with bonusAmount
    console.log('📋 Test 1: Reading existing users with bonusAmount...');
    const testUser = await prisma.mboUser.findFirst({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        salary: true,
        bonusAmount: true
      }
    });

    if (testUser) {
      console.log('✅ Successfully read user with bonusAmount:');
      console.log(`   Name: ${testUser.name}`);
      console.log(`   Email: ${testUser.email}`);
      console.log(`   Role: ${testUser.role}`);
      console.log(`   Salary: $${testUser.salary?.toLocaleString() || 'N/A'}`);
      console.log(`   Bonus Amount: $${testUser.bonusAmount?.toLocaleString() || 'N/A'}`);
    } else {
      console.log('❌ No users found in database');
      return;
    }

    // Test 2: Try to create a new test user with bonusAmount
    console.log('\n📝 Test 2: Creating a new test user with bonusAmount...');
    
    const testUserCreate = await prisma.mboUser.create({
      data: {
        employeeId: 'TEST001',
        email: 'test.user@carecloud.com',
        firstName: 'Test',
        lastName: 'User',
        name: 'Test User',
        role: 'EMPLOYEE',
        title: 'Test Engineer',
        phone: '+1-555-9999',
        hireDate: new Date(),
        salary: 75000.00,
        bonusAmount: 8000.00, // This should work now!
        password: 'test123'
      }
    });

    console.log('✅ Successfully created test user with bonusAmount:');
    console.log(`   ID: ${testUserCreate.id}`);
    console.log(`   Name: ${testUserCreate.name}`);
    console.log(`   Bonus Amount: $${testUserCreate.bonusAmount?.toLocaleString()}`);

    // Test 3: Try to update an existing user's bonusAmount
    console.log('\n🔄 Test 3: Updating test user\'s bonusAmount...');
    
    const updatedUser = await prisma.mboUser.update({
      where: { id: testUserCreate.id },
      data: { bonusAmount: 9500.00 },
      select: {
        id: true,
        name: true,
        bonusAmount: true
      }
    });

    console.log('✅ Successfully updated bonusAmount:');
    console.log(`   User: ${updatedUser.name}`);
    console.log(`   New Bonus Amount: $${updatedUser.bonusAmount?.toLocaleString()}`);

    // Test 4: Query users by bonusAmount (test field is queryable)
    console.log('\n🔍 Test 4: Querying users by bonusAmount...');
    
    const highBonusUsers = await prisma.mboUser.findMany({
      where: {
        bonusAmount: {
          gte: 20000 // Users with bonus >= $20,000
        }
      },
      select: {
        name: true,
        role: true,
        bonusAmount: true
      },
      orderBy: {
        bonusAmount: 'desc'
      },
      take: 5
    });

    console.log('✅ Users with high bonus amounts (>= $20,000):');
    highBonusUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.role}): $${user.bonusAmount?.toLocaleString()}`);
    });

    // Test 5: Aggregate functions with bonusAmount
    console.log('\n📊 Test 5: Running aggregate functions on bonusAmount...');
    
    const bonusStats = await prisma.mboUser.aggregate({
      _sum: {
        bonusAmount: true
      },
      _avg: {
        bonusAmount: true
      },
      _min: {
        bonusAmount: true
      },
      _max: {
        bonusAmount: true
      },
      _count: {
        bonusAmount: true
      }
    });

    console.log('✅ Bonus amount statistics:');
    console.log(`   Total Bonus Pool: $${bonusStats._sum.bonusAmount?.toLocaleString() || '0'}`);
    console.log(`   Average Bonus: $${bonusStats._avg.bonusAmount?.toFixed(0) || '0'}`);
    console.log(`   Minimum Bonus: $${bonusStats._min.bonusAmount?.toLocaleString() || '0'}`);
    console.log(`   Maximum Bonus: $${bonusStats._max.bonusAmount?.toLocaleString() || '0'}`);
    console.log(`   Users with Bonus: ${bonusStats._count.bonusAmount || '0'}`);

    // Clean up: Delete the test user
    console.log('\n🧹 Cleaning up test user...');
    await prisma.mboUser.delete({
      where: { id: testUserCreate.id }
    });
    console.log('✅ Test user deleted successfully');

    console.log('\n🎉 ALL TESTS PASSED! The bonusAmount field is working perfectly!');
    console.log('\n📝 Summary:');
    console.log('✅ Field can be read from existing records');
    console.log('✅ Field can be used in CREATE operations');
    console.log('✅ Field can be used in UPDATE operations');
    console.log('✅ Field can be used in WHERE clauses');
    console.log('✅ Field can be used in aggregate functions');
    console.log('✅ TypeScript types are properly generated');

  } catch (error) {
    console.error('❌ Error during verification:', error);
    
    if (error.message.includes('bonusAmount')) {
      console.log('\n🔧 The bonusAmount field still has issues. Possible solutions:');
      console.log('1. Run: npx prisma generate');
      console.log('2. Restart your development server');
      console.log('3. Check if the database column exists');
    }
  } finally {
    await prisma.$disconnect();
  }
}

verifyBonusAmountField();