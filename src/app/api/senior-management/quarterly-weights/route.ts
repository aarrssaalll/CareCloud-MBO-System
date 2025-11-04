import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const managerId = searchParams.get('managerId');
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

    if (!managerId) {
      return NextResponse.json(
        { error: 'Manager ID is required' },
        { status: 400 }
      );
    }

    // Get all manager objectives for this manager for the specified year
    const objectives = await prisma.mboManagerObjective.findMany({
      where: {
        managerId: managerId,
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

    // Calculate weight allocation by quarter
    const quarterlyWeights = {
      Q1: { allocated: 0, available: 100, objectives: [] as any[] },
      Q2: { allocated: 0, available: 100, objectives: [] as any[] },
      Q3: { allocated: 0, available: 100, objectives: [] as any[] },
      Q4: { allocated: 0, available: 100, objectives: [] as any[] }
    };

    objectives.forEach((objective: any) => {
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
      managerId,
      quarterlyWeights
    });

  } catch (error) {
    console.error('❌ Error fetching manager quarterly weights:', error);
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
    const { managerId, quarter, weight, year } = body;

    if (!managerId || !quarter || !weight || !year) {
      return NextResponse.json(
        { error: 'Manager ID, quarter, weight, and year are required' },
        { status: 400 }
      );
    }

    // Check current weight allocation for this quarter
    const currentObjectives = await prisma.mboManagerObjective.findMany({
      where: {
        managerId: managerId,
        quarter: quarter,
        year: year
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
    console.error('❌ Error validating manager quarterly weight:', error);
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