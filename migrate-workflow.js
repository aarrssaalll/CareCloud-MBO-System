const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runDatabaseMigration() {
  try {
    console.log('🔄 Running database migration to add workflow columns...\n');
    
    // Add new columns to mbo_objectives table
    const alterTableSQL = `
      ALTER TABLE mbo_objectives ADD COLUMN workflowStatus NVARCHAR(50) DEFAULT 'DRAFT';
      ALTER TABLE mbo_objectives ADD COLUMN submittedAt DATETIME2;
      ALTER TABLE mbo_objectives ADD COLUMN completedAt DATETIME2;
      ALTER TABLE mbo_objectives ADD COLUMN submittedToManagerAt DATETIME2;
      ALTER TABLE mbo_objectives ADD COLUMN managerReviewedAt DATETIME2;
      ALTER TABLE mbo_objectives ADD COLUMN submittedToHrAt DATETIME2;
      ALTER TABLE mbo_objectives ADD COLUMN hrApprovedAt DATETIME2;
      ALTER TABLE mbo_objectives ADD COLUMN employeeRemarks NVARCHAR(MAX);
      ALTER TABLE mbo_objectives ADD COLUMN managerFeedback NVARCHAR(MAX);
      ALTER TABLE mbo_objectives ADD COLUMN hrNotes NVARCHAR(MAX);
      ALTER TABLE mbo_objectives ADD COLUMN aiScoreMetadata NVARCHAR(MAX);
      ALTER TABLE mbo_objectives ADD COLUMN digitalSignature NVARCHAR(MAX);
    `;

    const alterReviewsSQL = `
      ALTER TABLE mbo_objective_reviews ADD COLUMN reviewType NVARCHAR(50) DEFAULT 'MANAGER';
      ALTER TABLE mbo_objective_reviews ADD COLUMN aiScore FLOAT;
      ALTER TABLE mbo_objective_reviews ADD COLUMN aiComments NVARCHAR(MAX);
      ALTER TABLE mbo_objective_reviews ADD COLUMN manualOverride BIT DEFAULT 0;
    `;

    console.log('Adding columns to mbo_objectives table...');
    
    // Execute the SQL directly using Prisma raw queries
    const commands = [
      "ALTER TABLE mbo_objectives ADD workflowStatus NVARCHAR(50) DEFAULT 'DRAFT'",
      "ALTER TABLE mbo_objectives ADD submittedAt DATETIME2",
      "ALTER TABLE mbo_objectives ADD completedAt DATETIME2", 
      "ALTER TABLE mbo_objectives ADD submittedToManagerAt DATETIME2",
      "ALTER TABLE mbo_objectives ADD managerReviewedAt DATETIME2",
      "ALTER TABLE mbo_objectives ADD submittedToHrAt DATETIME2",
      "ALTER TABLE mbo_objectives ADD hrApprovedAt DATETIME2",
      "ALTER TABLE mbo_objectives ADD employeeRemarks NVARCHAR(MAX)",
      "ALTER TABLE mbo_objectives ADD managerFeedback NVARCHAR(MAX)",
      "ALTER TABLE mbo_objectives ADD hrNotes NVARCHAR(MAX)",
      "ALTER TABLE mbo_objectives ADD aiScoreMetadata NVARCHAR(MAX)",
      "ALTER TABLE mbo_objectives ADD digitalSignature NVARCHAR(MAX)"
    ];

    for (const command of commands) {
      try {
        await prisma.$executeRawUnsafe(command);
        console.log(`✅ ${command}`);
      } catch (error) {
        if (error.message.includes('already exists') || error.message.includes('duplicate')) {
          console.log(`⚠️  Column already exists: ${command}`);
        } else {
          console.error(`❌ Error with command: ${command}`, error.message);
        }
      }
    }

    console.log('\nAdding columns to mbo_objective_reviews table...');
    
    const reviewCommands = [
      "ALTER TABLE mbo_objective_reviews ADD reviewType NVARCHAR(50) DEFAULT 'MANAGER'",
      "ALTER TABLE mbo_objective_reviews ADD aiScore FLOAT",
      "ALTER TABLE mbo_objective_reviews ADD aiComments NVARCHAR(MAX)",
      "ALTER TABLE mbo_objective_reviews ADD manualOverride BIT DEFAULT 0"
    ];

    for (const command of reviewCommands) {
      try {
        await prisma.$executeRawUnsafe(command);
        console.log(`✅ ${command}`);
      } catch (error) {
        if (error.message.includes('already exists') || error.message.includes('duplicate')) {
          console.log(`⚠️  Column already exists: ${command}`);
        } else {
          console.error(`❌ Error with command: ${command}`, error.message);
        }
      }
    }

    // Update existing objectives with default workflow status
    console.log('\nUpdating existing objectives with workflow status...');
    
    const updateResult = await prisma.mboObjective.updateMany({
      where: {
        workflowStatus: null
      },
      data: {
        workflowStatus: 'ACTIVE' // Existing objectives are already active
      }
    });
    
    console.log(`✅ Updated ${updateResult.count} objectives with workflow status`);

    // Set completed objectives to proper workflow status
    const completedUpdate = await prisma.mboObjective.updateMany({
      where: {
        status: 'COMPLETED',
        workflowStatus: 'ACTIVE'
      },
      data: {
        workflowStatus: 'COMPLETED',
        completedAt: new Date()
      }
    });
    
    console.log(`✅ Updated ${completedUpdate.count} completed objectives`);

    console.log('\n🎉 Database migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runDatabaseMigration();
