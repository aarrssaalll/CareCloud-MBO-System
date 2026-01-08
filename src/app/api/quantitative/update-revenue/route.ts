import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST: Update quantitative objective revenue data (auto-update from external systems)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { objectiveId, objectiveType, practiceRevenues } = body;

    if (!objectiveId || !objectiveType || !practiceRevenues) {
      return NextResponse.json(
        { error: 'objectiveId, objectiveType, and practiceRevenues are required' },
        { status: 400 }
      );
    }

    console.log(`📊 Updating revenue data for ${objectiveType} objective: ${objectiveId}`);

    if (objectiveType === 'MANAGER') {
      // Update manager quantitative objective
      const quantData = await prisma.mboQuantitativeObjective.findFirst({
        where: { managerObjectiveId: objectiveId },
      });

      if (!quantData) {
        return NextResponse.json(
          { error: 'Quantitative objective not found' },
          { status: 404 }
        );
      }

      // Update practice revenues
      for (const practice of practiceRevenues) {
        await prisma.mboPracticeRevenue.updateMany({
          where: {
            quantitativeObjectiveId: quantData.id,
            practiceName: practice.practiceName,
          },
          data: {
            achievedRevenue: practice.achievedRevenue,
            progressPercentage: (practice.achievedRevenue / practice.targetRevenue) * 100,
          },
        });
      }

      // Recalculate totals
      const practices = await prisma.mboPracticeRevenue.findMany({
        where: { quantitativeObjectiveId: quantData.id },
      });

      const totalAchieved = practices.reduce((sum, p) => sum + (p.achievedRevenue || 0), 0);
      const overallProgress = (totalAchieved / quantData.totalTargetRevenue) * 100;

      const updated = await prisma.mboQuantitativeObjective.update({
        where: { id: quantData.id },
        data: {
          totalAchievedRevenue: totalAchieved,
          overallProgress: Math.min(overallProgress, 100),
          lastUpdatedAt: new Date(),
        },
        include: {
          practiceRevenues: true,
        },
      });

      // Update manager objective current value
      await prisma.mboManagerObjective.update({
        where: { id: objectiveId },
        data: {
          current: overallProgress,
        },
      });

      return NextResponse.json({
        success: true,
        data: updated,
        message: 'Manager quantitative objective updated successfully',
      });

    } else if (objectiveType === 'EMPLOYEE') {
      // Update employee quantitative objective
      const quantData = await prisma.mboQuantitativeEmployeeObjective.findFirst({
        where: { employeeObjectiveId: objectiveId },
      });

      if (!quantData) {
        return NextResponse.json(
          { error: 'Quantitative objective not found' },
          { status: 404 }
        );
      }

      // Update practice revenues
      for (const practice of practiceRevenues) {
        await prisma.mboEmployeePracticeRevenue.updateMany({
          where: {
            quantitativeEmployeeObjectiveId: quantData.id,
            practiceName: practice.practiceName,
          },
          data: {
            achievedRevenue: practice.achievedRevenue,
            progressPercentage: (practice.achievedRevenue / practice.targetRevenue) * 100,
          },
        });
      }

      // Recalculate totals
      const practices = await prisma.mboEmployeePracticeRevenue.findMany({
        where: { quantitativeEmployeeObjectiveId: quantData.id },
      });

      const totalAchieved = practices.reduce((sum, p) => sum + (p.achievedRevenue || 0), 0);
      const overallProgress = (totalAchieved / quantData.totalTargetRevenue) * 100;

      const updated = await prisma.mboQuantitativeEmployeeObjective.update({
        where: { id: quantData.id },
        data: {
          totalAchievedRevenue: totalAchieved,
          overallProgress: Math.min(overallProgress, 100),
          lastUpdatedAt: new Date(),
        },
        include: {
          practiceRevenues: true,
        },
      });

      // Update employee objective current value
      await prisma.mboObjective.update({
        where: { id: objectiveId },
        data: {
          current: overallProgress,
        },
      });

      return NextResponse.json({
        success: true,
        data: updated,
        message: 'Employee quantitative objective updated successfully',
      });

    } else {
      return NextResponse.json(
        { error: 'Invalid objectiveType. Must be MANAGER or EMPLOYEE' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('❌ Error updating revenue data:', error);
    return NextResponse.json(
      { error: 'Failed to update revenue data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET: Fetch quantitative data for an objective
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const objectiveId = searchParams.get('objectiveId');
    const objectiveType = searchParams.get('objectiveType');

    if (!objectiveId || !objectiveType) {
      return NextResponse.json(
        { error: 'objectiveId and objectiveType are required' },
        { status: 400 }
      );
    }

    if (objectiveType === 'MANAGER') {
      const quantData = await prisma.mboQuantitativeObjective.findFirst({
        where: { managerObjectiveId: objectiveId },
        include: {
          practiceRevenues: {
            orderBy: { practiceName: 'asc' },
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: quantData,
      });

    } else if (objectiveType === 'EMPLOYEE') {
      const quantData = await prisma.mboQuantitativeEmployeeObjective.findFirst({
        where: { employeeObjectiveId: objectiveId },
        include: {
          practiceRevenues: {
            orderBy: { practiceName: 'asc' },
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: quantData,
      });

    } else {
      return NextResponse.json(
        { error: 'Invalid objectiveType' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('❌ Error fetching revenue data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
