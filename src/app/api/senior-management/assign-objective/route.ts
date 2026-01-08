import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST: Senior management assigns objectives to managers
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      managerId,
      seniorManagerId,
      title,
      description,
      category,
      target,
      weight,
      dueDate,
      quarter,
      year,
      isQuantitative,
      objectiveType,
      quantitativeData, // { totalTargetRevenue, currency, practiceRevenues: [{practiceName, targetRevenue, weight}] }
    } = body;

    // Validate required fields
    if (!managerId || !seniorManagerId || !title || !target || !dueDate || !quarter || !year) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log(`📋 Senior manager ${seniorManagerId} assigning objective to manager ${managerId}`);

    // Validate weight allocation for the quarter
    const requestedWeight = weight || 1.0;
    
    // Get current weight allocation for this manager in the specified quarter
    const currentObjectives = await prisma.mboManagerObjective.findMany({
      where: {
        managerId: managerId,
        quarter: quarter,
        year: parseInt(year),
        status: {
          in: ['ASSIGNED', 'IN_PROGRESS']
        }
      },
      select: {
        weight: true
      }
    });

    const currentAllocated = currentObjectives.reduce((sum, obj) => sum + (obj.weight || 0), 0);
    const totalWithNew = currentAllocated + requestedWeight;

    if (totalWithNew > 1.0) {
      const available = Math.max(0, 1.0 - currentAllocated);
      return NextResponse.json({
        success: false,
        error: `Weight allocation would exceed 100% for ${quarter} ${year}`,
        details: {
          quarter,
          year,
          currentAllocated: Math.round(currentAllocated * 100),
          requestedWeight: Math.round(requestedWeight * 100),
          available: Math.round(available * 100),
          exceedsBy: Math.round((totalWithNew - 1.0) * 100)
        }
      }, { status: 400 });
    }

    // Create the manager objective
    const objective = await prisma.mboManagerObjective.create({
      data: {
        title,
        description,
        category,
        target,
        weight: weight || 1.0,
        status: 'ASSIGNED',
        dueDate: new Date(dueDate),
        quarter,
        year: parseInt(year),
        isQuantitative: isQuantitative || false,
        objectiveType: objectiveType || (isQuantitative ? 'QUANTITATIVE' : 'QUALITATIVE'),
        managerId,
        assignedBySeniorManagerId: seniorManagerId,
        assignedAt: new Date(),
      },
    });

    // If quantitative, create the quantitative data
    if (isQuantitative && quantitativeData) {
      const quantitative = await prisma.mboQuantitativeObjective.create({
        data: {
          managerObjectiveId: objective.id,
          totalTargetRevenue: quantitativeData.totalTargetRevenue,
          currency: quantitativeData.currency || 'USD',
          trackingStartDate: new Date(),
        },
      });

      // Create practice revenues if provided
      if (quantitativeData.practiceRevenues && quantitativeData.practiceRevenues.length > 0) {
        await prisma.mboPracticeRevenue.createMany({
          data: quantitativeData.practiceRevenues.map((practice: any) => ({
            quantitativeObjectiveId: quantitative.id,
            practiceName: practice.practiceName,
            targetRevenue: practice.targetRevenue,
            weight: practice.weight || 1.0,
          })),
        });
      }
    }

    // Fetch the complete objective with relations
    const completeObjective = await prisma.mboManagerObjective.findUnique({
      where: { id: objective.id },
      include: {
        manager: {
          select: { id: true, name: true, email: true, title: true },
        },
        assignedBySeniorManager: {
          select: { id: true, name: true, email: true, title: true },
        },
        quantitativeData: {
          include: {
            practiceRevenues: true,
          },
        },
      },
    });

    console.log(`✅ Objective assigned successfully to manager`);

    return NextResponse.json({
      success: true,
      objective: completeObjective,
      message: 'Objective assigned successfully to manager',
    });

  } catch (error) {
    console.error('❌ Error assigning objective:', error);
    return NextResponse.json(
      { error: 'Failed to assign objective', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
