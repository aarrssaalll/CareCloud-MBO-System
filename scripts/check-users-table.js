require('dotenv').config();
const sql = require('mssql');

async function checkUserTableColumns() {
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

    console.log('🔍 Checking mbo_users table structure...\n');

    const userColumns = await pool.request().query(`
      SELECT 
        COLUMN_NAME, 
        DATA_TYPE, 
        IS_NULLABLE, 
        CHARACTER_MAXIMUM_LENGTH,
        COLUMNPROPERTY(OBJECT_ID(TABLE_SCHEMA+'.'+TABLE_NAME), COLUMN_NAME, 'IsIdentity') as IS_IDENTITY
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'mbo_users'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('📋 Available columns in mbo_users:');
    userColumns.recordset.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE}${col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : ''} ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'} ${col.IS_IDENTITY ? 'IDENTITY' : ''}`);
    });

    // Create a simple insert that only uses available columns
    const availableColumns = userColumns.recordset.map(col => col.COLUMN_NAME);
    console.log('\n📝 Available columns for INSERT:', availableColumns.join(', '));

    await pool.close();
  } catch (error) {
    console.error('❌ Error checking table structure:', error.message);
  }
}

checkUserTableColumns();
