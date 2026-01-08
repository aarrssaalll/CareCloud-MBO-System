const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  try {
    const users = await prisma.user.findMany({ 
      select: { id: true, name: true, role: true } 
    });
    console.log('Users in database:', users.length);
    
    if (users.length > 0) {
      console.log('Sample users:');
      users.slice(0, 3).forEach(user => {
        console.log('- ' + user.name + ' (' + user.role + ') - ID: ' + user.id);
      });
    }
    
    const objectives = await prisma.mboObjective.findMany({ 
      select: { 
        id: true, 
        title: true, 
        userId: true, 
        status: true,
        assignedById: true
      } 
    });
    console.log('Objectives in database:', objectives.length);
    
    if (objectives.length > 0) {
      console.log('Sample objectives:');
      objectives.slice(0, 5).forEach(obj => {
        console.log('- ' + obj.title + ' (User: ' + obj.userId + ', Status: ' + obj.status + ')');
      });
    } else {
      console.log('No objectives found in database!');
    }
    
  } catch (error) {
    console.error('Database error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
