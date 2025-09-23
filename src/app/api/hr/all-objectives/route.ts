import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    console.log('🔍 Fetching all objectives for HR view');

    // Fetch all objectives with user information
    const objectives = await prisma.mboObjective.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            title: true,
            departmentId: true
          }
        },
        assignedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            title: true
          }
        },
        reviews: true
      },
      orderBy: [
        { year: 'desc' },
        { quarter: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    console.log(`📋 Found ${objectives.length} total objectives across organization`);

    // Calculate statistics
    const stats = {
      total: objectives.length,
      active: objectives.filter(obj => obj.status === 'ACTIVE').length,
      inProgress: objectives.filter(obj => obj.status === 'IN_PROGRESS').length,
      completed: objectives.filter(obj => obj.status === 'COMPLETED').length,
      overdue: objectives.filter(obj => 
        new Date(obj.dueDate) < new Date() && obj.status !== 'COMPLETED'
      ).length
    };

    return NextResponse.json({
      success: true,
      data: objectives,
      stats
    });

  } catch (error) {
    console.error('❌ Error fetching all objectives:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
