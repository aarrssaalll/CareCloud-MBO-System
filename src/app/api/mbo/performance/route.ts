import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    // Fetch performance data from mbo_objectives
    const performanceData = await prisma.mboObjective.findMany({
      where: { userId },
      select: {
        quarter: true,
        year: true,
        current: true,
        target: true,
      },
      orderBy: { year: 'asc' },
    });

    // Transform data to match the expected format
    const transformedData = performanceData.map((item) => {
      const current = item.current ?? 0; // Default to 0 if null
      const target = item.target ?? 1; // Default to 1 to avoid division by zero
      return {
        quarter: `${item.quarter} ${item.year}`,
        score: (current / target) * 100, // Calculate performance percentage
        trend: current >= target ? 'up' : 'down',
      };
    });

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Error fetching performance data:', error);
    return NextResponse.json({ error: 'Failed to fetch performance data' }, { status: 500 });
  }
}
