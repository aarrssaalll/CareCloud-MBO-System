import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/hr/quarterly-bonus-tracker - Get quarterly bonus allocation summary
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : new Date().getFullYear();
    const quarter = searchParams.get('quarter') || null;

    console.log(`📊 Fetching quarterly bonus allocation for ${year}${quarter ? ` Q${quarter}` : ''}`);

    // Get all approved objectives for the specified year/quarter
    const employeeObjectives = await prisma.mboObjective.findMany({
      where: {
        year: year,
        ...(quarter && { quarter: quarter }),
        status: 'BONUS_APPROVED'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            title: true,
            salary: true,
            allocatedBonusAmount: true
          }
        }
      }
    });

    const managerObjectives = await prisma.mboManagerObjective.findMany({
      where: {
        year: year,
        ...(quarter && { quarter: quarter }),
        status: 'BONUS_APPROVED'
      },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            title: true,
            salary: true,
            allocatedBonusAmount: true
          }
        }
      }
    });

    // Calculate bonus allocations
    const calculateBonusAmount = (objective: any, allocatedBonusPool: number) => {
      // Get final score from reviews or AI score
      let finalScore = 0;
      if (objective.reviews && objective.reviews.length > 0) {
        finalScore = objective.reviews[0].score || 0;
      } else if (objective.aiScoreMetadata) {
        try {
          const metadata = JSON.parse(objective.aiScoreMetadata);
          finalScore = metadata.score || 0;
        } catch {
          finalScore = 0;
        }
      }

      if (!finalScore) return 0;

      // Use the allocated bonus pool from database (already calculated quarterly amount)
      const bonusPool = allocatedBonusPool || 312.5; // Default if not set
      
      // Weight factor: percentage of bonus pool this objective represents
      const weightPercentage = (objective.weight || 0) / 100;
      
      // Normalize score to percentage (if score is 0-10, convert to 0-100; if already 0-100, use as is)
      let scorePercentage = finalScore;
      if (finalScore <= 10) {
        // Score is on 0-10 scale, convert to 0-100
        scorePercentage = (finalScore / 10) * 100;
      }
      // Score percentage is capped at 100
      scorePercentage = Math.min(scorePercentage, 100);
      
      // Calculate bonus:
      // base = bonus pool * weight percentage
      // final = base * (score percentage / 100)
      const baseBonusForObjective = bonusPool * weightPercentage;
      const actualBonus = baseBonusForObjective * (scorePercentage / 100);

      return Math.round(actualBonus);
    };

    // Process employee objectives
    const employeeBonusData = employeeObjectives.map((obj: any) => {
      const bonusAmount = calculateBonusAmount(obj, obj.user.allocatedBonusAmount || 312.5);
      return {
        userId: obj.user.id,
        userName: obj.user.name,
        userTitle: obj.user.title,
        userSalary: obj.user.salary,
        objectiveId: obj.id,
        objectiveTitle: obj.title,
        quarter: obj.quarter,
        weight: obj.weight,
        bonusAmount: bonusAmount,
        objectiveType: 'EMPLOYEE'
      };
    });

    // Process manager objectives  
    const managerBonusData = managerObjectives.map((obj: any) => {
      const bonusAmount = calculateBonusAmount(obj, obj.manager.allocatedBonusAmount || 312.5);
      return {
        userId: obj.manager.id,
        userName: obj.manager.name,
        userTitle: obj.manager.title,
        userSalary: obj.manager.salary,
        objectiveId: obj.id,
        objectiveTitle: obj.title,
        quarter: obj.quarter,
        weight: obj.weight,
        bonusAmount: bonusAmount,
        objectiveType: 'MANAGER'
      };
    });

    // Combine all bonus data
    const allBonusData = [...employeeBonusData, ...managerBonusData];

    // Group by user and quarter
    const quarterlyAllocations: any = {};
    const userSummaries: any = {};

    allBonusData.forEach(bonus => {
      // Quarter summary
      if (!quarterlyAllocations[bonus.quarter]) {
        quarterlyAllocations[bonus.quarter] = {
          totalAllocated: 0,
          totalWeight: 0,
          objectiveCount: 0,
          employeeCount: 0,
          managerCount: 0
        };
      }
      
      quarterlyAllocations[bonus.quarter].totalAllocated += bonus.bonusAmount;
      quarterlyAllocations[bonus.quarter].totalWeight += bonus.weight;
      quarterlyAllocations[bonus.quarter].objectiveCount += 1;
      
      if (bonus.objectiveType === 'EMPLOYEE') {
        quarterlyAllocations[bonus.quarter].employeeCount += 1;
      } else {
        quarterlyAllocations[bonus.quarter].managerCount += 1;
      }

      // User summary
      if (!userSummaries[bonus.userId]) {
        userSummaries[bonus.userId] = {
          userId: bonus.userId,
          userName: bonus.userName,
          userTitle: bonus.userTitle,
          userSalary: bonus.userSalary,
          totalBonus: 0,
          quarterlyBreakdown: {},
          objectives: []
        };
      }
      
      userSummaries[bonus.userId].totalBonus += bonus.bonusAmount;
      userSummaries[bonus.userId].objectives.push(bonus);
      
      if (!userSummaries[bonus.userId].quarterlyBreakdown[bonus.quarter]) {
        userSummaries[bonus.userId].quarterlyBreakdown[bonus.quarter] = 0;
      }
      userSummaries[bonus.userId].quarterlyBreakdown[bonus.quarter] += bonus.bonusAmount;
    });

    const totalBonusAllocated = allBonusData.reduce((sum, bonus) => sum + bonus.bonusAmount, 0);
    const totalEmployeesWithBonuses = new Set(allBonusData.map(b => b.userId)).size;

    return NextResponse.json({
      success: true,
      year: year,
      summary: {
        totalBonusAllocated,
        totalEmployeesWithBonuses,
        totalObjectives: allBonusData.length,
        employeeObjectives: employeeBonusData.length,
        managerObjectives: managerBonusData.length
      },
      quarterlyAllocations,
      userSummaries: Object.values(userSummaries),
      detailedAllocations: allBonusData
    });

  } catch (error) {
    console.error('❌ Error fetching quarterly bonus tracker:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quarterly bonus allocation data' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}