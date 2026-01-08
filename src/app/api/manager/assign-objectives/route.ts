import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { employeeId, objectives, assignedById } = body;

    if (!employeeId || !objectives || !Array.isArray(objectives) || !assignedById) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: employeeId, objectives, assignedById' },
        { status: 400 }
      );
    }

    // Verify employee exists and is managed by the assigner
    const employee = await prisma.mboUser.findFirst({
      where: {
        id: employeeId,
        managerId: assignedById
      }
    });

    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Employee not found or not managed by this user' },
        { status: 404 }
      );
    }

    // Validate weight allocation for each quarter before creating objectives
    const year = new Date().getFullYear();
    const weightValidations = new Map();

    // Check current weight allocation for each quarter
    for (const objective of objectives) {
      const quarter = objective.quarter || `Q${Math.ceil((new Date().getMonth() + 1) / 3)}`;
      const requestedWeight = parseFloat(objective.weight) || 0.2; // Default 20%

      if (!weightValidations.has(quarter)) {
        // Get current weight allocation for this quarter (only active objectives)
        const currentObjectives = await prisma.mboObjective.findMany({
          where: {
            userId: employeeId,
            quarter: quarter,
            year: year,
            status: {
              in: ['ASSIGNED', 'IN_PROGRESS', 'ACTIVE']
            }
          },
          select: {
            weight: true
          }
        });

        const currentAllocated = currentObjectives.reduce((sum: number, obj: any) => sum + (obj.weight || 0), 0);
        weightValidations.set(quarter, { currentAllocated, requestedTotal: 0 });
      }

      const validation = weightValidations.get(quarter);
      validation.requestedTotal += requestedWeight;

      // Check if total would exceed 100% (1.0)
      if (validation.currentAllocated + validation.requestedTotal > 1.0) {
        const available = Math.max(0, 1.0 - validation.currentAllocated);
        return NextResponse.json({
          success: false,
          error: `Weight allocation would exceed 100% for ${quarter}`,
          details: {
            quarter,
            currentAllocated: Math.round(validation.currentAllocated * 100),
            requestedTotal: Math.round(validation.requestedTotal * 100),
            available: Math.round(available * 100),
            exceedsBy: Math.round((validation.currentAllocated + validation.requestedTotal - 1.0) * 100)
          }
        }, { status: 400 });
      }
    }

    // Create objectives in the database (weight validation passed)
    const createdObjectives = await Promise.all(
      objectives.map(async (objective: any) => {
        const newObjective = await prisma.mboObjective.create({
          data: {
            title: objective.title,
            description: objective.description || '',
            category: objective.category || 'performance',
            target: parseFloat(objective.target) || 100.0,
            current: 0,
            weight: parseFloat(objective.weight) || 0.2, // Default 20%
            status: 'ASSIGNED', // Initial status when manager assigns
            dueDate: new Date(objective.dueDate),
            quarter: objective.quarter || `Q${Math.ceil((new Date().getMonth() + 1) / 3)}`,
            year: year,
            userId: employeeId,
            assignedById: assignedById,
            isQuantitative: objective.isQuantitative || false,
            objectiveType: objective.objectiveType || (objective.isQuantitative ? 'QUANTITATIVE' : 'QUALITATIVE'),
          }
        });

        // If quantitative, create quantitative data
        if (objective.isQuantitative && objective.quantitativeData) {
          const quantitative = await prisma.mboQuantitativeEmployeeObjective.create({
            data: {
              employeeObjectiveId: newObjective.id,
              totalTargetRevenue: objective.quantitativeData.totalTargetRevenue,
              currency: objective.quantitativeData.currency || 'USD',
              trackingStartDate: new Date(),
            },
          });

          // Create practice revenues if provided
          if (objective.quantitativeData.practiceRevenues && objective.quantitativeData.practiceRevenues.length > 0) {
            const practicesCount = objective.quantitativeData.practiceRevenues.length;
            const objectiveWeight = parseFloat(objective.weight) || 0.2;
            
            await prisma.mboEmployeePracticeRevenue.createMany({
              data: objective.quantitativeData.practiceRevenues.map((practice: any) => ({
                quantitativeEmployeeObjectiveId: quantitative.id,
                practiceName: practice.practiceName,
                targetRevenue: practice.targetRevenue,
                // If only one practice, use the objective's total weight; otherwise use practice weight or distribute equally
                weight: practice.weight !== undefined 
                  ? practice.weight 
                  : (practicesCount === 1 ? objectiveWeight * 100 : (objectiveWeight * 100) / practicesCount),
              })),
            });
          }
        }

        return newObjective;
      })
    );

    // Fetch updated team member data with objectives count
    const updatedEmployee = await prisma.mboUser.findUnique({
      where: { id: employeeId },
      include: {
        objectives: true,
        _count: {
          select: {
            objectives: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `Successfully assigned ${createdObjectives.length} objectives to ${employee.name}`,
      objectives: createdObjectives,
      updatedEmployee: {
        id: updatedEmployee?.id,
        objectivesCount: updatedEmployee?._count.objectives || 0
      }
    });

  } catch (error) {
    console.error('Error assigning objectives:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

