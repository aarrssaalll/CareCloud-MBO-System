import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const managerId = searchParams.get('managerId');

    if (!managerId) {
      return NextResponse.json(
        { success: false, error: 'Manager ID is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Fetching AI-scored objectives for manager review:', managerId);

    // Fetch AI-scored objectives from team members that need manager review
    const aiScoredObjectives = await prisma.mboObjective.findMany({
      where: {
        user: {
          managerId: managerId
        },
        status: 'AI_SCORED' // Only objectives that have been AI-scored and ready for manager review
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            title: true
          }
        },
        reviews: {
          where: {
            reviewType: 'AI_ANALYSIS'
          },
          orderBy: {
            reviewDate: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        submittedToManagerAt: 'desc'
      }
    });

    console.log(`📋 Found ${aiScoredObjectives.length} AI-scored objectives ready for manager review`);

    // Transform the data to include AI score information
    const objectivesWithAIScores = aiScoredObjectives.map(objective => {
      const aiReview = objective.reviews[0];
      let aiScoreData = null;

      // Parse AI score metadata if available
      if (objective.aiScoreMetadata) {
        try {
          aiScoreData = JSON.parse(objective.aiScoreMetadata);
        } catch (e) {
          console.error('Error parsing AI score metadata:', e);
        }
      }

      return {
        ...objective,
        aiEvaluation: {
          score: aiReview?.aiScore || aiScoreData?.score || 0,
          explanation: aiReview?.aiComments || aiScoreData?.explanation || 'AI analysis completed',
          strengths: 'Performance analysis completed',
          improvements: 'Continue current approach',
          completionRate: aiScoreData?.completionRate || Math.round(((objective.current || 0) / objective.target) * 100),
          generatedAt: aiReview?.reviewDate || aiScoreData?.generatedAt || objective.submittedToManagerAt
        },
        readyForReview: true,
        finalScore: aiReview?.aiScore || aiScoreData?.score || 0,
        managerComments: ''
      };
    });

    return NextResponse.json({
      success: true,
      objectives: objectivesWithAIScores,
      count: objectivesWithAIScores.length
    });

  } catch (error) {
    console.error('❌ Error fetching AI-scored objectives:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch AI-scored objectives' },
      { status: 500 }
    );
  }
}
