import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface QuarterlyTrend {
  quarter: string;
  score: number;
  engagement: number;
  completion: number;
}

interface DepartmentPerformance {
  name: string;
  score: number;
  employees: number;
  completion: number;
}

interface ManagerPerformance {
  managerId: string;
  managerName: string;
  totalObjectives: number;
  completedObjectives: number;
  avgScore: number;
  department: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const seniorManagerId = searchParams.get('userId');

    if (!seniorManagerId) {
      return NextResponse.json(
        { error: 'Senior Manager ID is required' },
        { status: 400 }
      );
    }

    console.log('📊 Strategic trends API called for senior manager:', seniorManagerId);

    // Verify user is senior management
    const seniorManager = await prisma.mboUser.findUnique({
      where: { id: seniorManagerId },
      select: { 
        id: true, 
        name: true, 
        role: true,
        email: true
      }
    });

    if (!seniorManager) {
      return NextResponse.json(
        { error: 'Senior Manager not found' },
        { status: 404 }
      );
    }

    if (!['SENIOR_MANAGEMENT', 'senior-management', 'senior_management'].includes(seniorManager.role)) {
      return NextResponse.json(
        { error: 'User is not a senior manager' },
        { status: 403 }
      );
    }

    console.log('👤 Senior Manager verified:', seniorManager.name);

