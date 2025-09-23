const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setEmployeePasswords() {
  try {
    console.log('🔑 Setting passwords for existing employees...');
    
    // Update all users with EMPLOYEE role to have password "emp123"
    const result = await prisma.mboUser.updateMany({
      where: {
        role: 'EMPLOYEE'
      },
      data: {
        password: 'emp123'
      }
    });
    
    console.log('✅ Updated', result.count, 'employees with password "emp123"');
    
    // Get all employees to display their credentials
    const employees = await prisma.mboUser.findMany({
      where: { role: 'EMPLOYEE' },
      select: {
        name: true,
        email: true,
        title: true
      }
    });
    
    console.log('');
    console.log('🎉 Employee Login Credentials:');
    console.log('==============================');
    employees.forEach((employee, index) => {
      console.log((index + 1) + '. ' + employee.name + ' (' + (employee.title || 'Employee') + '):');
      console.log('   Email: ' + employee.email);
      console.log('   Password: emp123');
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error setting employee passwords:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

setEmployeePasswords();
