import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const bonuses = await prisma.mboBonus.findMany({
      where: {
        employeeId: userId
      },
      orderBy: {
        year: 'desc',
        quarter: 'desc'
      }
    });

    return NextResponse.json({ bonuses });

  } catch (error) {
    console.error('Error fetching bonus history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}