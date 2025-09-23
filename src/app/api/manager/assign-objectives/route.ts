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

    // Create objectives in the database
    const createdObjectives = await Promise.all(
      objectives.map(async (objective: any) => {
        return await prisma.mboObjective.create({
          data: {
            title: objective.title,
            description: objective.description || '',
            category: objective.category || 'performance',
            target: parseFloat(objective.target) || 100.0,
            current: 0,
            weight: parseFloat(objective.weight) || 1.0,
            status: 'ASSIGNED', // Initial status when manager assigns
            dueDate: new Date(objective.dueDate),
            quarter: objective.quarter || `Q${Math.ceil((new Date().getMonth() + 1) / 3)}`,
            year: new Date().getFullYear(),
            userId: employeeId,
            assignedById: assignedById
          }
        });
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
