import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PUT - Review and update scores for AI-scored manager objectives
export async function PUT(request: NextRequest) {
  try {
    console.log('🔍 Senior Management: Reviewing manager objective');
    // Note: Authentication handled at frontend level for consistency with other APIs

    const body = await request.json();
    const { 
      objectiveId, 
      seniorManagerScore, 
      seniorManagerComments, 
      finalScore 
    } = body;

    if (!objectiveId || seniorManagerScore === undefined || !seniorManagerComments?.trim() || finalScore === undefined) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: objectiveId, seniorManagerScore, seniorManagerComments, finalScore' 
      }, { status: 400 });
    }

    // Validate scores
    if (seniorManagerScore < 0 || seniorManagerScore > 100 || finalScore < 0 || finalScore > 100) {
      return NextResponse.json({ 
        success: false, 
        error: 'Scores must be between 0 and 100' 
      }, { status: 400 });
    }

    // Verify the objective exists and is ready for senior management review
    const objective = await prisma.mboManagerObjective.findFirst({
      where: {
        id: objectiveId,
        status: 'AI_SCORED'
      },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            title: true,
            email: true
          }
        }
      }
    });

    if (!objective) {
      return NextResponse.json({ 
        success: false, 
        error: 'Objective not found or not ready for senior management review' 
      }, { status: 404 });
    }

    // Update the objective with senior management review
    const reviewedObjective = await prisma.mboManagerObjective.update({
      where: { id: objectiveId },
      data: {
        status: 'SENIOR_REVIEWED',
        seniorManagerScore: Number(seniorManagerScore),
        seniorManagerComments: seniorManagerComments.trim(),
        finalScore: Number(finalScore),
        seniorReviewedAt: new Date()
      },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            title: true
          }
        }
      }
    });

    // Create notification for the manager about the review
    await prisma.mboNotification.create({
      data: {
        type: 'info',
        title: 'Objective Reviewed by Senior Management',
        message: `Your objective "${objective.title}" has been reviewed by senior management. Final score: ${finalScore}/10`,
        entityId: objectiveId,
        entityType: 'manager_objective',
        userId: objective.manager.id
      }
    });

    console.log(`✅ Manager objective reviewed by senior management:`, {
      id: reviewedObjective.id,
      title: reviewedObjective.title,
      manager: objective.manager.name,
      aiScore: objective.aiScore,
      seniorScore: seniorManagerScore,
      finalScore: finalScore
    });

    return NextResponse.json({
      success: true,
      message: 'Objective reviewed successfully',
      objective: {
        id: reviewedObjective.id,
        title: reviewedObjective.title,
        status: reviewedObjective.status,
        aiScore: reviewedObjective.aiScore,
        seniorManagerScore: reviewedObjective.seniorManagerScore,
        seniorManagerComments: reviewedObjective.seniorManagerComments,
        finalScore: reviewedObjective.finalScore,
        seniorReviewedAt: reviewedObjective.seniorReviewedAt
      }
    });

  } catch (error) {
    console.error('Error reviewing manager objective:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to review objective',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Submit reviewed objectives to HR for bonus processing
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Senior Management: Submitting manager objectives to HR');
    // Note: Authentication handled at frontend level for consistency with other APIs

    const body = await request.json();
    const { 
      objectiveIds, 
      seniorDigitalSignature, 
      submissionNotes 
    } = body;

    if (!objectiveIds?.length || !seniorDigitalSignature?.trim()) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: objectiveIds, seniorDigitalSignature' 
      }, { status: 400 });
    }

    // Verify all objectives exist and are ready for HR submission
    const objectives = await prisma.mboManagerObjective.findMany({
      where: {
        id: { in: objectiveIds },
        status: 'SENIOR_REVIEWED'
      },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            title: true,
            allocatedBonusAmount: true
          }
        }
      }
    });

    if (objectives.length !== objectiveIds.length) {
      return NextResponse.json({ 
        success: false, 
        error: 'Some objectives not found or not ready for HR submission' 
      }, { status: 404 });
    }

    // Calculate bonus amounts based on final scores
    const submissionResults = await Promise.all(
      objectives.map(async (objective: any) => {
        // Use manager's allocated bonus pool from database
        const bonusPool = objective.manager.allocatedBonusAmount || 312.5; // Default quarterly pool
        
        // Weight factor: percentage of bonus pool this objective represents
        const weightPercentage = (objective.weight || 0) / 100;
        
        // Normalize final score to percentage (if 0-10, convert to 0-100)
        let scorePercentage = objective.finalScore || 0;
        if (scorePercentage <= 10) {
          scorePercentage = (scorePercentage / 10) * 100;
        }
        scorePercentage = Math.min(scorePercentage, 100);
        
        // Calculate bonus:
        // base = bonus pool * weight percentage
        // final = base * (score percentage / 100)
        const baseBonusForObjective = bonusPool * weightPercentage;
        const bonusAmount = baseBonusForObjective * (scorePercentage / 100);

        // Update objective status and add bonus calculation
        const updatedObjective = await prisma.mboManagerObjective.update({
          where: { id: objective.id },
          data: {
            status: 'SUBMITTED_TO_HR',
            seniorDigitalSignature: seniorDigitalSignature.trim(),
            submittedToHrAt: new Date(),
            bonusAmount: bonusAmount
          }
        });

        // Create notification for HR
        await prisma.mboNotification.create({
          data: {
            type: 'info',
            title: 'Manager Objective Submitted for HR Approval',
            message: `Manager objective "${objective.title}" by ${objective.manager.name} submitted for bonus approval. Final score: ${objective.finalScore}/100, Bonus: $${bonusAmount.toFixed(2)}`,
            actionRequired: true,
            entityId: objective.id,
            entityType: 'manager_objective',
            userId: 'hr-notifications' // HR notification system
          }
        });

        // Notify the manager
        await prisma.mboNotification.create({
          data: {
            type: 'success',
            title: 'Objective Submitted to HR',
            message: `Your objective "${objective.title}" has been submitted to HR for final bonus approval.`,
            entityId: objective.id,
            entityType: 'manager_objective',
            userId: objective.manager.id
          }
        });

        return {
          objectiveId: objective.id,
          title: objective.title,
          managerName: objective.manager.name,
          finalScore: objective.finalScore,
          bonusAmount: bonusAmount
        };
      })
    );

    console.log(`✅ ${objectives.length} manager objectives submitted to HR:`, {
      submittedBy: 'Senior Management',
      objectives: submissionResults.map(r => ({ 
        title: r.title, 
        manager: r.managerName, 
        score: r.finalScore, 
        bonus: r.bonusAmount 
      })),
      totalBonusAmount: submissionResults.reduce((sum, r) => sum + r.bonusAmount, 0)
    });

    return NextResponse.json({
      success: true,
      message: `Successfully submitted ${objectives.length} manager objectives to HR for bonus processing`,
      results: submissionResults,
      totalBonusAmount: submissionResults.reduce((sum, r) => sum + r.bonusAmount, 0)
    });

  } catch (error) {
    console.error('Error submitting objectives to HR:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to submit objectives to HR',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}