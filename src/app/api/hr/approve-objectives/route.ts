import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Bonus calculation logic
function calculateBonus(objectives: any[], allocatedBonusAmount: number, quarter: string, year: number) {
  if (!objectives.length) return { baseAmount: 0, performanceMultiplier: 0, finalAmount: 0 };

  // allocatedBonusAmount is QUARTERLY amount, use directly as base
  const baseAmount = allocatedBonusAmount || 1000;
  
  // Calculate weighted performance score
  let weightedPerformanceScore = 0;
  
  objectives.forEach((obj: any) => {
    // Get the final score (manager review score or AI score)
    const finalScore = obj.managerScore || obj.aiScore || 0;
    
    // Normalize score to 0-100 range
    let scorePercentage = finalScore;
    if (finalScore <= 10) {
      scorePercentage = (finalScore / 10) * 100;
    }
    scorePercentage = Math.min(scorePercentage, 100);
    
    // Weight is already a percentage (e.g., 0.20 for 20%)
    const weight = (obj.weight || 0) / 100;
    
    // Add weighted score to total
    weightedPerformanceScore += scorePercentage * weight;
  });

  // Calculate performance multiplier (0-1 scale)
  const performanceMultiplier = weightedPerformanceScore / 100;

  // Calculate final bonus: base amount * performance multiplier
  const finalAmount = Math.round(baseAmount * performanceMultiplier * 100) / 100;

  return {
    baseAmount: baseAmount,
    performanceMultiplier: Math.min(performanceMultiplier, 1), // Cap at 1.0 (100%)
    finalAmount: finalAmount,
    averageScore: Math.round(weightedPerformanceScore),
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
        SELECT o.*, u.id as userId, u.name as employeeName, u.salary, u.allocatedBonusAmount,
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
            allocatedBonusAmount: obj.allocatedBonusAmount || 0,
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
      const bonusCalc = calculateBonus(empData.objectives, empData.allocatedBonusAmount, quarter, year);
      
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

      console.log(`💰 Bonus calculated for ${empData.employeeName}: $${bonusCalc.finalAmount} (${bonusCalc.performanceMultiplier * 100}% of allocated: $${empData.allocatedBonusAmount})`);
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
