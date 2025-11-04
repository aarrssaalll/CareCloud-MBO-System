import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { objectiveId, hrId, action, notes, objectiveType } = await request.json();

    if (!objectiveId || !hrId || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: objectiveId, hrId, action' },
        { status: 400 }
      );
    }

    let objective: any = null;
    let userName = '';
    let updateTable: 'employee' | 'manager' = 'employee';

    // Try to find as employee objective first
    const employeeObjective = await prisma.mboObjective.findUnique({
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

    // Try to find as manager objective if not found as employee objective
    if (!employeeObjective) {
      const managerObjective = await prisma.mboManagerObjective.findUnique({
        where: { id: objectiveId },
        include: {
          manager: {
            select: {
              name: true,
              email: true
            }
          }
        }
      });
      
      if (managerObjective) {
        objective = managerObjective;
        userName = managerObjective.manager.name;
        updateTable = 'manager';
      }
    } else {
      objective = employeeObjective;
      userName = employeeObjective.user.name;
      updateTable = 'employee';
    }

    if (!objective) {
      return NextResponse.json(
        { success: false, error: 'Objective not found in either employee or manager objectives' },
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
      // Use different status values based on objective type
      if (updateTable === 'employee') {
        updateData.status = 'BONUS_APPROVED';
      } else {
        updateData.status = 'HR_APPROVED'; // Manager objectives use HR_APPROVED
      }
      updateData.hrApprovedAt = new Date();
    } else if (action === 'reject') {
      updateData.status = 'REJECTED';
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    // Update the objective in the correct table
    let updatedObjective: any;
    if (updateTable === 'employee') {
      updatedObjective = await prisma.mboObjective.update({
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
    } else {
      updatedObjective = await prisma.mboManagerObjective.update({
        where: { id: objectiveId },
        data: updateData,
        include: {
          manager: {
            select: {
              name: true,
              email: true
            }
          }
        }
      });
    }

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
          employeeName: userName,
          objectiveType: updateTable === 'employee' ? 'EMPLOYEE' : 'MANAGER'
        }),
        approverId: hrId,
        approvedAt: action === 'approve' ? new Date() : null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    console.log(`HR ${action}d ${updateTable} objective: ${objective.title} for ${updateTable === 'employee' ? 'employee' : 'manager'}: ${userName}`);

    return NextResponse.json({
      success: true,
      message: `${updateTable === 'employee' ? 'Employee' : 'Manager'} objective ${action}d successfully`,
      objective: {
        id: updatedObjective.id,
        title: updatedObjective.title,
        status: updatedObjective.status,
        employeeName: userName,
        objectiveType: updateTable === 'employee' ? 'EMPLOYEE' : 'MANAGER',
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
      approvals: approvals.map((approval: any) => {
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
