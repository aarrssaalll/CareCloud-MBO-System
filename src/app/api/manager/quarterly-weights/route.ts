import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    // Get all objectives for this employee for the specified year (for display purposes)
    const allObjectives = await prisma.mboObjective.findMany({
      where: {
        userId: employeeId,
        year: year
      },
      select: {
        id: true,
        quarter: true,
        weight: true,
        status: true,
        title: true
      }
    });

    // Get only active objectives for weight calculation
    const activeObjectives = await prisma.mboObjective.findMany({
      where: {
        userId: employeeId,
        year: year,
        status: {
          in: ['ASSIGNED', 'IN_PROGRESS', 'ACTIVE']
        }
      },
      select: {
        id: true,
        quarter: true,
        weight: true,
        status: true,
        title: true
      }
    });

    // Calculate weight allocation by quarter using ONLY active objectives
    const quarterlyWeights = {
      Q1: { allocated: 0, available: 100, objectives: [] as any[], allObjectives: [] as any[] },
      Q2: { allocated: 0, available: 100, objectives: [] as any[], allObjectives: [] as any[] },
      Q3: { allocated: 0, available: 100, objectives: [] as any[], allObjectives: [] as any[] },
      Q4: { allocated: 0, available: 100, objectives: [] as any[], allObjectives: [] as any[] }
    };

    // First, populate ALL objectives for display
    allObjectives.forEach((objective: any) => {
      const quarter = objective.quarter as keyof typeof quarterlyWeights;
      if (quarter && quarterlyWeights[quarter]) {
        const weight = Math.round((objective.weight || 0) * 100); // Convert to percentage
        quarterlyWeights[quarter].allObjectives.push({
          id: objective.id,
          title: objective.title,
          weight: weight,
          status: objective.status
        });
      }
    });

    // Then, calculate allocated weight using ONLY active objectives
    activeObjectives.forEach((objective: any) => {
      const quarter = objective.quarter as keyof typeof quarterlyWeights;
      if (quarter && quarterlyWeights[quarter]) {
        const weight = Math.round((objective.weight || 0) * 100); // Convert to percentage
        quarterlyWeights[quarter].allocated += weight;
        quarterlyWeights[quarter].objectives.push({
          id: objective.id,
          title: objective.title,
          weight: weight,
          status: objective.status
        });
      }
    });

    // Calculate available weight for each quarter
    Object.keys(quarterlyWeights).forEach(quarter => {
      const q = quarter as keyof typeof quarterlyWeights;
      quarterlyWeights[q].available = Math.max(0, 100 - quarterlyWeights[q].allocated);
    });

    return NextResponse.json({
      success: true,
      year,
      employeeId,
      quarterlyWeights
    });

  } catch (error) {
    console.error('❌ Error fetching quarterly weights:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch quarterly weight allocations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, quarter, weight, year } = body;

    if (!employeeId || !quarter || !weight || !year) {
      return NextResponse.json(
        { error: 'Employee ID, quarter, weight, and year are required' },
        { status: 400 }
      );
    }

    // Check current weight allocation for this quarter
    // Only count active objectives, exclude COMPLETED, CANCELLED, REJECTED, BONUS_APPROVED
    const currentObjectives = await prisma.mboObjective.findMany({
      where: {
        userId: employeeId,
        quarter: quarter,
        year: year,
        status: {
          in: ['ASSIGNED', 'IN_PROGRESS', 'ACTIVE']
        }
      },
      select: {
        weight: true
      }
    });

    const currentAllocated = currentObjectives.reduce((sum: number, obj: any) => sum + ((obj.weight || 0) * 100), 0);
    const requestedWeight = Math.round(weight * 100); // Convert to percentage
    const totalAfterAddition = currentAllocated + requestedWeight;

    if (totalAfterAddition > 100) {
      return NextResponse.json({
        success: false,
        error: 'Weight allocation would exceed 100% for this quarter',
        details: {
          currentAllocated: Math.round(currentAllocated),
          requestedWeight,
          available: Math.max(0, 100 - currentAllocated),
          exceedsBy: totalAfterAddition - 100
        }
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      weightValidation: {
        currentAllocated: Math.round(currentAllocated),
        requestedWeight,
        totalAfterAddition,
        remainingAfterAddition: 100 - totalAfterAddition
      }
    });

  } catch (error) {
    console.error('❌ Error validating quarterly weight:', error);
    return NextResponse.json(
      { 
        error: 'Failed to validate weight allocation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
