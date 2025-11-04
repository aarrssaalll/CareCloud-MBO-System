import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST - Complete and submit objective to senior management
export async function POST(request: NextRequest) {
  try {
    console.log('🎯 Manager: Completing objective for senior management review');
    // Note: Authentication handled at frontend level for consistency with other APIs

    const body = await request.json();
    const { 
      objectiveId, 
      finalCurrent, 
      managerRemarks, 
      managerEvidence, 
      digitalSignature,
      managerId
    } = body;

    // Validate required fields
    if (!objectiveId || finalCurrent === undefined || !managerRemarks?.trim() || !digitalSignature?.trim() || !managerId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: objectiveId, finalCurrent, managerRemarks, digitalSignature, managerId' 
      }, { status: 400 });
    }

    // Verify the objective belongs to this manager and can be completed
    const objective = await prisma.mboManagerObjective.findFirst({
      where: {
        id: objectiveId,
        managerId: managerId,
        status: {
          in: ['IN_PROGRESS', 'ASSIGNED']
        }
      },
      include: {
        assignedBySeniorManager: {
          select: {
            id: true,
            name: true,
            title: true
          }
        },
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
        error: 'Objective not found or cannot be completed' 
      }, { status: 404 });
    }

    // Complete and submit the objective
    const completedObjective = await prisma.mboManagerObjective.update({
      where: { id: objectiveId },
      data: {
        current: Number(finalCurrent),
        status: 'MANAGER_SUBMITTED',
        completedAt: new Date(),
        managerSubmittedAt: new Date(),
        managerRemarks: managerRemarks.trim(),
        managerEvidence: managerEvidence?.trim() || null,
        managerDigitalSignature: digitalSignature.trim()
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

    // Create notification for senior management
    await prisma.mboNotification.create({
      data: {
        type: 'success',
        title: 'Manager Objective Completed',
        message: `${objective.manager?.name || 'Manager'} has completed and submitted the objective: "${objective.title}" for your review.`,
        actionRequired: true,
        entityId: objectiveId,
        entityType: 'manager_objective',
        userId: objective.assignedBySeniorManagerId
      }
    });

    // Log the completion
    console.log(`✅ Manager objective completed and submitted:`, {
      id: completedObjective.id,
      title: completedObjective.title,
      manager: objective.manager?.name || 'Manager',
      achievement: `${completedObjective.current}/${completedObjective.target}`,
      progress: ((completedObjective.current! / completedObjective.target) * 100).toFixed(1) + '%'
    });

    return NextResponse.json({
      success: true,
      message: 'Objective completed and submitted successfully for senior management review',
      objective: {
        id: completedObjective.id,
        title: completedObjective.title,
        current: completedObjective.current,
        target: completedObjective.target,
        progress: completedObjective.target > 0 ? (completedObjective.current! / completedObjective.target) * 100 : 0,
        status: completedObjective.status,
        completedAt: completedObjective.completedAt,
        managerSubmittedAt: completedObjective.managerSubmittedAt,
        managerRemarks: completedObjective.managerRemarks,
        managerEvidence: completedObjective.managerEvidence
      }
    });

  } catch (error) {
    console.error('Error completing manager objective:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to complete objective',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}