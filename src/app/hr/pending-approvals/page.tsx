"use client";

import { useState, useEffect } from "react";
import { useAuth } from '@/hooks/useAuth';
import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  DocumentCheckIcon,
  UserIcon,
  StarIcon,
  SparklesIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  BanknotesIcon
} from "@heroicons/react/24/outline";

interface PendingObjective {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  weight: number;
  status: string;
  quarter: string;
  year: number;
  employeeName: string;
  employeeId: string;
  salary: number;
  managerName: string;
  managerScore: number;
  managerComments: string;
  aiScore: number;
  aiComments: string;
  submittedToHrAt: string;
}

export default function HRPendingApprovalsPage() {
  const { user, isLoading: authLoading } = useAuth(true, ['HR', 'hr']);
  const [pendingObjectives, setPendingObjectives] = useState<PendingObjective[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedObjectives, setSelectedObjectives] = useState<Set<string>>(new Set());
  const [hrNotes, setHrNotes] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [viewingObjective, setViewingObjective] = useState<PendingObjective | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    loadPendingApprovals();
  }, [authLoading, user]);

  const loadPendingApprovals = async () => {
    setLoading(true);
    try {
      console.log('Loading pending HR approvals for user:', user?.id);
      const response = await fetch(`/api/hr/pending-approvals?hrId=${user?.id}`);
      const data = await response.json();
      console.log('Pending approvals response:', data);
      
      if (data.success) {
        setPendingObjectives(data.objectivesForHR || []);
        console.log(`Found ${data.objectivesForHR?.length || 0} objectives pending HR approval`);
      } else {
        console.error('Failed to load pending approvals:', data.error);
        setPendingObjectives([]);
      }
    } catch (error) {
      console.error('Error loading pending approvals:', error);
      setPendingObjectives([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleObjectiveSelection = (objectiveId: string) => {
    setSelectedObjectives(prev => {
      const newSet = new Set(prev);
      if (newSet.has(objectiveId)) {
        newSet.delete(objectiveId);
      } else {
        newSet.add(objectiveId);
      }
      return newSet;
    });
  };

  const selectAllObjectives = () => {
    if (selectedObjectives.size === pendingObjectives.length) {
      setSelectedObjectives(new Set());
    } else {
      setSelectedObjectives(new Set(pendingObjectives.map(obj => obj.id)));
    }
  };

  const approveSelectedObjectives = async () => {
    if (selectedObjectives.size === 0) {
      alert('Please select objectives to approve');
      return;
    }

    const confirmApproval = confirm(
      `Approve ${selectedObjectives.size} objectives?\n\nThis will:\n` +
      `- Mark objectives as HR-approved\n` +
      `- Calculate performance bonuses\n` +
      `- Move to payroll processing\n\n` +
      `Proceed with approval?`
    );

    if (!confirmApproval) return;

    setIsApproving(true);
    try {
      const response = await fetch('/api/hr/approve-objectives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objectiveIds: Array.from(selectedObjectives),
          hrId: user?.id,
          hrNotes: hrNotes || 'Approved by HR',
          quarter: pendingObjectives[0]?.quarter || 'Q3',
          year: pendingObjectives[0]?.year || 2025
        })
      });

      const data = await response.json();
      if (data.success) {
        alert(
          `✅ Successfully approved ${selectedObjectives.size} objectives!\n\n` +
          `Bonuses calculated: ${data.bonusCalculations?.length || 0}\n` +
          `Total bonus amount: $${data.summary?.totalBonusAmount?.toFixed(2) || '0.00'}`
        );

        // Remove approved objectives from the list
        setPendingObjectives(prev => 
          prev.filter(obj => !selectedObjectives.has(obj.id))
        );
        setSelectedObjectives(new Set());
        setHrNotes('');
      } else {
        alert(data.error || 'Failed to approve objectives');
      }
    } catch (error) {
      console.error('Error approving objectives:', error);
      alert('Error approving objectives. Please try again.');
    } finally {
      setIsApproving(false);
    }
  };

  const getCompletionPercentage = (objective: PendingObjective) => {
    return Math.round((objective.current / objective.target) * 100);
  };

  const calculateBonusPreview = (objectives: PendingObjective[]) => {
    if (objectives.length === 0) return 0;
    
    const totalWeight = objectives.reduce((sum, obj) => sum + (obj.weight || 1), 0);
    const weightedScore = objectives.reduce((sum, obj) => {
      return sum + (obj.managerScore * (obj.weight || 1));
    }, 0) / totalWeight;

    const avgSalary = objectives.reduce((sum, obj) => sum + obj.salary, 0) / objectives.length;
    const quarterlyBonus = avgSalary * 0.15; // 15% quarterly bonus potential
    
    let performanceMultiplier = 0;
    if (weightedScore >= 90) performanceMultiplier = 1.2;
    else if (weightedScore >= 80) performanceMultiplier = 1.0;
    else if (weightedScore >= 70) performanceMultiplier = 0.8;
    else if (weightedScore >= 60) performanceMultiplier = 0.5;
    else performanceMultiplier = 0.25;

    return quarterlyBonus * performanceMultiplier * objectives.length;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004E9E] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pending approvals...</p>
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
                <h1 className="text-3xl font-bold text-gray-900">HR Pending Approvals</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Review and approve manager-submitted objectives for bonus calculation
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">HR Representative</p>
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
              <ClockIcon className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900">{pendingObjectives.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Selected</p>
                <p className="text-2xl font-bold text-gray-900">{selectedObjectives.size}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <UserIcon className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Employees</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(pendingObjectives.map(obj => obj.employeeId)).size}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <BanknotesIcon className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Bonus Preview</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${calculateBonusPreview(pendingObjectives.filter(obj => selectedObjectives.has(obj.id))).toFixed(0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {pendingObjectives.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Bulk Actions</h3>
                <p className="text-sm text-gray-500">
                  Select objectives for batch approval and bonus calculation
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={selectAllObjectives}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  {selectedObjectives.size === pendingObjectives.length ? 'Deselect All' : 'Select All'}
                </button>
                <button
                  onClick={approveSelectedObjectives}
                  disabled={selectedObjectives.size === 0 || isApproving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  {isApproving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Approving...</span>
                    </>
                  ) : (
                    <>
                      <CheckIcon className="h-4 w-4" />
                      <span>Approve Selected ({selectedObjectives.size})</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {selectedObjectives.size > 0 && (
              <div className="border-t border-gray-200 pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  HR Approval Notes (Optional)
                </label>
                <textarea
                  value={hrNotes}
                  onChange={(e) => setHrNotes(e.target.value)}
                  rows={2}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-[#004E9E] focus:border-[#004E9E]"
                  placeholder="Add notes about this approval batch..."
                />
              </div>
            )}
          </div>
        )}

        {/* Objectives List */}
        <div className="space-y-6">
          {pendingObjectives.length > 0 ? (
            pendingObjectives.map((objective) => (
              <div key={objective.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedObjectives.has(objective.id)}
                      onChange={() => toggleObjectiveSelection(objective.id)}
                      className="mt-2 h-4 w-4 text-[#004E9E] rounded focus:ring-[#004E9E]"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900">{objective.title}</h3>
                      <p className="text-gray-600 mt-1">{objective.description}</p>
                      
                      {/* Employee & Manager Info */}
                      <div className="flex items-center space-x-6 mt-3">
                        <div className="flex items-center space-x-2">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {objective.employeeName.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{objective.employeeName}</p>
                            <p className="text-xs text-gray-500">Employee</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-green-600">
                              {objective.managerName?.split(' ').map(n => n[0]).join('') || 'M'}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{objective.managerName || 'Manager'}</p>
                            <p className="text-xs text-gray-500">Manager</p>
                          </div>
                        </div>
                      </div>

                      {/* Progress & Scores */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-xs font-medium text-gray-500">Target</p>
                          <p className="text-sm font-semibold text-gray-900">{objective.target}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500">Achieved</p>
                          <p className="text-sm font-semibold text-gray-900">{objective.current}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500">Completion</p>
                          <p className="text-sm font-semibold text-gray-900">{getCompletionPercentage(objective)}%</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500">Weight</p>
                          <p className="text-sm font-semibold text-gray-900">{objective.weight}%</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Score Display */}
                  <div className="text-right min-w-[200px] space-y-2">
                    {/* AI Score */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <SparklesIcon className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-600">AI Score</span>
                      </div>
                      <p className="text-lg font-bold text-blue-700">{objective.aiScore}</p>
                    </div>

                    {/* Manager Score */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <StarIcon className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">Manager Score</span>
                      </div>
                      <p className="text-lg font-bold text-green-700">{objective.managerScore}</p>
                    </div>

                    <button
                      onClick={() => setViewingObjective(objective)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-center space-x-2"
                    >
                      <EyeIcon className="h-4 w-4" />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>

                {/* Manager Comments Preview */}
                {objective.managerComments && (
                  <div className="border-t border-gray-200 pt-4">
                    <h5 className="font-medium text-gray-900 mb-2">Manager Comments:</h5>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded text-sm">
                      {objective.managerComments.length > 150 
                        ? `${objective.managerComments.substring(0, 150)}...` 
                        : objective.managerComments}
                    </p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
              <div className="text-center">
                <DocumentCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No pending approvals</h3>
                <p className="mt-1 text-sm text-gray-500">
                  All manager-submitted objectives have been processed.
                  New submissions will appear here for your review.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {viewingObjective && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Objective Details</h3>
                <button
                  onClick={() => setViewingObjective(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900">{viewingObjective.title}</h4>
                  <p className="text-gray-600 mt-1">{viewingObjective.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Employee Information</h5>
                    <div className="bg-gray-50 p-4 rounded">
                      <p><strong>Name:</strong> {viewingObjective.employeeName}</p>
                      <p><strong>Employee ID:</strong> {viewingObjective.employeeId}</p>
                      <p><strong>Salary:</strong> ${viewingObjective.salary?.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Performance Metrics</h5>
                    <div className="bg-gray-50 p-4 rounded">
                      <p><strong>Target:</strong> {viewingObjective.target}</p>
                      <p><strong>Achieved:</strong> {viewingObjective.current}</p>
                      <p><strong>Weight:</strong> {viewingObjective.weight}%</p>
                      <p><strong>Completion:</strong> {getCompletionPercentage(viewingObjective)}%</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Scoring Details</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded border border-blue-200">
                      <p className="font-medium text-blue-600">AI Analysis</p>
                      <p className="text-lg font-bold text-blue-700">Score: {viewingObjective.aiScore}</p>
                      <p className="text-sm text-blue-600 mt-2">{viewingObjective.aiComments}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded border border-green-200">
                      <p className="font-medium text-green-600">Manager Review</p>
                      <p className="text-lg font-bold text-green-700">Score: {viewingObjective.managerScore}</p>
                      <p className="text-sm text-green-600 mt-1">By: {viewingObjective.managerName}</p>
                    </div>
                  </div>
                </div>

                {viewingObjective.managerComments && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Manager Comments</h5>
                    <div className="bg-gray-50 p-4 rounded border">
                      <p className="text-gray-700">{viewingObjective.managerComments}</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => setViewingObjective(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
