const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addTeams() {
  try {
    console.log('Adding teams to departments...\n');

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

    // Create IT Teams
    console.log('Creating IT Teams...');

    const aiTeam = await prisma.mboTeam.create({
      data: {
        name: 'AI & Machine Learning',
        description: 'Artificial Intelligence and Machine Learning development team',
        departmentId: itDepartment.id,
      },
    });

    console.log('✅ Created AI & Machine Learning team:', aiTeam.name);

    const dbTeam = await prisma.mboTeam.create({
      data: {
        name: 'Database & Analytics',
        description: 'Database management and data analytics team',
        departmentId: itDepartment.id,
      },
    });

    console.log('✅ Created Database & Analytics team:', dbTeam.name);

    const networksTeam = await prisma.mboTeam.create({
      data: {
        name: 'Networks & Infrastructure',
        description: 'Network infrastructure and security team',
        departmentId: itDepartment.id,
      },
    });

    console.log('✅ Created Networks & Infrastructure team:', networksTeam.name);

    // Create Operations Teams
    console.log('\nCreating Operations Teams...');

    const complianceTeam = await prisma.mboTeam.create({
      data: {
        name: 'Compliance',
        description: 'Regulatory compliance and risk management team',
        departmentId: operationsDepartment.id,
      },
    });

    console.log('✅ Created Compliance team:', complianceTeam.name);

    const csrTeam = await prisma.mboTeam.create({
      data: {
        name: 'Customer Service',
        description: 'Customer support and relationship management team',
        departmentId: operationsDepartment.id,
      },
    });

    console.log('✅ Created Customer Service team:', csrTeam.name);

    const cptCodingTeam = await prisma.mboTeam.create({
      data: {
        name: 'CPT Coding',
        description: 'Medical coding and billing team',
        departmentId: operationsDepartment.id,
      },
    });

    console.log('✅ Created CPT Coding team:', cptCodingTeam.name);

    console.log('\n🎉 All teams successfully added to database!');

    // Verify by listing all teams grouped by department
    const allTeams = await prisma.mboTeam.findMany({
      include: {
        department: true
      },
      orderBy: [
        { department: { name: 'asc' } },
        { name: 'asc' }
      ]
    });

    console.log('\n📋 Current teams in database:');
    
    const itTeams = allTeams.filter(team => team.department.name === 'Information Technology');
    const opsTeams = allTeams.filter(team => team.department.name === 'Operations');

    console.log('\n🖥️ Information Technology Department:');
    itTeams.forEach((team, index) => {
      console.log(`  ${index + 1}. ${team.name} - ${team.description}`);
    });

    console.log('\n🏢 Operations Department:');
    opsTeams.forEach((team, index) => {
      console.log(`  ${index + 1}. ${team.name} - ${team.description}`);
    });

    console.log(`\n📊 Total teams created: ${allTeams.length}`);

  } catch (error) {
    console.error('❌ Error adding teams:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTeams();