import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch manager's objectives
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Manager: Fetching manager objectives');
    // Note: Authentication handled at frontend level for consistency with other APIs

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const managerId = searchParams.get('managerId');

    if (!managerId) {
      return NextResponse.json({ success: false, error: 'Manager ID is required' }, { status: 400 });
    }

    // Build where clause
    const whereClause: any = {
      managerId: managerId
    };
    
    if (status && status !== 'all') {
      whereClause.status = status.toUpperCase();
    }

    // Get manager's objectives
    const objectives = await prisma.mboManagerObjective.findMany({
      where: whereClause,
      include: {
        assignedBySeniorManager: {
          select: {
            id: true,
            name: true,
            title: true,
            email: true
          }
        },
        manager: {
          select: {
            id: true,
            name: true,
            title: true
          }
        }
      },
      orderBy: [
        { status: 'asc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    // Format objectives for frontend
    const formattedObjectives = objectives.map((obj: any) => ({
      id: obj.id,
      title: obj.title,
      description: obj.description,
      category: obj.category,
      target: obj.target,
      current: obj.current || 0,
      weight: obj.weight || 0, // Keep as decimal - frontend will convert to percentage
      status: obj.status,
      dueDate: obj.dueDate,
      quarter: obj.quarter,
      year: obj.year,
      progress: obj.target > 0 ? ((obj.current || 0) / obj.target) * 100 : 0,
      
      // Timestamps
      assignedAt: obj.assignedAt,
      startedAt: obj.startedAt,
      completedAt: obj.completedAt,
      managerSubmittedAt: obj.managerSubmittedAt,
      
      // Manager submission data
      managerRemarks: obj.managerRemarks,
      managerEvidence: obj.managerEvidence,
      managerDigitalSignature: obj.managerDigitalSignature,
      
      // Assignment details
      assignedBy: {
        id: obj.assignedBySeniorManager.id,
        name: obj.assignedBySeniorManager.name,
        title: obj.assignedBySeniorManager.title,
        email: obj.assignedBySeniorManager.email
      },
      
      // AI and review data (if available)
      aiScore: obj.aiScore,
      aiComments: obj.aiComments,
      seniorManagerScore: obj.seniorManagerScore,
      seniorManagerComments: obj.seniorManagerComments,
      finalScore: obj.finalScore
    }));

    return NextResponse.json({
      success: true,
      objectives: formattedObjectives
    });

  } catch (error) {
    console.error('Error fetching manager objectives:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch objectives',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Update objective progress
export async function PUT(request: NextRequest) {
  try {
    console.log('🔄 Manager: Updating manager objective');
    // Note: Authentication handled at frontend level for consistency with other APIs

    const body = await request.json();
    const { objectiveId, current, remarks, managerId } = body;

    if (!objectiveId || current === undefined || !managerId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: objectiveId, current, managerId' 
      }, { status: 400 });
    }

    // Verify the objective belongs to this manager and can be updated
    const objective = await prisma.mboManagerObjective.findFirst({
      where: {
        id: objectiveId,
        managerId: managerId,
        status: {
          in: ['ASSIGNED', 'IN_PROGRESS']
        }
      },
      include: {
        manager: {
          select: {
            name: true
          }
        }
      }
    });

    if (!objective) {
      return NextResponse.json({ 
        success: false, 
        error: 'Objective not found or cannot be updated' 
      }, { status: 404 });
    }

    // Update the objective
    const updatedObjective = await prisma.mboManagerObjective.update({
      where: { id: objectiveId },
      data: {
        current: Number(current),
        status: objective.status === 'ASSIGNED' ? 'IN_PROGRESS' : objective.status,
        startedAt: objective.status === 'ASSIGNED' ? new Date() : objective.startedAt,
        managerRemarks: remarks?.trim() || objective.managerRemarks
      },
      include: {
        assignedBySeniorManager: {
          select: {
            id: true,
            name: true,
            title: true
          }
        }
      }
    });

    // Create notification for senior management if significant progress
    const progressPercent = (Number(current) / objective.target) * 100;
    if (progressPercent >= 50 && objective.current && (objective.current / objective.target) * 100 < 50) {
      await prisma.mboNotification.create({
        data: {
          type: 'info',
          title: 'Manager Objective Progress Update',
          message: `${objective.manager?.name || 'Manager'} has made significant progress on "${objective.title}" (${Math.round(progressPercent)}% complete)`,
          entityId: objectiveId,
          entityType: 'manager_objective',
          userId: objective.assignedBySeniorManagerId
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Objective progress updated successfully',
      objective: {
        id: updatedObjective.id,
        title: updatedObjective.title,
        current: updatedObjective.current,
        target: updatedObjective.target,
        progress: updatedObjective.target > 0 ? (updatedObjective.current! / updatedObjective.target) * 100 : 0,
        status: updatedObjective.status,
        managerRemarks: updatedObjective.managerRemarks,
        updatedAt: updatedObjective.updatedAt
      }
    });

  } catch (error) {
    console.error('Error updating manager objective:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update objective',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}