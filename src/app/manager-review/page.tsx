"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircleIcon,
  XCircleIcon,
  PencilSquareIcon,
  ChartBarIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import { ManagerReview, AIAnalysisResult, WorkflowStatus } from "../../types/workflow";

interface EmployeeSubmission {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  signatureDate: Date;
  aiAnalysis: AIAnalysisResult;
  currentStage: 'ai_analysis' | 'manager_review' | 'hr_approval' | 'completed';
  managerReview?: ManagerReview;
  objectives: {
    id: string;
    title: string;
    weight: number;
    progress: number;
    remarks: string;
    aiScore: number;
    feedback: string;
  }[];
}

export default function ManagerReviewPage() {
  const [user, setUser] = useState<any>(null);
  const [submissions, setSubmissions] = useState<EmployeeSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<EmployeeSubmission | null>(null);
  const [overrideScores, setOverrideScores] = useState<Record<string, number>>({});
  const [justifications, setJustifications] = useState<Record<string, string>>({});
  const [generalComments, setGeneralComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "manager") {
      router.push("/dashboard");
      return;
    }
    
    setUser(parsedUser);
    loadSubmissions();
  }, [router]);

  const loadSubmissions = () => {
    // Mock data for demonstration
    const mockSubmissions: EmployeeSubmission[] = [
      {
        id: "sub_1",
        employeeId: "emp_1",
        employeeName: "John Doe",
        department: "Engineering",
        signatureDate: new Date("2024-12-10"),
        currentStage: "manager_review",
        aiAnalysis: {
          id: "ai_1",
          signatureId: "sig_1",
          employeeId: "emp_1",
          quarterYear: "Q4-2024",
          analysisDate: new Date("2024-12-10"),
          totalScore: 87,
          breakdown: [],
          overallFeedback: "Strong performance across all objectives with consistent delivery.",
          status: "completed",
          aiProvider: "gemini"
        },
        objectives: [
          {
            id: "obj_1",
            title: "Increase Customer Satisfaction",
            weight: 25,
            progress: 85,
            remarks: "Implemented feedback system, achieved 85% satisfaction rate",
            aiScore: 22,
            feedback: "Excellent progress towards target. Systematic approach shows strong results."
          },
          {
            id: "obj_2", 
            title: "Complete Product Training",
            weight: 15,
            progress: 100,
            remarks: "Completed all modules, achieved 92% on certification exam",
            aiScore: 15,
            feedback: "Outstanding completion with high certification score."
          },
          {
            id: "obj_3",
            title: "Lead Cross-Functional Projects",
            weight: 20,
            progress: 60,
            remarks: "Leading 2 projects, both on track for Q4 completion",
            aiScore: 12,
            feedback: "Good progress on leadership objectives. Projects well managed."
          },
          {
            id: "obj_4",
            title: "Revenue Growth Contribution",
            weight: 30,
            progress: 80,
            remarks: "Closed 2 deals worth $120K, working on remaining prospects",
            aiScore: 24,
            feedback: "Strong revenue contribution. Exceeding targets effectively."
          },
          {
            id: "obj_5",
            title: "Process Improvement",
            weight: 10,
            progress: 40,
            remarks: "Analyzing bottlenecks, proposed automation solution",
            aiScore: 4,
            feedback: "Good analysis phase. Implementation will be key for full points."
          }
        ]
      },
      {
        id: "sub_2",
        employeeId: "emp_2", 
        employeeName: "Alice Johnson",
        department: "Product",
        signatureDate: new Date("2024-12-11"),
        currentStage: "manager_review",
        aiAnalysis: {
          id: "ai_2",
          signatureId: "sig_2",
          employeeId: "emp_2",
          quarterYear: "Q4-2024",
          analysisDate: new Date("2024-12-11"),
          totalScore: 92,
          breakdown: [],
          overallFeedback: "Exceptional performance with innovative approaches and strong leadership.",
          status: "completed",
          aiProvider: "gemini"
        },
        objectives: [
          {
            id: "obj_6",
            title: "Product Roadmap Planning",
            weight: 35,
            progress: 95,
            remarks: "Completed Q1 2025 roadmap with stakeholder alignment",
            aiScore: 33,
            feedback: "Excellent strategic planning with strong stakeholder engagement."
          },
          {
            id: "obj_7",
            title: "User Research Initiative", 
            weight: 25,
            progress: 90,
            remarks: "Conducted 50+ user interviews, implemented findings",
            aiScore: 23,
            feedback: "Comprehensive research approach with actionable insights."
          },
          {
            id: "obj_8",
            title: "Team Collaboration",
            weight: 20,
            progress: 85,
            remarks: "Improved cross-team communication, reduced meeting time by 30%",
            aiScore: 17,
            feedback: "Strong leadership in process optimization and team efficiency."
          },
          {
            id: "obj_9",
            title: "Market Analysis",
            weight: 20,
            progress: 100,
            remarks: "Delivered comprehensive competitor analysis and recommendations",
            aiScore: 19,
            feedback: "Thorough analysis with strategic recommendations implemented."
          }
        ]
      }
    ];
    setSubmissions(mockSubmissions);
  };

  const handleScoreOverride = (objectiveId: string, newScore: number) => {
    setOverrideScores(prev => ({
      ...prev,
      [objectiveId]: newScore
    }));
  };

  const handleJustification = (objectiveId: string, justification: string) => {
    setJustifications(prev => ({
      ...prev,
      [objectiveId]: justification
    }));
  };

  const calculateFinalScore = (submission: EmployeeSubmission) => {
    return submission.objectives.reduce((total, obj) => {
      const overrideScore = overrideScores[obj.id];
      return total + (overrideScore !== undefined ? overrideScore : obj.aiScore);
    }, 0);
  };

  const submitReview = async (decision: 'approved' | 'rejected' | 'needs_revision') => {
    if (!selectedSubmission) return;

    setIsSubmitting(true);
    try {
      const finalScore = calculateFinalScore(selectedSubmission);
      
      const reviewData = {
        submissionId: selectedSubmission.id,
        decision,
        finalScore,
        overrides: Object.entries(overrideScores).map(([objectiveId, newScore]) => {
          const objective = selectedSubmission.objectives.find(o => o.id === objectiveId);
          return {
            objectiveId,
            originalScore: objective?.aiScore || 0,
            newScore,
            justification: justifications[objectiveId] || ""
          };
        }),
        generalComments,
        reviewDate: new Date().toISOString()
      };

      console.log("Submitting manager review:", reviewData);
      
      // In real implementation, this would call an API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update the submission status
      setSubmissions(prev => prev.map(sub => 
        sub.id === selectedSubmission.id 
          ? { ...sub, currentStage: decision === 'approved' ? 'hr_approval' : 'manager_review' }
          : sub
      ));
      
      setSelectedSubmission(null);
      setOverrideScores({});
      setJustifications({});
      setGeneralComments("");
      
      alert(`Review ${decision} successfully!`);
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Error submitting review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manager Review Dashboard</h1>
          <p className="mt-2 text-gray-600">Review and approve employee objective submissions</p>
        </div>

        {!selectedSubmission ? (
          /* Submissions List */
          <div className="space-y-6">
            {submissions.filter(sub => sub.currentStage === 'manager_review').map((submission) => (
              <div key={submission.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{submission.employeeName}</h3>
                      <p className="text-sm text-gray-600">{submission.department} • Signed on {submission.signatureDate.toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{submission.aiAnalysis.totalScore}/100</p>
                    <p className="text-sm text-gray-600">AI Analysis Score</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">Objectives Completed</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {submission.objectives.filter(obj => obj.progress >= 100).length}/{submission.objectives.length}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">Average Progress</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {Math.round(submission.objectives.reduce((acc, obj) => acc + obj.progress, 0) / submission.objectives.length)}%
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">Days Since Submission</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {Math.floor((new Date().getTime() - submission.signatureDate.getTime()) / (1000 * 60 * 60 * 24))}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    AI Feedback: {submission.aiAnalysis.overallFeedback}
                  </p>
                  <button
                    onClick={() => setSelectedSubmission(submission)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Review Details
                  </button>
                </div>
              </div>
            ))}

            {submissions.filter(sub => sub.currentStage === 'manager_review').length === 0 && (
              <div className="text-center py-12">
                <CheckCircleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No Pending Reviews</h3>
                <p className="text-gray-600">All employee submissions have been reviewed.</p>
              </div>
            )}
          </div>
        ) : (
          /* Detailed Review */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedSubmission.employeeName} - Objective Review</h2>
                  <p className="text-sm text-gray-600">{selectedSubmission.department} • Q4 2024</p>
                </div>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* AI Summary */}
              <div className="mb-8 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">AI Analysis Summary</h3>
                <p className="text-blue-800">{selectedSubmission.aiAnalysis.overallFeedback}</p>
                <p className="text-sm text-blue-600 mt-2">
                  Total AI Score: {selectedSubmission.aiAnalysis.totalScore}/100 • 
                  Final Score (with overrides): {calculateFinalScore(selectedSubmission)}/100
                </p>
              </div>

              {/* Objectives Review */}
              <div className="space-y-6 mb-8">
                {selectedSubmission.objectives.map((objective) => (
                  <div key={objective.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900">{objective.title}</h4>
                        <p className="text-sm text-gray-600">Weight: {objective.weight}% • Progress: {objective.progress}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">
                          AI Score: {objective.aiScore}/{objective.weight}
                        </p>
                        {overrideScores[objective.id] !== undefined && (
                          <p className="text-lg font-bold text-green-600">
                            Override: {overrideScores[objective.id]}/{objective.weight}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h5 className="font-medium text-gray-900 mb-2">Employee Remarks:</h5>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded">{objective.remarks}</p>
                    </div>

                    <div className="mb-4">
                      <h5 className="font-medium text-gray-900 mb-2">AI Feedback:</h5>
                      <p className="text-gray-700">{objective.feedback}</p>
                    </div>

                    {/* Score Override */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Override Score (Optional)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={objective.weight}
                          value={overrideScores[objective.id] || ""}
                          onChange={(e) => handleScoreOverride(objective.id, Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder={`AI Score: ${objective.aiScore}`}
                        />
                      </div>
                      {overrideScores[objective.id] !== undefined && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Justification (Required for overrides)
                          </label>
                          <textarea
                            value={justifications[objective.id] || ""}
                            onChange={(e) => handleJustification(objective.id, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            placeholder="Explain why you're overriding the AI score..."
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* General Comments */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  General Comments (Optional)
                </label>
                <textarea
                  value={generalComments}
                  onChange={(e) => setGeneralComments(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Add any general feedback or comments for this review..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => submitReview('needs_revision')}
                  disabled={isSubmitting}
                  className="px-6 py-3 border border-amber-600 text-amber-600 rounded-lg hover:bg-amber-50 disabled:opacity-50"
                >
                  Request Revision
                </button>
                <button
                  onClick={() => submitReview('rejected')}
                  disabled={isSubmitting}
                  className="px-6 py-3 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  onClick={() => submitReview('approved')}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-5 h-5" />
                      <span>Approve & Forward to HR</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
