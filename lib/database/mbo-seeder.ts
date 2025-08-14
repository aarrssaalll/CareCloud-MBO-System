import { getDbConnection, initializeMboTables } from './mbo-connection';
import sql from 'mssql';

export interface MboUser {
  id: number;
  employeeId: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  role: 'EMPLOYEE' | 'MANAGER' | 'HR' | 'SENIOR_MANAGEMENT';
  title: string;
  phone?: string;
  hireDate?: Date;
  salary?: number;
  status: string;
  departmentId?: number;
  teamId?: number;
  managerId?: number;
}

export interface MboDepartment {
  id: number;
  name: string;
  description?: string;
  budget?: number;
  managerId?: number;
}

export interface MboTeam {
  id: number;
  name: string;
  description?: string;
  leaderId?: number;
  departmentId: number;
}

export interface MboObjective {
  id: number;
  title: string;
  description: string;
  category: string;
  target: number;
  current: number;
  weight: number;
  status: string;
  dueDate: Date;
  quarter: string;
  year: number;
  userId: number;
  assignedById?: string;
}

export class MboDataSeeder {
  private pool: sql.ConnectionPool | null = null;

  async initialize() {
    this.pool = await getDbConnection();
    await initializeMboTables();
  }

  async seedOrganizationalData() {
    if (!this.pool) await this.initialize();

    console.log('🌱 Starting MBO organizational data seeding...');

    try {
      // Clear existing MBO data
      await this.clearMboData();

      // Create the organizational structure
      const departments = await this.createDepartments();
      const teams = await this.createTeams(departments);
      const users = await this.createUsers(departments, teams);
      await this.assignManagerRelationships(users);
      await this.createObjectives(users);

      console.log('✅ MBO organizational data seeding completed successfully!');
      return {
        departments: departments.length,
        teams: teams.length,
        users: users.length,
      };
    } catch (error) {
      console.error('❌ Error seeding MBO data:', error);
      throw error;
    }
  }

  private async clearMboData() {
    console.log('🧹 Clearing existing MBO data...');
    
    const clearQueries = [
      'DELETE FROM mbo_objective_reviews',
      'DELETE FROM mbo_objectives',
      'DELETE FROM mbo_reviews',
      'DELETE FROM mbo_bonuses',
      'DELETE FROM mbo_approvals',
      'DELETE FROM mbo_users',
      'DELETE FROM mbo_teams',
      'DELETE FROM mbo_departments',
    ];

    for (const query of clearQueries) {
      try {
        await this.pool!.request().query(query);
      } catch (error) {
        // Table might not exist, continue
        console.log(`Note: ${query} - table might not exist yet`);
      }
    }
  }

  private async createDepartments(): Promise<MboDepartment[]> {
    console.log('🏢 Creating departments...');

    const departments: MboDepartment[] = [
      {
        id: this.generateId(),
        name: 'Information Technology',
        description: 'Responsible for technology infrastructure, software development, and digital innovation',
        budget: 2500000,
      },
      {
        id: this.generateId(),
        name: 'Operations',
        description: 'Manages day-to-day business operations, compliance, and customer service',
        budget: 1800000,
      },
    ];

    for (const dept of departments) {
      await this.pool!.request()
        .input('id', sql.NVarChar, dept.id)
        .input('name', sql.NVarChar, dept.name)
        .input('description', sql.NVarChar, dept.description)
        .input('budget', sql.Float, dept.budget)
        .query(`
          INSERT INTO mbo_departments (id, name, description, budget, createdAt, updatedAt)
          VALUES (@id, @name, @description, @budget, GETDATE(), GETDATE())
        `);
    }

    return departments;
  }

