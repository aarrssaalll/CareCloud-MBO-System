import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { bonusId, action, approvedAmount, comments } = await request.json();

    if (!bonusId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: bonusId, action' },
        { status: 400 }
      );
    }

    // Get the bonus record
    const bonus = await prisma.mboBonus.findUnique({
      where: { id: bonusId },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!bonus) {
      return NextResponse.json(
        { error: 'Bonus record not found' },
        { status: 404 }
      );
    }

    // Get the approval record
    const approval = await prisma.mboApproval.findFirst({
      where: {
        type: 'BONUS',
        entityId: bonusId,
        status: 'PENDING'
      }
    });

    if (!approval) {
      return NextResponse.json(
        { error: 'No pending approval found for this bonus' },
        { status: 404 }
      );
    }

    let finalAmount = bonus.finalAmount;
    let status = bonus.status;

    if (action === 'approve') {
      // Use the approved amount if provided, otherwise use calculated amount
      finalAmount = approvedAmount !== undefined ? approvedAmount : bonus.finalAmount;
      status = 'APPROVED';

      // Update approval record
      await prisma.mboApproval.update({
        where: { id: approval.id },
        data: {
          status: 'APPROVED',
          comments: comments || `Bonus approved: $${Math.round(finalAmount)}`,
          approvedAt: new Date()
        }
      });

      // Update bonus record
      await prisma.mboBonus.update({
        where: { id: bonusId },
        data: {
          finalAmount: finalAmount,
          status: status
        }
      });

      // Create notification for employee
      await prisma.mboNotification.create({
        data: {
          type: 'success',
          title: 'Bonus Approved',
          message: `Your bonus for ${bonus.quarter} ${bonus.year} has been approved: $${Math.round(finalAmount)}`,
          actionRequired: false,
          entityId: bonusId,
          entityType: 'bonus',
          userId: bonus.employee.id
        }
      });

    } else if (action === 'reject') {
      // Update approval record
      await prisma.mboApproval.update({
        where: { id: approval.id },
        data: {
          status: 'REJECTED',
          comments: comments || 'Bonus rejected by HR',
          approvedAt: new Date()
        }
      });

      // Update bonus status
      await prisma.mboBonus.update({
        where: { id: bonusId },
        data: {
          status: 'REJECTED'
        }
      });

      // Create notification for employee
      await prisma.mboNotification.create({
        data: {
          type: 'warning',
          title: 'Bonus Rejected',
          message: `Your bonus for ${bonus.quarter} ${bonus.year} has been rejected by HR`,
          actionRequired: false,
          entityId: bonusId,
          entityType: 'bonus',
          userId: bonus.employee.id
        }
      });

    } else {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      bonus: {
        id: bonusId,
        finalAmount: finalAmount,
        status: status,
        action: action
      }
    });

  } catch (error) {
    console.error('Error processing bonus approval:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get pending bonus approvals for HR
export async function GET(request: NextRequest) {
  try {
    const approvals = await prisma.mboApproval.findMany({
      where: {
        type: 'BONUS',
        status: 'PENDING'
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

    // Get bonus details for each approval
    const bonusApprovals = await Promise.all(
      approvals.map(async (approval) => {
        const bonus = await prisma.mboBonus.findUnique({
          where: { id: approval.entityId },
          include: {
            employee: {
              select: {
                id: true,
                employeeId: true,
                name: true,
                allocatedBonusAmount: true
              }
            }
          }
        });

        return {
          approval: {
            id: approval.id,
            status: approval.status,
            comments: approval.comments,
            createdAt: approval.createdAt
          },
          bonus: bonus ? {
            id: bonus.id,
            quarter: bonus.quarter,
            year: bonus.year,
            baseAmount: bonus.baseAmount,
            performanceMultiplier: bonus.performanceMultiplier,
            finalAmount: bonus.finalAmount,
            calculatedAt: bonus.calculatedAt,
            employee: bonus.employee
          } : null
        };
      })
    );

    return NextResponse.json({ bonusApprovals });

  } catch (error) {
    console.error('Error fetching bonus approvals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}