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

async function testAndSeedDatabase() {
  let pool;
  
  try {
    console.log('🔍 Testing database connection...');
    pool = await sql.connect(config);
    console.log('✅ Database connected successfully!');

    // Test if users exist
    const userCount = await pool.request().query('SELECT COUNT(*) as count FROM mbo_users');
    console.log(`📊 Current users in database: ${userCount.recordset[0].count}`);

    // If we have fewer than expected users, let's add some test users
    if (userCount.recordset[0].count < 5) {
      console.log('🌱 Adding test users...');
      
      const testUsers = [
        {
          employeeId: 'EMP001',
          email: 'crystal.williams@company.com',
          firstName: 'Crystal',
          lastName: 'Williams',
          name: 'Crystal Williams',
          role: 'SENIOR_MANAGEMENT',
          title: 'Operations President',
          status: 'ACTIVE'
        },
        {
          employeeId: 'EMP002',
          email: 'hadi.chaudhary@company.com',
          firstName: 'Hadi',
          lastName: 'Chaudhary',
          name: 'Hadi Chaudhary',
          role: 'SENIOR_MANAGEMENT',
          title: 'IT President',
          status: 'ACTIVE'
        },
        {
          employeeId: 'EMP003',
          email: 'emily.davis@company.com',
          firstName: 'Emily',
          lastName: 'Davis',
          name: 'Emily Davis',
          role: 'EMPLOYEE',
          title: 'Customer Service Representative',
          status: 'ACTIVE'
        },
        {
          employeeId: 'EMP004',
          email: 'david.wilson@company.com',
          firstName: 'David',
          lastName: 'Wilson',
          name: 'David Wilson',
          role: 'EMPLOYEE',
          title: 'Software Developer',
          status: 'ACTIVE'
        },
        {
          employeeId: 'EMP005',
          email: 'linda.johnson@company.com',
          firstName: 'Linda',
          lastName: 'Johnson',
          name: 'Linda Johnson',
          role: 'MANAGER',
          title: 'Customer Service Manager',
          status: 'ACTIVE'
        }
      ];

      for (const user of testUsers) {
        try {
          // Check if user already exists
          const existing = await pool.request()
            .input('email', sql.VarChar, user.email)
            .query('SELECT id FROM mbo_users WHERE email = @email');

          if (existing.recordset.length === 0) {
            await pool.request()
              .input('employeeId', sql.VarChar, user.employeeId)
              .input('email', sql.VarChar, user.email)
              .input('firstName', sql.VarChar, user.firstName)
              .input('lastName', sql.VarChar, user.lastName)
              .input('name', sql.VarChar, user.name)
              .input('role', sql.VarChar, user.role)
              .input('title', sql.VarChar, user.title)
              .input('status', sql.VarChar, user.status)
              .query(`
                INSERT INTO mbo_users (id, employeeId, email, firstName, lastName, name, role, title, status, createdAt, updatedAt)
                VALUES (NEWID(), @employeeId, @email, @firstName, @lastName, @name, @role, @title, @status, GETDATE(), GETDATE())
              `);
            console.log(`✅ Added user: ${user.name}`);
          } else {
            console.log(`📝 User already exists: ${user.name}`);
          }
        } catch (error) {
          console.error(`❌ Error adding user ${user.name}:`, error.message);
        }
      }
    }

    // Test API endpoint simulation
    console.log('\n🧪 Testing API functionality...');
    
    // Test getUserByEmail
    const testUser = await pool.request()
      .input('email', sql.VarChar, 'crystal.williams@company.com')
      .query('SELECT * FROM mbo_users WHERE email = @email');
    
    if (testUser.recordset.length > 0) {
      console.log('✅ Test user found:', testUser.recordset[0].name);
    } else {
      console.log('❌ Test user not found');
    }

    // Final count
    const finalCount = await pool.request().query('SELECT COUNT(*) as count FROM mbo_users');
    console.log(`\n📊 Final user count: ${finalCount.recordset[0].count}`);
    console.log('🎉 Database test and seeding complete!');

  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

testAndSeedDatabase();
