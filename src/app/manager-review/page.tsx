"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  CheckCircleIcon,
  XCircleIcon,
  PencilSquareIcon,
  ChartBarIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  DocumentCheckIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";
import { ManagerReview, AIAnalysisResult, WorkflowStatus } from "../../types/workflow";

interface AIScoreObjective {
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
  readyForSubmission?: boolean;
}

export default function ManagerReviewPage() {
  const [user, setUser] = useState<any>(null);
  const [objectives, setObjectives] = useState<AIScoreObjective[]>([]);
  const [loading, setLoading] = useState(true);
  const [overrideScores, setOverrideScores] = useState<Record<string, number>>({});
  const [justifications, setJustifications] = useState<Record<string, string>>({});
  const [managerComments, setManagerComments] = useState<Record<string, string>>({});
  const [selectedObjectives, setSelectedObjectives] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [digitalSignature, setDigitalSignature] = useState("");
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  
  // Individual submission states
  const [showIndividualModal, setShowIndividualModal] = useState(false);
  const [selectedIndividualObjective, setSelectedIndividualObjective] = useState<AIScoreObjective | null>(null);
  const [individualSignature, setIndividualSignature] = useState('');
  const [individualNotes, setIndividualNotes] = useState('');
  const [isIndividualSubmitting, setIsIndividualSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    const userRole = parsedUser.role?.toLowerCase();
    if (userRole !== "manager") {
      console.log('User role mismatch. Expected: manager, Got:', userRole);
      router.push("/manager-dashboard");
      return;
    }
    
    setUser(parsedUser);
  }, [router]);

  // Separate useEffect to load objectives when user is available
  useEffect(() => {
    if (user?.id) {
      loadObjectives();
    }
  }, [user]);

  const loadObjectives = async () => {
    if (!user?.id) {
      console.log('No user ID available, skipping load');
      return;
    }
    
    setLoading(true);
    try {
      console.log('Loading AI-scored objectives for manager:', user.id);
      const response = await fetch(`/api/manager/ai-scored-objectives?managerId=${user.id}`);
      const data = await response.json();
      
      console.log('API Response:', data);
      
      if (data.success) {
        const aiScoredObjectives: AIScoreObjective[] = data.objectives.map((objective: any) => ({
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
          readyForSubmission: false
        }));
        
        console.log('Processed objectives:', aiScoredObjectives);
        setObjectives(aiScoredObjectives);
        console.log(`Loaded ${aiScoredObjectives.length} AI-scored objectives for review`);
      } else {
        console.error('Failed to load AI-scored objectives:', data.error);
        setObjectives([]);
      }
    } catch (error) {
      console.error('Error loading AI-scored objectives:', error);
      setObjectives([]);
    } finally {
      setLoading(false);
    }
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

  const handleManagerComments = (objectiveId: string, comments: string) => {
    setManagerComments(prev => ({
      ...prev,
      [objectiveId]: comments
    }));
  };

  const getFinalScore = (objective: AIScoreObjective) => {
    return overrideScores[objective.id] !== undefined 
      ? overrideScores[objective.id] 
      : objective.aiEvaluation.score;
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

  const canSubmitObjective = (objective: AIScoreObjective) => {
    const hasManagerComments = managerComments[objective.id]?.trim().length > 0;
    const hasJustificationIfNeeded = overrideScores[objective.id] === undefined || 
                                     justifications[objective.id]?.trim().length > 0;
    return hasManagerComments && hasJustificationIfNeeded;
  };

  const submitSelectedObjectives = async () => {
    const objectivesToSubmit = objectives.filter(obj => selectedObjectives.has(obj.id));
    
    if (objectivesToSubmit.length === 0) {
      alert('Please select objectives to submit');
      return;
    }

    const invalidObjectives = objectivesToSubmit.filter(obj => !canSubmitObjective(obj));
    if (invalidObjectives.length > 0) {
      alert(`Please complete manager comments and justifications for all selected objectives.\n${invalidObjectives.length} objectives need attention.`);
      return;
    }

    if (!digitalSignature.trim()) {
      alert('Digital signature is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const reviewedObjectives = objectivesToSubmit.map(obj => ({
        objectiveId: obj.id,
        employeeId: obj.user.id,
        employeeName: obj.user.name,
        objectiveTitle: obj.title,
        finalScore: getFinalScore(obj),
        aiScore: obj.aiEvaluation.score,
        managerComments: managerComments[obj.id],
        aiRecommendation: obj.aiEvaluation.explanation
      }));

      const response = await fetch('/api/manager/submit-to-hr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          managerId: user?.id,
          reviewedObjectives: reviewedObjectives,
          managerSignature: digitalSignature,
          submissionNotes: `Submitted ${objectivesToSubmit.length} objectives for HR approval`
        })
      });

      const data = await response.json();
      if (data.success) {
        alert(`✅ Successfully submitted ${objectivesToSubmit.length} objectives to HR!\n\nSubmission ID: ${data.submissionId}`);
        // Remove submitted objectives from the list
        setObjectives(prev => prev.filter(obj => !selectedObjectives.has(obj.id)));
        setSelectedObjectives(new Set());
        setDigitalSignature('');
        setShowSubmissionModal(false);
        // Clear form data for submitted objectives
        objectivesToSubmit.forEach(obj => {
          delete overrideScores[obj.id];
          delete justifications[obj.id];
          delete managerComments[obj.id];
        });
      } else {
        alert(data.error || 'Failed to submit to HR');
      }
    } catch (error) {
      console.error('Error submitting to HR:', error);
      alert('Error submitting to HR. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Individual submission function
  const submitIndividualObjective = async () => {
    if (!selectedIndividualObjective) return;

    if (!canSubmitObjective(selectedIndividualObjective)) {
      alert('Please complete manager comments and justifications before submitting to HR.');
      return;
    }

    if (!individualSignature.trim()) {
      alert('Digital signature is required');
      return;
    }

    setIsIndividualSubmitting(true);
    try {
      const response = await fetch('/api/manager/submit-individual-to-hr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          managerId: user?.id,
          objectiveId: selectedIndividualObjective.id,
          finalScore: getFinalScore(selectedIndividualObjective),
          aiScore: selectedIndividualObjective.aiEvaluation.score,
          managerComments: managerComments[selectedIndividualObjective.id],
          aiRecommendation: selectedIndividualObjective.aiEvaluation.explanation,
          managerSignature: individualSignature,
          submissionNotes: individualNotes || `Individual submission for ${selectedIndividualObjective.title}`
        })
      });

      const data = await response.json();
      if (data.success) {
        alert(`✅ Successfully submitted "${selectedIndividualObjective.title}" to HR!\n\nSubmission ID: ${data.submissionId}`);
        
        // Remove the submitted objective from the list
        setObjectives(prev => prev.filter(obj => obj.id !== selectedIndividualObjective.id));
        
        // Clear form data for submitted objective
        delete overrideScores[selectedIndividualObjective.id];
        delete justifications[selectedIndividualObjective.id];
        delete managerComments[selectedIndividualObjective.id];
        
        // Reset individual modal state
        setShowIndividualModal(false);
        setSelectedIndividualObjective(null);
        setIndividualSignature('');
        setIndividualNotes('');
      } else {
        alert(data.error || 'Failed to submit to HR');
      }
    } catch (error) {
      console.error('Error submitting individual objective to HR:', error);
      alert('Error submitting to HR. Please try again.');
    } finally {
      setIsIndividualSubmitting(false);
    }
  };

  const openIndividualSubmissionModal = (objective: AIScoreObjective) => {
    setSelectedIndividualObjective(objective);
    setShowIndividualModal(true);
  };

  if (loading) {
    return <LoadingSpinner message="Loading AI-scored objectives..." />;
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
                  Review & Approval
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Review AI-scored objectives, override scores if needed, and submit to HR
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <DocumentCheckIcon className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">AI-Scored Objectives</p>
                <p className="text-2xl font-bold text-gray-900">{objectives.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <PencilSquareIcon className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Score Overrides</p>
                <p className="text-2xl font-bold text-gray-900">{Object.keys(overrideScores).length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Selected for Submission</p>
                <p className="text-2xl font-bold text-gray-900">{selectedObjectives.size}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <UserIcon className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Team Members</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(objectives.map(obj => obj.user.id)).size}
                </p>
              </div>
            </div>
          </div>
        </div>

          {/* Bulk Actions */}
          {selectedObjectives.size > 0 && (
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Batch Submission</h3>
                <p className="text-sm text-gray-500">
                  Submit {selectedObjectives.size} selected objectives to HR as a batch with digital signature
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  💡 Tip: You can also submit objectives individually using the "Submit to HR" button on each objective
                </p>
              </div>
              <button
                onClick={() => setShowSubmissionModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <DocumentCheckIcon className="h-4 w-4" />
                <span>Batch Submit ({selectedObjectives.size})</span>
              </button>
            </div>
          </div>
        )}

          {/* Objectives List */}
          <div className="space-y-6">
          {objectives.length > 0 ? (
            objectives.map((objective) => (
              <div key={objective.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                {/* Header with Selection */}
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
                      
                      {/* Employee Info */}
                      <div className="flex items-center space-x-4 mt-3">
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
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">{objective.quarter} {objective.year}</span>
                      </div>

                      {/* Progress Details */}
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
                          <p className="text-sm font-semibold text-gray-900">{objective.aiEvaluation.completionRate}%</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500">Weight</p>
                          <p className="text-sm font-semibold text-gray-900">{objective.weight < 1 ? Math.round(objective.weight * 100) : objective.weight}%</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Score Display */}
                  <div className="text-right min-w-[200px]">
                    {/* AI Score */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                      <div className="flex items-center space-x-2 mb-1">
                        <SparklesIcon className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-600">AI Score</span>
                      </div>
                      <p className="text-xl font-bold text-blue-700">
                        {objective.aiEvaluation.score < 1 ? Math.round(objective.aiEvaluation.score * 100) : objective.aiEvaluation.score}%
                      </p>
                      <p className="text-xs text-blue-600">/ {objective.weight < 1 ? Math.round(objective.weight * 100) : objective.weight}%</p>
                    </div>

                    {/* Override Score */}
                    {overrideScores[objective.id] !== undefined && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-2">
                        <div className="flex items-center space-x-2 mb-1">
                          <PencilSquareIcon className="h-4 w-4 text-orange-600" />
                          <span className="text-sm font-medium text-orange-600">Override</span>
                        </div>
                        <p className="text-xl font-bold text-orange-700">{overrideScores[objective.id]}%</p>
                        <p className="text-xs text-orange-600">/ {objective.weight < 1 ? Math.round(objective.weight * 100) : objective.weight}%</p>
                      </div>
                    )}

                    {/* Final Score */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <CheckCircleIcon className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">Final Score</span>
                      </div>
                      <p className="text-xl font-bold text-green-700">
                        {getFinalScore(objective) < 1 ? Math.round(getFinalScore(objective) * 100) : getFinalScore(objective)}%
                      </p>
                      <p className="text-xs text-green-600">/ {objective.weight < 1 ? Math.round(objective.weight * 100) : objective.weight}%</p>
                    </div>
                  </div>
                </div>

                {/* Employee Remarks */}
                <div className="mb-4">
                  <h5 className="font-medium text-gray-900 mb-2">Employee Remarks:</h5>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded">{objective.employeeRemarks}</p>
                </div>

                {/* AI Feedback */}
                <div className="mb-4">
                  <h5 className="font-medium text-gray-900 mb-2">AI Analysis:</h5>
                  <p className="text-gray-700 bg-blue-50 p-3 rounded border border-blue-200">{objective.aiEvaluation.explanation}</p>
                </div>

                {/* Manager Review Section */}
                <div className="border-t border-gray-200 pt-4">
                  <h5 className="font-medium text-gray-900 mb-4">Manager Review</h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Score Override */}
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004E9E]"
                        placeholder={`AI Score: ${objective.aiEvaluation.score}`}
                      />
                    </div>

                    {/* Justification */}
                    {overrideScores[objective.id] !== undefined && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Justification (Required for overrides)
                        </label>
                        <textarea
                          value={justifications[objective.id] || ""}
                          onChange={(e) => handleJustification(objective.id, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004E9E]"
                          rows={3}
                          placeholder="Explain why you're overriding the AI score..."
                        />
                      </div>
                    )}
                  </div>

                  {/* Manager Comments */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Manager Comments (Required)
                    </label>
                    <textarea
                      value={managerComments[objective.id] || ""}
                      onChange={(e) => handleManagerComments(objective.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004E9E]"
                      rows={3}
                      placeholder="Add your manager review comments..."
                      required
                    />
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {canSubmitObjective(objective) ? (
                        <>
                          <CheckCircleIcon className="h-5 w-5 text-green-500" />
                          <span className="text-sm text-green-700">Ready for submission</span>
                        </>
                      ) : (
                        <>
                          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                          <span className="text-sm text-yellow-700">
                            {!managerComments[objective.id]?.trim() && "Manager comments required"}
                            {overrideScores[objective.id] !== undefined && !justifications[objective.id]?.trim() && " • Justification required"}
                          </span>
                        </>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-500">
                        AI Score: {objective.aiEvaluation.score < 1 ? Math.round(objective.aiEvaluation.score * 100) : objective.aiEvaluation.score}% → Final: {getFinalScore(objective) < 1 ? Math.round(getFinalScore(objective) * 100) : getFinalScore(objective)}%
                      </div>
                      
                      {/* Individual Submit Button */}
                      {canSubmitObjective(objective) && (
                        <button
                          onClick={() => openIndividualSubmissionModal(objective)}
                          className="px-3 py-1.5 bg-[#004E9E] text-white text-sm rounded-md hover:bg-[#003875] flex items-center space-x-1"
                        >
                          <DocumentCheckIcon className="h-4 w-4" />
                          <span>Submit to HR</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
              <div className="text-center">
                <DocumentCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No AI-scored objectives</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No objectives are currently ready for manager review. 
                  Visit the AI Scoring page to generate scores for completed objectives.
                </p>
                <div className="mt-6">
                  <a 
                    href="/manager/objectives" 
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#004E9E] hover:bg-[#003875]"
                  >
                    Go to AI Scoring
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

          {/* Submission Modal */}
          {showSubmissionModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Submit to HR - Digital Signature Required</h3>
                
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Submission Summary</h4>
                    <p className="text-sm text-blue-700">
                      You are about to submit {selectedObjectives.size} objective reviews to HR for final approval.
                    </p>
                    <ul className="text-sm text-blue-700 mt-2 space-y-1 max-h-32 overflow-y-auto">
                      {objectives.filter(obj => selectedObjectives.has(obj.id)).map(obj => (
                        <li key={obj.id}>• {obj.user.name}: {obj.title} (Score: {getFinalScore(obj)})</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Digital Signature * <span className="text-red-500">(Type your full name)</span>
                    </label>
                    <input
                      type="text"
                      value={digitalSignature}
                      onChange={(e) => setDigitalSignature(e.target.value)}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-[#004E9E] focus:border-[#004E9E]"
                      placeholder="Type your full name as digital signature"
                      required
                    />
                  </div>
                  
                  <div className="flex space-x-2 pt-4">
                    <button
                      onClick={() => setShowSubmissionModal(false)}
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={submitSelectedObjectives}
                      disabled={isSubmitting || !digitalSignature.trim()}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <DocumentCheckIcon className="h-4 w-4" />
                          <span>Submit to HR</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

          {/* Individual Submission Modal */}
          {showIndividualModal && selectedIndividualObjective && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Submit Individual Objective to HR</h3>
                
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Individual Submission Details</h4>
                    <div className="space-y-2">
                      <p className="text-sm text-blue-700">
                        <strong>Employee:</strong> {selectedIndividualObjective.user.name}
                      </p>
                      <p className="text-sm text-blue-700">
                        <strong>Objective:</strong> {selectedIndividualObjective.title}
                      </p>
                      <p className="text-sm text-blue-700">
                        <strong>Final Score:</strong> {getFinalScore(selectedIndividualObjective) < 1 ? Math.round(getFinalScore(selectedIndividualObjective) * 100) : getFinalScore(selectedIndividualObjective)}% / {selectedIndividualObjective.weight < 1 ? Math.round(selectedIndividualObjective.weight * 100) : selectedIndividualObjective.weight}%
                      </p>
                      <p className="text-sm text-blue-700">
                        <strong>AI Score:</strong> {selectedIndividualObjective.aiEvaluation.score < 1 ? Math.round(selectedIndividualObjective.aiEvaluation.score * 100) : selectedIndividualObjective.aiEvaluation.score}% → 
                        <strong> Manager Score:</strong> {getFinalScore(selectedIndividualObjective) < 1 ? Math.round(getFinalScore(selectedIndividualObjective) * 100) : getFinalScore(selectedIndividualObjective)}%
                        {overrideScores[selectedIndividualObjective.id] !== undefined && (
                          <span className="text-orange-600"> (Override Applied)</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Submission Notes (Optional)
                    </label>
                    <textarea
                      value={individualNotes}
                      onChange={(e) => setIndividualNotes(e.target.value)}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-[#004E9E] focus:border-[#004E9E]"
                      rows={3}
                      placeholder="Add any additional notes for HR review..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Digital Signature * <span className="text-red-500">(Type your full name)</span>
                    </label>
                    <input
                      type="text"
                      value={individualSignature}
                      onChange={(e) => setIndividualSignature(e.target.value)}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-[#004E9E] focus:border-[#004E9E]"
                      placeholder="Type your full name as digital signature"
                      required
                    />
                  </div>
                  
                  <div className="flex space-x-2 pt-4">
                    <button
                      onClick={() => {
                        setShowIndividualModal(false);
                        setSelectedIndividualObjective(null);
                        setIndividualSignature('');
                        setIndividualNotes('');
                      }}
                      disabled={isIndividualSubmitting}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={submitIndividualObjective}
                      disabled={isIndividualSubmitting || !individualSignature.trim()}
                      className="flex-1 px-4 py-2 bg-[#004E9E] text-white rounded-md hover:bg-[#003875] disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      {isIndividualSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <DocumentCheckIcon className="h-4 w-4" />
                          <span>Submit to HR</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        )}
        </div>
    </div>
  );
}
