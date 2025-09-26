import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper functions
const getRandomFloat = (min: number, max: number) => Math.random() * (max - min) + min;
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomFromArray = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomBool = () => Math.random() > 0.5;

const statuses = ['DRAFT', 'ACTIVE', 'COMPLETED', 'AI_SCORED', 'REVIEWED', 'SUBMITTED_TO_HR', 'HR_APPROVED'];
const categories = ['Technical Excellence', 'Performance', 'Compliance', 'Customer Success', 'Quality', 'Innovation', 'Leadership', 'Efficiency'];

async function main() {
  console.log('🌱 Starting comprehensive database seeding...');

  // Clear existing data in dependency order
  console.log('🧹 Clearing existing data...');
  await prisma.mboNotification.deleteMany();
  await prisma.mboApproval.deleteMany();
  await prisma.mboObjectiveReview.deleteMany();
  await prisma.mboObjective.deleteMany();
  await prisma.mboBonus.deleteMany();
  await prisma.mboReview.deleteMany();
  await prisma.mboUser.deleteMany(); // Delete users first (they reference teams/departments)
  await prisma.mboTeam.deleteMany();
  await prisma.mboDepartment.deleteMany();

  console.log('📁 Creating departments...');

  // Create IT Department
  const itDepartment = await prisma.mboDepartment.create({
    data: {
      name: 'Information Technology',
      description: 'Technology and digital innovation department focusing on AI, data analytics, and infrastructure',
      budget: 2500000.00,
    },
  });

  // Create Operations Department
  const operationsDepartment = await prisma.mboDepartment.create({
    data: {
      name: 'Operations',
      description: 'Business operations, compliance, customer service, and medical coding department',
      budget: 1800000.00,
    },
  });

  // Create Sales & Marketing Department
  const salesDepartment = await prisma.mboDepartment.create({
    data: {
      name: 'Sales & Marketing',
      description: 'Revenue generation, client acquisition, and brand management',
      budget: 1200000.00,
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

  // Sales Teams
  const salesTeam = await prisma.mboTeam.create({
    data: {
      name: 'Sales',
      description: 'Direct sales and client acquisition team',
      departmentId: salesDepartment.id,
    },
  });

  const marketingTeam = await prisma.mboTeam.create({
    data: {
      name: 'Marketing',
      description: 'Digital marketing and brand management team',
      departmentId: salesDepartment.id,
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
      bonusAmount: 0, // Cumulative total of bonuses received
      allocatedBonusAmount: 5000, // Senior management allocation
      password: await bcrypt.hash('password123', 10),
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
      bonusAmount: 0, // Cumulative total of bonuses received
      allocatedBonusAmount: 5000, // Senior management allocation
      password: await bcrypt.hash('password123', 10),
      departmentId: itDepartment.id,
      permissions: JSON.stringify(['ALL', 'OVERRIDE_SCORES', 'FINAL_APPROVAL']),
    },
  });

  const salesVP = await prisma.mboUser.create({
    data: {
      employeeId: 'EMP003',
      email: 'jessica.martinez@carecloud.com',
      firstName: 'Jessica',
      lastName: 'Martinez',
      name: 'Jessica Martinez',
      role: 'SENIOR_MANAGEMENT',
      title: 'VP - Sales & Marketing',
      phone: '+1-555-0103',
      hireDate: new Date('2020-06-01'),
      salary: 280000.00,
      bonusAmount: 0, // Cumulative total of bonuses received
      allocatedBonusAmount: 5000, // Senior management allocation
      password: await bcrypt.hash('password123', 10),
      departmentId: salesDepartment.id,
      permissions: JSON.stringify(['ALL', 'OVERRIDE_SCORES', 'FINAL_APPROVAL']),
    },
  });

  console.log('🎯 Creating department managers...');

  // Department Managers
  const itManager = await prisma.mboUser.create({
    data: {
      employeeId: 'EMP004',
      email: 'sarah.johnson@carecloud.com',
      firstName: 'Sarah',
      lastName: 'Johnson',
      name: 'Sarah Johnson',
      role: 'MANAGER',
      title: 'IT Department Manager',
      phone: '+1-555-0104',
      hireDate: new Date('2021-05-10'),
      salary: 180000.00,
      bonusAmount: 0, // Cumulative total of bonuses received
      allocatedBonusAmount: 3000, // Department manager allocation
      password: await bcrypt.hash('password123', 10),
      departmentId: itDepartment.id,
      managerId: hadiChaudhary.id,
      permissions: JSON.stringify(['MANAGE_DEPARTMENT', 'APPROVE_OBJECTIVES', 'MANAGE_REVIEWS']),
    },
  });

  const operationsManager = await prisma.mboUser.create({
    data: {
      employeeId: 'EMP005',
      email: 'michael.davis@carecloud.com',
      firstName: 'Michael',
      lastName: 'Davis',
      name: 'Michael Davis',
      role: 'MANAGER',
      title: 'Operations Department Manager',
      phone: '+1-555-0105',
      hireDate: new Date('2020-08-20'),
      salary: 175000.00,
      bonusAmount: 0, // Cumulative total of bonuses received
      allocatedBonusAmount: 3000, // Department manager allocation
      password: await bcrypt.hash('password123', 10),
      departmentId: operationsDepartment.id,
      managerId: crystalWilliams.id,
      permissions: JSON.stringify(['MANAGE_DEPARTMENT', 'APPROVE_OBJECTIVES', 'MANAGE_REVIEWS']),
    },
  });

  const salesManager = await prisma.mboUser.create({
    data: {
      employeeId: 'EMP006',
      email: 'robert.taylor@carecloud.com',
      firstName: 'Robert',
      lastName: 'Taylor',
      name: 'Robert Taylor',
      role: 'MANAGER',
      title: 'Sales & Marketing Manager',
      phone: '+1-555-0106',
      hireDate: new Date('2021-02-15'),
      salary: 165000.00,
      bonusAmount: 0, // Cumulative total of bonuses received
      allocatedBonusAmount: 3000, // Department manager allocation
      password: await bcrypt.hash('password123', 10),
      departmentId: salesDepartment.id,
      managerId: salesVP.id,
      permissions: JSON.stringify(['MANAGE_DEPARTMENT', 'APPROVE_OBJECTIVES', 'MANAGE_REVIEWS']),
    },
  });

  console.log('👨‍💼 Creating team leads...');

  // IT Team Leads
  const aiTeamLead = await prisma.mboUser.create({
    data: {
      employeeId: 'EMP007',
      email: 'alex.chen@carecloud.com',
      firstName: 'Alex',
      lastName: 'Chen',
      name: 'Alex Chen',
      role: 'MANAGER',
      title: 'AI Team Lead',
      phone: '+1-555-0107',
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

  const dbTeamLead = await prisma.mboUser.create({
    data: {
      employeeId: 'EMP008',
      email: 'maria.rodriguez@carecloud.com',
      firstName: 'Maria',
      lastName: 'Rodriguez',
      name: 'Maria Rodriguez',
      role: 'MANAGER',
      title: 'Database Team Lead',
      phone: '+1-555-0108',
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

  const networksTeamLead = await prisma.mboUser.create({
    data: {
      employeeId: 'EMP009',
      email: 'david.kim@carecloud.com',
      firstName: 'David',
      lastName: 'Kim',
      name: 'David Kim',
      role: 'MANAGER',
      title: 'Networks Team Lead',
      phone: '+1-555-0109',
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

  // Operations Team Leads
  const complianceTeamLead = await prisma.mboUser.create({
    data: {
      employeeId: 'EMP010',
      email: 'jennifer.white@carecloud.com',
      firstName: 'Jennifer',
      lastName: 'White',
      name: 'Jennifer White',
      role: 'MANAGER',
      title: 'Compliance Team Lead',
      phone: '+1-555-0110',
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

  const csrTeamLead = await prisma.mboUser.create({
    data: {
      employeeId: 'EMP011',
      email: 'robert.brown@carecloud.com',
      firstName: 'Robert',
      lastName: 'Brown',
      name: 'Robert Brown',
      role: 'MANAGER',
      title: 'Customer Service Team Lead',
      phone: '+1-555-0111',
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

  const cptCodingTeamLead = await prisma.mboUser.create({
    data: {
      employeeId: 'EMP012',
      email: 'lisa.garcia@carecloud.com',
      firstName: 'Lisa',
      lastName: 'Garcia',
      name: 'Lisa Garcia',
      role: 'MANAGER',
      title: 'CPT Coding Team Lead',
      phone: '+1-555-0112',
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

  // Sales Team Leads
  const salesTeamLead = await prisma.mboUser.create({
    data: {
      employeeId: 'EMP013',
      email: 'amanda.clark@carecloud.com',
      firstName: 'Amanda',
      lastName: 'Clark',
      name: 'Amanda Clark',
      role: 'MANAGER',
      title: 'Sales Team Lead',
      phone: '+1-555-0113',
      hireDate: new Date('2021-08-22'),
      salary: 130000.00,
      bonusAmount: 16000.00,
      password: await bcrypt.hash('password123', 10),
      departmentId: salesDepartment.id,
      teamId: salesTeam.id,
      managerId: salesManager.id,
      permissions: JSON.stringify(['MANAGE_TEAM', 'ASSIGN_OBJECTIVES', 'REVIEW_PERFORMANCE']),
    },
  });

  const marketingTeamLead = await prisma.mboUser.create({
    data: {
      employeeId: 'EMP014',
      email: 'kevin.wright@carecloud.com',
      firstName: 'Kevin',
      lastName: 'Wright',
      name: 'Kevin Wright',
      role: 'MANAGER',
      title: 'Marketing Team Lead',
      phone: '+1-555-0114',
      hireDate: new Date('2021-10-05'),
      salary: 125000.00,
      bonusAmount: 15500.00,
      password: await bcrypt.hash('password123', 10),
      departmentId: salesDepartment.id,
      teamId: marketingTeam.id,
      managerId: salesManager.id,
      permissions: JSON.stringify(['MANAGE_TEAM', 'ASSIGN_OBJECTIVES', 'REVIEW_PERFORMANCE']),
    },
  });

  console.log('👨‍💻 Creating team members...');

  // AI Team Members
  const aiEmployees = [];
  const aiMemberData = [
    { name: 'John Smith', email: 'john.smith@carecloud.com', title: 'Senior AI Engineer', salary: 125000, bonus: 12000 },
    { name: 'Emily Taylor', email: 'emily.taylor@carecloud.com', title: 'ML Data Scientist', salary: 118000, bonus: 11500 },
    { name: 'Carlos Martinez', email: 'carlos.martinez@carecloud.com', title: 'AI Research Engineer', salary: 115000, bonus: 11000 },
    { name: 'Priya Patel', email: 'priya.patel@carecloud.com', title: 'AI Developer', salary: 105000, bonus: 10000 },
  ];

  for (let i = 0; i < aiMemberData.length; i++) {
    const member = aiMemberData[i];
    const firstName = member.name.split(' ')[0];
    const lastName = member.name.split(' ')[1];
    const employee = await prisma.mboUser.create({
      data: {
        employeeId: `EMP${String(15 + i).padStart(3, '0')}`,
        email: member.email,
        firstName,
        lastName,
        name: member.name,
        role: 'EMPLOYEE',
        title: member.title,
        phone: `+1-555-0${115 + i}`,
        hireDate: new Date(2022 + i, getRandomInt(0, 11), getRandomInt(1, 28)),
        salary: member.salary,
        bonusAmount: member.bonus,
        password: await bcrypt.hash('password123', 10),
        departmentId: itDepartment.id,
        teamId: aiTeam.id,
        managerId: aiTeamLead.id,
        permissions: JSON.stringify(['VIEW_OBJECTIVES', 'UPDATE_PROGRESS', 'SUBMIT_REVIEWS']),
      },
    });
    aiEmployees.push(employee);
  }

  // Database Team Members
  const dbEmployees = [];
  const dbMemberData = [
    { name: 'Anna Wilson', email: 'anna.wilson@carecloud.com', title: 'Senior Database Administrator', salary: 110000, bonus: 10500 },
    { name: 'James Anderson', email: 'james.anderson@carecloud.com', title: 'Data Analytics Engineer', salary: 105000, bonus: 10000 },
    { name: 'Sophie Lee', email: 'sophie.lee@carecloud.com', title: 'Database Developer', salary: 98000, bonus: 9500 },
    { name: 'Ryan Thomas', email: 'ryan.thomas@carecloud.com', title: 'Junior Data Analyst', salary: 85000, bonus: 8000 },
  ];

  for (let i = 0; i < dbMemberData.length; i++) {
    const member = dbMemberData[i];
    const firstName = member.name.split(' ')[0];
    const lastName = member.name.split(' ')[1];
    const employee = await prisma.mboUser.create({
      data: {
        employeeId: `EMP${String(19 + i).padStart(3, '0')}`,
        email: member.email,
        firstName,
        lastName,
        name: member.name,
        role: 'EMPLOYEE',
        title: member.title,
        phone: `+1-555-0${119 + i}`,
        hireDate: new Date(2021 + i, getRandomInt(0, 11), getRandomInt(1, 28)),
        salary: member.salary,
        bonusAmount: member.bonus,
        password: await bcrypt.hash('password123', 10),
        departmentId: itDepartment.id,
        teamId: dbTeam.id,
        managerId: dbTeamLead.id,
        permissions: JSON.stringify(['VIEW_OBJECTIVES', 'UPDATE_PROGRESS', 'SUBMIT_REVIEWS']),
      },
    });
    dbEmployees.push(employee);
  }

  // Networks Team Members
  const networkEmployees = [];
  const networkMemberData = [
    { name: 'Kevin Clark', email: 'kevin.clark@carecloud.com', title: 'Senior Network Engineer', salary: 115000, bonus: 11000 },
    { name: 'Michelle Lewis', email: 'michelle.lewis@carecloud.com', title: 'Cybersecurity Specialist', salary: 120000, bonus: 11500 },
    { name: 'Brandon Hall', email: 'brandon.hall@carecloud.com', title: 'Infrastructure Engineer', salary: 95000, bonus: 9000 },
  ];

  for (let i = 0; i < networkMemberData.length; i++) {
    const member = networkMemberData[i];
    const firstName = member.name.split(' ')[0];
    const lastName = member.name.split(' ')[1];
    const employee = await prisma.mboUser.create({
      data: {
        employeeId: `EMP${String(23 + i).padStart(3, '0')}`,
        email: member.email,
        firstName,
        lastName,
        name: member.name,
        role: 'EMPLOYEE',
        title: member.title,
        phone: `+1-555-0${123 + i}`,
        hireDate: new Date(2021 + i, getRandomInt(0, 11), getRandomInt(1, 28)),
        salary: member.salary,
        bonusAmount: member.bonus,
        password: await bcrypt.hash('password123', 10),
        departmentId: itDepartment.id,
        teamId: networksTeam.id,
        managerId: networksTeamLead.id,
        permissions: JSON.stringify(['VIEW_OBJECTIVES', 'UPDATE_PROGRESS', 'SUBMIT_REVIEWS']),
      },
    });
    networkEmployees.push(employee);
  }

  // Compliance Team Members
  const complianceEmployees = [];
  const complianceMemberData = [
    { name: 'Patricia Young', email: 'patricia.young@carecloud.com', title: 'Senior Compliance Officer', salary: 105000, bonus: 10000 },
    { name: 'Daniel King', email: 'daniel.king@carecloud.com', title: 'Risk Management Analyst', salary: 92000, bonus: 8500 },
    { name: 'Amanda Wright', email: 'amanda.wright@carecloud.com', title: 'Compliance Coordinator', salary: 78000, bonus: 7500 },
  ];

  for (let i = 0; i < complianceMemberData.length; i++) {
    const member = complianceMemberData[i];
    const firstName = member.name.split(' ')[0];
    const lastName = member.name.split(' ')[1];
    const employee = await prisma.mboUser.create({
      data: {
        employeeId: `EMP${String(26 + i).padStart(3, '0')}`,
        email: member.email,
        firstName,
        lastName,
        name: member.name,
        role: 'EMPLOYEE',
        title: member.title,
        phone: `+1-555-0${126 + i}`,
        hireDate: new Date(2020 + i, getRandomInt(0, 11), getRandomInt(1, 28)),
        salary: member.salary,
        bonusAmount: member.bonus,
        password: await bcrypt.hash('password123', 10),
        departmentId: operationsDepartment.id,
        teamId: complianceTeam.id,
        managerId: complianceTeamLead.id,
        permissions: JSON.stringify(['VIEW_OBJECTIVES', 'UPDATE_PROGRESS', 'SUBMIT_REVIEWS']),
      },
    });
    complianceEmployees.push(employee);
  }

  // Update team leader IDs
  console.log('🔄 Updating team leadership relationships...');
  await prisma.mboTeam.update({ where: { id: aiTeam.id }, data: { leaderId: aiTeamLead.id } });
  await prisma.mboTeam.update({ where: { id: dbTeam.id }, data: { leaderId: dbTeamLead.id } });
  await prisma.mboTeam.update({ where: { id: networksTeam.id }, data: { leaderId: networksTeamLead.id } });
  await prisma.mboTeam.update({ where: { id: complianceTeam.id }, data: { leaderId: complianceTeamLead.id } });
  await prisma.mboTeam.update({ where: { id: csrTeam.id }, data: { leaderId: csrTeamLead.id } });
  await prisma.mboTeam.update({ where: { id: cptCodingTeam.id }, data: { leaderId: cptCodingTeamLead.id } });
  await prisma.mboTeam.update({ where: { id: salesTeam.id }, data: { leaderId: salesTeamLead.id } });
  await prisma.mboTeam.update({ where: { id: marketingTeam.id }, data: { leaderId: marketingTeamLead.id } });

  // Update department manager IDs
  await prisma.mboDepartment.update({ where: { id: itDepartment.id }, data: { managerId: itManager.id } });
  await prisma.mboDepartment.update({ where: { id: operationsDepartment.id }, data: { managerId: operationsManager.id } });
  await prisma.mboDepartment.update({ where: { id: salesDepartment.id }, data: { managerId: salesManager.id } });

  console.log('🎯 Creating sample objectives...');

  // Get all employees for objective assignment
  const allEmployees = [...aiEmployees, ...dbEmployees, ...networkEmployees, ...complianceEmployees];

  // Create objectives for each employee
  const objectiveTemplates = [
    { title: 'Performance Excellence', category: 'Performance', weight: 1.5 },
    { title: 'Quality Improvement', category: 'Quality', weight: 1.3 },
    { title: 'Innovation Initiative', category: 'Innovation', weight: 1.2 },
    { title: 'Compliance Standards', category: 'Compliance', weight: 2.0 },
    { title: 'Technical Excellence', category: 'Technical Excellence', weight: 1.6 },
    { title: 'Efficiency Optimization', category: 'Efficiency', weight: 1.1 },
  ];

  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  const years = [2024, 2025];

  for (const employee of allEmployees.slice(0, 10)) { // Create objectives for first 10 employees
    const numObjectives = getRandomInt(2, 3);
    
    for (let i = 0; i < numObjectives; i++) {
      const template = getRandomFromArray(objectiveTemplates);
      const quarter = getRandomFromArray(quarters);
      const year = getRandomFromArray(years);
      const target = getRandomFloat(50, 100);
      const current = getRandomFloat(0, target * 0.8);
      const status = getRandomFromArray(statuses);
      
      const now = new Date();
      const submittedAt = getRandomBool() ? new Date(now.getTime() - getRandomInt(1, 30) * 24 * 60 * 60 * 1000) : null;
      const completedAt = status === 'COMPLETED' ? new Date(now.getTime() - getRandomInt(1, 10) * 24 * 60 * 60 * 1000) : null;
      
      await prisma.mboObjective.create({
        data: {
          title: `${template.title} - ${employee.firstName}`,
          description: `Achieve ${template.title.toLowerCase()} goals for ${quarter} ${year}. Focus on improving key performance indicators and delivering measurable results.`,
          category: template.category,
          target,
          current,
          weight: template.weight,
          status,
          dueDate: new Date(year, quarter === 'Q1' ? 2 : quarter === 'Q2' ? 5 : quarter === 'Q3' ? 8 : 11, 30),
          quarter,
          year,
          userId: employee.id,
          assignedById: employee.managerId || undefined,
          submittedAt,
          completedAt,
          submittedToManagerAt: submittedAt,
          managerReviewedAt: status === 'REVIEWED' || status === 'SUBMITTED_TO_HR' || status === 'HR_APPROVED' ? new Date(submittedAt ? submittedAt.getTime() + 2 * 24 * 60 * 60 * 1000 : now.getTime()) : null,
          submittedToHrAt: status === 'SUBMITTED_TO_HR' || status === 'HR_APPROVED' ? new Date(submittedAt ? submittedAt.getTime() + 5 * 24 * 60 * 60 * 1000 : now.getTime()) : null,
          hrApprovedAt: status === 'HR_APPROVED' ? new Date(submittedAt ? submittedAt.getTime() + 7 * 24 * 60 * 60 * 1000 : now.getTime()) : null,
          employeeRemarks: getRandomBool() ? `Progress update from ${employee.firstName}: Working diligently on this objective.` : null,
          managerFeedback: getRandomBool() ? `Good progress shown. Keep up the excellent work.` : null,
          hrNotes: status === 'HR_APPROVED' ? `Approved by HR. Meets all compliance requirements.` : null,
          aiScoreMetadata: status === 'AI_SCORED' ? JSON.stringify({ confidence: getRandomFloat(0.7, 0.95), factors: ['performance', 'quality', 'timeliness'] }) : null,
          digitalSignature: getRandomBool() ? `${employee.name}_signature_${Date.now()}` : null,
        },
      });
    }
  }

  console.log('📊 Creating reviews and bonuses...');

  // Create reviews for some employees
  for (const employee of allEmployees.slice(0, 8)) {
    const overallScore = getRandomFloat(3.0, 5.0);
    const status = getRandomFromArray(['DRAFT', 'SUBMITTED', 'APPROVED']);
    const submittedAt = new Date(2024, getRandomInt(0, 11), getRandomInt(1, 28));
    
    await prisma.mboReview.create({
      data: {
        quarter: 'Q4',
        year: 2024,
        overallScore,
        comments: `Performance review for ${employee.firstName}. Overall performance has been ${overallScore >= 4.5 ? 'excellent' : overallScore >= 4.0 ? 'very good' : overallScore >= 3.5 ? 'good' : 'satisfactory'}.`,
        status,
        submittedAt,
        approvedAt: status === 'APPROVED' ? new Date(submittedAt.getTime() + 5 * 24 * 60 * 60 * 1000) : null,
        employeeId: employee.id,
      },
    });

    // Create corresponding bonus
    const baseAmount = 0 || getRandomFloat(5000, 20000);
    const performanceMultiplier = overallScore / 4.0;
    const finalAmount = baseAmount * performanceMultiplier;
    
    await prisma.mboBonus.create({
      data: {
        quarter: 'Q4',
        year: 2024,
        baseAmount,
        performanceMultiplier,
        finalAmount,
        status: getRandomFromArray(['CALCULATED', 'APPROVED', 'PAID']),
        calculatedAt: new Date(2024, 11, getRandomInt(1, 15)),
        paidAt: getRandomBool() ? new Date(2024, 11, getRandomInt(16, 31)) : null,
        employeeId: employee.id,
      },
    });
  }

  console.log('✅ Creating approvals and notifications...');

  // Create some approval requests
  const reviews = await prisma.mboReview.findMany({ take: 3 });
  const bonuses = await prisma.mboBonus.findMany({ take: 3 });

  for (const review of reviews) {
    await prisma.mboApproval.create({
      data: {
        type: 'REVIEW',
        entityId: review.id,
        status: getRandomFromArray(['PENDING', 'APPROVED', 'REJECTED']),
        comments: 'Review approval request submitted for processing.',
        approverId: hadiChaudhary.id,
        approvedAt: getRandomBool() ? new Date() : null,
      },
    });
  }

  for (const bonus of bonuses) {
    await prisma.mboApproval.create({
      data: {
        type: 'BONUS',
        entityId: bonus.id,
        status: getRandomFromArray(['PENDING', 'APPROVED', 'REJECTED']),
        comments: 'Bonus calculation approval required.',
        approverId: crystalWilliams.id,
        approvedAt: getRandomBool() ? new Date() : null,
      },
    });
  }

  // Create notifications for users
  const notificationTypes = ['info', 'warning', 'success', 'error'];
  const notificationTitles = [
    'Objective Due Soon', 
    'Review Submitted', 
    'Bonus Approved', 
    'Action Required',
    'Performance Update',
    'Team Meeting Reminder',
    'Compliance Alert',
    'Training Available'
  ];

  for (const employee of allEmployees.slice(0, 12)) {
    const numNotifications = getRandomInt(1, 3);
    
    for (let i = 0; i < numNotifications; i++) {
      await prisma.mboNotification.create({
        data: {
          type: getRandomFromArray(notificationTypes),
          title: getRandomFromArray(notificationTitles),
          message: `Important notification for ${employee.firstName}. Please review and take appropriate action.`,
          read: getRandomBool(),
          actionRequired: getRandomBool(),
          entityType: getRandomFromArray(['objective', 'review', 'bonus']),
          userId: employee.id,
        },
      });
    }
  }

  console.log('🎉 Database seeding completed successfully!');
  console.log('');
  console.log('📈 Summary:');
  console.log('- 3 Departments (IT, Operations, Sales & Marketing)');
  console.log('- 8 Teams with dedicated leaders');
  console.log('- 22 Users across organizational hierarchy');
  console.log('- 3 Senior Executives');
  console.log('- 3 Department Managers');
  console.log('- 5 Team Leads');
  console.log('- 11 Team Members');
  console.log('- Sample objectives with various statuses');
  console.log('- Performance reviews and bonus calculations');
  console.log('- Approval workflows and notifications');
  console.log('');
  console.log('🔑 Login credentials (password: password123):');
  console.log('Senior Executives:');
  console.log('- crystal.williams@carecloud.com (Operations President)');
  console.log('- hadi.chaudhary@carecloud.com (IT & AI President)');
  console.log('- jessica.martinez@carecloud.com (Sales & Marketing VP)');
  console.log('');
  console.log('Department Managers:');
  console.log('- sarah.johnson@carecloud.com (IT Manager)');
  console.log('- michael.davis@carecloud.com (Operations Manager)');
  console.log('- robert.taylor@carecloud.com (Sales & Marketing Manager)');
  console.log('');
  console.log('Team Leads:');
  console.log('- alex.chen@carecloud.com (AI Team Lead)');
  console.log('- maria.rodriguez@carecloud.com (Database Team Lead)');
  console.log('- david.kim@carecloud.com (Networks Team Lead)');
  console.log('- jennifer.white@carecloud.com (Compliance Team Lead)');
  console.log('- robert.brown@carecloud.com (Customer Service Team Lead)');
  console.log('');
  console.log('Sample Employees:');
  console.log('- john.smith@carecloud.com (AI Engineer)');
  console.log('- carlos.martinez@carecloud.com (AI Research Engineer)');
  console.log('- anna.wilson@carecloud.com (Database Administrator)');
  console.log('- patricia.young@carecloud.com (Compliance Officer)');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
