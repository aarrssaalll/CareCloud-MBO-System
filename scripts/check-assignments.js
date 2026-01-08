const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkObjectiveAssignments() {
  try {
    console.log('📊 Checking current objective assignments...\n');
    
    // Get all employees with their objectives
    const employees = await prisma.mboUser.findMany({
      where: { role: 'EMPLOYEE' },
      include: {
        objectives: {
          select: {
            id: true,
            title: true,
            status: true,
            current: true,
            target: true,
            weight: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        manager: {
          select: {
            name: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    console.log(`Found ${employees.length} employees\n`);

    employees.forEach(emp => {
      const name = emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
      const managerName = emp.manager ? (emp.manager.name || `${emp.manager.firstName || ''} ${emp.manager.lastName || ''}`.trim()) : 'No Manager';
      
      console.log(`👤 ${name}`);
      console.log(`   Manager: ${managerName}`);
      console.log(`   Total Objectives: ${emp.objectives.length}`);
      
      if (emp.objectives.length > 0) {
        emp.objectives.forEach((obj, index) => {
          const progress = obj.current && obj.target ? Math.round((obj.current / obj.target) * 100) : 0;
          const created = new Date(obj.createdAt).toLocaleDateString();
          console.log(`   ${index + 1}. ${obj.title}`);
          console.log(`      Status: ${obj.status} | Progress: ${progress}% | Weight: ${obj.weight}% | Created: ${created}`);
        });
      } else {
        console.log('   ❌ No objectives assigned');
      }
      console.log('');
    });

    // Summary statistics
    const totalObjectives = await prisma.mboObjective.count();
    const employeesWithObjectives = employees.filter(emp => emp.objectives.length > 0).length;
    const employeesWithoutObjectives = employees.filter(emp => emp.objectives.length === 0).length;
    
    console.log(`📈 SUMMARY:`);
    console.log(`   Total Employees: ${employees.length}`);
    console.log(`   Employees with Objectives: ${employeesWithObjectives}`);
    console.log(`   Employees without Objectives: ${employeesWithoutObjectives}`);
    console.log(`   Total Objectives: ${totalObjectives}`);
    console.log(`   Average per Employee: ${employees.length > 0 ? (totalObjectives / employees.length).toFixed(1) : 0}`);

    // Check objectives by status
    const objectiveStats = await prisma.mboObjective.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    console.log(`\n📊 OBJECTIVES BY STATUS:`);
    objectiveStats.forEach(stat => {
      console.log(`   ${stat.status}: ${stat._count.status}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkObjectiveAssignments();
