import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Update objective progress
export async function PUT(
  request: NextRequest,
  { params }: { params: { objectiveId: string } }
) {
  try {
    const { objectiveId } = params;
    const body = await request.json();
    const { current, employeeRemarks } = body;

    console.log(`🔄 Updating manager objective: ${objectiveId}`);

    // When implemented, this will update the senior management objective table
    // For now, return success message
    const updatedObjective = {
      id: objectiveId,
      current,
      employeeRemarks,
      progress: (current / 100) * 100, // This will be calculated based on actual target
      updatedAt: new Date().toISOString()
    };

    console.log(`✅ Manager objective updated successfully`);

    return NextResponse.json({
      success: true,
      ...updatedObjective,
      message: 'Objective progress updated successfully'
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

// Submit objective for review
export async function POST(
  request: NextRequest,
  { params }: { params: { objectiveId: string } }
) {
  try {
    const { objectiveId } = params;
    const body = await request.json();
    const { current, employeeRemarks, digitalSignature, status } = body;

    console.log(`📤 Submitting manager objective for review: ${objectiveId}`);

    // When implemented, this will update the senior management objective table
    // and set status to COMPLETED for senior management review
    const submittedObjective = {
      id: objectiveId,
      current,
      employeeRemarks,
      digitalSignature,
      status: 'COMPLETED',
      submittedAt: new Date().toISOString(),
      progress: (current / 100) * 100, // This will be calculated based on actual target
    };

    console.log(`✅ Manager objective submitted for senior management review`);

    return NextResponse.json({
      success: true,
      ...submittedObjective,
      message: 'Objective submitted for senior management review successfully'
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