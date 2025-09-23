import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// POST /api/employee/submit-for-review
export async function POST(request: NextRequest) {
  try {
    const { objectiveId, employeeRemarks, digitalSignature } = await request.json();

    if (!objectiveId) {
      return NextResponse.json({ error: 'Objective ID is required' }, { status: 400 });
    }

    console.log(`📝 Employee submitting objective ${objectiveId} for manager review`);

    // Get the objective to check current status
    const objective = await prisma.mboObjective.findUnique({
      where: { id: objectiveId },
      include: {
        user: {
          select: {
            name: true,
            managerId: true,
            manager: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!objective) {
      return NextResponse.json({ error: 'Objective not found' }, { status: 404 });
    }

    // Check if objective is in a state that can be submitted
    const validStatuses = ['ASSIGNED', 'ACTIVE', 'IN_PROGRESS', 'COMPLETED'];
    if (!objective.status || !validStatuses.includes(objective.status)) {
      return NextResponse.json({ 
        error: 'Objective cannot be submitted in current status' 
      }, { status: 400 });
    }

    console.log(`📋 Current objective status: ${objective.status}, proceeding with submission`);

    // Update objective with completion and submission data
    await prisma.mboObjective.update({
      where: { id: objectiveId },
      data: {
        status: 'COMPLETED', // Mark as completed when submitted
        completedAt: new Date(), // Set completion timestamp
        submittedToManagerAt: new Date(),
        employeeRemarks: employeeRemarks || '',
        digitalSignature: digitalSignature || '',
        updatedAt: new Date()
      }
    });

    // Get updated objective
    const updatedObjective = await prisma.mboObjective.findUnique({
      where: { id: objectiveId }
    });

    console.log(`✅ Objective ${objectiveId} submitted for manager review`);
    console.log(`👤 Manager: ${objective.user.manager?.name || 'No manager assigned'}`);
    console.log(`📝 Employee remarks: ${employeeRemarks ? 'Provided' : 'None'}`);

    return NextResponse.json({
      success: true,
      message: 'Objective submitted for manager review',
      objective: updatedObjective,
      manager: objective.user.manager,
      employeeRemarks: employeeRemarks || null
    });

  } catch (error) {
    console.error('❌ Error submitting objective for review:', error);
    return NextResponse.json(
      { error: 'Failed to submit objective for review' },
      { status: 500 }
    );
  }
}
