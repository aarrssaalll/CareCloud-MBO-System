/**
 * AI Service for MBO System
 * Integrates with AI routes (OpenAI/Gemini) with a robust mock fallback
 */

interface ObjectiveAnalysis {
  score: number;
  feedback: string;
  recommendations: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  improvementAreas: string[];
  strengths: string[];
}

interface PerformanceInsights {
  overallTrend: 'improving' | 'stable' | 'declining';
  keyMetrics: {
    consistency: number;
    growth: number;
    reliability: number;
  };
  predictedOutcome: string;
  recommendations: string[];
}

import { AI_PROVIDER, getRouteForProvider } from "@/config/ai";

class AIService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    // In production, this would come from environment variables
  this.apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'demo-key';
  this.baseUrl = '';
  }

  /**
   * Analyze objective progress and remarks using AI
   */
  async analyzeObjective(
    objectiveTitle: string,
    description: string,
    currentProgress: number,
    targetProgress: number,
    remarks: string
  ): Promise<ObjectiveAnalysis> {
    try {
      // Prefer server API route; respect provider and allow forceMock
      const provider = AI_PROVIDER;
      const route = getRouteForProvider(provider);
      const progressPercentage = (currentProgress / targetProgress) * 100;

  const resp = await fetch(`${route}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objective: {
            title: objectiveTitle,
            description,
            current: currentProgress,
            target: targetProgress,
          },
          remarks,
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        return {
          score: data.score ?? Math.round(progressPercentage),
          feedback: data.feedback ?? this.generateContextualFeedback(objectiveTitle, progressPercentage, 'neutral', remarks),
          recommendations: data.recommendations ?? this.generateContextualRecommendations(progressPercentage, 'neutral'),
          sentiment: 'neutral',
          improvementAreas: this.identifyImprovementAreas(progressPercentage, remarks),
          strengths: this.identifyStrengths(progressPercentage, remarks, 'neutral'),
        };
      }

      // Fallback to local mock if route fails
      const analysis = this.generateIntelligentAnalysis(
        objectiveTitle,
        description,
        progressPercentage,
        remarks
      );
      return analysis;
    } catch (error) {
      console.error('AI Analysis Error:', error);
      throw new Error('AI analysis failed. Please try again later.');
    }
  }

  /**
   * Generate performance insights across multiple objectives
   */
  async generatePerformanceInsights(
    objectives: Array<{
      title: string;
      progress: number;
      target: number;
      status: string;
      remarks?: string;
    }>
  ): Promise<PerformanceInsights> {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const completionRates = objectives.map(obj => (obj.progress / obj.target) * 100);
      const averageCompletion = completionRates.reduce((a, b) => a + b, 0) / completionRates.length;
      
      const completedCount = objectives.filter(obj => obj.status === 'completed').length;
      const onTrackCount = objectives.filter(obj => obj.status === 'on-track').length;
      const atRiskCount = objectives.filter(obj => obj.status === 'at-risk').length;
      
      return {
        overallTrend: averageCompletion > 85 ? 'improving' : averageCompletion > 70 ? 'stable' : 'declining',
        keyMetrics: {
          consistency: Math.min(100, averageCompletion + Math.random() * 10),
          growth: Math.min(100, (completedCount / objectives.length) * 100 + 5),
          reliability: Math.min(100, ((completedCount + onTrackCount) / objectives.length) * 100)
        },
        predictedOutcome: this.generatePrediction(averageCompletion, completedCount, objectives.length),
        recommendations: this.generateRecommendations(averageCompletion, atRiskCount, objectives.length)
      };
    } catch (error) {
      console.error('Performance Insights Error:', error);
      throw new Error('Failed to generate performance insights.');
    }
  }

  /**
   * Compare employee remarks with objectives to identify alignment
   */
  async compareRemarksWithObjectives(
    objectiveDescription: string,
    remarks: string
  ): Promise<{
    alignmentScore: number;
    keyInsights: string[];
    suggestions: string[];
  }> {
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Simulate AI-powered text analysis
      const alignmentScore = this.calculateAlignment(objectiveDescription, remarks);
      
      return {
        alignmentScore,
        keyInsights: this.extractKeyInsights(remarks),
        suggestions: this.generateSuggestions(alignmentScore, remarks)
      };
    } catch (error) {
      console.error('Remarks Analysis Error:', error);
      throw new Error('Failed to analyze remarks alignment.');
    }
  }

  private generateIntelligentAnalysis(
    title: string,
    description: string,
    progressPercentage: number,
    remarks: string
  ): ObjectiveAnalysis {
    const sentimentKeywords = {
      positive: ['excellent', 'great', 'successful', 'achieved', 'exceeded', 'progress', 'improved'],
      negative: ['delayed', 'challenging', 'difficult', 'behind', 'struggling', 'issues', 'problems']
    };
    
    const remarksLower = remarks.toLowerCase();
    const positiveCount = sentimentKeywords.positive.filter(word => remarksLower.includes(word)).length;
    const negativeCount = sentimentKeywords.negative.filter(word => remarksLower.includes(word)).length;
    
    const sentiment = positiveCount > negativeCount ? 'positive' : 
                     negativeCount > positiveCount ? 'negative' : 'neutral';
    
    const baseScore = progressPercentage;
    const sentimentBonus = sentiment === 'positive' ? 5 : sentiment === 'negative' ? -3 : 0;
    const finalScore = Math.max(0, Math.min(100, baseScore + sentimentBonus));
    
    return {
      score: Math.round(finalScore * 10) / 10,
      feedback: this.generateContextualFeedback(title, progressPercentage, sentiment, remarks),
      recommendations: this.generateContextualRecommendations(progressPercentage, sentiment),
      sentiment,
      improvementAreas: this.identifyImprovementAreas(progressPercentage, remarks),
      strengths: this.identifyStrengths(progressPercentage, remarks, sentiment)
    };
  }

  private generateContextualFeedback(
    title: string,
    progress: number,
    sentiment: string,
    remarks: string
  ): string {
    if (progress >= 95) {
      return `Excellent performance on "${title}". Your approach demonstrates strong execution and achievement of key milestones.`;
    } else if (progress >= 80) {
      return `Good progress on "${title}". You're on track to meet your objectives with consistent effort.`;
    } else if (progress >= 60) {
      return `Moderate progress on "${title}". Consider implementing additional strategies to accelerate completion.`;
    } else {
      return `"${title}" requires immediate attention. Current progress suggests need for revised approach and additional resources.`;
    }
  }

  private generateContextualRecommendations(progress: number, sentiment: string): string[] {
    const recommendations = [];
    
    if (progress >= 90) {
      recommendations.push("Document best practices for future reference");
      recommendations.push("Share successful strategies with team members");
      recommendations.push("Consider setting stretch goals for continued growth");
    } else if (progress >= 70) {
      recommendations.push("Maintain current momentum and consistency");
      recommendations.push("Monitor progress weekly to ensure timeline adherence");
      recommendations.push("Identify any potential roadblocks early");
    } else if (progress >= 50) {
      recommendations.push("Reassess current approach and identify bottlenecks");
      recommendations.push("Consider seeking additional resources or support");
      recommendations.push("Break down remaining tasks into smaller milestones");
    } else {
      recommendations.push("Immediate intervention required - schedule review meeting");
      recommendations.push("Reassess objective scope and timeline feasibility");
      recommendations.push("Consider escalating for additional support");
    }
    
    if (sentiment === 'negative') {
      recommendations.push("Address any blockers or challenges mentioned in remarks");
      recommendations.push("Schedule one-on-one discussion with manager");
    }
    
    return recommendations;
  }

  private identifyImprovementAreas(progress: number, remarks: string): string[] {
    const areas = [];
    const remarksLower = remarks.toLowerCase();
    
    if (progress < 80) areas.push("Timeline management");
    if (remarksLower.includes('delay') || remarksLower.includes('behind')) areas.push("Project scheduling");
    if (remarksLower.includes('resource') || remarksLower.includes('support')) areas.push("Resource allocation");
    if (remarksLower.includes('challenge') || remarksLower.includes('difficult')) areas.push("Problem-solving approach");
    if (progress < 60) areas.push("Strategic planning");
    
    return areas.length > 0 ? areas : ["Consistency in execution"];
  }

  private identifyStrengths(progress: number, remarks: string, sentiment: string): string[] {
    const strengths = [];
    const remarksLower = remarks.toLowerCase();
    
    if (progress >= 80) strengths.push("Goal achievement");
    if (sentiment === 'positive') strengths.push("Positive attitude and communication");
    if (remarksLower.includes('team') || remarksLower.includes('collaborat')) strengths.push("Team collaboration");
    if (remarksLower.includes('innovat') || remarksLower.includes('creativ')) strengths.push("Innovation and creativity");
    if (remarksLower.includes('client') || remarksLower.includes('customer')) strengths.push("Client focus");
    if (progress >= 95) strengths.push("Exceptional performance");
    
    return strengths.length > 0 ? strengths : ["Commitment to objectives"];
  }

  private calculateAlignment(objective: string, remarks: string): number {
    // Simple keyword matching for demo - in production, use more sophisticated NLP
    const objectiveWords = objective.toLowerCase().split(' ').filter(word => word.length > 3);
    const remarksWords = remarks.toLowerCase().split(' ');
    
    const matches = objectiveWords.filter(word => remarksWords.includes(word)).length;
    const alignmentScore = (matches / objectiveWords.length) * 100;
    
    return Math.min(100, Math.max(20, alignmentScore + Math.random() * 20));
  }

  private extractKeyInsights(remarks: string): string[] {
    const insights = [];
    const remarksLower = remarks.toLowerCase();
    
    if (remarksLower.includes('client') || remarksLower.includes('customer')) {
      insights.push("Strong focus on client/customer outcomes");
    }
    if (remarksLower.includes('team') || remarksLower.includes('collaborat')) {
      insights.push("Demonstrates good teamwork and collaboration");
    }
    if (remarksLower.includes('process') || remarksLower.includes('system')) {
      insights.push("Process-oriented approach to problem solving");
    }
    if (remarksLower.includes('innovat') || remarksLower.includes('new')) {
      insights.push("Shows innovation and forward-thinking");
    }
    
    return insights.length > 0 ? insights : ["Detailed progress documentation"];
  }

  private generateSuggestions(alignmentScore: number, remarks: string): string[] {
    const suggestions = [];
    
    if (alignmentScore < 60) {
      suggestions.push("Consider more specific references to objective goals in your remarks");
      suggestions.push("Include quantifiable metrics where possible");
    }
    
    if (alignmentScore >= 80) {
      suggestions.push("Excellent alignment! Continue this level of detailed reporting");
    }
    
    if (remarks.length < 50) {
      suggestions.push("Consider providing more detailed progress descriptions");
    }
    
    suggestions.push("Include any challenges faced and how they were addressed");
    suggestions.push("Mention specific achievements or milestones reached");
    
    return suggestions;
  }

  private generatePrediction(averageCompletion: number, completedCount: number, totalCount: number): string {
    const completionRate = (completedCount / totalCount) * 100;
    
    if (averageCompletion >= 90 && completionRate >= 60) {
      return "Exceeding expectations - likely to achieve all objectives ahead of schedule";
    } else if (averageCompletion >= 80) {
      return "On track to meet most objectives within timeline";
    } else if (averageCompletion >= 60) {
      return "Moderate risk - may need additional focus to meet all objectives";
    } else {
      return "High risk - immediate intervention recommended to achieve objectives";
    }
  }

  private generateRecommendations(averageCompletion: number, atRiskCount: number, totalCount: number): string[] {
    const recommendations = [];
    
    if (atRiskCount > 0) {
      recommendations.push(`Focus on ${atRiskCount} at-risk objective(s) requiring immediate attention`);
    }
    
    if (averageCompletion < 70) {
      recommendations.push("Schedule review meeting to reassess timelines and resources");
      recommendations.push("Consider breaking down complex objectives into smaller milestones");
    }
    
    if (averageCompletion >= 85) {
      recommendations.push("Maintain current momentum and document successful practices");
      recommendations.push("Consider taking on additional stretch goals");
    }
    
    recommendations.push("Regular weekly check-ins to monitor progress");
    recommendations.push("Document lessons learned for future objective planning");
    
    return recommendations;
  }
}

export const aiService = new AIService();
export type { ObjectiveAnalysis, PerformanceInsights };
