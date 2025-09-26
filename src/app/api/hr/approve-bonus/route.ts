import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { employeeId, bonusAmount, quarter, year, hrId, notes, action } = await request.json();

    if (!employeeId || !bonusAmount || !quarter || !year || !hrId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify HR user has permission
    const hrUser = await prisma.mboUser.findUnique({
      where: { id: hrId },
      select: { role: true }
    });

    if (!hrUser || !['HR', 'hr'].includes(hrUser.role)) {
      return NextResponse.json({ error: 'Unauthorized: HR access required' }, { status: 403 });
    }

    if (action === 'approve') {
      // Check if bonus already exists
      const existingBonus = await prisma.mboBonus.findFirst({
        where: {
          employeeId,
          quarter,
          year
        }
      });

      let bonus;
      if (existingBonus) {
        // Update existing bonus
        bonus = await prisma.mboBonus.update({
          where: { id: existingBonus.id },
          data: {
            baseAmount: bonusAmount,
            performanceMultiplier: 1.0, // Since HR is setting the final amount
            finalAmount: bonusAmount,
            status: 'APPROVED',
            paidAt: null // Will be set when actually paid
          }
        });
      } else {
        // Create new bonus
        bonus = await prisma.mboBonus.create({
          data: {
            employeeId,
            quarter,
            year,
            baseAmount: bonusAmount,
            performanceMultiplier: 1.0,
            finalAmount: bonusAmount,
            status: 'APPROVED'
          }
        });
      }

      // Create approval record for audit trail
      await prisma.mboApproval.create({
        data: {
          type: 'BONUS',
          entityId: bonus.id,
          status: 'APPROVED',
          comments: notes || 'Bonus approved by HR',
          approverId: hrId,
          approvedAt: new Date()
        }
      });

      // Create notification for employee
      await prisma.mboNotification.create({
        data: {
          type: 'success',
          title: 'Bonus Approved',
          message: `Your ${quarter} ${year} bonus of $${bonusAmount.toLocaleString()} has been approved by HR.`,
          entityType: 'bonus',
          entityId: bonus.id,
          userId: employeeId
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Bonus approved successfully',
        bonus
      });

    } else if (action === 'reject') {
      // For rejection, we might not create a bonus record, or mark it as rejected
      // Let's create a rejected bonus record for audit purposes
      const existingBonus = await prisma.mboBonus.findFirst({
        where: {
          employeeId,
          quarter,
          year
        }
      });

      let bonus;
      if (existingBonus) {
        bonus = await prisma.mboBonus.update({
          where: { id: existingBonus.id },
          data: {
            status: 'REJECTED'
          }
        });
      } else {
        bonus = await prisma.mboBonus.create({
          data: {
            employeeId,
            quarter,
            year,
            baseAmount: 0,
            performanceMultiplier: 0,
            finalAmount: 0,
            status: 'REJECTED'
          }
        });
      }

      // Create rejection approval record
      await prisma.mboApproval.create({
        data: {
          type: 'BONUS',
          entityId: bonus.id,
          status: 'REJECTED',
          comments: notes || 'Bonus rejected by HR',
          approverId: hrId,
          approvedAt: new Date()
        }
      });

      // Create notification for employee
      await prisma.mboNotification.create({
        data: {
          type: 'warning',
          title: 'Bonus Rejected',
          message: `Your ${quarter} ${year} bonus request has been rejected by HR. ${notes ? `Reason: ${notes}` : ''}`,
          entityType: 'bonus',
          entityId: bonus.id,
          userId: employeeId
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Bonus rejected successfully',
        bonus
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Error processing bonus approval:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}