  private async createTeams(departments: MboDepartment[]): Promise<MboTeam[]> {
    console.log('👥 Creating teams...');

    const itDept = departments.find(d => d.name === 'Information Technology')!;
    const opsDept = departments.find(d => d.name === 'Operations')!;

    const teams: MboTeam[] = [
      // IT Department Teams
      {
        id: this.generateId(),
        name: 'AI & Machine Learning',
        description: 'Develops AI solutions, machine learning models, and automation systems',
        departmentId: itDept.id,
      },
      {
        id: this.generateId(),
        name: 'Database & Analytics',
        description: 'Manages databases, data warehouses, and business intelligence solutions',
        departmentId: itDept.id,
      },
      {
        id: this.generateId(),
        name: 'Networks & Infrastructure',
        description: 'Maintains network infrastructure, cybersecurity, and system administration',
        departmentId: itDept.id,
      },

      // Operations Department Teams
      {
        id: this.generateId(),
        name: 'Compliance & Risk',
        description: 'Ensures regulatory compliance, risk management, and quality assurance',
        departmentId: opsDept.id,
      },
      {
        id: this.generateId(),
        name: 'Customer Service & Relations',
        description: 'Handles customer support, client relations, and service delivery',
        departmentId: opsDept.id,
      },
      {
        id: this.generateId(),
        name: 'CPT Coding & Billing',
        description: 'Manages medical coding, billing processes, and revenue cycle management',
        departmentId: opsDept.id,
      },
    ];

    for (const team of teams) {
      await this.pool!.request()
        .input('id', sql.NVarChar, team.id)
        .input('name', sql.NVarChar, team.name)
        .input('description', sql.NVarChar, team.description)
        .input('departmentId', sql.NVarChar, team.departmentId)
        .query(`
          INSERT INTO mbo_teams (id, name, description, departmentId, createdAt, updatedAt)
          VALUES (@id, @name, @description, @departmentId, GETDATE(), GETDATE())
        `);
    }

    return teams;
  }

