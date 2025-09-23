import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { objectiveId, hrId, action, notes } = await request.json();

    if (!objectiveId || !hrId || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: objectiveId, hrId, action' },
        { status: 400 }
      );
    }

    // Validate the objective exists and is in the correct workflow state
    const objective = await prisma.mboObjective.findUnique({
      where: { id: objectiveId },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!objective) {
      return NextResponse.json(
        { success: false, error: 'Objective not found' },
        { status: 404 }
      );
    }

    // Only allow HR approval for objectives submitted to HR
    if (objective.status !== 'SUBMITTED_TO_HR') {
      return NextResponse.json(
        { success: false, error: 'Objective is not in SUBMITTED_TO_HR status and cannot be processed by HR' },
        { status: 400 }
      );
    }

    // Validate HR user
    const hrUser = await prisma.mboUser.findUnique({
      where: { id: hrId },
      select: { role: true, name: true }
    });

    if (!hrUser || hrUser.role !== 'HR') {
      return NextResponse.json(
        { success: false, error: 'Invalid HR user' },
        { status: 403 }
      );
    }

    let updateData: any = {
      updatedAt: new Date(),
      hrNotes: notes || ''
    };

    if (action === 'approve') {
      updateData.status = 'BONUS_APPROVED';
      updateData.hrApprovedAt = new Date();
    } else if (action === 'reject') {
      updateData.status = 'REJECTED';
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    // Update the objective
    const updatedObjective = await prisma.mboObjective.update({
      where: { id: objectiveId },
      data: updateData,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // Create HR approval record for audit trail
    await prisma.mboApproval.create({
      data: {
        type: 'OBJECTIVE_APPROVAL',
        entityId: objectiveId,
        status: action === 'approve' ? 'APPROVED' : 'REJECTED',
        comments: JSON.stringify({
          action: action,
          notes: notes || '',
          hrUser: hrUser.name,
          processedAt: new Date().toISOString(),
          objectiveTitle: objective.title,
          employeeName: objective.user.name
        }),
        approverId: hrId,
        approvedAt: action === 'approve' ? new Date() : null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    console.log(`HR ${action}d objective: ${objective.title} for employee: ${objective.user.name}`);

    return NextResponse.json({
      success: true,
      message: `Objective ${action}d successfully`,
      objective: {
        id: updatedObjective.id,
        title: updatedObjective.title,
        status: updatedObjective.status,
        employeeName: updatedObjective.user.name,
        processedAt: new Date().toISOString(),
        action: action
      }
    });

  } catch (error) {
    console.error('Error processing HR approval:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error during HR approval' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET method to check approval status
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const objectiveId = searchParams.get('objectiveId');

    if (!objectiveId) {
      return NextResponse.json(
        { success: false, error: 'Objective ID is required' },
        { status: 400 }
      );
    }

    // Get approval history for the objective
    const approvals = await prisma.mboApproval.findMany({
      where: {
        entityId: objectiveId,
        type: 'OBJECTIVE_APPROVAL'
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        approver: {
          select: {
            name: true,
            role: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      approvals: approvals.map(approval => {
        let details: any = {};
        try {
          details = JSON.parse(approval.comments || '{}');
        } catch (e) {
          details = {};
        }

        return {
          id: approval.id,
          status: approval.status,
          action: details.action,
          notes: details.notes,
          processedAt: details.processedAt,
          approverName: approval.approver?.name,
          approverRole: approval.approver?.role,
          createdAt: approval.createdAt
        };
      })
    });

  } catch (error) {
    console.error('Error fetching approval history:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
