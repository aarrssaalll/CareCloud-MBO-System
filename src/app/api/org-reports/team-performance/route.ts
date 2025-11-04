import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching team performance data for org reports...');

    // Get all teams with their members
    const teams = await prisma.mboTeam.findMany({
      include: {
        users: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        department: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`👥 Found ${teams.length} teams`);

    if (teams.length === 0) {
      return NextResponse.json({
        success: true,
        teams: [],
        teamPerformance: [],
        summary: []
      });
    }

    // For each team, fetch their members' objectives and calculate scores
    const teamPerformanceData = await Promise.all(
      teams.map(async (team: typeof teams[0]) => {
        const teamMemberIds = team.users.map((u: typeof team.users[0]) => u.id);

        // Fetch objectives for all team members (both employees and managers)
        const objectives = await prisma.mboObjective.findMany({
          where: {
            userId: {
              in: teamMemberIds
            }
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true
              }
            }
          }
        });

        // Also fetch manager objectives for managers in the team
        const managerObjectives = await prisma.mboManagerObjective.findMany({
          where: {
            managerId: {
              in: teamMemberIds
            }
          },
          include: {
            manager: {
              select: {
                id: true,
                name: true
              }
            }
          }
        });

        console.log(`📋 Team "${team.name}": ${objectives.length} employee objectives, ${managerObjectives.length} manager objectives`);

        // Group objectives by quarter
        const objectivesByQuarter: Record<string, any[]> = {};
        const managerObjectivesByQuarter: Record<string, any[]> = {};

        objectives.forEach((obj: typeof objectives[0]) => {
          const quarterKey = `${obj.quarter} ${obj.year}`;
          if (!objectivesByQuarter[quarterKey]) {
            objectivesByQuarter[quarterKey] = [];
          }
          objectivesByQuarter[quarterKey].push(obj);
        });

        managerObjectives.forEach((obj: typeof managerObjectives[0]) => {
          const quarterKey = `${obj.quarter} ${obj.year}`;
          if (!managerObjectivesByQuarter[quarterKey]) {
            managerObjectivesByQuarter[quarterKey] = [];
          }
          managerObjectivesByQuarter[quarterKey].push(obj);
        });

        // Calculate performance for each quarter
        const quarterlyPerformance: Record<string, number> = {};

        // Process employee objectives
        Object.entries(objectivesByQuarter).forEach(([quarterKey, objs]) => {
          let totalScore = 0;
          let scoreCount = 0;

          objs.forEach((obj: any) => {
            // Calculate score based on completion percentage
            let score = 0;
            if (obj.target > 0 && obj.current !== null) {
              score = Math.min((obj.current / obj.target) * 100, 100);
            }

            totalScore += score;
            scoreCount++;
          });

          const avgScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;
          quarterlyPerformance[quarterKey] = (quarterlyPerformance[quarterKey] || 0) + avgScore;
        });

        // Process manager objectives
        Object.entries(managerObjectivesByQuarter).forEach(([quarterKey, objs]) => {
          let totalScore = 0;
          let scoreCount = 0;

          objs.forEach((obj: any) => {
            let score = null;

            // Priority: finalScore > seniorManagerScore > aiScore > completion percentage
            if (obj.finalScore !== null && obj.finalScore !== undefined) {
              score = obj.finalScore;
            } else if (obj.seniorManagerScore !== null && obj.seniorManagerScore !== undefined) {
              score = obj.seniorManagerScore;
            } else if (obj.aiScore !== null && obj.aiScore !== undefined) {
              score = obj.aiScore;
            } else if (obj.target > 0 && obj.current !== null && obj.current !== undefined) {
              score = Math.min((obj.current / obj.target) * 100, 100);
            }

            if (score !== null) {
              totalScore += score;
              scoreCount++;
            }
          });

          const avgScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;
          quarterlyPerformance[quarterKey] = (quarterlyPerformance[quarterKey] || 0) + avgScore;
        });

        // Average the scores by number of categories (emp + manager)
        Object.keys(quarterlyPerformance).forEach(quarter => {
          const categories = (objectivesByQuarter[quarter]?.length > 0 ? 1 : 0) + 
                            (managerObjectivesByQuarter[quarter]?.length > 0 ? 1 : 0);
          if (categories > 0) {
            quarterlyPerformance[quarter] = Math.round(quarterlyPerformance[quarter] / categories);
          }
        });

        // Calculate overall statistics
        let totalObjectives = objectives.length + managerObjectives.length;
        let completedObjectives = 0;
        let totalScore = 0;

        objectives.forEach((obj: typeof objectives[0]) => {
          if (obj.status === 'COMPLETED' || obj.status === 'HR_APPROVED' || obj.status === 'SUBMITTED_TO_HR') {
            completedObjectives++;
          }
          if (obj.target > 0 && obj.current !== null) {
            totalScore += Math.min((obj.current / obj.target) * 100, 100);
          }
        });

        managerObjectives.forEach((obj: typeof managerObjectives[0]) => {
          if (obj.status === 'COMPLETED' || obj.status === 'HR_APPROVED' || obj.status === 'SUBMITTED_TO_HR') {
            completedObjectives++;
          }
          let score = obj.finalScore || obj.seniorManagerScore || obj.aiScore;
          if (score === null && obj.target > 0 && obj.current !== null) {
            score = Math.min((obj.current / obj.target) * 100, 100);
          }
          if (score !== null) {
            totalScore += score;
          }
        });

        const avgScore = totalObjectives > 0 ? Math.round(totalScore / totalObjectives) : 0;
        const completionRate = totalObjectives > 0 ? Math.round((completedObjectives / totalObjectives) * 100) : 0;

        return {
          teamId: team.id,
          teamName: team.name,
          departmentId: team.departmentId,
          departmentName: team.department?.name || 'Unknown',
          memberCount: team.users.length,
          quarterlyPerformance,
          totalObjectives,
          completedObjectives,
          completionRate,
          avgScore
        };
      })
    );

    console.log(`✅ Calculated performance for ${teamPerformanceData.length} teams`);

    return NextResponse.json({
      success: true,
      teams: teamPerformanceData,
      message: 'Team performance data fetched successfully'
    });

  } catch (error) {
    console.error('❌ Error fetching team performance:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch team performance',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
