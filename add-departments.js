const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addDepartments() {
  try {
    console.log('Adding departments to database...\n');

    // Create IT Department
    const itDepartment = await prisma.mboDepartment.create({
      data: {
        name: 'Information Technology',
        description: 'Technology and digital innovation department',
        budget: 2500000.00,
      },
    });

    console.log('✅ Created IT Department:', {
      id: itDepartment.id,
      name: itDepartment.name,
      budget: itDepartment.budget
    });

    // Create Operations Department
    const operationsDepartment = await prisma.mboDepartment.create({
      data: {
        name: 'Operations',
        description: 'Business operations and customer service department',
        budget: 1800000.00,
      },
    });

    console.log('✅ Created Operations Department:', {
      id: operationsDepartment.id,
      name: operationsDepartment.name,
      budget: operationsDepartment.budget
    });

    console.log('\n🎉 Both departments successfully added to database!');

    // Verify by listing all departments
    const allDepartments = await prisma.mboDepartment.findMany();
    console.log('\n📋 Current departments in database:');
    allDepartments.forEach((dept, index) => {
      console.log(`${index + 1}. ${dept.name} (Budget: $${dept.budget?.toLocaleString() || 'N/A'})`);
    });

  } catch (error) {
    console.error('❌ Error adding departments:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addDepartments();