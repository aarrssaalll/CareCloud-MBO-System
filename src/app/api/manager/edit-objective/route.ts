import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { objectiveId, managerId, title, description, target, dueDate, weight, quarter, year, quantitativeData } = body;

    console.log('🔄 Manager editing objective:', {
      objectiveId,
      managerId,
      title,
      description,
      target,
      dueDate,
      weight,
      quarter,
      year,
      hasQuantitativeData: !!quantitativeData
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
        user: true,
        quantitativeData: {
          include: {
            practiceRevenues: true
          }
        }
      }
    });

    if (!objective) {
      return NextResponse.json({
        success: false,
        error: 'Objective not found or you do not have permission to edit it, or objective is not editable'
      }, { status: 404 });
    }

    // Validate weight allocation if weight or quarter is being changed
    const newWeight = weight ? parseFloat(weight) : (objective.weight ?? 0);
    const newQuarter = quarter || objective.quarter;
    const newYear = year || objective.year;

    // Only validate if weight or quarter changed
    if (newWeight !== objective.weight || newQuarter !== objective.quarter || newYear !== objective.year) {
      // Get current weight allocation for the target quarter (excluding this objective)
      const currentObjectives = await prisma.mboObjective.findMany({
        where: {
          userId: objective.userId,
          quarter: newQuarter,
          year: newYear,
          status: {
            in: ['ASSIGNED', 'IN_PROGRESS', 'ACTIVE']
          },
          id: {
            not: objectiveId // Exclude the current objective
          }
        },
        select: {
          weight: true
        }
      });

      const currentAllocated = currentObjectives.reduce((sum, obj) => sum + (obj.weight || 0), 0);
      const totalWithNew = currentAllocated + newWeight;

      if (totalWithNew > 1.0) {
        const available = Math.max(0, 1.0 - currentAllocated);
        return NextResponse.json({
          success: false,
          error: `Weight allocation would exceed 100% for ${newQuarter} ${newYear}`,
          details: {
            quarter: newQuarter,
            year: newYear,
            currentAllocated: Math.round(currentAllocated * 100),
            requestedWeight: Math.round(newWeight * 100),
            available: Math.round(available * 100),
            exceedsBy: Math.round((totalWithNew - 1.0) * 100)
          }
        }, { status: 400 });
      }
    }

    // Update the objective (note: isQuantitative and objectiveType cannot be changed)
    const updatedObjective = await prisma.mboObjective.update({
      where: { id: objectiveId },
      data: {
        title: title || objective.title,
        description: description || objective.description,
        target: target ? parseFloat(target) : objective.target,
        dueDate: dueDate ? new Date(dueDate) : objective.dueDate,
        weight: newWeight,
        quarter: newQuarter,
        year: newYear,
        updatedAt: new Date()
      },
      include: {
        user: true,
        assignedBy: true,
        quantitativeData: {
          include: {
            practiceRevenues: true
          }
        }
      }
    });

    // Update quantitative data if provided and objective is quantitative
    if (objective.isQuantitative && quantitativeData) {
      // Update total target if changed
      if (quantitativeData.totalTargetRevenue && objective.quantitativeData) {
        await prisma.mboQuantitativeEmployeeObjective.update({
          where: { id: objective.quantitativeData.id },
          data: {
            totalTargetRevenue: parseFloat(quantitativeData.totalTargetRevenue),
            lastUpdatedAt: new Date()
          }
        });
      }

      // Update practice revenues if provided
      if (quantitativeData.practiceRevenues && objective.quantitativeData) {
        // Delete old practices
        await prisma.mboEmployeePracticeRevenue.deleteMany({
          where: { quantitativeEmployeeObjectiveId: objective.quantitativeData.id }
        });

        // Create new practices
        await prisma.mboEmployeePracticeRevenue.createMany({
          data: quantitativeData.practiceRevenues.map((practice: any) => ({
            quantitativeEmployeeObjectiveId: objective.quantitativeData!.id,
            practiceName: practice.practiceName,
            targetRevenue: parseFloat(practice.targetRevenue),
            weight: parseFloat(practice.weight) || 1.0,
          }))
        });
      }
    }

    // Fetch final updated objective with all relations
    const finalObjective = await prisma.mboObjective.findUnique({
      where: { id: objectiveId },
      include: {
        user: true,
        assignedBy: true,
        quantitativeData: {
          include: {
            practiceRevenues: true
          }
        }
      }
    });

    console.log('✅ Objective updated successfully:', finalObjective?.id);

    return NextResponse.json({
      success: true,
      message: 'Objective updated successfully',
      objective: finalObjective
    });

  } catch (error) {
    console.error('❌ Error updating objective:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update objective'
    }, { status: 500 });
  }
}

// DELETE: Delete an objective (manager can delete objectives they assigned)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const objectiveId = searchParams.get('objectiveId');
    const managerId = searchParams.get('managerId');

    if (!objectiveId || !managerId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: objectiveId, managerId'
      }, { status: 400 });
    }

    console.log('🗑️ Manager deleting objective:', { objectiveId, managerId });

    // Verify the objective exists and the manager has permission to delete it
    const objective = await prisma.mboObjective.findFirst({
      where: {
        id: objectiveId,
        assignedById: managerId,
        status: {
          in: ['ASSIGNED', 'IN_PROGRESS', 'ACTIVE'] // Can't delete completed/reviewed objectives
        }
      }
    });

    if (!objective) {
      return NextResponse.json({
        success: false,
        error: 'Objective not found or you do not have permission to delete it, or objective cannot be deleted'
      }, { status: 404 });
    }

    // Delete the objective (cascades to quantitative data and practice revenues)
    await prisma.mboObjective.delete({
      where: { id: objectiveId }
    });

    console.log('✅ Objective deleted successfully');

    return NextResponse.json({
      success: true,
      message: 'Objective deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting objective:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete objective'
    }, { status: 500 });
  }
}