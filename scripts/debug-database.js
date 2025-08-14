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

async function debugDatabase() {
  let pool;
  
  try {
    console.log('🔍 Debugging database schema and data...');
    pool = await sql.connect(config);

    // Check the actual structure of mbo_users table
    console.log('\n📊 mbo_users table structure:');
    const userSchema = await pool.request().query(`
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        IS_NULLABLE,
        COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'mbo_users'
      ORDER BY ORDINAL_POSITION
    `);

    userSchema.recordset.forEach(col => {
      console.log(`  ${col.COLUMN_NAME}: ${col.DATA_TYPE} (${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });

    // Check actual data in mbo_users
    console.log('\n👥 Users in database:');
    const users = await pool.request().query('SELECT TOP 5 * FROM mbo_users');
    users.recordset.forEach(user => {
      console.log(`  ID: ${user.id} (${typeof user.id}) - ${user.name || user.email}`);
    });

    // Check mbo_departments structure
    console.log('\n🏢 mbo_departments table structure:');
    const deptSchema = await pool.request().query(`
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'mbo_departments'
      ORDER BY ORDINAL_POSITION
    `);

    deptSchema.recordset.forEach(col => {
      console.log(`  ${col.COLUMN_NAME}: ${col.DATA_TYPE} (${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });

    // Check departments data
    console.log('\n🏢 Departments in database:');
    const depts = await pool.request().query('SELECT * FROM mbo_departments');
    depts.recordset.forEach(dept => {
      console.log(`  ID: ${dept.id} (${typeof dept.id}) - ${dept.name}`);
    });

    // Test a simple user query
    console.log('\n🧪 Testing simple queries...');
    try {
      const testUser = await pool.request()
        .input('email', sql.VarChar, 'crystal.williams@company.com')
        .query('SELECT * FROM mbo_users WHERE email = @email');
      
      if (testUser.recordset.length > 0) {
        console.log('✅ Found user:', testUser.recordset[0].name);
        console.log('   User ID type:', typeof testUser.recordset[0].id);
      } else {
        console.log('❌ User not found');
      }
    } catch (error) {
      console.log('❌ User query error:', error.message);
    }

    // Test the departments query that's failing
    console.log('\n🧪 Testing departments query...');
    try {
      const allUsers = await pool.request().query(`
        SELECT u.*, d.name as departmentName, t.name as teamName, m.name as managerName
        FROM mbo_users u
        LEFT JOIN mbo_departments d ON u.departmentId = d.id
        LEFT JOIN mbo_teams t ON u.teamId = t.id
        LEFT JOIN mbo_users m ON u.managerId = m.id
      `);
      console.log('✅ Join query successful, returned:', allUsers.recordset.length, 'users');
    } catch (error) {
      console.log('❌ Join query error:', error.message);
    }

  } catch (error) {
    console.error('❌ Database debug error:', error);
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

debugDatabase();
