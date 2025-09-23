const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function addSeniorManagers() {
  try {
    console.log('Adding senior managers to departments...\n');

    // First, get the existing departments
    const itDepartment = await prisma.mboDepartment.findFirst({
      where: { name: 'Information Technology' }
    });

    const operationsDepartment = await prisma.mboDepartment.findFirst({
      where: { name: 'Operations' }
    });

    if (!itDepartment || !operationsDepartment) {
      console.error('❌ Could not find required departments. Please ensure they exist first.');
      return;
    }

    console.log('📋 Found departments:');
    console.log(`- IT Department: ${itDepartment.name} (ID: ${itDepartment.id})`);
    console.log(`- Operations Department: ${operationsDepartment.name} (ID: ${operationsDepartment.id})\n`);

    console.log('Creating Senior Executives...');

    // Senior Executives
    const crystalWilliams = await prisma.mboUser.create({
      data: {
        employeeId: 'EMP001',
        email: 'crystal.williams@carecloud.com',
        firstName: 'Crystal',
        lastName: 'Williams',
        name: 'Crystal Williams',
        role: 'SENIOR_MANAGEMENT',
        title: 'President - Operations',
        phone: '+1-555-0101',
        hireDate: new Date('2020-01-15'),
        salary: 350000.00,
        bonusAmount: 50000.00,
        password: await bcrypt.hash('password123', 10),
        departmentId: operationsDepartment.id,
        permissions: JSON.stringify(['ALL', 'OVERRIDE_SCORES', 'FINAL_APPROVAL']),
      },
    });

    console.log('✅ Created Crystal Williams:', {
      employeeId: crystalWilliams.employeeId,
      name: crystalWilliams.name,
      title: crystalWilliams.title,
      email: crystalWilliams.email
    });

    const hadiChaudhary = await prisma.mboUser.create({
      data: {
        employeeId: 'EMP002',
        email: 'hadi.chaudhary@carecloud.com',
        firstName: 'Hadi',
        lastName: 'Chaudhary',
        name: 'Hadi Chaudhary',
        role: 'SENIOR_MANAGEMENT',
        title: 'President - IT & AI',
        phone: '+1-555-0102',
        hireDate: new Date('2019-03-01'),
        salary: 360000.00,
        bonusAmount: 55000.00,
        password: await bcrypt.hash('password123', 10),
        departmentId: itDepartment.id,
        permissions: JSON.stringify(['ALL', 'OVERRIDE_SCORES', 'FINAL_APPROVAL']),
      },
    });

    console.log('✅ Created Hadi Chaudhary:', {
      employeeId: hadiChaudhary.employeeId,
      name: hadiChaudhary.name,
      title: hadiChaudhary.title,
      email: hadiChaudhary.email
    });

    console.log('\n🎉 All senior managers successfully added to database!');

    // Update the department manager IDs to link them properly
    console.log('\n🔄 Updating department manager relationships...');

    await prisma.mboDepartment.update({
      where: { id: itDepartment.id },
      data: { managerId: hadiChaudhary.id }
    });

    await prisma.mboDepartment.update({
      where: { id: operationsDepartment.id },
      data: { managerId: crystalWilliams.id }
    });

    console.log('✅ Updated department manager relationships');

    // Verify by listing all senior managers
    const seniorManagers = await prisma.mboUser.findMany({
      where: { role: 'SENIOR_MANAGEMENT' },
      include: {
        department: true
      },
      orderBy: { employeeId: 'asc' }
    });

    console.log('\n👑 Current senior managers in database:');
    seniorManagers.forEach((manager, index) => {
      console.log(`${index + 1}. ${manager.name} (${manager.employeeId})`);
      console.log(`   Title: ${manager.title}`);
      console.log(`   Email: ${manager.email}`);
      console.log(`   Department: ${manager.department?.name || 'N/A'}`);
      console.log(`   Salary: $${manager.salary?.toLocaleString() || 'N/A'}`);
      console.log(`   Bonus: $${manager.bonusAmount?.toLocaleString() || 'N/A'}`);
      console.log('');
    });

    console.log('🔑 Login credentials (password: password123):');
    console.log('- crystal.williams@carecloud.com (Operations President)');
    console.log('- hadi.chaudhary@carecloud.com (IT & AI President)');

  } catch (error) {
    console.error('❌ Error adding senior managers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSeniorManagers();