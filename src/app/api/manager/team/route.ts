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
        role: {
          in: ['EMPLOYEE', 'MANAGER'] // Include both employees and managers
        }
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
    const teamMembersWithMetrics = teamMembers.map((member: any) => {
      const objectives = member.objectives || [];
      const totalObjectives = objectives.length;
      
      // Calculate weighted completion rate (same as employee dashboard)
      let completionRate = 0;
      if (totalObjectives > 0) {
        let totalWeight = 0;
        let totalWeightedProgress = 0;

        objectives.forEach((objective: any) => {
          const progress = Math.min((objective.current || 0) / objective.target, 1);
          const weight = objective.weight || 0.2; // Default weight 20%
          totalWeight += weight;
          totalWeightedProgress += progress * weight;
        });

        completionRate = totalWeight > 0 ? Math.round((totalWeightedProgress / totalWeight) * 100) : 0;
      }

      // Count objectives by status for detailed breakdown
      const completedCount = objectives.filter((obj: any) => obj.status === 'COMPLETED' || obj.status === 'BONUS_APPROVED').length;
      const inProgressCount = objectives.filter((obj: any) => obj.status === 'IN_PROGRESS' || obj.status === 'ACTIVE' || obj.status === 'ASSIGNED').length;
      const overdueCount = objectives.filter((obj: any) => 
        new Date(obj.dueDate) < new Date() && 
        (obj.status === 'IN_PROGRESS' || obj.status === 'ACTIVE' || obj.status === 'ASSIGNED')
      ).length;
      const pendingReviewCount = objectives.filter((obj: any) => obj.status === 'SUBMITTED_TO_MANAGER').length;

      // Create detailed status string
      const statusParts = [];
      if (completedCount > 0) statusParts.push(`${completedCount} completed`);
      if (overdueCount > 0) statusParts.push(`${overdueCount} overdue`);
      if (inProgressCount > 0) statusParts.push(`${inProgressCount} in progress`);
      if (pendingReviewCount > 0) statusParts.push(`${pendingReviewCount} pending review`);
      
      const detailedStatus = statusParts.length > 0 ? statusParts.join(', ') : 'No objectives';

      // Determine primary status for UI styling
      let primaryStatus: 'active' | 'pending_review' | 'overdue' | 'completed' = 'active';
      
      if (totalObjectives === 0) {
        primaryStatus = 'active';
      } else if (overdueCount > 0) {
        primaryStatus = 'overdue';
      } else if (pendingReviewCount > 0) {
        primaryStatus = 'pending_review';
      } else if (completedCount === totalObjectives && totalObjectives > 0) {
        primaryStatus = 'completed';
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
        status: primaryStatus,
        detailedStatus: detailedStatus,
        statusCounts: {
          completed: completedCount,
          inProgress: inProgressCount,
          overdue: overdueCount,
          pendingReview: pendingReviewCount
        },
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
