import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Simulated AI scoring function (you can replace with actual AI integration)
function calculateAIScore(objective: any): { score: number; comments: string; reasoning: string } {
  const { current, target, category, title, description } = objective;
  
  // Calculate achievement percentage
  const achievementRate = (current / target) * 100;
  
  let baseScore = 0;
  let comments = '';
  let reasoning = '';

  if (achievementRate >= 100) {
    baseScore = 90 + Math.min(10, (achievementRate - 100) / 10); // 90-100 for overachievement
    comments = 'Excellent performance! Target exceeded.';
    reasoning = `Achieved ${achievementRate.toFixed(1)}% of target, demonstrating exceptional results.`;
  } else if (achievementRate >= 90) {
    baseScore = 80 + (achievementRate - 90); // 80-90 for near completion
    comments = 'Strong performance, very close to target.';
    reasoning = `Achieved ${achievementRate.toFixed(1)}% of target, showing strong execution.`;
  } else if (achievementRate >= 70) {
    baseScore = 60 + (achievementRate - 70); // 60-80 for good progress
    comments = 'Good progress made towards the objective.';
    reasoning = `Achieved ${achievementRate.toFixed(1)}% of target, indicating solid progress.`;
  } else if (achievementRate >= 50) {
    baseScore = 40 + (achievementRate - 50); // 40-60 for moderate progress
    comments = 'Moderate progress, needs improvement.';
    reasoning = `Achieved ${achievementRate.toFixed(1)}% of target, showing room for improvement.`;
  } else {
    baseScore = Math.max(20, achievementRate / 2); // 20-40 for poor performance
    comments = 'Below expectations, significant improvement needed.';
    reasoning = `Achieved only ${achievementRate.toFixed(1)}% of target, requiring immediate attention.`;
  }

  // Category-based adjustments
  if (category === 'Technical Excellence' && achievementRate > 80) {
    baseScore += 2;
    reasoning += ' Technical objectives bonus applied.';
  }

  return {
    score: Math.min(100, Math.round(baseScore)),
    comments,
    reasoning
  };
}

export async function POST(request: Request) {
  try {
    const { 
      objectiveId, 
      managerId, 
      managerScore, 
      managerComments, 
      useAIScore = true, 
      managerFeedback 
    } = await request.json();

    if (!objectiveId || !managerId) {
      return NextResponse.json({ 
        error: 'Objective ID and Manager ID are required' 
      }, { status: 400 });
    }

    console.log(`🔍 Manager ${managerId} reviewing objective ${objectiveId}`);

    // Get the objective details
    const objective = await prisma.mboObjective.findUnique({
      where: { id: objectiveId },
      include: {
        user: {
          select: {
            name: true,
            managerId: true
          }
        }
      }
    });

    if (!objective) {
      return NextResponse.json({ error: 'Objective not found' }, { status: 404 });
    }

    // Verify this manager has authority to review this objective
    if (objective.user.managerId !== managerId) {
      return NextResponse.json({ 
        error: 'You do not have authority to review this objective' 
      }, { status: 403 });
    }

    // Check if objective is in correct state for manager review
    if (objective.status !== 'AI_SCORED') {
      return NextResponse.json({ 
        error: 'Objective must be AI-scored before manager review' 
      }, { status: 400 });
    }

    // Calculate AI score
    const aiResult = calculateAIScore(objective);
    console.log(`🤖 AI calculated score: ${aiResult.score} for objective ${objective.title}`);

    // Determine final score (manager can override AI)
    const finalScore = managerScore !== undefined ? managerScore : aiResult.score;
    const isOverride = managerScore !== undefined && managerScore !== aiResult.score;

    // Create the objective review using raw SQL to include new columns
    const reviewId = `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await prisma.$executeRaw`
      INSERT INTO mbo_objective_reviews 
      (id, objectiveId, reviewerId, score, comments, reviewType, aiScore, aiComments, manualOverride, reviewDate)
      VALUES (${reviewId}, ${objectiveId}, ${managerId}, ${finalScore}, ${managerComments || aiResult.comments}, 
              'MANAGER', ${aiResult.score}, ${aiResult.comments + ' ' + aiResult.reasoning}, ${isOverride ? 1 : 0}, GETDATE())
    `;

    // Get the created review
    const review = await prisma.mboObjectiveReview.findUnique({
      where: { id: reviewId }
    });

    // Update objective status and timestamps
    await prisma.mboObjective.update({
      where: { id: objectiveId },
      data: {
        status: 'SUBMITTED_TO_HR', // Change from AI_SCORED to SUBMITTED_TO_HR after manager review
        managerReviewedAt: new Date(),
        submittedToHrAt: new Date(), // Add HR submission timestamp
        managerFeedback: managerFeedback || aiResult.reasoning,
        aiScoreMetadata: JSON.stringify({
          aiScore: aiResult.score,
          managerScore: finalScore,
          override: isOverride,
          reasoning: aiResult.reasoning
        })
      }
    });

    console.log(`✅ Manager review completed for objective ${objectiveId}`);
    console.log(`📊 Final Score: ${finalScore} (AI: ${aiResult.score}, Override: ${isOverride})`);

    return NextResponse.json({
      success: true,
      message: 'Objective reviewed successfully',
      review: {
        ...review,
        aiScore: aiResult.score,
        finalScore: finalScore,
        isOverride: isOverride,
        aiReasoning: aiResult.reasoning
      },
      nextStep: 'Ready for HR review'
    });

  } catch (error) {
    console.error('❌ Error reviewing objective:', error);
    return NextResponse.json(
      { error: 'Failed to review objective' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
