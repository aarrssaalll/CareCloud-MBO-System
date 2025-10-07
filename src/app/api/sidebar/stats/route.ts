import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const userRole = searchParams.get('role');

    if (!userId || !userRole) {
      return NextResponse.json(
        { error: 'User ID and role are required' },
        { status: 400 }
      );
    }

    console.log(`📊 Fetching sidebar stats for user: ${userId}, role: ${userRole}`);

    let stats = {};

    switch (userRole.toLowerCase()) {
      case 'employee':
        stats = await getEmployeeStats(userId);
        break;
      case 'manager':
        stats = await getManagerStats(userId);
        break;
      case 'hr':
        stats = await getHRStats(userId);
        break;
      case 'senior-management':
        stats = await getSeniorManagementStats(userId);
        break;
      default:
        stats = await getEmployeeStats(userId); // Default to employee stats
    }

    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error fetching sidebar stats:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch sidebar statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function getEmployeeStats(userId: string) {
  try {
    // Get all objectives for the employee
    const objectives = await prisma.mboObjective.findMany({
      where: { userId: userId },
      select: {
        id: true,
        status: true,
        current: true,
        target: true,
        weight: true,
        dueDate: true,
        createdAt: true,
        updatedAt: true
      }
    });

    const totalObjectives = objectives.length;
    const completedObjectives = objectives.filter((obj: any) => 
      obj.status === 'COMPLETED' || obj.status === 'BONUS_APPROVED'
    ).length;
    
    const activeObjectives = objectives.filter((obj: any) => 
      obj.status === 'ASSIGNED' || obj.status === 'ACTIVE' || obj.status === 'IN_PROGRESS'
    ).length;

    const overdueObjectives = objectives.filter((obj: any) => {
      const isOverdue = new Date(obj.dueDate) < new Date();
      const isActive = obj.status === 'ASSIGNED' || obj.status === 'ACTIVE' || obj.status === 'IN_PROGRESS';
      return isOverdue && isActive;
    }).length;

    // Calculate weighted performance score (same logic as employee dashboard)
    let totalWeightedScore = 0;
    let totalWeight = 0;
    
    objectives.forEach((obj: any) => {
      if (obj.current !== null && obj.target !== null && obj.target > 0) {
        const progress = (obj.current / obj.target) * 100;
        const weight = obj.weight || 1; // Default weight to 1 if not specified
        totalWeightedScore += Math.min(progress, 100) * weight;
        totalWeight += weight;
      }
    });
    
    const completionRate = totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0;

    // Recent activity
    const recentObjectives = objectives
      .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 3);

    return {
      type: 'employee',
      overview: {
        totalObjectives,
        completedObjectives,
        activeObjectives,
        overdueObjectives,
        completionRate: Math.min(completionRate, 100)
      },
      progress: {
        completed: completedObjectives,
        total: totalObjectives,
        percentage: totalObjectives > 0 ? Math.round((completedObjectives / totalObjectives) * 100) : 0
      },
      recentActivity: recentObjectives.map((obj: any) => ({
        id: obj.id,
        status: obj.status,
        progress: obj.current && obj.target ? Math.min(Math.round((obj.current / obj.target) * 100), 100) : 0,
        updatedAt: obj.updatedAt
      }))
    };

  } catch (error) {
    console.error('Error fetching employee stats:', error);
    throw error;
  }
}

async function getManagerStats(userId: string) {
  try {
    // Get all team members managed by this manager (same logic as dashboard)
    const teamMembers = await prisma.mboUser.findMany({
      where: {
        managerId: userId,
        role: 'EMPLOYEE'
      },
      include: {
        objectives: true
      }
    });

    // Get manager's own objectives
    const ownObjectives = await prisma.mboObjective.findMany({
      where: { userId: userId },
      select: {
        id: true,
        status: true,
        current: true,
        target: true,
        weight: true
      }
    });

    // Calculate team metrics using the same logic as dashboard
    let totalTeamObjectives = 0;
    let completedTeamObjectives = 0;
    let pendingReviews = 0;
    const teamMemberCompletionRates: number[] = [];

    teamMembers.forEach(member => {
      const objectives = member.objectives || [];
      totalTeamObjectives += objectives.length;
      
      // Count completed objectives
      completedTeamObjectives += objectives.filter((obj: any) => 
        obj.status === 'COMPLETED' || obj.status === 'BONUS_APPROVED'
      ).length;

      // Count pending reviews
      pendingReviews += objectives.filter((obj: any) => 
        obj.status === 'SUBMITTED_TO_MANAGER'
      ).length;

      // Calculate individual member completion rate (same as dashboard)
      let memberCompletionRate = 0;
      if (objectives.length > 0) {
        let totalWeight = 0;
        let totalWeightedProgress = 0;

        objectives.forEach((objective: any) => {
          const progress = Math.min((objective.current || 0) / objective.target, 1);
          const weight = objective.weight || 0.2; // Default weight 20%
          totalWeight += weight;
          totalWeightedProgress += progress * weight;
        });

        memberCompletionRate = totalWeight > 0 ? Math.round((totalWeightedProgress / totalWeight) * 100) : 0;
      }
      
      teamMemberCompletionRates.push(memberCompletionRate);
    });

    // Calculate average completion rate exactly like dashboard: simple average of member rates
    const teamCompletionRate = teamMembers.length > 0 
      ? Math.round(teamMemberCompletionRates.reduce((sum, rate) => sum + rate, 0) / teamMembers.length) 
      : 0;

    // Manager's own completion rate using weighted average
    const ownCompletionRate = calculateCompletionRate(ownObjectives);

    console.log(`📊 Manager Stats - Team Members: ${teamMembers.length}, Team Objectives: ${totalTeamObjectives}, Team Completion: ${teamCompletionRate}%`);

    return {
      type: 'manager',
      overview: {
        teamMembers: teamMembers.length,
        totalTeamObjectives,
        completedTeamObjectives,
        pendingReviews,
        ownCompletionRate,
        teamCompletionRate
      },
      team: {
        members: teamMembers.length,
        objectives: totalTeamObjectives,
        completed: completedTeamObjectives,
        pending: pendingReviews,
        teamCompletion: teamCompletionRate
      },
      personal: {
        objectives: ownObjectives.length,
        completionRate: ownCompletionRate
      }
    };

  } catch (error) {
    console.error('Error fetching manager stats:', error);
    throw error;
  }
}

