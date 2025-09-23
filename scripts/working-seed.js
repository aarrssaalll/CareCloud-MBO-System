const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...')

    // Create IT Department  
    const itDept = await prisma.mboDepartment.create({
      data: {
        name: 'Information Technology',
        description: 'IT Department handling software development and infrastructure',
        budget: 1000000
      }
    })

    // Create Operations Department
    const operationsDept = await prisma.mboDepartment.create({
      data: {
        name: 'Operations',
        description: 'Operations Department managing business processes',
        budget: 100000
      }
    })

    console.log('✅ Created/Updated departments')

    // Create Development Team
    const devTeam = await prisma.mboTeam.create({
      data: {
        name: 'Development Team',
        description: 'Software Development Team',
        departmentId: itDept.id
      }
    })

    // Create Operations Team
    const opsTeam = await prisma.mboTeam.create({
      data: {
        name: 'Operations Team',
        description: 'Business Operations Team',
        departmentId: operationsDept.id
      }
    })

    console.log('✅ Created/Updated teams')

    // Create users
    const users = [
      // HR User
      {
        email: 'linda.martinez@carecloud.com',
        name: 'Linda Martinez',
        firstName: 'Linda',
        lastName: 'Martinez',
        role: 'HR',
        title: 'HR Manager',
        salary: 85000,
        bonusAmount: 0
      },
      // IT Manager
      {
        email: 'michael.johnson@carecloud.com',
        name: 'Michael Johnson',
        firstName: 'Michael',
        lastName: 'Johnson',
        role: 'MANAGER',
        title: 'IT Development Manager',
        salary: 120000,
        bonusAmount: 0,
        departmentId: itDept.id,
        teamId: devTeam.id
      },
      // Operations Manager  
      {
        email: 'sarah.thompson@carecloud.com',
        name: 'Sarah Thompson',
        firstName: 'Sarah',
        lastName: 'Thompson',
        role: 'MANAGER',
        title: 'Operations Manager',
        salary: 95000,
        bonusAmount: 0,
        departmentId: operationsDept.id,
        teamId: opsTeam.id
      },
      // IT Employees
      {
        email: 'carlos.martinez@carecloud.com',
        name: 'Carlos Martinez',
        firstName: 'Carlos',
        lastName: 'Martinez',
        role: 'EMPLOYEE',
        title: 'Senior Software Developer',
        salary: 85000,
        bonusAmount: 2500,
        departmentId: itDept.id,
        teamId: devTeam.id
      },
      {
        email: 'emily.rodriguez@carecloud.com',
        name: 'Emily Rodriguez',
        firstName: 'Emily',
        lastName: 'Rodriguez',
        role: 'EMPLOYEE',
        title: 'Full Stack Developer',
        salary: 78000,
        bonusAmount: 2200,
        departmentId: itDept.id,
        teamId: devTeam.id
      },
      {
        email: 'david.brown@carecloud.com',
        name: 'David Brown',
        firstName: 'David',
        lastName: 'Brown',
        role: 'EMPLOYEE',
        title: 'DevOps Engineer',
        salary: 82000,
        bonusAmount: 2800,
        departmentId: itDept.id,
        teamId: devTeam.id
      },
      // Operations Employees
      {
        email: 'jessica.lee@carecloud.com',
        name: 'Jessica Lee',
        firstName: 'Jessica',
        lastName: 'Lee',
        role: 'EMPLOYEE',
        title: 'Business Operations Specialist',
        salary: 62000,
        bonusAmount: 1800,
        departmentId: operationsDept.id,
        teamId: opsTeam.id
      },
      {
        email: 'mark.wilson@carecloud.com',
        name: 'Mark Wilson',
        firstName: 'Mark',
        lastName: 'Wilson',
        role: 'EMPLOYEE',
        title: 'Process Analyst',
        salary: 58000,
        bonusAmount: 1500,
        departmentId: operationsDept.id,
        teamId: opsTeam.id
      }
    ]

    console.log('👥 Creating/Updating users...')

    for (const userData of users) {
      const user = await prisma.mboUser.upsert({
        where: { email: userData.email },
        update: {
          bonusAmount: userData.bonusAmount,
          departmentId: userData.departmentId,
          teamId: userData.teamId,
          salary: userData.salary
        },
        create: userData
      })
      console.log(`✅ Created/Updated: ${user.name} (${user.role}) - Bonus: $${user.bonusAmount}`)
    }

    // Set manager relationships
    const michael = await prisma.mboUser.findFirst({ where: { email: 'michael.johnson@carecloud.com' } })
    const sarah = await prisma.mboUser.findFirst({ where: { email: 'sarah.thompson@carecloud.com' } })

    // Assign IT employees to Michael
    await prisma.mboUser.updateMany({
      where: { 
        departmentId: itDept.id,
        role: 'EMPLOYEE'
      },
      data: { managerId: michael?.id }
    })

    // Assign Operations employees to Sarah
    await prisma.mboUser.updateMany({
      where: { 
        departmentId: operationsDept.id,
        role: 'EMPLOYEE'
      },
      data: { managerId: sarah?.id }
    })

    // Set department managers
    await prisma.mboDepartment.update({
      where: { id: itDept.id },
      data: { managerId: michael?.id }
    })

    await prisma.mboDepartment.update({
      where: { id: operationsDept.id },
      data: { managerId: sarah?.id }
    })

    // Set team leaders
    await prisma.mboTeam.update({
      where: { id: devTeam.id },
      data: { leaderId: michael?.id }
    })

    await prisma.mboTeam.update({
      where: { id: opsTeam.id },
      data: { leaderId: sarah?.id }
    })

    console.log('✅ Set manager and team relationships')

    // Create Carlos's objective
    const carlos = await prisma.mboUser.findFirst({ 
      where: { email: 'carlos.martinez@carecloud.com' } 
    })

    if (carlos && michael) {
      try {
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
            assignedById: michael.id,
            completedAt: new Date()
          }
        })
        console.log('✅ Created Carlos\'s Customer Satisfaction objective')
      } catch (error) {
        console.log('⚠️ Objective may already exist, skipping...')
      }
    }

    // Summary
    const totalUsers = await prisma.mboUser.count()
    const totalEmployees = await prisma.mboUser.count({ where: { role: 'EMPLOYEE' } })
    const totalManagers = await prisma.mboUser.count({ where: { role: 'MANAGER' } })
    const totalHR = await prisma.mboUser.count({ where: { role: 'HR' } })
    const totalObjectives = await prisma.mboObjective.count()

    const employees = await prisma.mboUser.findMany({ 
      where: { role: 'EMPLOYEE' },
      select: { name: true, bonusAmount: true }
    })
    
    const totalBonusBudget = employees.reduce((sum, emp) => sum + (emp.bonusAmount || 0), 0)

    console.log('\n🎉 Database seeded successfully!')
    console.log('📊 Summary:')
    console.log(`   🏢 IT Department: $1,000,000 budget`)
    console.log(`   🏢 Operations Department: $100,000 budget`)
    console.log(`   👥 Total Users: ${totalUsers}`)
    console.log(`   👨‍💼 Employees: ${totalEmployees}`)
    console.log(`   🧑‍💼 Managers: ${totalManagers}`)
    console.log(`   👩‍💼 HR: ${totalHR}`)
    console.log(`   📋 Objectives: ${totalObjectives}`)
    console.log(`   💰 Employee Bonus Budget: $${totalBonusBudget.toLocaleString()}`)

    console.log('\n💰 Employee Bonus Breakdown:')
    employees.forEach(emp => {
      console.log(`   ${emp.name}: $${emp.bonusAmount?.toLocaleString() || 0}`)
    })

  } catch (error) {
    console.error('❌ Error seeding database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedDatabase()