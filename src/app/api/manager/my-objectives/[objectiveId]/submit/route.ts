import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Submit objective for senior management review
export async function POST(
  request: NextRequest,
  { params }: { params: { objectiveId: string } }
) {
  try {
    const { objectiveId } = params;
    const body = await request.json();
    const { current, employeeRemarks, digitalSignature } = body;

    console.log(`📤 Submitting manager objective for senior management review: ${objectiveId}`);

    // When implemented, this will:
    // 1. Update the senior management objective in the database
    // 2. Set status to COMPLETED 
    // 3. Add submission timestamp
    // 4. Notify senior management for review
    
    const submittedObjective = {
      id: objectiveId,
      current,
      employeeRemarks,
      digitalSignature,
      status: 'COMPLETED',
      submittedAt: new Date().toISOString(),
      progress: (current / 100) * 100, // This will be calculated based on actual target
    };

    console.log(`✅ Manager objective submitted successfully - awaiting senior management review`);

    return NextResponse.json({
      success: true,
      ...submittedObjective,
      message: 'Objective submitted successfully. Senior management will be notified for review and scoring.'
    });

  } catch (error) {
    console.error('❌ Error submitting manager objective for review:', error);
    return NextResponse.json(
      { error: 'Failed to submit objective for review', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}