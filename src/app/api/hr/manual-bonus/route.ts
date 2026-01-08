import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/hr/manual-bonus - Award manual bonus to employee
export async function POST(request: NextRequest) {
  try {
    const { employeeId, amount, quarter, year, reason, hrId } = await request.json();

    if (!employeeId || !amount || !quarter || !year || !hrId) {
      return NextResponse.json({
        error: 'Employee ID, amount, quarter, year, and HR ID are required'
      }, { status: 400 });
    }

    if (amount <= 0) {
      return NextResponse.json({
        error: 'Bonus amount must be greater than 0'
      }, { status: 400 });
    }

    console.log(`💰 HR ${hrId} awarding manual bonus of $${amount} to employee ${employeeId} for ${quarter} ${year}`);

    // Check if bonus already exists for this employee in this quarter
    const existingBonus = await prisma.$queryRaw`
      SELECT id, finalAmount FROM mbo_bonuses 
      WHERE employeeId = ${employeeId} 
      AND quarter = ${quarter} 
      AND year = ${year}
    ` as any[];

    let bonusId: string;
    let action = 'created';

    if (existingBonus.length > 0) {
      // Update existing bonus
      bonusId = existingBonus[0].id;
      await prisma.$executeRaw`
        UPDATE mbo_bonuses 
        SET finalAmount = ${amount},
            status = 'MANUAL_OVERRIDE',
            calculatedAt = GETDATE()
        WHERE id = ${bonusId}
      `;
      action = 'updated';
      console.log(`✏️ Updated existing bonus from $${existingBonus[0].finalAmount} to $${amount}`);
    } else {
      // Create new bonus record
      bonusId = `bonus_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await prisma.$executeRaw`
        INSERT INTO mbo_bonuses 
        (id, quarter, year, baseAmount, performanceMultiplier, finalAmount, status, calculatedAt, employeeId)
        VALUES (${bonusId}, ${quarter}, ${year}, ${amount}, 1.0, ${amount}, 'MANUAL_OVERRIDE', GETDATE(), ${employeeId})
      `;
      console.log(`✅ Created new manual bonus record`);
    }

    // Get employee details for response
    const employee = await prisma.$queryRaw`
      SELECT id, name, email FROM mbo_users WHERE id = ${employeeId}
    ` as any[];

    return NextResponse.json({
      success: true,
      message: `Manual bonus ${action} successfully`,
      bonus: {
        id: bonusId,
        employeeId,
        employeeName: employee[0]?.name,
        amount,
        quarter,
        year,
        status: 'MANUAL_OVERRIDE',
        reason,
        awardedBy: hrId,
        awardedAt: new Date()
      }
    });

  } catch (error) {
    console.error('❌ Error awarding manual bonus:', error);
    return NextResponse.json({
      error: 'Failed to award manual bonus',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET /api/hr/manual-bonus - Get all manual bonuses for a quarter
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const quarter = searchParams.get('quarter');
    const year = searchParams.get('year');
    const employeeId = searchParams.get('employeeId');

    if (!quarter || !year) {
      return NextResponse.json({
        error: 'Quarter and year are required'
      }, { status: 400 });
    }

    let query = `
      SELECT b.*, u.name as employeeName, u.email, u.salary, u.allocatedBonusAmount
      FROM mbo_bonuses b
      INNER JOIN mbo_users u ON b.employeeId = u.id
      WHERE b.quarter = '${quarter}' AND b.year = ${year}
      AND b.status = 'MANUAL_OVERRIDE'
    `;

    if (employeeId) {
      query += ` AND b.employeeId = '${employeeId}'`;
    }

    const manualBonuses = await prisma.$queryRawUnsafe(query) as any[];

    return NextResponse.json({
      success: true,
      bonuses: manualBonuses,
      count: manualBonuses.length
    });

  } catch (error) {
    console.error('❌ Error fetching manual bonuses:', error);
    return NextResponse.json({
      error: 'Failed to fetch manual bonuses',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

