import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PUT(request: Request) {
  try {
    const { objectiveId, current, status, notes } = await request.json();

    if (!objectiveId) {
      return NextResponse.json(
        { success: false, error: 'Objective ID is required' },
        { status: 400 }
      );
    }

    console.log(`📝 Updating objective ${objectiveId}:`, { current, status, notes });

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date()
    };

    if (current !== undefined) {
      updateData.current = current;
    }
    
    if (status) {
      updateData.status = status;
      // Set completion timestamp when objective is completed
      if (status === 'COMPLETED') {
        updateData.completedAt = new Date();
        console.log(`✅ Objective ${objectiveId} marked as COMPLETED by employee`);
      }
    }

    // Update the objective
    const updatedObjective = await prisma.mboObjective.update({
      where: { id: objectiveId },
      data: updateData,
      include: {
        assignedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            title: true
          }
        }
      }
    });

    // Log update for audit trail
    if (notes) {
      console.log(`📝 Objective ${objectiveId} updated: ${notes}`);
    }

    return NextResponse.json({
      success: true,
      objective: updatedObjective,
      message: 'Objective updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating objective:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    // No need to disconnect with shared prisma instance from @/lib/db
  }
}