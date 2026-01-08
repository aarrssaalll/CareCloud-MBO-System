const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function detailedDatabaseInspection() {
  try {
    console.log('🔍 DETAILED DATABASE INSPECTION\n');
    console.log('='.repeat(50));
    
    // 1. User Role Distribution
    console.log('\n👥 USER ROLE DISTRIBUTION:');
    const roleStats = await prisma.mboUser.groupBy({
      by: ['role'],
      _count: {
        role: true
      }
    });
    roleStats.forEach(stat => {
      console.log(`   ${stat.role}: ${stat._count.role} users`);
    });
    
    // 2. Users with their manager relationships
    console.log('\n🏗️ USER HIERARCHY (Sample):');
    const usersWithManagers = await prisma.mboUser.findMany({
      select: {
        name: true,
        email: true,
        role: true,
        manager: {
          select: {
            name: true,
            role: true
          }
        },
        department: {
          select: {
            name: true
          }
        },
        team: {
          select: {
            name: true
          }
        }
      },
      take: 10
    });
    
    usersWithManagers.forEach(user => {
      console.log(`   ${user.name} (${user.role})`);
      console.log(`     Department: ${user.department?.name || 'None'}`);
      console.log(`     Team: ${user.team?.name || 'None'}`);
      console.log(`     Manager: ${user.manager?.name || 'None'}`);
      console.log('');
    });
    
    // 3. Objectives by Quarter/Year
    console.log('\n🎯 OBJECTIVES BY PERIOD:');
    const objectiveStats = await prisma.mboObjective.groupBy({
      by: ['quarter', 'year', 'status'],
      _count: {
        id: true
      },
      orderBy: [
        { year: 'desc' },
        { quarter: 'asc' }
      ]
    });
    
    objectiveStats.forEach(stat => {
      console.log(`   ${stat.year} ${stat.quarter} - ${stat.status}: ${stat._count.id} objectives`);
    });
    
    // 4. Recent Objective Reviews
    console.log('\n📝 RECENT OBJECTIVE REVIEWS:');
    const recentReviews = await prisma.mboObjectiveReview.findMany({
      select: {
        score: true,
        comments: true,
        reviewDate: true,
        objective: {
          select: {
            title: true,
            user: {
              select: {
                name: true
              }
            }
          }
        },
        reviewer: {
          select: {
            name: true,
            role: true
          }
        }
      },
      orderBy: {
        reviewDate: 'desc'
      },
      take: 5
    });
    
    recentReviews.forEach(review => {
      console.log(`   Score: ${review.score} - ${review.objective.title}`);
      console.log(`     Employee: ${review.objective.user.name}`);
      console.log(`     Reviewer: ${review.reviewer.name} (${review.reviewer.role})`);
      console.log(`     Date: ${review.reviewDate}`);
      console.log(`     Comments: ${review.comments || 'No comments'}`);
      console.log('');
    });
    
    // 5. Department Structure
    console.log('\n🏢 DEPARTMENT STRUCTURE:');
    const departmentStructure = await prisma.mboDepartment.findMany({
      select: {
        name: true,
        manager: {
          select: {
            name: true,
            role: true
          }
        },
        teams: {
          select: {
            name: true,
            leader: {
              select: {
                name: true
              }
            },
            _count: {
              select: {
                users: true
              }
            }
          }
        },
        _count: {
          select: {
            users: true
          }
        }
      }
    });
    
    departmentStructure.forEach(dept => {
      console.log(`   ${dept.name}`);
      console.log(`     Manager: ${dept.manager?.name || 'No manager assigned'}`);
      console.log(`     Total Users: ${dept._count.users}`);
      console.log(`     Teams:`);
      dept.teams.forEach(team => {
        console.log(`       - ${team.name} (Leader: ${team.leader?.name || 'No leader'}, Users: ${team._count.users})`);
      });
      console.log('');
    });
    
    // 6. Performance Summary
    console.log('\n📊 PERFORMANCE SUMMARY:');
    const avgScores = await prisma.mboObjectiveReview.aggregate({
      _avg: {
        score: true
      },
      _min: {
        score: true
      },
      _max: {
        score: true
      },
      _count: {
        score: true
      }
    });
    
    console.log(`   Total Reviews: ${avgScores._count.score}`);
    console.log(`   Average Score: ${avgScores._avg.score?.toFixed(2) || 'N/A'}`);
    console.log(`   Min Score: ${avgScores._min.score || 'N/A'}`);
    console.log(`   Max Score: ${avgScores._max.score || 'N/A'}`);
    
    console.log('\n✅ Detailed inspection completed!');
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

detailedDatabaseInspection();
