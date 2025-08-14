require('dotenv').config();
const sql = require('mssql');

async function checkTableStructure() {
  try {
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

    const pool = new sql.ConnectionPool(config);
    await pool.connect();

    console.log('🔍 Checking actual table structures...\n');

    // Check departments table structure
    console.log('📋 mbo_departments structure:');
    const deptStructure = await pool.request().query(`
      SELECT 
        COLUMN_NAME, 
        DATA_TYPE, 
        IS_NULLABLE, 
        COLUMN_DEFAULT,
        CHARACTER_MAXIMUM_LENGTH,
        COLUMNPROPERTY(OBJECT_ID(TABLE_SCHEMA+'.'+TABLE_NAME), COLUMN_NAME, 'IsIdentity') as IS_IDENTITY
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'mbo_departments'
      ORDER BY ORDINAL_POSITION
    `);
    
    deptStructure.recordset.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE}${col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : ''} ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'} ${col.IS_IDENTITY ? 'IDENTITY' : ''}`);
    });

    // Check teams table structure
    console.log('\n📋 mbo_teams structure:');
    const teamStructure = await pool.request().query(`
      SELECT 
        COLUMN_NAME, 
        DATA_TYPE, 
        IS_NULLABLE, 
        COLUMN_DEFAULT,
        CHARACTER_MAXIMUM_LENGTH,
        COLUMNPROPERTY(OBJECT_ID(TABLE_SCHEMA+'.'+TABLE_NAME), COLUMN_NAME, 'IsIdentity') as IS_IDENTITY
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'mbo_teams'
      ORDER BY ORDINAL_POSITION
    `);
    
    teamStructure.recordset.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE}${col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : ''} ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'} ${col.IS_IDENTITY ? 'IDENTITY' : ''}`);
    });

    // Sample the actual department data
    console.log('\n📊 Sample department data:');
    const sampleDepts = await pool.request().query('SELECT TOP 5 * FROM mbo_departments');
    sampleDepts.recordset.forEach(dept => {
      console.log(`  - ID: ${dept.id} (type: ${typeof dept.id}), Name: ${dept.name}`);
    });

    await pool.close();
  } catch (error) {
    console.error('❌ Error checking table structure:', error.message);
  }
}

checkTableStructure();
