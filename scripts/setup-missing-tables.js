const sql = require('mssql');
require('dotenv').config();

const config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'YourPassword123',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'MBO_System',
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

async function checkAndCreateTables() {
  let pool;
  
  try {
    console.log('🔍 Connecting to database...');
    pool = await sql.connect(config);
    console.log('✅ Connected successfully!');

    // Check existing tables
    const tables = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_NAME LIKE 'mbo_%'
      ORDER BY TABLE_NAME
    `);
    
    console.log('📋 Existing MBO tables:');
    tables.recordset.forEach(table => {
      console.log(`  - ${table.TABLE_NAME}`);
    });

    // Required tables
    const requiredTables = [
      'mbo_departments',
      'mbo_teams', 
      'mbo_users',
      'mbo_objectives',
      'mbo_approvals'
    ];

    const existingTableNames = tables.recordset.map(t => t.TABLE_NAME);
    const missingTables = requiredTables.filter(table => !existingTableNames.includes(table));

    if (missingTables.length > 0) {
      console.log('🔧 Creating missing tables...');
      
      // Create departments table
      if (missingTables.includes('mbo_departments')) {
        await pool.request().query(`
          CREATE TABLE mbo_departments (
            id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
            name NVARCHAR(255) NOT NULL,
            description NVARCHAR(MAX),
            presidentId UNIQUEIDENTIFIER,
            status NVARCHAR(50) DEFAULT 'ACTIVE',
            createdAt DATETIME2 DEFAULT GETDATE(),
            updatedAt DATETIME2 DEFAULT GETDATE()
          )
        `);
        console.log('✅ Created mbo_departments table');
      }

      // Create teams table
      if (missingTables.includes('mbo_teams')) {
        await pool.request().query(`
          CREATE TABLE mbo_teams (
            id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
            name NVARCHAR(255) NOT NULL,
            description NVARCHAR(MAX),
            departmentId UNIQUEIDENTIFIER,
            managerId UNIQUEIDENTIFIER,
            status NVARCHAR(50) DEFAULT 'ACTIVE',
            createdAt DATETIME2 DEFAULT GETDATE(),
            updatedAt DATETIME2 DEFAULT GETDATE(),
            FOREIGN KEY (departmentId) REFERENCES mbo_departments(id)
          )
        `);
        console.log('✅ Created mbo_teams table');
      }

      // Update users table to add foreign keys if needed
      const userTableInfo = await pool.request().query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'mbo_users'
      `);
      
      const userColumns = userTableInfo.recordset.map(c => c.COLUMN_NAME);
      
      if (!userColumns.includes('departmentId')) {
        await pool.request().query(`
          ALTER TABLE mbo_users 
          ADD departmentId UNIQUEIDENTIFIER,
              teamId UNIQUEIDENTIFIER,
              managerId UNIQUEIDENTIFIER
        `);
        console.log('✅ Added foreign key columns to mbo_users');
      }

      // Create objectives table
      if (missingTables.includes('mbo_objectives')) {
        await pool.request().query(`
          CREATE TABLE mbo_objectives (
            id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
            title NVARCHAR(255) NOT NULL,
            description NVARCHAR(MAX),
            category NVARCHAR(100),
            target DECIMAL(10,2) DEFAULT 0,
            current DECIMAL(10,2) DEFAULT 0,
            weight DECIMAL(3,1) DEFAULT 1.0,
            status NVARCHAR(50) DEFAULT 'ACTIVE',
            dueDate DATETIME2,
            quarter NVARCHAR(10),
            year INT,
            userId UNIQUEIDENTIFIER NOT NULL,
            assignedById UNIQUEIDENTIFIER,
            createdAt DATETIME2 DEFAULT GETDATE(),
            updatedAt DATETIME2 DEFAULT GETDATE(),
            FOREIGN KEY (userId) REFERENCES mbo_users(id),
            FOREIGN KEY (assignedById) REFERENCES mbo_users(id)
          )
        `);
        console.log('✅ Created mbo_objectives table');
      }

      // Create approvals table
      if (missingTables.includes('mbo_approvals')) {
        await pool.request().query(`
          CREATE TABLE mbo_approvals (
            id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
            objectiveId UNIQUEIDENTIFIER NOT NULL,
            type NVARCHAR(50) NOT NULL,
            status NVARCHAR(50) DEFAULT 'PENDING',
            requestedById UNIQUEIDENTIFIER NOT NULL,
            approvedById UNIQUEIDENTIFIER,
            remarks NVARCHAR(MAX),
            requestedAt DATETIME2 DEFAULT GETDATE(),
            respondedAt DATETIME2,
            createdAt DATETIME2 DEFAULT GETDATE(),
            updatedAt DATETIME2 DEFAULT GETDATE(),
            FOREIGN KEY (objectiveId) REFERENCES mbo_objectives(id),
            FOREIGN KEY (requestedById) REFERENCES mbo_users(id),
            FOREIGN KEY (approvedById) REFERENCES mbo_users(id)
          )
        `);
        console.log('✅ Created mbo_approvals table');
      }

      // Insert basic departments
      await pool.request().query(`
        IF NOT EXISTS (SELECT 1 FROM mbo_departments WHERE name = 'Operations')
        INSERT INTO mbo_departments (name, description) VALUES ('Operations', 'Operations Department')
      `);
      
      await pool.request().query(`
        IF NOT EXISTS (SELECT 1 FROM mbo_departments WHERE name = 'Information Technology')
        INSERT INTO mbo_departments (name, description) VALUES ('Information Technology', 'IT Department')
      `);

      console.log('✅ Added basic departments');

      // Insert basic teams
      const opsDepResult = await pool.request().query(`SELECT id FROM mbo_departments WHERE name = 'Operations'`);
      const itDepResult = await pool.request().query(`SELECT id FROM mbo_departments WHERE name = 'Information Technology'`);

      if (opsDepResult.recordset.length > 0) {
        const opsDeptId = opsDepResult.recordset[0].id;
        await pool.request()
          .input('deptId', sql.UniqueIdentifier, opsDeptId)
          .query(`
            IF NOT EXISTS (SELECT 1 FROM mbo_teams WHERE name = 'Customer Service')
            INSERT INTO mbo_teams (name, description, departmentId) VALUES ('Customer Service', 'Customer Service Team', @deptId)
          `);
      }

      if (itDepResult.recordset.length > 0) {
        const itDeptId = itDepResult.recordset[0].id;
        await pool.request()
          .input('deptId', sql.UniqueIdentifier, itDeptId)
          .query(`
            IF NOT EXISTS (SELECT 1 FROM mbo_teams WHERE name = 'Software Development')
            INSERT INTO mbo_teams (name, description, departmentId) VALUES ('Software Development', 'Development Team', @deptId)
          `);
      }

      console.log('✅ Added basic teams');
    }

    // Final verification
    const finalTables = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_NAME LIKE 'mbo_%'
      ORDER BY TABLE_NAME
    `);
    
    console.log('\n📋 Final MBO tables:');
    finalTables.recordset.forEach(table => {
      console.log(`  - ${table.TABLE_NAME}`);
    });

    console.log('\n🎉 Database setup complete!');

  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

checkAndCreateTables();
