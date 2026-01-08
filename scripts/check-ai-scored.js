const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAIScoredObjectives() {
  try {
    // Check Sarah's manager ID
    const sarah = await prisma.mboUser.findUnique({
      where: { email: 'sarah.johnson@carecloud.com' },
      select: { id: true, name: true }
    });
    
    console.log('Sarah Johnson ID:', sarah?.id);
    
    // Check AI_SCORED objectives
    const aiScored = await prisma.mboObjective.findMany({
      where: { status: 'AI_SCORED' },
      select: {
        id: true,
        title: true,
        status: true,
        user: { 
          select: { 
            name: true, 
            managerId: true,
            manager: { select: { name: true } }
          } 
        }
      }
    });
    
    console.log('Total AI_SCORED objectives:', aiScored.length);
    console.log('\nBy manager:');
    const byManager = {};
    aiScored.forEach(obj => {
      const mgr = obj.user.manager?.name || 'No manager';
      if (!byManager[mgr]) byManager[mgr] = 0;
      byManager[mgr]++;
    });
    
    Object.entries(byManager).forEach(([mgr, count]) => {
      console.log(`  ${mgr}: ${count} objectives`);
    });
    
    // Check which managers have AI_SCORED objectives
    console.log('\nManagers with AI_SCORED objectives:');
    const managers = await prisma.mboUser.findMany({
      where: {
        role: 'MANAGER',
        subordinates: {
          some: {
            objectives: {
              some: {
                status: 'AI_SCORED'
              }
            }
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });
    
    managers.forEach(mgr => {
      console.log(`  ${mgr.name} (${mgr.email})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAIScoredObjectives();
