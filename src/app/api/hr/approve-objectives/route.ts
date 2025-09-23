import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Bonus calculation logic
function calculateBonus(objectives: any[], employeeSalary: number, quarter: string, year: number) {
  if (!objectives.length) return { baseAmount: 0, performanceMultiplier: 0, finalAmount: 0 };

  // Calculate weighted average score
  const totalWeight = objectives.reduce((sum, obj) => sum + (obj.weight || 1), 0);
  const weightedScore = objectives.reduce((sum, obj) => {
    return sum + (obj.managerScore * (obj.weight || 1));
  }, 0) / totalWeight;

  // Base bonus calculation (percentage of salary)
  const quarterlyBonus = employeeSalary * 0.15; // 15% quarterly bonus potential
  
  // Performance multiplier based on score
  let performanceMultiplier = 0;
  if (weightedScore >= 90) {
    performanceMultiplier = 1.2; // 120% for excellent performance
  } else if (weightedScore >= 80) {
    performanceMultiplier = 1.0; // 100% for good performance
  } else if (weightedScore >= 70) {
    performanceMultiplier = 0.8; // 80% for acceptable performance
  } else if (weightedScore >= 60) {
    performanceMultiplier = 0.5; // 50% for below expectations
  } else {
    performanceMultiplier = 0.25; // 25% for poor performance
  }

  const finalAmount = quarterlyBonus * performanceMultiplier;

  return {
    baseAmount: quarterlyBonus,
    performanceMultiplier,
    finalAmount: Math.round(finalAmount * 100) / 100,
    averageScore: Math.round(weightedScore * 100) / 100,
    objectiveCount: objectives.length
  };
}

// POST /api/hr/approve-objectives
export async function POST(request: NextRequest) {
  try {
    const { objectiveIds, hrId, hrNotes, quarter, year } = await request.json();

    if (!objectiveIds || !hrId) {
      return NextResponse.json({ 
        error: 'Objective IDs and HR ID are required' 
      }, { status: 400 });
    }

    console.log(`🔍 HR ${hrId} approving ${objectiveIds.length} objectives for ${quarter} ${year}`);

    const results = [];
    const bonusCalculations: any = {};

    // Process each objective
    for (const objectiveId of objectiveIds) {
      // Update objective to bonus approved
      await prisma.$executeRaw`
        UPDATE mbo_objectives 
        SET status = 'BONUS_APPROVED',
            hrApprovedAt = GETDATE(),
            hrNotes = ${hrNotes || 'Approved by HR'}
        WHERE id = ${objectiveId}
      `;

      // Get objective details for bonus calculation
      const objectiveDetails = await prisma.$queryRaw`
        SELECT o.*, u.id as userId, u.name as employeeName, u.salary,
               r.score as managerScore, r.aiScore
        FROM mbo_objectives o
        INNER JOIN mbo_users u ON o.userId = u.id
        INNER JOIN mbo_objective_reviews r ON o.id = r.objectiveId
        WHERE o.id = ${objectiveId}
        AND r.reviewType = 'MANAGER'
      ` as any[];

      if (objectiveDetails.length > 0) {
        const obj = objectiveDetails[0];
        const userId = obj.userId;

        // Group objectives by user for bonus calculation
        if (!bonusCalculations[userId]) {
          bonusCalculations[userId] = {
            employeeName: obj.employeeName,
            salary: obj.salary,
            objectives: []
          };
        }

        bonusCalculations[userId].objectives.push({
          id: obj.id,
          title: obj.title,
          weight: obj.weight || 1,
          managerScore: obj.managerScore,
          aiScore: obj.aiScore
        });
      }

      results.push({
        objectiveId,
        status: 'approved',
        timestamp: new Date()
      });
    }

    // Calculate and create bonus records
    const bonusRecords = [];
    
    for (const [userId, data] of Object.entries(bonusCalculations)) {
      const empData = data as any;
      const bonusCalc = calculateBonus(empData.objectives, empData.salary, quarter, year);
      
      // Create bonus record
      const bonusId = `bonus_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await prisma.$executeRaw`
        INSERT INTO mbo_bonuses 
        (id, quarter, year, baseAmount, performanceMultiplier, finalAmount, status, calculatedAt, employeeId)
        VALUES (${bonusId}, ${quarter}, ${year}, ${bonusCalc.baseAmount}, ${bonusCalc.performanceMultiplier}, 
                ${bonusCalc.finalAmount}, 'CALCULATED', GETDATE(), ${userId})
      `;

      bonusRecords.push({
        employeeId: userId,
        employeeName: empData.employeeName,
        bonusCalculation: bonusCalc,
        bonusId
      });

      console.log(`💰 Bonus calculated for ${empData.employeeName}: $${bonusCalc.finalAmount} (${bonusCalc.performanceMultiplier * 100}% of base)`);
    }

    console.log(`✅ HR approval completed for ${objectiveIds.length} objectives`);
    console.log(`💰 Generated ${bonusRecords.length} bonus calculations`);

    return NextResponse.json({
      success: true,
      message: 'Objectives approved and bonuses calculated',
      approvedObjectives: results,
      bonusCalculations: bonusRecords,
      summary: {
        objectivesApproved: objectiveIds.length,
        bonusesCalculated: bonusRecords.length,
        totalBonusAmount: bonusRecords.reduce((sum, b) => sum + b.bonusCalculation.finalAmount, 0)
      }
    });

  } catch (error) {
    console.error('❌ Error in HR approval process:', error);
    return NextResponse.json(
      { error: 'Failed to approve objectives and calculate bonuses' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET /api/hr/approve-objectives (for getting approval summary)
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const quarter = url.searchParams.get('quarter');
    const year = url.searchParams.get('year');

    // Get summary of approvals and bonuses
    const approvalSummary = await prisma.$queryRaw`
      SELECT 
        COUNT(CASE WHEN o.status = 'BONUS_APPROVED' THEN 1 END) as approvedObjectives,
        COUNT(CASE WHEN o.status = 'SUBMITTED_TO_HR' THEN 1 END) as pendingApproval,
        COUNT(b.id) as bonusesCalculated,
        COALESCE(SUM(b.finalAmount), 0) as totalBonusAmount
      FROM mbo_objectives o
      LEFT JOIN mbo_bonuses b ON o.userId = b.employeeId 
        AND b.quarter = ${quarter || 'Q3'} 
        AND b.year = ${year ? parseInt(year) : 2025}
      WHERE o.quarter = ${quarter || 'Q3'} 
      AND o.year = ${year ? parseInt(year) : 2025}
    ` as any[];

    return NextResponse.json({
      success: true,
      summary: approvalSummary[0] || {},
      quarter: quarter || 'Q3',
      year: year || '2025'
    });

  } catch (error) {
    console.error('❌ Error fetching approval summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch approval summary' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
