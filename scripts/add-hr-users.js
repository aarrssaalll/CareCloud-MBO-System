const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addHRUsers() {
  try {
    console.log('🏢 Adding HR users to the database...');
    
    // Get a department to assign HR users to (we'll use the first available department)
    const departments = await prisma.mboDepartment.findMany();
    const hrDepartmentId = departments.length > 0 ? departments[0].id : null;
    
    const hrUsers = [
      {
        employeeId: 'HR001',
        email: 'linda.martinez@carecloud.com',
        firstName: 'Linda',
        lastName: 'Martinez',
        name: 'Linda Martinez',
        role: 'HR',
        title: 'HR Director',
        phone: '+1-555-0101',
        password: 'hr123',
        departmentId: hrDepartmentId,
        salary: 95000
      },
      {
        employeeId: 'HR002', 
        email: 'james.wilson@carecloud.com',
        firstName: 'James',
        lastName: 'Wilson',
        name: 'James Wilson',
        role: 'HR',
        title: 'HR Manager',
        phone: '+1-555-0102',
        password: 'hr123',
        departmentId: hrDepartmentId,
        salary: 80000
      },
      {
        employeeId: 'HR003',
        email: 'michelle.garcia@carecloud.com', 
        firstName: 'Michelle',
        lastName: 'Garcia',
        name: 'Michelle Garcia',
        role: 'HR',
        title: 'HR Business Partner',
        phone: '+1-555-0103',
        password: 'hr123',
        departmentId: hrDepartmentId,
        salary: 75000
      },
      {
        employeeId: 'HR004',
        email: 'robert.anderson@carecloud.com',
        firstName: 'Robert',
        lastName: 'Anderson', 
        name: 'Robert Anderson',
        role: 'HR',
        title: 'HR Specialist',
        phone: '+1-555-0104',
        password: 'hr123',
        departmentId: hrDepartmentId,
        salary: 65000
      }
    ];

    for (const hrUser of hrUsers) {
      try {
        const createdUser = await prisma.mboUser.create({
          data: hrUser
        });
        console.log('✅ Created HR user:', createdUser.name, '(' + createdUser.email + ')');
      } catch (error) {
        console.error('❌ Error creating user', hrUser.name + ':', error.message);
      }
    }
    
    console.log('');
    console.log('🎉 HR users added successfully!');
    console.log('');
    console.log('HR Login Credentials:');
    console.log('====================');
    hrUsers.forEach((user, index) => {
      console.log((index + 1) + '. ' + user.name + ': ' + user.email + ' / hr123');
    });
    
  } catch (error) {
    console.error('❌ Error adding HR users:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addHRUsers();
