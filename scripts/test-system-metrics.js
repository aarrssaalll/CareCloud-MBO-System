const { PrismaClient } = require('@prisma/client');

async function testSystemMetrics() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testing system metrics calculations...');
    
    // Test basic counts
    const totalEmployees = await prisma.mboUser.count({
      where: {
        role: {
          in: ['EMPLOYEE', 'MANAGER']
        }
      }
    });
    
    const totalObjectives = await prisma.mboObjective.count();
    
    const departmentCount = await prisma.mboDepartment.count();
    
    console.log('📊 Basic counts:');
    console.log(`- Total Employees: ${totalEmployees}`);
    console.log(`- Total Objectives: ${totalObjectives}`);
    console.log(`- Department Count: ${departmentCount}`);
    
    // Test the API endpoint
    console.log('\n🔍 Testing API endpoint...');
    const response = await fetch('http://localhost:3000/api/system/metrics');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Response:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ API Error:', response.status, response.statusText);
      const errorText = await response.text();
      console.log('Error details:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSystemMetrics();