import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    // Get all users
    const users = await prisma.mboUser.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        managerId: true,
        title: true
      },
      orderBy: {
        role: 'asc'
      }
    });

    // Get all objectives
    const objectives = await prisma.mboObjective.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        userId: true,
        assignedById: true,
        user: {
          select: {
            name: true,
            email: true
          }
        },
        assignedBy: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // Group users by role
    const usersByRole = users.reduce((acc, user) => {
      if (!acc[user.role]) acc[user.role] = [];
      acc[user.role].push(user);
      return acc;
    }, {} as Record<string, typeof users>);

    // Find manager-employee relationships
    const relationships = users
      .filter(user => user.managerId)
      .map(employee => {
        const manager = users.find(u => u.id === employee.managerId);
        return {
          employee: employee.name,
          employeeEmail: employee.email,
          employeeId: employee.id,
          manager: manager?.name || 'Unknown',
          managerEmail: manager?.email || 'Unknown',
          managerId: employee.managerId
        };
      });

    return NextResponse.json({
      success: true,
      summary: {
        totalUsers: users.length,
        totalObjectives: objectives.length,
        usersByRole: Object.keys(usersByRole).map(role => ({
          role,
          count: usersByRole[role].length
        })),
        relationships: relationships.length
      },
      data: {
        users: usersByRole,
        objectives,
        managerEmployeeRelationships: relationships
      }
    });

  } catch (error) {
    console.error('Error fetching debug data:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
