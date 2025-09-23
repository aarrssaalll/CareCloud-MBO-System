const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "sqlserver://2F-WKS-020\\MSSQLSERVER02;database=CareCloudMBO;integratedSecurity=true;trustServerCertificate=true"
    }
  }
});

async function testTeamManagement() {
  try {
    console.log('🔍 Testing Team Management Data...\n');
    
    // Get all managers
    const managers = await prisma.$queryRaw`
      SELECT id, name, email, role, title 
      FROM mbo_users 
      WHERE role IN ('MANAGER', 'SENIOR_MANAGEMENT')
    `;
    
    console.log(`📊 Found ${managers.length} managers in the system:\n`);
    
    for (const manager of managers) {
      console.log(`👤 Manager: ${manager.name} (${manager.email})`);
      console.log(`   Role: ${manager.role} | Title: ${manager.title}`);
      
      // Get employees reporting to this manager
      const employees = await prisma.$queryRaw`
        SELECT u.id, u.name, u.email, u.role, u.title,
               d.name as departmentName
        FROM mbo_users u
        LEFT JOIN mbo_departments d ON u.departmentId = d.id
        WHERE u.managerId = ${manager.id}
      `;
      
      console.log(`   Team Size: ${employees.length} employees\n`);
      
      if (employees.length > 0) {
        employees.forEach(emp => {
          console.log(`     └─ ${emp.name} (${emp.role}) - ${emp.departmentName || 'No dept'}`);
        });
        console.log('');
        
        // Test the API for this manager
        console.log(`   🚀 API Test: /api/manager/team?managerId=${manager.id}`);
        try {
          const fetch = require('node-fetch');
          const response = await fetch(`http://localhost:3002/api/manager/team?managerId=${manager.id}`);
          const data = await response.json();
          
          if (data.success) {
            console.log(`   ✅ API Response: ${data.teamMembers.length} team members found`);
          } else {
            console.log(`   ❌ API Error: ${data.error}`);
          }
        } catch (apiError) {
          console.log(`   ⚠️  API Test failed: ${apiError.message}`);
        }
      } else {
        console.log(`     └─ No employees assigned to this manager`);
      }
      
      console.log('─'.repeat(60));
    }
    
    // Check if there are employees without managers
    const orphanEmployees = await prisma.$queryRaw`
      SELECT id, name, email, role 
      FROM mbo_users 
      WHERE role = 'EMPLOYEE' AND (managerId IS NULL OR managerId = '')
    `;
    
    if (orphanEmployees.length > 0) {
      console.log(`⚠️  Found ${orphanEmployees.length} employees without managers:`);
      orphanEmployees.forEach(emp => {
        console.log(`   - ${emp.name} (${emp.email})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error testing team management:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testTeamManagement();
