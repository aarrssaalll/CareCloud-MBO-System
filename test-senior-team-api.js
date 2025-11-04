const { PrismaClient } = require('@prisma/client');

async function testSeniorTeamAPI() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testing senior management team API logic...');
    
    // First, find a senior manager to test with
    const seniorManagers = await prisma.mboUser.findMany({
      where: {
        OR: [
          { role: 'SENIOR_MANAGEMENT' },
          { name: { contains: 'Crystal' } },
          { name: { contains: 'Hadi' } },
          { name: { contains: 'Arsal' } }
        ]
      },
      select: {
        id: true,
        name: true,
        role: true,
        employeeId: true
      }
    });
    
    console.log('📊 Found senior managers:', seniorManagers);
    
    if (seniorManagers.length === 0) {
      console.log('❌ No senior managers found. Creating a test senior manager...');
      
      // Create a test senior manager
      const testSeniorManager = await prisma.mboUser.create({
        data: {
          employeeId: 'SM001',
          email: 'test.senior@carecloud.com',
          name: 'Test Senior Manager',
          firstName: 'Test',
          lastName: 'Senior Manager',
          role: 'SENIOR_MANAGEMENT',
          title: 'VP of Operations'
        }
      });
      
      console.log('✅ Created test senior manager:', testSeniorManager);
    }
    
    // Test the team loading logic (simulate the API route logic)
    const testManagerId = seniorManagers[0]?.id || (await prisma.mboUser.findFirst({
      where: { role: 'SENIOR_MANAGEMENT' }
    }))?.id;
    
    if (testManagerId) {
      console.log(`🔍 Testing team loading for senior manager ID: ${testManagerId}`);
      
      // Get subordinate managers (managers whose managerId is this senior manager)
      const subordinateManagers = await prisma.mboUser.findMany({
        where: {
          role: 'MANAGER',
          managerId: testManagerId
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
          _count: {
            select: {
              managedUsers: true
            }
          },
          objectives: {
            select: {
              id: true,
              status: true,
              current: true,
              target: true,
              weight: true,
              dueDate: true
            }
          }
        }
      });
      
      console.log(`📊 Found ${subordinateManagers.length} subordinate managers:`, subordinateManagers);
      
      if (subordinateManagers.length === 0) {
        console.log('⚠️ No subordinate managers found. This senior manager has no direct reports.');
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing senior team API:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSeniorTeamAPI();