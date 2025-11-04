import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/hr/pending-approvals
export async function GET(request: NextRequest) {
  try {
    console.log(`📋 Fetching objectives submitted by managers and senior management for HR approval`);

    // Get employee objectives that have been submitted to HR for approval or rejected
    const employeeObjectives = await prisma.mboObjective.findMany({
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
            salary: true,
            allocatedBonusAmount: true
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

    // Get manager objectives that have been submitted to HR for approval or rejected
    const managerObjectives = await prisma.mboManagerObjective.findMany({
      where: {
        status: {
          in: ['SUBMITTED_TO_HR', 'REJECTED', 'PENDING_SENIOR_REVIEW', 'SENIOR_APPROVED']
        }
      },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            title: true,
            employeeId: true,
            salary: true,
            allocatedBonusAmount: true
          }
        },
        assignedBySeniorManager: {
          select: {
            id: true,
            name: true,
            email: true,
            title: true
          }
        }
      },
      orderBy: [
        {
          status: 'asc'
        },
        {
          managerSubmittedAt: 'desc'
        }
      ]
    });

    // Combine and normalize the objectives
    const allObjectives = [
      ...employeeObjectives.map((obj: any) => ({
        ...obj,
        objectiveType: 'EMPLOYEE',
        submittedBy: obj.user,
        assignedBy: obj.assignedBy
      })),
      ...managerObjectives.map((obj: any) => ({
        ...obj,
        objectiveType: 'MANAGER',
        submittedBy: obj.manager,
        assignedBy: obj.assignedBySeniorManager,
        submittedToHrAt: obj.managerSubmittedAt
      }))
    ];

    // Sort by submission date
    allObjectives.sort((a: any, b: any) => {
      const dateA = new Date(a.submittedToHrAt || 0);
      const dateB = new Date(b.submittedToHrAt || 0);
      return dateB.getTime() - dateA.getTime();
    });

    console.log(`📊 Found ${allObjectives.length} objectives for HR review (${employeeObjectives.length} employee, ${managerObjectives.length} manager)`);

    return NextResponse.json({
      success: true,
      objectives: allObjectives,
      count: allObjectives.length,
      breakdown: {
        pending: allObjectives.filter((obj: any) => obj.status === 'SUBMITTED_TO_HR').length,
        rejected: allObjectives.filter((obj: any) => obj.status === 'REJECTED').length,
        managerObjectives: managerObjectives.length,
        employeeObjectives: employeeObjectives.length
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
