import { getDatabase } from './database';
import { Database } from 'sqlite';

export interface OrganizationUser {
  employee_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'employee' | 'manager' | 'hr' | 'senior-management';
  title: string;
  department: string;
  team?: string;
  manager_email?: string;
  phone: string;
  salary: number;
  permissions: string[];
}

export class OrganizationSeeder {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async seedOrganization(): Promise<void> {
    console.log('Starting organization seeding...');
    
    // Clear existing data
    await this.clearExistingData();
    
    // Create departments
    await this.createDepartments();
    
    // Create teams
    await this.createTeams();
    
    // Create users with hierarchy
    await this.createUsers();
    
    // Update manager references
    await this.updateManagerReferences();
    
    // Create sample objectives
    await this.createSampleObjectives();
    
    // Create sample approvals
    await this.createSampleApprovals();
    
    console.log('Organization seeding completed successfully');
  }

  private async clearExistingData(): Promise<void> {
    await this.db.exec('DELETE FROM audit_logs');
    await this.db.exec('DELETE FROM notifications');
    await this.db.exec('DELETE FROM performance_metrics');
    await this.db.exec('DELETE FROM workflow_stages');
    await this.db.exec('DELETE FROM approvals');
    await this.db.exec('DELETE FROM objectives');
    await this.db.exec('DELETE FROM users');
    await this.db.exec('DELETE FROM teams');
    await this.db.exec('DELETE FROM departments');
  }

  private async createDepartments(): Promise<void> {
    const departments = [
      {
        name: 'Information Technology',
        description: 'Responsible for all technology infrastructure, software development, and AI initiatives'
      },
      {
        name: 'Operations',
        description: 'Handles day-to-day operations, compliance, customer service, and coding operations'
      }
    ];

    for (const dept of departments) {
      await this.db.run(
        'INSERT INTO departments (name, description) VALUES (?, ?)',
        [dept.name, dept.description]
      );
    }
  }

  private async createTeams(): Promise<void> {
    const teams = [
      // IT Department Teams
      { name: 'AI & Machine Learning', description: 'Artificial Intelligence and Machine Learning solutions', department: 'Information Technology' },
      { name: 'Database Management', description: 'Database administration and optimization', department: 'Information Technology' },
      { name: 'Network Infrastructure', description: 'Network security and infrastructure management', department: 'Information Technology' },
      
      // Operations Department Teams
      { name: 'Compliance', description: 'Regulatory compliance and quality assurance', department: 'Operations' },
      { name: 'Customer Service Relations', description: 'Customer support and relationship management', department: 'Operations' },
      { name: 'CPT Coding', description: 'Medical coding and billing operations', department: 'Operations' }
    ];

    for (const team of teams) {
      const dept = await this.db.get('SELECT id FROM departments WHERE name = ?', [team.department]);
      await this.db.run(
        'INSERT INTO teams (name, description, department_id) VALUES (?, ?, ?)',
        [team.name, team.description, dept.id]
      );
    }
  }

