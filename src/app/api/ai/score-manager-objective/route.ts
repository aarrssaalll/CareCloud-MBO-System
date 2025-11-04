import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// AI Scoring service for manager objectives
class ManagerObjectiveAIScoringService {
  static async scoreManagerObjective(objective: any, manager: any): Promise<{ score: number; explanation: string; metadata: any }> {
    try {
      // Enhanced prompt for manager-level objectives
      const prompt = `
You are an expert performance evaluator for CareCloud's Management by Objectives (MBO) system, specifically evaluating MANAGER-LEVEL objectives. 

**MANAGER PROFILE:**
- Name: ${manager.name}
- Title: ${manager.title}
- Department: ${manager.department?.name || 'Not specified'}
- Direct Reports: ${manager.directReports || 0}

**OBJECTIVE DETAILS:**
- Title: ${objective.title}
- Description: ${objective.description}
- Category: ${objective.category}
- Target: ${objective.target}
- Achieved: ${objective.current}
- Weight: ${objective.weight * 100}%
- Due Date: ${new Date(objective.dueDate).toLocaleDateString()}

**MANAGER'S SUBMISSION:**
- Completion Remarks: ${objective.managerRemarks}
- Supporting Evidence: ${objective.managerEvidence || 'None provided'}

**EVALUATION CRITERIA FOR MANAGERS:**
1. **Achievement Rate** (40%): Quantitative performance vs target
2. **Leadership Impact** (25%): Evidence of team leadership and development
3. **Strategic Alignment** (20%): Alignment with organizational objectives
4. **Problem Solving** (10%): Evidence of overcoming challenges
5. **Documentation Quality** (5%): Quality of remarks and evidence

**MANAGER-SPECIFIC CONSIDERATIONS:**
- Managers are expected to demonstrate leadership beyond individual achievement
- Consider impact on team performance and development
- Evaluate strategic thinking and decision-making
- Assess communication and stakeholder management
- Look for evidence of process improvement and innovation

Please provide:
1. A score from 0-100 based on the weighted criteria above
2. Detailed explanation covering each evaluation criterion
3. Specific feedback on leadership demonstration
4. Recommendations for future improvement

**SCORING GUIDELINES:**
- 90-100: Exceptional leadership performance with significant organizational impact
- 80-89: Strong managerial achievement with clear team/department benefits
- 70-79: Good performance meeting managerial expectations
- 60-69: Adequate performance with some leadership gaps
- 50-59: Below expectations requiring development
- Below 50: Significant performance issues requiring immediate attention

Respond with a JSON object containing "score" (number) and "explanation" (detailed string).
      `;

      // Simulate AI API call (replace with actual AI service)
      const aiResponse = await this.callAIService(prompt);
      
      const metadata = {
        evaluationDate: new Date().toISOString(),
        model: 'manager-objective-evaluator-v1',
        criteria: {
          achievementRate: this.calculateAchievementScore(objective),
          leadershipImpact: this.assessLeadershipImpact(objective, manager),
          strategicAlignment: this.assessStrategicAlignment(objective),
          problemSolving: this.assessProblemSolving(objective),
          documentationQuality: this.assessDocumentationQuality(objective)
        },
        managerProfile: {
          title: manager.title,
          department: manager.department?.name,
          directReports: manager.directReports
        }
      };

      return {
        score: aiResponse.score,
        explanation: aiResponse.explanation,
        metadata: metadata
      };

    } catch (error) {
      console.error('AI scoring error:', error);
      
      // Fallback scoring based on achievement rate
      const achievementRate = (objective.current / objective.target) * 100;
      const fallbackScore = Math.min(Math.max(achievementRate * 0.8, 50), 95);
      
      return {
        score: fallbackScore,
        explanation: `Fallback scoring based on ${achievementRate.toFixed(1)}% achievement rate. AI service temporarily unavailable. Manual review recommended for comprehensive evaluation.`,
        metadata: { fallback: true, achievementRate }
      };
    }
  }

  private static async callAIService(prompt: string): Promise<{ score: number; explanation: string }> {
    // Mock AI response for demonstration
    // Replace with actual AI service integration (OpenAI, Gemini, etc.)
    const achievementRate = Math.random() * 100;
    const baseScore = Math.min(Math.max(achievementRate, 60), 95);
    
    const score = Math.round(baseScore + (Math.random() * 10 - 5)); // Add some variation
    
    const explanation = `
**MANAGER OBJECTIVE EVALUATION SUMMARY**

**Achievement Analysis (Score: ${score}/100)**
- Quantitative Performance: ${achievementRate.toFixed(1)}% of target achieved
- Leadership Demonstration: Evidence of effective team management and strategic thinking
- Process Improvement: Clear indication of systematic approach to objective completion

**Strengths Identified:**
• Strong completion rate demonstrating effective planning and execution
• Clear documentation of progress and challenges faced
• Evidence of stakeholder engagement and team coordination
• Strategic approach to problem-solving and resource management

**Areas for Enhancement:**
• Consider expanding documentation of team development activities
• Include more specific metrics on team performance impact
• Provide additional context on strategic alignment with organizational goals

**Leadership Impact Assessment:**
The manager demonstrated effective leadership through systematic objective completion and clear communication of progress. The evidence suggests strong project management skills and ability to navigate organizational challenges.

**Recommendation:** ${score >= 80 ? 'Excellent performance worthy of recognition and potential for increased responsibility' : 
                    score >= 70 ? 'Good performance meeting managerial expectations with room for growth' : 
                    'Performance requires development focus and additional support'}

This evaluation considers both quantitative achievement and qualitative leadership demonstration expected at the managerial level.
    `;

    return { score, explanation: explanation.trim() };
  }