  private async createUsers(departments: MboDepartment[], teams: MboTeam[]): Promise<MboUser[]> {
    console.log('👤 Creating users...');

    const itDept = departments.find(d => d.name === 'Information Technology')!;
    const opsDept = departments.find(d => d.name === 'Operations')!;

    const aiTeam = teams.find(t => t.name === 'AI & Machine Learning')!;
    const dbTeam = teams.find(t => t.name === 'Database & Analytics')!;
    const networkTeam = teams.find(t => t.name === 'Networks & Infrastructure')!;
    const complianceTeam = teams.find(t => t.name === 'Compliance & Risk')!;
    const csrTeam = teams.find(t => t.name === 'Customer Service & Relations')!;
    const cptTeam = teams.find(t => t.name === 'CPT Coding & Billing')!;

    const users: MboUser[] = [
      // Senior Executives
      {
        id: this.generateId(),
        employeeId: 'EXE001',
        email: 'crystal.williams@carecloud.com',
        firstName: 'Crystal',
        lastName: 'Williams',
        name: 'Crystal Williams',
        role: 'SENIOR_MANAGEMENT',
        title: 'President - Operations',
        phone: '+1-555-0101',
        hireDate: new Date('2018-01-15'),
        salary: 280000,
        status: 'ACTIVE',
        departmentId: opsDept.id,
      },
      {
        id: this.generateId(),
        employeeId: 'EXE002',
        email: 'hadi.chaudhary@carecloud.com',
        firstName: 'Hadi',
        lastName: 'Chaudhary',
        name: 'Hadi Chaudhary',
        role: 'SENIOR_MANAGEMENT',
        title: 'President - Technology & AI',
        phone: '+1-555-0102',
        hireDate: new Date('2017-03-10'),
        salary: 290000,
        status: 'ACTIVE',
        departmentId: itDept.id,
      },

      // Department Managers
      {
        id: this.generateId(),
        employeeId: 'MGR001',
        email: 'sarah.johnson@carecloud.com',
        firstName: 'Sarah',
        lastName: 'Johnson',
        name: 'Sarah Johnson',
        role: 'MANAGER',
        title: 'IT Department Manager',
        phone: '+1-555-0201',
        hireDate: new Date('2019-05-20'),
        salary: 140000,
        status: 'ACTIVE',
        departmentId: itDept.id,
      },
      {
        id: this.generateId(),
        employeeId: 'MGR002',
        email: 'michael.rodriguez@carecloud.com',
        firstName: 'Michael',
        lastName: 'Rodriguez',
        name: 'Michael Rodriguez',
        role: 'MANAGER',
        title: 'Operations Department Manager',
        phone: '+1-555-0202',
        hireDate: new Date('2019-08-12'),
        salary: 135000,
        status: 'ACTIVE',
        departmentId: opsDept.id,
      },

      // IT Team Leaders
      {
        id: this.generateId(),
        employeeId: 'TL001',
        email: 'alex.chen@carecloud.com',
        firstName: 'Alex',
        lastName: 'Chen',
        name: 'Alex Chen',
        role: 'MANAGER',
        title: 'AI & ML Team Lead',
        phone: '+1-555-0301',
        hireDate: new Date('2020-02-14'),
        salary: 115000,
        status: 'ACTIVE',
        departmentId: itDept.id,
        teamId: aiTeam.id,
      },
      {
        id: this.generateId(),
        employeeId: 'TL002',
        email: 'priya.patel@carecloud.com',
        firstName: 'Priya',
        lastName: 'Patel',
        name: 'Priya Patel',
        role: 'MANAGER',
        title: 'Database & Analytics Team Lead',
        phone: '+1-555-0302',
        hireDate: new Date('2020-04-18'),
        salary: 110000,
        status: 'ACTIVE',
        departmentId: itDept.id,
        teamId: dbTeam.id,
      },
      {
        id: this.generateId(),
        employeeId: 'TL003',
        email: 'james.wilson@carecloud.com',
        firstName: 'James',
        lastName: 'Wilson',
        name: 'James Wilson',
        role: 'MANAGER',
        title: 'Networks & Infrastructure Team Lead',
        phone: '+1-555-0303',
        hireDate: new Date('2020-06-22'),
        salary: 108000,
        status: 'ACTIVE',
        departmentId: itDept.id,
        teamId: networkTeam.id,
      },

      // Operations Team Leaders
      {
        id: this.generateId(),
        employeeId: 'TL004',
        email: 'lisa.martinez@carecloud.com',
        firstName: 'Lisa',
        lastName: 'Martinez',
        name: 'Lisa Martinez',
        role: 'MANAGER',
        title: 'Compliance & Risk Team Lead',
        phone: '+1-555-0304',
        hireDate: new Date('2020-09-15'),
        salary: 105000,
        status: 'ACTIVE',
        departmentId: opsDept.id,
        teamId: complianceTeam.id,
      },
      {
        id: this.generateId(),
        employeeId: 'TL005',
        email: 'david.brown@carecloud.com',
        firstName: 'David',
        lastName: 'Brown',
        name: 'David Brown',
        role: 'MANAGER',
        title: 'Customer Service Team Lead',
        phone: '+1-555-0305',
        hireDate: new Date('2020-11-08'),
        salary: 102000,
        status: 'ACTIVE',
        departmentId: opsDept.id,
        teamId: csrTeam.id,
      },
      {
        id: this.generateId(),
        employeeId: 'TL006',
        email: 'amanda.davis@carecloud.com',
        firstName: 'Amanda',
        lastName: 'Davis',
        name: 'Amanda Davis',
        role: 'MANAGER',
        title: 'CPT Coding Team Lead',
        phone: '+1-555-0306',
        hireDate: new Date('2021-01-25'),
        salary: 100000,
        status: 'ACTIVE',
        departmentId: opsDept.id,
        teamId: cptTeam.id,
      },

      // IT Employees
      // AI Team
      {
        id: this.generateId(),
        employeeId: 'EMP001',
        email: 'kevin.zhang@carecloud.com',
        firstName: 'Kevin',
        lastName: 'Zhang',
        name: 'Kevin Zhang',
        role: 'EMPLOYEE',
        title: 'Senior AI Engineer',
        phone: '+1-555-0401',
        hireDate: new Date('2021-03-15'),
        salary: 95000,
        status: 'ACTIVE',
        departmentId: itDept.id,
        teamId: aiTeam.id,
      },
      {
        id: this.generateId(),
        employeeId: 'EMP002',
        email: 'maria.gonzalez@carecloud.com',
        firstName: 'Maria',
        lastName: 'Gonzalez',
        name: 'Maria Gonzalez',
        role: 'EMPLOYEE',
        title: 'ML Research Scientist',
        phone: '+1-555-0402',
        hireDate: new Date('2021-05-10'),
        salary: 92000,
        status: 'ACTIVE',
        departmentId: itDept.id,
        teamId: aiTeam.id,
      },
      {
        id: this.generateId(),
        employeeId: 'EMP003',
        email: 'ryan.oconnor@carecloud.com',
        firstName: 'Ryan',
        lastName: "O'Connor",
        name: "Ryan O'Connor",
        role: 'EMPLOYEE',
        title: 'AI Solutions Developer',
        phone: '+1-555-0403',
        hireDate: new Date('2021-07-20'),
        salary: 88000,
        status: 'ACTIVE',
        departmentId: itDept.id,
        teamId: aiTeam.id,
      },

      // Database Team
      {
        id: this.generateId(),
        employeeId: 'EMP004',
        email: 'jennifer.lee@carecloud.com',
        firstName: 'Jennifer',
        lastName: 'Lee',
        name: 'Jennifer Lee',
        role: 'EMPLOYEE',
        title: 'Senior Database Administrator',
        phone: '+1-555-0404',
        hireDate: new Date('2021-09-12'),
        salary: 85000,
        status: 'ACTIVE',
        departmentId: itDept.id,
        teamId: dbTeam.id,
      },
      {
        id: this.generateId(),
        employeeId: 'EMP005',
        email: 'thomas.anderson@carecloud.com',
        firstName: 'Thomas',
        lastName: 'Anderson',
        name: 'Thomas Anderson',
        role: 'EMPLOYEE',
        title: 'Data Analyst',
        phone: '+1-555-0405',
        hireDate: new Date('2021-11-05'),
        salary: 78000,
        status: 'ACTIVE',
        departmentId: itDept.id,
        teamId: dbTeam.id,
      },
      {
        id: this.generateId(),
        employeeId: 'EMP006',
        email: 'sophie.clark@carecloud.com',
        firstName: 'Sophie',
        lastName: 'Clark',
        name: 'Sophie Clark',
        role: 'EMPLOYEE',
        title: 'BI Developer',
        phone: '+1-555-0406',
        hireDate: new Date('2022-01-18'),
        salary: 82000,
        status: 'ACTIVE',
        departmentId: itDept.id,
        teamId: dbTeam.id,
      },

      // Network Team
      {
        id: this.generateId(),
        employeeId: 'EMP007',
        email: 'carlos.rivera@carecloud.com',
        firstName: 'Carlos',
        lastName: 'Rivera',
        name: 'Carlos Rivera',
        role: 'EMPLOYEE',
        title: 'Network Security Specialist',
        phone: '+1-555-0407',
        hireDate: new Date('2022-03-25'),
        salary: 87000,
        status: 'ACTIVE',
        departmentId: itDept.id,
        teamId: networkTeam.id,
      },
      {
        id: this.generateId(),
        employeeId: 'EMP008',
        email: 'natalie.white@carecloud.com',
        firstName: 'Natalie',
        lastName: 'White',
        name: 'Natalie White',
        role: 'EMPLOYEE',
        title: 'Systems Administrator',
        phone: '+1-555-0408',
        hireDate: new Date('2022-05-14'),
        salary: 75000,
        status: 'ACTIVE',
        departmentId: itDept.id,
        teamId: networkTeam.id,
      },
      {
        id: this.generateId(),
        employeeId: 'EMP009',
        email: 'eric.thompson@carecloud.com',
        firstName: 'Eric',
        lastName: 'Thompson',
        name: 'Eric Thompson',
        role: 'EMPLOYEE',
        title: 'DevOps Engineer',
        phone: '+1-555-0409',
        hireDate: new Date('2022-07-30'),
        salary: 90000,
        status: 'ACTIVE',
        departmentId: itDept.id,
        teamId: networkTeam.id,
      },

      // Operations Employees
      // Compliance Team
      {
        id: this.generateId(),
        employeeId: 'EMP010',
        email: 'rachel.green@carecloud.com',
        firstName: 'Rachel',
        lastName: 'Green',
        name: 'Rachel Green',
        role: 'EMPLOYEE',
        title: 'Compliance Analyst',
        phone: '+1-555-0410',
        hireDate: new Date('2022-09-15'),
        salary: 68000,
        status: 'ACTIVE',
        departmentId: opsDept.id,
        teamId: complianceTeam.id,
      },
      {
        id: this.generateId(),
        employeeId: 'EMP011',
        email: 'daniel.kim@carecloud.com',
        firstName: 'Daniel',
        lastName: 'Kim',
        name: 'Daniel Kim',
        role: 'EMPLOYEE',
        title: 'Risk Assessment Specialist',
        phone: '+1-555-0411',
        hireDate: new Date('2022-11-20'),
        salary: 72000,
        status: 'ACTIVE',
        departmentId: opsDept.id,
        teamId: complianceTeam.id,
      },
      {
        id: this.generateId(),
        employeeId: 'EMP012',
        email: 'monica.taylor@carecloud.com',
        firstName: 'Monica',
        lastName: 'Taylor',
        name: 'Monica Taylor',
        role: 'EMPLOYEE',
        title: 'Quality Assurance Coordinator',
        phone: '+1-555-0412',
        hireDate: new Date('2023-01-08'),
        salary: 65000,
        status: 'ACTIVE',
        departmentId: opsDept.id,
        teamId: complianceTeam.id,
      },

      // Customer Service Team
      {
        id: this.generateId(),
        employeeId: 'EMP013',
        email: 'jessica.miller@carecloud.com',
        firstName: 'Jessica',
        lastName: 'Miller',
        name: 'Jessica Miller',
        role: 'EMPLOYEE',
        title: 'Senior Customer Success Manager',
        phone: '+1-555-0413',
        hireDate: new Date('2023-03-15'),
        salary: 70000,
        status: 'ACTIVE',
        departmentId: opsDept.id,
        teamId: csrTeam.id,
      },
      {
        id: this.generateId(),
        employeeId: 'EMP014',
        email: 'brian.harris@carecloud.com',
        firstName: 'Brian',
        lastName: 'Harris',
        name: 'Brian Harris',
        role: 'EMPLOYEE',
        title: 'Customer Support Specialist',
        phone: '+1-555-0414',
        hireDate: new Date('2023-05-22'),
        salary: 55000,
        status: 'ACTIVE',
        departmentId: opsDept.id,
        teamId: csrTeam.id,
      },
      {
        id: this.generateId(),
        employeeId: 'EMP015',
        email: 'ashley.wilson@carecloud.com',
        firstName: 'Ashley',
        lastName: 'Wilson',
        name: 'Ashley Wilson',
        role: 'EMPLOYEE',
        title: 'Client Relations Coordinator',
        phone: '+1-555-0415',
        hireDate: new Date('2023-07-10'),
        salary: 58000,
        status: 'ACTIVE',
        departmentId: opsDept.id,
        teamId: csrTeam.id,
      },

      // CPT Coding Team
      {
        id: this.generateId(),
        employeeId: 'EMP016',
        email: 'laura.rodriguez@carecloud.com',
        firstName: 'Laura',
        lastName: 'Rodriguez',
        name: 'Laura Rodriguez',
        role: 'EMPLOYEE',
        title: 'Senior Medical Coder',
        phone: '+1-555-0416',
        hireDate: new Date('2023-09-05'),
        salary: 72000,
        status: 'ACTIVE',
        departmentId: opsDept.id,
        teamId: cptTeam.id,
      },
      {
        id: this.generateId(),
        employeeId: 'EMP017',
        email: 'robert.jackson@carecloud.com',
        firstName: 'Robert',
        lastName: 'Jackson',
        name: 'Robert Jackson',
        role: 'EMPLOYEE',
        title: 'Billing Specialist',
        phone: '+1-555-0417',
        hireDate: new Date('2023-11-12'),
        salary: 58000,
        status: 'ACTIVE',
        departmentId: opsDept.id,
        teamId: cptTeam.id,
      },
      {
        id: this.generateId(),
        employeeId: 'EMP018',
        email: 'stephanie.lopez@carecloud.com',
        firstName: 'Stephanie',
        lastName: 'Lopez',
        name: 'Stephanie Lopez',
        role: 'EMPLOYEE',
        title: 'Revenue Cycle Analyst',
        phone: '+1-555-0418',
        hireDate: new Date('2024-01-20'),
        salary: 62000,
        status: 'ACTIVE',
        departmentId: opsDept.id,
        teamId: cptTeam.id,
      },
    ];

    for (const user of users) {
      await this.pool!.request()
        .input('id', sql.NVarChar, user.id)
        .input('employeeId', sql.NVarChar, user.employeeId)
        .input('email', sql.NVarChar, user.email)
        .input('firstName', sql.NVarChar, user.firstName)
        .input('lastName', sql.NVarChar, user.lastName)
        .input('name', sql.NVarChar, user.name)
        .input('role', sql.NVarChar, user.role)
        .input('title', sql.NVarChar, user.title)
        .input('phone', sql.NVarChar, user.phone)
        .input('hireDate', sql.DateTime2, user.hireDate)
        .input('salary', sql.Float, user.salary)
        .input('status', sql.NVarChar, user.status)
        .input('departmentId', sql.NVarChar, user.departmentId)
        .input('teamId', sql.NVarChar, user.teamId)
        .query(`
          INSERT INTO mbo_users (
            id, employeeId, email, firstName, lastName, name, role, title, 
            phone, hireDate, salary, status, departmentId, teamId, createdAt, updatedAt
          )
          VALUES (
            @id, @employeeId, @email, @firstName, @lastName, @name, @role, @title,
            @phone, @hireDate, @salary, @status, @departmentId, @teamId, GETDATE(), GETDATE()
          )
        `);
    }

    return users;
  }

