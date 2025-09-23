const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function validateSchemaAlignment() {
  try {
    console.log('🔍 Validating data structure against final schema...\n');

    // Check Departments
    console.log('📁 DEPARTMENTS:');
    const departments = await prisma.mboDepartment.findMany({
      include: {
        manager: true,
        teams: true,
        users: true
      }
    });

    departments.forEach(dept => {
      console.log(`✅ ${dept.name}`);
      console.log(`   - ID: ${dept.id}`);
      console.log(`   - Budget: $${dept.budget?.toLocaleString() || 'N/A'}`);
      console.log(`   - Manager: ${dept.manager?.name || 'NOT SET'}`);
      console.log(`   - Teams: ${dept.teams.length}`);
      console.log(`   - Users: ${dept.users.length}`);
      console.log('');
    });

    // Check Teams
    console.log('👥 TEAMS:');
    const teams = await prisma.mboTeam.findMany({
      include: {
        department: true,
        leader: true,
        users: true
      }
    });

    teams.forEach(team => {
      console.log(`✅ ${team.name}`);
      console.log(`   - ID: ${team.id}`);
      console.log(`   - Department: ${team.department.name}`);
      console.log(`   - Leader: ${team.leader?.name || 'NOT SET'}`);
      console.log(`   - Members: ${team.users.length}`);
      console.log('');
    });

    // Check Users
    console.log('👤 USERS:');
    const users = await prisma.mboUser.findMany({
      include: {
        department: true,
        team: true,
        manager: true,
        managedDepartments: true,
        ledTeams: true,
        objectives: true
      },
      orderBy: { employeeId: 'asc' }
    });

    users.forEach(user => {
      console.log(`✅ ${user.name} (${user.employeeId})`);
      console.log(`   - Email: ${user.email}`);
      console.log(`   - Role: ${user.role}`);
      console.log(`   - Title: ${user.title}`);
      console.log(`   - Department: ${user.department?.name || 'NOT SET'}`);
      console.log(`   - Team: ${user.team?.name || 'NOT SET'}`);
      console.log(`   - Manager: ${user.manager?.name || 'NOT SET'}`);
      console.log(`   - Manages Departments: ${user.managedDepartments.length}`);
      console.log(`   - Leads Teams: ${user.ledTeams.length}`);
      console.log(`   - Objectives: ${user.objectives.length}`);
      console.log(`   - Salary: $${user.salary?.toLocaleString() || 'N/A'}`);
      console.log(`   - Bonus Amount: $${user.bonusAmount?.toLocaleString() || 'N/A'}`);
      console.log('');
    });

    // Schema Validation Summary
    console.log('📊 SCHEMA VALIDATION SUMMARY:');
    console.log('');

    // Required field validation
    console.log('🔍 REQUIRED FIELD VALIDATION:');
    
    // Check for users without required fields
    const usersWithoutEmail = users.filter(u => !u.email);
    const usersWithoutName = users.filter(u => !u.name);
    const usersWithoutRole = users.filter(u => !u.role);
    
    if (usersWithoutEmail.length > 0) {
      console.log(`❌ Users missing email: ${usersWithoutEmail.length}`);
    } else {
      console.log(`✅ All users have email addresses`);
    }
    
    if (usersWithoutName.length > 0) {
      console.log(`❌ Users missing name: ${usersWithoutName.length}`);
    } else {
      console.log(`✅ All users have names`);
    }
    
    if (usersWithoutRole.length > 0) {
      console.log(`❌ Users missing role: ${usersWithoutRole.length}`);
    } else {
      console.log(`✅ All users have roles`);
    }

    // Relationship validation
    console.log('\n🔗 RELATIONSHIP VALIDATION:');
    
    // Check department managers
    const deptsWithoutManagers = departments.filter(d => !d.managerId);
    console.log(`Departments without managers: ${deptsWithoutManagers.length}`);
    
    // Check teams without leaders
    const teamsWithoutLeaders = teams.filter(t => !t.leaderId);
    console.log(`Teams without leaders: ${teamsWithoutLeaders.length}`);
    
    // Check users without departments
    const usersWithoutDepartments = users.filter(u => !u.departmentId);
    console.log(`Users without departments: ${usersWithoutDepartments.length}`);

    // Role distribution
    console.log('\n👨‍💼 ROLE DISTRIBUTION:');
    const roleStats = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(roleStats).forEach(([role, count]) => {
      console.log(`${role}: ${count}`);
    });

    // Data integrity checks
    console.log('\n🔒 DATA INTEGRITY CHECKS:');
    
    // Check for orphaned relationships
    const usersWithInvalidDeptId = users.filter(u => u.departmentId && !departments.find(d => d.id === u.departmentId));
    const usersWithInvalidTeamId = users.filter(u => u.teamId && !teams.find(t => t.id === u.teamId));
    
    if (usersWithInvalidDeptId.length > 0) {
      console.log(`❌ Users with invalid department IDs: ${usersWithInvalidDeptId.length}`);
    } else {
      console.log(`✅ All user department relationships are valid`);
    }
    
    if (usersWithInvalidTeamId.length > 0) {
      console.log(`❌ Users with invalid team IDs: ${usersWithInvalidTeamId.length}`);
    } else {
      console.log(`✅ All user team relationships are valid`);
    }

    // Next steps recommendations
    console.log('\n📋 NEXT STEPS RECOMMENDATIONS:');
    
    if (teamsWithoutLeaders.length > 0) {
      console.log('🔸 Add team leaders for teams without leadership');
    }
    
    if (usersWithoutDepartments.length > 0) {
      console.log('🔸 Assign departments to users without department assignment');
    }
    
    if (users.filter(u => u.role === 'EMPLOYEE').length === 0) {
      console.log('🔸 Add regular employees to teams');
    }
    
    if (users.filter(u => u.role === 'MANAGER' && u.title?.includes('Team Lead')).length === 0) {
      console.log('🔸 Add team leads/middle managers');
    }
    
    console.log('🔸 Create objectives for employees');
    console.log('🔸 Set up approval workflows');
    console.log('🔸 Add notifications and reviews');

  } catch (error) {
    console.error('❌ Error validating schema alignment:', error);
  } finally {
    await prisma.$disconnect();
  }
}

validateSchemaAlignment();