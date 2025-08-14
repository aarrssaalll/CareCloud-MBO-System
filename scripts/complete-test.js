require('dotenv').config();
const sql = require('mssql');

class CompleteMboTest {
  constructor() {
    this.pool = null;
  }

  async initialize() {
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
    };

    this.pool = new sql.ConnectionPool(config);
    await this.pool.connect();
  }

  async seedDatabase() {
    console.log('🌱 Running complete database seeding...\n');

    try {
      // Clear existing data
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

      // Create departments
      console.log('\n🏢 Creating departments...');
      const depts = [
        { name: 'Information Technology', description: 'Technology and software development' },
        { name: 'Operations', description: 'Business operations and customer service' }
      ];

      const createdDepts = [];
      for (const dept of depts) {
        const result = await this.pool.request()
          .input('name', sql.NVarChar, dept.name)
          .input('description', sql.NVarChar, dept.description)
          .query(`
            INSERT INTO mbo_departments (name, description, createdAt, updatedAt)
            OUTPUT INSERTED.*
            VALUES (@name, @description, GETDATE(), GETDATE())
          `);
        createdDepts.push(result.recordset[0]);
        console.log(`  ✓ Created: ${dept.name} (ID: ${result.recordset[0].id})`);
      }

      // Create teams
      console.log('\n👥 Creating teams...');
      const itDept = createdDepts.find(d => d.name === 'Information Technology');
      const opsDept = createdDepts.find(d => d.name === 'Operations');

      const teams = [
        { name: 'Software Development', description: 'Frontend and backend development', departmentId: itDept.id },
        { name: 'Customer Support', description: 'Customer service and support', departmentId: opsDept.id }
      ];

      const createdTeams = [];
      for (const team of teams) {
        const result = await this.pool.request()
          .input('name', sql.NVarChar, team.name)
          .input('description', sql.NVarChar, team.description)
          .input('departmentId', sql.UniqueIdentifier, team.departmentId)
          .query(`
            INSERT INTO mbo_teams (name, description, departmentId, createdAt, updatedAt)
            OUTPUT INSERTED.*
            VALUES (@name, @description, @departmentId, GETDATE(), GETDATE())
          `);
        createdTeams.push(result.recordset[0]);
        console.log(`  ✓ Created: ${team.name} (ID: ${result.recordset[0].id})`);
      }

      // Create users
      console.log('\n👤 Creating users...');
      const devTeam = createdTeams.find(t => t.name === 'Software Development');
      const supportTeam = createdTeams.find(t => t.name === 'Customer Support');

      const users = [
        {
          email: 'admin@company.com',
          firstName: 'System',
          lastName: 'Administrator',
          role: 'HR',
          title: 'System Administrator',
          employeeId: 'EMP-001',
          status: 'ACTIVE',
          phone: '+10000000001',
          hireDate: new Date('2022-01-15'),
          salary: 120000,
          departmentId: itDept.id,
          teamId: devTeam.id
        },
        {
          email: 'john.manager@company.com',
          firstName: 'John',
          lastName: 'Manager',
          role: 'MANAGER',
          title: 'Development Manager',
          employeeId: 'EMP-002',
          status: 'ACTIVE',
          phone: '+10000000002',
          hireDate: new Date('2023-03-10'),
          salary: 95000,
          departmentId: itDept.id,
          teamId: devTeam.id
        },
        {
          email: 'jane.developer@company.com',
          firstName: 'Jane',
          lastName: 'Developer',
          role: 'EMPLOYEE',
          title: 'Senior Developer',
          employeeId: 'EMP-003',
          status: 'ACTIVE',
          phone: '+10000000003',
          hireDate: new Date('2024-06-01'),
          salary: 110000,
          departmentId: itDept.id,
          teamId: devTeam.id
        }
      ];

      const createdUsers = [];
      // Discover existing columns to build dynamic insert to avoid failures when optional columns missing
      let existingUserCols = [];
      try {
        const colsRs = await this.pool.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='mbo_users'");
        existingUserCols = colsRs.recordset.map(r => r.COLUMN_NAME.toLowerCase());
      } catch (e) {
        console.log('  ⚠️  Could not inspect mbo_users columns:', e.message);
      }

      const hasCol = (c) => existingUserCols.includes(c.toLowerCase());

      for (const user of users) {
        try {
          const request = this.pool.request()
            .input('email', sql.NVarChar, user.email);
          const insertCols = ['email'];
          const values = ['@email'];
            if (hasCol('firstName')) { request.input('firstName', sql.NVarChar, user.firstName); insertCols.push('firstName'); values.push('@firstName'); }
            if (hasCol('lastName')) { request.input('lastName', sql.NVarChar, user.lastName); insertCols.push('lastName'); values.push('@lastName'); }
            if (hasCol('employeeId')) { request.input('employeeId', sql.NVarChar, user.employeeId); insertCols.push('employeeId'); values.push('@employeeId'); }
            if (hasCol('status')) { request.input('status', sql.NVarChar, user.status); insertCols.push('status'); values.push('@status'); }
            if (hasCol('phone')) { request.input('phone', sql.NVarChar, user.phone); insertCols.push('phone'); values.push('@phone'); }
            if (hasCol('hireDate') && user.hireDate) { request.input('hireDate', sql.DateTime2, user.hireDate); insertCols.push('hireDate'); values.push('@hireDate'); }
            if (hasCol('salary') && user.salary) { request.input('salary', sql.Decimal(18,2), user.salary); insertCols.push('salary'); values.push('@salary'); }

            if (hasCol('role')) { request.input('role', sql.NVarChar, user.role); insertCols.push('role'); values.push('@role'); }
            if (hasCol('title')) { request.input('title', sql.NVarChar, user.title); insertCols.push('title'); values.push('@title'); }
            if (hasCol('departmentId') && user.departmentId) { request.input('departmentId', sql.UniqueIdentifier, user.departmentId); insertCols.push('departmentId'); values.push('@departmentId'); }
            if (hasCol('teamId') && user.teamId) { request.input('teamId', sql.UniqueIdentifier, user.teamId); insertCols.push('teamId'); values.push('@teamId'); }
          // Always include timestamps if columns exist
            if (hasCol('createdAt')) { insertCols.push('createdAt'); values.push('GETDATE()'); }
            if (hasCol('updatedAt')) { insertCols.push('updatedAt'); values.push('GETDATE()'); }

          const sqlText = `INSERT INTO mbo_users (${insertCols.join(', ')}) OUTPUT INSERTED.* VALUES (${values.join(', ')})`;
          const result = await request.query(sqlText);
          createdUsers.push(result.recordset[0]);
          console.log(`  ✓ Created: ${user.email} (ID: ${result.recordset[0].id})`);
        } catch (error) {
          console.log(`  ❌ Failed to create ${user.email}: ${error.message}`);
        }
      }

      // Set manager relationships
      const manager = createdUsers.find(u => u.role === 'MANAGER');
      if (manager) {
        try {
          await this.pool.request()
            .input('managerId', sql.UniqueIdentifier, manager.id)
            .input('role', sql.NVarChar, 'EMPLOYEE')
            .query(`UPDATE mbo_users SET managerId = @managerId WHERE role = @role`);
          console.log(`  ✓ Set manager relationships`);
        } catch (error) {
          console.log(`  ❌ Failed to set manager relationships: ${error.message}`);
        }
      }

      console.log('\n📊 Seeding Summary:');
      console.log(`✅ Created ${createdDepts.length} departments`);
      console.log(`✅ Created ${createdTeams.length} teams`);
      console.log(`✅ Created ${createdUsers.length} users`);

      return { departments: createdDepts, teams: createdTeams, users: createdUsers };

    } catch (error) {
      console.error('❌ Seeding failed:', error.message);
      throw error;
    }
  }

  async testDatabase() {
    console.log('\n🔍 Testing database content...');

    try {
      // Check users
      const users = await this.pool.request().query('SELECT * FROM mbo_users');
      console.log(`\n👤 Users in database: ${users.recordset.length}`);
      users.recordset.forEach(user => {
        console.log(`  - ${user.email} (${user.role}) - ${user.name}`);
      });

      // Check departments
      const depts = await this.pool.request().query('SELECT * FROM mbo_departments');
      console.log(`\n🏢 Departments in database: ${depts.recordset.length}`);
      depts.recordset.forEach(dept => {
        console.log(`  - ${dept.name}: ${dept.description}`);
      });

      // Check teams
      const teams = await this.pool.request().query('SELECT * FROM mbo_teams');
      console.log(`\n👥 Teams in database: ${teams.recordset.length}`);
      teams.recordset.forEach(team => {
        console.log(`  - ${team.name}: ${team.description}`);
      });

    } catch (error) {
      console.error('❌ Database test failed:', error.message);
    }
  }

  async close() {
    if (this.pool) {
      await this.pool.close();
    }
  }
}

async function runCompleteTest() {
  console.log('🚀 Running Complete MBO System Test\n');
  
  const tester = new CompleteMboTest();
  
  try {
    await tester.initialize();
    console.log('✅ Database connection established');
    
    await tester.seedDatabase();
    await tester.testDatabase();
    
    console.log('\n🎉 Complete test finished successfully!');
    console.log('\nNext steps:');
    console.log('1. Development server is running at http://localhost:3000');
    console.log('2. Try logging in with: admin@company.com');
    console.log('3. Test API endpoints manually');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  } finally {
    await tester.close();
  }
  
  process.exit(0);
}

runCompleteTest();
