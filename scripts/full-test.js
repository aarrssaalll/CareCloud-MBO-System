require('dotenv').config();
const sql = require('mssql');

async function getDbConnection() {
  const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
      encrypt: false,
      trustServerCertificate: true,
      enableArithAbort: true,
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
    requestTimeout: 30000,
    connectionTimeout: 30000,
  };

  const pool = new sql.ConnectionPool(config);
  await pool.connect();
  return pool;
}

class SimpleMboSeeder {
  constructor() {
    this.pool = null;
  }

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
      console.error('❌ Seeding failed:', error.message);
      throw error;
    }
  }

  async clearExistingData() {
    console.log('🧹 Clearing existing data...');
    
    const tables = ['mbo_objectives', 'mbo_users', 'mbo_teams', 'mbo_departments'];
    
    for (const table of tables) {
      try {
        await this.pool.request().query(`DELETE FROM ${table}`);
        console.log(`  ✓ Cleared ${table}`);
      } catch (error) {
        console.log(`  ⚠️  Could not clear ${table}: ${error.message}`);
      }
    }
  }

  async createDepartments() {
    console.log('🏢 Creating departments...');

    const depts = [
      { name: 'Information Technology', description: 'Technology and software development' },
      { name: 'Operations', description: 'Business operations and customer service' }
    ];

    const createdDepts = [];
    for (const dept of depts) {
      try {
        const result = await this.pool.request()
          .input('name', sql.NVarChar, dept.name)
          .input('description', sql.NVarChar, dept.description)
          .query(`
            INSERT INTO mbo_departments (name, description, createdAt, updatedAt)
            OUTPUT INSERTED.*
            VALUES (@name, @description, GETDATE(), GETDATE())
          `);
        createdDepts.push(result.recordset[0]);
        console.log(`  ✓ Created department: ${dept.name} (ID: ${result.recordset[0].id})`);
      } catch (error) {
        console.log(`  ❌ Failed to create department ${dept.name}: ${error.message}`);
      }
    }

    return createdDepts;
  }

  async createTeams(departments) {
    console.log('👥 Creating teams...');

    const itDept = departments.find(d => d.name === 'Information Technology');
    const opsDept = departments.find(d => d.name === 'Operations');

    if (!itDept || !opsDept) {
      console.log('  ⚠️  Missing departments, skipping teams creation');
      return [];
    }

    console.log(`  📍 Using IT Dept ID: ${itDept.id} (type: ${typeof itDept.id})`);
    console.log(`  📍 Using Ops Dept ID: ${opsDept.id} (type: ${typeof opsDept.id})`);

    const teams = [
      { name: 'Software Development', description: 'Frontend and backend development', departmentId: itDept.id },
      { name: 'Infrastructure', description: 'IT infrastructure and DevOps', departmentId: itDept.id },
      { name: 'Customer Support', description: 'Customer service and support', departmentId: opsDept.id },
      { name: 'Quality Assurance', description: 'Quality control and testing', departmentId: opsDept.id }
    ];

    const createdTeams = [];
    for (const team of teams) {
      try {
        const result = await this.pool.request()
          .input('name', sql.NVarChar, team.name)
          .input('description', sql.NVarChar, team.description)
          .input('departmentId', sql.UniqueIdentifier, team.departmentId) // Use UniqueIdentifier for UUIDs
          .query(`
            INSERT INTO mbo_teams (name, description, departmentId, createdAt, updatedAt)
            OUTPUT INSERTED.*
            VALUES (@name, @description, @departmentId, GETDATE(), GETDATE())
          `);
        createdTeams.push(result.recordset[0]);
        console.log(`  ✓ Created team: ${team.name} (ID: ${result.recordset[0].id})`);
      } catch (error) {
        console.log(`  ❌ Failed to create team ${team.name}: ${error.message}`);
      }
    }

    return createdTeams;
  }

  async createUsers(departments, teams) {
    console.log('👤 Creating users...');

    const itDept = departments.find(d => d.name === 'Information Technology');
    const opsDept = departments.find(d => d.name === 'Operations');
    const devTeam = teams.find(t => t.name === 'Software Development');
    const supportTeam = teams.find(t => t.name === 'Customer Support');

    if (!itDept || !opsDept || !devTeam || !supportTeam) {
      console.log('  ⚠️  Missing required departments/teams, skipping users creation');
      return [];
    }

    const users = [
      {
        email: 'admin@company.com',
        name: 'System Administrator',
        role: 'HR',
        title: 'System Administrator',
        departmentId: itDept.id,
        teamId: devTeam.id
      },
      {
        email: 'john.manager@company.com',
        name: 'John Manager',
        role: 'MANAGER',
        title: 'Development Manager',
        departmentId: itDept.id,
        teamId: devTeam.id
      },
      {
        email: 'jane.developer@company.com',
        name: 'Jane Developer',
        role: 'EMPLOYEE',
        title: 'Senior Developer',
        departmentId: itDept.id,
        teamId: devTeam.id
      },
      {
        email: 'bob.support@company.com',
        name: 'Bob Support',
        role: 'EMPLOYEE',
        title: 'Support Specialist',
        departmentId: opsDept.id,
        teamId: supportTeam.id
      }
    ];

    const createdUsers = [];
    for (const user of users) {
      try {
        const result = await this.pool.request()
          .input('email', sql.NVarChar, user.email)
          .input('name', sql.NVarChar, user.name)
          .input('role', sql.NVarChar, user.role)
          .input('title', sql.NVarChar, user.title)
          .input('departmentId', sql.UniqueIdentifier, user.departmentId)
          .input('teamId', sql.UniqueIdentifier, user.teamId)
          .query(`
            INSERT INTO mbo_users (email, name, role, title, departmentId, teamId, createdAt, updatedAt)
            OUTPUT INSERTED.*
            VALUES (@email, @name, @role, @title, @departmentId, @teamId, GETDATE(), GETDATE())
          `);
        createdUsers.push(result.recordset[0]);
        console.log(`  ✓ Created user: ${user.email} (ID: ${result.recordset[0].id})`);
      } catch (error) {
        console.log(`  ❌ Failed to create user ${user.email}: ${error.message}`);
      }
    }

    // Set manager relationships
    const manager = createdUsers.find(u => u.role === 'MANAGER');
    if (manager) {
      try {
        await this.pool.request()
          .input('managerId', sql.UniqueIdentifier, manager.id)
          .input('role', sql.NVarChar, 'EMPLOYEE')
          .query(`
            UPDATE mbo_users 
            SET managerId = @managerId 
            WHERE role = @role
          `);
        console.log(`  ✓ Set manager relationships for ${manager.name}`);
      } catch (error) {
        console.log(`  ❌ Failed to set manager relationships: ${error.message}`);
      }
    }

    return createdUsers;
  }

  async createObjectives(users) {
    console.log('🎯 Creating objectives...');

    const developer = users.find(u => u.title === 'Senior Developer');
    const supportUser = users.find(u => u.title === 'Support Specialist');

    if (!developer || !supportUser) {
      console.log('  ⚠️  Required users not found, skipping objectives');
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
      try {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + 3); // 3 months from now

        const result = await this.pool.request()
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
          .input('userId', sql.UniqueIdentifier, obj.userId)
          .query(`
            INSERT INTO mbo_objectives (title, description, category, target, current, weight, status, dueDate, quarter, year, userId, createdAt, updatedAt)
            OUTPUT INSERTED.*
            VALUES (@title, @description, @category, @target, @current, @weight, @status, @dueDate, @quarter, @year, @userId, GETDATE(), GETDATE())
          `);
        createdObjectives.push(result.recordset[0]);
        console.log(`  ✓ Created objective: ${obj.title} (ID: ${result.recordset[0].id})`);
      } catch (error) {
        console.log(`  ❌ Failed to create objective ${obj.title}: ${error.message}`);
      }
    }

    return createdObjectives;
  }

  async close() {
    if (this.pool) {
      await this.pool.close();
    }
  }
}

