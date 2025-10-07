import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Enhanced Bonus calculation service
 * Based on objective completion percentages and weights
 */

interface ObjectiveData {
  id: string;
  current: number;
  target: number;
  weight: number;
  status: string;
  title: string;
}

interface BonusCalculationResult {
  employeeId: string;
  employeeName: string;
  quarter: string;
  year: number;
  objectives: ObjectiveData[];
  totalObjectives: number;
  completedObjectives: number;
  totalWeight: number;
  overallCompletionPercentage: number;
  weightedPerformanceScore: number;
  baseAmount: number;
  performanceMultiplier: number;
  finalBonusAmount: number;
  breakdown: {
    objectiveId: string;
    title: string;
    completionPercentage: number;
    weight: number;
    weightedScore: number;
  }[];
}

export async function POST(request: NextRequest) {
  try {
    const { employeeId, quarter, year, calculateAll = false } = await request.json();

    if (calculateAll) {
      // Calculate for all employees in the quarter
      return await calculateQuarterlyBonuses(quarter, year);
    }

    if (!employeeId || !quarter || !year) {
      return NextResponse.json({
        success: false,
        error: 'Employee ID, quarter, and year are required'
      }, { status: 400 });
    }

    const calculation = await calculateEmployeeBonus(employeeId, quarter, parseInt(year));
    await saveBonusCalculation(calculation);

    return NextResponse.json({
      success: true,
      message: 'Bonus calculated and saved successfully',
      data: calculation
    });

  } catch (error) {
    console.error('Error in enhanced bonus calculation:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const quarter = searchParams.get('quarter');
    const year = searchParams.get('year');

    if (employeeId && quarter && year) {
      // Get specific employee bonus calculation
      const calculation = await calculateEmployeeBonus(employeeId, quarter, parseInt(year));
      return NextResponse.json({
        success: true,
        data: calculation
      });
    } else if (quarter && year) {
      // Get quarterly summary
      const summary = await getQuarterlyBonusSummary(quarter, parseInt(year));
      return NextResponse.json({
        success: true,
        data: summary
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Either (employeeId, quarter, year) or (quarter, year) parameters are required'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error fetching bonus data:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper functions

async function calculateEmployeeBonus(
  employeeId: string,
  quarter: string,
  year: number
): Promise<BonusCalculationResult> {
  
  console.log(`🎯 Calculating bonus for employee: ${employeeId}, Q${quarter} ${year}`);
  
  // Get employee data
  const employee = await prisma.mboUser.findUnique({
    where: { id: employeeId },
    select: {
      id: true,
      name: true,
      allocatedBonusAmount: true,
    }
  });

  if (!employee) {
    throw new Error(`Employee not found: ${employeeId}`);
  }

  // Get all objectives for the employee in the specified quarter/year
  const objectives = await prisma.mboObjective.findMany({
    where: {
      userId: employeeId,
      quarter: quarter,
      year: year,
      status: {
        in: ['ACTIVE', 'COMPLETED', 'AI_SCORED', 'REVIEWED', 'SUBMITTED_TO_HR', 'HR_APPROVED']
      }
    },
    select: {
      id: true,
      title: true,
      current: true,
      target: true,
      weight: true,
      status: true,
    }
  });

  console.log(`📋 Found ${objectives.length} objectives for bonus calculation`);

  if (objectives.length === 0) {
    console.warn(`⚠️ No objectives found for employee ${employeeId} in Q${quarter} ${year}`);
    return {
      employeeId,
      employeeName: employee.name,
      quarter,
      year,
      objectives: [],
      totalObjectives: 0,
      completedObjectives: 0,
      totalWeight: 0,
      overallCompletionPercentage: 0,
      weightedPerformanceScore: 0,
      baseAmount: employee.allocatedBonusAmount || 0,
      performanceMultiplier: 0,
      finalBonusAmount: 0,
      breakdown: []
    };
  }

  // Calculate total weight of all objectives
  const totalWeight = objectives.reduce((sum, obj) => sum + (obj.weight || 1), 0);
  console.log(`⚖️ Total weight of objectives: ${totalWeight}`);

  // Calculate breakdown for each objective
  const breakdown = objectives.map(objective => {
    const current = objective.current || 0;
    const target = objective.target;
    const weight = objective.weight || 1;
    
    // Calculate completion percentage (capped at 100%)
    const completionPercentage = Math.min((current / target) * 100, 100);
    
    // Calculate weighted score (how much this objective contributes to overall performance)
    const weightedScore = (completionPercentage * weight) / totalWeight;
    
    return {
      objectiveId: objective.id,
      title: objective.title,
      completionPercentage: Math.round(completionPercentage * 100) / 100,
      weight,
      weightedScore: Math.round(weightedScore * 100) / 100
    };
  });

  // Calculate overall weighted performance score
  const weightedPerformanceScore = breakdown.reduce((sum, item) => sum + item.weightedScore, 0);

  // Calculate overall completion percentage (simple average for display)
  const overallCompletionPercentage = breakdown.reduce((sum, item) => sum + item.completionPercentage, 0) / breakdown.length;

  // Count completed objectives (>= 100% completion)
  const completedObjectives = breakdown.filter(item => item.completionPercentage >= 100).length;

  // Calculate performance multiplier (weighted score as percentage)
  const performanceMultiplier = weightedPerformanceScore / 100;

  // Calculate final bonus amount
  const baseAmount = employee.allocatedBonusAmount || 0;
  const finalBonusAmount = Math.round(baseAmount * performanceMultiplier * 100) / 100;

  console.log(`💰 Bonus calculation results:
  - Total Objectives: ${objectives.length}
  - Completed: ${completedObjectives}
  - Overall Completion: ${Math.round(overallCompletionPercentage)}%
  - Weighted Performance: ${Math.round(weightedPerformanceScore)}%
  - Base Amount: $${baseAmount}
  - Performance Multiplier: ${Math.round(performanceMultiplier * 10000) / 100}%
  - Final Bonus: $${finalBonusAmount}
  `);

  return {
    employeeId,
    employeeName: employee.name,
    quarter,
    year,
    objectives: objectives.map(obj => ({
      id: obj.id,
      current: obj.current || 0,
      target: obj.target,
      weight: obj.weight || 1,
      status: obj.status || 'DRAFT',
      title: obj.title
    })),
    totalObjectives: objectives.length,
    completedObjectives,
    totalWeight,
    overallCompletionPercentage: Math.round(overallCompletionPercentage * 100) / 100,
    weightedPerformanceScore: Math.round(weightedPerformanceScore * 100) / 100,
    baseAmount,
    performanceMultiplier: Math.round(performanceMultiplier * 10000) / 100,
    finalBonusAmount,
    breakdown
  };
}

async function saveBonusCalculation(calculation: BonusCalculationResult): Promise<void> {
  console.log(`💾 Saving bonus calculation for ${calculation.employeeName}`);

  // Check if bonus already exists for this period
  const existingBonus = await prisma.mboBonus.findFirst({
    where: {
      employeeId: calculation.employeeId,
      quarter: calculation.quarter,
      year: calculation.year
    }
  });

  const bonusData = {
    quarter: calculation.quarter,
    year: calculation.year,
    baseAmount: calculation.baseAmount,
    performanceMultiplier: calculation.performanceMultiplier / 100, // Store as decimal
    finalAmount: calculation.finalBonusAmount,
    status: 'CALCULATED',
    calculatedAt: new Date(),
    employeeId: calculation.employeeId
  };

  if (existingBonus) {
    // Update existing bonus
    await prisma.mboBonus.update({
      where: { id: existingBonus.id },
      data: bonusData
    });
    console.log(`✅ Updated existing bonus record for ${calculation.employeeName}`);
  } else {
    // Create new bonus record
    await prisma.mboBonus.create({
      data: bonusData
    });
    console.log(`✅ Created new bonus record for ${calculation.employeeName}`);
  }
}

async function calculateQuarterlyBonuses(quarter: string, year: string) {
  console.log(`🏢 Calculating bonuses for all employees in Q${quarter} ${year}`);

  const employeesWithObjectives = await prisma.mboUser.findMany({
    where: {
      objectives: {
        some: {
          quarter: quarter,
          year: parseInt(year),
          status: {
            in: ['ACTIVE', 'COMPLETED', 'AI_SCORED', 'REVIEWED', 'SUBMITTED_TO_HR', 'HR_APPROVED']
          }
        }
      }
    },
    select: { id: true, name: true }
  });

  console.log(`👥 Found ${employeesWithObjectives.length} employees with objectives in Q${quarter} ${year}`);

  const results: BonusCalculationResult[] = [];

  for (const employee of employeesWithObjectives) {
    try {
      const calculation = await calculateEmployeeBonus(employee.id, quarter, parseInt(year));
      results.push(calculation);
      await saveBonusCalculation(calculation);
    } catch (error) {
      console.error(`❌ Error calculating bonus for ${employee.name}:`, error);
    }
  }

  const summary = await getQuarterlyBonusSummary(quarter, parseInt(year));

  return NextResponse.json({
    success: true,
    message: `Calculated bonuses for ${results.length} employees in Q${quarter} ${year}`,
    data: {
      calculations: results,
      summary: summary
    }
  });
}

async function getQuarterlyBonusSummary(quarter: string, year: number) {
  const bonuses = await prisma.mboBonus.findMany({
    where: { quarter, year },
    include: {
      employee: {
        select: {
          name: true,
          title: true,
          departmentId: true,
          teamId: true
        }
      }
    }
  });

  const totalBonuses = bonuses.reduce((sum, bonus) => sum + bonus.finalAmount, 0);
  const averageMultiplier = bonuses.length > 0 
    ? bonuses.reduce((sum, bonus) => sum + bonus.performanceMultiplier, 0) / bonuses.length 
    : 0;

  return {
    quarter,
    year,
    totalEmployees: bonuses.length,
    totalBonusAmount: totalBonuses,
    averagePerformanceMultiplier: averageMultiplier,
    bonuses
  };
}