import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 System Metrics API called');
    
    // Get system-wide metrics efficiently with single queries
    const [
      totalUsers,
      totalObjectives,
      totalManagerObjectives,
      departmentCount,
      completedObjectives,
      completedManagerObjectives,
      pendingObjectives,
      overdueObjectives,
      objectivesWithScores,
      managerObjectivesWithScores
    ] = await Promise.all([
      // Count all users (employees, managers, etc.)
      prisma.mboUser.count(),
      
      // Count total employee objectives
      prisma.mboObjective.count(),
      
      // Count manager objectives
      prisma.mboManagerObjective.count(),
      
      // Count departments
      prisma.mboDepartment.count(),
      
      // Count completed employee objectives
      prisma.mboObjective.count({
        where: {
          status: {
            in: ['COMPLETED', 'BONUS_APPROVED']
          }
        }
      }),
      
      // Count completed manager objectives
      prisma.mboManagerObjective.count({
        where: {
          status: {
            in: ['COMPLETED', 'BONUS_APPROVED', 'SENIOR_APPROVED']
          }
        }
      }),
      
      // Count pending objectives
      prisma.mboObjective.count({
        where: {
          status: {
            in: ['PENDING_REVIEW', 'SUBMITTED_TO_MANAGER', 'NEEDS_REVIEW']
          }
        }
      }),
      
      // Count overdue objectives
      prisma.mboObjective.count({
        where: {
          dueDate: {
            lt: new Date()
          },
          status: {
            not: {
              in: ['COMPLETED', 'BONUS_APPROVED']
            }
          }
        }
      }),
      
      // Placeholder for future use (not needed for average score calculation)
      Promise.resolve([]),
      
      // Get manager objectives with scores
      prisma.mboManagerObjective.findMany({
        where: {
          OR: [
            { aiScore: { not: null } },
            { seniorManagerScore: { not: null } },
            { finalScore: { not: null } }
          ]
        },
        select: {
          aiScore: true,
          seniorManagerScore: true,
          finalScore: true
        }
      })
    ]);

    // Calculate completion percentage
    const totalAllObjectives = totalObjectives + totalManagerObjectives;
    const totalCompletedObjectives = completedObjectives + completedManagerObjectives;
    const averageCompletion = totalAllObjectives > 0 
      ? Math.round((totalCompletedObjectives / totalAllObjectives) * 100) 
      : 0;
    
    // Calculate average score from MANAGER OBJECTIVES ONLY
    let averageScore = 0;
    const managerScores: number[] = [];
    
    // Only use manager objective scores (not employee objectives)
    managerObjectivesWithScores.forEach((obj: any) => {
      const score = obj.finalScore || obj.seniorManagerScore || obj.aiScore;
      if (score && score > 0) {
        managerScores.push(score);
      }
    });
    
    if (managerScores.length > 0) {
      averageScore = Math.round(managerScores.reduce((sum, score) => sum + score, 0) / managerScores.length);
    } else {
      // No manager objectives scored yet, show 0 or could show '-' in frontend
      averageScore = 0;
    }

    // Get comprehensive department performance data
    const departments = await prisma.mboDepartment.findMany({
      include: {
        users: {
          include: {
            objectives: {
              select: {
                id: true,
                status: true,
                reviews: {
                  select: {
                    score: true,
                    aiScore: true
                  }
                }
              }
            },
            assignedManagerObjectives: {
              select: {
                id: true,
                status: true
                // Manager objectives don't have scores yet based on our check
              }
            }
          }
        }
      }
    });

    const departmentPerformance = departments.map((dept: any) => {
      const employeeCount = dept.users.length;
      
      // Get all objectives (both employee and manager objectives)
      const employeeObjectives = dept.users.flatMap((user: any) => user.objectives);
      const managerObjectives = dept.users.flatMap((user: any) => user.assignedManagerObjectives);
      const allObjectives = [...employeeObjectives, ...managerObjectives];
      
      // Calculate completion
      const completedObjectives = allObjectives.filter((obj: any) => 
        obj.status === 'COMPLETED' || obj.status === 'BONUS_APPROVED' || obj.status === 'APPROVED'
      );
      const completionRate = allObjectives.length > 0 
        ? Math.round((completedObjectives.length / allObjectives.length) * 100) 
        : 0;
      
      // Calculate average score (from employee objective reviews only for now)
      const scoredObjectives: number[] = [];
      
      // Include employee objective scores from reviews
      employeeObjectives.forEach((obj: any) => {
        if (obj.reviews && obj.reviews.length > 0) {
          // Get the latest review score
          const latestReview = obj.reviews[obj.reviews.length - 1];
          const score = latestReview.score || latestReview.aiScore;
          if (score && score > 0) {
            scoredObjectives.push(score);
          }
        }
      });
      
      // Manager objectives don't have scores yet (table is empty)
      // When manager objectives get scoring system, add them here
      
      const averageScore = scoredObjectives.length > 0 
        ? Math.round((scoredObjectives.reduce((sum, score) => sum + score, 0) / scoredObjectives.length) * 100) / 100
        : 0;

      return {
        name: dept.name,
        employees: employeeCount,
        completion: completionRate,
        score: averageScore,
        trend: 'stable' as 'up' | 'down' | 'stable', // Default to stable, can be enhanced later
        totalObjectives: allObjectives.length,
        completedObjectives: completedObjectives.length
      };
    }).sort((a: any, b: any) => b.completion - a.completion);

    // Get recent activity (last 10 completed objectives)
    const recentActivity = await prisma.mboObjective.findMany({
      where: {
        status: {
          in: ['COMPLETED', 'BONUS_APPROVED']
        },
        completedAt: {
          not: null
        }
      },
      include: {
        user: {
          select: {
            name: true,
            title: true,
            department: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        completedAt: 'desc'
      },
      take: 10
    });

    const systemMetrics = {
      totalEmployees: totalUsers,
      totalObjectives: totalAllObjectives,
      averageCompletion,
      averageScore,
      pendingReviews: pendingObjectives,
      overdueWorkflows: overdueObjectives,
      departmentCount,
      activeAssignments: totalAllObjectives - totalCompletedObjectives
    };

    console.log('✅ System metrics calculated efficiently:', systemMetrics);

    return NextResponse.json({
      success: true,
      data: {
        systemMetrics,
        departmentPerformance,
        recentActivity: recentActivity.map((activity: any) => ({
          id: activity.id,
          action: 'Completed Objective',
          description: `${activity.user.name} completed "${activity.title}"`,
          user: activity.user.name,
          department: activity.user.department?.name || 'Unknown',
          timestamp: activity.completedAt,
          type: 'completion'
        }))
      }
    });

  } catch (error) {
    console.error('❌ Error calculating system metrics:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: 'Failed to calculate system metrics', details: errorMessage },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}