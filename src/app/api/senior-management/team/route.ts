import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    console.log('🔍 Senior Management Team API called');
    const { searchParams } = new URL(request.url);
    const seniorManagerId = searchParams.get('seniorManagerId');
    console.log('📋 Senior Manager ID:', seniorManagerId);

    if (!seniorManagerId) {
      console.log('❌ No senior manager ID provided');
      return NextResponse.json(
        { success: false, error: 'Senior Manager ID is required' },
        { status: 400 }
      );
    }

    // Fetch all managers managed by this senior manager
    console.log('🔍 Fetching subordinate managers for:', seniorManagerId);
    const subordinateManagers = await prisma.mboUser.findMany({
      where: {
        managerId: seniorManagerId,
        role: {
          in: ['MANAGER', 'manager']
        }
      },
      include: {
        objectives: {
          include: {
            reviews: true
          }
        },
        department: true,
        team: true,
        // Get count of managed users
        _count: {
          select: {
            managedUsers: true
          }
        }
      }
    });

    // Calculate metrics for each subordinate manager
    const managersWithMetrics = subordinateManagers.map((manager: any) => {
      const objectives = manager.objectives || [];
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

      // Get team size for this manager
      const teamSize = manager._count?.managedUsers || 0;

      return {
        id: manager.id,
        name: manager.name || `${manager.firstName || ''} ${manager.lastName || ''}`.trim() || 'Unknown',
        email: manager.email,
        role: manager.title || 'Manager',
        department: manager.department?.name || 'N/A',
        teamName: manager.team?.name || 'N/A',
        teamSize: teamSize,
        seniorManager: seniorManagerId,
        objectivesCount: totalObjectives,
        completionRate: completionRate,
        status: primaryStatus,
        detailedStatus: detailedStatus,
        statusCounts: {
          completed: completedCount,
          inProgress: inProgressCount,
          overdue: overdueCount,
          pendingReview: pendingReviewCount,
          total: totalObjectives
        },
        lastActive: manager.updatedAt,
        employeeId: manager.employeeId || 'N/A'
      };
    });

    console.log('✅ Returning subordinate managers:', managersWithMetrics.length);
    console.log('📊 Manager details:', managersWithMetrics);
    
    return NextResponse.json({
      success: true,
      subordinateManagers: managersWithMetrics,
      totalCount: managersWithMetrics.length,
      data: managersWithMetrics // Also include data for compatibility
    });

  } catch (error) {
    console.error('❌ Error fetching subordinate managers:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : 'No stack trace available';
    console.error('❌ Error details:', errorMessage);
    console.error('❌ Stack trace:', errorStack);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}