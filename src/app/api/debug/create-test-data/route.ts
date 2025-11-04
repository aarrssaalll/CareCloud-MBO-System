import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Creating test data for senior management dashboard');
    
    // Find or create a senior manager
    let seniorManager = await prisma.mboUser.findFirst({
      where: {
        role: {
          in: ['SENIOR_MANAGEMENT', 'senior-management']
        }
      }
    });
    
    if (!seniorManager) {
      // Create a test senior manager
      seniorManager = await prisma.mboUser.create({
        data: {
          email: 'senior.manager@carecloud.com',
          firstName: 'Senior',
          lastName: 'Manager',
          name: 'Senior Manager',
          role: 'SENIOR_MANAGEMENT',
          title: 'Senior Manager',
          employeeId: 'SM001'
        }
      });
      console.log('✅ Created senior manager:', seniorManager.id);
    }
    
    // Find or create managers under this senior manager
    let managers = await prisma.mboUser.findMany({
      where: {
        managerId: seniorManager.id,
        role: {
          in: ['MANAGER', 'manager']
        }
      }
    });
    
    if (managers.length === 0) {
      // Create test managers
      const manager1 = await prisma.mboUser.create({
        data: {
          email: 'manager1@carecloud.com',
          firstName: 'Manager',
          lastName: 'One',
          name: 'Manager One',
          role: 'MANAGER',
          title: 'Team Manager',
          employeeId: 'M001',
          managerId: seniorManager.id
        }
      });
      
      const manager2 = await prisma.mboUser.create({
        data: {
          email: 'manager2@carecloud.com',
          firstName: 'Manager',
          lastName: 'Two',
          name: 'Manager Two',
          role: 'MANAGER',
          title: 'Team Manager',
          employeeId: 'M002',
          managerId: seniorManager.id
        }
      });
      
      managers = [manager1, manager2];
      console.log('✅ Created managers:', managers.length);
    }
    
    // Create test objectives for these managers
    const objectivesCreated = [];
    for (const manager of managers) {
      const existingObjectives = await prisma.mboManagerObjective.findMany({
        where: {
          managerId: manager.id,
          assignedBySeniorManagerId: seniorManager.id
        }
      });
      
      if (existingObjectives.length === 0) {
        const objective = await prisma.mboManagerObjective.create({
          data: {
            title: `Test Objective for ${manager.name}`,
            description: `This is a test objective assigned to ${manager.name}`,
            target: 'Complete project successfully',
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            weight: 0.25,
            status: 'ASSIGNED',
            managerId: manager.id,
            assignedBySeniorManagerId: seniorManager.id
          }
        });
        objectivesCreated.push(objective);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Test data created successfully',
      data: {
        seniorManager: seniorManager,
        managers: managers,
        objectivesCreated: objectivesCreated.length
      }
    });
    
  } catch (error) {
    console.error('❌ Error creating test data:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create test data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}