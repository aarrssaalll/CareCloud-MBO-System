import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST() {
  try {
    console.log('🌱 Creating sample data...');

    // Create test users first
    const testUsers = [
      {
        id: 'emp001',
        employeeId: 'EMP001',
        email: 'john.doe@carecloud.com',
        firstName: 'John',
        lastName: 'Doe',
        name: 'John Doe',
        role: 'EMPLOYEE',
        title: 'Software Developer',
        managerId: 'mgr001'
      },
      {
        id: 'mgr001',
        employeeId: 'MGR001',
        email: 'jane.smith@carecloud.com',
        firstName: 'Jane',
        lastName: 'Smith',
        name: 'Jane Smith',
        role: 'MANAGER',
        title: 'Engineering Manager'
      }
    ];

    // Create users (upsert to avoid duplicates)
    for (const userData of testUsers) {
      await prisma.mboUser.upsert({
        where: { id: userData.id },
        update: userData,
        create: userData
      });
    }
    console.log('✅ Created test users');

    // Create test objectives
    const testObjectives = [
      {
        id: 'obj001',
        title: 'Complete Project Alpha',
        description: 'Successfully deliver Project Alpha on time and within budget',
        category: 'Development',
        target: 100,
        current: 75,
        weight: 30,
        status: 'IN_PROGRESS',
        dueDate: new Date('2025-12-31'),
        quarter: 'Q4',
        year: 2025,
        userId: 'emp001',
        assignedById: 'mgr001'
      },
      {
        id: 'obj002',
        title: 'Improve Customer Satisfaction',
        description: 'Achieve 95% customer satisfaction rating',
        category: 'Quality',
        target: 95,
        current: 88,
        weight: 25,
        status: 'ACTIVE',
        dueDate: new Date('2025-12-31'),
        quarter: 'Q4',
        year: 2025,
        userId: 'emp001',
        assignedById: 'mgr001'
      },
      {
        id: 'obj003',
        title: 'Complete Training Program',
        description: 'Finish advanced development training program',
        category: 'Learning',
        target: 5,
        current: 3,
        weight: 15,
        status: 'ACTIVE',
        dueDate: new Date('2025-11-30'),
        quarter: 'Q4',
        year: 2025,
        userId: 'emp001',
        assignedById: 'mgr001'
      }
    ];

    // Create objectives (upsert to avoid duplicates)
    for (const objData of testObjectives) {
      await prisma.mboObjective.upsert({
        where: { id: objData.id },
        update: objData,
        create: objData
      });
    }
    console.log('✅ Created test objectives');

    return NextResponse.json({
      success: true,
      message: 'Sample data created successfully',
      data: {
        usersCreated: testUsers.length,
        objectivesCreated: testObjectives.length
      }
    });

  } catch (error) {
    console.error('❌ Failed to create sample data:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
