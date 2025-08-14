import { NextRequest, NextResponse } from 'next/server';
import { MboDataAccess } from '@/lib/database/mbo-data-access';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const assignerId = searchParams.get('assignerId');

    const dataAccess = new MboDataAccess();
    let objectives;

    if (userId) {
      objectives = await dataAccess.getObjectivesByUser(userId);
    } else if (assignerId) {
      objectives = await dataAccess.getObjectivesByAssigner(assignerId);
    } else {
      return NextResponse.json({
        success: false,
        message: 'User ID or Assigner ID is required',
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: objectives,
    });
  } catch (error) {
    console.error('Error fetching objectives:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch objectives',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const objective = await request.json();

    const dataAccess = new MboDataAccess();
    const objectiveId = await dataAccess.createObjective(objective);

    // Create approval request for the objective
    if (objective.assignedById) {
      await dataAccess.createApproval({
        type: 'OBJECTIVE',
        entityId: objectiveId,
        status: 'PENDING',
        approverId: objective.assignedById,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Objective created successfully',
      data: { id: objectiveId },
    });
  } catch (error) {
    console.error('Error creating objective:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create objective',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { objectiveId, current } = await request.json();

    if (!objectiveId || current === undefined) {
      return NextResponse.json({
        success: false,
        message: 'Objective ID and current progress are required',
      }, { status: 400 });
    }

    const dataAccess = new MboDataAccess();
    await dataAccess.updateObjectiveProgress(objectiveId, current);

    return NextResponse.json({
      success: true,
      message: 'Objective progress updated successfully',
    });
  } catch (error) {
    console.error('Error updating objective:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update objective',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
