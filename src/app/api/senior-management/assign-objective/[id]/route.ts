import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: objectiveId } = await params;
    console.log('🔍 Senior Management: Updating manager objective', objectiveId);

    const body = await request.json();
    const {
      managerId,
      title,
      description,
      category,
      target,
      weight,
      dueDate,
      quarter,
      year
    } = body;

    // Validate required fields
    if (!managerId || !title || !description || !target || !dueDate) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: managerId, title, description, target, dueDate' 
      }, { status: 400 });
    }

    // Verify the objective exists
    const existingObjective = await prisma.mboManagerObjective.findUnique({
      where: { id: objectiveId },
      select: {
        id: true,
        managerId: true,
        quarter: true,
        year: true,
        weight: true
      }
    });

    if (!existingObjective) {
      return NextResponse.json({ 
        success: false, 
        error: 'Objective not found' 
      }, { status: 404 });
    }

    // Verify the manager exists and is actually a manager
    const manager = await prisma.mboUser.findUnique({
      where: { id: managerId },
      select: {
        id: true,
        name: true,
        role: true,
        email: true,
        title: true,
        department: {
          select: {
            name: true
          }
        }
      }
    });

    if (!manager) {
      return NextResponse.json({ 
        success: false, 
        error: 'Manager not found' 
      }, { status: 404 });
    }

    // Verify manager role
    if (!['MANAGER', 'manager', 'SENIOR_MANAGEMENT', 'senior-management'].includes(manager.role)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Selected user is not a manager' 
      }, { status: 400 });
    }

    // Validate weight allocation for the quarter
    const requestedQuarter = quarter || existingObjective.quarter;
    const requestedYear = year || existingObjective.year;
    const requestedWeight = Number(weight) || 20;
    const oldWeight = (existingObjective.weight || 0) * 100;

    // Check current weight allocation for this manager in the specified quarter
    const currentObjectives = await prisma.mboManagerObjective.findMany({
      where: {
        managerId: managerId,
        quarter: requestedQuarter,
        year: requestedYear,
        id: {
          not: objectiveId // Exclude the current objective being edited
        }
      },
      select: {
        weight: true
      }
    });

    const currentAllocated = currentObjectives.reduce((sum: number, obj: any) => sum + ((obj.weight || 0) * 100), 0);
    const totalAfterUpdate = currentAllocated + requestedWeight;

    if (totalAfterUpdate > 100) {
      return NextResponse.json({
        success: false,
        error: `Weight allocation would exceed 100% for ${requestedQuarter} ${requestedYear}`,
        details: {
          quarter: requestedQuarter,
          year: requestedYear,
          managerName: manager.name,
          currentAllocated: Math.round(currentAllocated),
          requestedWeight,
          available: Math.max(0, 100 - currentAllocated),
          exceedsBy: Math.round(totalAfterUpdate - 100)
        }
      }, { status: 400 });
    }

    // Update the objective
    const updatedObjective = await prisma.mboManagerObjective.update({
      where: { id: objectiveId },
      data: {
        title,
        description,
        category,
        target: parseFloat(String(target)),
        weight: requestedWeight / 100,
        dueDate: new Date(dueDate),
        quarter: requestedQuarter,
        year: requestedYear,
        updatedAt: new Date()
      },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            title: true,
            role: true,
            department: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    console.log('✅ Objective updated successfully:', objectiveId);

    return NextResponse.json({
      success: true,
      message: 'Objective updated successfully',
      objective: {
        id: updatedObjective.id,
        title: updatedObjective.title,
        description: updatedObjective.description,
        category: updatedObjective.category,
        target: updatedObjective.target,
        current: updatedObjective.current || 0,
        weight: (updatedObjective.weight || 0) * 100, // Convert back to percentage
        status: updatedObjective.status,
        dueDate: updatedObjective.dueDate,
        quarter: updatedObjective.quarter,
        year: updatedObjective.year,
        updatedAt: updatedObjective.updatedAt,
        manager: {
          id: updatedObjective.manager.id,
          name: updatedObjective.manager.name,
          title: updatedObjective.manager.title,
          department: updatedObjective.manager.department?.name
        }
      }
    });

  } catch (error) {
    console.error('Error updating objective:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update objective',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
