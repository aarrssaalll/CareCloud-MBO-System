import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PUT: Update a manager's objective (only for qualitative objectives - quantitative are auto-updated)
export async function PUT(
  request: NextRequest,
  { params }: { params: { objectiveId: string } }
) {
  try {
    const { objectiveId } = params;
    const body = await request.json();

    console.log(`📝 Updating manager objective: ${objectiveId}`);

    // Fetch the objective first to check if it's quantitative
    const objective = await prisma.mboManagerObjective.findUnique({
      where: { id: objectiveId },
    });

    if (!objective) {
      return NextResponse.json({ error: 'Objective not found' }, { status: 404 });
    }

    // Prevent manual updates to quantitative objectives (they're auto-updated)
    if (objective.isQuantitative) {
      return NextResponse.json(
        { error: 'Quantitative objectives are automatically updated from revenue data and cannot be manually modified' },
        { status: 400 }
      );
    }

    // Update qualitative objective
    const updatedObjective = await prisma.mboManagerObjective.update({
      where: { id: objectiveId },
      data: {
        current: body.current,
        managerRemarks: body.managerRemarks || body.employeeRemarks, // Support both field names for compatibility
        managerEvidence: body.managerEvidence,
        status: body.status || objective.status,
        ...(body.status === 'IN_PROGRESS' && !objective.startedAt ? { startedAt: new Date() } : {}),
        ...(body.status === 'COMPLETED' && !objective.completedAt ? { completedAt: new Date() } : {}),
      },
      include: {
        assignedBySeniorManager: {
          select: { id: true, name: true, email: true, title: true },
        },
      },
    });

    console.log(`✅ Manager objective updated successfully`);

    return NextResponse.json({
      success: true,
      objective: updatedObjective,
      message: 'Objective updated successfully',
    });

  } catch (error) {
    console.error('❌ Error updating manager objective:', error);
    return NextResponse.json(
      { error: 'Failed to update objective', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET: Fetch a single manager objective
export async function GET(
  request: NextRequest,
  { params }: { params: { objectiveId: string } }
) {
  try {
    const { objectiveId } = params;

    const objective = await prisma.mboManagerObjective.findUnique({
      where: { id: objectiveId },
      include: {
        assignedBySeniorManager: {
          select: { id: true, name: true, email: true, title: true },
        },
        quantitativeData: {
          include: {
            practiceRevenues: {
              orderBy: { practiceName: 'asc' },
            },
          },
        },
      },
    });

    if (!objective) {
      return NextResponse.json({ error: 'Objective not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      objective,
    });

  } catch (error) {
    console.error('❌ Error fetching manager objective:', error);
    return NextResponse.json(
      { error: 'Failed to fetch objective', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}