  private async assignManagerRelationships(users: MboUser[]) {
    console.log('👔 Assigning manager relationships...');

    // Find key personnel
    const crystalWilliams = users.find(u => u.employeeId === 'EXE001')!;
    const hadiChaudhary = users.find(u => u.employeeId === 'EXE002')!;
    const itManager = users.find(u => u.employeeId === 'MGR001')!;
    const opsManager = users.find(u => u.employeeId === 'MGR002')!;

    // Update manager relationships
    const managerUpdates = [
      // IT Manager reports to Hadi
      { userId: itManager.id, managerId: hadiChaudhary.id },
      // Ops Manager reports to Crystal
      { userId: opsManager.id, managerId: crystalWilliams.id },
      
      // IT Team leads report to IT Manager
      { userId: users.find(u => u.employeeId === 'TL001')!.id, managerId: itManager.id },
      { userId: users.find(u => u.employeeId === 'TL002')!.id, managerId: itManager.id },
      { userId: users.find(u => u.employeeId === 'TL003')!.id, managerId: itManager.id },
      
      // Ops Team leads report to Ops Manager
      { userId: users.find(u => u.employeeId === 'TL004')!.id, managerId: opsManager.id },
      { userId: users.find(u => u.employeeId === 'TL005')!.id, managerId: opsManager.id },
      { userId: users.find(u => u.employeeId === 'TL006')!.id, managerId: opsManager.id },
      
      // Employees report to their team leads
      ...this.getEmployeeManagerMappings(users),
    ];

    for (const update of managerUpdates) {
      await this.pool!.request()
        .input('userId', sql.NVarChar, update.userId)
        .input('managerId', sql.NVarChar, update.managerId)
        .query('UPDATE mbo_users SET managerId = @managerId WHERE id = @userId');
    }

    // Update team leader assignments
    const teamUpdates = [
      { teamName: 'AI & Machine Learning', leaderId: users.find(u => u.employeeId === 'TL001')!.id },
      { teamName: 'Database & Analytics', leaderId: users.find(u => u.employeeId === 'TL002')!.id },
      { teamName: 'Networks & Infrastructure', leaderId: users.find(u => u.employeeId === 'TL003')!.id },
      { teamName: 'Compliance & Risk', leaderId: users.find(u => u.employeeId === 'TL004')!.id },
      { teamName: 'Customer Service & Relations', leaderId: users.find(u => u.employeeId === 'TL005')!.id },
      { teamName: 'CPT Coding & Billing', leaderId: users.find(u => u.employeeId === 'TL006')!.id },
    ];

    for (const update of teamUpdates) {
      await this.pool!.request()
        .input('leaderId', sql.NVarChar, update.leaderId)
        .input('teamName', sql.NVarChar, update.teamName)
        .query('UPDATE mbo_teams SET leaderId = @leaderId WHERE name = @teamName');
    }

    // Update department manager assignments
    await this.pool!.request()
      .input('managerId', sql.NVarChar, itManager.id)
      .input('deptName', sql.NVarChar, 'Information Technology')
      .query('UPDATE mbo_departments SET managerId = @managerId WHERE name = @deptName');

    await this.pool!.request()
      .input('managerId', sql.NVarChar, opsManager.id)
      .input('deptName', sql.NVarChar, 'Operations')
      .query('UPDATE mbo_departments SET managerId = @managerId WHERE name = @deptName');
  }

