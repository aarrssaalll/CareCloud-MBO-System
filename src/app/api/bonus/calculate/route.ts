import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { employeeId, quarter, year, useEnhancedCalculation = false } = await request.json();

    if (!employeeId || !quarter || !year) {
      return NextResponse.json(
        { error: 'Missing required fields: employeeId, quarter, year' },
        { status: 400 }
      );
    }

    // Enhanced calculation is now available via /api/bonus/enhanced endpoint

    // Get employee with allocated bonus amount
    const employee = await prisma.mboUser.findUnique({
      where: { id: employeeId },
      select: {
        id: true,
        employeeId: true,
        name: true,
        allocatedBonusAmount: true,
        objectives: {
          where: {
            quarter: quarter,
            year: year,
            status: { in: ['COMPLETED', 'HR_APPROVED'] }
          },
          select: {
            id: true,
            title: true,
            target: true,
            current: true,
            weight: true,
            status: true
          }
        }
      }
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    if (!employee.allocatedBonusAmount || employee.allocatedBonusAmount <= 0) {
      return NextResponse.json(
        { error: 'Employee has no allocated bonus amount' },
        { status: 400 }
      );
    }

    // Calculate bonus per objective based on final score and weight
    let totalWeight = 0;
    for (const objective of employee.objectives) {
      totalWeight += objective.weight || 1.0;
    }

    if (totalWeight === 0) {
      return NextResponse.json(
        { error: 'No completed objectives found for bonus calculation' },
        { status: 400 }
      );
    }

    let totalBonus = 0;
    let totalProgress = 0;
    for (const objective of employee.objectives) {
      const weight = objective.weight || 1.0;
      const allocatedBonusForObjective = (weight / totalWeight) * employee.allocatedBonusAmount;
      const current = objective.current || 0;
      const target = objective.target || 1;
      const progress = Math.max(0, Math.min(current / target, 1)); // 0-1, capped
      const bonusForObjective = allocatedBonusForObjective * progress;
      totalBonus += bonusForObjective;
      totalProgress += progress * 100; // for reporting
    }

    const averageProgress = totalProgress / employee.objectives.length;
    const calculatedBonus = totalBonus;

    // Check if bonus already exists for this quarter/year
    const existingBonus = await prisma.mboBonus.findFirst({
      where: {
        employeeId: employeeId,
        quarter: quarter,
        year: year
      }
    });

    let bonus;
    if (existingBonus) {
      // Update existing bonus
      bonus = await prisma.mboBonus.update({
        where: { id: existingBonus.id },
        data: {
          baseAmount: employee.allocatedBonusAmount,
          performanceMultiplier: averageProgress / 100,
          finalAmount: calculatedBonus,
          status: 'CALCULATED',
          calculatedAt: new Date()
        }
      });
    } else {
      // Create new bonus record
      bonus = await prisma.mboBonus.create({
        data: {
          quarter: quarter,
          year: year,
          baseAmount: employee.allocatedBonusAmount,
          performanceMultiplier: averageProgress / 100,
          finalAmount: calculatedBonus,
          status: 'CALCULATED',
          calculatedAt: new Date(),
          employeeId: employeeId
        }
      });
    }

    // Create HR approval request
    const hrUsers = await prisma.mboUser.findMany({
      where: { role: 'HR' },
      select: { id: true }
    });

    if (hrUsers.length > 0) {
      await prisma.mboApproval.create({
        data: {
          type: 'BONUS',
          entityId: bonus.id,
          status: 'PENDING',
          comments: `Bonus calculated for ${employee.name}: $${Math.round(calculatedBonus)} (${Math.round(averageProgress)}% objective completion)`,
          approverId: hrUsers[0].id // Assign to first HR user
        }
      });

      // Create notification for HR
      await prisma.mboNotification.create({
        data: {
          type: 'info',
          title: 'Bonus Approval Required',
          message: `Bonus calculated for ${employee.name} - $${calculatedBonus.toFixed(2)} requires your approval`,
          actionRequired: true,
          entityId: bonus.id,
          entityType: 'bonus',
          userId: hrUsers[0].id
        }
      });
    }

    return NextResponse.json({
      success: true,
      bonus: {
        id: bonus.id,
        calculatedAmount: Math.round(calculatedBonus),
        progressPercentage: Math.round(averageProgress),
        allocatedAmount: employee.allocatedBonusAmount,
        objectivesCount: employee.objectives.length,
        status: bonus.status
      }
    });

  } catch (error) {
    console.error('Error calculating bonus:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get bonus calculation for an employee
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const quarter = searchParams.get('quarter');
    const year = searchParams.get('year');

    if (!employeeId || !quarter || !year) {
      return NextResponse.json(
        { error: 'Missing required parameters: employeeId, quarter, year' },
        { status: 400 }
      );
    }

    const bonus = await prisma.mboBonus.findFirst({
      where: {
        employeeId: employeeId,
        quarter: quarter,
        year: parseInt(year)
      },
      include: {
        employee: {
          select: {
            name: true,
            allocatedBonusAmount: true
          }
        }
      }
    });

    if (!bonus) {
      return NextResponse.json(
        { error: 'No bonus found for the specified period' },
        { status: 404 }
      );
    }

    return NextResponse.json({ bonus });

  } catch (error) {
    console.error('Error fetching bonus:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}