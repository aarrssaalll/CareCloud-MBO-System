import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching system information...');

    // Get total user count by role
    const users = await prisma.mboUser.groupBy({
      by: ['role'],
      _count: {
        id: true
      }
    });

    const totalUsers = users.reduce((sum: number, group: typeof users[0]) => sum + group._count.id, 0);

    // Get total objectives count
    const totalObjectives = await prisma.mboObjective.count();

    // Get total manager objectives count
    const totalManagerObjectives = await prisma.mboManagerObjective.count();

    // Get completed objectives count
    const completedObjectives = await prisma.mboObjective.count({
      where: {
        status: {
          in: ['COMPLETED', 'HR_APPROVED', 'SUBMITTED_TO_HR']
        }
      }
    });

    // Get completed manager objectives
    const completedManagerObjectives = await prisma.mboManagerObjective.count({
      where: {
        status: {
          in: ['COMPLETED', 'HR_APPROVED', 'SUBMITTED_TO_HR']
        }
      }
    });

    // Get total departments
    const totalDepartments = await prisma.mboDepartment.count();

    // Get total teams
    const totalTeams = await prisma.mboTeam.count();

    // Get user breakdown by role
    const usersByRole: Record<string, number> = {};
    users.forEach((group: any) => {
      usersByRole[group.role] = group._count.id;
    });

    // Get pending approvals (HR_SUBMITTED status)
    const pendingApprovals = await prisma.mboObjective.count({
      where: {
        status: 'HR_SUBMITTED'
      }
    });

    // Get pending manager approvals
    const pendingManagerApprovals = await prisma.mboManagerObjective.count({
      where: {
        status: 'HR_SUBMITTED'
      }
    });

    const totalPendingApprovals = pendingApprovals + pendingManagerApprovals;

    // Get total active bonuses (for current quarter)
    const currentDate = new Date();
    const currentQuarter = `Q${Math.floor(currentDate.getMonth() / 3) + 1} ${currentDate.getFullYear()}`;
    
    const activeBonuses = await prisma.mboBonus.count({
      where: {
        quarter: currentQuarter.split(' ')[0],
        year: parseInt(currentQuarter.split(' ')[1])
      }
    });

    console.log('✅ System info fetched successfully');

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        usersByRole,
        totalObjectives: totalObjectives + totalManagerObjectives,
        completedObjectives: completedObjectives + completedManagerObjectives,
        completionRate: totalObjectives + totalManagerObjectives > 0 
          ? Math.round(((completedObjectives + completedManagerObjectives) / (totalObjectives + totalManagerObjectives)) * 100)
          : 0,
        totalDepartments,
        totalTeams,
        pendingApprovals: totalPendingApprovals,
        activeBonuses,
        databaseStatus: 'Connected',
        systemVersion: '2.4.1',
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error fetching system info:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch system information' },
      { status: 500 }
    );
  }
}
