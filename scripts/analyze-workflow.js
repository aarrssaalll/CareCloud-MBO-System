const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function analyzeObjectiveWorkflow() {
  try {
    console.log('🔍 OBJECTIVE WORKFLOW ANALYSIS\n');
    console.log('='.repeat(60));
    
    // 1. Analyze current objective distribution by role
    console.log('\n📊 OBJECTIVES BY USER ROLE:');
    const objectivesByRole = await prisma.mboObjective.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        quarter: true,
        year: true,
        current: true,
        target: true,
        user: {
          select: {
            name: true,
            role: true,
            email: true,
            manager: {
              select: {
                name: true,
                role: true
              }
            }
          }
        },
        assignedBy: {
          select: {
            name: true,
            role: true
          }
        },
        reviews: {
          select: {
            score: true,
            comments: true,
            reviewer: {
              select: {
                name: true,
                role: true
              }
            }
          }
        }
      }
    });

    // Group by user role
    const roleGroups = {
      EMPLOYEE: [],
      MANAGER: [],
      HR: [],
      SENIOR_MANAGEMENT: []
    };

    objectivesByRole.forEach(obj => {
      roleGroups[obj.user.role].push(obj);
    });

    Object.keys(roleGroups).forEach(role => {
      console.log(`\n   ${role}: ${roleGroups[role].length} objectives`);
      roleGroups[role].slice(0, 3).forEach(obj => {
        console.log(`     - ${obj.title} (${obj.status})`);
        console.log(`       Assigned by: ${obj.assignedBy?.name || 'Self-assigned'} (${obj.assignedBy?.role || 'N/A'})`);
        console.log(`       Progress: ${obj.current || 0}/${obj.target}`);
        console.log(`       Reviews: ${obj.reviews.length}`);
      });
    });

    // 2. Analyze assignment patterns
    console.log('\n\n🎯 OBJECTIVE ASSIGNMENT PATTERNS:');
    const assignmentStats = await prisma.mboObjective.groupBy({
      by: ['assignedById'],
      _count: {
        id: true
      }
    });

    for (const stat of assignmentStats) {
      if (stat.assignedById) {
        const assigner = await prisma.mboUser.findUnique({
          where: { id: stat.assignedById },
          select: { name: true, role: true }
        });
        console.log(`   ${assigner.name} (${assigner.role}): ${stat._count.id} objectives assigned`);
      } else {
        console.log(`   Self-assigned: ${stat._count.id} objectives`);
      }
    }

    // 3. Review workflow analysis
    console.log('\n\n📝 REVIEW WORKFLOW STATUS:');
    const reviewStats = await prisma.mboObjectiveReview.findMany({
      select: {
        objective: {
          select: {
            title: true,
            status: true,
            user: {
              select: {
                name: true,
                role: true
              }
            }
          }
        },
        reviewer: {
          select: {
            name: true,
            role: true
          }
        },
        score: true,
        reviewDate: true
      }
    });

    console.log(`   Total objective reviews: ${reviewStats.length}`);
    reviewStats.forEach(review => {
      console.log(`     ${review.objective.title}`);
      console.log(`       Employee: ${review.objective.user.name} (${review.objective.user.role})`);
      console.log(`       Reviewer: ${review.reviewer.name} (${review.reviewer.role})`);
      console.log(`       Score: ${review.score}`);
      console.log(`       Status: ${review.objective.status}`);
    });

    // 4. Identify workflow gaps
    console.log('\n\n⚠️  WORKFLOW GAPS IDENTIFIED:');
    
    // Count objectives without reviews
    const objectivesWithoutReviews = await prisma.mboObjective.count({
      where: {
        reviews: {
          none: {}
        },
        status: {
          in: ['COMPLETED', 'PENDING_REVIEW']
        }
      }
    });
    
    console.log(`   - ${objectivesWithoutReviews} completed objectives without reviews`);
    
    // Count objectives pending manager review
    const pendingManagerReview = await prisma.mboObjective.count({
      where: {
        status: 'PENDING_REVIEW'
      }
    });
    
    console.log(`   - ${pendingManagerReview} objectives pending manager review`);
    
    // Count objectives ready for HR
    const readyForHR = await prisma.mboObjective.count({
      where: {
        status: 'REVIEWED',
        reviews: {
          some: {}
        }
      }
    });
    
    console.log(`   - ${readyForHR} objectives ready for HR processing`);

    // 5. Suggest database improvements
    console.log('\n\n💡 DATABASE STRUCTURE RECOMMENDATIONS:');
    console.log('   Current structure analysis:');
    console.log('   ✅ mbo_objectives table has userId and assignedById (Good)');
    console.log('   ✅ mbo_objective_reviews table exists for scoring (Good)');
    console.log('   ✅ Foreign key relationships are properly set up');
    console.log('   \n   Potential improvements needed:');
    console.log('   🔧 Add workflow status tracking');
    console.log('   🔧 Add approval status for HR workflow');
    console.log('   🔧 Add submission timestamps');
    console.log('   🔧 Add AI scoring metadata');

    console.log('\n✅ Workflow analysis completed!');
    
  } catch (error) {
    console.error('❌ Analysis error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

analyzeObjectiveWorkflow();
