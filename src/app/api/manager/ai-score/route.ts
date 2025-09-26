import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { 
      objectiveId, 
      title, 
      description, 
      target, 
      current, 
      weight, 
      employeeName, 
      employeeRemarks 
    } = await request.json();

    if (!objectiveId || !title || !description || target === undefined || current === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields for AI scoring' },
        { status: 400 }
      );
    }

    // Verify objective exists and is completed
    const objective = await prisma.mboObjective.findUnique({
      where: { id: objectiveId },
      include: {
        user: {
          select: {
            name: true,
            email: true
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

    // STRICT WORKFLOW VALIDATION: Only allow AI scoring for COMPLETED status
    if (objective.status !== 'COMPLETED') {
      return NextResponse.json(
        { success: false, error: 'Objective must be in COMPLETED status to generate AI score' },
        { status: 400 }
      );
    }

    // Prevent duplicate AI scoring
    if (objective.aiScoreMetadata) {
      return NextResponse.json(
        { success: false, error: 'Objective has already been AI scored' },
        { status: 400 }
      );
    }

    // Calculate completion percentage
    const completionPercentage = Math.min(100, Math.round((current / target) * 100));

    let aiScore;
    let explanation;

    try {
      // Use Gemini AI for scoring via internal API
      const geminiResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/ai-analyze-gemini`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          objective: {
            title: title,
            description: description,
            current: current,
            target: target
          },
          remarks: `Employee: ${employeeName}, Weight: ${weight}%, Achievement: ${completionPercentage}%, Employee Remarks: ${employeeRemarks || ''}`
        }),
      });

      if (geminiResponse.ok) {
        const geminiResult = await geminiResponse.json();
        
        // Convert Gemini's 0-100 score to weight-based score
        const geminiScore = Math.max(0, Math.min(100, geminiResult.score));
        
        // Handle weight formats: if weight < 1, assume it's decimal (0.3 = 30%), otherwise assume percentage (30)
        const weightAsPercentage = weight < 1 ? weight * 100 : weight;
        aiScore = Math.round((geminiScore / 100) * weightAsPercentage);
        explanation = geminiResult.feedback;
        
        console.log('Gemini AI scoring successful:', {
          source: geminiResult.source,
          originalScore: geminiScore,
          weight: weight,
          weightAsPercentage: weightAsPercentage,
          weightedScore: aiScore
        });
      } else {
        throw new Error('Gemini API request failed');
      }

    } catch (geminiError) {
      console.error('Gemini AI API error:', geminiError);
      
      // Fallback scoring algorithm based on completion percentage and weight
      let scorePercentage = completionPercentage;
      
      // Adjust based on over/under achievement
      if (completionPercentage >= 100) {
        scorePercentage = Math.min(95, 85 + Math.min(10, (completionPercentage - 100) * 0.5));
      } else if (completionPercentage >= 90) {
        scorePercentage = 80 + ((completionPercentage - 90) * 0.5);
      } else if (completionPercentage >= 80) {
        scorePercentage = 70 + ((completionPercentage - 80) * 1);
      } else {
        scorePercentage = Math.max(60, completionPercentage * 0.8);
      }

      // Handle weight formats: if weight < 1, assume it's decimal (0.3 = 30%), otherwise assume percentage (30)
      const weightAsPercentage = weight < 1 ? weight * 100 : weight;
      aiScore = Math.round((scorePercentage / 100) * weightAsPercentage);
      explanation = `Performance evaluation based on ${completionPercentage}% target achievement. ${completionPercentage >= 100 ? 'Exceeded expectations.' : completionPercentage >= 90 ? 'Nearly achieved full targets.' : 'Partial achievement of objectives.'}`;
    }

    // Save AI score to database and update workflow status
    const finalWeightForDisplay = weight < 1 ? weight * 100 : weight;
    console.log(`Saving AI score ${aiScore}/${finalWeightForDisplay} for objective ${objectiveId}`);
    
    // Create AI review entry
    await prisma.mboObjectiveReview.create({
      data: {
        objectiveId: objectiveId,
        reviewerId: objective.assignedById || objective.userId, // Use manager ID if available
        score: aiScore,
        aiScore: aiScore,
        aiComments: explanation,
        reviewType: 'AI_ANALYSIS',
        reviewDate: new Date()
      }
    });

    // Update objective status to indicate it's been AI-scored and ready for manager review
    await prisma.mboObjective.update({
      where: { id: objectiveId },
      data: {
        status: 'AI_SCORED', // Move from COMPLETED to AI_SCORED
        aiScoreMetadata: JSON.stringify({
          score: aiScore,
          maxScore: weight < 1 ? weight * 100 : weight,
          explanation: explanation,
          completionRate: completionPercentage,
          generatedAt: new Date().toISOString()
        }),
        submittedToManagerAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      score: aiScore,
      maxScore: weight < 1 ? weight * 100 : weight,
      explanation: explanation,
      completionRate: completionPercentage,
      generatedAt: new Date().toISOString(),
      objectiveId: objectiveId,
      status: 'AI_SCORED'
    });

  } catch (error) {
    console.error('Error in AI scoring:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate AI score' },
      { status: 500 }
    );
  }
}
