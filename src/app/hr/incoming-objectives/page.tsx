"use client";

import { useState, useEffect } from "react";
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  UserGroupIcon,
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
  userId?: string;
  managerId?: string;
  assignedById?: string;
  completedAt?: string;
  submittedToManagerAt?: string;
  submittedToHrAt?: string;
  hrApprovedAt?: string;
  aiScoreMetadata?: string;
  managerFeedback?: string;
  hrNotes?: string;
  createdAt: string;
  updatedAt: string;
  objectiveType?: 'EMPLOYEE' | 'MANAGER';
  // For employee objectives
  user?: {
    id: string;
    name: string;
    email: string;
    title: string;
    salary?: number;
    allocatedBonusAmount?: number;
  };
  // For manager objectives
  manager?: {
    id: string;
    name: string;
    email: string;
    title: string;
    salary?: number;
    allocatedBonusAmount?: number;
  };
  submittedBy?: {
    id: string;
    name: string;
    email: string;
    title: string;
    salary?: number;
    allocatedBonusAmount?: number;
  };
  assignedBy?: {
    id: string;
    name: string;
    email: string;
    title: string;
  };
  reviews?: Array<{
    id: string;
    score: number;
    comments: string;
    reviewDate: string;
    reviewer: {
      id: string;
      name: string;
      title: string;
    };
  }>;
}

