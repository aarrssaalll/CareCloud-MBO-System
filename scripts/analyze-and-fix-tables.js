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

async function analyzeExistingTables() {
  let pool;
  
  try {
    console.log('🔍 Analyzing existing table structures...');
    pool = await sql.connect(config);
    console.log('✅ Connected successfully!');

    // Get all MBO tables
    const tables = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_NAME LIKE 'mbo_%'
      ORDER BY TABLE_NAME
    `);
    
    console.log('📋 Existing MBO tables:');
    for (const table of tables.recordset) {
      console.log(`\n📊 Table: ${table.TABLE_NAME}`);
      
      // Get column details
      const columns = await pool.request()
        .input('tableName', sql.VarChar, table.TABLE_NAME)
        .query(`
          SELECT 
            COLUMN_NAME,
            DATA_TYPE,
            IS_NULLABLE,
            COLUMN_DEFAULT,
            CHARACTER_MAXIMUM_LENGTH
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_NAME = @tableName
          ORDER BY ORDINAL_POSITION
        `);

      columns.recordset.forEach(col => {
        const nullable = col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL';
        const length = col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : '';
        const defaultVal = col.COLUMN_DEFAULT ? ` DEFAULT ${col.COLUMN_DEFAULT}` : '';
        console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE}${length} ${nullable}${defaultVal}`);
      });

      // Get foreign key constraints
      const foreignKeys = await pool.request()
        .input('tableName', sql.VarChar, table.TABLE_NAME)
        .query(`
          SELECT 
            kcu.COLUMN_NAME,
            kcu.REFERENCED_TABLE_NAME,
            kcu.REFERENCED_COLUMN_NAME
          FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
          INNER JOIN INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc
            ON kcu.CONSTRAINT_NAME = rc.CONSTRAINT_NAME
          WHERE kcu.TABLE_NAME = @tableName
        `);

      if (foreignKeys.recordset.length > 0) {
        console.log('  🔗 Foreign Keys:');
        foreignKeys.recordset.forEach(fk => {
          console.log(`    ${fk.COLUMN_NAME} -> ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
        });
      }
    }

    // Check if we need to create departments and teams tables
    const existingTableNames = tables.recordset.map(t => t.TABLE_NAME);
    
    if (!existingTableNames.includes('mbo_departments')) {
      console.log('\n🔧 Creating mbo_departments table...');
      await pool.request().query(`
        CREATE TABLE mbo_departments (
          id INT IDENTITY(1,1) PRIMARY KEY,
          name NVARCHAR(255) NOT NULL,
          description NVARCHAR(MAX),
          presidentId INT,
          status NVARCHAR(50) DEFAULT 'ACTIVE',
          createdAt DATETIME2 DEFAULT GETDATE(),
          updatedAt DATETIME2 DEFAULT GETDATE()
        )
      `);
      console.log('✅ Created mbo_departments table');
    }

    if (!existingTableNames.includes('mbo_teams')) {
      console.log('\n🔧 Creating mbo_teams table...');
      await pool.request().query(`
        CREATE TABLE mbo_teams (
          id INT IDENTITY(1,1) PRIMARY KEY,
          name NVARCHAR(255) NOT NULL,
          description NVARCHAR(MAX),
          departmentId INT,
          managerId INT,
          status NVARCHAR(50) DEFAULT 'ACTIVE',
          createdAt DATETIME2 DEFAULT GETDATE(),
          updatedAt DATETIME2 DEFAULT GETDATE(),
          FOREIGN KEY (departmentId) REFERENCES mbo_departments(id)
        )
      `);
      console.log('✅ Created mbo_teams table');
    }

    // Check if we need to add department and team columns to users
    const userColumns = await pool.request().query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'mbo_users'
    `);
    
    const userColumnNames = userColumns.recordset.map(c => c.COLUMN_NAME);
    
    if (!userColumnNames.includes('departmentId')) {
      console.log('\n🔧 Adding department and team columns to mbo_users...');
      await pool.request().query(`
        ALTER TABLE mbo_users 
        ADD departmentId INT,
            teamId INT,
            managerId INT
      `);
      console.log('✅ Added foreign key columns to mbo_users');
    }

    // Check if we need to create the approvals table with correct data types
    if (!existingTableNames.includes('mbo_approvals')) {
      // First check the data type of mbo_objectives.id
      const objectiveIdType = await pool.request().query(`
        SELECT DATA_TYPE, IS_NULLABLE
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'mbo_objectives' AND COLUMN_NAME = 'id'
      `);

      if (objectiveIdType.recordset.length > 0) {
        const idDataType = objectiveIdType.recordset[0].DATA_TYPE;
        console.log(`\n📋 mbo_objectives.id data type: ${idDataType}`);
        
        let objectiveIdColumn;
        if (idDataType === 'int') {
          objectiveIdColumn = 'objectiveId INT NOT NULL';
        } else if (idDataType === 'uniqueidentifier') {
          objectiveIdColumn = 'objectiveId UNIQUEIDENTIFIER NOT NULL';
        } else {
          objectiveIdColumn = 'objectiveId INT NOT NULL'; // Default fallback
        }

        console.log('\n🔧 Creating mbo_approvals table...');
        await pool.request().query(`
          CREATE TABLE mbo_approvals (
            id INT IDENTITY(1,1) PRIMARY KEY,
            ${objectiveIdColumn},
            type NVARCHAR(50) NOT NULL,
            status NVARCHAR(50) DEFAULT 'PENDING',
            requestedById INT NOT NULL,
            approvedById INT,
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
        console.log('✅ Created mbo_approvals table with matching data types');
      }
    }

    // Insert basic departments
    const deptCount = await pool.request().query(`SELECT COUNT(*) as count FROM mbo_departments`);
    
    if (deptCount.recordset[0].count === 0) {
      console.log('\n🌱 Adding basic departments...');
      await pool.request().query(`
        INSERT INTO mbo_departments (name, description) VALUES 
        ('Operations', 'Operations Department'),
        ('Information Technology', 'IT Department'),
        ('Human Resources', 'HR Department')
      `);
      console.log('✅ Added basic departments');

      // Add basic teams
      console.log('🌱 Adding basic teams...');
      await pool.request().query(`
        INSERT INTO mbo_teams (name, description, departmentId) VALUES 
        ('Customer Service', 'Customer Service Team', 1),
        ('Quality Assurance', 'QA Team', 1),
        ('Software Development', 'Development Team', 2),
        ('System Administration', 'SysAdmin Team', 2),
        ('Talent Acquisition', 'Recruiting Team', 3)
      `);
      console.log('✅ Added basic teams');
    }

    // Add some test users if needed
    const userCount = await pool.request().query(`SELECT COUNT(*) as count FROM mbo_users`);
    
    if (userCount.recordset[0].count < 5) {
      console.log('\n🌱 Adding test users...');
      
      const testUsers = [
        { name: 'Crystal Williams', email: 'crystal.williams@company.com', role: 'SENIOR_MANAGEMENT', title: 'Operations President', departmentId: 1 },
        { name: 'Hadi Chaudhary', email: 'hadi.chaudhary@company.com', role: 'SENIOR_MANAGEMENT', title: 'IT President', departmentId: 2 },
        { name: 'Emily Davis', email: 'emily.davis@company.com', role: 'EMPLOYEE', title: 'Customer Service Rep', departmentId: 1, teamId: 1 },
        { name: 'David Wilson', email: 'david.wilson@company.com', role: 'EMPLOYEE', title: 'Software Developer', departmentId: 2, teamId: 3 },
        { name: 'Linda Johnson', email: 'linda.johnson@company.com', role: 'MANAGER', title: 'CS Manager', departmentId: 1, teamId: 1 }
      ];

      for (const user of testUsers) {
        try {
          const existing = await pool.request()
            .input('email', sql.VarChar, user.email)
            .query('SELECT id FROM mbo_users WHERE email = @email');

          if (existing.recordset.length === 0) {
            await pool.request()
              .input('name', sql.VarChar, user.name)
              .input('email', sql.VarChar, user.email)
              .input('role', sql.VarChar, user.role)
              .input('title', sql.VarChar, user.title)
              .input('departmentId', sql.Int, user.departmentId)
              .input('teamId', sql.Int, user.teamId || null)
              .query(`
                INSERT INTO mbo_users (name, email, role, title, departmentId, teamId, status, createdAt, updatedAt)
                VALUES (@name, @email, @role, @title, @departmentId, @teamId, 'ACTIVE', GETDATE(), GETDATE())
              `);
            console.log(`✅ Added user: ${user.name}`);
          }
        } catch (error) {
          console.error(`❌ Error adding user ${user.name}:`, error.message);
        }
      }
    }

    console.log('\n🎉 Database analysis and setup complete!');

  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

analyzeExistingTables();
