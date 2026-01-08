import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST: Submit manager objective for AI scoring and senior management review
export async function POST(
  request: NextRequest,
  { params }: { params: { objectiveId: string } }
) {
  try {
    const { objectiveId } = params;
    const body = await request.json();
    const { current, managerRemarks, employeeRemarks, managerEvidence, digitalSignature } = body;

    console.log(`📤 Submitting manager objective for review: ${objectiveId}`);

    // Fetch the objective
    const objective = await prisma.mboManagerObjective.findUnique({
      where: { id: objectiveId },
      include: {
        quantitativeData: {
          include: { practiceRevenues: true },
        },
      },
    });

    if (!objective) {
      return NextResponse.json({ error: 'Objective not found' }, { status: 404 });
    }

    // Validate objective is completed or in progress
    if (objective.status === 'MANAGER_SUBMITTED' || objective.status === 'AI_SCORED' || 
        objective.status === 'SENIOR_REVIEWED' || objective.status === 'HR_APPROVED') {
      return NextResponse.json(
        { error: 'This objective has already been submitted' },
        { status: 400 }
      );
    }

    // For quantitative objectives, verify progress is tracked
    if (objective.isQuantitative && objective.quantitativeData) {
      if (objective.quantitativeData.totalAchievedRevenue <= 0) {
        return NextResponse.json(
          { error: 'Quantitative objectives must have revenue data before submission' },
          { status: 400 }
        );
      }
    }

    // Update objective with submission data
    const updatedObjective = await prisma.mboManagerObjective.update({
      where: { id: objectiveId },
      data: {
        status: 'MANAGER_SUBMITTED',
        current: current || objective.current,
        managerRemarks: managerRemarks || employeeRemarks, // Support both field names
        managerEvidence,
        managerDigitalSignature: digitalSignature,
        managerSubmittedAt: new Date(),
        completedAt: objective.completedAt || new Date(),
      },
      include: {
        assignedBySeniorManager: {
          select: { id: true, name: true, email: true, title: true },
        },
        quantitativeData: {
          include: { practiceRevenues: true },
        },
      },
    });

    console.log(`✅ Manager objective submitted successfully`);

    return NextResponse.json({
      success: true,
      objective: updatedObjective,
      message: 'Objective submitted successfully for AI scoring and senior management review',
    });

  } catch (error) {
    console.error('❌ Error submitting manager objective:', error);
    return NextResponse.json(
      { error: 'Failed to submit objective', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}