    // ✅ FIX: Get ALL managers in the organization
    // Senior management has oversight of entire organization
    const managers = await prisma.mboUser.findMany({
      where: {
        role: {
          in: ['MANAGER', 'manager']
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        departmentId: true,
        department: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    console.log(`👥 Found ${managers.length} managers in entire organization`);

    if (managers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No managers found',
        quarterlyTrends: [],
        departmentPerformance: [],
        managerPerformance: [],
        overallMetrics: {
          totalManagers: 0,
          totalObjectives: 0,
          completedObjectives: 0,
          avgScore: 0,
          completionRate: 0
        }
      });
    }

    const managerIds = managers.map((m: any) => m.id);

    // Get all manager objectives for these managers
    const managerObjectives = await prisma.mboManagerObjective.findMany({
      where: {
        managerId: {
          in: managerIds
        }
      },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            departmentId: true,
            department: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📋 Found ${managerObjectives.length} manager objectives`);

    // Log each objective for debugging
    managerObjectives.forEach((obj: any, index: number) => {
      console.log(`📊 Objective ${index + 1}: "${obj.title}"`);
      console.log(`   - Target: ${obj.target}, Current: ${obj.current || 0}`);
      console.log(`   - Progress: ${obj.target > 0 ? Math.round(((obj.current || 0) / obj.target) * 100) : 0}%`);
      console.log(`   - finalScore: ${obj.finalScore}, seniorManagerScore: ${obj.seniorManagerScore}, aiScore: ${obj.aiScore}`);
      console.log(`   - Status: ${obj.status}`);
    });

    // Calculate quarterly trends
    const objectivesByQuarter = managerObjectives.reduce((acc: any, obj: any) => {
      const key = `${obj.quarter} ${obj.year}`;
      if (!acc[key]) {
        acc[key] = {
          quarter: obj.quarter,
          year: obj.year,
          objectives: []
        };
      }
      acc[key].objectives.push(obj);
      return acc;
    }, {});

    const quarterlyTrends: QuarterlyTrend[] = Object.keys(objectivesByQuarter).map(quarterKey => {
      const data = objectivesByQuarter[quarterKey];
      const objectives = data.objectives;

      // ✅ FIX: Calculate average score with proper priority and fallback to completion percentage
      let totalScore = 0;
      let scoreCount = 0;

      objectives.forEach((obj: any) => {
        let score = null;
        
        // Priority 1: Use finalScore if available
        if (obj.finalScore !== null && obj.finalScore !== undefined) {
          score = obj.finalScore;
        }
        // Priority 2: Use seniorManagerScore if available
        else if (obj.seniorManagerScore !== null && obj.seniorManagerScore !== undefined) {
          score = obj.seniorManagerScore;
        }
        // Priority 3: Use aiScore if available
        else if (obj.aiScore !== null && obj.aiScore !== undefined) {
          score = obj.aiScore;
        }
        // Priority 4: Calculate from completion percentage (current/target * 100)
        else if (obj.target > 0 && obj.current !== null && obj.current !== undefined) {
          score = Math.min((obj.current / obj.target) * 100, 100);
        }
        
        if (score !== null) {
          totalScore += score;
          scoreCount++;
        }
      });

      const avgScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;

      // Calculate completion rate (include SUBMITTED_TO_HR)
      const completedCount = objectives.filter((obj: any) => 
        obj.status === 'COMPLETED' || obj.status === 'HR_APPROVED' || obj.status === 'SUBMITTED_TO_HR'
      ).length;
      const completion = objectives.length > 0 ? Math.round((completedCount / objectives.length) * 100) : 0;

      // Engagement is based on objectives started/in-progress
      const activeCount = objectives.filter((obj: any) => 
        obj.status === 'IN_PROGRESS' || obj.status === 'MANAGER_SUBMITTED' || obj.status === 'AI_SCORED'
      ).length;
      const engagement = objectives.length > 0 ? Math.round((activeCount / objectives.length) * 100) : 0;

      return {
        quarter: quarterKey,
        score: avgScore,
        engagement: engagement,
        completion: completion
      };
    }).sort((a, b) => {
      // Sort by year and quarter
      const [qA, yA] = a.quarter.split(' ');
      const [qB, yB] = b.quarter.split(' ');
      const yearDiff = parseInt(yB) - parseInt(yA);
      if (yearDiff !== 0) return yearDiff;
      return qB.localeCompare(qA);
    });

    // Calculate department performance
    const departmentMap: any = {};

    managerObjectives.forEach((obj: any) => {
      const deptName = obj.manager?.department?.name || 'Unassigned';
      
      if (!departmentMap[deptName]) {
        departmentMap[deptName] = {
          name: deptName,
          objectives: [],
          managers: new Set()
        };
      }
      
      departmentMap[deptName].objectives.push(obj);
      departmentMap[deptName].managers.add(obj.managerId);
    });

    const departmentPerformance: DepartmentPerformance[] = Object.values(departmentMap).map((dept: any) => {
      const objectives = dept.objectives;
      
      // ✅ FIX: Calculate average score with completion percentage fallback
      let totalScore = 0;
      let scoreCount = 0;
      
      objectives.forEach((obj: any) => {
        let score = null;
        
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
      
      // Calculate completion rate (include SUBMITTED_TO_HR)
      const completedCount = objectives.filter((obj: any) => 
        obj.status === 'COMPLETED' || obj.status === 'HR_APPROVED' || obj.status === 'SUBMITTED_TO_HR'
      ).length;
      const completion = objectives.length > 0 ? Math.round((completedCount / objectives.length) * 100) : 0;
      
      return {
        name: dept.name,
        score: avgScore,
        employees: dept.managers.size,
        completion: completion
      };
    });

    // Calculate individual manager performance
    const managerMap: any = {};

    managerObjectives.forEach((obj: any) => {
      const managerId = obj.managerId;
      
      if (!managerMap[managerId]) {
        managerMap[managerId] = {
          managerId: managerId,
          managerName: obj.manager?.name || 'Unknown',
          department: obj.manager?.department?.name || 'Unassigned',
          objectives: []
        };
      }
      
      managerMap[managerId].objectives.push(obj);
    });

    const managerPerformance: ManagerPerformance[] = Object.values(managerMap).map((mgr: any) => {
      const objectives = mgr.objectives;
      
      // ✅ FIX: Calculate average score with completion percentage fallback
      let totalScore = 0;
      let scoreCount = 0;
      
      objectives.forEach((obj: any) => {
        let score = null;
        
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
      
      // Count completed objectives (include SUBMITTED_TO_HR)
      const completedCount = objectives.filter((obj: any) => 
        obj.status === 'COMPLETED' || obj.status === 'HR_APPROVED' || obj.status === 'SUBMITTED_TO_HR'
      ).length;
      
      return {
        managerId: mgr.managerId,
        managerName: mgr.managerName,
        totalObjectives: objectives.length,
        completedObjectives: completedCount,
        avgScore: avgScore,
        department: mgr.department
      };
    });

    // Calculate overall metrics
    let totalScore = 0;
    let scoreCount = 0;
    let totalCompleted = 0;
    let totalObjectives = managerObjectives.length;

    managerObjectives.forEach((obj: any) => {
      let score = null;
      
      // ✅ FIX: Use proper priority with completion percentage fallback
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
      
      if (obj.status === 'COMPLETED' || obj.status === 'HR_APPROVED' || obj.status === 'SUBMITTED_TO_HR') {
        totalCompleted++;
      }
    });

    const overallAvgScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;
    const completionRate = totalObjectives > 0 ? Math.round((totalCompleted / totalObjectives) * 100) : 0;

    console.log(`✅ Overall Metrics Calculated:
      - Total Score: ${totalScore}
      - Score Count: ${scoreCount}
      - Average Score: ${overallAvgScore}
      - Completed: ${totalCompleted}/${totalObjectives}
      - Completion Rate: ${completionRate}%
    `);

    console.log(`✅ Strategic trends calculated:
      - Quarterly periods: ${quarterlyTrends.length}
      - Departments: ${departmentPerformance.length}
      - Managers tracked: ${managerPerformance.length}
      - Overall avg score: ${overallAvgScore}
      - Completion rate: ${completionRate}%
    `);

    return NextResponse.json({
      success: true,
      seniorManager: {
        id: seniorManager.id,
        name: seniorManager.name,
        email: seniorManager.email
      },
      quarterlyTrends,
      departmentPerformance,
      managerPerformance,
      overallMetrics: {
        totalManagers: managers.length,
        totalObjectives: totalObjectives,
        completedObjectives: totalCompleted,
        avgScore: overallAvgScore,
        completionRate: completionRate
      },
      metadata: {
        totalRecords: managerObjectives.length,
        managersTracked: managers.length
      }
    });

  } catch (error) {
    console.error('❌ Error fetching strategic trends:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
