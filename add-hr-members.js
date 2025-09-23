const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function addHRMembers() {
  try {
    console.log('Adding HR members to database...\n');

    // Get the Operations department (HR typically reports to Operations)
    const operationsDepartment = await prisma.mboDepartment.findFirst({
      where: { name: 'Operations' }
    });

    if (!operationsDepartment) {
      console.error('❌ Could not find Operations department. Please ensure it exists first.');
      return;
    }

    // Get Crystal Williams as their manager (President - Operations)
    const crystalWilliams = await prisma.mboUser.findFirst({
      where: { email: 'crystal.williams@carecloud.com' }
    });

    console.log('📋 Department and Manager Info:');
    console.log(`- Operations Department: ${operationsDepartment.name} (ID: ${operationsDepartment.id})`);
    console.log(`- Manager: ${crystalWilliams?.name || 'NOT FOUND'} (ID: ${crystalWilliams?.id})\n`);

    console.log('Creating HR Members...');

    // HR Director
    const hrDirector = await prisma.mboUser.create({
      data: {
        employeeId: 'EMP003',
        email: 'sarah.johnson@carecloud.com',
        firstName: 'Sarah',
        lastName: 'Johnson',
        name: 'Sarah Johnson',
        role: 'HR',
        title: 'HR Director',
        phone: '+1-555-0103',
        hireDate: new Date('2021-03-15'),
        salary: 125000.00,
        bonusAmount: 15000.00,
        password: await bcrypt.hash('password123', 10),
        departmentId: operationsDepartment.id,
        managerId: crystalWilliams?.id,
        permissions: JSON.stringify(['MANAGE_HR', 'DEFINE_BONUS_STRUCTURES', 'INITIAL_APPROVALS', 'GENERATE_REPORTS', 'FINAL_HR_APPROVAL']),
      },
    });

    console.log('✅ Created HR Director:', {
      employeeId: hrDirector.employeeId,
      name: hrDirector.name,
      title: hrDirector.title,
      email: hrDirector.email
    });

    // Senior HR Specialist
    const hrSpecialist = await prisma.mboUser.create({
      data: {
        employeeId: 'EMP004',
        email: 'michael.davis@carecloud.com',
        firstName: 'Michael',
        lastName: 'Davis',
        name: 'Michael Davis',
        role: 'HR',
        title: 'Senior HR Specialist',
        phone: '+1-555-0104',
        hireDate: new Date('2022-01-20'),
        salary: 95000.00,
        bonusAmount: 12000.00,
        password: await bcrypt.hash('password123', 10),
        departmentId: operationsDepartment.id,
        managerId: hrDirector.id,
        permissions: JSON.stringify(['REVIEW_OBJECTIVES', 'PROCESS_APPROVALS', 'GENERATE_REPORTS', 'MANAGE_BONUSES']),
      },
    });

    console.log('✅ Created Senior HR Specialist:', {
      employeeId: hrSpecialist.employeeId,
      name: hrSpecialist.name,
      title: hrSpecialist.title,
      email: hrSpecialist.email
    });

    // HR Coordinator
    const hrCoordinator = await prisma.mboUser.create({
      data: {
        employeeId: 'EMP005',
        email: 'jennifer.white@carecloud.com',
        firstName: 'Jennifer',
        lastName: 'White',
        name: 'Jennifer White',
        role: 'HR',
        title: 'HR Coordinator',
        phone: '+1-555-0105',
        hireDate: new Date('2023-06-10'),
        salary: 78000.00,
        bonusAmount: 9000.00,
        password: await bcrypt.hash('password123', 10),
        departmentId: operationsDepartment.id,
        managerId: hrDirector.id,
        permissions: JSON.stringify(['REVIEW_SUBMISSIONS', 'ADMINISTRATIVE_TASKS', 'BASIC_REPORTING']),
      },
    });

    console.log('✅ Created HR Coordinator:', {
      employeeId: hrCoordinator.employeeId,
      name: hrCoordinator.name,
      title: hrCoordinator.title,
      email: hrCoordinator.email
    });

    console.log('\n🎉 All HR members successfully added to database!');

    // Verify by listing all HR users
    const hrUsers = await prisma.mboUser.findMany({
      where: { role: 'HR' },
      include: {
        department: true,
        manager: true
      },
      orderBy: { employeeId: 'asc' }
    });

    console.log('\n👨‍💼 Current HR team members:');
    hrUsers.forEach((hrUser, index) => {
      console.log(`${index + 1}. ${hrUser.name} (${hrUser.employeeId})`);
      console.log(`   Title: ${hrUser.title}`);
      console.log(`   Email: ${hrUser.email}`);
      console.log(`   Department: ${hrUser.department?.name || 'N/A'}`);
      console.log(`   Manager: ${hrUser.manager?.name || 'N/A'}`);
      console.log(`   Salary: $${hrUser.salary?.toLocaleString() || 'N/A'}`);
      console.log(`   Bonus: $${hrUser.bonusAmount?.toLocaleString() || 'N/A'}`);
      console.log(`   Permissions: ${hrUser.permissions ? JSON.parse(hrUser.permissions).join(', ') : 'N/A'}`);
      console.log('');
    });

    // Update role distribution
    const allUsers = await prisma.mboUser.findMany();
    const roleStats = allUsers.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    console.log('📊 Updated role distribution:');
    Object.entries(roleStats).forEach(([role, count]) => {
      console.log(`${role}: ${count}`);
    });

    console.log('\n🔑 HR Login credentials (password: password123):');
    console.log('- sarah.johnson@carecloud.com (HR Director)');
    console.log('- michael.davis@carecloud.com (Senior HR Specialist)');
    console.log('- jennifer.white@carecloud.com (HR Coordinator)');

    console.log('\n📋 HR Team Hierarchy:');
    console.log('Crystal Williams (President - Operations)');
    console.log('└── Sarah Johnson (HR Director)');
    console.log('    ├── Michael Davis (Senior HR Specialist)');
    console.log('    └── Jennifer White (HR Coordinator)');

  } catch (error) {
    console.error('❌ Error adding HR members:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addHRMembers();