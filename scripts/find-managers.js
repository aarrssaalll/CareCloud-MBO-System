const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findManagersWithEmployees() {
  const managers = await prisma.mboUser.findMany({
    where: { role: 'MANAGER' },
    include: { managedUsers: true }
  });
  
  managers.forEach(mgr => {
    console.log(`${mgr.name}: ${mgr.managedUsers.length} employees`);
    if (mgr.managedUsers.length > 0) {
      mgr.managedUsers.forEach(emp => console.log(`  - ${emp.name}`));
    }
  });
  
  await prisma.$disconnect();
}

findManagersWithEmployees();
