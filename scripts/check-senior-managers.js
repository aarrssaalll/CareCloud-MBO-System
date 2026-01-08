const { PrismaClient } = require('@prisma/client');

async function checkSeniorManagers() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Looking for senior managers...');
    
    // Find all senior management users
    const seniorManagers = await prisma.mboUser.findMany({
      where: {
        OR: [
          { role: 'SENIOR_MANAGEMENT' },
          { role: 'senior-management' },
          { role: 'senior_management' },
          { name: { contains: 'Crystal' } },
          { name: { contains: 'Hadi' } },
          { name: { contains: 'Arsal' } }
        ]
      },
      select: {
        id: true,
        employeeId: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        role: true,
        title: true,
        status: true
      }
    });

    console.log('\n📋 Found Senior Managers:');
    console.log('======================================');
    
    if (seniorManagers.length === 0) {
      console.log('❌ No senior managers found in database');
    } else {
      seniorManagers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Title: ${user.title}`);
        console.log(`   Status: ${user.status}`);
        console.log(`   ID: ${user.id}`);
        console.log('');
      });
    }
    
    console.log('✅ Query completed successfully');
    
  } catch (error) {
    console.error('❌ Error checking senior managers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSeniorManagers();