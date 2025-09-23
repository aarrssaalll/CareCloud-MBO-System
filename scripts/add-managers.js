const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addManagers() {
  try {
    console.log('👔 Adding Manager users to the database...');
    
    // Get departments to assign managers to
    const departments = await prisma.mboDepartment.findMany();
    
    const managers = [
      {
        employeeId: 'MGR001',
        email: 'david.thompson@carecloud.com',
        firstName: 'David',
        lastName: 'Thompson',
        name: 'David Thompson',
        role: 'MANAGER',
        title: 'Engineering Manager',
        phone: '+1-555-0201',
        password: 'mang123',
        departmentId: departments[0]?.id || null,
        salary: 120000
      },
      {
        employeeId: 'MGR002', 
        email: 'sarah.rodriguez@carecloud.com',
        firstName: 'Sarah',
        lastName: 'Rodriguez',
        name: 'Sarah Rodriguez',
        role: 'MANAGER',
        title: 'Sales Manager',
        phone: '+1-555-0202',
        password: 'mang123',
        departmentId: departments[1]?.id || departments[0]?.id || null,
        salary: 115000
      },
      {
        employeeId: 'MGR003',
        email: 'michael.chen@carecloud.com', 
        firstName: 'Michael',
        lastName: 'Chen',
        name: 'Michael Chen',
        role: 'MANAGER',
        title: 'Product Manager',
        phone: '+1-555-0203',
        password: 'mang123',
        departmentId: departments[2]?.id || departments[0]?.id || null,
        salary: 125000
      },
      {
        employeeId: 'MGR004',
        email: 'jennifer.davis@carecloud.com',
        firstName: 'Jennifer',
        lastName: 'Davis', 
        name: 'Jennifer Davis',
        role: 'MANAGER',
        title: 'Operations Manager',
        phone: '+1-555-0204',
        password: 'mang123',
        departmentId: departments[3]?.id || departments[0]?.id || null,
        salary: 110000
      },
      {
        employeeId: 'MGR005',
        email: 'alex.kumar@carecloud.com',
        firstName: 'Alex',
        lastName: 'Kumar',
        name: 'Alex Kumar',
        role: 'MANAGER',
        title: 'Marketing Manager',
        phone: '+1-555-0205',
        password: 'mang123',
        departmentId: departments[4]?.id || departments[0]?.id || null,
        salary: 105000
      },
      {
        employeeId: 'MGR006',
        email: 'lisa.wong@carecloud.com',
        firstName: 'Lisa',
        lastName: 'Wong',
        name: 'Lisa Wong',
        role: 'MANAGER',
        title: 'Finance Manager',
        phone: '+1-555-0206',
        password: 'mang123',
        departmentId: departments[5]?.id || departments[0]?.id || null,
        salary: 118000
      }
    ];

    for (const manager of managers) {
      try {
        const createdUser = await prisma.mboUser.create({
          data: manager
        });
        console.log('✅ Created Manager:', createdUser.name, '(' + createdUser.email + ')');
      } catch (error) {
        console.error('❌ Error creating manager', manager.name + ':', error.message);
      }
    }
    
    console.log('');
    console.log('🎉 Managers added successfully!');
    console.log('');
    console.log('Manager Login Credentials:');
    console.log('=========================');
    managers.forEach((user, index) => {
      console.log((index + 1) + '. ' + user.name + ': ' + user.email + ' / mang123');
    });
    
  } catch (error) {
    console.error('❌ Error adding managers:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addManagers();