// Test function
async function testAPI() {
  console.log('\n🧪 Testing API endpoints...');
  
  try {
    const fetch = (await import('node-fetch')).default;
    
    // Test authentication endpoint
    console.log('\n📝 Testing authentication...');
    
    const authResponse = await fetch('http://localhost:3000/api/mbo/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@company.com'
      }),
    });
    
    if (authResponse.ok) {
      const authData = await authResponse.json();
      console.log('✅ Authentication successful:', authData);
    } else {
      const errorText = await authResponse.text();
      console.log('❌ Authentication failed:', authResponse.status, errorText);
    }
    
    // Test data endpoint
    console.log('\n📊 Testing data endpoint...');
    
    const dataResponse = await fetch('http://localhost:3000/api/mbo/data');
    
    if (dataResponse.ok) {
      const data = await dataResponse.json();
      console.log('✅ Data retrieval successful. Got:');
      console.log(`  - ${data.users?.length || 0} users`);
      console.log(`  - ${data.departments?.length || 0} departments`);
      console.log(`  - ${data.teams?.length || 0} teams`);
      console.log(`  - ${data.objectives?.length || 0} objectives`);
    } else {
      const errorText = await dataResponse.text();
      console.log('❌ Data retrieval failed:', dataResponse.status, errorText);
    }
    
  } catch (error) {
    console.log('❌ API test failed:', error.message);
  }
}

async function runFullTest() {
  console.log('🚀 Starting full MBO system test...\n');
  
  try {
    // Seed the database
    const seeder = new SimpleMboSeeder();
    await seeder.initialize();
    
    const result = await seeder.seed();
    
    console.log('\n📊 Seeding Summary:');
    console.log(`✅ Created ${result.departments.length} departments`);
    console.log(`✅ Created ${result.teams.length} teams`);
    console.log(`✅ Created ${result.users.length} users`);
    console.log(`✅ Created ${result.objectives.length} objectives`);
    
    console.log('\n📝 Test Users:');
    result.users.forEach(user => {
      console.log(`  - ${user.email} (${user.role}) - ${user.title}`);
    });
    
    await seeder.close();
    
    // Test the APIs
    await testAPI();
    
    console.log('\n🎉 Full test completed!');
    
  } catch (error) {
    console.error('❌ Full test failed:', error.message);
    process.exit(1);
  }
  
  process.exit(0);
}

runFullTest();
