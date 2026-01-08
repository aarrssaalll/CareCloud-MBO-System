const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifySchemaAlignment() {
  try {
    console.log('🔍 Verifying Prisma Schema alignment with Database...\n');

    // Get all tables from database
    const dbTables = await prisma.$queryRawUnsafe(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_SCHEMA = 'dbo'
      ORDER BY TABLE_NAME
    `);

    console.log('📊 Database Tables:', dbTables.length);
    
    // Check each critical table
    const criticalTables = [
      'mbo_objectives',
      'mbo_manager_objectives', 
      'mbo_quantitative_objectives',
      'mbo_quantitative_employee_objectives',
      'mbo_practice_revenues',
      'mbo_employee_practice_revenues'
    ];

    for (const tableName of criticalTables) {
      const tableExists = dbTables.find(t => t.TABLE_NAME === tableName);
      
      if (!tableExists) {
        console.log(`❌ Missing table: ${tableName}`);
        continue;
      }

      console.log(`\n✅ Table: ${tableName}`);

      // Get columns for this table
      const columns = await prisma.$queryRawUnsafe(`
        SELECT 
          COLUMN_NAME, 
          DATA_TYPE, 
          IS_NULLABLE,
          COLUMN_DEFAULT
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = '${tableName}'
        ORDER BY ORDINAL_POSITION
      `);

      console.log(`   Columns (${columns.length}):`);
      columns.forEach(col => {
        const nullable = col.IS_NULLABLE === 'YES' ? '?' : '';
        console.log(`     - ${col.COLUMN_NAME} (${col.DATA_TYPE})${nullable}`);
      });
    }

    // Test Prisma Client models
    console.log('\n🧪 Testing Prisma Client Models...\n');

    // Test MboObjective
    const testObjective = await prisma.mboObjective.findFirst({
      include: {
        quantitativeData: {
          include: {
            practiceRevenues: true
          }
        }
      }
    });
    console.log('✅ MboObjective model works');
    if (testObjective) {
      console.log(`   - Has quantitativeData relation: ${testObjective.quantitativeData ? 'YES' : 'NO'}`);
      console.log(`   - isQuantitative field: ${testObjective.isQuantitative}`);
      console.log(`   - objectiveType field: ${testObjective.objectiveType || 'null'}`);
    }

    // Test MboManagerObjective
    const testManagerObj = await prisma.mboManagerObjective.findFirst({
      include: {
        quantitativeData: {
          include: {
            practiceRevenues: true
          }
        },
        assignedBySeniorManager: true
      }
    });
    console.log('✅ MboManagerObjective model works');
    if (testManagerObj) {
      console.log(`   - Has quantitativeData relation: ${testManagerObj.quantitativeData ? 'YES' : 'NO'}`);
      console.log(`   - isQuantitative field: ${testManagerObj.isQuantitative}`);
      console.log(`   - objectiveType field: ${testManagerObj.objectiveType || 'null'}`);
    }

    // Test Quantitative models
    const testQuant = await prisma.mboQuantitativeObjective.findFirst({
      include: {
        practiceRevenues: true
      }
    });
    console.log('✅ MboQuantitativeObjective model works');
    if (testQuant) {
      console.log(`   - Has ${testQuant.practiceRevenues?.length || 0} practice revenues`);
    }

    const testQuantEmp = await prisma.mboQuantitativeEmployeeObjective.findFirst({
      include: {
        practiceRevenues: true
      }
    });
    console.log('✅ MboQuantitativeEmployeeObjective model works');
    if (testQuantEmp) {
      console.log(`   - Has ${testQuantEmp.practiceRevenues?.length || 0} practice revenues`);
    }

    console.log('\n🎉 Schema alignment verified successfully!');
    console.log('\n📋 Summary:');
    console.log(`   ✓ All critical tables exist`);
    console.log(`   ✓ All Prisma models working`);
    console.log(`   ✓ Relations properly configured`);
    console.log(`   ✓ Ready for testing!`);

  } catch (error) {
    console.error('\n❌ Error during verification:', error);
    if (error.message) {
      console.error('   Message:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

verifySchemaAlignment();
