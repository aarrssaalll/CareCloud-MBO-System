import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const managerId = searchParams.get('managerId');

    console.log('🔍 Fetching completed objectives for manager:', managerId);

    if (!managerId) {
      return NextResponse.json(
        { success: false, error: 'Manager ID is required' },
        { status: 400 }
      );
    }

    // Fetch completed objectives from team members that need AI scoring only
    // Objectives with AI_SCORED status should go to the score-reviews page
    const completedObjectives = await prisma.mboObjective.findMany({
      where: {
        user: {
          managerId: managerId
        },
        status: 'COMPLETED' // Only show objectives that need AI scoring
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            title: true
          }
        },
        reviews: true
      },
      orderBy: [
        { submittedToManagerAt: 'desc' }, // Newest transfers first
        { updatedAt: 'desc' }
      ]
    });

    console.log(`📋 Found ${completedObjectives.length} objectives ready for manager action (AI scoring or final review)`);

    // Add metadata about workflow stage for UI
    const objectivesWithMetadata = completedObjectives.map(obj => ({
      ...obj,
      needsAiScoring: obj.status === 'COMPLETED',
      needsFinalReview: obj.status === 'AI_SCORED',
      transferredAt: obj.submittedToManagerAt,
      workflowStage: obj.status
    }));

    return NextResponse.json({
      success: true,
      objectives: objectivesWithMetadata
    });

  } catch (error) {
    console.error('❌ Error fetching completed objectives:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
