"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  TrophyIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PencilIcon,
  UserGroupIcon,
  ClockIcon,
  DocumentCheckIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from '@/hooks/useAuth';

interface ScoredObjective {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  weight: number;
  status: string;
  quarter: string;
  year: number;
  employeeRemarks: string;
  user: {
    id: string;
    name: string;
    email: string;
    title: string;
  };
  aiEvaluation: {
    score: number;
    explanation: string;
    completionRate: number;
    generatedAt: string;
  };
  overrideScore?: number;
  justification?: string;
  managerComments?: string;
  reviewStatus: 'pending' | 'approved' | 'overridden' | 'submitted';
}

export default function ScoreReviewsPage() {
  const { user, isLoading: authLoading } = useAuth(true, ['MANAGER', 'manager']);
  const [scoredObjectives, setScoredObjectives] = useState<ScoredObjective[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedObjective, setSelectedObjective] = useState<ScoredObjective | null>(null);
  const [managerScore, setManagerScore] = useState<number>(0);
  const [remarks, setRemarks] = useState<string>('');
  const [justification, setJustification] = useState<string>('');
  const [selectedObjectives, setSelectedObjectives] = useState<Set<string>>(new Set());
  const [digitalSignature, setDigitalSignature] = useState('');
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    loadScoredObjectives();
  }, [authLoading, user]);

  const loadScoredObjectives = async () => {
    setLoading(true);
    try {
      console.log('Loading AI-scored objectives for manager:', user?.id);
      const response = await fetch(`/api/manager/ai-scored-objectives?managerId=${user?.id}`);
      const data = await response.json();
      console.log('AI-scored objectives response:', data);
      
      if (data.success) {
        const transformedObjectives: ScoredObjective[] = data.objectives.map((objective: any) => ({
          id: objective.id,
          title: objective.title,
          description: objective.description || '',
          target: objective.target,
          current: objective.current || 0,
          weight: objective.weight || 100,
          status: objective.status,
          quarter: objective.quarter,
          year: objective.year,
          employeeRemarks: objective.employeeRemarks || 'Objective completed by employee',
          user: objective.user,
          aiEvaluation: {
            score: objective.aiEvaluation?.score || 0,
            explanation: objective.aiEvaluation?.explanation || 'AI analysis completed',
            completionRate: objective.aiEvaluation?.completionRate || 0,
            generatedAt: objective.aiEvaluation?.generatedAt || new Date().toISOString()
          },
          reviewStatus: 'pending' as const
        }));
        
        setScoredObjectives(transformedObjectives);
        console.log(`Found ${transformedObjectives.length} AI-scored objectives to review`);
      } else {
        console.error('Failed to load AI-scored objectives:', data.error);
        setScoredObjectives([]);
      }
    } catch (error) {
      console.error('Error loading AI-scored objectives:', error);
      setScoredObjectives([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewScore = (objective: ScoredObjective) => {
    setSelectedObjective(objective);
    setManagerScore(objective.overrideScore || objective.aiEvaluation.score);
    setRemarks('');
  };

  const submitReview = async () => {
    if (!selectedObjective) return;
    
    try {
      const response = await fetch('/api/manager/review-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objectiveId: selectedObjective.id,
          aiScore: selectedObjective.aiEvaluation.score,
          managerScore: managerScore,
          remarks: remarks,
          managerId: user?.id
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Update local state
        const newStatus: 'pending' | 'approved' | 'overridden' | 'submitted' = 
          managerScore === selectedObjective.aiEvaluation.score ? 'approved' : 'overridden';
        
        setScoredObjectives(prev => 
          prev.map(obj => 
            obj.id === selectedObjective.id 
              ? { ...obj, overrideScore: managerScore, reviewStatus: newStatus }
              : obj
          )
        );
        
        setSelectedObjective(null);
        alert("Score review submitted successfully!");
      } else {
        alert(data.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    }
  };

  const getCompletionPercentage = (objective: ScoredObjective) => {
    return Math.round((objective.current / objective.target) * 100);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'overridden':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'submitted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004E9E] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading scored objectives...</p>
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
                <h1 className="text-3xl font-bold text-gray-900">Score Reviews</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Review and finalize AI-generated scores before submitting to HR
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">Manager</p>
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
              <SparklesIcon className="h-8 w-8 text-[#004E9E]" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">AI Scored</p>
                <p className="text-2xl font-bold text-gray-900">{scoredObjectives.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900">
                  {scoredObjectives.filter(obj => !obj.reviewStatus || obj.reviewStatus === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Approved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {scoredObjectives.filter(obj => obj.reviewStatus === 'approved').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Overridden</p>
                <p className="text-2xl font-bold text-gray-900">
                  {scoredObjectives.filter(obj => obj.reviewStatus === 'overridden').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Objectives List */}
        <div className="space-y-6">
          {scoredObjectives.length > 0 ? (
            scoredObjectives.map((objective) => (
              <div key={objective.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{objective.title}</h3>
                      {objective.reviewStatus && (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(objective.reviewStatus)}`}>
                          {objective.reviewStatus === 'approved' && <CheckCircleIcon className="w-3 h-3 mr-1" />}
                          {objective.reviewStatus === 'overridden' && <ExclamationTriangleIcon className="w-3 h-3 mr-1" />}
                          {objective.reviewStatus.charAt(0).toUpperCase() + objective.reviewStatus.slice(1)}
                        </span>
                      )}
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
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
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
                      <div>
                        <p className="text-xs font-medium text-gray-500">AI Score</p>
                        <p className="text-sm font-semibold text-gray-900">{objective.aiEvaluation.score}/{objective.weight}</p>
                      </div>
                    </div>

                    {/* Scores Display */}
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <SparklesIcon className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-600">AI Score</span>
                        </div>
                        <p className="text-lg font-bold text-blue-700">{objective.aiEvaluation.score}</p>
                      </div>
                      
                      {objective.overrideScore && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center space-x-2">
                            <CheckCircleIcon className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-600">Manager Score</span>
                          </div>
                          <p className="text-lg font-bold text-green-700">{objective.overrideScore}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="ml-6 space-y-2">
                    {(!objective.reviewStatus || objective.reviewStatus === 'pending') && (
                      <button
                        onClick={() => handleReviewScore(objective)}
                        className="w-full px-4 py-2 bg-[#004E9E] text-white rounded-lg hover:bg-[#003875] flex items-center justify-center space-x-2"
                      >
                        <PencilIcon className="h-4 w-4" />
                        <span>Review Score</span>
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedObjective(objective)}
                      className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center space-x-2"
                    >
                      <EyeIcon className="h-4 w-4" />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
              <div className="text-center">
                <SparklesIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No AI-scored objectives</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Objectives that have been AI-scored will appear here for your review. Go to the Objectives page to generate AI scores first.
                </p>
                <div className="mt-4">
                  <p className="text-xs text-gray-400">
                    Debug: Manager ID: {user?.id} | Scored Objectives Count: {scoredObjectives.length}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {selectedObjective && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedObjective.reviewStatus ? 'Objective Details' : 'Review Score'}
                </h3>
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
                    <label className="block text-sm font-medium text-gray-700">AI Score</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedObjective.aiEvaluation.score}/{selectedObjective.weight}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Completion</label>
                    <p className="mt-1 text-sm text-gray-900">{getCompletionPercentage(selectedObjective)}%</p>
                  </div>
                </div>

                {(!selectedObjective.reviewStatus || selectedObjective.reviewStatus === 'pending') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Manager Score</label>
                      <input
                        type="number"
                        min="0"
                        max={selectedObjective.weight}
                        value={managerScore}
                        onChange={(e) => setManagerScore(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004E9E] focus:border-[#004E9E]"
                      />
                      <p className="text-xs text-gray-500 mt-1">Score out of {selectedObjective.weight}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Remarks (Optional)</label>
                      <textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004E9E] focus:border-[#004E9E]"
                        placeholder="Add any comments about this score..."
                      />
                    </div>
                  </>
                )}

                <div className="flex space-x-2 pt-4">
                  <button
                    onClick={() => setSelectedObjective(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    {selectedObjective.reviewStatus ? 'Close' : 'Cancel'}
                  </button>
                  {(!selectedObjective.reviewStatus || selectedObjective.reviewStatus === 'pending') && (
                    <button
                      onClick={submitReview}
                      className="flex-1 px-4 py-2 bg-[#004E9E] text-white rounded-md hover:bg-[#003875]"
                    >
                      Submit Review
                    </button>
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
