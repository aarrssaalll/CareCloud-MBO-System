const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function restorePreviousState() {
  try {
    console.log('🔄 Restoring database to previous state...')

    // Create IT Department  
    const itDept = await prisma.mboDepartment.create({
      data: {
        name: 'Information Technology',
        description: 'IT Department',
        budget: 500000
      }
    })

    // Create Development Team
    const devTeam = await prisma.mboTeam.create({
      data: {
        name: 'Development Team',
        description: 'Software Development',
        departmentId: itDept.id
      }
    })

    console.log('✅ Created department and team')

    // Create users with the exact data that was there before
    const users = [
      // HR User
      {
        name: 'Linda Martinez',
        email: 'linda.martinez@carecloud.com',
        role: 'HR',
        firstName: 'Linda',
        lastName: 'Martinez',
        title: 'HR Manager',
        salary: 75000,
        departmentId: itDept.id
      },
      // Manager
      {
        name: 'Michael Johnson',
        email: 'michael.johnson@carecloud.com',
        role: 'MANAGER',
        firstName: 'Michael',
        lastName: 'Johnson',
        title: 'Development Manager',
        salary: 95000,
        departmentId: itDept.id,
        teamId: devTeam.id
      },
      // Employee - Carlos
      {
        name: 'Carlos Martinez',
        email: 'carlos.martinez@carecloud.com',
        role: 'EMPLOYEE',
        firstName: 'Carlos',
        lastName: 'Martinez',
        title: 'Software Developer',
        salary: 65000,
        departmentId: itDept.id,
        teamId: devTeam.id
      }
    ]

    for (const userData of users) {
      const user = await prisma.mboUser.create({
        data: userData
      })
      console.log(`✅ Created: ${user.name} (${user.role})`)
    }

    // Set manager relationship
    const manager = await prisma.mboUser.findFirst({ where: { role: 'MANAGER' } })
    const carlos = await prisma.mboUser.findFirst({ 
      where: { email: 'carlos.martinez@carecloud.com' } 
    })

    await prisma.mboUser.update({
      where: { id: carlos.id },
      data: { managerId: manager.id }
    })

    // Set department manager
    await prisma.mboDepartment.update({
      where: { id: itDept.id },
      data: { managerId: manager.id }
    })

    // Set team leader
    await prisma.mboTeam.update({
      where: { id: devTeam.id },
      data: { leaderId: manager.id }
    })

    console.log('✅ Set manager relationships')

    // Create Carlos's objective (the one that was there before)
    await prisma.mboObjective.create({
      data: {
        title: 'Customer Satisfaction',
        description: 'Improve customer satisfaction ratings',
        category: 'Performance',
        target: 95,
        current: 92,
        weight: 1.0,
        status: 'COMPLETED',
        dueDate: new Date('2024-12-31'),
        quarter: 'Q4',
        year: 2024,
        userId: carlos.id,
        assignedById: manager.id,
        completedAt: new Date(),
        workflowStatus: 'COMPLETED' // Add the workflow status
      }
    })

    console.log('✅ Created Carlos\'s Customer Satisfaction objective')

    const totalUsers = await prisma.mboUser.count()
    const totalObjectives = await prisma.mboObjective.count()

    console.log('\n🎉 Database restored to previous state!')
    console.log('📊 Summary:')
    console.log(`   👥 Users: ${totalUsers} (1 HR, 1 Manager, 1 Employee)`)
    console.log(`   📋 Objectives: ${totalObjectives} (Carlos has 1 completed objective)`)
    console.log(`   🏢 Departments: 1 (IT Department)`)
    console.log(`   👥 Teams: 1 (Development Team)`)

  } catch (error) {
    console.error('❌ Error restoring database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

restorePreviousState()