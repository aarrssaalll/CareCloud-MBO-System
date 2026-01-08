/**
 * Bonus calculation service for quarterly bonus awards
 * Based on objective completion percentages and weights
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ObjectiveData {
  id: string;
  current: number;
  target: number;
  weight: number;
  status: string;
  title: string;
}

export interface BonusCalculationResult {
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

export class BonusCalculator {
  
  /**
   * Fetch bonus structure from database or return defaults
   * Note: MboBonusStructure model not yet implemented in schema, using defaults
   */
  private static async getBonusStructure(year: number) {
    // TODO: Implement MboBonusStructure model in Prisma schema to enable dynamic bonus structures
    // For now, using default structure
    
    // Return default structure
    return {
      calculationMethod: 'weighted_performance',
      baseAmount: 5000,
      performanceThresholds: [
        { minPercentage: 0, maxPercentage: 50, multiplier: 0.5 },
        { minPercentage: 50, maxPercentage: 70, multiplier: 0.75 },
        { minPercentage: 70, maxPercentage: 85, multiplier: 0.9 },
        { minPercentage: 85, maxPercentage: 100, multiplier: 1.0 },
        { minPercentage: 100, maxPercentage: 150, multiplier: 1.25 }
      ],
      enableManualOverride: true,
      quarterlyBudget: 20000,
      departmentOverrides: {} as Record<string, { multiplier?: number }>,
      roleMultipliers: {} as Record<string, number>
    };
  }

  /**
   * Calculate performance multiplier based on performance score and thresholds
   */
  private static getPerformanceMultiplier(
    performanceScore: number,
    thresholds: any[],
    calculationMethod: string
  ): number {
    if (calculationMethod === 'tiered_performance') {
      // Find the threshold that matches the performance score
      for (const threshold of thresholds) {
        if (performanceScore >= threshold.minPercentage && performanceScore < threshold.maxPercentage) {
          return threshold.multiplier;
        }
      }
      // If over all thresholds, use the last one
      return thresholds[thresholds.length - 1]?.multiplier || 1.0;
    } else if (calculationMethod === 'flat_rate') {
      // Flat rate: bonus only if 100% or more achieved
      return performanceScore >= 100 ? 1.0 : 0.5;
    } else if (calculationMethod === 'hybrid') {
      // Hybrid: use tiered but cap at max multiplier
      let multiplier = performanceScore / 100;
      const maxMultiplier = thresholds[thresholds.length - 1]?.multiplier || 1.25;
      return Math.min(multiplier, maxMultiplier);
    } else {
      // Default weighted_performance: multiply performance score percentage by 0.01
      return performanceScore / 100;
    }
  }
  
  /**
   * Calculate bonus for a specific employee in a given quarter/year
   */
  static async calculateEmployeeBonus(
    employeeId: string, 
    quarter: string, 
    year: number
  ): Promise<BonusCalculationResult> {
    
    console.log(`🎯 Calculating bonus for employee: ${employeeId}, Q${quarter} ${year}`);
    
    // Fetch bonus structure
    const bonusStructure = await this.getBonusStructure(year);
    console.log(`📊 Using calculation method: ${bonusStructure.calculationMethod}`);
    
    // Get employee data
    const employee = await prisma.mboUser.findUnique({
      where: { id: employeeId },
      select: {
        id: true,
        name: true,
        role: true,
        department: {
          select: { id: true, name: true }
        },
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

    // Normalize objectives to ensure all required fields are numbers
    const normalizedObjectives = objectives.map(obj => ({
      ...obj,
      current: obj.current ?? 0,
      weight: obj.weight ?? 1,
      status: obj.status ?? 'DRAFT'
    }));

    // Calculate total weight of all objectives
    const totalWeight = normalizedObjectives.reduce((sum: number, obj) => sum + (obj.weight || 1), 0);
    console.log(`⚖️ Total weight of objectives: ${totalWeight}`);

    // Calculate breakdown for each objective
    const breakdown = normalizedObjectives.map((objective) => {
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
        completionPercentage: Math.round(completionPercentage * 100) / 100, // Round to 2 decimal places
        weight,
        weightedScore: Math.round(weightedScore * 100) / 100 // Round to 2 decimal places
      };
    });

    // Calculate overall weighted performance score
    const weightedPerformanceScore = breakdown.reduce((sum: number, item) => sum + item.weightedScore, 0);

    // Calculate overall completion percentage (simple average for display)
    const overallCompletionPercentage = breakdown.reduce((sum: number, item) => sum + item.completionPercentage, 0) / breakdown.length;

    // Count completed objectives (>= 100% completion)
    const completedObjectives = breakdown.filter((item: any) => item.completionPercentage >= 100).length;

    // Calculate performance multiplier using bonus structure configuration
    const performanceMultiplier = this.getPerformanceMultiplier(
      weightedPerformanceScore,
      bonusStructure.performanceThresholds,
      bonusStructure.calculationMethod
    );

    // Apply role multiplier if configured
    let finalMultiplier = performanceMultiplier;
    if (employee.role && bonusStructure.roleMultipliers[employee.role]) {
      finalMultiplier = performanceMultiplier * bonusStructure.roleMultipliers[employee.role];
      console.log(`🎭 Applied role multiplier for ${employee.role}: ${bonusStructure.roleMultipliers[employee.role]}`);
    }

    // Apply department overrides if configured
    if (employee.department?.id && bonusStructure.departmentOverrides[employee.department.id]) {
      const deptOverride = bonusStructure.departmentOverrides[employee.department.id];
      if (deptOverride.multiplier) {
        finalMultiplier = performanceMultiplier * deptOverride.multiplier;
        console.log(`🏢 Applied department override for ${employee.department.name}: ${deptOverride.multiplier}`);
      }
    }

    // Calculate final bonus amount using base amount from structure (not employee allocation)
    const baseAmount = bonusStructure.baseAmount;
    const finalBonusAmount = Math.round(baseAmount * finalMultiplier * 100) / 100; // Round to 2 decimal places

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
      objectives: normalizedObjectives,
      totalObjectives: objectives.length,
      completedObjectives,
      totalWeight,
      overallCompletionPercentage: Math.round(overallCompletionPercentage * 100) / 100,
      weightedPerformanceScore: Math.round(weightedPerformanceScore * 100) / 100,
      baseAmount,
      performanceMultiplier: Math.round(performanceMultiplier * 10000) / 100, // Convert to percentage with 2 decimals
      finalBonusAmount,
      breakdown
    };
  }

  /**
   * Save or update bonus calculation in database
   */
  static async saveBonusCalculation(calculation: BonusCalculationResult): Promise<void> {
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

  /**
   * Calculate bonuses for all employees in a given quarter/year
   */
  static async calculateQuarterlyBonuses(quarter: string, year: number): Promise<BonusCalculationResult[]> {
    console.log(`🏢 Calculating bonuses for all employees in Q${quarter} ${year}`);

    // Get all employees who have objectives in this quarter
    const employeesWithObjectives = await prisma.mboUser.findMany({
      where: {
        objectives: {
          some: {
            quarter: quarter,
            year: year,
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

    // Calculate bonus for each employee
    for (const employee of employeesWithObjectives) {
      try {
        const calculation = await this.calculateEmployeeBonus(employee.id, quarter, year);
        results.push(calculation);
        
        // Save the calculation to database
        await this.saveBonusCalculation(calculation);
        
      } catch (error) {
        console.error(`❌ Error calculating bonus for ${employee.name}:`, error);
      }
    }

    console.log(`✅ Completed bonus calculations for ${results.length} employees`);
    return results;
  }

  /**
   * Get bonus history for an employee
   */
  static async getEmployeeBonusHistory(employeeId: string): Promise<any[]> {
    return await prisma.mboBonus.findMany({
      where: { employeeId },
      orderBy: [
        { year: 'desc' },
        { quarter: 'desc' }
      ],
      include: {
        employee: {
          select: {
            name: true,
            title: true
          }
        }
      }
    });
  }

  /**
   * Get bonus summary for a specific quarter/year
   */
  static async getQuarterlyBonusSummary(quarter: string, year: number) {
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

    const totalBonuses = bonuses.reduce((sum: number, bonus: any) => sum + bonus.finalAmount, 0);
    const averageMultiplier = bonuses.reduce((sum: number, bonus: any) => sum + bonus.performanceMultiplier, 0) / bonuses.length;

    return {
      quarter,
      year,
      totalEmployees: bonuses.length,
      totalBonusAmount: totalBonuses,
      averagePerformanceMultiplier: averageMultiplier,
      bonuses
    };
  }
}