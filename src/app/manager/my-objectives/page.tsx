"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { 
  ClipboardDocumentListIcon,
  CalendarIcon,
  FlagIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  PencilIcon,
  UserIcon,
  DocumentTextIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface User {
  id: string;
  employeeId: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  role: string;
  title: string;
  department?: string;
}

interface Objective {
  id: string;
  title: string;
  description: string;
  category: string;
  target: number;
  current: number;
  weight: number;
  status: string;
  dueDate: string;
  quarter: string;
  year: number;
  assignedBy?: {
    name: string;
    title: string;
  };
  progress: number;
  employeeRemarks?: string;
  digitalSignature?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function ManagerMyObjectives() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth(true, ['MANAGER']);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedObjective, setSelectedObjective] = useState<Objective | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [currentProgress, setCurrentProgress] = useState<number>(0);
  const [employeeRemarks, setEmployeeRemarks] = useState<string>('');
  const [digitalSignature, setDigitalSignature] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'all'>('active');
  const router = useRouter();

  useEffect(() => {
    if (user && isAuthenticated) {
      loadManagerObjectives(user.id);
    }
  }, [user, isAuthenticated]);

  const loadManagerObjectives = async (managerId: string) => {
    setLoading(true);
    try {
      // API call to fetch manager's objectives assigned by senior management
      const response = await fetch(`/api/manager/objectives?managerId=${managerId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch objectives');
      }

      const data = await response.json();
      setObjectives(data.objectives || []);
    } catch (error) {
      console.error('Error loading manager objectives:', error);
      setObjectives([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'IN_PROGRESS':
      case 'ACTIVE':
        return <ClockIcon className="w-5 h-5 text-blue-500" />;
      case 'OVERDUE':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ClipboardDocumentListIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
      case 'ACTIVE':
        return 'bg-blue-100 text-blue-800';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'leadership':
        return 'bg-purple-100 text-purple-800';
      case 'strategic':
        return 'bg-indigo-100 text-indigo-800';
      case 'operational':
        return 'bg-orange-100 text-orange-800';
      case 'collaboration':
        return 'bg-green-100 text-green-800';
      case 'financial':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleUpdateProgress = async () => {
    if (!selectedObjective) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/manager/objectives`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          objectiveId: selectedObjective.id,
          current: currentProgress,
          remarks: employeeRemarks,
          managerId: user?.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update progress');
      }

      const updatedObjective = await response.json();
      
      // Update local state
      setObjectives(prev => prev.map(obj => 
        obj.id === selectedObjective.id 
          ? { ...obj, ...updatedObjective }
          : obj
      ));

      alert('✅ Progress updated successfully!');
      setShowUpdateModal(false);
      resetModalStates();
    } catch (error) {
      console.error('Error updating progress:', error);
      alert('❌ Failed to update progress. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!selectedObjective) return;

    if (!employeeRemarks.trim() || !digitalSignature.trim()) {
      alert('❌ Please fill in all required fields before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/manager/objectives/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          objectiveId: selectedObjective.id,
          finalCurrent: currentProgress,
          managerRemarks: employeeRemarks,
          digitalSignature: digitalSignature,
          managerId: user?.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit objective');
      }

      const updatedObjective = await response.json();
      
      // Update local state
      setObjectives(prev => prev.map(obj => 
        obj.id === selectedObjective.id 
          ? { ...obj, ...updatedObjective }
          : obj
      ));

      alert('✅ Objective submitted for review successfully!');
      setShowSubmitModal(false);
      resetModalStates();
    } catch (error) {
      console.error('Error submitting objective:', error);
      alert('❌ Failed to submit objective. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetModalStates = () => {
    setSelectedObjective(null);
    setCurrentProgress(0);
    setEmployeeRemarks('');
    setDigitalSignature('');
  };

  const handleViewDetails = (objective: Objective, action: 'update' | 'submit') => {
    setSelectedObjective(objective);
    setCurrentProgress(objective.current);
    setEmployeeRemarks(objective.employeeRemarks || '');
    setDigitalSignature(objective.digitalSignature || '');
    
    if (action === 'update') {
      setShowUpdateModal(true);
    } else {
      setShowSubmitModal(true);
    }
  };

  const filteredObjectives = objectives.filter(obj => {
    if (activeTab === 'active') {
      // Active tab: objectives that can be worked on (assigned or in progress)
      return obj.status === 'ASSIGNED' || obj.status === 'IN_PROGRESS';
    }
    if (activeTab === 'completed') {
      // Completed tab: objectives that have been submitted or approved (no longer editable)
      return obj.status === 'COMPLETED' || obj.status === 'MANAGER_SUBMITTED' || 
             obj.status === 'PENDING_SENIOR_REVIEW' || obj.status === 'SENIOR_APPROVED' || 
             obj.status === 'SUBMITTED_TO_HR' || obj.status === 'HR_APPROVED';
    }
    // All tab: return all objectives
    return true;
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004E9E]"></div>
      </div>
    );
  }

  if (!user || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to continue</p>
        </div>
      </div>
    );
  }

  const totalObjectives = objectives.length;
  const completedObjectives = objectives.filter(obj => obj.status === 'COMPLETED').length;
  const activeObjectives = objectives.filter(obj => obj.status === 'ACTIVE' || obj.status === 'IN_PROGRESS').length;
  
  // Debug logging for percentage calculation
  console.log('🔍 Manager Objectives Debug:', objectives.map(obj => ({
    id: obj.id,
    current: obj.current,
    target: obj.target,
    weight: obj.weight,
    progress: (obj.current / obj.target) * 100
  })));
  
  const averageProgress = objectives.length > 0 
    ? objectives.reduce((sum, obj) => {
        const progress = (obj.current / obj.target) * 100;
        console.log(`📊 Objective ${obj.id}: ${obj.current}/${obj.target} = ${progress}%`);
        return sum + progress;
      }, 0) / objectives.length 
    : 0;
    
  console.log(`📈 Average Progress: ${averageProgress}%`);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Unified Header Section */}
      <div className="bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col py-6">
            <h1 className="text-3xl font-bold text-[#333333] mb-1">My Strategic Objectives</h1>
            <p className="text-gray-500 text-base max-w-2xl">Strategic objectives assigned to me by senior management</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Content */}
        <div className="mb-8">

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Objectives</p>
                  <p className="text-2xl font-bold text-gray-900">{totalObjectives}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{completedObjectives}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-blue-600">{activeObjectives}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <ClockIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Progress</p>
                  <p className="text-2xl font-bold text-[#004E9E]">{Math.round(averageProgress)}%</p>
                </div>
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <ArrowPathIcon className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('active')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'active'
                    ? 'border-[#004E9E] text-[#004E9E]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Active ({activeObjectives})
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'completed'
                    ? 'border-[#004E9E] text-[#004E9E]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Completed ({completedObjectives})
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'all'
                    ? 'border-[#004E9E] text-[#004E9E]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All ({totalObjectives})
              </button>
            </nav>
          </div>
        </div>

        {/* Objectives List */}
        <div className="space-y-6">
          {filteredObjectives.map((objective) => {
            const progress = objective.target > 0 ? (objective.current / objective.target) * 100 : 0;
            const isOverdue = new Date(objective.dueDate) < new Date() && objective.status !== 'COMPLETED';
            
            return (
              <div key={objective.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{objective.title}</h3>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(objective.category)}`}>
                        {objective.category}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(isOverdue ? 'OVERDUE' : objective.status)}`}>
                        {getStatusIcon(isOverdue ? 'OVERDUE' : objective.status)}
                        <span className="ml-1">
                          {isOverdue ? 'OVERDUE' : objective.status.replace('_', ' ')}
                        </span>
                      </span>
                    </div>
                    
                    {/* Assigned By */}
                    {objective.assignedBy && (
                      <div className="flex items-center space-x-2 mb-3">
                        <UserIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Assigned by <span className="font-medium">{objective.assignedBy.name}</span> ({objective.assignedBy.title})
                        </span>
                      </div>
                    )}
                    
                    <p className="text-gray-700 mb-4">{objective.description}</p>
                  </div>
                </div>

                {/* Progress Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-lg font-bold text-[#004E9E]">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          progress >= 100 
                            ? 'bg-gradient-to-r from-green-500 to-green-600' 
                            : progress >= 75
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                            : progress >= 50
                            ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                            : 'bg-gradient-to-r from-red-500 to-red-600'
                        }`}
                        style={{ width: `${Math.min(100, progress)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Current: {objective.current}</span>
                      <span>Target: {objective.target}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CalendarIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Due Date</span>
                    </div>
                    <p className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                      {new Date(objective.dueDate).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{objective.quarter} {objective.year}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <FlagIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Weight</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{Math.round(objective.weight * 100)}%</p>
                    <p className="text-xs text-gray-500">of total score</p>
                  </div>
                </div>

                {/* Employee Remarks */}
                {objective.employeeRemarks && (
                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">My Latest Notes</h4>
                    <p className="text-sm text-gray-600">{objective.employeeRemarks}</p>
                  </div>
                )}

                {/* Digital Signature */}
                {objective.digitalSignature && (
                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <DocumentTextIcon className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-700 font-medium">Digitally Signed: {objective.digitalSignature}</span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-3">
                  {(objective.status === 'ASSIGNED' || objective.status === 'IN_PROGRESS') && activeTab !== 'all' && (
                    <>
                      <button
                        onClick={() => handleViewDetails(objective, 'update')}
                        className="px-4 py-2 text-sm font-medium text-[#004E9E] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center space-x-2"
                      >
                        <PencilIcon className="h-4 w-4" />
                        <span>Update Progress</span>
                      </button>
                      <button
                        onClick={() => handleViewDetails(objective, 'submit')}
                        className="px-4 py-2 text-sm font-medium text-white bg-[#004E9E] rounded-lg hover:bg-[#003D7C] transition-colors flex items-center space-x-2"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                        <span>Submit for Review</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredObjectives.length === 0 && (
          <div className="text-center py-12">
            <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No {activeTab === 'all' ? '' : activeTab} objectives found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {activeTab === 'active' 
                ? "You don't have any active strategic objectives at the moment."
                : activeTab === 'completed'
                ? "You haven't completed any strategic objectives yet."
                : "No strategic objectives have been assigned to you by senior management."
              }
            </p>
          </div>
        )}
      </div>

      {/* Update Progress Modal */}
      {showUpdateModal && selectedObjective && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border max-w-2xl shadow-lg rounded-lg bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Update Progress</h3>
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">{selectedObjective.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{selectedObjective.description}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target</label>
                    <p className="text-lg font-semibold text-gray-900">{selectedObjective.target}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Progress *</label>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => {
                          const newCurrent = Math.max(0, currentProgress - 1);
                          setCurrentProgress(newCurrent);
                        }}
                        disabled={currentProgress <= 0}
                        className="w-10 h-10 rounded-lg bg-red-100 hover:bg-red-200 disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                      >
                        <span className="text-red-600 font-bold text-lg">−</span>
                      </button>
                      
                      <div className="flex-1 relative">
                        <input
                          type="number"
                          min={0}
                          max={selectedObjective.target}
                          value={currentProgress}
                          onChange={(e) => {
                            let newCurrent = parseInt(e.target.value) || 0;
                            if (newCurrent < 0) newCurrent = 0;
                            if (newCurrent > selectedObjective.target) newCurrent = selectedObjective.target;
                            setCurrentProgress(newCurrent);
                          }}
                          className="w-full text-center text-lg font-semibold rounded-lg border-gray-300 shadow-sm focus:border-[#004E9E] focus:ring-[#004E9E] focus:ring-1 transition-colors py-2"
                        />
                      </div>
                      
                      <button
                        onClick={() => {
                          const newCurrent = Math.min(selectedObjective.target, currentProgress + 1);
                          setCurrentProgress(newCurrent);
                        }}
                        disabled={currentProgress >= selectedObjective.target}
                        className="w-10 h-10 rounded-lg bg-green-100 hover:bg-green-200 disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                      >
                        <span className="text-green-600 font-bold text-lg">+</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowUpdateModal(false)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateProgress}
                    disabled={isUpdating}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#004E9E] rounded-lg hover:bg-[#003D7C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? 'Updating...' : 'Update Progress'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit for Review Modal */}
      {showSubmitModal && selectedObjective && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border max-w-2xl shadow-lg rounded-lg bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Submit Objective for Review</h3>
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Important</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>Once submitted, this objective will be sent to senior management for review and scoring. Make sure all information is complete and accurate.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">{selectedObjective.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{selectedObjective.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Target</label>
                    <p className="text-lg font-semibold text-gray-900">{selectedObjective.target}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Final Achievement *</label>
                    <input
                      type="number"
                      value={currentProgress}
                      onChange={(e) => setCurrentProgress(Number(e.target.value))}
                      max={selectedObjective.target * 1.5}
                      min={0}
                      step="0.1"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#004E9E] focus:border-[#004E9E]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Final Summary & Achievements *</label>
                  <textarea
                    value={employeeRemarks}
                    onChange={(e) => setEmployeeRemarks(e.target.value)}
                    rows={4}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#004E9E] focus:border-[#004E9E]"
                    placeholder="Provide a comprehensive summary of your achievements, challenges overcome, impact created, and key learnings..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Digital Signature *</label>
                  <input
                    type="text"
                    value={digitalSignature}
                    onChange={(e) => setDigitalSignature(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#004E9E] focus:border-[#004E9E]"
                    placeholder={`${user?.firstName} ${user?.lastName} - ${new Date().toLocaleDateString()}`}
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">Type your full name and today's date to digitally sign this submission</p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowSubmitModal(false)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitForReview}
                    disabled={isSubmitting || !employeeRemarks.trim() || !digitalSignature.trim()}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit for Review'}
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