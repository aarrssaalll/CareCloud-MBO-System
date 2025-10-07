import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/hr/pending-approvals
export async function GET(request: NextRequest) {
  try {
    console.log(`📋 Fetching objectives submitted by managers for HR approval`);

    // Get objectives that have been submitted to HR for approval or rejected (exclude BONUS_APPROVED)
    const objectives = await prisma.mboObjective.findMany({
      where: {
        status: {
          in: ['SUBMITTED_TO_HR', 'REJECTED']
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            title: true,
            employeeId: true,
            salary: true
          }
        },
        assignedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            title: true
          }
        },
        reviews: {
          where: {
            reviewType: 'MANAGER'
          },
          select: {
            id: true,
            score: true,
            comments: true,
            reviewDate: true,
            reviewer: {
              select: {
                id: true,
                name: true,
                title: true
              }
            }
          },
          orderBy: {
            reviewDate: 'desc'
          }
        }
      },
      orderBy: [
        {
          status: 'asc' // Show pending first, then approved/rejected
        },
        {
          submittedToHrAt: 'desc'
        }
      ]
    });

    console.log(`📊 Found ${objectives.length} objectives for HR review (pending and rejected only)`);

    return NextResponse.json({
      success: true,
      objectives: objectives,
      count: objectives.length,
      breakdown: {
        pending: objectives.filter(obj => obj.status === 'SUBMITTED_TO_HR').length,
        rejected: objectives.filter(obj => obj.status === 'REJECTED').length
      }
    });

  } catch (error) {
    console.error('❌ Error fetching HR pending approvals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending HR approvals' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