export default function HRIncomingObjectivesPage() {
  const { user, isLoading: authLoading } = useAuth(true, ['HR', 'hr', 'SENIOR_MANAGEMENT', 'senior_management']);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedObjective, setSelectedObjective] = useState<Objective | null>(null);
  const [manualBonusOverrides, setManualBonusOverrides] = useState<Record<string, { amount: number; reason: string }>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    loadIncomingObjectives();
  }, [authLoading, user]);

  // Handle checkbox toggle for manual bonus override
  useEffect(() => {
    if (!selectedObjective) return;
    
    const checkbox = document.getElementById(`override_${selectedObjective.id}`) as HTMLInputElement;
    const detailsDiv = document.getElementById(`override_details_${selectedObjective.id}`);
    
    const handleChange = () => {
      if (checkbox.checked) {
        detailsDiv?.classList.remove('hidden');
      } else {
        detailsDiv?.classList.add('hidden');
      }
    };

    checkbox?.addEventListener('change', handleChange);
    return () => checkbox?.removeEventListener('change', handleChange);
  }, [selectedObjective]);

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
    if (!objective.current || !objective.target) return 0;
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

  const getFinalScore = (objective: Objective) => {
    // Check if there's a manager review with a score (final score)
    if (objective.reviews && objective.reviews.length > 0) {
      const latestReview = objective.reviews[0]; // Reviews are ordered by reviewDate desc
      return latestReview?.score || 0;
    }
    // Fall back to AI score if no manager review
    return getAIScore(objective);
  };

  const getUserData = (objective: Objective) => {
    return objective.submittedBy || objective.user || objective.manager || null;
  };

  const calculateBonusAmount = (objective: Objective) => {
    // Enhanced bonus calculation based on weight and final score
    const finalScore = getFinalScore(objective);
    if (!finalScore) return 0;
    
    // Get user data and fetch their allocated bonus amount from DB
    const userData = getUserData(objective);
    let bonusPool = userData?.allocatedBonusAmount;
    
    // If no allocated amount, use salary-based calculation
    if (!bonusPool || bonusPool === 0) {
      const salary = userData?.salary || 50000;
      // Default: 10% of annual salary / 4 quarters
      bonusPool = (salary * 0.1) / 4;
    }
    
    // Ensure bonus pool is never zero
    if (!bonusPool || bonusPool <= 0) {
      bonusPool = 312.5; // Fallback: ~$50k * 0.1 / 4 quarters
    }
    
    // Weight factor: percentage of bonus pool this objective represents
    const weightPercentage = (objective.weight || 0) / 100;
    
    // Normalize score to percentage (if score is 0-10, convert to 0-100; if already 0-100, use as is)
    let scorePercentage = finalScore;
    if (finalScore <= 10) {
      // Score is on 0-10 scale, convert to 0-100
      scorePercentage = (finalScore / 10) * 100;
    }
    // Score percentage is capped at 100
    scorePercentage = Math.min(scorePercentage, 100);
    
    // Calculate bonus:
    // base = bonus pool * weight percentage (portion of pool allocated to this objective)
    // final = base * (score percentage / 100) (actual achieved based on performance)
    const baseBonusForObjective = bonusPool * weightPercentage;
    const actualBonus = baseBonusForObjective * (scorePercentage / 100);
    
    return Math.round(actualBonus);
  };

  const handleApproveObjective = async (objectiveId: string) => {
    try {
      // Find the objective to get its type
      const objectiveToApprove = objectives.find(obj => obj.id === objectiveId);
      
      // Check if manual bonus override is enabled
      const overrideCheckbox = document.getElementById(`override_${objectiveId}`) as HTMLInputElement;
      const isManualBonusEnabled = overrideCheckbox?.checked || false;
      
      let finalBonusAmount = calculateBonusAmount(objectiveToApprove!);
      let bonusReason = '';

      if (isManualBonusEnabled) {
        const manualBonusInput = document.getElementById(`manual_bonus_${objectiveId}`) as HTMLInputElement;
        const reasonInput = document.getElementById(`override_reason_${objectiveId}`) as HTMLTextAreaElement;
        
        const manualAmount = parseFloat(manualBonusInput?.value || '0');
        if (manualAmount > 0) {
          finalBonusAmount = manualAmount;
          bonusReason = reasonInput?.value || 'Manual override by HR';

          // Call manual bonus API first
          const manualBonusRes = await fetch('/api/hr/manual-bonus', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              employeeId: objectiveToApprove?.userId || objectiveToApprove?.managerId,
              amount: manualAmount,
              quarter: objectiveToApprove?.quarter || 'Q4',
              year: objectiveToApprove?.year || new Date().getFullYear(),
              reason: bonusReason,
              hrId: user?.id
            })
          });

          if (!manualBonusRes.ok) {
            alert('Failed to set manual bonus. Please try again.');
            return;
          }
        }
      }

      const response = await fetch('/api/hr/approve-objective', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          objectiveId,
          hrId: user?.id,
          action: 'approve',
          notes: `Approved for bonus calculation - ${objectiveToApprove?.objectiveType === 'MANAGER' ? 'Manager' : 'Employee'} objective${isManualBonusEnabled ? ` - Manual Bonus: $${finalBonusAmount}` : ''}`,
          objectiveType: objectiveToApprove?.objectiveType || 'EMPLOYEE'
        }),
      });

      const result = await response.json();
      if (result.success) {
        // Get employee name for success message
        const employeeName = objectiveToApprove?.user?.name || objectiveToApprove?.manager?.name || objectiveToApprove?.submittedBy?.name || 'Employee';
        const bonusAmount = finalBonusAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        
        // Show success popup
        setSuccessMessage(`${bonusAmount} has been approved for bonus for ${employeeName}.`);
        setShowSuccessPopup(true);

        // Auto close after 3 seconds
        setTimeout(() => {
          setShowSuccessPopup(false);
          loadIncomingObjectives();
          setSelectedObjective(null);
        }, 3000);

        // Clear the override state
        setManualBonusOverrides(prev => {
          const newOverrides = { ...prev };
          delete newOverrides[objectiveId];
          return newOverrides;
        });
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
      // Find the objective to get its type
      const objectiveToReject = objectives.find(obj => obj.id === objectiveId);
      
      const response = await fetch('/api/hr/approve-objective', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          objectiveId,
          hrId: user?.id,
          action: 'reject',
          notes: `${reason} - ${objectiveToReject?.objectiveType === 'MANAGER' ? 'Manager' : 'Employee'} objective`,
          objectiveType: objectiveToReject?.objectiveType || 'EMPLOYEE'
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
    return <LoadingSpinner message="Loading incoming objectives..." />;
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
                  Review and approve employee and manager objectives submitted for final evaluation and bonus calculation
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards - Minimal Design */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Pending Reviews */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <ClockIcon className="h-6 w-6 text-gray-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {objectives.filter(obj => obj.status !== 'REJECTED' && obj.status !== 'HR_APPROVED').length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Awaiting HR approval</p>
          </div>

          {/* Approved This Quarter - Placeholder */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-gray-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600">Approved This Quarter</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
            <p className="text-xs text-gray-500 mt-1">Coming soon</p>
          </div>

          {/* Total Bonus Allocated - Placeholder */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <DocumentCheckIcon className="h-6 w-6 text-gray-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600">Total Bonus Allocated</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">$0</p>
            <p className="text-xs text-gray-500 mt-1">Coming soon</p>
          </div>

          {/* Average Score - Placeholder */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <SparklesIcon className="h-6 w-6 text-gray-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600">Average Score</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
            <p className="text-xs text-gray-500 mt-1">Coming soon</p>
          </div>
        </div>

        {/* Objectives List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">HR Objective Reviews</h2>
            <p className="text-sm text-gray-500 mt-1">Review employee and manager objectives and approve for bonus calculation based on weight and final scores</p>
          </div>
          <div className="overflow-x-auto">
            {objectives.filter(obj => obj.status !== 'REJECTED').length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Objective Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Achievement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Final Score
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
                  {objectives
                    .filter(objective => objective.status !== 'REJECTED')
                    .map((objective) => {
                    const finalScore = getFinalScore(objective);
                    const aiScore = getAIScore(objective);
                    const bonusAmount = calculateBonusAmount(objective);
                    const isRejected = objective.status === 'REJECTED';
                    
                    return (
                      <tr key={objective.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{objective.title}</div>
                            <div className="text-xs text-gray-500">{objective.description && objective.description.length > 30 ? `${objective.description.substring(0, 30)}...` : (objective.description || 'No description')}</div>
                            <div className="text-xs text-gray-400">{objective.weight < 1 ? Math.round(objective.weight * 100) : objective.weight}% • Q{objective.quarter}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {objective.submittedBy?.name || objective.user?.name || objective.manager?.name || 'Unknown User'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {objective.submittedBy?.title || objective.user?.title || objective.manager?.title || 'Unknown Title'}
                          </div>
                          <div className="text-xs text-blue-600">
                            {objective.objectiveType === 'MANAGER' ? '👔 Manager' : '👤 Employee'}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {objective.assignedBy?.name || 'Manager'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {objective.assignedBy?.title || 'Manager'}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-12 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full" 
                                style={{ width: `${Math.min(100, getCompletionPercentage(objective))}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-900">{getCompletionPercentage(objective)}%</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {objective.current}/{objective.target}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {finalScore ? (
                            <div className="flex items-center">
                              {objective.reviews && objective.reviews.length > 0 ? (
                                <div className="flex items-center">
                                  <div className="h-2 w-2 bg-green-500 rounded-full mr-1" title="Manager Override" />
                                  <span className="text-xs font-medium text-green-700">{finalScore < 1 ? Math.round(finalScore * 100) : finalScore}%</span>
                                </div>
                              ) : (
                                <div className="flex items-center">
                                  <SparklesIcon className="h-3 w-3 text-purple-500 mr-1" />
                                  <span className="text-xs font-medium text-gray-900">{finalScore < 1 ? Math.round(finalScore * 100) : finalScore}%</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">No score</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {isRejected ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                              Rejected
                            </span>
                          ) : (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getWorkflowStatusColor(objective.status)}`}>
                              {objective.status?.replace('_', ' ') || 'Unknown Status'}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {isRejected ? (
                            <div className="text-xs text-gray-400">$0</div>
                          ) : (
                            <div className="text-xs text-gray-500">${bonusAmount.toLocaleString()}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900">
                          <button
                            onClick={() => setSelectedObjective(objective)}
                            className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <EyeIcon className="h-3 w-3 mr-1" />
                            Review
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center">
                <DocumentCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No pending objectives</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No objectives are currently pending HR review. Rejected objectives can be viewed in the "All Objectives" page.
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
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedObjective.objectiveType === 'MANAGER' ? 'Manager' : 'Employee'}: {selectedObjective.submittedBy?.name || selectedObjective.user?.name || selectedObjective.manager?.name || 'Unknown User'}
                    <span className="ml-2 text-xs bg-blue-100 px-2 py-1 rounded-full">
                      {selectedObjective.objectiveType === 'MANAGER' ? '👔 Manager Objective' : '👤 Employee Objective'}
                    </span>
                  </p>
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
                    <p className="text-sm text-gray-900">{selectedObjective.weight < 1 ? Math.round(selectedObjective.weight * 100) : selectedObjective.weight}%</p>
                  </div>
                </div>

                {getFinalScore(selectedObjective) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {selectedObjective.reviews && selectedObjective.reviews.length > 0 ? 'Final Score (Manager Override)' : 'AI Score'}
                    </label>
                    <p className="text-sm text-gray-900">
                      <span className={selectedObjective.reviews && selectedObjective.reviews.length > 0 ? 'text-green-700 font-medium' : ''}>
                        {getFinalScore(selectedObjective) < 1 ? Math.round(getFinalScore(selectedObjective) * 100) : getFinalScore(selectedObjective)}%
                      </span>
                      {' / '}
                      {selectedObjective.weight < 1 ? Math.round(selectedObjective.weight * 100) : selectedObjective.weight}%
                    </p>
                    {selectedObjective.reviews && selectedObjective.reviews.length > 0 && getAIScore(selectedObjective) && (
                      <p className="text-xs text-gray-500 mt-1">
                        Original AI Score: {getAIScore(selectedObjective) < 1 ? Math.round(getAIScore(selectedObjective) * 100) : getAIScore(selectedObjective)}%
                      </p>
                    )}
                  </div>
                )}

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-green-800 mb-2">💰 Calculated Bonus Amount</label>
                  <p className="text-lg font-bold text-green-700">${calculateBonusAmount(selectedObjective).toLocaleString()}</p>
                  <div className="mt-2 text-xs text-green-700 space-y-1">
                    <p>• Based on quarterly bonus allocation from salary</p>
                    <p>• Weight factor: {selectedObjective.weight || 0}% of quarterly pool</p>
                    <p>• Score factor: {getFinalScore(selectedObjective) || 0}/10 achievement rate</p>
                    <p>• Objective Type: {selectedObjective.objectiveType === 'MANAGER' ? '👔 Manager' : '👤 Employee'}</p>
                  </div>
                </div>

                {/* Manual Bonus Override Option */}
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      id={`override_${selectedObjective?.id}`}
                      className="w-5 h-5 text-[#004E9E] rounded"
                    />
                    <span className="font-semibold text-gray-900 text-base">Override with Manual Bonus Amount</span>
                  </label>
                  <div id={`override_details_${selectedObjective?.id}`} className="hidden mt-3 space-y-3">
                    <input
                      type="number"
                      id={`manual_bonus_${selectedObjective?.id}`}
                      placeholder={`Enter manual bonus amount (current: $${calculateBonusAmount(selectedObjective)})`}
                      className="w-full border border-yellow-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                    <textarea
                      id={`override_reason_${selectedObjective?.id}`}
                      placeholder="Reason for override (optional)"
                      rows={2}
                      className="w-full border border-yellow-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                    <p className="text-xs text-yellow-800">✓ When this checkbox is enabled, the manual bonus amount will be used instead of the calculated amount.</p>
                  </div>
                </div>

                {/* Manager Feedback Section */}
                {(selectedObjective.managerFeedback || (selectedObjective.reviews && selectedObjective.reviews.length > 0)) && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">Manager's Final Comments</label>
                    
                    {/* Manager Feedback from objective */}
                    {selectedObjective.managerFeedback && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <h5 className="text-sm font-medium text-blue-900 mb-1">Manager Feedback</h5>
                        <p className="text-sm text-blue-800">{selectedObjective.managerFeedback}</p>
                      </div>
                    )}

                    {/* Manager Review Comments */}
                    {selectedObjective.reviews && selectedObjective.reviews
                      .filter((review: any) => review.comments && review.comments.trim())
                      .map((review: any, index: number) => (
                        <div key={review.id || index} className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <h5 className="text-sm font-medium text-green-900">
                              Manager Review {review.reviewer?.name ? `by ${review.reviewer.name}` : ''}
                            </h5>
                            {review.score && (
                              <span className="text-sm font-medium text-green-700">
                                Score: {review.score < 1 ? Math.round(review.score * 100) : review.score}%
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-green-800">{review.comments}</p>
                          {review.reviewDate && (
                            <p className="text-xs text-green-600 mt-1">
                              {new Date(review.reviewDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ))
                    }
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

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md mx-auto animate-pulse">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-green-100 rounded-full p-4">
                <CheckCircleIcon className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-center text-gray-900 mb-3">
              Bonus Approved Successfully!
            </h3>
            <p className="text-center text-gray-700 text-base leading-relaxed">
              {successMessage}
            </p>
            <div className="mt-6 flex justify-center">
              <div className="inline-flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