  private getEmployeeManagerMappings(users: MboUser[]) {
    const mappings: Array<{ userId: string, managerId: string }> = [];

    // AI Team
    const aiTeamLead = users.find(u => u.employeeId === 'TL001')!;
    ['EMP001', 'EMP002', 'EMP003'].forEach(empId => {
      const emp = users.find(u => u.employeeId === empId);
      if (emp) mappings.push({ userId: emp.id, managerId: aiTeamLead.id });
    });

    // DB Team
    const dbTeamLead = users.find(u => u.employeeId === 'TL002')!;
    ['EMP004', 'EMP005', 'EMP006'].forEach(empId => {
      const emp = users.find(u => u.employeeId === empId);
      if (emp) mappings.push({ userId: emp.id, managerId: dbTeamLead.id });
    });

    // Network Team
    const networkTeamLead = users.find(u => u.employeeId === 'TL003')!;
    ['EMP007', 'EMP008', 'EMP009'].forEach(empId => {
      const emp = users.find(u => u.employeeId === empId);
      if (emp) mappings.push({ userId: emp.id, managerId: networkTeamLead.id });
    });

    // Compliance Team
    const complianceTeamLead = users.find(u => u.employeeId === 'TL004')!;
    ['EMP010', 'EMP011', 'EMP012'].forEach(empId => {
      const emp = users.find(u => u.employeeId === empId);
      if (emp) mappings.push({ userId: emp.id, managerId: complianceTeamLead.id });
    });

    // CSR Team
    const csrTeamLead = users.find(u => u.employeeId === 'TL005')!;
    ['EMP013', 'EMP014', 'EMP015'].forEach(empId => {
      const emp = users.find(u => u.employeeId === empId);
      if (emp) mappings.push({ userId: emp.id, managerId: csrTeamLead.id });
    });

    // CPT Team
    const cptTeamLead = users.find(u => u.employeeId === 'TL006')!;
    ['EMP016', 'EMP017', 'EMP018'].forEach(empId => {
      const emp = users.find(u => u.employeeId === empId);
      if (emp) mappings.push({ userId: emp.id, managerId: cptTeamLead.id });
    });

    return mappings;
  }

