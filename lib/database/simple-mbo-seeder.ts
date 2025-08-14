import { getDbConnection } from './mbo-connection';
import sql from 'mssql';

export class SimpleMboSeeder {
  private pool: sql.ConnectionPool | null = null;

  async initialize() {
    this.pool = await getDbConnection();
  }

  async seed() {
    if (!this.pool) await this.initialize();

    console.log('🌱 Starting simplified MBO seeding...');

    try {
      // Clear existing data
      await this.clearExistingData();
      
      // Seed data in order (respecting foreign keys)
      const departments = await this.createDepartments();
      const teams = await this.createTeams(departments);
      const users = await this.createUsers(departments, teams);
      const objectives = await this.createObjectives(users);

      console.log('✅ Simplified seeding completed successfully!');
      return { departments, teams, users, objectives };
    } catch (error) {
      console.error('❌ Seeding failed:', error);
      throw error;
    }
  }

  private async clearExistingData() {
    console.log('🧹 Clearing existing data...');
    
    const tables = ['mbo_objectives', 'mbo_approvals', 'mbo_users', 'mbo_teams', 'mbo_departments'];
    
    for (const table of tables) {
      try {
        await this.pool!.request().query(`DELETE FROM ${table}`);
        // Reset identity if it exists
        await this.pool!.request().query(`DBCC CHECKIDENT('${table}', RESEED, 0)`);
      } catch (error) {
        console.log(`Note: Could not clear ${table}:`, error);
      }
    }
  }

  private async createDepartments() {
    console.log('🏢 Creating departments...');

    const depts = [
      { name: 'Information Technology', description: 'Technology and software development', budget: 2500000 },
      { name: 'Operations', description: 'Business operations and customer service', budget: 1800000 }
    ];

    const createdDepts = [];
    for (const dept of depts) {
      const result = await this.pool!.request()
        .input('name', sql.NVarChar, dept.name)
        .input('description', sql.NVarChar, dept.description)
        .input('budget', sql.Float, dept.budget)
        .query(`
          INSERT INTO mbo_departments (name, description, budget, createdAt, updatedAt)
          OUTPUT INSERTED.*
          VALUES (@name, @description, @budget, GETDATE(), GETDATE())
        `);
      createdDepts.push(result.recordset[0]);
    }

    return createdDepts;
  }

  private async createTeams(departments: any[]) {
    console.log('👥 Creating teams...');

    const itDept = departments.find(d => d.name === 'Information Technology');
    const opsDept = departments.find(d => d.name === 'Operations');

    const teams = [
      { name: 'Software Development', description: 'Frontend and backend development', departmentId: itDept.id },
      { name: 'Infrastructure', description: 'IT infrastructure and DevOps', departmentId: itDept.id },
      { name: 'Customer Support', description: 'Customer service and support', departmentId: opsDept.id },
      { name: 'Quality Assurance', description: 'Quality control and testing', departmentId: opsDept.id }
    ];

    const createdTeams = [];
    for (const team of teams) {
      const result = await this.pool!.request()
        .input('name', sql.NVarChar, team.name)
        .input('description', sql.NVarChar, team.description)
        .input('departmentId', sql.Int, team.departmentId)
        .query(`
          INSERT INTO mbo_teams (name, description, departmentId, createdAt, updatedAt)
          OUTPUT INSERTED.*
          VALUES (@name, @description, @departmentId, GETDATE(), GETDATE())
        `);
      createdTeams.push(result.recordset[0]);
    }

    return createdTeams;
  }

