import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    } catch (error) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    // Check if user is senior management
    if (!['SENIOR_MANAGEMENT', 'senior-management', 'senior_management'].includes(decoded.role)) {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get all managers (excluding senior management and employees)
    const managers = await prisma.mboUser.findMany({
      where: {
        role: {
          in: ['MANAGER', 'manager']
        }
      },
      select: {
        id: true,
        employeeId: true,
        email: true,
        firstName: true,
        lastName: true,
        name: true,
        role: true,
        title: true,
        department: {
          select: {
            name: true
          }
        },
        team: {
          select: {
            name: true
          }
        },
        managedUsers: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            managerObjectives: true
          }
        }
      },
      orderBy: [
        { name: 'asc' }
      ]
    });

    // Format managers for frontend
    const formattedManagers = managers.map((manager: any) => ({
      id: manager.id,
      employeeId: manager.employeeId,
      email: manager.email,
      firstName: manager.firstName,
      lastName: manager.lastName,
      name: manager.name,
      role: manager.role,
      title: manager.title,
      department: manager.department?.name,
      team: manager.team?.name,
      directReports: manager.managedUsers.length,
      currentObjectives: manager._count.managerObjectives
    }));

    return NextResponse.json({
      success: true,
      managers: formattedManagers
    });

  } catch (error) {
    console.error('Error fetching managers:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch managers',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}