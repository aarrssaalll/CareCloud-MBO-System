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

async function addSampleObjectives() {
  let pool;
  
  try {
    console.log('🎯 Adding Sample Objectives...');
    pool = await sql.connect(config);

    // Get users to assign objectives to
    const users = await pool.request().query('SELECT id, name, email, role FROM mbo_users');
    
    if (users.recordset.length === 0) {
      console.log('❌ No users found in database');
      return;
    }

    console.log(`👥 Found ${users.recordset.length} users`);

    // Sample objectives templates
    const objectiveTemplates = [
      {
        title: 'Customer Satisfaction Excellence',
        description: 'Achieve and maintain exceptional customer satisfaction scores',
        category: 'Customer Success',
        target: 95,
        current: 88,
        weight: 25,
        status: 'ACTIVE',
        quarter: 'Q3',
        year: 2025
      },
      {
        title: 'Revenue Growth Contribution',
        description: 'Drive revenue growth through strategic initiatives',
        category: 'Financial',
        target: 150000,
        current: 112000,
        weight: 30,
        status: 'ACTIVE',
        quarter: 'Q3',
        year: 2025
      },
      {
        title: 'Process Innovation',
        description: 'Lead process improvement projects',
        category: 'Operations',
        target: 3,
        current: 2,
        weight: 20,
        status: 'ACTIVE',
        quarter: 'Q3',
        year: 2025
      },
      {
        title: 'Professional Development',
        description: 'Complete advanced certifications and training',
        category: 'Learning',
        target: 2,
        current: 2,
        weight: 15,
        status: 'COMPLETED',
        quarter: 'Q3',
        year: 2025
      },
      {
        title: 'Team Collaboration',
        description: 'Enhance cross-functional collaboration',
        category: 'Teamwork',
        target: 4,
        current: 2,
        weight: 10,
        status: 'ACTIVE',
        quarter: 'Q3',
        year: 2025
      }
    ];

    // Check if objectives already exist
    const existingObjectives = await pool.request().query('SELECT COUNT(*) as count FROM mbo_objectives');
    
    if (existingObjectives.recordset[0].count > 0) {
      console.log(`📋 ${existingObjectives.recordset[0].count} objectives already exist`);
      return;
    }

    // Add objectives for each user
    let totalAdded = 0;
    
    for (const user of users.recordset) {
      console.log(`\n📝 Adding objectives for ${user.name}...`);
      
      for (const template of objectiveTemplates) {
        try {
          const dueDate = new Date('2025-09-30'); // End of Q3 2025
          
          await pool.request()
            .input('title', sql.VarChar, template.title)
            .input('description', sql.VarChar, template.description)
            .input('category', sql.VarChar, template.category)
            .input('target', sql.Decimal(10, 2), template.target)
            .input('current', sql.Decimal(10, 2), template.current + (Math.random() * 10 - 5)) // Add variance
            .input('weight', sql.Decimal(3, 1), template.weight)
            .input('status', sql.VarChar, template.status)
            .input('dueDate', sql.DateTime2, dueDate)
            .input('quarter', sql.VarChar, template.quarter)
            .input('year', sql.Int, template.year)
            .input('userId', sql.Int, user.id)
            .query(`
              INSERT INTO mbo_objectives 
              (title, description, category, target, current, weight, status, dueDate, quarter, year, userId, createdAt, updatedAt)
              VALUES 
              (@title, @description, @category, @target, @current, @weight, @status, @dueDate, @quarter, @year, @userId, GETDATE(), GETDATE())
            `);
          
          totalAdded++;
          console.log(`  ✅ ${template.title}`);
        } catch (error) {
          console.log(`  ❌ Error adding ${template.title}: ${error.message}`);
        }
      }
    }

    console.log(`\n🎉 Successfully added ${totalAdded} objectives!`);
    
    // Verify the data
    const finalCount = await pool.request().query('SELECT COUNT(*) as count FROM mbo_objectives');
    console.log(`📊 Total objectives in database: ${finalCount.recordset[0].count}`);

    // Show summary by user
    const summary = await pool.request().query(`
      SELECT u.name, COUNT(o.id) as objectiveCount
      FROM mbo_users u
      LEFT JOIN mbo_objectives o ON u.id = o.userId
      GROUP BY u.id, u.name
      ORDER BY u.name
    `);

    console.log('\n📈 Objectives per user:');
    summary.recordset.forEach(row => {
      console.log(`  ${row.name}: ${row.objectiveCount} objectives`);
    });

  } catch (error) {
    console.error('❌ Error adding sample objectives:', error);
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

addSampleObjectives();
