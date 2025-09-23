const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const employees = await prisma.user.findMany({
      where: { role: 'EMPLOYEE' },
      take: 3
    });
    console.log('Employee users:', JSON.stringify(employees, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