  private async createObjectives(users: MboUser[]) {
    console.log('🎯 Creating sample objectives...');

    const currentYear = new Date().getFullYear();
    const currentQuarter = this.getCurrentQuarter();
    
    const objectives: MboObjective[] = [];

    // Create 2-3 objectives for each employee
    for (const user of users.filter(u => u.role === 'EMPLOYEE')) {
      const userObjectives = this.generateObjectivesForUser(user, currentYear, currentQuarter);
      objectives.push(...userObjectives);
    }

    for (const objective of objectives) {
      await this.pool!.request()
        .input('id', sql.NVarChar, objective.id)
        .input('title', sql.NVarChar, objective.title)
        .input('description', sql.NVarChar, objective.description)
        .input('category', sql.NVarChar, objective.category)
        .input('target', sql.Float, objective.target)
        .input('current', sql.Float, objective.current)
        .input('weight', sql.Float, objective.weight)
        .input('status', sql.NVarChar, objective.status)
        .input('dueDate', sql.DateTime2, objective.dueDate)
        .input('quarter', sql.NVarChar, objective.quarter)
        .input('year', sql.Int, objective.year)
        .input('userId', sql.NVarChar, objective.userId)
        .input('assignedById', sql.NVarChar, objective.assignedById)
        .query(`
          INSERT INTO mbo_objectives (
            id, title, description, category, target, current, weight, status,
            dueDate, quarter, year, userId, assignedById, createdAt, updatedAt
          )
          VALUES (
            @id, @title, @description, @category, @target, @current, @weight, @status,
            @dueDate, @quarter, @year, @userId, @assignedById, GETDATE(), GETDATE()
          )
        `);
    }
  }

