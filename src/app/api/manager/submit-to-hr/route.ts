import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { 
      managerId, 
      reviewedObjectives, 
      managerSignature, 
      submissionNotes 
    } = await request.json();

    if (!managerId || !reviewedObjectives || !Array.isArray(reviewedObjectives) || !managerSignature) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields for HR submission' },
        { status: 400 }
      );
    }

    // Validate that all objectives have been reviewed and scored
    const invalidObjectives = reviewedObjectives.filter(obj => 
      !obj.finalScore || !obj.managerComments || !obj.aiScore
    );

    if (invalidObjectives.length > 0) {
      const missingFields = invalidObjectives.map(obj => {
        const missing = [];
        if (!obj.finalScore) missing.push('finalScore');
        if (!obj.managerComments) missing.push('manager comments');
        if (!obj.aiScore) missing.push('AI score');
        return `"${obj.objectiveTitle || obj.objectiveId}": missing ${missing.join(', ')}`;
      });

      return NextResponse.json(
        { 
          success: false, 
          error: `All objectives must be scored and reviewed before submission. Issues found:\n${missingFields.join('\n')}`,
          details: {
            invalidCount: invalidObjectives.length,
            totalCount: reviewedObjectives.length,
            missingFields: missingFields
          }
        },
        { status: 400 }
      );
    }

    // STRICT WORKFLOW VALIDATION: Ensure all objectives are in AI_SCORED status
    for (const reviewedObj of reviewedObjectives) {
      const objective = await prisma.mboObjective.findUnique({
        where: { id: reviewedObj.objectiveId },
        select: { status: true, title: true }
      });
      
      if (!objective || objective.status !== 'AI_SCORED') {
        return NextResponse.json(
          { success: false, error: `Objective "${objective?.title || 'Unknown'}" is not in AI_SCORED status and cannot be submitted to HR` },
          { status: 400 }
        );
      }
    }

    // Create HR submission record
    const hrSubmission = await prisma.mboApproval.create({
      data: {
        type: 'OBJECTIVE_REVIEW_BATCH',
        entityId: `batch_${Date.now()}`, // Create a unique batch ID
        status: 'PENDING',
        comments: JSON.stringify({
          submissionNotes: submissionNotes || '',
          managerSignature: managerSignature,
          objectiveCount: reviewedObjectives.length,
          submittedAt: new Date().toISOString(),
          objectives: reviewedObjectives.map(obj => ({
            objectiveId: obj.objectiveId,
            employeeId: obj.employeeId,
            employeeName: obj.employeeName,
            objectiveTitle: obj.objectiveTitle,
            finalScore: obj.finalScore,
            aiScore: obj.aiScore,
            managerComments: obj.managerComments,
            aiRecommendation: obj.aiRecommendation
          }))
        }),
        approverId: managerId, // Manager who submitted
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Update each objective review in the database
    for (const reviewedObj of reviewedObjectives) {
      try {
        // Check if review already exists
        const existingReview = await prisma.mboObjectiveReview.findFirst({
          where: {
            objectiveId: reviewedObj.objectiveId,
            reviewerId: managerId
          }
        });

        if (existingReview) {
          // Update existing review
          await prisma.mboObjectiveReview.update({
            where: { id: existingReview.id },
            data: {
              score: reviewedObj.finalScore,
              comments: JSON.stringify({
                managerComments: reviewedObj.managerComments,
                aiScore: reviewedObj.aiScore,
                aiRecommendation: reviewedObj.aiRecommendation,
                submittedToHR: true,
                submissionId: hrSubmission.id
              }),
              reviewDate: new Date()
            }
          });
        } else {
          // Create new review
          await prisma.mboObjectiveReview.create({
            data: {
              objectiveId: reviewedObj.objectiveId,
              reviewerId: managerId,
              score: reviewedObj.finalScore,
              comments: JSON.stringify({
                managerComments: reviewedObj.managerComments,
                aiScore: reviewedObj.aiScore,
                aiRecommendation: reviewedObj.aiRecommendation,
                submittedToHR: true,
                submissionId: hrSubmission.id
              }),
              reviewDate: new Date()
            }
          });
        }

        // Update objective status so it doesn't appear in manager review anymore
        await prisma.mboObjective.update({
          where: { id: reviewedObj.objectiveId },
          data: { 
            status: 'SUBMITTED_TO_HR', // Change from AI_SCORED to SUBMITTED_TO_HR
            submittedToHrAt: new Date(),
            updatedAt: new Date()
          }
        });

      } catch (objError) {
        console.error(`Error updating objective ${reviewedObj.objectiveId}:`, objError);
      }
    }

    // Get HR users to potentially notify them
    const hrUsers = await prisma.mboUser.findMany({
      where: { role: 'HR' },
      select: { id: true, name: true, email: true }
    });

    return NextResponse.json({
      success: true,
      submissionId: hrSubmission.id,
      message: `Successfully submitted ${reviewedObjectives.length} objective reviews to HR`,
      hrNotificationList: hrUsers,
      submissionDetails: {
        batchId: hrSubmission.entityId,
        submittedAt: hrSubmission.createdAt,
        objectiveCount: reviewedObjectives.length,
        status: 'PENDING_HR_REVIEW'
      }
    });

  } catch (error) {
    console.error('Error submitting to HR:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error during HR submission' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Add a GET method to check submission status
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const managerId = searchParams.get('managerId');

    if (!managerId) {
      return NextResponse.json(
        { success: false, error: 'Manager ID is required' },
        { status: 400 }
      );
    }

    // Get recent HR submissions by this manager
    const recentSubmissions = await prisma.mboApproval.findMany({
      where: {
        approverId: managerId,
        type: 'OBJECTIVE_REVIEW_BATCH'
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    const submissionsWithDetails = recentSubmissions.map(submission => {
      let details: any = {};
      try {
        details = JSON.parse(submission.comments || '{}');
      } catch (e) {
        details = {};
      }

      return {
        id: submission.id,
        batchId: submission.entityId,
        status: submission.status,
        submittedAt: submission.createdAt,
        approvedAt: submission.approvedAt,
        objectiveCount: details.objectiveCount || 0,
        submissionNotes: details.submissionNotes || ''
      };
    });

    return NextResponse.json({
      success: true,
      submissions: submissionsWithDetails
    });

  } catch (error) {
    console.error('Error fetching submission history:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
