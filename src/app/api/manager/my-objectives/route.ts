import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Fetch manager's strategic objectives (assigned by senior management)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const managerId = searchParams.get('managerId');

    if (!managerId) {
      return NextResponse.json({ error: 'Manager ID is required' }, { status: 400 });
    }

    console.log(`🔍 Fetching strategic objectives for manager: ${managerId}`);

    // Fetch all objectives assigned to this manager by senior management
    const objectives = await prisma.mboManagerObjective.findMany({
      where: {
        managerId: managerId,
      },
      include: {
        assignedBySeniorManager: {
          select: {
            id: true,
            name: true,
            email: true,
            title: true,
          },
        },
        quantitativeData: {
          include: {
            practiceRevenues: {
              orderBy: {
                practiceName: 'asc',
              },
            },
          },
        },
      },
      orderBy: [
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    // Calculate progress for each objective
    const objectivesWithProgress = objectives.map((obj) => {
      let progress = 0;
      
      if (obj.isQuantitative && obj.quantitativeData) {
        // Progress auto-calculated from revenue data
        progress = obj.quantitativeData.overallProgress;
      } else if (obj.target > 0) {
        // For qualitative objectives
        progress = ((obj.current || 0) / obj.target) * 100;
      }

      return {
        ...obj,
        progress: Math.min(Math.round(progress), 100),
      };
    });

    console.log(`📋 Found ${objectivesWithProgress.length} strategic objectives for manager`);

    return NextResponse.json({
      success: true,
      objectives: objectivesWithProgress,
      message: objectivesWithProgress.length === 0 
        ? 'No strategic objectives have been assigned to you by senior management yet.' 
        : `Found ${objectivesWithProgress.length} strategic objectives`
    });

  } catch (error) {
    console.error('❌ Error fetching manager objectives:', error);
    return NextResponse.json(
      { error: 'Failed to fetch objectives', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}