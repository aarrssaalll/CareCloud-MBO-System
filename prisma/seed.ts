import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  await prisma.mboApproval.deleteMany();
  await prisma.mboObjectiveReview.deleteMany();
  await prisma.mboObjective.deleteMany();
  await prisma.mboBonus.deleteMany();
  await prisma.mboReview.deleteMany();
  await prisma.mboUser.deleteMany();
  await prisma.mboTeam.deleteMany();
  await prisma.mboDepartment.deleteMany();

  console.log('📁 Creating departments...');

  // Create IT Department
  const itDepartment = await prisma.mboDepartment.create({
    data: {
      name: 'Information Technology',
      description: 'Technology and digital innovation department',
      budget: 2500000.00,
    },
  });

  // Create Operations Department
  const operationsDepartment = await prisma.mboDepartment.create({
    data: {
      name: 'Operations',
      description: 'Business operations and customer service department',
      budget: 1800000.00,
    },
  });

  console.log('👥 Creating teams...');

  // IT Teams
  const aiTeam = await prisma.mboTeam.create({
    data: {
      name: 'AI & Machine Learning',
      description: 'Artificial Intelligence and Machine Learning development team',
      departmentId: itDepartment.id,
    },
  });

  const dbTeam = await prisma.mboTeam.create({
    data: {
      name: 'Database & Analytics',
      description: 'Database management and data analytics team',
      departmentId: itDepartment.id,
    },
  });

  const networksTeam = await prisma.mboTeam.create({
    data: {
      name: 'Networks & Infrastructure',
      description: 'Network infrastructure and security team',
      departmentId: itDepartment.id,
    },
  });

  // Operations Teams
  const complianceTeam = await prisma.mboTeam.create({
    data: {
      name: 'Compliance',
      description: 'Regulatory compliance and risk management team',
      departmentId: operationsDepartment.id,
    },
  });

  const csrTeam = await prisma.mboTeam.create({
    data: {
      name: 'Customer Service',
      description: 'Customer support and relationship management team',
      departmentId: operationsDepartment.id,
    },
  });

  const cptCodingTeam = await prisma.mboTeam.create({
    data: {
      name: 'CPT Coding',
      description: 'Medical coding and billing team',
      departmentId: operationsDepartment.id,
    },
  });

  console.log('👑 Creating senior executives...');

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
      departmentId: operationsDepartment.id,
      permissions: JSON.stringify(['ALL', 'OVERRIDE_SCORES', 'FINAL_APPROVAL']),
    },
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
      departmentId: itDepartment.id,
      permissions: JSON.stringify(['ALL', 'OVERRIDE_SCORES', 'FINAL_APPROVAL']),
    },
  });

  console.log('🎯 Creating department managers...');

  // Department Managers
  const itManager = await prisma.mboUser.create({
    data: {
      employeeId: 'EMP003',
      email: 'sarah.johnson@carecloud.com',
      firstName: 'Sarah',
      lastName: 'Johnson',
      name: 'Sarah Johnson',
      role: 'MANAGER',
      title: 'IT Department Manager',
      phone: '+1-555-0103',
      hireDate: new Date('2021-05-10'),
      salary: 180000.00,
      departmentId: itDepartment.id,
      managerId: hadiChaudhary.id,
      permissions: JSON.stringify(['MANAGE_DEPARTMENT', 'APPROVE_OBJECTIVES', 'MANAGE_REVIEWS']),
    },
  });

  const operationsManager = await prisma.mboUser.create({
    data: {
      employeeId: 'EMP004',
      email: 'michael.davis@carecloud.com',
      firstName: 'Michael',
      lastName: 'Davis',
      name: 'Michael Davis',
      role: 'MANAGER',
      title: 'Operations Department Manager',
      phone: '+1-555-0104',
      hireDate: new Date('2020-08-20'),
      salary: 175000.00,
      departmentId: operationsDepartment.id,
      managerId: crystalWilliams.id,
      permissions: JSON.stringify(['MANAGE_DEPARTMENT', 'APPROVE_OBJECTIVES', 'MANAGE_REVIEWS']),
    },
  });

  console.log('👨‍💼 Creating team leads...');

  // IT Team Leads
  const aiTeamLead = await prisma.mboUser.create({
    data: {
      employeeId: 'EMP005',
      email: 'alex.chen@carecloud.com',
      firstName: 'Alex',
      lastName: 'Chen',
      name: 'Alex Chen',
      role: 'MANAGER',
      title: 'AI Team Lead',
      phone: '+1-555-0105',
      hireDate: new Date('2022-01-15'),
      salary: 145000.00,
      departmentId: itDepartment.id,
      teamId: aiTeam.id,
      managerId: itManager.id,
      permissions: JSON.stringify(['MANAGE_TEAM', 'ASSIGN_OBJECTIVES', 'REVIEW_PERFORMANCE']),
    },
  });

  const dbTeamLead = await prisma.mboUser.create({
    data: {
      employeeId: 'EMP006',
      email: 'maria.rodriguez@carecloud.com',
      firstName: 'Maria',
      lastName: 'Rodriguez',
      name: 'Maria Rodriguez',
      role: 'MANAGER',
      title: 'Database Team Lead',
      phone: '+1-555-0106',
      hireDate: new Date('2021-09-01'),
      salary: 140000.00,
      departmentId: itDepartment.id,
      teamId: dbTeam.id,
      managerId: itManager.id,
      permissions: JSON.stringify(['MANAGE_TEAM', 'ASSIGN_OBJECTIVES', 'REVIEW_PERFORMANCE']),
    },
  });

  const networksTeamLead = await prisma.mboUser.create({
    data: {
      employeeId: 'EMP007',
      email: 'david.kim@carecloud.com',
      firstName: 'David',
      lastName: 'Kim',
      name: 'David Kim',
      role: 'MANAGER',
      title: 'Networks Team Lead',
      phone: '+1-555-0107',
      hireDate: new Date('2021-11-10'),
      salary: 138000.00,
      departmentId: itDepartment.id,
      teamId: networksTeam.id,
      managerId: itManager.id,
      permissions: JSON.stringify(['MANAGE_TEAM', 'ASSIGN_OBJECTIVES', 'REVIEW_PERFORMANCE']),
    },
  });

  // Operations Team Leads
  const complianceTeamLead = await prisma.mboUser.create({
    data: {
      employeeId: 'EMP008',
      email: 'jennifer.white@carecloud.com',
      firstName: 'Jennifer',
      lastName: 'White',
      name: 'Jennifer White',
      role: 'MANAGER',
      title: 'Compliance Team Lead',
      phone: '+1-555-0108',
      hireDate: new Date('2020-12-05'),
      salary: 125000.00,
      departmentId: operationsDepartment.id,
      teamId: complianceTeam.id,
      managerId: operationsManager.id,
      permissions: JSON.stringify(['MANAGE_TEAM', 'ASSIGN_OBJECTIVES', 'REVIEW_PERFORMANCE']),
    },
  });

  const csrTeamLead = await prisma.mboUser.create({
    data: {
      employeeId: 'EMP009',
      email: 'robert.brown@carecloud.com',
      firstName: 'Robert',
      lastName: 'Brown',
      name: 'Robert Brown',
      role: 'MANAGER',
      title: 'Customer Service Team Lead',
      phone: '+1-555-0109',
      hireDate: new Date('2021-07-12'),
      salary: 115000.00,
      departmentId: operationsDepartment.id,
      teamId: csrTeam.id,
      managerId: operationsManager.id,
      permissions: JSON.stringify(['MANAGE_TEAM', 'ASSIGN_OBJECTIVES', 'REVIEW_PERFORMANCE']),
    },
  });

  const cptCodingTeamLead = await prisma.mboUser.create({
    data: {
      employeeId: 'EMP010',
      email: 'lisa.garcia@carecloud.com',
      firstName: 'Lisa',
      lastName: 'Garcia',
      name: 'Lisa Garcia',
      role: 'MANAGER',
      title: 'CPT Coding Team Lead',
      phone: '+1-555-0110',
      hireDate: new Date('2021-04-18'),
      salary: 120000.00,
      departmentId: operationsDepartment.id,
      teamId: cptCodingTeam.id,
      managerId: operationsManager.id,
      permissions: JSON.stringify(['MANAGE_TEAM', 'ASSIGN_OBJECTIVES', 'REVIEW_PERFORMANCE']),
    },
  });

  console.log('👨‍💻 Creating team members...');

  // AI Team Members
  const aiEmployees = await Promise.all([
    prisma.mboUser.create({
      data: {
        employeeId: 'EMP011',
        email: 'john.smith@carecloud.com',
        firstName: 'John',
        lastName: 'Smith',
        name: 'John Smith',
        role: 'EMPLOYEE',
        title: 'Senior AI Engineer',
        phone: '+1-555-0111',
        hireDate: new Date('2022-06-01'),
        salary: 125000.00,
        departmentId: itDepartment.id,
        teamId: aiTeam.id,
        managerId: aiTeamLead.id,
        permissions: JSON.stringify(['VIEW_OBJECTIVES', 'UPDATE_PROGRESS', 'SUBMIT_REVIEWS']),
      },
    }),
    prisma.mboUser.create({
      data: {
        employeeId: 'EMP012',
        email: 'emily.taylor@carecloud.com',
        firstName: 'Emily',
        lastName: 'Taylor',
        name: 'Emily Taylor',
        role: 'EMPLOYEE',
        title: 'ML Data Scientist',
        phone: '+1-555-0112',
        hireDate: new Date('2022-08-15'),
        salary: 118000.00,
        departmentId: itDepartment.id,
        teamId: aiTeam.id,
        managerId: aiTeamLead.id,
        permissions: JSON.stringify(['VIEW_OBJECTIVES', 'UPDATE_PROGRESS', 'SUBMIT_REVIEWS']),
      },
    }),
    prisma.mboUser.create({
      data: {
        employeeId: 'EMP013',
        email: 'carlos.martinez@carecloud.com',
        firstName: 'Carlos',
        lastName: 'Martinez',
        name: 'Carlos Martinez',
        role: 'EMPLOYEE',
        title: 'AI Research Engineer',
        phone: '+1-555-0113',
        hireDate: new Date('2023-01-10'),
        salary: 115000.00,
        departmentId: itDepartment.id,
        teamId: aiTeam.id,
        managerId: aiTeamLead.id,
        permissions: JSON.stringify(['VIEW_OBJECTIVES', 'UPDATE_PROGRESS', 'SUBMIT_REVIEWS']),
      },
    }),
  ]);

  // Database Team Members
  const dbEmployees = await Promise.all([
    prisma.mboUser.create({
      data: {
        employeeId: 'EMP014',
        email: 'anna.wilson@carecloud.com',
        firstName: 'Anna',
        lastName: 'Wilson',
        name: 'Anna Wilson',
        role: 'EMPLOYEE',
        title: 'Senior Database Administrator',
        phone: '+1-555-0114',
        hireDate: new Date('2021-10-05'),
        salary: 110000.00,
        departmentId: itDepartment.id,
        teamId: dbTeam.id,
        managerId: dbTeamLead.id,
        permissions: JSON.stringify(['VIEW_OBJECTIVES', 'UPDATE_PROGRESS', 'SUBMIT_REVIEWS']),
      },
    }),
    prisma.mboUser.create({
      data: {
        employeeId: 'EMP015',
        email: 'james.anderson@carecloud.com',
        firstName: 'James',
        lastName: 'Anderson',
        name: 'James Anderson',
        role: 'EMPLOYEE',
        title: 'Data Analytics Engineer',
        phone: '+1-555-0115',
        hireDate: new Date('2022-03-20'),
        salary: 105000.00,
        departmentId: itDepartment.id,
        teamId: dbTeam.id,
        managerId: dbTeamLead.id,
        permissions: JSON.stringify(['VIEW_OBJECTIVES', 'UPDATE_PROGRESS', 'SUBMIT_REVIEWS']),
      },
    }),
    prisma.mboUser.create({
      data: {
        employeeId: 'EMP016',
        email: 'sophie.lee@carecloud.com',
        firstName: 'Sophie',
        lastName: 'Lee',
        name: 'Sophie Lee',
        role: 'EMPLOYEE',
        title: 'Database Developer',
        phone: '+1-555-0116',
        hireDate: new Date('2022-09-12'),
        salary: 98000.00,
        departmentId: itDepartment.id,
        teamId: dbTeam.id,
        managerId: dbTeamLead.id,
        permissions: JSON.stringify(['VIEW_OBJECTIVES', 'UPDATE_PROGRESS', 'SUBMIT_REVIEWS']),
      },
    }),
    prisma.mboUser.create({
      data: {
        employeeId: 'EMP017',
        email: 'ryan.thomas@carecloud.com',
        firstName: 'Ryan',
        lastName: 'Thomas',
        name: 'Ryan Thomas',
        role: 'EMPLOYEE',
        title: 'Junior Data Analyst',
        phone: '+1-555-0117',
        hireDate: new Date('2023-04-01'),
        salary: 85000.00,
        departmentId: itDepartment.id,
        teamId: dbTeam.id,
        managerId: dbTeamLead.id,
        permissions: JSON.stringify(['VIEW_OBJECTIVES', 'UPDATE_PROGRESS', 'SUBMIT_REVIEWS']),
      },
    }),
  ]);

  // Networks Team Members
  const networkEmployees = await Promise.all([
    prisma.mboUser.create({
      data: {
        employeeId: 'EMP018',
        email: 'kevin.clark@carecloud.com',
        firstName: 'Kevin',
        lastName: 'Clark',
        name: 'Kevin Clark',
        role: 'EMPLOYEE',
        title: 'Senior Network Engineer',
        phone: '+1-555-0118',
        hireDate: new Date('2021-06-15'),
        salary: 115000.00,
        departmentId: itDepartment.id,
        teamId: networksTeam.id,
        managerId: networksTeamLead.id,
        permissions: JSON.stringify(['VIEW_OBJECTIVES', 'UPDATE_PROGRESS', 'SUBMIT_REVIEWS']),
      },
    }),
    prisma.mboUser.create({
      data: {
        employeeId: 'EMP019',
        email: 'michelle.lewis@carecloud.com',
        firstName: 'Michelle',
        lastName: 'Lewis',
        name: 'Michelle Lewis',
        role: 'EMPLOYEE',
        title: 'Cybersecurity Specialist',
        phone: '+1-555-0119',
        hireDate: new Date('2022-02-28'),
        salary: 120000.00,
        departmentId: itDepartment.id,
        teamId: networksTeam.id,
        managerId: networksTeamLead.id,
        permissions: JSON.stringify(['VIEW_OBJECTIVES', 'UPDATE_PROGRESS', 'SUBMIT_REVIEWS']),
      },
    }),
    prisma.mboUser.create({
      data: {
        employeeId: 'EMP020',
        email: 'brandon.hall@carecloud.com',
        firstName: 'Brandon',
        lastName: 'Hall',
        name: 'Brandon Hall',
        role: 'EMPLOYEE',
        title: 'Infrastructure Engineer',
        phone: '+1-555-0120',
        hireDate: new Date('2023-01-05'),
        salary: 95000.00,
        departmentId: itDepartment.id,
        teamId: networksTeam.id,
        managerId: networksTeamLead.id,
        permissions: JSON.stringify(['VIEW_OBJECTIVES', 'UPDATE_PROGRESS', 'SUBMIT_REVIEWS']),
      },
    }),
  ]);

  // Compliance Team Members
  const complianceEmployees = await Promise.all([
    prisma.mboUser.create({
      data: {
        employeeId: 'EMP021',
        email: 'patricia.young@carecloud.com',
        firstName: 'Patricia',
        lastName: 'Young',
        name: 'Patricia Young',
        role: 'EMPLOYEE',
        title: 'Senior Compliance Officer',
        phone: '+1-555-0121',
        hireDate: new Date('2020-11-10'),
        salary: 105000.00,
        departmentId: operationsDepartment.id,
        teamId: complianceTeam.id,
        managerId: complianceTeamLead.id,
        permissions: JSON.stringify(['VIEW_OBJECTIVES', 'UPDATE_PROGRESS', 'SUBMIT_REVIEWS']),
      },
    }),
    prisma.mboUser.create({
      data: {
        employeeId: 'EMP022',
        email: 'daniel.king@carecloud.com',
        firstName: 'Daniel',
        lastName: 'King',
        name: 'Daniel King',
        role: 'EMPLOYEE',
        title: 'Risk Management Analyst',
        phone: '+1-555-0122',
        hireDate: new Date('2021-08-25'),
        salary: 92000.00,
        departmentId: operationsDepartment.id,
        teamId: complianceTeam.id,
        managerId: complianceTeamLead.id,
        permissions: JSON.stringify(['VIEW_OBJECTIVES', 'UPDATE_PROGRESS', 'SUBMIT_REVIEWS']),
      },
    }),
    prisma.mboUser.create({
      data: {
        employeeId: 'EMP023',
        email: 'amanda.wright@carecloud.com',
        firstName: 'Amanda',
        lastName: 'Wright',
        name: 'Amanda Wright',
        role: 'EMPLOYEE',
        title: 'Compliance Coordinator',
        phone: '+1-555-0123',
        hireDate: new Date('2022-05-14'),
        salary: 78000.00,
        departmentId: operationsDepartment.id,
        teamId: complianceTeam.id,
        managerId: complianceTeamLead.id,
        permissions: JSON.stringify(['VIEW_OBJECTIVES', 'UPDATE_PROGRESS', 'SUBMIT_REVIEWS']),
      },
    }),
  ]);

  // Customer Service Team Members
  const csrEmployees = await Promise.all([
    prisma.mboUser.create({
      data: {
        employeeId: 'EMP024',
        email: 'rachel.green@carecloud.com',
        firstName: 'Rachel',
        lastName: 'Green',
        name: 'Rachel Green',
        role: 'EMPLOYEE',
        title: 'Senior Customer Success Manager',
        phone: '+1-555-0124',
        hireDate: new Date('2021-03-08'),
        salary: 88000.00,
        departmentId: operationsDepartment.id,
        teamId: csrTeam.id,
        managerId: csrTeamLead.id,
        permissions: JSON.stringify(['VIEW_OBJECTIVES', 'UPDATE_PROGRESS', 'SUBMIT_REVIEWS']),
      },
    }),
    prisma.mboUser.create({
      data: {
        employeeId: 'EMP025',
        email: 'christopher.adams@carecloud.com',
        firstName: 'Christopher',
        lastName: 'Adams',
        name: 'Christopher Adams',
        role: 'EMPLOYEE',
        title: 'Customer Support Specialist',
        phone: '+1-555-0125',
        hireDate: new Date('2022-01-20'),
        salary: 75000.00,
        departmentId: operationsDepartment.id,
        teamId: csrTeam.id,
        managerId: csrTeamLead.id,
        permissions: JSON.stringify(['VIEW_OBJECTIVES', 'UPDATE_PROGRESS', 'SUBMIT_REVIEWS']),
      },
    }),
    prisma.mboUser.create({
      data: {
        employeeId: 'EMP026',
        email: 'stephanie.baker@carecloud.com',
        firstName: 'Stephanie',
        lastName: 'Baker',
        name: 'Stephanie Baker',
        role: 'EMPLOYEE',
        title: 'Customer Relations Coordinator',
        phone: '+1-555-0126',
        hireDate: new Date('2022-07-18'),
        salary: 68000.00,
        departmentId: operationsDepartment.id,
        teamId: csrTeam.id,
        managerId: csrTeamLead.id,
        permissions: JSON.stringify(['VIEW_OBJECTIVES', 'UPDATE_PROGRESS', 'SUBMIT_REVIEWS']),
      },
    }),
    prisma.mboUser.create({
      data: {
        employeeId: 'EMP027',
        email: 'matthew.turner@carecloud.com',
        firstName: 'Matthew',
        lastName: 'Turner',
        name: 'Matthew Turner',
        role: 'EMPLOYEE',
        title: 'Junior Customer Support Representative',
        phone: '+1-555-0127',
        hireDate: new Date('2023-02-15'),
        salary: 58000.00,
        departmentId: operationsDepartment.id,
        teamId: csrTeam.id,
        managerId: csrTeamLead.id,
        permissions: JSON.stringify(['VIEW_OBJECTIVES', 'UPDATE_PROGRESS', 'SUBMIT_REVIEWS']),
      },
    }),
  ]);

  // CPT Coding Team Members
  const cptEmployees = await Promise.all([
    prisma.mboUser.create({
      data: {
        employeeId: 'EMP028',
        email: 'nicole.phillips@carecloud.com',
        firstName: 'Nicole',
        lastName: 'Phillips',
        name: 'Nicole Phillips',
        role: 'EMPLOYEE',
        title: 'Senior Medical Coder',
        phone: '+1-555-0128',
        hireDate: new Date('2020-09-12'),
        salary: 95000.00,
        departmentId: operationsDepartment.id,
        teamId: cptCodingTeam.id,
        managerId: cptCodingTeamLead.id,
        permissions: JSON.stringify(['VIEW_OBJECTIVES', 'UPDATE_PROGRESS', 'SUBMIT_REVIEWS']),
      },
    }),
    prisma.mboUser.create({
      data: {
        employeeId: 'EMP029',
        email: 'jonathan.campbell@carecloud.com',
        firstName: 'Jonathan',
        lastName: 'Campbell',
        name: 'Jonathan Campbell',
        role: 'EMPLOYEE',
        title: 'Medical Coding Specialist',
        phone: '+1-555-0129',
        hireDate: new Date('2021-12-01'),
        salary: 82000.00,
        departmentId: operationsDepartment.id,
        teamId: cptCodingTeam.id,
        managerId: cptCodingTeamLead.id,
        permissions: JSON.stringify(['VIEW_OBJECTIVES', 'UPDATE_PROGRESS', 'SUBMIT_REVIEWS']),
      },
    }),
    prisma.mboUser.create({
      data: {
        employeeId: 'EMP030',
        email: 'megan.parker@carecloud.com',
        firstName: 'Megan',
        lastName: 'Parker',
        name: 'Megan Parker',
        role: 'EMPLOYEE',
        title: 'Billing Coordinator',
        phone: '+1-555-0130',
        hireDate: new Date('2022-04-10'),
        salary: 72000.00,
        departmentId: operationsDepartment.id,
        teamId: cptCodingTeam.id,
        managerId: cptCodingTeamLead.id,
        permissions: JSON.stringify(['VIEW_OBJECTIVES', 'UPDATE_PROGRESS', 'SUBMIT_REVIEWS']),
      },
    }),
  ]);

  // Update team leader IDs
  await prisma.mboTeam.update({
    where: { id: aiTeam.id },
    data: { leaderId: aiTeamLead.id },
  });
  
  await prisma.mboTeam.update({
    where: { id: dbTeam.id },
    data: { leaderId: dbTeamLead.id },
  });
  
  await prisma.mboTeam.update({
    where: { id: networksTeam.id },
    data: { leaderId: networksTeamLead.id },
  });
  
  await prisma.mboTeam.update({
    where: { id: complianceTeam.id },
    data: { leaderId: complianceTeamLead.id },
  });
  
  await prisma.mboTeam.update({
    where: { id: csrTeam.id },
    data: { leaderId: csrTeamLead.id },
  });
  
  await prisma.mboTeam.update({
    where: { id: cptCodingTeam.id },
    data: { leaderId: cptCodingTeamLead.id },
  });

  // Update department manager IDs
  await prisma.mboDepartment.update({
    where: { id: itDepartment.id },
    data: { managerId: itManager.id },
  });
  
  await prisma.mboDepartment.update({
    where: { id: operationsDepartment.id },
    data: { managerId: operationsManager.id },
  });

  console.log('🎯 Creating sample objectives...');

  // Create sample objectives for various employees
  const sampleObjectives = [
    {
      title: 'AI Model Performance Improvement',
      description: 'Improve accuracy of the patient risk prediction model by 15%',
      category: 'Technical Excellence',
      target: 15,
      current: 8,
      weight: 1.5,
      quarter: 'Q1',
      year: 2025,
      userId: aiEmployees[0].id,
      assignedById: aiTeamLead.id,
    },
    {
      title: 'Database Optimization Project',
      description: 'Reduce query response time by 30% for critical patient data retrieval',
      category: 'Performance',
      target: 30,
      current: 18,
      weight: 1.3,
      quarter: 'Q1',
      year: 2025,
      userId: dbEmployees[0].id,
      assignedById: dbTeamLead.id,
    },
    {
      title: 'Compliance Audit Success',
      description: 'Successfully pass all Q1 regulatory compliance audits with zero findings',
      category: 'Compliance',
      target: 100,
      current: 75,
      weight: 2.0,
      quarter: 'Q1',
      year: 2025,
      userId: complianceEmployees[0].id,
      assignedById: complianceTeamLead.id,
    },
    {
      title: 'Customer Satisfaction Score',
      description: 'Maintain customer satisfaction score above 4.5/5 for Q1',
      category: 'Customer Success',
      target: 4.5,
      current: 4.2,
      weight: 1.2,
      quarter: 'Q1',
      year: 2025,
      userId: csrEmployees[0].id,
      assignedById: csrTeamLead.id,
    },
    {
      title: 'Coding Accuracy Improvement',
      description: 'Achieve 98% accuracy rate in medical coding submissions',
      category: 'Quality',
      target: 98,
      current: 94,
      weight: 1.4,
      quarter: 'Q1',
      year: 2025,
      userId: cptEmployees[0].id,
      assignedById: cptCodingTeamLead.id,
    },
  ];

  for (const objective of sampleObjectives) {
    await prisma.mboObjective.create({
      data: {
        ...objective,
        dueDate: new Date('2025-03-31'),
      },
    });
  }

  console.log('📊 Creating sample reviews...');

  // Create sample reviews
  await prisma.mboReview.create({
    data: {
      quarter: 'Q4',
      year: 2024,
      overallScore: 4.2,
      comments: 'Excellent performance in AI model development. Exceeded expectations.',
      status: 'SUBMITTED',
      submittedAt: new Date('2024-12-15'),
      employeeId: aiEmployees[0].id,
    },
  });

  await prisma.mboReview.create({
    data: {
      quarter: 'Q4',
      year: 2024,
      overallScore: 3.8,
      comments: 'Good work on database optimization projects. Room for improvement in documentation.',
      status: 'APPROVED',
      submittedAt: new Date('2024-12-10'),
      approvedAt: new Date('2024-12-20'),
      employeeId: dbEmployees[0].id,
    },
  });

  console.log('💰 Creating sample bonuses...');

  // Create sample bonuses
  await prisma.mboBonus.create({
    data: {
      quarter: 'Q4',
      year: 2024,
      baseAmount: 15000,
      performanceMultiplier: 1.2,
      finalAmount: 18000,
      status: 'APPROVED',
      employeeId: aiEmployees[0].id,
    },
  });

  await prisma.mboBonus.create({
    data: {
      quarter: 'Q4',
      year: 2024,
      baseAmount: 12000,
      performanceMultiplier: 1.1,
      finalAmount: 13200,
      status: 'CALCULATED',
      employeeId: dbEmployees[0].id,
    },
  });

  console.log('✅ Creating sample approval workflows...');

  // Create sample approval requests
  await prisma.mboApproval.create({
    data: {
      type: 'REVIEW',
      entityId: (await prisma.mboReview.findFirst({ where: { employeeId: aiEmployees[0].id } }))?.id || '',
      status: 'PENDING',
      comments: 'Pending senior management approval for exceptional performance bonus.',
      approverId: hadiChaudhary.id,
    },
  });

  await prisma.mboApproval.create({
    data: {
      type: 'BONUS',
      entityId: (await prisma.mboBonus.findFirst({ where: { employeeId: dbEmployees[0].id } }))?.id || '',
      status: 'PENDING',
      comments: 'Bonus calculation pending final approval.',
      approverId: crystalWilliams.id,
    },
  });

  console.log('🎉 Database seeding completed successfully!');
  console.log('');
  console.log('📈 Summary:');
  console.log('- 2 Departments (IT & Operations)');
  console.log('- 6 Teams (3 per department)');
  console.log('- 30 Users across organizational hierarchy');
  console.log('- 2 Senior Executives');
  console.log('- 2 Department Managers');
  console.log('- 6 Team Leads');
  console.log('- 18 Team Members');
  console.log('- Sample objectives, reviews, bonuses, and approvals');
  console.log('');
  console.log('🔑 Login credentials:');
  console.log('Senior Executives:');
  console.log('- crystal.williams@carecloud.com (Operations President)');
  console.log('- hadi.chaudhary@carecloud.com (IT & AI President)');
  console.log('');
  console.log('Department Managers:');
  console.log('- sarah.johnson@carecloud.com (IT Manager)');
  console.log('- michael.davis@carecloud.com (Operations Manager)');
  console.log('');
  console.log('Team Leads:');
  console.log('- alex.chen@carecloud.com (AI Team Lead)');
  console.log('- maria.rodriguez@carecloud.com (Database Team Lead)');
  console.log('- david.kim@carecloud.com (Networks Team Lead)');
  console.log('- jennifer.white@carecloud.com (Compliance Team Lead)');
  console.log('- robert.brown@carecloud.com (Customer Service Team Lead)');
  console.log('- lisa.garcia@carecloud.com (CPT Coding Team Lead)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
