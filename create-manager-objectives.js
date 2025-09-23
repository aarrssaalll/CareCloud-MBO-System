const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createManagerObjectives() {
  try {
    console.log('🎯 CREATING MANAGER-LEVEL OBJECTIVES\n');
    console.log('='.repeat(50));
    
    // Get all managers
    const managers = await prisma.mboUser.findMany({
      where: {
        role: 'MANAGER'
      },
      include: {
        manager: {
          select: {
            id: true,
            name: true
          }
        },
        department: {
          select: {
            name: true
          }
        }
      }
    });

    console.log(`👔 Found ${managers.length} managers to create objectives for:`);
    managers.forEach(mgr => {
      console.log(`  - ${mgr.name} (${mgr.department?.name || 'No Department'})`);
    });

    const managerObjectives = [
      // Strategic Leadership Objectives
      {
        title: "Team Performance Excellence",
        description: "Achieve 90% average team performance score and improve employee engagement",
        category: "Leadership",
        target: 90,
        current: 0,
        weight: 2.0,
        quarter: "Q3",
        year: 2025,
        dueDate: new Date('2025-09-30')
      },
      {
        title: "Process Improvement Initiative",
        description: "Implement process improvements resulting in 15% efficiency gain",
        category: "Operational Excellence",
        target: 15,
        current: 0,
        weight: 1.5,
        quarter: "Q3",
        year: 2025,
        dueDate: new Date('2025-09-30')
      },
      {
        title: "Budget Management",
        description: "Maintain department budget within 5% variance",
        category: "Financial",
        target: 5,
        current: 0,
        weight: 1.5,
        quarter: "Q3",
        year: 2025,
        dueDate: new Date('2025-09-30')
      },
      {
        title: "Strategic Planning Execution",
        description: "Complete 100% of strategic initiatives assigned to department",
        category: "Strategic",
        target: 100,
        current: 0,
        weight: 2.0,
        quarter: "Q3",
        year: 2025,
        dueDate: new Date('2025-09-30')
      }
    ];

    console.log('\n📝 Creating manager objectives...');

    let objectivesCreated = 0;

    for (const manager of managers) {
      // Each manager gets 2-3 random objectives
      const objectiveCount = Math.floor(Math.random() * 2) + 2; // 2-3 objectives
      const selectedObjectives = managerObjectives
        .sort(() => 0.5 - Math.random())
        .slice(0, objectiveCount);

      for (const objTemplate of selectedObjectives) {
        // Customize objective title for the specific manager
        const customTitle = `${objTemplate.title} - ${manager.name}`;
        
        const objective = await prisma.mboObjective.create({
          data: {
            title: customTitle,
            description: objTemplate.description,
            category: objTemplate.category,
            target: objTemplate.target,
            current: Math.floor(Math.random() * (objTemplate.target * 0.8)), // Some random progress
            weight: objTemplate.weight,
            status: Math.random() > 0.3 ? 'ACTIVE' : 'COMPLETED', // 70% active, 30% completed
            workflowStatus: 'ACTIVE',
            quarter: objTemplate.quarter,
            year: objTemplate.year,
            dueDate: objTemplate.dueDate,
            userId: manager.id,
            assignedById: manager.manager?.id || null // Assigned by their manager or self-assigned
          }
        });

        console.log(`  ✅ Created: "${customTitle}" for ${manager.name}`);
        objectivesCreated++;
      }
    }

    // Also create some HR and Senior Management objectives
    console.log('\n🏢 Creating HR and Senior Management objectives...');

    const hrUsers = await prisma.mboUser.findMany({
      where: {
        role: { in: ['HR', 'SENIOR_MANAGEMENT'] }
      }
    });

    const executiveObjectives = [
      {
        title: "Organizational Performance Metrics",
        description: "Achieve company-wide performance targets and KPIs",
        category: "Strategic",
        target: 95,
        weight: 3.0
      },
      {
        title: "Employee Satisfaction Initiative",
        description: "Maintain employee satisfaction score above 85%",
        category: "HR",
        target: 85,
        weight: 2.0
      },
      {
        title: "Compliance and Risk Management",
        description: "Ensure 100% compliance with regulatory requirements",
        category: "Governance",
        target: 100,
        weight: 2.5
      },
      {
        title: "Digital Transformation Goals",
        description: "Complete digital transformation milestones",
        category: "Technology",
        target: 90,
        weight: 2.0
      }
    ];

    for (const hrUser of hrUsers) {
      const objectiveTemplate = executiveObjectives[Math.floor(Math.random() * executiveObjectives.length)];
      
      const objective = await prisma.mboObjective.create({
        data: {
          title: `${objectiveTemplate.title} - ${hrUser.name}`,
          description: objectiveTemplate.description,
          category: objectiveTemplate.category,
          target: objectiveTemplate.target,
          current: Math.floor(Math.random() * (objectiveTemplate.target * 0.7)),
          weight: objectiveTemplate.weight,
          status: Math.random() > 0.5 ? 'ACTIVE' : 'COMPLETED',
          workflowStatus: 'ACTIVE',
          quarter: 'Q3',
          year: 2025,
          dueDate: new Date('2025-09-30'),
          userId: hrUser.id,
          assignedById: null // Self-assigned for executives
        }
      });

      console.log(`  ✅ Created: "${objectiveTemplate.title}" for ${hrUser.name} (${hrUser.role})`);
      objectivesCreated++;
    }

    console.log(`\n🎉 Successfully created ${objectivesCreated} manager/executive objectives!`);

    // Show updated distribution
    console.log('\n📊 Updated Objective Distribution by Role:');
    const roleStats = await prisma.mboUser.groupBy({
      by: ['role'],
      _count: {
        objectives: true
      }
    });

    for (const stat of roleStats) {
      console.log(`  ${stat.role}: ${stat._count.objectives} objectives`);
    }

    console.log('\n✅ Manager objectives creation completed!');
    
  } catch (error) {
    console.error('❌ Error creating manager objectives:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createManagerObjectives();
