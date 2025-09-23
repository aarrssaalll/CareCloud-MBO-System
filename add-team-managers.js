const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function addTeamManagers() {
  try {
    console.log('Adding department managers and team leads...\n');

    // Get existing departments
    const itDepartment = await prisma.mboDepartment.findFirst({
      where: { name: 'Information Technology' }
    });

    const operationsDepartment = await prisma.mboDepartment.findFirst({
      where: { name: 'Operations' }
    });

    // Get senior management
    const hadiChaudhary = await prisma.mboUser.findFirst({
      where: { email: 'hadi.chaudhary@carecloud.com' }
    });

    const crystalWilliams = await prisma.mboUser.findFirst({
      where: { email: 'crystal.williams@carecloud.com' }
    });

    // Get teams
    const aiTeam = await prisma.mboTeam.findFirst({
      where: { name: 'AI & Machine Learning' }
    });

    const dbTeam = await prisma.mboTeam.findFirst({
      where: { name: 'Database & Analytics' }
    });

    const networksTeam = await prisma.mboTeam.findFirst({
      where: { name: 'Networks & Infrastructure' }
    });

    const complianceTeam = await prisma.mboTeam.findFirst({
      where: { name: 'Compliance' }
    });

    const csrTeam = await prisma.mboTeam.findFirst({
      where: { name: 'Customer Service' }
    });

    const cptCodingTeam = await prisma.mboTeam.findFirst({
      where: { name: 'CPT Coding' }
    });

    console.log('📋 Found required entities. Creating managers...\n');

    console.log('🎯 Creating department managers...');

    // Department Managers (Note: EMP003-EMP005 are already used by HR)
    const itManager = await prisma.mboUser.create({
      data: {
        employeeId: 'EMP006',
        email: 'sarah.johnson.it@carecloud.com',
        firstName: 'Sarah',
        lastName: 'Johnson',
        name: 'Sarah Johnson (IT)',
        role: 'MANAGER',
        title: 'IT Department Manager',
        phone: '+1-555-0106',
        hireDate: new Date('2021-05-10'),
        salary: 180000.00,
        bonusAmount: 25000.00,
        password: await bcrypt.hash('password123', 10),
        departmentId: itDepartment.id,
        managerId: hadiChaudhary.id,
        permissions: JSON.stringify(['MANAGE_DEPARTMENT', 'APPROVE_OBJECTIVES', 'MANAGE_REVIEWS']),
      },
    });

    console.log('✅ Created IT Department Manager:', itManager.name);

    const operationsManager = await prisma.mboUser.create({
      data: {
        employeeId: 'EMP007',
        email: 'michael.davis.ops@carecloud.com',
        firstName: 'Michael',
        lastName: 'Davis',
        name: 'Michael Davis (Ops)',
        role: 'MANAGER',
        title: 'Operations Department Manager',
        phone: '+1-555-0107',
        hireDate: new Date('2020-08-20'),
        salary: 175000.00,
        bonusAmount: 23000.00,
        password: await bcrypt.hash('password123', 10),
        departmentId: operationsDepartment.id,
        managerId: crystalWilliams.id,
        permissions: JSON.stringify(['MANAGE_DEPARTMENT', 'APPROVE_OBJECTIVES', 'MANAGE_REVIEWS']),
      },
    });

    console.log('✅ Created Operations Department Manager:', operationsManager.name);

    console.log('\n👨‍💼 Creating team leads...');

    // IT Team Leads
    const aiTeamLead = await prisma.mboUser.create({
      data: {
        employeeId: 'EMP008',
        email: 'alex.chen@carecloud.com',
        firstName: 'Alex',
        lastName: 'Chen',
        name: 'Alex Chen',
        role: 'MANAGER',
        title: 'AI Team Lead',
        phone: '+1-555-0108',
        hireDate: new Date('2022-01-15'),
        salary: 145000.00,
        bonusAmount: 18000.00,
        password: await bcrypt.hash('password123', 10),
        departmentId: itDepartment.id,
        teamId: aiTeam.id,
        managerId: itManager.id,
        permissions: JSON.stringify(['MANAGE_TEAM', 'ASSIGN_OBJECTIVES', 'REVIEW_PERFORMANCE']),
      },
    });

    console.log('✅ Created AI Team Lead:', aiTeamLead.name);

    const dbTeamLead = await prisma.mboUser.create({
      data: {
        employeeId: 'EMP009',
        email: 'maria.rodriguez@carecloud.com',
        firstName: 'Maria',
        lastName: 'Rodriguez',
        name: 'Maria Rodriguez',
        role: 'MANAGER',
        title: 'Database Team Lead',
        phone: '+1-555-0109',
        hireDate: new Date('2021-09-01'),
        salary: 140000.00,
        bonusAmount: 17000.00,
        password: await bcrypt.hash('password123', 10),
        departmentId: itDepartment.id,
        teamId: dbTeam.id,
        managerId: itManager.id,
        permissions: JSON.stringify(['MANAGE_TEAM', 'ASSIGN_OBJECTIVES', 'REVIEW_PERFORMANCE']),
      },
    });

    console.log('✅ Created Database Team Lead:', dbTeamLead.name);

    const networksTeamLead = await prisma.mboUser.create({
      data: {
        employeeId: 'EMP010',
        email: 'david.kim@carecloud.com',
        firstName: 'David',
        lastName: 'Kim',
        name: 'David Kim',
        role: 'MANAGER',
        title: 'Networks Team Lead',
        phone: '+1-555-0110',
        hireDate: new Date('2021-11-10'),
        salary: 138000.00,
        bonusAmount: 16500.00,
        password: await bcrypt.hash('password123', 10),
        departmentId: itDepartment.id,
        teamId: networksTeam.id,
        managerId: itManager.id,
        permissions: JSON.stringify(['MANAGE_TEAM', 'ASSIGN_OBJECTIVES', 'REVIEW_PERFORMANCE']),
      },
    });

    console.log('✅ Created Networks Team Lead:', networksTeamLead.name);

    // Operations Team Leads
    const complianceTeamLead = await prisma.mboUser.create({
      data: {
        employeeId: 'EMP011',
        email: 'jennifer.white.compliance@carecloud.com',
        firstName: 'Jennifer',
        lastName: 'White',
        name: 'Jennifer White (Compliance)',
        role: 'MANAGER',
        title: 'Compliance Team Lead',
        phone: '+1-555-0111',
        hireDate: new Date('2020-12-05'),
        salary: 125000.00,
        bonusAmount: 15000.00,
        password: await bcrypt.hash('password123', 10),
        departmentId: operationsDepartment.id,
        teamId: complianceTeam.id,
        managerId: operationsManager.id,
        permissions: JSON.stringify(['MANAGE_TEAM', 'ASSIGN_OBJECTIVES', 'REVIEW_PERFORMANCE']),
      },
    });

    console.log('✅ Created Compliance Team Lead:', complianceTeamLead.name);

    const csrTeamLead = await prisma.mboUser.create({
      data: {
        employeeId: 'EMP012',
        email: 'robert.brown@carecloud.com',
        firstName: 'Robert',
        lastName: 'Brown',
        name: 'Robert Brown',
        role: 'MANAGER',
        title: 'Customer Service Team Lead',
        phone: '+1-555-0112',
        hireDate: new Date('2021-07-12'),
        salary: 115000.00,
        bonusAmount: 14000.00,
        password: await bcrypt.hash('password123', 10),
        departmentId: operationsDepartment.id,
        teamId: csrTeam.id,
        managerId: operationsManager.id,
        permissions: JSON.stringify(['MANAGE_TEAM', 'ASSIGN_OBJECTIVES', 'REVIEW_PERFORMANCE']),
      },
    });

    console.log('✅ Created Customer Service Team Lead:', csrTeamLead.name);

    const cptCodingTeamLead = await prisma.mboUser.create({
      data: {
        employeeId: 'EMP013',
        email: 'lisa.garcia@carecloud.com',
        firstName: 'Lisa',
        lastName: 'Garcia',
        name: 'Lisa Garcia',
        role: 'MANAGER',
        title: 'CPT Coding Team Lead',
        phone: '+1-555-0113',
        hireDate: new Date('2021-04-18'),
        salary: 120000.00,
        bonusAmount: 14500.00,
        password: await bcrypt.hash('password123', 10),
        departmentId: operationsDepartment.id,
        teamId: cptCodingTeam.id,
        managerId: operationsManager.id,
        permissions: JSON.stringify(['MANAGE_TEAM', 'ASSIGN_OBJECTIVES', 'REVIEW_PERFORMANCE']),
      },
    });

    console.log('✅ Created CPT Coding Team Lead:', cptCodingTeamLead.name);

    console.log('\n🔄 Updating team leadership relationships...');

    // Update team leader IDs
    await prisma.mboTeam.update({ where: { id: aiTeam.id }, data: { leaderId: aiTeamLead.id } });
    await prisma.mboTeam.update({ where: { id: dbTeam.id }, data: { leaderId: dbTeamLead.id } });
    await prisma.mboTeam.update({ where: { id: networksTeam.id }, data: { leaderId: networksTeamLead.id } });
    await prisma.mboTeam.update({ where: { id: complianceTeam.id }, data: { leaderId: complianceTeamLead.id } });
    await prisma.mboTeam.update({ where: { id: csrTeam.id }, data: { leaderId: csrTeamLead.id } });
    await prisma.mboTeam.update({ where: { id: cptCodingTeam.id }, data: { leaderId: cptCodingTeamLead.id } });

    console.log('✅ Updated all team leadership relationships');

    console.log('\n🎉 All managers and team leads successfully added!');

    // Display complete organizational structure
    const allManagers = await prisma.mboUser.findMany({
      where: { role: 'MANAGER' },
      include: {
        department: true,
        team: true,
        manager: true
      },
      orderBy: { employeeId: 'asc' }
    });

    console.log('\n👨‍💼 Complete Management Structure:');
    allManagers.forEach((manager, index) => {
      console.log(`${index + 1}. ${manager.name} (${manager.employeeId})`);
      console.log(`   Title: ${manager.title}`);
      console.log(`   Email: ${manager.email}`);
      console.log(`   Department: ${manager.department?.name || 'N/A'}`);
      console.log(`   Team: ${manager.team?.name || 'Department Level'}`);
      console.log(`   Reports to: ${manager.manager?.name || 'N/A'}`);
      console.log(`   Salary: $${manager.salary?.toLocaleString() || 'N/A'}`);
      console.log('');
    });

    // Show role distribution
    const allUsers = await prisma.mboUser.findMany();
    const roleStats = allUsers.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    console.log('📊 Updated role distribution:');
    Object.entries(roleStats).forEach(([role, count]) => {
      console.log(`${role}: ${count}`);
    });

    console.log('\n🔑 Manager login credentials (password: password123):');
    console.log('Department Managers:');
    console.log('- sarah.johnson.it@carecloud.com (IT Department Manager)');
    console.log('- michael.davis.ops@carecloud.com (Operations Department Manager)');
    console.log('\nTeam Leads:');
    console.log('- alex.chen@carecloud.com (AI Team Lead)');
    console.log('- maria.rodriguez@carecloud.com (Database Team Lead)');
    console.log('- david.kim@carecloud.com (Networks Team Lead)');
    console.log('- jennifer.white.compliance@carecloud.com (Compliance Team Lead)');
    console.log('- robert.brown@carecloud.com (Customer Service Team Lead)');
    console.log('- lisa.garcia@carecloud.com (CPT Coding Team Lead)');

  } catch (error) {
    console.error('❌ Error adding team managers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTeamManagers();