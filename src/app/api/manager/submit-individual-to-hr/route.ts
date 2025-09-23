import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Individual objective submission to HR
export async function POST(request: Request) {
  try {
    const { 
      managerId, 
      objectiveId,
      finalScore,
      aiScore,
      managerComments,
      aiRecommendation,
      managerSignature,
      submissionNotes
    } = await request.json();

    if (!managerId || !objectiveId || !finalScore || !managerComments || !aiScore || !managerSignature) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields for individual HR submission' },
        { status: 400 }
      );
    }

    // Validate that the objective exists and is in AI_SCORED status
    const objective = await prisma.mboObjective.findUnique({
      where: { id: objectiveId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            managerId: true
          }
        }
      }
    });

    if (!objective) {
      return NextResponse.json(
        { success: false, error: 'Objective not found' },
        { status: 404 }
      );
    }

    if (objective.status !== 'AI_SCORED') {
      return NextResponse.json(
        { success: false, error: `Objective "${objective.title}" is not in AI_SCORED status and cannot be submitted to HR` },
        { status: 400 }
      );
    }

    if (objective.user.managerId !== managerId) {
      return NextResponse.json(
        { success: false, error: 'You do not have authority to submit this objective' },
        { status: 403 }
      );
    }

    // Create individual HR submission record
    const hrSubmission = await prisma.mboApproval.create({
      data: {
        type: 'OBJECTIVE_REVIEW_INDIVIDUAL',
        entityId: objectiveId,
        status: 'PENDING',
        comments: JSON.stringify({
          submissionNotes: submissionNotes || '',
          managerSignature: managerSignature,
          objectiveTitle: objective.title,
          employeeName: objective.user.name,
          finalScore: finalScore,
          aiScore: aiScore,
          managerComments: managerComments,
          aiRecommendation: aiRecommendation,
          submittedAt: new Date().toISOString()
        }),
        approverId: managerId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Check if review already exists for this objective
    const existingReview = await prisma.mboObjectiveReview.findFirst({
      where: {
        objectiveId: objectiveId,
        reviewerId: managerId
      }
    });

    if (existingReview) {
      // Update existing review
      await prisma.mboObjectiveReview.update({
        where: { id: existingReview.id },
        data: {
          score: finalScore,
          comments: JSON.stringify({
            managerComments: managerComments,
            aiScore: aiScore,
            aiRecommendation: aiRecommendation,
            submittedToHR: true,
            submissionId: hrSubmission.id,
            submissionType: 'individual'
          }),
          reviewDate: new Date()
        }
      });
    } else {
      // Create new review
      await prisma.mboObjectiveReview.create({
        data: {
          objectiveId: objectiveId,
          reviewerId: managerId,
          score: finalScore,
          comments: JSON.stringify({
            managerComments: managerComments,
            aiScore: aiScore,
            aiRecommendation: aiRecommendation,
            submittedToHR: true,
            submissionId: hrSubmission.id,
            submissionType: 'individual'
          }),
          reviewDate: new Date()
        }
      });
    }

    // Update objective status to SUBMITTED_TO_HR
    await prisma.mboObjective.update({
      where: { id: objectiveId },
      data: { 
        status: 'SUBMITTED_TO_HR',
        submittedToHrAt: new Date(),
        managerReviewedAt: new Date(),
        managerFeedback: managerComments,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      submissionId: hrSubmission.id,
      message: `Successfully submitted "${objective.title}" to HR for individual review`,
      submissionDetails: {
        objectiveId: objectiveId,
        objectiveTitle: objective.title,
        employeeName: objective.user.name,
        finalScore: finalScore,
        submittedAt: hrSubmission.createdAt,
        status: 'PENDING_HR_REVIEW'
      }
    });

  } catch (error) {
    console.error('Error submitting individual objective to HR:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error during individual HR submission' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
