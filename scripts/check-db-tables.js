const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('📊 Checking database structure...\n');
    
    // Get all tables
    const tables = await prisma.$queryRawUnsafe(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_SCHEMA = 'dbo' 
      ORDER BY TABLE_NAME
    `);
    
    console.log('📋 Tables in database:');
    tables.forEach(t => console.log(`  - ${t.TABLE_NAME}`));
    
    // Check for specific objective-related tables
    console.log('\n🎯 Objective-related tables:');
    const objectiveTables = tables.filter(t => 
      t.TABLE_NAME.toLowerCase().includes('objective')
    );
    objectiveTables.forEach(t => console.log(`  ✓ ${t.TABLE_NAME}`));
    
    // Get column info for each objective table
    for (const table of objectiveTables) {
      console.log(`\n📝 Columns in ${table.TABLE_NAME}:`);
      const columns = await prisma.$queryRawUnsafe(`
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = '${table.TABLE_NAME}'
        ORDER BY ORDINAL_POSITION
      `);
      columns.forEach(col => {
        console.log(`  - ${col.COLUMN_NAME} (${col.DATA_TYPE}) ${col.IS_NULLABLE === 'YES' ? 'nullable' : 'required'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