async function getHRStats(userId: string) {
  try {
    // Get all objectives in the system
    const allObjectives = await prisma.mboObjective.findMany({
      select: {
        id: true,
        status: true,
        current: true,
        target: true,
        userId: true
      }
    });

    // Get unique users
    const allUsers = await prisma.mboUser.findMany({
      select: {
        id: true,
        role: true,
        name: true,
        firstName: true,
        lastName: true
      }
    });

    const totalEmployees = allUsers.filter((user: any) => 
      user.role?.toLowerCase() === 'employee' || user.role?.toLowerCase() === 'manager'
    ).length;

    const totalObjectives = allObjectives.length;
    const completedObjectives = allObjectives.filter((obj: any) => 
      obj.status === 'COMPLETED' || obj.status === 'BONUS_APPROVED'
    ).length;

    const pendingHRReviews = allObjectives.filter((obj: any) => 
      obj.status === 'SUBMITTED_TO_HR' || obj.status === 'HR_REVIEW'
    ).length;

    const organizationCompletion = totalObjectives > 0 ? 
      Math.round((completedObjectives / totalObjectives) * 100) : 0;

    return {
      type: 'hr',
      overview: {
        totalEmployees,
        totalObjectives,
        completedObjectives,
        pendingHRReviews,
        organizationCompletion
      },
      organization: {
        employees: totalEmployees,
        objectives: totalObjectives,
        completed: completedObjectives,
        completionRate: organizationCompletion
      },
      workflow: {
        pendingReviews: pendingHRReviews,
        awaitingApproval: allObjectives.filter((obj: any) => obj.status === 'MANAGER_APPROVED').length
      }
    };

  } catch (error) {
    console.error('Error fetching HR stats:', error);
    throw error;
  }
}

async function getSeniorManagementStats(userId: string) {
  try {
    // Get comprehensive organization statistics
    const allObjectives = await prisma.mboObjective.findMany({
      select: {
        id: true,
        status: true,
        current: true,
        target: true,
        weight: true,
        quarter: true,
        year: true
      }
    });

    const allUsers = await prisma.mboUser.findMany({
      select: {
        id: true,
        role: true
      }
    });

    const currentYear = new Date().getFullYear();
    const currentQuarter = `Q${Math.ceil((new Date().getMonth() + 1) / 3)}`;

    const currentPeriodObjectives = allObjectives.filter((obj: any) => 
      obj.year === currentYear && obj.quarter === currentQuarter
    );

    const totalEmployees = allUsers.length;
    const totalObjectives = currentPeriodObjectives.length;
    const completedObjectives = currentPeriodObjectives.filter((obj: any) => 
      obj.status === 'COMPLETED' || obj.status === 'BONUS_APPROVED'
    ).length;

    const organizationHealth = calculateOrganizationHealth(currentPeriodObjectives);
    const strategicCompletion = totalObjectives > 0 ? 
      Math.round((completedObjectives / totalObjectives) * 100) : 0;

    return {
      type: 'senior-management',
      overview: {
        totalEmployees,
        totalObjectives,
        completedObjectives,
        strategicCompletion,
        organizationHealth
      },
      strategic: {
        currentPeriod: `${currentQuarter} ${currentYear}`,
        objectives: totalObjectives,
        completed: completedObjectives,
        completion: strategicCompletion,
        health: organizationHealth
      },
      organization: {
        employees: totalEmployees,
        managers: allUsers.filter((u: any) => u.role?.toLowerCase() === 'manager').length,
        departments: 5 // This could be calculated from actual department data
      }
    };

  } catch (error) {
    console.error('Error fetching senior management stats:', error);
    throw error;
  }
}

function calculateCompletionRate(objectives: any[]): number {
  if (objectives.length === 0) return 0;
  
  // Calculate weighted performance score (same logic as employee dashboard)
  let totalWeightedScore = 0;
  let totalWeight = 0;
  
  objectives.forEach(obj => {
    if (obj.current !== null && obj.target !== null && obj.target > 0) {
      const progress = (obj.current / obj.target) * 100;
      const weight = obj.weight || 1; // Default weight to 1 if not specified
      totalWeightedScore += Math.min(progress, 100) * weight;
      totalWeight += weight;
    }
  });
  
  return totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0;
}

function calculateOrganizationHealth(objectives: any[]): number {
  if (objectives.length === 0) return 100;
  
  const onTimeObjectives = objectives.filter(obj => {
    const isCompleted = obj.status === 'COMPLETED' || obj.status === 'BONUS_APPROVED';
    const isOnTrack = obj.current && obj.target && (obj.current / obj.target) >= 0.7;
    return isCompleted || isOnTrack;
  }).length;
  
  return Math.round((onTimeObjectives / objectives.length) * 100);
}