  private static calculateAchievementScore(objective: any): number {
    const achievementRate = (objective.current / objective.target) * 100;
    return Math.min(achievementRate, 100);
  }

  private static assessLeadershipImpact(objective: any, manager: any): number {
    // Assess leadership indicators in remarks and evidence
    const remarks = (objective.managerRemarks || '').toLowerCase();
    const evidence = (objective.managerEvidence || '').toLowerCase();
    const text = remarks + ' ' + evidence;
    
    const leadershipKeywords = ['team', 'lead', 'develop', 'mentor', 'coordinate', 'manage', 'strategy', 'stakeholder'];
    const found = leadershipKeywords.filter(keyword => text.includes(keyword)).length;
    
    return Math.min((found / leadershipKeywords.length) * 100, 100);
  }

  private static assessStrategicAlignment(objective: any): number {
    const category = objective.category?.toLowerCase() || '';
    const description = (objective.description || '').toLowerCase();
    
    const strategicKeywords = ['strategic', 'organizational', 'company', 'business', 'growth', 'improvement'];
    const found = strategicKeywords.filter(keyword => 
      category.includes(keyword) || description.includes(keyword)
    ).length;
    
    return Math.min((found / strategicKeywords.length) * 100 + 60, 100);
  }

  private static assessProblemSolving(objective: any): number {
    const remarks = (objective.managerRemarks || '').toLowerCase();
    const problemSolvingKeywords = ['challenge', 'solution', 'resolve', 'overcome', 'improve', 'optimize'];
    const found = problemSolvingKeywords.filter(keyword => remarks.includes(keyword)).length;
    
    return Math.min((found / problemSolvingKeywords.length) * 100 + 50, 100);
  }

  private static assessDocumentationQuality(objective: any): number {
    const remarksLength = (objective.managerRemarks || '').length;
    const hasEvidence = !!(objective.managerEvidence || '').trim();
    
    let score = 0;
    if (remarksLength > 100) score += 40;
    else if (remarksLength > 50) score += 25;
    else if (remarksLength > 20) score += 15;
    
    if (hasEvidence) score += 30;
    if (remarksLength > 200) score += 30;
    
    return Math.min(score, 100);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    } catch (error) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    // Check if user is senior management
    if (!['SENIOR_MANAGEMENT', 'senior-management', 'senior_management'].includes(decoded.role)) {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { objectiveId } = body;

    if (!objectiveId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required field: objectiveId' 
      }, { status: 400 });
    }

    // Get the objective that needs AI scoring
    const objective = await prisma.mboManagerObjective.findFirst({
      where: {
        id: objectiveId,
        status: 'MANAGER_SUBMITTED'
      },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            title: true,
            department: {
              select: {
                name: true
              }
            },
            _count: {
              select: {
                managedUsers: true
              }
            }
          }
        },
        assignedBySeniorManager: {
          select: {
            id: true,
            name: true,
            title: true
          }
        }
      }
    });

    if (!objective) {
      return NextResponse.json({ 
        success: false, 
        error: 'Objective not found or not ready for AI scoring' 
      }, { status: 404 });
    }

    // Perform AI scoring
    const managerProfile = {
      ...objective.manager,
      directReports: objective.manager._count.managedUsers
    };

    console.log(`🤖 Starting AI scoring for manager objective:`, {
      id: objective.id,
      title: objective.title,
      manager: objective.manager.name,
      achievement: `${objective.current}/${objective.target}`
    });

    const aiResult = await ManagerObjectiveAIScoringService.scoreManagerObjective(objective, managerProfile);

    // Update objective with AI scoring
    const updatedObjective = await prisma.mboManagerObjective.update({
      where: { id: objectiveId },
      data: {
        status: 'AI_SCORED',
        aiScore: aiResult.score,
        aiComments: aiResult.explanation,
        aiScoringMetadata: JSON.stringify(aiResult.metadata),
        aiScoredAt: new Date(),
        seniorManagerScore: aiResult.score, // Default to AI score
        finalScore: aiResult.score
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

    // Create notification for senior management
    await prisma.mboNotification.create({
      data: {
        type: 'info',
        title: 'Manager Objective AI Scored',
        message: `AI scoring completed for "${objective.title}" by ${objective.manager.name}. Score: ${aiResult.score}/100`,
        actionRequired: true,
        entityId: objectiveId,
        entityType: 'manager_objective',
        userId: decoded.userId
      }
    });

    console.log(`✅ AI scoring completed:`, {
      objectiveId: updatedObjective.id,
      manager: objective.manager.name,
      score: aiResult.score,
      status: updatedObjective.status
    });

    return NextResponse.json({
      success: true,
      message: 'AI scoring completed successfully',
      result: {
        objectiveId: updatedObjective.id,
        score: aiResult.score,
        explanation: aiResult.explanation,
        status: updatedObjective.status,
        aiScoredAt: updatedObjective.aiScoredAt
      }
    });

  } catch (error) {
    console.error('Error in AI scoring:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to perform AI scoring',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}