import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    // Fetch the latest bonus amount for the user
    const bonus = await prisma.mboBonus.findFirst({
      where: { employeeId: userId },
      select: { finalAmount: true },
    });

    if (!bonus) {
      return NextResponse.json({ amount: null });
    }

    return NextResponse.json({ amount: bonus.finalAmount });
  } catch (error) {
    console.error('Error fetching bonus data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
