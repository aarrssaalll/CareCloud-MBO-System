import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Senior Management: Fetching objectives');
    // Note: Authentication handled at frontend level for consistency with other APIs

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');

    let whereClause: any = {};
    let completed: any[] = [];
    let reviewed: any[] = [];

    if (statusParam === 'completed') {
      // Get manager objectives that are completed and ready for review/AI scoring
      const completedObjectives = await prisma.mboManagerObjective.findMany({
        where: {
          status: 'MANAGER_SUBMITTED'
        },
        include: {
          manager: {
            select: {
              id: true,
              name: true,
              title: true,
              email: true,
              department: {
                select: {
                  name: true
                }
              }
            }
          },
          assignedBySeniorManager: {
            select: {
              id: true,
              name: true,
              title: true
            }
          }
        },
        orderBy: [
          { managerSubmittedAt: 'asc' }
        ]
      });

      // Get AI scored objectives ready for senior management review
      const reviewedObjectives = await prisma.mboManagerObjective.findMany({
        where: {
          status: {
            in: ['AI_SCORED', 'SENIOR_REVIEWED']
          }
        },
        include: {
          manager: {
            select: {
              id: true,
              name: true,
              title: true,
              email: true,
              department: {
                select: {
                  name: true
                }
              }
            }
          },
          assignedBySeniorManager: {
            select: {
              id: true,
              name: true,
              title: true
            }
          }
        },
        orderBy: [
          { aiScoredAt: 'asc' }
        ]
      });

      // Format completed objectives (ready for AI scoring)
      completed = completedObjectives.map((obj: any) => ({
        id: obj.id,
        title: obj.title,
        description: obj.description,
        category: obj.category,
        target: obj.target,
        current: obj.current || 0,
        weight: (obj.weight || 0) * 100,
        status: obj.status,
        dueDate: obj.dueDate,
        quarter: obj.quarter,
        year: obj.year,
        progress: obj.target > 0 ? ((obj.current || 0) / obj.target) * 100 : 0,
        completedAt: obj.completedAt,
        managerSubmittedAt: obj.managerSubmittedAt,
        managerId: obj.managerId,
        managerName: obj.manager.name,
        managerTitle: obj.manager.title,
        managerEmail: obj.manager.email,
        managerDepartment: obj.manager.department?.name,
        managerRemarks: obj.managerRemarks,
        managerEvidence: obj.managerEvidence,
        managerDigitalSignature: obj.managerDigitalSignature
      }));

      // Format reviewed objectives (AI scored, ready for senior review)
      reviewed = reviewedObjectives.map((obj: any) => ({
        id: obj.id,
        title: obj.title,
        description: obj.description,
        category: obj.category,
        target: obj.target,
        current: obj.current || 0,
        weight: (obj.weight || 0) * 100,
        status: obj.status,
        dueDate: obj.dueDate,
        quarter: obj.quarter,
        year: obj.year,
        progress: obj.target > 0 ? ((obj.current || 0) / obj.target) * 100 : 0,
        completedAt: obj.completedAt,
        managerSubmittedAt: obj.managerSubmittedAt,
        aiScoredAt: obj.aiScoredAt,
        seniorReviewedAt: obj.seniorReviewedAt,
        managerId: obj.managerId,
        managerName: obj.manager.name,
        managerTitle: obj.manager.title,
        managerEmail: obj.manager.email,
        managerDepartment: obj.manager.department?.name,
        managerRemarks: obj.managerRemarks,
        managerEvidence: obj.managerEvidence,
        managerDigitalSignature: obj.managerDigitalSignature,
        aiScore: obj.aiScore,
        aiComments: obj.aiComments,
        seniorManagerScore: obj.seniorManagerScore,
        seniorManagerComments: obj.seniorManagerComments,
        finalScore: obj.finalScore
      }));

    } else {
      // Handle other status queries or return all
      if (statusParam && statusParam !== 'all') {
        whereClause.status = statusParam.toUpperCase();
      }

      const objectives = await prisma.mboManagerObjective.findMany({
        where: whereClause,
        include: {
          manager: {
            select: {
              id: true,
              name: true,
              title: true,
              email: true,
              department: {
                select: {
                  name: true
                }
              }
            }
          },
          assignedBySeniorManager: {
            select: {
              id: true,
              name: true,
              title: true
            }
          }
        },
        orderBy: [
          { status: 'asc' },
          { dueDate: 'asc' },
          { createdAt: 'desc' }
        ]
      });

      const formattedObjectives = objectives.map((obj: any) => ({
        id: obj.id,
        title: obj.title,
        description: obj.description,
        category: obj.category,
        target: obj.target,
        current: obj.current || 0,
        weight: (obj.weight || 0) * 100,
        status: obj.status,
        dueDate: obj.dueDate,
        quarter: obj.quarter,
        year: obj.year,
        progress: obj.target > 0 ? ((obj.current || 0) / obj.target) * 100 : 0,
        assignedAt: obj.assignedAt,
        completedAt: obj.completedAt,
        managerSubmittedAt: obj.managerSubmittedAt,
        aiScoredAt: obj.aiScoredAt,
        seniorReviewedAt: obj.seniorReviewedAt,
        submittedToHrAt: obj.submittedToHrAt,
        managerId: obj.managerId,
        managerName: obj.manager.name,
        managerTitle: obj.manager.title,
        managerEmail: obj.manager.email,
        managerDepartment: obj.manager.department?.name,
        managerRemarks: obj.managerRemarks,
        managerEvidence: obj.managerEvidence,
        aiScore: obj.aiScore,
        aiComments: obj.aiComments,
        seniorManagerScore: obj.seniorManagerScore,
        seniorManagerComments: obj.seniorManagerComments,
        finalScore: obj.finalScore
      }));

      return NextResponse.json({
        success: true,
        objectives: formattedObjectives
      });
    }

    return NextResponse.json({
      success: true,
      completed: completed,
      reviewed: reviewed
    });

  } catch (error) {
    console.error('Error fetching manager objectives:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch manager objectives',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}