import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface PerformanceData {
  quarter: string;
  score: number;
  bonus: number;
  objectives: number;
  ranking: number;
}

interface QuarterlyDetail {
  quarter: string;
  totalObjectives: number;
  completedObjectives: number;
  avgScore: number;
  bonusEligible: boolean;
  bonusAmount: number;
  feedback: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log('📊 Performance trends API called for userId:', userId);

    // Get user to determine role
    const user = await prisma.mboUser.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        name: true, 
        role: true,
        email: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('👤 User role:', user.role);

    let performanceHistory: PerformanceData[] = [];
    let quarterlyDetails: QuarterlyDetail[] = [];
    let teamMembers: any[] = [];

    // MANAGER: Get team members' performance data
    if (user.role === 'MANAGER') {
      console.log('🔍 Fetching team members for manager...');
      
      // Get all team members (subordinates)
      teamMembers = await prisma.mboUser.findMany({
        where: {
          managerId: userId
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      });

      console.log(`👥 Found ${teamMembers.length} team members`);

      if (teamMembers.length > 0) {
        const teamMemberIds = teamMembers.map((member: any) => member.id);

        // Get all objectives for team members with reviews
        const teamObjectives = await prisma.mboObjective.findMany({
          where: {
            userId: {
              in: teamMemberIds
            }
          },
          include: {
            reviews: {
              select: {
                id: true,
                score: true,
                comments: true,
                reviewDate: true,
                reviewType: true
              }
            },
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        console.log(`📋 Found ${teamObjectives.length} team objectives`);

        // Get all bonuses for team members
        const teamBonuses = await prisma.mboBonus.findMany({
          where: {
            employeeId: {
              in: teamMemberIds
            }
          },
          include: {
            employee: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: [
            { year: 'desc' },
            { quarter: 'desc' }
          ]
        });

        console.log(`💰 Found ${teamBonuses.length} team bonuses`);

        // Group objectives by quarter and year
        const objectivesByQuarter = teamObjectives.reduce((acc: any, obj: any) => {
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

        // Group bonuses by quarter and year
        const bonusesByQuarter = teamBonuses.reduce((acc: any, bonus: any) => {
          const key = `${bonus.quarter} ${bonus.year}`;
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(bonus);
          return acc;
        }, {});

        // Create performance history combining objectives and bonuses
        const quarters = Object.keys({ ...objectivesByQuarter, ...bonusesByQuarter });
        
        performanceHistory = quarters.map(quarterKey => {
          const objData = objectivesByQuarter[quarterKey];
          const bonusData = bonusesByQuarter[quarterKey] || [];

          // Calculate average score from reviews
          let totalScore = 0;
          let scoreCount = 0;

          if (objData && objData.objectives) {
            objData.objectives.forEach((obj: any) => {
              if (obj.reviews && obj.reviews.length > 0) {
                // Prefer MANAGER review, then any review
                const managerReview = obj.reviews.find((r: any) => r.reviewType === 'MANAGER');
                const review = managerReview || obj.reviews[0];
                if (review && review.score) {
                  totalScore += review.score;
                  scoreCount++;
                }
              }
            });
          }

          const avgScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;

          // Calculate total bonus amount
          const totalBonus = bonusData.reduce((sum: number, bonus: any) => sum + (bonus.finalAmount || 0), 0);

          // Count objectives
          const objectivesCount = objData ? objData.objectives.length : 0;

          return {
            quarter: quarterKey,
            score: avgScore,
            bonus: totalBonus,
            objectives: objectivesCount,
            ranking: 0 // Not applicable for team view
          };
        }).sort((a, b) => {
          // Sort by year and quarter
          const [qA, yA] = a.quarter.split(' ');
          const [qB, yB] = b.quarter.split(' ');
          const yearDiff = parseInt(yB) - parseInt(yA);
          if (yearDiff !== 0) return yearDiff;
          return qB.localeCompare(qA);
        });

        // Create quarterly details
        quarterlyDetails = quarters.map(quarterKey => {
          const objData = objectivesByQuarter[quarterKey];
          const bonusData = bonusesByQuarter[quarterKey] || [];

          const objectives = objData ? objData.objectives : [];
          const totalObjectives = objectives.length;
          const completedObjectives = objectives.filter((obj: any) => 
            obj.status === 'COMPLETED' || obj.status === 'HR_APPROVED'
          ).length;

          // Calculate average score
          let totalScore = 0;
          let scoreCount = 0;

          objectives.forEach((obj: any) => {
            if (obj.reviews && obj.reviews.length > 0) {
              const managerReview = obj.reviews.find((r: any) => r.reviewType === 'MANAGER');
              const review = managerReview || obj.reviews[0];
              if (review && review.score) {
                totalScore += review.score;
                scoreCount++;
              }
            }
          });

          const avgScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;
          const totalBonus = bonusData.reduce((sum: number, bonus: any) => sum + (bonus.finalAmount || 0), 0);
          const bonusEligible = bonusData.some((bonus: any) => 
            bonus.status === 'APPROVED' || bonus.status === 'CALCULATED'
          );

          return {
            quarter: quarterKey,
            totalObjectives,
            completedObjectives,
            avgScore,
            bonusEligible,
            bonusAmount: totalBonus,
            feedback: `Team performance for ${quarterKey}. ${completedObjectives}/${totalObjectives} objectives completed.`
          };
        }).sort((a, b) => {
          const [qA, yA] = a.quarter.split(' ');
          const [qB, yB] = b.quarter.split(' ');
          const yearDiff = parseInt(yB) - parseInt(yA);
          if (yearDiff !== 0) return yearDiff;
          return qB.localeCompare(qA);
        });

      }

    } else {
      // EMPLOYEE: Get own performance data
      console.log('🔍 Fetching employee own performance...');

      // Get employee's own objectives with reviews
      const objectives = await prisma.mboObjective.findMany({
        where: {
          userId: userId
        },
        include: {
          reviews: {
            select: {
              id: true,
              score: true,
              comments: true,
              reviewDate: true,
              reviewType: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      console.log(`📋 Found ${objectives.length} employee objectives`);

      // Get employee's own bonuses
      const bonuses = await prisma.mboBonus.findMany({
        where: {
          employeeId: userId
        },
        orderBy: [
          { year: 'desc' },
          { quarter: 'desc' }
        ]
      });

      console.log(`💰 Found ${bonuses.length} employee bonuses`);

      // Group objectives by quarter and year
      const objectivesByQuarter = objectives.reduce((acc: any, obj: any) => {
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

      // Group bonuses by quarter and year
      const bonusesByQuarter = bonuses.reduce((acc: any, bonus: any) => {
        const key = `${bonus.quarter} ${bonus.year}`;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(bonus);
        return acc;
      }, {});

      // Create performance history
      const quarters = Object.keys({ ...objectivesByQuarter, ...bonusesByQuarter });
      
      performanceHistory = quarters.map(quarterKey => {
        const objData = objectivesByQuarter[quarterKey];
        const bonusData = bonusesByQuarter[quarterKey] || [];

        // Calculate average score from reviews
        let totalScore = 0;
        let scoreCount = 0;

        if (objData && objData.objectives) {
          objData.objectives.forEach((obj: any) => {
            if (obj.reviews && obj.reviews.length > 0) {
              const managerReview = obj.reviews.find((r: any) => r.reviewType === 'MANAGER');
              const review = managerReview || obj.reviews[0];
              if (review && review.score) {
                totalScore += review.score;
                scoreCount++;
              }
            }
          });
        }

        const avgScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;
        const totalBonus = bonusData.reduce((sum: number, bonus: any) => sum + (bonus.finalAmount || 0), 0);
        const objectivesCount = objData ? objData.objectives.length : 0;

        return {
          quarter: quarterKey,
          score: avgScore,
          bonus: totalBonus,
          objectives: objectivesCount,
          ranking: 0
        };
      }).sort((a, b) => {
        const [qA, yA] = a.quarter.split(' ');
        const [qB, yB] = b.quarter.split(' ');
        const yearDiff = parseInt(yB) - parseInt(yA);
        if (yearDiff !== 0) return yearDiff;
        return qB.localeCompare(qA);
      });

      // Create quarterly details
      quarterlyDetails = quarters.map(quarterKey => {
        const objData = objectivesByQuarter[quarterKey];
        const bonusData = bonusesByQuarter[quarterKey] || [];

        const objectives = objData ? objData.objectives : [];
        const totalObjectives = objectives.length;
        const completedObjectives = objectives.filter((obj: any) => 
          obj.status === 'COMPLETED' || obj.status === 'HR_APPROVED'
        ).length;

        let totalScore = 0;
        let scoreCount = 0;

        objectives.forEach((obj: any) => {
          if (obj.reviews && obj.reviews.length > 0) {
            const managerReview = obj.reviews.find((r: any) => r.reviewType === 'MANAGER');
            const review = managerReview || obj.reviews[0];
            if (review && review.score) {
              totalScore += review.score;
              scoreCount++;
            }
          }
        });

        const avgScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;
        const totalBonus = bonusData.reduce((sum: number, bonus: any) => sum + (bonus.finalAmount || 0), 0);
        const bonusEligible = bonusData.some((bonus: any) => 
          bonus.status === 'APPROVED' || bonus.status === 'CALCULATED'
        );

        return {
          quarter: quarterKey,
          totalObjectives,
          completedObjectives,
          avgScore,
          bonusEligible,
          bonusAmount: totalBonus,
          feedback: `Performance evaluation for ${quarterKey}. Status: ${bonusData[0]?.status || 'N/A'}`
        };
      }).sort((a, b) => {
        const [qA, yA] = a.quarter.split(' ');
        const [qB, yB] = b.quarter.split(' ');
        const yearDiff = parseInt(yB) - parseInt(yA);
        if (yearDiff !== 0) return yearDiff;
        return qB.localeCompare(qA);
      });
    }

    console.log(`✅ Returning ${performanceHistory.length} performance records and ${quarterlyDetails.length} quarterly details`);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email
      },
      performanceHistory,
      quarterlyDetails,
      teamMembers: user.role === 'MANAGER' ? teamMembers : undefined,
      metadata: {
        totalRecords: performanceHistory.length,
        role: user.role,
        isManager: user.role === 'MANAGER'
      }
    });

  } catch (error) {
    console.error('❌ Error fetching performance trends:', error);
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
