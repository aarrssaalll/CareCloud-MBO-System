import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    console.log('🔍 Fetching live data for type:', type);

    switch (type) {
      case 'users':
        const users = await prisma.mboUser.findMany();
        return NextResponse.json({
          success: true,
          data: users,
        });

      case 'departments':
        const departments = await prisma.mboDepartment.findMany();
        return NextResponse.json({
          success: true,
          data: departments,
        });

      case 'teams':
        const teams = await prisma.mboTeam.findMany();
        return NextResponse.json({
          success: true,
          data: teams,
        });

      default:
        return NextResponse.json({
          success: false,
          message: 'Invalid type parameter',
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch data',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
