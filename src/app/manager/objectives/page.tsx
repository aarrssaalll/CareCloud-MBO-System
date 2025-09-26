"use client";

import { useState, useEffect } from "react";
import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  CalendarIcon,
  ScaleIcon,
  ChartBarIcon,
  StarIcon,
  DocumentCheckIcon,
  LockClosedIcon,
  PencilSquareIcon,
  UserGroupIcon,
  SparklesIcon,
  EyeIcon
} from "@heroicons/react/24/outline";
import { useAuth } from '@/hooks/useAuth';

interface CompletedObjective {
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
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    title: string;
  };
  reviews: any[];
  aiScore?: number;
  isProcessing?: boolean;
  employeeRemarks?: string;
}

export default function ManagerObjectivesPage() {
  const { user, isLoading: authLoading } = useAuth(true, ['MANAGER', 'manager']);
  const [completedObjectives, setCompletedObjectives] = useState<CompletedObjective[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedObjective, setSelectedObjective] = useState<CompletedObjective | null>(null);
  const [processingObjectives, setProcessingObjectives] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    loadCompletedObjectives();
  }, [authLoading, user]);

  const loadCompletedObjectives = async () => {
    setLoading(true);
    try {
      console.log('Loading completed objectives for manager:', user?.id);
      const response = await fetch(`/api/manager/completed-objectives?managerId=${user?.id}`);
      const data = await response.json();
      console.log('Completed objectives response:', data);
      
      if (data.success) {
        setCompletedObjectives(data.objectives);
        console.log(`Found ${data.objectives.length} completed objectives to review`);
      } else {
        console.error('Failed to load completed objectives:', data.error);
        setCompletedObjectives([]);
      }
    } catch (error) {
      console.error('Error loading completed objectives:', error);
      setCompletedObjectives([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAIScoring = async (objective: CompletedObjective) => {
    setProcessingObjectives(prev => new Set([...prev, objective.id]));
    
    try {
      console.log('Generating AI score for objective:', objective.id);
      const response = await fetch('/api/manager/ai-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objectiveId: objective.id,
          title: objective.title,
          description: objective.description,
          target: objective.target,
          current: objective.current,
          weight: objective.weight,
          employeeName: objective.user.name,
          employeeRemarks: objective.employeeRemarks || ''
        })
      });

      const data = await response.json();
      console.log('AI scoring response:', data);

      if (data.success) {
        // Update the objective with AI score
        setCompletedObjectives(prev => 
          prev.filter(obj => obj.id !== objective.id) // Remove from list as it's now AI-scored
        );
        alert(`✅ AI Score Generated: ${data.score}/${objective.weight}\n\nObjective moved to Review page for final scoring and approval.`);
      } else {
        alert(data.error || 'Failed to generate AI score');
      }
    } catch (error) {
      console.error('Error generating AI score:', error);
      alert('Failed to generate AI score');
    } finally {
      setProcessingObjectives(prev => {
        const newSet = new Set(prev);
        newSet.delete(objective.id);
        return newSet;
      });
    }
  };

  const handleBulkAIScoring = async () => {
    const unprocessedObjectives = completedObjectives.filter(obj => 
      !obj.aiScore && !processingObjectives.has(obj.id)
    );

    if (unprocessedObjectives.length === 0) {
      alert('No objectives available for AI scoring');
      return;
    }

    const confirmBulk = confirm(`Generate AI scores for ${unprocessedObjectives.length} objectives?\n\nThey will be moved to the Review page for final approval.`);
    if (!confirmBulk) return;

    let successCount = 0;
    let processedIds: string[] = [];

    for (const objective of unprocessedObjectives) {
      try {
        await handleAIScoring(objective);
        processedIds.push(objective.id);
        successCount++;
        // Add delay between requests to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to score objective ${objective.title}:`, error);
      }
    }

    // Remove all successfully processed objectives from the list
    setCompletedObjectives(prev => 
      prev.filter(obj => !processedIds.includes(obj.id))
    );

    alert(`✅ AI scoring completed for ${successCount}/${unprocessedObjectives.length} objectives!\n\nObjectives have been moved to the Review page.`);
  };

  const getCompletionPercentage = (objective: CompletedObjective) => {
    return Math.round((objective.current / objective.target) * 100);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004E9E] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading completed objectives...</p>
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
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#333333] to-[#666666] bg-clip-text text-transparent mb-2">
                  Objectives – AI Scoring
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Generate AI scores for completed objectives and move them to review page
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {/* User Profile */}
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.title || 'Manager'}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#004E9E] flex items-center justify-center">
                    <span className="text-white font-medium">
                      {user.firstName ? user.firstName[0] : ''}{user.lastName ? user.lastName[0] : ''}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="mb-4">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <div className="flex">
                  <a href="/manager-dashboard" className="text-gray-400 hover:text-gray-500">
                    Manager Dashboard
                  </a>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-4 text-sm font-medium text-gray-500">AI Scoring</span>
                </div>
              </li>
            </ol>
          </nav>
          <div className="mt-2 flex items-center space-x-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              Step 1: Generate AI Scores
            </span>
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <a 
              href="/manager-review" 
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Step 2: Review & Approve
            </a>
          </div>
        </div>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Awaiting AI Scoring</p>
                <p className="text-2xl font-bold text-gray-900">{completedObjectives.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <SparklesIcon className="h-8 w-8 text-[#004E9E]" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Processing</p>
                <p className="text-2xl font-bold text-gray-900">{processingObjectives.size}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Ready for Review</p>
                <p className="text-2xl font-bold text-gray-900">
                  <span className="text-sm text-gray-500">Check Review Page</span>
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <UserGroupIcon className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Team Members</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(completedObjectives.map(obj => obj.user.id)).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {completedObjectives.length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">AI Scoring Actions</h3>
                <p className="text-sm text-gray-500">
                  Generate AI scores for all pending objectives. They will be moved to the Review page for final approval.
                </p>
              </div>
              <button
                onClick={handleBulkAIScoring}
                disabled={processingObjectives.size > 0}
                className="px-4 py-2 bg-[#004E9E] text-white rounded-lg hover:bg-[#003875] disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <SparklesIcon className="h-4 w-4" />
                <span>Generate All AI Scores ({completedObjectives.length})</span>
              </button>
            </div>
          </div>
        )}

        {/* Objectives List */}
        <div className="space-y-6">
          {completedObjectives.length > 0 ? (
            completedObjectives.map((objective) => (
              <div key={objective.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{objective.title}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(objective.status)}`}>
                        {objective.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{objective.description}</p>
                    
                    {/* Employee Info */}
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-full bg-[#004E9E] flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {objective.user.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{objective.user.name}</p>
                          <p className="text-xs text-gray-500">{objective.user.title}</p>
                        </div>
                      </div>
                    </div>

                    {/* Progress and Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${Math.min(100, getCompletionPercentage(objective))}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="ml-6 text-right">
                    {processingObjectives.has(objective.id) ? (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="text-sm font-medium text-blue-600">Processing...</span>
                        </div>
                        <p className="text-sm text-blue-600">Generating AI score</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <button
                          onClick={() => handleAIScoring(objective)}
                          className="w-full px-4 py-2 bg-[#004E9E] text-white rounded-lg hover:bg-[#003875] flex items-center justify-center space-x-2"
                        >
                          <SparklesIcon className="h-4 w-4" />
                          <span>Generate AI Score</span>
                        </button>
                        <button
                          onClick={() => setSelectedObjective(objective)}
                          className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center space-x-2"
                        >
                          <EyeIcon className="h-4 w-4" />
                          <span>View Details</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
              <div className="text-center">
                <CheckCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No objectives awaiting AI scoring</h3>
                <p className="mt-1 text-sm text-gray-500">
                  All completed objectives have been AI-scored and moved to the Review page. 
                  Visit the Manager Review page to approve and submit them to HR.
                </p>
                <div className="mt-6">
                  <a 
                    href="/manager-review" 
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#004E9E] hover:bg-[#003875]"
                  >
                    Go to Review Page
                  </a>
                </div>
                <div className="mt-4">
                  <p className="text-xs text-gray-400">
                    Debug: Manager ID: {user?.id} | Objectives Count: {completedObjectives.length}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Objective Details Modal */}
      {selectedObjective && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Objective Details</h3>
                <button
                  onClick={() => setSelectedObjective(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">{selectedObjective.title}</h4>
                  <p className="text-gray-600 mt-1">{selectedObjective.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Employee</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedObjective.user.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Target</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedObjective.target}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Achieved</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedObjective.current}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Weight</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedObjective.weight}%</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Due Date</label>
                    <p className="mt-1 text-sm text-gray-900">{new Date(selectedObjective.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Completion</label>
                    <p className="mt-1 text-sm text-gray-900">{getCompletionPercentage(selectedObjective)}%</p>
                  </div>
                </div>

                <div className="flex space-x-2 pt-4">
                  <button
                    onClick={() => setSelectedObjective(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      handleAIScoring(selectedObjective);
                      setSelectedObjective(null);
                    }}
                    className="flex-1 px-4 py-2 bg-[#004E9E] text-white rounded-md hover:bg-[#003875] flex items-center justify-center space-x-2"
                  >
                    <SparklesIcon className="h-4 w-4" />
                    <span>Generate AI Score</span>
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
