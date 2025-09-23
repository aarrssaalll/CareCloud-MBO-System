const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setManagerPasswords() {
  try {
    console.log('🔑 Setting passwords for existing managers...');
    
    // Update all users with MANAGER role to have password "mang123"
    const result = await prisma.mboUser.updateMany({
      where: {
        role: 'MANAGER'
      },
      data: {
        password: 'mang123'
      }
    });
    
    console.log('✅ Updated', result.count, 'managers with password "mang123"');
    
    // Get all managers to display their credentials
    const managers = await prisma.mboUser.findMany({
      where: { role: 'MANAGER' },
      select: {
        name: true,
        email: true,
        title: true
      }
    });
    
    console.log('');
    console.log('🎉 Manager Login Credentials:');
    console.log('=============================');
    managers.forEach((manager, index) => {
      console.log((index + 1) + '. ' + manager.name + ' (' + manager.title + '):');
      console.log('   Email: ' + manager.email);
      console.log('   Password: mang123');
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error setting manager passwords:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

setManagerPasswords();
