import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { objectiveId, managerId, rejectionReason } = await request.json();

    console.log('🔄 Manager rejecting objective:', {
      objectiveId,
      managerId,
      rejectionReason: rejectionReason?.substring(0, 100) + '...'
    });

    if (!objectiveId || !managerId || !rejectionReason?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Objective ID, Manager ID, and rejection reason are required' },
        { status: 400 }
      );
    }

    // Verify the objective exists and belongs to the manager's team
    const objective = await prisma.mboObjective.findFirst({
      where: {
        id: objectiveId,
        user: {
          managerId: managerId
        },
        status: 'COMPLETED' // Can only reject completed objectives
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!objective) {
      return NextResponse.json(
        { success: false, error: 'Objective not found or not eligible for rejection' },
        { status: 404 }
      );
    }

    // Update objective status back to IN_PROGRESS and add rejection details
    const updatedObjective = await prisma.mboObjective.update({
      where: { id: objectiveId },
      data: {
        status: 'IN_PROGRESS', // Send back to employee
        managerFeedback: `REJECTED: ${rejectionReason}`,
        submittedToManagerAt: null, // Clear the submission timestamp
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Create an objective review entry for audit trail
    await prisma.mboObjectiveReview.create({
      data: {
        objectiveId: objectiveId,
        reviewerId: managerId,
        score: 0, // Rejection score
        comments: `MANAGER REJECTION: ${rejectionReason}`,
        reviewDate: new Date()
      }
    });

    console.log('✅ Objective rejected successfully:', {
      objectiveId,
      employeeName: objective.user.name,
      status: updatedObjective.status
    });

    return NextResponse.json({
      success: true,
      message: 'Objective rejected and sent back to employee',
      objective: {
        id: updatedObjective.id,
        title: updatedObjective.title,
        status: updatedObjective.status,
        employeeName: updatedObjective.user?.name,
        rejectedAt: new Date()
      }
    });

  } catch (error) {
    console.error('❌ Error rejecting objective:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reject objective' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}