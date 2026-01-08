"use client";

import { useState, useEffect } from "react";
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  ScaleIcon,
  EyeIcon,
  XMarkIcon,
  InformationCircleIcon,
  FlagIcon,
  ChartBarIcon,
  CalendarIcon,
  UserIcon
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
  createdAt: string;
  updatedAt: string;
  category?: string;
  employeeRemarks?: string;
  managerFeedback?: string;
  isQuantitative?: boolean;
  objectiveType?: string;
  assignedBy?: {
    id: string;
    name: string;
    email: string;
    title: string;
  };
  quantitativeData?: {
    id: string;
    totalTargetRevenue: number;
    totalAchievedRevenue: number;
    practiceRevenues: Array<{
      id: string;
      practiceName: string;
      targetRevenue: number;
      achievedRevenue: number;
      weight: number;
    }>;
  };
  reviews: any[];
}

export default function EmployeeObjectivesPage() {
  console.log('🚀 EmployeeObjectivesPage component mounting...');
  
  const { user, isLoading: authLoading } = useAuth(true, ['EMPLOYEE', 'MANAGER', 'SENIOR_MANAGEMENT', 'employee', 'manager', 'senior-management']);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedObjective, setSelectedObjective] = useState<Objective | null>(null);
  const [editingObjective, setEditingObjective] = useState<string | null>(null);
  const [updateNotes, setUpdateNotes] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitObjectiveId, setSubmitObjectiveId] = useState<string | null>(null);
  const [finalComments, setFinalComments] = useState('');
  const [digitalSignature, setDigitalSignature] = useState('');

  // Helper functions
  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const loadObjectives = async () => {
    try {
      console.log('📥 Loading objectives for user:', user?.id);
      setLoading(true);
      
      const response = await fetch(`/api/employee/objectives?userId=${user?.id}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📋 Objectives loaded:', data);
        
        if (data.objectives) {
          setObjectives(data.objectives);
          console.log(`✅ Found ${data.objectives.length} objectives`);
        } else {
          console.warn('⚠️ No objectives in response');
          setObjectives([]);
        }
      } else {
        const data = await response.json();
        console.error('Failed to load objectives:', data.error || data.details || 'Unknown error');
        setObjectives([]);
      }
    } catch (error) {
      console.error('Error loading objectives:', error);
      setObjectives([]);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (objective: Objective) => {
    setEditingObjective(objective.id);
    setUpdateNotes('');
  };

  const handleUpdate = async (objectiveId: string) => {
    try {
      const objective = objectives.find(obj => obj.id === objectiveId);
      if (!objective) return;

      const response = await fetch('/api/employee/update-objective', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objectiveId,
          current: objective.current,
          notes: updateNotes
        })
      });

      if (response.ok) {
        await loadObjectives();
        setEditingObjective(null);
        setUpdateNotes('');
      }
    } catch (error) {
      console.error('Error updating objective:', error);
    }
  };

  const handleSubmitForReview = async () => {
    if (!submitObjectiveId) return;

    try {
      const response = await fetch('/api/employee/submit-for-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objectiveId: submitObjectiveId,
          employeeRemarks: finalComments,
          digitalSignature: digitalSignature
        })
      });

      if (response.ok) {
        console.log('✅ Objective submitted for review successfully');
        await loadObjectives();
        setShowSubmitModal(false);
        setSubmitObjectiveId(null);
        setFinalComments('');
        setDigitalSignature('');
      } else {
        const errorData = await response.json();
        console.error('Failed to submit objective for review:', errorData);
        alert(`Failed to submit: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error submitting objective for review:', error);
    }
  };

  const openSubmitModal = (objectiveId: string) => {
    setSubmitObjectiveId(objectiveId);
    setShowSubmitModal(true);
  };

  // Effects
  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    loadObjectives();
  }, [authLoading, user]);

  if (authLoading || loading) {
    return <LoadingSpinner message="Loading your objectives..." />;
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

  // Filter objectives
  const pendingObjectives = objectives.filter(obj => 
    obj.status === 'ASSIGNED' || obj.status === 'ACTIVE' || obj.status === 'IN_PROGRESS'
  );
  const overdueObjectives = objectives.filter(obj => 
    isOverdue(obj.dueDate) && (obj.status === 'ASSIGNED' || obj.status === 'ACTIVE' || obj.status === 'IN_PROGRESS')
  );
  const activeObjectives = pendingObjectives;
  const completedObjectives = objectives.filter(obj => 
    obj.status === 'COMPLETED' || obj.status === 'BONUS_APPROVED'
  );
  const totalCount = objectives.length;

  return (
  <div className="min-h-screen bg-gray-50">
      {/* Unified Header Section */}
      <div className="bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col py-6">
            <h1 className="text-3xl font-bold text-[#333333] mb-1">My Objectives</h1>
            <p className="text-gray-500 text-base max-w-2xl">Track your progress and update your objective achievements for each quarter.</p>
          </div>
        </div>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 rounded-xl border border-gray-100">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <ScaleIcon className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate"> Total Objectives</dt>
                    <dd className="text-2xl font-bold text-gray-900">{totalCount}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 rounded-xl border border-gray-100">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <ClockIcon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate"> Active</dt>
                    <dd className="text-2xl font-bold text-blue-600">{activeObjectives.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 rounded-xl border border-gray-100">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate"> Completed</dt>
                    <dd className="text-2xl font-bold text-green-600">{completedObjectives.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 rounded-xl border border-gray-100">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate"> Overdue</dt>
                    <dd className="text-2xl font-bold text-red-600">{overdueObjectives.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Objectives List Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                <span></span>
                <span>Current Objectives</span>
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Track your progress and update your achievements
              </p>
            </div>
            {activeObjectives.length > 0 && (
              <div className="text-sm text-gray-500">
                {activeObjectives.length} active objective{activeObjectives.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
          {activeObjectives.length > 0 ? (
            activeObjectives.map((objective) => (
              <div key={objective.id} className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200 rounded-xl mb-6 border border-gray-100">
                <div className="px-6 py-5">
                  {/* Header Section */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{objective.title}</h3>
                        {(objective.isQuantitative || objective.objectiveType === 'quantitative') && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Quantitative - Revenue
                          </span>
                        )}
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          objective.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          objective.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                          objective.status === 'ASSIGNED' ? 'bg-gray-100 text-gray-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {objective.status === 'ASSIGNED' ? 'Assigned' :
                           objective.status === 'IN_PROGRESS' ? 'In Progress' :
                           objective.status === 'COMPLETED' ? 'Completed' : objective.status.replace('_', ' ')}
                        </span>
                        {isOverdue(objective.dueDate) && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Overdue
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{objective.description}</p>
                      
                      {/* Metadata Section */}
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <span className="text-xs text-gray-500">Due Date</span>
                          <p className="font-medium text-gray-900">{new Date(objective.dueDate).toLocaleDateString()}</p>
                          <p className="text-xs text-gray-500">{objective.quarter} {objective.year}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <span className="text-xs text-gray-500">Weight</span>
                          <p className="font-medium text-gray-900">{Math.round(objective.weight * 100)}%</p>
                          <p className="text-xs text-gray-500">of total score</p>
                        </div>
                        {objective.assignedBy && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <span className="text-xs text-gray-500">Assigned By</span>
                            <p className="font-medium text-gray-900">{objective.assignedBy.name}</p>
                            <p className="text-xs text-gray-500">{objective.assignedBy.title}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress Section */}
                  <div className="mb-4">
                    {!(objective.isQuantitative || objective.objectiveType === 'quantitative') ? (
                      <>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Progress</span>
                          <span className="text-sm font-semibold text-[#004E9E]">
                            {Math.min(Math.round(((objective.current || 0) / objective.target) * 100), 100)}%
                          </span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-3 relative overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-[#004E9E] to-[#007BFF] h-3 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(((objective.current || 0) / objective.target) * 100, 100)}%`
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                          <span>Current: <strong>{objective.current || 0}</strong></span>
                          <span>Target: <strong>{objective.target}</strong></span>
                        </div>
                      </>
                    ) : (
                      /* Quantitative Objective Layout - Revenue Focus */
                      <>
                        {/* Summary Stats for Quantitative */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center space-x-2 mb-2">
                              <FlagIcon className="h-4 w-4 text-gray-500" />
                              <span className="text-xs font-medium text-gray-600">Weight</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{Math.round(objective.weight * 100)}%</p>
                            <p className="text-xs text-gray-500">of total score</p>
                          </div>

                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-xs font-medium text-gray-600">Target Revenue</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">
                              ${objective.quantitativeData!.totalTargetRevenue.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">total goal</p>
                          </div>

                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-xs font-medium text-gray-600">Achieved</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">
                              ${objective.quantitativeData!.totalAchievedRevenue.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">current total</p>
                          </div>

                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-xs font-medium text-gray-600">Overall Progress</span>
                            </div>
                            <p className="text-2xl font-bold text-[#004E9E]">
                              {Math.min(Math.round(((objective.quantitativeData!.totalAchievedRevenue || 0) / objective.quantitativeData!.totalTargetRevenue) * 100), 100)}%
                            </p>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                              <div 
                                className="bg-[#004E9E] h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(((objective.quantitativeData!.totalAchievedRevenue || 0) / objective.quantitativeData!.totalTargetRevenue) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        {/* Practice Revenue Breakdown */}
                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                            <ChartBarIcon className="h-5 w-5 mr-2 text-gray-500" />
                            Practice Revenue Breakdown ({objective.quantitativeData!.practiceRevenues.length} Practices)
                          </h4>
                          <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                            <div className="grid grid-cols-12 gap-4 p-3 bg-gray-100 border-b border-gray-200 text-xs font-medium text-gray-600 uppercase">
                              <div className="col-span-2">Practice Name</div>
                              <div className="col-span-1 text-center">Weight</div>
                              <div className="col-span-2 text-right">Target</div>
                              <div className="col-span-2 text-right">Achieved</div>
                              <div className="col-span-2 text-right">Remaining</div>
                              <div className="col-span-3">Progress</div>
                            </div>
                            {objective.quantitativeData!.practiceRevenues.map((practice, index) => {
                              const remaining = practice.targetRevenue - practice.achievedRevenue;
                              return (
                                <div 
                                  key={practice.id} 
                                  className={`grid grid-cols-12 gap-4 p-3 items-center ${
                                    index !== objective.quantitativeData!.practiceRevenues.length - 1 
                                      ? 'border-b border-gray-200' 
                                      : ''
                                  } hover:bg-gray-100 transition-colors`}
                                >
                                  <div className="col-span-2">
                                    <span className="font-medium text-gray-900">{practice.practiceName}</span>
                                  </div>
                                  <div className="col-span-1 text-center">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                                      {Math.round(practice.weight)}%
                                    </span>
                                  </div>
                                  <div className="col-span-2 text-right">
                                    <span className="text-sm text-gray-700 font-medium">
                                      ${practice.targetRevenue.toLocaleString()}
                                    </span>
                                  </div>
                                  <div className="col-span-2 text-right">
                                    <span className="text-sm text-green-700 font-semibold">
                                      ${practice.achievedRevenue.toLocaleString()}
                                    </span>
                                  </div>
                                  <div className="col-span-2 text-right">
                                    <span className={`text-sm font-medium ${
                                      remaining > 0 ? 'text-orange-600' : 'text-green-600'
                                    }`}>
                                      ${Math.abs(remaining).toLocaleString()}
                                    </span>
                                  </div>
                                  <div className="col-span-3">
                                    <div className="flex items-center space-x-2">
                                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                                        <div 
                                          className="h-2 rounded-full transition-all duration-300 bg-[#004E9E]"
                                          style={{ width: `${Math.min(100, ((practice.achievedRevenue || 0) / practice.targetRevenue) * 100)}%` }}
                                        ></div>
                                      </div>
                                      <span className="text-xs font-semibold text-gray-700 min-w-[45px] text-right">
                                        {Math.min(Math.round(((practice.achievedRevenue || 0) / practice.targetRevenue) * 100), 100)}%
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Due Date for Quantitative */}
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-6 inline-block">
                          <div className="flex items-center space-x-3">
                            <CalendarIcon className="h-5 w-5 text-gray-500" />
                            <div>
                              <span className="text-xs text-gray-600">Due Date: </span>
                              <span className={`text-sm font-semibold ${
                                isOverdue(objective.dueDate) ? 'text-red-600' : 'text-gray-900'
                              }`}>
                                {new Date(objective.dueDate).toLocaleDateString()}
                              </span>
                              <span className="text-xs text-gray-500 ml-2">
                                ({objective.quarter} {objective.year})
                              </span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Manager Feedback Section */}
                  {objective.managerFeedback && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-red-900 mb-1">Manager Feedback</h4>
                          <p className="text-sm text-red-800">{objective.managerFeedback}</p>
                          {objective.managerFeedback.startsWith('REJECTED:') && (
                            <div className="mt-2 text-xs text-red-700">
                              ⚠️ This objective has been rejected. Please review the feedback and make necessary improvements before resubmitting.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Edit Form */}
                  {editingObjective === objective.id && (
                    <div className="mt-5 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                      <div className="flex items-center space-x-2 mb-4">
                        <PencilIcon className="h-5 w-5 text-[#004E9E]" />
                        <h4 className="text-lg font-medium text-gray-900">Update Progress</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <label className="block text-sm font-medium text-gray-700">
                             Current Progress
                          </label>
                          
                          {/* Professional Score Input with Buttons */}
                          <div className="bg-white rounded-lg border border-gray-300 p-4">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm text-gray-600">Current Value</span>
                              <span className="text-lg font-bold text-[#004E9E]">{objective.current || 0}</span>
                            </div>
                            
                            <div className="flex items-center space-x-2 mb-4">
                              <button
                                onClick={() => {
                                  const newCurrent = Math.max(0, (objective.current || 0) - 1);
                                  setObjectives(prev => prev.map(obj => 
                                    obj.id === objective.id ? { ...obj, current: newCurrent } : obj
                                  ));
                                }}
                                disabled={(objective.current || 0) <= 0}
                                className="w-10 h-10 rounded-lg bg-red-100 hover:bg-red-200 disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                              >
                                <span className="text-red-600 font-bold text-lg">−</span>
                              </button>
                              
                              <div className="flex-1 relative">
                                <input
                                  type="number"
                                  min={0}
                                  max={objective.target}
                                  value={objective.current || 0}
                                  onChange={(e) => {
                                    let newCurrent = parseInt(e.target.value) || 0;
                                    if (newCurrent < 0) newCurrent = 0;
                                    if (newCurrent > objective.target) newCurrent = objective.target;
                                    setObjectives(prev => prev.map(obj => 
                                      obj.id === objective.id ? { ...obj, current: newCurrent } : obj
                                    ));
                                  }}
                                  className="w-full text-center text-lg font-semibold rounded-lg border-gray-300 shadow-sm focus:border-[#004E9E] focus:ring-[#004E9E] focus:ring-1 transition-colors py-2"
                                />
                              </div>
                              
                              <button
                                onClick={() => {
                                  const newCurrent = Math.min(objective.target, (objective.current || 0) + 1);
                                  setObjectives(prev => prev.map(obj => 
                                    obj.id === objective.id ? { ...obj, current: newCurrent } : obj
                                  ));
                                }}
                                disabled={(objective.current || 0) >= objective.target}
                                className="w-10 h-10 rounded-lg bg-green-100 hover:bg-green-200 disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                              >
                                <span className="text-green-600 font-bold text-lg">+</span>
                              </button>
                            </div>
                            
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>Target: {objective.target}</span>
                              <span>Progress: {Math.round(((objective.current || 0) / objective.target) * 100)}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 flex justify-end space-x-3">
                        <button
                          onClick={() => {
                            setEditingObjective(null);
                            setUpdateNotes('');
                          }}
                          className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleUpdate(objective.id)}
                          className="px-5 py-2.5 bg-gradient-to-r from-[#004E9E] to-[#007BFF] text-white rounded-lg hover:shadow-lg transition-all font-medium flex items-center space-x-2"
                          disabled={objective.current < 0 || objective.current > objective.target}
                        >
                          <span></span>
                          <span>Save Update</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Action Buttons */}
                  <div className="mt-5 flex justify-end space-x-3">
                    {objective.status !== 'COMPLETED' && editingObjective !== objective.id && (
                      <>
                        {/* Only show Update Progress button for qualitative objectives */}
                        {!(objective.isQuantitative || objective.objectiveType === 'quantitative') && (
                          <button
                            onClick={() => startEditing(objective)}
                            className="px-4 py-2.5 bg-gradient-to-r from-[#004E9E] to-[#007BFF] text-white rounded-lg hover:shadow-lg transition-all font-medium flex items-center space-x-2"
                          >
                            <PencilIcon className="h-4 w-4" />
                            <span>Update Progress</span>
                          </button>
                        )}
                        
                        <button
                          onClick={() => openSubmitModal(objective.id)}
                          className="px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:shadow-lg transition-all font-medium flex items-center space-x-2"
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                          <span>Submit for Review</span>
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setSelectedObjective(objective)}
                      className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all font-medium flex items-center space-x-2"
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
                <ScaleIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No objectives assigned</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No objectives have been assigned to you yet. Contact your manager for objective assignment.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 border w-11/12 md:w-1/2 max-w-2xl shadow-xl rounded-xl bg-white">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Submit Objective for Review</h3>
                  <p className="text-sm text-gray-500 mt-1">Complete your objective submission with final details</p>
                </div>
              </div>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <span>ℹ</span>
                  <span className="text-sm font-medium text-blue-900">Submission Guidelines</span>
                </div>
                <p className="text-sm text-blue-700">
                  Please provide detailed final comments and your digital signature to complete the submission process.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Final Comments *
                </label>
                <div className="relative">
                  <textarea
                    value={finalComments}
                    onChange={(e) => setFinalComments(e.target.value)}
                    placeholder="Describe your accomplishments, challenges overcome, and key outcomes achieved..."
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#004E9E] focus:ring-[#004E9E] focus:ring-2 transition-colors pr-10"
                    rows={5}
                  />
                  <button
                    type="button"
                    title="Voice input (Coming soon)"
                    className="absolute top-2 right-2 p-2 rounded-full bg-gray-200 text-gray-500 hover:bg-[#004E9E] hover:text-white transition-colors cursor-not-allowed"
                    disabled
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Provide detailed information to help your manager understand your achievements
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                   Digital Signature *
                </label>
                <input
                  type="text"
                  value={digitalSignature}
                  onChange={(e) => setDigitalSignature(e.target.value)}
                  placeholder="Type your full name as digital signature"
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#004E9E] focus:ring-[#004E9E] focus:ring-2 transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Your digital signature confirms the accuracy of your submission
                </p>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitForReview}
                disabled={!finalComments.trim() || !digitalSignature.trim()}
                className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center space-x-2"
              >
                <span></span>
                <span>Submit for Review</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedObjective && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Objective Details</h3>
              <button
                onClick={() => setSelectedObjective(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <p className="mt-1 text-sm text-gray-900">{selectedObjective.title}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{selectedObjective.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Target</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedObjective.target}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Progress</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedObjective.current || '0'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`mt-1 inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    selectedObjective.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    selectedObjective.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                    selectedObjective.status === 'ASSIGNED' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedObjective.status}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Due Date</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedObjective.dueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Progress</label>
                <div className="mt-1">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#004E9E] h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          ((Number(selectedObjective.current) || 0) / Number(selectedObjective.target)) * 100,
                          100
                        )}%`
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.min(
                      Math.round(((Number(selectedObjective.current) || 0) / Number(selectedObjective.target)) * 100),
                      100
                    )}% Complete
                  </p>
                </div>
              </div>
              
              {selectedObjective.employeeRemarks && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Your Remarks</label>
                  <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{selectedObjective.employeeRemarks}</p>
                </div>
              )}
              
              {selectedObjective.assignedBy && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Assigned By</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedObjective.assignedBy.name} ({selectedObjective.assignedBy.title})
                  </p>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedObjective(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}