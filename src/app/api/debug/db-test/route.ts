import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log('🔍 Testing database connection...');

    // Test basic connection
    const userCount = await prisma.mboUser.count();
    console.log('👥 User count:', userCount);

    const objectiveCount = await prisma.mboObjective.count();
    console.log('📋 Objective count:', objectiveCount);

    // Get first few users
    const users = await prisma.mboUser.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    // Get first few objectives
    const objectives = await prisma.mboObjective.findMany({
      take: 5,
      select: {
        id: true,
        title: true,
        userId: true,
        status: true
      }
    });

    return NextResponse.json({
      success: true,
      stats: {
        userCount,
        objectiveCount
      },
      sampleUsers: users,
      sampleObjectives: objectives
    });

  } catch (error) {
    console.error('❌ Database test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
