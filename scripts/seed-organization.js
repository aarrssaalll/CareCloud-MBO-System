const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // First, let's update existing users with proper data
    console.log('📝 Updating existing users...');
    const existingUsers = await prisma.mboUser.findMany();
    
    for (let i = 0; i < existingUsers.length; i++) {
      const user = existingUsers[i];
      const names = user.name ? user.name.split(' ') : [`User${i+1}`, 'Existing'];
      
      await prisma.mboUser.update({
        where: { id: user.id },
        data: {
          employeeId: `EMP${String(i + 1).padStart(3, '0')}`,
          firstName: names[0] || `User${i+1}`,
          lastName: names[1] || 'Existing',
          title: user.role === 'MANAGER' ? 'Manager' : user.role === 'HR' ? 'HR Specialist' : 'Employee'
        }
      });
    }

    // Create Departments
    console.log('🏢 Creating departments...');
    const itDept = await prisma.mboDepartment.create({
      data: {
        name: 'Information Technology',
        description: 'Technology solutions and infrastructure management',
        budget: 2500000.00
      }
    });

    const opsDept = await prisma.mboDepartment.create({
      data: {
        name: 'Operations',
        description: 'Healthcare operations and patient care management',
        budget: 3200000.00
      }
    });

    // Create Senior Executives
    console.log('👔 Creating senior executives...');
    const crystalWilliams = await prisma.mboUser.create({
      data: {
        employeeId: 'EXE001',
        email: 'crystal.williams@carecloud.com',
        firstName: 'Crystal',
        lastName: 'Williams',
        name: 'Crystal Williams',
        role: 'SENIOR_MANAGEMENT',
        title: 'President - Operations',
        phone: '+1-555-0101',
        hireDate: new Date('2020-01-15'),
        salary: 285000.00,
        status: 'ACTIVE',
        permissions: JSON.stringify(['ALL_ACCESS', 'OVERRIDE_SCORES', 'STRATEGIC_PLANNING']),
        departmentId: opsDept.id
      }
    });

    const hadiChaudhary = await prisma.mboUser.create({
      data: {
        employeeId: 'EXE002',
        email: 'hadi.chaudhary@carecloud.com',
        firstName: 'Hadi',
        lastName: 'Chaudhary',
        name: 'Hadi Chaudhary',
        role: 'SENIOR_MANAGEMENT',
        title: 'President - Technology & AI',
        phone: '+1-555-0102',
        hireDate: new Date('2019-08-10'),
        salary: 295000.00,
        status: 'ACTIVE',
        permissions: JSON.stringify(['ALL_ACCESS', 'OVERRIDE_SCORES', 'TECH_STRATEGY']),
        departmentId: itDept.id
      }
    });

    // Create Department Managers
    console.log('👨‍💼 Creating department managers...');
    const itManager = await prisma.mboUser.create({
      data: {
        employeeId: 'MGR001',
        email: 'david.chen@carecloud.com',
        firstName: 'David',
        lastName: 'Chen',
        name: 'David Chen',
        role: 'MANAGER',
        title: 'IT Director',
        phone: '+1-555-0201',
        hireDate: new Date('2021-03-20'),
        salary: 165000.00,
        status: 'ACTIVE',
        permissions: JSON.stringify(['TEAM_MANAGEMENT', 'BUDGET_APPROVAL', 'HIRING']),
        departmentId: itDept.id,
        managerId: hadiChaudhary.id
      }
    });

    const opsManager = await prisma.mboUser.create({
      data: {
        employeeId: 'MGR002',
        email: 'sarah.johnson@carecloud.com',
        firstName: 'Sarah',
        lastName: 'Johnson',
        name: 'Sarah Johnson',
        role: 'MANAGER',
        title: 'Operations Director',
        phone: '+1-555-0202',
        hireDate: new Date('2020-11-15'),
        salary: 155000.00,
        status: 'ACTIVE',
        permissions: JSON.stringify(['TEAM_MANAGEMENT', 'PROCESS_IMPROVEMENT', 'COMPLIANCE']),
        departmentId: opsDept.id,
        managerId: crystalWilliams.id
      }
    });

    // Update department managers
    await prisma.mboDepartment.update({
      where: { id: itDept.id },
      data: { managerId: itManager.id }
    });

    await prisma.mboDepartment.update({
      where: { id: opsDept.id },
      data: { managerId: opsManager.id }
    });

    // Create IT Teams and Team Leads
    console.log('💻 Creating IT teams...');
    
    // AI Team
    const aiTeam = await prisma.mboTeam.create({
      data: {
        name: 'Artificial Intelligence',
        description: 'AI/ML solutions and automation development',
        departmentId: itDept.id
      }
    });

    const aiLead = await prisma.mboUser.create({
      data: {
        employeeId: 'TL001',
        email: 'alex.rodriguez@carecloud.com',
        firstName: 'Alex',
        lastName: 'Rodriguez',
        name: 'Alex Rodriguez',
        role: 'MANAGER',
        title: 'AI Team Lead',
        phone: '+1-555-0301',
        hireDate: new Date('2022-01-10'),
        salary: 135000.00,
        status: 'ACTIVE',
        permissions: JSON.stringify(['TEAM_LEAD', 'PROJECT_MANAGEMENT', 'TECHNICAL_REVIEW']),
        departmentId: itDept.id,
        teamId: aiTeam.id,
        managerId: itManager.id
      }
    });

    await prisma.mboTeam.update({
      where: { id: aiTeam.id },
      data: { leaderId: aiLead.id }
    });

    // Database Team
    const dbTeam = await prisma.mboTeam.create({
      data: {
        name: 'Database Administration',
        description: 'Database management and optimization',
        departmentId: itDept.id
      }
    });

    const dbLead = await prisma.mboUser.create({
      data: {
        employeeId: 'TL002',
        email: 'maria.garcia@carecloud.com',
        firstName: 'Maria',
        lastName: 'Garcia',
        name: 'Maria Garcia',
        role: 'MANAGER',
        title: 'Database Team Lead',
        phone: '+1-555-0302',
        hireDate: new Date('2021-09-05'),
        salary: 125000.00,
        status: 'ACTIVE',
        permissions: JSON.stringify(['TEAM_LEAD', 'DATABASE_ADMIN', 'BACKUP_MANAGEMENT']),
        departmentId: itDept.id,
        teamId: dbTeam.id,
        managerId: itManager.id
      }
    });

    await prisma.mboTeam.update({
      where: { id: dbTeam.id },
      data: { leaderId: dbLead.id }
    });

    // Networks Team
    const networkTeam = await prisma.mboTeam.create({
      data: {
        name: 'Network Infrastructure',
        description: 'Network security and infrastructure management',
        departmentId: itDept.id
      }
    });

    const networkLead = await prisma.mboUser.create({
      data: {
        employeeId: 'TL003',
        email: 'john.smith@carecloud.com',
        firstName: 'John',
        lastName: 'Smith',
        name: 'John Smith',
        role: 'MANAGER',
        title: 'Network Team Lead',
        phone: '+1-555-0303',
        hireDate: new Date('2021-06-12'),
        salary: 120000.00,
        status: 'ACTIVE',
        permissions: JSON.stringify(['TEAM_LEAD', 'NETWORK_ADMIN', 'SECURITY_MANAGEMENT']),
        departmentId: itDept.id,
        teamId: networkTeam.id,
        managerId: itManager.id
      }
    });

    await prisma.mboTeam.update({
      where: { id: networkTeam.id },
      data: { leaderId: networkLead.id }
    });

    // Create Operations Teams and Team Leads
    console.log('🏥 Creating Operations teams...');
    
    // Compliance Team
    const complianceTeam = await prisma.mboTeam.create({
      data: {
        name: 'Compliance & Audit',
        description: 'Healthcare compliance and regulatory oversight',
        departmentId: opsDept.id
      }
    });

    const complianceLead = await prisma.mboUser.create({
      data: {
        employeeId: 'TL004',
        email: 'jennifer.brown@carecloud.com',
        firstName: 'Jennifer',
        lastName: 'Brown',
        name: 'Jennifer Brown',
        role: 'MANAGER',
        title: 'Compliance Team Lead',
        phone: '+1-555-0304',
        hireDate: new Date('2020-08-22'),
        salary: 115000.00,
        status: 'ACTIVE',
        permissions: JSON.stringify(['TEAM_LEAD', 'COMPLIANCE_OVERSIGHT', 'AUDIT_MANAGEMENT']),
        departmentId: opsDept.id,
        teamId: complianceTeam.id,
        managerId: opsManager.id
      }
    });

    await prisma.mboTeam.update({
      where: { id: complianceTeam.id },
      data: { leaderId: complianceLead.id }
    });

    // Customer Service Team
    const csrTeam = await prisma.mboTeam.create({
      data: {
        name: 'Customer Service Relations',
        description: 'Patient and client relationship management',
        departmentId: opsDept.id
      }
    });

    const csrLead = await prisma.mboUser.create({
      data: {
        employeeId: 'TL005',
        email: 'michael.davis@carecloud.com',
        firstName: 'Michael',
        lastName: 'Davis',
        name: 'Michael Davis',
        role: 'MANAGER',
        title: 'CSR Team Lead',
        phone: '+1-555-0305',
        hireDate: new Date('2021-04-18'),
        salary: 95000.00,
        status: 'ACTIVE',
        permissions: JSON.stringify(['TEAM_LEAD', 'CUSTOMER_MANAGEMENT', 'ESCALATION_HANDLING']),
        departmentId: opsDept.id,
        teamId: csrTeam.id,
        managerId: opsManager.id
      }
    });

    await prisma.mboTeam.update({
      where: { id: csrTeam.id },
      data: { leaderId: csrLead.id }
    });

    // CPT Coding Team
    const cptTeam = await prisma.mboTeam.create({
      data: {
        name: 'CPT Coding & Billing',
        description: 'Medical coding and billing operations',
        departmentId: opsDept.id
      }
    });

    const cptLead = await prisma.mboUser.create({
      data: {
        employeeId: 'TL006',
        email: 'lisa.wilson@carecloud.com',
        firstName: 'Lisa',
        lastName: 'Wilson',
        name: 'Lisa Wilson',
        role: 'MANAGER',
        title: 'CPT Coding Team Lead',
        phone: '+1-555-0306',
        hireDate: new Date('2020-12-03'),
        salary: 105000.00,
        status: 'ACTIVE',
        permissions: JSON.stringify(['TEAM_LEAD', 'CODING_OVERSIGHT', 'BILLING_MANAGEMENT']),
        departmentId: opsDept.id,
        teamId: cptTeam.id,
        managerId: opsManager.id
      }
    });

    await prisma.mboTeam.update({
      where: { id: cptTeam.id },
      data: { leaderId: cptLead.id }
    });

    // Create Employees for each team (2-4 per team)
    console.log('👥 Creating team members...');
    
    const teams = [
      { team: aiTeam, lead: aiLead, prefix: 'AI', count: 4 },
      { team: dbTeam, lead: dbLead, prefix: 'DB', count: 3 },
      { team: networkTeam, lead: networkLead, prefix: 'NT', count: 3 },
      { team: complianceTeam, lead: complianceLead, prefix: 'CP', count: 4 },
      { team: csrTeam, lead: csrLead, prefix: 'CS', count: 4 },
      { team: cptTeam, lead: cptLead, prefix: 'CT', count: 3 }
    ];

    const employeeNames = [
      ['Emily', 'Parker'], ['Robert', 'Taylor'], ['Amanda', 'Moore'], ['James', 'Anderson'],
      ['Jessica', 'Thomas'], ['Christopher', 'Jackson'], ['Ashley', 'White'], ['Matthew', 'Harris'],
      ['Sarah', 'Martin'], ['Daniel', 'Thompson'], ['Michelle', 'Garcia'], ['Ryan', 'Martinez'],
      ['Nicole', 'Robinson'], ['Kevin', 'Clark'], ['Rachel', 'Rodriguez'], ['Brandon', 'Lewis'],
      ['Stephanie', 'Lee'], ['Jason', 'Walker'], ['Amy', 'Hall'], ['Justin', 'Allen'],
      ['Melissa', 'Young'], ['Andrew', 'Hernandez'], ['Angela', 'King'], ['Joshua', 'Wright']
    ];

    let employeeIndex = 0;
    let empCounter = 100;

    for (const teamInfo of teams) {
      for (let i = 0; i < teamInfo.count; i++) {
        const [firstName, lastName] = employeeNames[employeeIndex % employeeNames.length];
        employeeIndex++;
        empCounter++;

        await prisma.mboUser.create({
          data: {
            employeeId: `${teamInfo.prefix}${String(empCounter).padStart(3, '0')}`,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@carecloud.com`,
            firstName,
            lastName,
            name: `${firstName} ${lastName}`,
            role: 'EMPLOYEE',
            title: getEmployeeTitle(teamInfo.prefix),
            phone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
            hireDate: new Date(2022 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
            salary: 65000 + Math.floor(Math.random() * 25000),
            status: 'ACTIVE',
            permissions: JSON.stringify(['BASIC_ACCESS', 'SUBMIT_OBJECTIVES']),
            departmentId: teamInfo.team.departmentId,
            teamId: teamInfo.team.id,
            managerId: teamInfo.lead.id
          }
        });
      }
    }

    // Create sample objectives for all users
    console.log('🎯 Creating sample objectives...');
    const users = await prisma.mboUser.findMany();
    
    for (const user of users) {
      // Create 2-3 objectives per user for Q1 2025
      const objectiveCount = 2 + Math.floor(Math.random() * 2);
      
      for (let i = 0; i < objectiveCount; i++) {
        const objectives = getObjectivesForRole(user.role, user.title);
        const objective = objectives[i % objectives.length];
        
        await prisma.mboObjective.create({
          data: {
            title: objective.title,
            description: objective.description,
            category: objective.category,
            target: objective.target,
            current: Math.floor(Math.random() * objective.target * 0.8),
            weight: 1.0,
            status: 'ACTIVE',
            dueDate: new Date('2025-03-31'),
            quarter: 'Q1',
            year: 2025,
            userId: user.id,
            assignedById: user.managerId
          }
        });
      }
    }

    console.log('✅ Database seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`👥 Total Users: ${users.length + 23}`);
    console.log(`🏢 Departments: 2`);
    console.log(`👔 Teams: 6`);
    console.log(`🎯 Objectives: ${(users.length + 23) * 2.5} (avg)`);

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

function getEmployeeTitle(prefix) {
  const titles = {
    'AI': 'AI Developer',
    'DB': 'Database Administrator',
    'NT': 'Network Engineer',
    'CP': 'Compliance Specialist',
    'CS': 'Customer Service Representative',
    'CT': 'Medical Coder'
  };
  return titles[prefix] || 'Employee';
}

function getObjectivesForRole(role, title) {
  const objectives = {
    'SENIOR_MANAGEMENT': [
      {
        title: 'Strategic Revenue Growth',
        description: 'Achieve 15% revenue growth through strategic initiatives and market expansion',
        category: 'Strategic',
        target: 15
      },
      {
        title: 'Operational Excellence',
        description: 'Improve operational efficiency by 20% through process optimization',
        category: 'Operations',
        target: 20
      },
      {
        title: 'Market Leadership',
        description: 'Establish market leadership in 2 new service areas',
        category: 'Growth',
        target: 2
      }
    ],
    'MANAGER': [
      {
        title: 'Team Performance',
        description: 'Achieve 95% team performance targets across all direct reports',
        category: 'Leadership',
        target: 95
      },
      {
        title: 'Project Delivery',
        description: 'Complete all assigned projects within budget and timeline',
        category: 'Project Management',
        target: 100
      },
      {
        title: 'Team Development',
        description: 'Conduct quarterly development reviews for all team members',
        category: 'Development',
        target: 4
      }
    ],
    'EMPLOYEE': [
      {
        title: 'Technical Proficiency',
        description: 'Complete professional development certification relevant to role',
        category: 'Professional Development',
        target: 1
      },
      {
        title: 'Quality Standards',
        description: 'Maintain 98% quality score on all deliverables',
        category: 'Quality',
        target: 98
      },
      {
        title: 'Productivity Goals',
        description: 'Meet or exceed individual productivity targets',
        category: 'Performance',
        target: 100
      }
    ]
  };

  return objectives[role] || objectives['EMPLOYEE'];
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
