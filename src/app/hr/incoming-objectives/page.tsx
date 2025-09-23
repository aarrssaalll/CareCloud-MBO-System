"use client";

import { useState, useEffect } from "react";
import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  UserGroupIcon,
  ChartBarIcon,
  SparklesIcon,
  ArrowRightIcon,
  DocumentCheckIcon
} from "@heroicons/react/24/outline";
import { useAuth } from '@/hooks/useAuth';

interface Objective {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  weight: number;
  status: string;
  dueDate: string;
  quarter: string;
  year: number;
  userId: string;
  assignedById: string;
  completedAt?: string;
  submittedToManagerAt?: string;
  submittedToHrAt?: string;
  hrApprovedAt?: string;
  aiScoreMetadata?: string;
  managerFeedback?: string;
  hrNotes?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    title: string;
  };
  assignedBy?: {
    id: string;
    name: string;
    email: string;
    title: string;
  };
}

export default function HRIncomingObjectivesPage() {
  const { user, isLoading: authLoading } = useAuth(true, ['HR', 'hr', 'SENIOR_MANAGEMENT', 'senior_management']);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedObjective, setSelectedObjective] = useState<Objective | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    loadIncomingObjectives();
  }, [authLoading, user]);

  const loadIncomingObjectives = async () => {
    setLoading(true);
    try {
      console.log('Loading incoming objectives for HR approval:', user?.id);
      // This will fetch objectives that have been submitted to HR by managers OR approved by HR
      const response = await fetch(`/api/hr/pending-approvals`);
      const data = await response.json();
      console.log('Incoming objectives response:', data);
      
      if (data.success) {
        setObjectives(data.objectives || []);
        console.log(`Found ${data.objectives?.length || 0} objectives for HR review`);
      } else {
        console.error('Failed to load incoming objectives:', data.error);
        setObjectives([]);
      }
    } catch (error) {
      console.error('Error loading incoming objectives:', error);
      setObjectives([]);
    } finally {
      setLoading(false);
    }
  };

  const getWorkflowStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'submitted_to_hr':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ai_scored':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'reviewed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'hr_approved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCompletionPercentage = (objective: Objective) => {
    return Math.round((objective.current / objective.target) * 100);
  };

  const getAIScore = (objective: Objective) => {
    if (!objective.aiScoreMetadata) return null;
    try {
      const metadata = JSON.parse(objective.aiScoreMetadata);
      return metadata.score;
    } catch {
      return null;
    }
  };

  const calculateBonusAmount = (objective: Objective) => {
    // Simple bonus calculation for now - we'll enhance this later
    // Base calculation: (AI Score / Weight) * Base Bonus * Weight Factor
    const aiScore = getAIScore(objective);
    if (!aiScore) return 0;
    
    const baseBonusPerPoint = 100; // $100 per point
    const weightMultiplier = objective.weight / 100; // Convert percentage to decimal
    const bonusAmount = Math.round(aiScore * baseBonusPerPoint * weightMultiplier);
    
    return bonusAmount;
  };

  const handleApproveObjective = async (objectiveId: string) => {
    try {
      const response = await fetch('/api/hr/approve-objective', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          objectiveId,
          hrId: user?.id,
          action: 'approve',
          notes: 'Approved for bonus calculation'
        }),
      });

      const result = await response.json();
      if (result.success) {
        // Refresh the list
        loadIncomingObjectives();
        setSelectedObjective(null);
      } else {
        alert('Failed to approve objective: ' + result.error);
      }
    } catch (error) {
      console.error('Error approving objective:', error);
      alert('Error approving objective');
    }
  };

  const handleRejectObjective = async (objectiveId: string, reason: string) => {
    try {
      const response = await fetch('/api/hr/approve-objective', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          objectiveId,
          hrId: user?.id,
          action: 'reject',
          notes: reason
        }),
      });

      const result = await response.json();
      if (result.success) {
        // Refresh the list
        loadIncomingObjectives();
        setSelectedObjective(null);
      } else {
        alert('Failed to reject objective: ' + result.error);
      }
    } catch (error) {
      console.error('Error rejecting objective:', error);
      alert('Error rejecting objective');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004E9E] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading incoming objectives...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Authentication required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Incoming Objectives</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Review and approve objectives submitted by managers for final evaluation
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">HR</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900">
                  {objectives.filter(obj => obj.status === 'SUBMITTED_TO_HR').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">
                  {objectives.filter(obj => obj.status === 'REJECTED').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <SparklesIcon className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Achievement</p>
                <p className="text-2xl font-bold text-gray-900">
                  {objectives.length > 0 
                    ? Math.round(objectives.reduce((sum, obj) => sum + getCompletionPercentage(obj), 0) / objectives.length)
                    : 0}%
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-indigo-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Achievement</p>
                <p className="text-2xl font-bold text-gray-900">
                  {objectives.length > 0 
                    ? Math.round(objectives.reduce((sum, obj) => sum + getCompletionPercentage(obj), 0) / objectives.length)
                    : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Objectives List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">HR Objective Reviews</h2>
            <p className="text-sm text-gray-500 mt-1">Review manager evaluations and approve for bonus calculation</p>
          </div>
          <div className="overflow-x-auto">
            {objectives.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee & Objective
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Achievement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      AI Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bonus Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {objectives.map((objective) => {
                    const aiScore = getAIScore(objective);
                    const bonusAmount = calculateBonusAmount(objective);
                    const isRejected = objective.status === 'REJECTED';
                    
                    return (
                      <tr key={objective.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{objective.user.name}</div>
                            <div className="text-sm text-gray-500">{objective.title}</div>
                            <div className="text-xs text-gray-400">Weight: {objective.weight}%</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                              <div 
                                className="bg-blue-500 h-2 rounded-full" 
                                style={{ width: `${Math.min(100, getCompletionPercentage(objective))}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-900">{getCompletionPercentage(objective)}%</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {objective.current} / {objective.target}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {aiScore ? (
                            <div className="flex items-center">
                              <SparklesIcon className="h-4 w-4 text-purple-500 mr-1" />
                              <span className="text-sm font-medium text-gray-900">{aiScore}</span>
                              <span className="text-xs text-gray-500">/{objective.weight}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">No AI score</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isRejected ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                              <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                              Rejected
                            </span>
                          ) : (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getWorkflowStatusColor(objective.status)}`}>
                              <ClockIcon className="h-3 w-3 mr-1" />
                              {objective.status.replace('_', ' ')}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isRejected ? (
                            <div className="text-sm text-gray-400">
                              $0
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">
                              ${bonusAmount.toLocaleString()} (est.)
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setSelectedObjective(objective)}
                              className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#004E9E]"
                            >
                              <EyeIcon className="h-4 w-4 mr-1" />
                              Review
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center">
                <DocumentCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No incoming objectives</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No objectives have been submitted by managers for HR approval yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {selectedObjective && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Review Objective</h3>
                <button
                  onClick={() => setSelectedObjective(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">{selectedObjective.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{selectedObjective.description}</p>
                  <p className="text-sm text-gray-500 mt-1">Employee: {selectedObjective.user.name}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Target</label>
                    <p className="text-sm text-gray-900">{selectedObjective.target}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Achieved</label>
                    <p className="text-sm text-gray-900">{selectedObjective.current}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Achievement Rate</label>
                    <p className="text-sm text-gray-900">{getCompletionPercentage(selectedObjective)}%</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Weight</label>
                    <p className="text-sm text-gray-900">{selectedObjective.weight}%</p>
                  </div>
                </div>

                {getAIScore(selectedObjective) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">AI Score</label>
                    <p className="text-sm text-gray-900">{getAIScore(selectedObjective)} / {selectedObjective.weight}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Estimated Bonus Amount</label>
                  <p className="text-sm font-medium text-green-600">${calculateBonusAmount(selectedObjective).toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Based on AI score and weight factor</p>
                </div>

                {selectedObjective.managerFeedback && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Manager Feedback</label>
                    <p className="text-sm text-gray-900">{selectedObjective.managerFeedback}</p>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  {selectedObjective.status === 'REJECTED' ? (
                    <div className="flex-1 bg-red-100 border border-red-200 rounded-md p-4 text-center">
                      <ExclamationTriangleIcon className="h-8 w-8 text-red-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-red-800">Objective Rejected</p>
                      <p className="text-sm text-red-600">No bonus will be awarded</p>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleApproveObjective(selectedObjective.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <CheckCircleIcon className="h-4 w-4 inline mr-2" />
                        Approve for Bonus
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Please provide a reason for rejection:');
                          if (reason) {
                            handleRejectObjective(selectedObjective.id, reason);
                          }
                        }}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <ExclamationTriangleIcon className="h-4 w-4 inline mr-2" />
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