  private generateObjectivesForUser(user: MboUser, year: number, quarter: string): MboObjective[] {
    const objectives: MboObjective[] = [];
    const manager = this.getManagerForUser(user);

    // Generate 2-3 objectives based on user's role and team
    if (user.teamId) {
      const teamBasedObjectives = this.getTeamBasedObjectives(user, year, quarter, manager);
      objectives.push(...teamBasedObjectives);
    }

    return objectives;
  }

  private getTeamBasedObjectives(user: MboUser, year: number, quarter: string, manager?: string): MboObjective[] {
    const objectives: MboObjective[] = [];
    const quarterEndDate = this.getQuarterEndDate(year, quarter);

    // Different objectives based on team
    switch (user.title) {
      case 'Senior AI Engineer':
      case 'ML Research Scientist':
      case 'AI Solutions Developer':
        objectives.push(
          {
            id: this.generateId(),
            title: 'Develop AI Model for Medical Coding',
            description: 'Create and deploy an AI model to automate medical coding processes with 95% accuracy',
            category: 'Technical Development',
            target: 100,
            current: 65,
            weight: 1.5,
            status: 'ACTIVE',
            dueDate: quarterEndDate,
            quarter,
            year,
            userId: user.id,
            assignedById: manager,
          },
          {
            id: this.generateId(),
            title: 'Optimize ML Pipeline Performance',
            description: 'Improve machine learning pipeline efficiency by 30% to reduce processing time',
            category: 'Performance Improvement',
            target: 30,
            current: 18,
            weight: 1.2,
            status: 'ACTIVE',
            dueDate: quarterEndDate,
            quarter,
            year,
            userId: user.id,
            assignedById: manager,
          }
        );
        break;

      case 'Senior Database Administrator':
      case 'Data Analyst':
      case 'BI Developer':
        objectives.push(
          {
            id: this.generateId(),
            title: 'Database Performance Optimization',
            description: 'Optimize database queries and indexing to improve response time by 40%',
            category: 'Technical Improvement',
            target: 40,
            current: 25,
            weight: 1.3,
            status: 'ACTIVE',
            dueDate: quarterEndDate,
            quarter,
            year,
            userId: user.id,
            assignedById: manager,
          },
          {
            id: this.generateId(),
            title: 'Implement Data Governance Framework',
            description: 'Establish comprehensive data governance policies and procedures',
            category: 'Process Improvement',
            target: 100,
            current: 45,
            weight: 1.1,
            status: 'ACTIVE',
            dueDate: quarterEndDate,
            quarter,
            year,
            userId: user.id,
            assignedById: manager,
          }
        );
        break;

      case 'Network Security Specialist':
      case 'Systems Administrator':
      case 'DevOps Engineer':
        objectives.push(
          {
            id: this.generateId(),
            title: 'Enhance Cybersecurity Measures',
            description: 'Implement advanced security protocols to reduce security incidents by 50%',
            category: 'Security',
            target: 50,
            current: 30,
            weight: 1.4,
            status: 'ACTIVE',
            dueDate: quarterEndDate,
            quarter,
            year,
            userId: user.id,
            assignedById: manager,
          },
          {
            id: this.generateId(),
            title: 'Automate Infrastructure Deployment',
            description: 'Create automated deployment pipelines to reduce deployment time by 60%',
            category: 'Automation',
            target: 60,
            current: 35,
            weight: 1.2,
            status: 'ACTIVE',
            dueDate: quarterEndDate,
            quarter,
            year,
            userId: user.id,
            assignedById: manager,
          }
        );
        break;

      case 'Compliance Analyst':
      case 'Risk Assessment Specialist':
      case 'Quality Assurance Coordinator':
        objectives.push(
          {
            id: this.generateId(),
            title: 'Complete HIPAA Compliance Audit',
            description: 'Conduct comprehensive HIPAA compliance audit and remediate all findings',
            category: 'Compliance',
            target: 100,
            current: 70,
            weight: 1.5,
            status: 'ACTIVE',
            dueDate: quarterEndDate,
            quarter,
            year,
            userId: user.id,
            assignedById: manager,
          },
          {
            id: this.generateId(),
            title: 'Reduce Compliance Violations',
            description: 'Implement processes to reduce compliance violations by 80%',
            category: 'Risk Management',
            target: 80,
            current: 45,
            weight: 1.3,
            status: 'ACTIVE',
            dueDate: quarterEndDate,
            quarter,
            year,
            userId: user.id,
            assignedById: manager,
          }
        );
        break;

      case 'Senior Customer Success Manager':
      case 'Customer Support Specialist':
      case 'Client Relations Coordinator':
        objectives.push(
          {
            id: this.generateId(),
            title: 'Improve Customer Satisfaction Score',
            description: 'Achieve customer satisfaction score of 4.8/5.0 or higher',
            category: 'Customer Service',
            target: 4.8,
            current: 4.3,
            weight: 1.4,
            status: 'ACTIVE',
            dueDate: quarterEndDate,
            quarter,
            year,
            userId: user.id,
            assignedById: manager,
          },
          {
            id: this.generateId(),
            title: 'Reduce Response Time',
            description: 'Reduce average customer response time to under 2 hours',
            category: 'Efficiency',
            target: 2,
            current: 3.5,
            weight: 1.2,
            status: 'ACTIVE',
            dueDate: quarterEndDate,
            quarter,
            year,
            userId: user.id,
            assignedById: manager,
          }
        );
        break;

      case 'Senior Medical Coder':
      case 'Billing Specialist':
      case 'Revenue Cycle Analyst':
        objectives.push(
          {
            id: this.generateId(),
            title: 'Achieve 98% Coding Accuracy',
            description: 'Maintain medical coding accuracy rate of 98% or higher',
            category: 'Quality',
            target: 98,
            current: 95.5,
            weight: 1.5,
            status: 'ACTIVE',
            dueDate: quarterEndDate,
            quarter,
            year,
            userId: user.id,
            assignedById: manager,
          },
          {
            id: this.generateId(),
            title: 'Reduce Days in AR',
            description: 'Reduce average days in accounts receivable to 30 days or less',
            category: 'Financial Performance',
            target: 30,
            current: 42,
            weight: 1.3,
            status: 'ACTIVE',
            dueDate: quarterEndDate,
            quarter,
            year,
            userId: user.id,
            assignedById: manager,
          }
        );
        break;
    }

    return objectives;
  }

  private getManagerForUser(user: MboUser): string | undefined {
    // This would normally query the database, but since we're in the seeding process,
    // we'll use the managerId that should be set
    return user.managerId;
  }

  private getCurrentQuarter(): string {
    const month = new Date().getMonth() + 1;
    if (month <= 3) return 'Q1';
    if (month <= 6) return 'Q2';
    if (month <= 9) return 'Q3';
    return 'Q4';
  }

  private getQuarterEndDate(year: number, quarter: string): Date {
    switch (quarter) {
      case 'Q1': return new Date(year, 2, 31); // March 31
      case 'Q2': return new Date(year, 5, 30); // June 30
      case 'Q3': return new Date(year, 8, 30); // September 30
      case 'Q4': return new Date(year, 11, 31); // December 31
      default: return new Date(year, 11, 31);
    }
  }

  private generateId(): string {
    return 'mbo_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }
}
