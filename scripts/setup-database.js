#!/usr/bin/env node

/**
 * CareCloud MBO System - Database Setup Script
 * 
 * This script helps set up the Microsoft SQL Server database
 * for the CareCloud MBO system.
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 CareCloud MBO System - Database Setup');
console.log('=========================================');

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
const envExamplePath = path.join(process.cwd(), '.env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Created .env file from .env.example');
    console.log('⚠️  Please update the DATABASE_URL in .env file with your SQL Server details');
  } else {
    console.log('❌ No .env.example file found');
  }
} else {
  console.log('✅ .env file already exists');
}

console.log('\n📋 Next Steps:');
console.log('1. Update your .env file with SQL Server connection details');
console.log('2. Run: npx prisma generate');
console.log('3. Run: npx prisma db push');
console.log('4. Optional: Run the SQL script in DATABASE_SETUP.md to create sample data');

console.log('\n📖 Database Connection Examples:');
console.log('Windows Authentication:');
console.log('DATABASE_URL="sqlserver://your_server:1433;database=CareCloudMBO;integratedSecurity=true;encrypt=true;trustServerCertificate=true"');
console.log('\nSQL Server Authentication:');
console.log('DATABASE_URL="sqlserver://your_server:1433;database=CareCloudMBO;user=username;password=password;encrypt=true;trustServerCertificate=true"');
console.log('\nAzure SQL Database:');
console.log('DATABASE_URL="sqlserver://your_server.database.windows.net:1433;database=CareCloudMBO;user=username@server;password=password;encrypt=true"');

console.log('\n🔧 Common SQL Server Ports:');
console.log('- Default: 1433');
console.log('- Named Instance: Usually dynamic (check SQL Server Configuration Manager)');

console.log('\n📚 For detailed setup instructions, see DATABASE_SETUP.md');
