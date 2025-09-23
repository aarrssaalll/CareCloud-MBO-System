import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { objectiveId, action, managerId } = await request.json();

    if (!objectiveId || !action || !managerId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let result;
    let message = '';

    switch (action) {
      case 'approve':
        result = await prisma.mboObjective.update({
          where: { id: objectiveId },
          data: { status: 'APPROVED' }
        });
        message = 'Objective approved successfully';
        break;

      case 'remind':
        // In a real implementation, you would send a notification/email
        // For now, we'll just update the updatedAt timestamp
        result = await prisma.mboObjective.update({
          where: { id: objectiveId },
          data: { updatedAt: new Date() }
        });
        message = 'Reminder sent to employee';
        break;

      case 'edit':
        // For edit, we'll return the objective data for editing
        // In a real implementation, you might want to handle this differently
        result = await prisma.mboObjective.findUnique({
          where: { id: objectiveId },
          include: {
            user: true,
            reviews: true
          }
        });
        message = 'Objective data retrieved for editing';
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      objective: result,
      message
    });

  } catch (error) {
    console.error('Error performing objective action:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
