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

    // Verify objective exists and is manager-submitted
    const objective = await prisma.mboManagerObjective.findUnique({
      where: { id: objectiveId },
      include: {
        manager: {
          select: {
            name: true,
            email: true
          }
        },
        assignedBySeniorManager: {
          select: {
            id: true,
            name: true
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

    // STRICT WORKFLOW VALIDATION: Only allow AI scoring for MANAGER_SUBMITTED status
    if (objective.status !== 'MANAGER_SUBMITTED') {
      return NextResponse.json(
        { success: false, error: 'Objective must be in MANAGER_SUBMITTED status to generate AI score' },
        { status: 400 }
      );
    }

    // Prevent duplicate AI scoring
    if (objective.aiScoringMetadata) {
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
          remarks: `Manager: ${employeeName}, Weight: ${weight}%, Achievement: ${completionPercentage}%, Manager Remarks: ${employeeRemarks || ''}`
        }),
      });

      if (geminiResponse.ok) {
        const geminiResult = await geminiResponse.json();
        
        // Convert Gemini's 0-100 score to 1-10 scale
        const geminiScore = Math.max(0, Math.min(100, geminiResult.score));
        aiScore = Math.round((geminiScore / 100) * 10);
        explanation = geminiResult.feedback;
        
        console.log('Gemini AI scoring successful for manager objective:', {
          source: geminiResult.source,
          originalScore: geminiScore,
          weight: weight,
          scaledScore: aiScore,
          managerName: objective.manager?.name
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

      // Convert to 1-10 scale
      aiScore = Math.round((scorePercentage / 100) * 10);
      explanation = `Performance evaluation based on ${completionPercentage}% target achievement. ${completionPercentage >= 100 ? 'Exceeded expectations.' : completionPercentage >= 90 ? 'Nearly achieved full targets.' : 'Partial achievement of objectives.'}`;
    }

    // Save AI score to database and update workflow status
    console.log(`Saving AI score ${aiScore}/10 for manager objective ${objectiveId}`);
    
    // Update manager objective status to indicate it's been AI-scored and ready for senior manager review
    await prisma.mboManagerObjective.update({
      where: { id: objectiveId },
      data: {
        status: 'AI_SCORED', // Move from MANAGER_SUBMITTED to AI_SCORED
        aiScore: aiScore,
        aiComments: explanation,
        aiScoringMetadata: JSON.stringify({
          score: aiScore,
          maxScore: 10,
          explanation: explanation,
          completionRate: completionPercentage,
          generatedAt: new Date().toISOString()
        }),
        aiScoredAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      score: aiScore,
      maxScore: 10,
      explanation: explanation,
      completionRate: completionPercentage,
      generatedAt: new Date().toISOString(),
      objectiveId: objectiveId,
      status: 'AI_SCORED'
    });

  } catch (error) {
    console.error('Error in manager AI scoring:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate AI score for manager objective' },
      { status: 500 }
    );
  }
}
