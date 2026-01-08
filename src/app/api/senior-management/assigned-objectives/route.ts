import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Senior Management: Fetching assigned objectives');
    // Note: Authentication handled at frontend level for consistency with other APIs

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const managerId = searchParams.get('managerId');
    const seniorManagerId = searchParams.get('seniorManagerId');

    // Build where clause
    const whereClause: any = {};
    
    if (seniorManagerId) {
      whereClause.assignedBySeniorManagerId = seniorManagerId;
    }
    
    if (status && status !== 'all') {
      whereClause.status = status.toUpperCase();
    }
    if (managerId) {
      whereClause.managerId = managerId;
    }

    // Get assigned manager objectives created by this senior manager
    const objectives = await prisma.mboManagerObjective.findMany({
      where: whereClause,
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            title: true,
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
        },
        quantitativeData: {
          include: {
            practiceRevenues: {
              where: {
                isCurrent: true
              }
            }
          }
        }
      },
      orderBy: [
        { status: 'asc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    // Format objectives for frontend
    const formattedObjectives = objectives.map((obj: any) => ({
      id: obj.id,
      title: obj.title,
      description: obj.description,
      category: obj.category,
      target: obj.target,
      current: obj.current || 0,
      weight: obj.weight || 0, // Weight is already a percentage integer (20, 40, etc.)
      status: obj.status,
      dueDate: obj.dueDate,
      quarter: obj.quarter,
      year: obj.year,
      progress: obj.target > 0 ? ((obj.current || 0) / obj.target) * 100 : 0,
      
      // Objective type
      objectiveType: obj.objectiveType || 'qualitative',
      isQuantitative: obj.isQuantitative || false,
      
      // Quantitative data
      quantitativeData: obj.quantitativeData,
      
      // Timestamps
      assignedAt: obj.assignedAt,
      startedAt: obj.startedAt,
      completedAt: obj.completedAt,
      managerSubmittedAt: obj.managerSubmittedAt,
      aiScoredAt: obj.aiScoredAt,
      seniorReviewedAt: obj.seniorReviewedAt,
      submittedToHrAt: obj.submittedToHrAt,
      
      // Manager info
      managerId: obj.managerId,
      managerName: obj.manager.name,
      managerTitle: obj.manager.title,
      managerEmail: obj.manager.email,
      managerDepartment: obj.manager.department?.name,
      
      // Manager submission
      managerRemarks: obj.managerRemarks,
      managerEvidence: obj.managerEvidence,
      managerDigitalSignature: obj.managerDigitalSignature,
      
      // AI scoring
      aiScore: obj.aiScore,
      aiComments: obj.aiComments,
      
      // Senior management review
      seniorManagerScore: obj.seniorManagerScore,
      seniorManagerComments: obj.seniorManagerComments,
      finalScore: obj.finalScore,
      seniorDigitalSignature: obj.seniorDigitalSignature,
      
      // HR data
      hrNotes: obj.hrNotes,
      bonusAmount: obj.bonusAmount
    }));

    console.log('📊 Total objectives found:', formattedObjectives.length);
    console.log('📊 Objective statuses:', formattedObjectives.map((o: any) => o.status));

    return NextResponse.json({
      success: true,
      objectives: formattedObjectives
    });

  } catch (error) {
    console.error('Error fetching assigned objectives:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch assigned objectives',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
