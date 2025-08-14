#!/usr/bin/env node

/**
 * Test database connection and verify MBO tables exist
 */

require('dotenv').config();

async function testConnection() {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test if MBO tables exist by counting users
    try {
      const userCount = await prisma.mboUser.count();
      console.log(`✅ MBO tables found! Users in mbo_users: ${userCount}`);
      
      // Test objectives table
      const objectiveCount = await prisma.mboObjective.count();
      console.log(`✅ Objectives table accessible! Records: ${objectiveCount}`);
      
      console.log('\n🎉 Database setup is complete and working!');
      console.log('You can now start your Next.js application.');
      
    } catch (tableError) {
      console.log('❌ MBO tables not found. Please run the SQL script first:');
      console.log('   Execute sql/add-mbo-tables.sql in your database');
      console.log('   Or run: npm run db:push');
    }
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error:', error.message);
    console.log('\n🔧 Check your DATABASE_URL in .env file');
    console.log('Example: DATABASE_URL="sqlserver://localhost:1433;database=YourDB;user=username;password=password;encrypt=true;trustServerCertificate=true"');
  }
}

testConnection();
