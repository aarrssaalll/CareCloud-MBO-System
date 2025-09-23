import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const managerId = searchParams.get('managerId');

    if (!managerId) {
      return NextResponse.json(
        { success: false, error: 'Manager ID is required' },
        { status: 400 }
      );
    }

    // Fetch all team members managed by this manager
    const teamMembers = await prisma.mboUser.findMany({
      where: {
        managerId: managerId,
        role: 'EMPLOYEE'
      },
      include: {
        objectives: {
          include: {
            reviews: true
          }
        },
        department: true,
        team: true
      }
    });

    // Calculate metrics for each team member
    const teamMembersWithMetrics = teamMembers.map((member) => {
      const objectives = member.objectives || [];
      const totalObjectives = objectives.length;
      
      // Calculate completion rate
      let completionRate = 0;
      if (totalObjectives > 0) {
        const completedObjectives = objectives.filter(obj => {
          if (obj.current && obj.target) {
            return (obj.current / obj.target) >= 1.0;
          }
          return false;
        }).length;
        completionRate = Math.round((completedObjectives / totalObjectives) * 100);
      }

      // Determine status based on objectives and reviews
      let status: 'active' | 'pending_review' | 'overdue' | 'completed' = 'active';
      
      if (totalObjectives === 0) {
        status = 'active';
      } else {
        const hasUnreviewedObjectives = objectives.some(obj => 
          obj.reviews.length === 0 && obj.status === 'COMPLETED'
        );
        const hasOverdueObjectives = objectives.some(obj => 
          new Date(obj.dueDate) < new Date() && obj.status !== 'COMPLETED'
        );
        const allCompleted = objectives.every(obj => obj.status === 'COMPLETED');

        if (hasOverdueObjectives) {
          status = 'overdue';
        } else if (hasUnreviewedObjectives) {
          status = 'pending_review';
        } else if (allCompleted) {
          status = 'completed';
        }
      }

      return {
        id: member.id,
        name: member.name || `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'Unknown',
        email: member.email,
        role: member.title || 'Employee',
        department: member.department?.name || 'N/A',
        manager: managerId,
        objectivesCount: totalObjectives,
        completionRate: completionRate,
        lastActive: member.updatedAt.toISOString().split('T')[0],
        status: status,
        currentQuarter: `Q${Math.ceil((new Date().getMonth() + 1) / 3)}-${new Date().getFullYear()}`
      };
    });

    return NextResponse.json({
      success: true,
      teamMembers: teamMembersWithMetrics
    });

  } catch (error) {
    console.error('Error fetching team data:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
