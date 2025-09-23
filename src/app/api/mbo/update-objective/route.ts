import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request: Request) {
  try {
    const { objectiveId, current, status, notes } = await request.json();

    if (!objectiveId) {
      return NextResponse.json(
        { success: false, error: 'Objective ID is required' },
        { status: 400 }
      );
    }

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

    // If notes provided, could log this in an audit trail (optional)
    if (notes) {
      console.log(`Objective ${objectiveId} updated: ${notes}`);
    }

    return NextResponse.json({
      success: true,
      objective: updatedObjective,
      message: 'Objective updated successfully'
    });

  } catch (error) {
    console.error('Error updating objective:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