  private async createUsers(departments: any[], teams: any[]) {
    console.log('👤 Creating users...');

    const itDept = departments.find(d => d.name === 'Information Technology');
    const opsDept = departments.find(d => d.name === 'Operations');
    const devTeam = teams.find(t => t.name === 'Software Development');
    const supportTeam = teams.find(t => t.name === 'Customer Support');

    const users = [
      {
        employeeId: 'EMP001',
        email: 'admin@company.com',
        firstName: 'System',
        lastName: 'Administrator',
        name: 'System Administrator',
        role: 'HR',
        title: 'System Administrator',
        phone: '+1-555-0001',
        salary: 85000,
        status: 'ACTIVE',
        departmentId: itDept.id,
        teamId: devTeam.id
      },
      {
        employeeId: 'EMP002',
        email: 'john.manager@company.com',
        firstName: 'John',
        lastName: 'Manager',
        name: 'John Manager',
        role: 'MANAGER',
        title: 'Development Manager',
        phone: '+1-555-0002',
        salary: 95000,
        status: 'ACTIVE',
        departmentId: itDept.id,
        teamId: devTeam.id
      },
      {
        employeeId: 'EMP003',
        email: 'jane.developer@company.com',
        firstName: 'Jane',
        lastName: 'Developer',
        name: 'Jane Developer',
        role: 'EMPLOYEE',
        title: 'Senior Developer',
        phone: '+1-555-0003',
        salary: 75000,
        status: 'ACTIVE',
        departmentId: itDept.id,
        teamId: devTeam.id
      },
      {
        employeeId: 'EMP004',
        email: 'bob.support@company.com',
        firstName: 'Bob',
        lastName: 'Support',
        name: 'Bob Support',
        role: 'EMPLOYEE',
        title: 'Support Specialist',
        phone: '+1-555-0004',
        salary: 55000,
        status: 'ACTIVE',
        departmentId: opsDept.id,
        teamId: supportTeam.id
      }
    ];

    const createdUsers = [];
    for (const user of users) {
      const result = await this.pool!.request()
        .input('employeeId', sql.NVarChar, user.employeeId)
        .input('email', sql.NVarChar, user.email)
        .input('firstName', sql.NVarChar, user.firstName)
        .input('lastName', sql.NVarChar, user.lastName)
        .input('name', sql.NVarChar, user.name)
        .input('role', sql.NVarChar, user.role)
        .input('title', sql.NVarChar, user.title)
        .input('phone', sql.NVarChar, user.phone)
        .input('salary', sql.Float, user.salary)
        .input('status', sql.NVarChar, user.status)
        .input('departmentId', sql.Int, user.departmentId)
        .input('teamId', sql.Int, user.teamId)
        .query(`
          INSERT INTO mbo_users (employeeId, email, firstName, lastName, name, role, title, phone, hireDate, salary, status, departmentId, teamId, createdAt, updatedAt)
          OUTPUT INSERTED.*
          VALUES (@employeeId, @email, @firstName, @lastName, @name, @role, @title, @phone, GETDATE(), @salary, @status, @departmentId, @teamId, GETDATE(), GETDATE())
        `);
      createdUsers.push(result.recordset[0]);
    }

    // Set manager relationships
    const manager = createdUsers.find(u => u.role === 'MANAGER');
    if (manager) {
      await this.pool!.request()
        .input('managerId', sql.Int, manager.id)
        .input('role', sql.NVarChar, 'EMPLOYEE')
        .query(`
          UPDATE mbo_users 
          SET managerId = @managerId 
          WHERE role = @role
        `);
    }

    return createdUsers;
  }

  private async createObjectives(users: any[]) {
    console.log('🎯 Creating objectives...');

    const developer = users.find(u => u.title === 'Senior Developer');
    const supportUser = users.find(u => u.title === 'Support Specialist');

    if (!developer || !supportUser) {
      console.log('Skipping objectives - users not found');
      return [];
    }

    const objectives = [
      {
        title: 'Complete React Migration',
        description: 'Migrate legacy components to React',
        category: 'DEVELOPMENT',
        target: 100,
        current: 25,
        weight: 30,
        status: 'IN_PROGRESS',
        quarter: 'Q1',
        year: 2024,
        userId: developer.id
      },
      {
        title: 'Improve Customer Satisfaction',
        description: 'Achieve 95% customer satisfaction rating',
        category: 'CUSTOMER_SERVICE',
        target: 95,
        current: 87,
        weight: 40,
        status: 'IN_PROGRESS',
        quarter: 'Q1',
        year: 2024,
        userId: supportUser.id
      }
    ];

    const createdObjectives = [];
    for (const obj of objectives) {
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + 3); // 3 months from now

      const result = await this.pool!.request()
        .input('title', sql.NVarChar, obj.title)
        .input('description', sql.NVarChar, obj.description)
        .input('category', sql.NVarChar, obj.category)
        .input('target', sql.Float, obj.target)
        .input('current', sql.Float, obj.current)
        .input('weight', sql.Int, obj.weight)
        .input('status', sql.NVarChar, obj.status)
        .input('dueDate', sql.DateTime, dueDate)
        .input('quarter', sql.NVarChar, obj.quarter)
        .input('year', sql.Int, obj.year)
        .input('userId', sql.Int, obj.userId)
        .query(`
          INSERT INTO mbo_objectives (title, description, category, target, current, weight, status, dueDate, quarter, year, userId, createdAt, updatedAt)
          OUTPUT INSERTED.*
          VALUES (@title, @description, @category, @target, @current, @weight, @status, @dueDate, @quarter, @year, @userId, GETDATE(), GETDATE())
        `);
      createdObjectives.push(result.recordset[0]);
    }

    return createdObjectives;
  }
}
