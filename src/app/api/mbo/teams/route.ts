import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId');

    if (!departmentId) {
      return NextResponse.json(
        { success: false, error: 'Department ID is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Fetching teams for department:', departmentId);

    // Fetch teams for the specified department
    const teams = await prisma.mboTeam.findMany({
      where: {
        departmentId: departmentId
      },
      select: {
        id: true,
        name: true,
        description: true,
        departmentId: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`✅ Found ${teams.length} teams for department ${departmentId}`);

    return NextResponse.json({
      success: true,
      data: teams,
      message: `Found ${teams.length} teams`
    });

  } catch (error) {
    console.error('❌ Error fetching teams:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch teams',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
