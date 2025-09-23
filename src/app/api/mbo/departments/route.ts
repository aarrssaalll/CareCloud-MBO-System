import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch departments and teams for HR module
export async function GET() {
  try {
    console.log('🏢 HR Module - Fetching departments and teams');

    const departments = await prisma.mboDepartment.findMany({
      include: {
        teams: {
          select: {
            id: true,
            name: true,
            leaderId: true
          }
        },
        manager: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            users: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`✅ HR Module - Found ${departments.length} departments`);

    return NextResponse.json({
      success: true,
      data: departments
    });

  } catch (error) {
    console.error('❌ HR Module - Error fetching departments:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch departments'
    }, { status: 500 });
  }
}
