const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Create a test senior management user
    const testUser = await prisma.mboUser.upsert({
      where: { email: 'test.senior@carecloud.com' },
      update: {},
      create: {
        name: 'Test Senior Manager',
        email: 'test.senior@carecloud.com',
        role: 'SENIOR_MANAGEMENT',
        departmentId: 'Leadership',
        employeeId: 'TSM001',
        password: 'test123', // In real app, this would be hashed
        isActive: true
      }
    });

    // Create a test HR user  
    const hrUser = await prisma.mboUser.upsert({
      where: { email: 'test.hr@carecloud.com' },
      update: {},
      create: {
        name: 'Test HR Manager',
        email: 'test.hr@carecloud.com',
        role: 'HR',
        departmentId: 'Human Resources',
        employeeId: 'THR001',
        password: 'test123',
        isActive: true
      }
    });

    // Create a test manager user
    const managerUser = await prisma.mboUser.upsert({
      where: { email: 'test.manager@carecloud.com' },
      update: {},
      create: {
        name: 'Test Manager',
        email: 'test.manager@carecloud.com',
        role: 'MANAGER',
        departmentId: 'Engineering',
        employeeId: 'TMG001',
        password: 'test123',
        isActive: true
      }
    });

    console.log('✅ Test users created successfully:');
    console.log('- Senior Management:', testUser.email, 'Password: test123');
    console.log('- HR Manager:', hrUser.email, 'Password: test123');
    console.log('- Manager:', managerUser.email, 'Password: test123');

  } catch (error) {
    console.error('❌ Error creating test users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
