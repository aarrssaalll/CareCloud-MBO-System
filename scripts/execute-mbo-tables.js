const sql = require('mssql');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'YourPassword123',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'ds_test',
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

async function executeMboTables() {
  let pool;
  
  try {
    console.log('🔍 Connecting to database...');
    pool = await sql.connect(config);
    console.log('✅ Connected successfully!');

    // Read the SQL file
    const sqlFilePath = path.join(__dirname, '..', 'sql', 'add-mbo-tables.sql');
    console.log('📖 Reading SQL file:', sqlFilePath);
    
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');
    
    // Split the SQL content into individual statements
    // Remove comments and split by GO statements
    const statements = sqlContent
      .split(/\r?\n/)
      .filter(line => !line.trim().startsWith('--') && !line.trim().startsWith('/*'))
      .join('\n')
      .split(/\bGO\b/i)
      .filter(statement => statement.trim().length > 0);

    console.log(`📋 Found ${statements.length} SQL statements to execute`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement && !statement.toLowerCase().includes('use [')) {
        try {
          console.log(`⚡ Executing statement ${i + 1}...`);
          await pool.request().query(statement);
        } catch (error) {
          if (error.message.includes('already exists') || error.message.includes('already an object')) {
            console.log(`⚠️  Statement ${i + 1} - Object already exists, continuing...`);
          } else {
            console.error(`❌ Error in statement ${i + 1}:`, error.message);
          }
        }
      }
    }

    // Verify tables were created
    console.log('\n🔍 Checking created tables...');
    const tables = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_NAME LIKE 'mbo_%'
      ORDER BY TABLE_NAME
    `);
    
    console.log('📋 MBO tables in database:');
    tables.recordset.forEach(table => {
      console.log(`  ✅ ${table.TABLE_NAME}`);
    });

    // Check sample data
    const userCount = await pool.request().query('SELECT COUNT(*) as count FROM mbo_users');
    const objectiveCount = await pool.request().query('SELECT COUNT(*) as count FROM mbo_objectives');
    
    console.log('\n📊 Sample data:');
    console.log(`  👥 Users: ${userCount.recordset[0].count}`);
    console.log(`  🎯 Objectives: ${objectiveCount.recordset[0].count}`);

    console.log('\n🎉 MBO tables setup complete!');

  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

executeMboTables();
