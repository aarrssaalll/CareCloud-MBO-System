import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Senior Management: Assigning objective to manager');
    // Note: Authentication handled at frontend level for consistency with other APIs

    const body = await request.json();
    const {
      managerId,
      title,
      description,
      category,
      target,
      weight,
      dueDate,
      quarter,
      year,
      assignedBy
    } = body;

    // Validate required fields
    if (!managerId || !title || !description || !target || !dueDate) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: managerId, title, description, target, dueDate' 
      }, { status: 400 });
    }

    // Verify the manager exists and is actually a manager
    const manager = await prisma.mboUser.findUnique({
      where: { id: managerId },
      select: {
        id: true,
        name: true,
        role: true,
        email: true,
        title: true,
        department: {
          select: {
            name: true
          }
        }
      }
    });

    // Get senior manager details if assignedBy is provided
    const seniorManager = assignedBy ? await prisma.mboUser.findUnique({
      where: { id: assignedBy },
      select: { name: true }
    }) : null;

    if (!manager) {
      return NextResponse.json({ 
        success: false, 
        error: 'Manager not found' 
      }, { status: 404 });
    }

    // Verify manager role
    if (!['MANAGER', 'manager', 'SENIOR_MANAGEMENT', 'senior-management'].includes(manager.role)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Selected user is not a manager' 
      }, { status: 400 });
    }

    // Validate weight allocation for the quarter
    const requestedQuarter = quarter || `Q${Math.ceil((new Date().getMonth() + 1) / 3)}`;
    const requestedYear = year || new Date().getFullYear();
    const requestedWeight = Number(weight) || 20; // Default 20%

    // Check current weight allocation for this manager in the specified quarter
    const currentObjectives = await prisma.mboManagerObjective.findMany({
      where: {
        managerId: managerId,
        quarter: requestedQuarter,
        year: requestedYear
      },
      select: {
        weight: true
      }
    });

    const currentAllocated = currentObjectives.reduce((sum: number, obj: any) => sum + ((obj.weight || 0) * 100), 0);
    const totalAfterAddition = currentAllocated + requestedWeight;

    if (totalAfterAddition > 100) {
      return NextResponse.json({
        success: false,
        error: `Weight allocation would exceed 100% for ${requestedQuarter} ${requestedYear}`,
        details: {
          quarter: requestedQuarter,
          year: requestedYear,
          managerName: manager.name,
          currentAllocated: Math.round(currentAllocated),
          requestedWeight,
          available: Math.max(0, 100 - currentAllocated),
          exceedsBy: totalAfterAddition - 100
        }
      }, { status: 400 });
    }

    // Create the manager objective
    const managerObjective = await prisma.mboManagerObjective.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        category: category || 'performance',
        target: Number(target),
        current: 0,
        weight: Number(weight) / 100, // Convert percentage to decimal
        status: 'ASSIGNED',
        dueDate: new Date(dueDate),
        quarter: quarter || `Q${Math.ceil((new Date().getMonth() + 1) / 3)}`,
        year: year || new Date().getFullYear(),
        managerId: managerId,
        assignedBySeniorManagerId: assignedBy,
        assignedAt: new Date()
      },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            title: true,
            role: true,
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
      }
    });

    // Create notification for the manager
    await prisma.mboNotification.create({
      data: {
        type: 'info',
        title: 'New Objective Assigned',
        message: `You have been assigned a new objective: "${title}" by senior management.`,
        actionRequired: true,
        entityId: managerObjective.id,
        entityType: 'manager_objective',
        userId: managerId
      }
    });

    // Log the assignment
    console.log(`✅ Manager objective assigned:`, {
      id: managerObjective.id,
      title: managerObjective.title,
      manager: manager.name,
      assignedBy: seniorManager?.name || 'Senior Management'
    });

    return NextResponse.json({
      success: true,
      message: 'Objective successfully assigned to manager',
      objective: {
        id: managerObjective.id,
        title: managerObjective.title,
        description: managerObjective.description,
        category: managerObjective.category,
        target: managerObjective.target,
        weight: (managerObjective.weight || 0) * 100, // Convert back to percentage
        status: managerObjective.status,
        dueDate: managerObjective.dueDate,
        quarter: managerObjective.quarter,
        year: managerObjective.year,
        assignedAt: managerObjective.assignedAt,
        manager: {
          id: manager.id,
          name: manager.name,
          title: manager.title,
          department: manager.department?.name
        }
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error assigning manager objective:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Senior Management: Fetching assignable objectives');
    // Note: Authentication handled at frontend level for consistency with other APIs

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const managerId = searchParams.get('managerId');

    // Build where clause
    const whereClause: any = {};
    if (status && status !== 'all') {
      whereClause.status = status.toUpperCase();
    }
    if (managerId) {
      whereClause.managerId = managerId;
    }

    // Get assigned manager objectives
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
        }
      },
      orderBy: [
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
      weight: (obj.weight || 0) * 100, // Convert to percentage
      status: obj.status,
      dueDate: obj.dueDate,
      quarter: obj.quarter,
      year: obj.year,
      progress: obj.target > 0 ? ((obj.current || 0) / obj.target) * 100 : 0,
      assignedAt: obj.assignedAt,
      completedAt: obj.completedAt,
      managerSubmittedAt: obj.managerSubmittedAt,
      managerId: obj.managerId,
      managerName: obj.manager.name,
      managerTitle: obj.manager.title,
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