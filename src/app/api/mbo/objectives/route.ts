import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const assignerId = searchParams.get('assignerId');

    console.log('🔍 Fetching objectives for:', userId ? `user ${userId}` : `assigner ${assignerId}`);
    console.log('🔗 Database connection status: Attempting to connect...');

    let objectives;

    if (userId) {
      console.log('🔍 Received userId:', userId);
      
      // First check if user exists
      const user = await prisma.mboUser.findUnique({
        where: { id: userId }
      });
      
      console.log('👤 User found:', user ? user.name : 'User not found');
      
      objectives = await prisma.mboObjective.findMany({
        where: { 
          userId
          // Show all objectives assigned to this user
        },
        include: {
          assignedBy: true,
        }
      });
      console.log('📋 Query results for userId', userId, ':', objectives.length, 'objectives found');
      console.log('📋 First objective details:', objectives[0] ? {
        id: objectives[0].id,
        title: objectives[0].title,
        status: objectives[0].status
      } : 'No objectives');
    } else if (assignerId) {
      objectives = await prisma.mboObjective.findMany({
        where: { assignedById: assignerId },
        include: {
          user: true,
          assignedBy: true,
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'User ID or Assigner ID is required',
      }, { status: 400 });
    }

    console.log('Objectives fetched from database:', objectives);
    console.log('Received userId:', userId);
    console.log('Query results:', objectives);

    return NextResponse.json({
      success: true,
      data: objectives,
    });
  } catch (error) {
    console.error('Error fetching objectives:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch objectives',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const objective = await request.json();

    const createdObjective = await prisma.mboObjective.create({
      data: objective,
    });

    // Create approval request for the objective
    if (objective.assignedById) {
      await prisma.mboApproval.create({
        data: {
          type: 'OBJECTIVE',
          entityId: createdObjective.id,
          status: 'PENDING',
          approverId: objective.assignedById,
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Objective created successfully',
      data: { id: createdObjective.id },
    });
  } catch (error) {
    console.error('Error creating objective:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create objective',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { objectiveId, current } = await request.json();

    if (!objectiveId || current === undefined) {
      return NextResponse.json({
        success: false,
        message: 'Objective ID and current progress are required',
      }, { status: 400 });
    }

    console.log('🔄 Updating objective progress:', objectiveId, current);

    await prisma.mboObjective.update({
      where: { id: objectiveId },
      data: { current }
    });

    return NextResponse.json({
      success: true,
      message: 'Objective progress updated successfully',
    });
  } catch (error) {
    console.error('Error updating objective:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update objective',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