  private async createUsers(): Promise<void> {
    const users: OrganizationUser[] = [
      // Senior Executives
      {
        employee_id: 'EXE001',
        email: 'crystal.williams@carecloud.com',
        first_name: 'Crystal',
        last_name: 'Williams',
        role: 'senior-management',
        title: 'President - Operations',
        department: 'Operations',
        phone: '+1-555-0101',
        salary: 250000,
        permissions: ['manage_organization', 'assign_objectives', 'approve_objectives', 'view_all_reports', 'strategic_planning', 'override_scores', 'final_approval']
      },
      {
        employee_id: 'EXE002',
        email: 'hadi.chaudhary@carecloud.com',
        first_name: 'Hadi',
        last_name: 'Chaudhary',
        role: 'senior-management',
        title: 'Executive VP - IT & AI',
        department: 'Information Technology',
        phone: '+1-555-0102',
        salary: 240000,
        permissions: ['manage_organization', 'assign_objectives', 'approve_objectives', 'view_all_reports', 'strategic_planning', 'override_scores', 'final_approval']
      },

      // Department Managers
      {
        employee_id: 'MGR001',
        email: 'sarah.thompson@carecloud.com',
        first_name: 'Sarah',
        last_name: 'Thompson',
        role: 'manager',
        title: 'IT Department Manager',
        department: 'Information Technology',
        manager_email: 'hadi.chaudhary@carecloud.com',
        phone: '+1-555-0201',
        salary: 140000,
        permissions: ['assign_objectives', 'approve_team_objectives', 'view_team_reports', 'manage_department']
      },
      {
        employee_id: 'MGR002',
        email: 'michael.rodriguez@carecloud.com',
        first_name: 'Michael',
        last_name: 'Rodriguez',
        role: 'manager',
        title: 'Operations Department Manager',
        department: 'Operations',
        manager_email: 'crystal.williams@carecloud.com',
        phone: '+1-555-0202',
        salary: 135000,
        permissions: ['assign_objectives', 'approve_team_objectives', 'view_team_reports', 'manage_department']
      },

      // Team Leads - IT Department
      {
        employee_id: 'TL001',
        email: 'alex.chen@carecloud.com',
        first_name: 'Alex',
        last_name: 'Chen',
        role: 'manager',
        title: 'AI & ML Team Lead',
        department: 'Information Technology',
        team: 'AI & Machine Learning',
        manager_email: 'sarah.thompson@carecloud.com',
        phone: '+1-555-0301',
        salary: 120000,
        permissions: ['assign_team_objectives', 'view_team_performance', 'approve_team_actions']
      },
      {
        employee_id: 'TL002',
        email: 'priya.patel@carecloud.com',
        first_name: 'Priya',
        last_name: 'Patel',
        role: 'manager',
        title: 'Database Team Lead',
        department: 'Information Technology',
        team: 'Database Management',
        manager_email: 'sarah.thompson@carecloud.com',
        phone: '+1-555-0302',
        salary: 115000,
        permissions: ['assign_team_objectives', 'view_team_performance', 'approve_team_actions']
      },
      {
        employee_id: 'TL003',
        email: 'james.wilson@carecloud.com',
        first_name: 'James',
        last_name: 'Wilson',
        role: 'manager',
        title: 'Network Infrastructure Team Lead',
        department: 'Information Technology',
        team: 'Network Infrastructure',
        manager_email: 'sarah.thompson@carecloud.com',
        phone: '+1-555-0303',
        salary: 118000,
        permissions: ['assign_team_objectives', 'view_team_performance', 'approve_team_actions']
      },

      // Team Leads - Operations Department
      {
        employee_id: 'TL004',
        email: 'jennifer.garcia@carecloud.com',
        first_name: 'Jennifer',
        last_name: 'Garcia',
        role: 'manager',
        title: 'Compliance Team Lead',
        department: 'Operations',
        team: 'Compliance',
        manager_email: 'michael.rodriguez@carecloud.com',
        phone: '+1-555-0304',
        salary: 110000,
        permissions: ['assign_team_objectives', 'view_team_performance', 'approve_team_actions']
      },
      {
        employee_id: 'TL005',
        email: 'david.kim@carecloud.com',
        first_name: 'David',
        last_name: 'Kim',
        role: 'manager',
        title: 'CSR Team Lead',
        department: 'Operations',
        team: 'Customer Service Relations',
        manager_email: 'michael.rodriguez@carecloud.com',
        phone: '+1-555-0305',
        salary: 105000,
        permissions: ['assign_team_objectives', 'view_team_performance', 'approve_team_actions']
      },
      {
        employee_id: 'TL006',
        email: 'lisa.brown@carecloud.com',
        first_name: 'Lisa',
        last_name: 'Brown',
        role: 'manager',
        title: 'CPT Coding Team Lead',
        department: 'Operations',
        team: 'CPT Coding',
        manager_email: 'michael.rodriguez@carecloud.com',
        phone: '+1-555-0306',
        salary: 108000,
        permissions: ['assign_team_objectives', 'view_team_performance', 'approve_team_actions']
      },

      // HR Representative
      {
        employee_id: 'HR001',
        email: 'rachel.davis@carecloud.com',
        first_name: 'Rachel',
        last_name: 'Davis',
        role: 'hr',
        title: 'HR Manager',
        department: 'Operations',
        manager_email: 'crystal.williams@carecloud.com',
        phone: '+1-555-0401',
        salary: 95000,
        permissions: ['manage_employees', 'define_bonus_structures', 'view_all_reports', 'process_approvals']
      },

      // Employees - AI & ML Team
      {
        employee_id: 'EMP001',
        email: 'thomas.lee@carecloud.com',
        first_name: 'Thomas',
        last_name: 'Lee',
        role: 'employee',
        title: 'Senior AI Engineer',
        department: 'Information Technology',
        team: 'AI & Machine Learning',
        manager_email: 'alex.chen@carecloud.com',
        phone: '+1-555-0501',
        salary: 95000,
        permissions: ['view_own_objectives', 'submit_self_assessment']
      },
      {
        employee_id: 'EMP002',
        email: 'maria.gonzalez@carecloud.com',
        first_name: 'Maria',
        last_name: 'Gonzalez',
        role: 'employee',
        title: 'ML Data Scientist',
        department: 'Information Technology',
        team: 'AI & Machine Learning',
        manager_email: 'alex.chen@carecloud.com',
        phone: '+1-555-0502',
        salary: 88000,
        permissions: ['view_own_objectives', 'submit_self_assessment']
      },
      {
        employee_id: 'EMP003',
        email: 'kevin.zhang@carecloud.com',
        first_name: 'Kevin',
        last_name: 'Zhang',
        role: 'employee',
        title: 'AI Research Analyst',
        department: 'Information Technology',
        team: 'AI & Machine Learning',
        manager_email: 'alex.chen@carecloud.com',
        phone: '+1-555-0503',
        salary: 75000,
        permissions: ['view_own_objectives', 'submit_self_assessment']
      },

      // Employees - Database Team
      {
        employee_id: 'EMP004',
        email: 'amanda.white@carecloud.com',
        first_name: 'Amanda',
        last_name: 'White',
        role: 'employee',
        title: 'Senior Database Administrator',
        department: 'Information Technology',
        team: 'Database Management',
        manager_email: 'priya.patel@carecloud.com',
        phone: '+1-555-0504',
        salary: 85000,
        permissions: ['view_own_objectives', 'submit_self_assessment']
      },
      {
        employee_id: 'EMP005',
        email: 'robert.johnson@carecloud.com',
        first_name: 'Robert',
        last_name: 'Johnson',
        role: 'employee',
        title: 'Database Developer',
        department: 'Information Technology',
        team: 'Database Management',
        manager_email: 'priya.patel@carecloud.com',
        phone: '+1-555-0505',
        salary: 78000,
        permissions: ['view_own_objectives', 'submit_self_assessment']
      },
      {
        employee_id: 'EMP006',
        email: 'stephanie.miller@carecloud.com',
        first_name: 'Stephanie',
        last_name: 'Miller',
        role: 'employee',
        title: 'Data Analyst',
        department: 'Information Technology',
        team: 'Database Management',
        manager_email: 'priya.patel@carecloud.com',
        phone: '+1-555-0506',
        salary: 68000,
        permissions: ['view_own_objectives', 'submit_self_assessment']
      },

      // Employees - Network Team
      {
        employee_id: 'EMP007',
        email: 'christopher.davis@carecloud.com',
        first_name: 'Christopher',
        last_name: 'Davis',
        role: 'employee',
        title: 'Senior Network Engineer',
        department: 'Information Technology',
        team: 'Network Infrastructure',
        manager_email: 'james.wilson@carecloud.com',
        phone: '+1-555-0507',
        salary: 82000,
        permissions: ['view_own_objectives', 'submit_self_assessment']
      },
      {
        employee_id: 'EMP008',
        email: 'natalie.anderson@carecloud.com',
        first_name: 'Natalie',
        last_name: 'Anderson',
        role: 'employee',
        title: 'Security Specialist',
        department: 'Information Technology',
        team: 'Network Infrastructure',
        manager_email: 'james.wilson@carecloud.com',
        phone: '+1-555-0508',
        salary: 76000,
        permissions: ['view_own_objectives', 'submit_self_assessment']
      },
      {
        employee_id: 'EMP009',
        email: 'daniel.taylor@carecloud.com',
        first_name: 'Daniel',
        last_name: 'Taylor',
        role: 'employee',
        title: 'Network Technician',
        department: 'Information Technology',
        team: 'Network Infrastructure',
        manager_email: 'james.wilson@carecloud.com',
        phone: '+1-555-0509',
        salary: 62000,
        permissions: ['view_own_objectives', 'submit_self_assessment']
      },

      // Employees - Compliance Team
      {
        employee_id: 'EMP010',
        email: 'elizabeth.moore@carecloud.com',
        first_name: 'Elizabeth',
        last_name: 'Moore',
        role: 'employee',
        title: 'Senior Compliance Officer',
        department: 'Operations',
        team: 'Compliance',
        manager_email: 'jennifer.garcia@carecloud.com',
        phone: '+1-555-0510',
        salary: 80000,
        permissions: ['view_own_objectives', 'submit_self_assessment']
      },
      {
        employee_id: 'EMP011',
        email: 'anthony.martinez@carecloud.com',
        first_name: 'Anthony',
        last_name: 'Martinez',
        role: 'employee',
        title: 'Compliance Analyst',
        department: 'Operations',
        team: 'Compliance',
        manager_email: 'jennifer.garcia@carecloud.com',
        phone: '+1-555-0511',
        salary: 65000,
        permissions: ['view_own_objectives', 'submit_self_assessment']
      },
      {
        employee_id: 'EMP012',
        email: 'michelle.lewis@carecloud.com',
        first_name: 'Michelle',
        last_name: 'Lewis',
        role: 'employee',
        title: 'Quality Assurance Specialist',
        department: 'Operations',
        team: 'Compliance',
        manager_email: 'jennifer.garcia@carecloud.com',
        phone: '+1-555-0512',
        salary: 58000,
        permissions: ['view_own_objectives', 'submit_self_assessment']
      },

      // Employees - CSR Team
      {
        employee_id: 'EMP013',
        email: 'william.clark@carecloud.com',
        first_name: 'William',
        last_name: 'Clark',
        role: 'employee',
        title: 'Senior Customer Success Manager',
        department: 'Operations',
        team: 'Customer Service Relations',
        manager_email: 'david.kim@carecloud.com',
        phone: '+1-555-0513',
        salary: 72000,
        permissions: ['view_own_objectives', 'submit_self_assessment']
      },
      {
        employee_id: 'EMP014',
        email: 'jessica.walker@carecloud.com',
        first_name: 'Jessica',
        last_name: 'Walker',
        role: 'employee',
        title: 'Customer Support Representative',
        department: 'Operations',
        team: 'Customer Service Relations',
        manager_email: 'david.kim@carecloud.com',
        phone: '+1-555-0514',
        salary: 45000,
        permissions: ['view_own_objectives', 'submit_self_assessment']
      },
      {
        employee_id: 'EMP015',
        email: 'charles.hall@carecloud.com',
        first_name: 'Charles',
        last_name: 'Hall',
        role: 'employee',
        title: 'Customer Relations Specialist',
        department: 'Operations',
        team: 'Customer Service Relations',
        manager_email: 'david.kim@carecloud.com',
        phone: '+1-555-0515',
        salary: 52000,
        permissions: ['view_own_objectives', 'submit_self_assessment']
      },

      // Employees - CPT Coding Team
      {
        employee_id: 'EMP016',
        email: 'patricia.young@carecloud.com',
        first_name: 'Patricia',
        last_name: 'Young',
        role: 'employee',
        title: 'Senior Medical Coder',
        department: 'Operations',
        team: 'CPT Coding',
        manager_email: 'lisa.brown@carecloud.com',
        phone: '+1-555-0516',
        salary: 68000,
        permissions: ['view_own_objectives', 'submit_self_assessment']
      },
      {
        employee_id: 'EMP017',
        email: 'mark.hernandez@carecloud.com',
        first_name: 'Mark',
        last_name: 'Hernandez',
        role: 'employee',
        title: 'Medical Coding Specialist',
        department: 'Operations',
        team: 'CPT Coding',
        manager_email: 'lisa.brown@carecloud.com',
        phone: '+1-555-0517',
        salary: 58000,
        permissions: ['view_own_objectives', 'submit_self_assessment']
      },
      {
        employee_id: 'EMP018',
        email: 'linda.king@carecloud.com',
        first_name: 'Linda',
        last_name: 'King',
        role: 'employee',
        title: 'Billing Coordinator',
        department: 'Operations',
        team: 'CPT Coding',
        manager_email: 'lisa.brown@carecloud.com',
        phone: '+1-555-0518',
        salary: 48000,
        permissions: ['view_own_objectives', 'submit_self_assessment']
      }
    ];

    for (const user of users) {
      // Get department and team IDs
      const dept = await this.db.get('SELECT id FROM departments WHERE name = ?', [user.department]);
      let teamId = null;
      if (user.team) {
        const team = await this.db.get('SELECT id FROM teams WHERE name = ?', [user.team]);
        teamId = team?.id;
      }

      await this.db.run(`
        INSERT INTO users (
          employee_id, email, first_name, last_name, role, title, 
          department_id, team_id, phone, salary, permissions, hire_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        user.employee_id,
        user.email,
        user.first_name,
        user.last_name,
        user.role,
        user.title,
        dept.id,
        teamId,
        user.phone,
        user.salary,
        JSON.stringify(user.permissions),
        new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Random hire date within last year
      ]);
    }
  }

  private async updateManagerReferences(): Promise<void> {
    const users = await this.db.all('SELECT id, email FROM users');
    const userMap = new Map(users.map(u => [u.email, u.id]));

    const managerMappings = [
      // Department Managers report to Executives
      { email: 'sarah.thompson@carecloud.com', managerEmail: 'hadi.chaudhary@carecloud.com' },
      { email: 'michael.rodriguez@carecloud.com', managerEmail: 'crystal.williams@carecloud.com' },
      
      // HR reports to President
      { email: 'rachel.davis@carecloud.com', managerEmail: 'crystal.williams@carecloud.com' },
      
      // Team Leads report to Department Managers
      { email: 'alex.chen@carecloud.com', managerEmail: 'sarah.thompson@carecloud.com' },
      { email: 'priya.patel@carecloud.com', managerEmail: 'sarah.thompson@carecloud.com' },
      { email: 'james.wilson@carecloud.com', managerEmail: 'sarah.thompson@carecloud.com' },
      { email: 'jennifer.garcia@carecloud.com', managerEmail: 'michael.rodriguez@carecloud.com' },
      { email: 'david.kim@carecloud.com', managerEmail: 'michael.rodriguez@carecloud.com' },
      { email: 'lisa.brown@carecloud.com', managerEmail: 'michael.rodriguez@carecloud.com' },
      
      // Employees report to Team Leads
      { email: 'thomas.lee@carecloud.com', managerEmail: 'alex.chen@carecloud.com' },
      { email: 'maria.gonzalez@carecloud.com', managerEmail: 'alex.chen@carecloud.com' },
      { email: 'kevin.zhang@carecloud.com', managerEmail: 'alex.chen@carecloud.com' },
      { email: 'amanda.white@carecloud.com', managerEmail: 'priya.patel@carecloud.com' },
      { email: 'robert.johnson@carecloud.com', managerEmail: 'priya.patel@carecloud.com' },
      { email: 'stephanie.miller@carecloud.com', managerEmail: 'priya.patel@carecloud.com' },
      { email: 'christopher.davis@carecloud.com', managerEmail: 'james.wilson@carecloud.com' },
      { email: 'natalie.anderson@carecloud.com', managerEmail: 'james.wilson@carecloud.com' },
      { email: 'daniel.taylor@carecloud.com', managerEmail: 'james.wilson@carecloud.com' },
      { email: 'elizabeth.moore@carecloud.com', managerEmail: 'jennifer.garcia@carecloud.com' },
      { email: 'anthony.martinez@carecloud.com', managerEmail: 'jennifer.garcia@carecloud.com' },
      { email: 'michelle.lewis@carecloud.com', managerEmail: 'jennifer.garcia@carecloud.com' },
      { email: 'william.clark@carecloud.com', managerEmail: 'david.kim@carecloud.com' },
      { email: 'jessica.walker@carecloud.com', managerEmail: 'david.kim@carecloud.com' },
      { email: 'charles.hall@carecloud.com', managerEmail: 'david.kim@carecloud.com' },
      { email: 'patricia.young@carecloud.com', managerEmail: 'lisa.brown@carecloud.com' },
      { email: 'mark.hernandez@carecloud.com', managerEmail: 'lisa.brown@carecloud.com' },
      { email: 'linda.king@carecloud.com', managerEmail: 'lisa.brown@carecloud.com' }
    ];

    for (const mapping of managerMappings) {
      const userId = userMap.get(mapping.email);
      const managerId = userMap.get(mapping.managerEmail);
      
      if (userId && managerId) {
        await this.db.run('UPDATE users SET manager_id = ? WHERE id = ?', [managerId, userId]);
      }
    }

    // Update team lead references
    const teamLeadMappings = [
      { teamName: 'AI & Machine Learning', leadEmail: 'alex.chen@carecloud.com' },
      { teamName: 'Database Management', leadEmail: 'priya.patel@carecloud.com' },
      { teamName: 'Network Infrastructure', leadEmail: 'james.wilson@carecloud.com' },
      { teamName: 'Compliance', leadEmail: 'jennifer.garcia@carecloud.com' },
      { teamName: 'Customer Service Relations', leadEmail: 'david.kim@carecloud.com' },
      { teamName: 'CPT Coding', leadEmail: 'lisa.brown@carecloud.com' }
    ];

    for (const mapping of teamLeadMappings) {
      const leadId = userMap.get(mapping.leadEmail);
      if (leadId) {
        await this.db.run('UPDATE teams SET team_lead_id = ? WHERE name = ?', [leadId, mapping.teamName]);
      }
    }

    // Update department manager references
    const deptManagerMappings = [
      { deptName: 'Information Technology', managerEmail: 'sarah.thompson@carecloud.com' },
      { deptName: 'Operations', managerEmail: 'michael.rodriguez@carecloud.com' }
    ];

    for (const mapping of deptManagerMappings) {
      const managerId = userMap.get(mapping.managerEmail);
      if (managerId) {
        await this.db.run('UPDATE departments SET manager_id = ? WHERE name = ?', [managerId, mapping.deptName]);
      }
    }
  }

  private async createSampleObjectives(): Promise<void> {
    const employees = await this.db.all(`
      SELECT u.id, u.employee_id, u.first_name, u.last_name, u.role, u.team_id, t.name as team_name
      FROM users u
      LEFT JOIN teams t ON u.team_id = t.id
      WHERE u.role = 'employee'
    `);

    const objectiveTemplates = {
      'AI & Machine Learning': [
        { title: 'Develop ML Model Accuracy', description: 'Improve machine learning model accuracy by 15%', target_value: 95, unit: '%', weight: 30 },
        { title: 'AI Algorithm Optimization', description: 'Optimize AI algorithms to reduce processing time by 25%', target_value: 25, unit: '%', weight: 25 },
        { title: 'Model Deployment Pipeline', description: 'Deploy 3 ML models to production', target_value: 3, unit: 'models', weight: 25 },
        { title: 'Research Publications', description: 'Contribute to 2 technical research papers', target_value: 2, unit: 'papers', weight: 20 }
      ],
      'Database Management': [
        { title: 'Database Performance Optimization', description: 'Improve database query performance by 30%', target_value: 30, unit: '%', weight: 35 },
        { title: 'Data Backup Recovery', description: 'Achieve 99.9% backup success rate', target_value: 99.9, unit: '%', weight: 25 },
        { title: 'Database Migration', description: 'Complete migration of 5 legacy databases', target_value: 5, unit: 'databases', weight: 25 },
        { title: 'Security Compliance', description: 'Maintain 100% database security compliance', target_value: 100, unit: '%', weight: 15 }
      ],
      'Network Infrastructure': [
        { title: 'Network Uptime', description: 'Maintain 99.95% network uptime', target_value: 99.95, unit: '%', weight: 40 },
        { title: 'Security Incident Response', description: 'Respond to security incidents within 15 minutes', target_value: 15, unit: 'minutes', weight: 30 },
        { title: 'Infrastructure Upgrades', description: 'Complete 8 infrastructure upgrade projects', target_value: 8, unit: 'projects', weight: 20 },
        { title: 'Cost Optimization', description: 'Reduce network costs by 12%', target_value: 12, unit: '%', weight: 10 }
      ],
      'Compliance': [
        { title: 'Regulatory Compliance Rate', description: 'Maintain 100% regulatory compliance', target_value: 100, unit: '%', weight: 40 },
        { title: 'Audit Preparation', description: 'Successfully complete 4 compliance audits', target_value: 4, unit: 'audits', weight: 30 },
        { title: 'Policy Updates', description: 'Update and implement 6 compliance policies', target_value: 6, unit: 'policies', weight: 20 },
        { title: 'Training Completion', description: 'Achieve 95% team compliance training completion', target_value: 95, unit: '%', weight: 10 }
      ],
      'Customer Service Relations': [
        { title: 'Customer Satisfaction Score', description: 'Maintain customer satisfaction above 90%', target_value: 90, unit: '%', weight: 35 },
        { title: 'Response Time', description: 'Respond to customer inquiries within 2 hours', target_value: 2, unit: 'hours', weight: 30 },
        { title: 'Issue Resolution Rate', description: 'Resolve 95% of issues on first contact', target_value: 95, unit: '%', weight: 25 },
        { title: 'Customer Retention', description: 'Maintain 88% customer retention rate', target_value: 88, unit: '%', weight: 10 }
      ],
      'CPT Coding': [
        { title: 'Coding Accuracy', description: 'Maintain 98% coding accuracy rate', target_value: 98, unit: '%', weight: 40 },
        { title: 'Processing Volume', description: 'Process 500 coding cases per month', target_value: 500, unit: 'cases', weight: 30 },
        { title: 'Denial Rate Reduction', description: 'Reduce claim denial rate to below 5%', target_value: 5, unit: '%', weight: 20 },
        { title: 'Compliance Training', description: 'Complete quarterly coding compliance training', target_value: 4, unit: 'trainings', weight: 10 }
      ]
    };

    for (const employee of employees) {
      const teamObjectives = objectiveTemplates[employee.team_name] || [];
      
      // Create 3-4 objectives per employee
      const numObjectives = Math.floor(Math.random() * 2) + 3; // 3 or 4 objectives
      const selectedObjectives = teamObjectives.slice(0, numObjectives);
      
      for (let i = 0; i < selectedObjectives.length; i++) {
        const objective = selectedObjectives[i];
        const currentValue = Math.floor(objective.target_value * (0.3 + Math.random() * 0.6)); // 30-90% progress
        
        await this.db.run(`
          INSERT INTO objectives (
            employee_id, title, description, target_value, current_value, unit, 
            weight_percentage, category, quarter, year, self_score, ai_score, 
            status, assigned_date, due_date
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          employee.id,
          objective.title,
          objective.description,
          objective.target_value,
          currentValue,
          objective.unit,
          objective.weight,
          'Performance',
          4, // Q4
          2024,
          Math.floor(Math.random() * 5) + 6, // Self score 6-10
          Math.floor(Math.random() * 3) + 7, // AI score 7-9
          'active',
          '2024-10-01',
          '2024-12-31'
        ]);
      }
    }
  }

  private async createSampleApprovals(): Promise<void> {
    const managers = await this.db.all(`
      SELECT id, first_name, last_name, role
      FROM users 
      WHERE role IN ('manager', 'senior-management')
    `);

    const objectives = await this.db.all(`
      SELECT o.id, o.employee_id, o.title, u.first_name, u.last_name
      FROM objectives o
      JOIN users u ON o.employee_id = u.id
      LIMIT 10
    `);

    const approvalTypes = [
      'objective_override',
      'score_review',
      'bonus_approval',
      'workflow_approval'
    ];

    for (let i = 0; i < 15; i++) {
      const objective = objectives[Math.floor(Math.random() * objectives.length)];
      const approver = managers[Math.floor(Math.random() * managers.length)];
      const requestType = approvalTypes[Math.floor(Math.random() * approvalTypes.length)];
      
      await this.db.run(`
        INSERT INTO approvals (
          request_type, request_id, requester_id, approver_id, status, priority,
          request_data, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        requestType,
        objective.id,
        objective.employee_id,
        approver.id,
        Math.random() > 0.7 ? 'pending' : (Math.random() > 0.5 ? 'approved' : 'rejected'),
        ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        JSON.stringify({
          objectiveTitle: objective.title,
          requestReason: 'Score adjustment needed based on updated performance metrics',
          requestedScore: Math.floor(Math.random() * 3) + 8
        }),
        new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      ]);
    }
  }
}
