import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET - Fetch annual weight allocation for a manager
 * Returns a unified 100% pool across all quarters for the year
 */
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

    console.log(` Fetching annual weights for manager ${managerId}, year ${year}`);

    // Get all manager objectives for this manager for the specified year (all quarters combined)
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
        title: true,
        objectiveType: true
      }
    });

    console.log(`📋 Found ${objectives.length} objectives for year ${year}`);

    // Calculate total weight allocation across all quarters (unified 100% pool)
    let totalAllocated = 0;
    const byQuarter: {[key: string]: number} = {
      Q1: 0,
      Q2: 0,
      Q3: 0,
      Q4: 0
    };

    objectives.forEach((objective: any) => {
      const weight = objective.weight || 0;
      totalAllocated += weight;
      
      const quarter = objective.quarter as keyof typeof byQuarter;
      if (quarter && byQuarter[quarter] !== undefined) {
        byQuarter[quarter] += weight;
      }
    });

    const annualWeights = {
      allocated: totalAllocated,
      available: Math.max(0, 100 - totalAllocated),
      byQuarter: byQuarter,
      objectives: objectives.map((obj: any) => ({
        id: obj.id,
        title: obj.title,
        quarter: obj.quarter,
        weight: obj.weight,
        status: obj.status,
        type: obj.objectiveType || 'qualitative'
      }))
    };

    console.log(`✅ Annual weights calculated:`, {
      totalAllocated: totalAllocated.toFixed(1) + '%',
      available: annualWeights.available.toFixed(1) + '%',
      byQuarter
    });

    return NextResponse.json({
      success: true,
      year,
      managerId,
      annualWeights
    });

  } catch (error) {
    console.error('❌ Error fetching manager annual weights:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch annual weight allocations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * POST - Validate if weight can be allocated from annual pool
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { managerId, weight, year, excludeObjectiveId } = body;

    if (!managerId || weight === undefined || !year) {
      return NextResponse.json(
        { error: 'Manager ID, weight, and year are required' },
        { status: 400 }
      );
    }

    console.log(`🔍 Validating weight allocation: ${weight}% for manager ${managerId}, year ${year}`);

    // Get current weight allocation for the entire year
    const whereClause: any = {
      managerId: managerId,
      year: year
    };

    // Exclude the objective being edited
    if (excludeObjectiveId) {
      whereClause.id = {
        not: excludeObjectiveId
      };
    }

    const currentObjectives = await prisma.mboManagerObjective.findMany({
      where: whereClause,
      select: {
        id: true,
        weight: true,
        quarter: true,
        title: true
      }
    });

    const currentAllocated = currentObjectives.reduce((sum, obj) => sum + (obj.weight || 0), 0);
    const available = 100 - currentAllocated;
    const canAllocate = weight <= available;

    console.log(`📊 Current allocation: ${currentAllocated.toFixed(1)}%, Available: ${available.toFixed(1)}%, Requested: ${weight}%, Can allocate: ${canAllocate}`);

    return NextResponse.json({
      success: true,
      canAllocate,
      currentAllocated,
      available,
      requestedWeight: weight,
      message: canAllocate 
        ? `${weight}% can be allocated from the annual pool`
        : `Cannot allocate ${weight}%. Only ${available.toFixed(1)}% available from the annual 100% pool. (${currentAllocated.toFixed(1)}% already allocated)`
    });

  } catch (error) {
    console.error('❌ Error validating weight allocation:', error);
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

