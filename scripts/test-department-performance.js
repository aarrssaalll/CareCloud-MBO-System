const { PrismaClient } = require('@prisma/client');

async function testDepartmentPerformance() {
  console.log('🧪 Testing department performance API...');
  
  try {
    const response = await fetch('http://localhost:3000/api/system/metrics');
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ API Response Success!');
      console.log('\n📊 Department Performance:');
      
      data.data.departmentPerformance.forEach(dept => {
        console.log(`\n🏢 ${dept.departmentName}:`);
        console.log(`   👥 Employees: ${dept.employeeCount}`);
        console.log(`   📋 Total Objectives: ${dept.totalObjectives}`);
        console.log(`   ✅ Completed: ${dept.completedObjectives}`);
        console.log(`   📈 Completion Rate: ${dept.completionRate}%`);
        console.log(`   ⭐ Average Score: ${dept.averageScore}`);
      });
      
      console.log('\n📈 System Metrics:');
      console.log(`   👥 Total Employees: ${data.data.systemMetrics.totalEmployees}`);
      console.log(`   📋 Total Objectives: ${data.data.systemMetrics.totalObjectives}`);
      console.log(`   ⭐ Average Score: ${data.data.systemMetrics.averageScore}`);
      
    } else {
      console.error('❌ API Error:', data.error);
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

testDepartmentPerformance();