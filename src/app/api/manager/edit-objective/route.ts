import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { objectiveId, managerId, title, description, target, dueDate, weight } = body;

    console.log('🔄 Manager editing objective:', {
      objectiveId,
      managerId,
      title,
      description,
      target,
      dueDate,
      weight
    });

    // Verify the objective exists and the manager has permission to edit it
    const objective = await prisma.mboObjective.findFirst({
      where: {
        id: objectiveId,
        assignedById: managerId,
        status: {
          in: ['ASSIGNED', 'IN_PROGRESS', 'ACTIVE']
        }
      },
      include: {
        user: true
      }
    });

    if (!objective) {
      return NextResponse.json({
        success: false,
        error: 'Objective not found or you do not have permission to edit it, or objective is not editable'
      }, { status: 404 });
    }

    // Update the objective
    const updatedObjective = await prisma.mboObjective.update({
      where: { id: objectiveId },
      data: {
        title: title || objective.title,
        description: description || objective.description,
        target: target ? parseInt(target) : objective.target,
        dueDate: dueDate ? new Date(dueDate) : objective.dueDate,
        weight: weight ? parseFloat(weight) : objective.weight,
        updatedAt: new Date()
      },
      include: {
        user: true,
        assignedBy: true
      }
    });

    // Log the edit action (audit trail)
    console.log('📝 Objective edited:', {
      objectiveId,
      managerId,
      changes: {
        title: title !== objective.title ? { from: objective.title, to: title } : null,
        description: description !== objective.description ? 'updated' : null,
        target: target && parseInt(target) !== objective.target ? { from: objective.target, to: parseInt(target) } : null,
        dueDate: dueDate && new Date(dueDate).getTime() !== objective.dueDate.getTime() ? { from: objective.dueDate, to: new Date(dueDate) } : null,
        weight: weight && parseFloat(weight) !== objective.weight ? { from: objective.weight, to: parseFloat(weight) } : null
      }
    });

    console.log('✅ Objective updated successfully:', updatedObjective.id);

    return NextResponse.json({
      success: true,
      message: 'Objective updated successfully',
      objective: updatedObjective
    });

  } catch (error) {
    console.error('❌ Error updating objective:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update objective'
    }, { status: 500 });
  }
}