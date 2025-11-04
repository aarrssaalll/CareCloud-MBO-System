"use client";

import { useState, useEffect } from "react";
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  ScaleIcon,
  SparklesIcon,
  EyeIcon,
  UserGroupIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline";
import { useAuth } from '@/hooks/useAuth';

interface Objective {
  id: string;
  title: string;
  description: string;
  category?: string;
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
  assignedBy?: {
    id: string;
    name: string;
    email: string;
    title: string;
  };
}

interface ManagerObjective {
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
  managerId: string;
  managerName: string;
  managerTitle: string;
  progress: number;
  completedAt?: string;
  managerRemarks?: string;
  managerEvidence?: string;
  aiScore?: number;
  aiComments?: string;
  seniorManagerScore?: number;
  seniorManagerComments?: string;
  finalScore?: number;
  createdAt: string;
  updatedAt: string;
}

export default function HRObjectivesPage() {
  const { user, isLoading: authLoading } = useAuth(true, ['HR', 'hr', 'SENIOR_MANAGEMENT', 'senior_management']);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [managerObjectives, setManagerObjectives] = useState<ManagerObjective[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewModeState] = useState<'employee' | 'manager'>('employee');
  const [loadingManagerObjectives, setLoadingManagerObjectives] = useState(false);

  // Wrapper function for setViewMode with debugging
  const setViewMode = (newMode: 'employee' | 'manager') => {
    console.log('🔄 Toggling view mode from', viewMode, 'to', newMode);
    setViewModeState(newMode);
  };

  useEffect(() => {
    console.log('Main useEffect triggered:', { authLoading, user: !!user, viewMode });
    
    if (authLoading) return;
    if (!user) return;
    
    // Load data based on current view mode
    if (viewMode === 'employee') {
      loadAllObjectives();
    } else if (viewMode === 'manager') {
      loadAllManagerObjectives();
    }
  }, [authLoading, user, viewMode]);

  const loadAllObjectives = async () => {
    console.log('🔄 Starting to load employee objectives...');
    setLoading(true);
    try {
      console.log('Loading all employee objectives for HR view:', user?.id);
      const response = await fetch(`/api/hr/all-objectives`);
      console.log('📡 Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('All employee objectives response:', data);
      
      if (data.success) {
        setObjectives(data.data || []); // Fixed: changed from data.objectives to data.data
        console.log(`✅ Found ${data.data?.length || 0} total employee objectives`);
      } else {
        console.error('❌ Failed to load objectives:', data.error);
        setObjectives([]);
      }
    } catch (error) {
      console.error('❌ Error loading employee objectives:', error);
      setObjectives([]);
    } finally {
      console.log('🏁 Finished loading employee objectives, setting loading to false');
      setLoading(false);
    }
  };

  const loadAllManagerObjectives = async () => {
    setLoadingManagerObjectives(true);
    try {
      console.log('Loading all manager objectives for HR dashboard');
      
      const response = await fetch('/api/hr/all-manager-objectives', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        }
      });

      console.log('Response status for manager objectives:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.text();
        console.log('Error response for manager objectives:', errorData);
        throw new Error(`Failed to fetch manager objectives: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Manager objectives data received:', data);
      
      if (data.success) {
        setManagerObjectives(data.objectives || []);
      } else {
        throw new Error(data.error || 'Failed to load manager objectives');
      }
    } catch (error) {
      console.error('Error loading manager objectives:', error);
      setManagerObjectives([]);
    } finally {
      setLoadingManagerObjectives(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'active':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'bonus_approved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'submitted_to_hr':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ai_scored':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCompletionPercentage = (objective: Objective | ManagerObjective) => {
    if (viewMode === 'manager' && 'progress' in objective) {
      return Math.round(objective.progress);
    }
    return Math.round((objective.current / objective.target) * 100);
  };

  const getStatusDisplayText = (status: string) => {
    switch (status) {
      case 'BONUS_APPROVED':
        return 'Bonus Approved';
      case 'SUBMITTED_TO_HR':
        return 'Submitted to HR';
      case 'AI_SCORED':
        return 'AI Scored';
      case 'IN_PROGRESS':
        return 'In Progress';
      default:
        return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  // Updated summary cards section
  const getSummaryData = () => {
    const data = viewMode === 'employee' ? objectives : managerObjectives;
    const isLoading = viewMode === 'employee' ? loading : loadingManagerObjectives;
    
    if (isLoading || data.length === 0) {
      return {
        total: 0,
        completed: 0,
        inProgress: 0,
        notStarted: 0,
        overdue: 0,
        completionRate: 0
      };
    }

    const total = data.length;
    const completed = data.filter(obj => obj.status === 'COMPLETED' || obj.status === 'MANAGER_SUBMITTED' || obj.status === 'BONUS_APPROVED').length;
    const inProgress = data.filter(obj => obj.status === 'ASSIGNED' || obj.status === 'ACTIVE' || obj.status === 'IN_PROGRESS').length;
    const notStarted = data.filter(obj => obj.status === 'NOT_STARTED').length;
    const overdue = data.filter(obj => {
      const dueDate = new Date(obj.dueDate);
      const today = new Date();
      return obj.status !== 'COMPLETED' && obj.status !== 'MANAGER_SUBMITTED' && obj.status !== 'BONUS_APPROVED' && dueDate < today;
    }).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      inProgress,
      notStarted,
      overdue,
      completionRate
    };
  };

  const summaryData = getSummaryData();

  // Updated render methods
  const renderToggleSwitch = () => (
    <div className="flex items-center space-x-4 mb-6">
      <span className="text-sm font-medium text-gray-700">View Mode:</span>
      <button
        onClick={() => setViewMode(viewMode === 'employee' ? 'manager' : 'employee')}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#004E9E] focus:ring-offset-2 cursor-pointer ${
          viewMode === 'manager' ? 'bg-[#004E9E]' : 'bg-gray-200'
        }`}
        role="switch"
        aria-checked={viewMode === 'manager'}
        aria-label="Toggle between Employee and Manager objectives"
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${
            viewMode === 'manager' ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      <div className="flex items-center space-x-6">
        <span className={`text-sm font-medium cursor-pointer ${viewMode === 'employee' ? 'text-[#004E9E]' : 'text-gray-500'}`}
          onClick={() => setViewMode('employee')}>
          Employee Objectives
        </span>
        <span className={`text-sm font-medium cursor-pointer ${viewMode === 'manager' ? 'text-[#004E9E]' : 'text-gray-500'}`}
          onClick={() => setViewMode('manager')}>
          Manager Objectives
        </span>
      </div>
    </div>
  );

  if (authLoading || (viewMode === 'employee' && loading) || (viewMode === 'manager' && loadingManagerObjectives)) {
    return <LoadingSpinner message="Loading objectives overview..." />;
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
                <h1 className="text-3xl font-bold text-gray-900">All Organization Objectives</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Complete overview of all {viewMode === 'manager' ? 'manager' : 'employee'} objectives across the organization
                </p>
              </div>
              
              {/* Toggle Switch */}
              {renderToggleSwitch()}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-200/50 overflow-hidden group">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-md group-hover:scale-110 transition-transform duration-300">
                      <UserGroupIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-900">Total Objectives</p>
                      <p className="text-xs text-blue-600">Organization wide</p>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-blue-900 mb-1">
                    {summaryData.total}
                  </p>
                  <p className="text-xs text-blue-700 font-medium">
                    All {viewMode === 'manager' ? 'manager' : 'employee'} objectives
                  </p>
                </div>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-orange-100 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-yellow-200/50 overflow-hidden group">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg shadow-md group-hover:scale-110 transition-transform duration-300">
                      <ClockIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-yellow-900">In Progress</p>
                      <p className="text-xs text-yellow-600">Active work</p>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-yellow-900 mb-1">
                    {summaryData.inProgress}
                  </p>
                  <p className="text-xs text-yellow-700 font-medium">Currently being worked on</p>
                </div>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-yellow-500 to-orange-600"></div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-green-200/50 overflow-hidden group">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-md group-hover:scale-110 transition-transform duration-300">
                      <CheckCircleIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-green-900">Completed</p>
                      <p className="text-xs text-green-600">Employee done</p>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-green-900 mb-1">
                    {summaryData.completed}
                  </p>
                  <p className="text-xs text-green-700 font-medium">
                    Completed by {viewMode === 'manager' ? 'managers' : 'employees'}
                  </p>
                </div>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-600"></div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-200/50 overflow-hidden group">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg shadow-md group-hover:scale-110 transition-transform duration-300">
                      <SparklesIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-purple-900">AI Scored</p>
                      <p className="text-xs text-purple-600">Manager reviewed</p>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-purple-900 mb-1">
                    {(viewMode === 'manager' ? managerObjectives : objectives).filter(obj => obj.status === 'AI_SCORED' || obj.status === 'SUBMITTED_TO_HR').length}
                  </p>
                  <p className="text-xs text-purple-700 font-medium">
                    Scored by {viewMode === 'manager' ? 'senior management' : 'managers'}
                  </p>
                </div>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-purple-500 to-indigo-600"></div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-teal-100 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-emerald-200/50 overflow-hidden group">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg shadow-md group-hover:scale-110 transition-transform duration-300">
                      <ChartBarIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-emerald-900">Bonus Approved</p>
                      <p className="text-xs text-emerald-600">HR approved</p>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-emerald-900 mb-1">
                    {objectives.filter(obj => obj.status === 'BONUS_APPROVED').length}
                  </p>
                  <p className="text-xs text-emerald-700 font-medium">Approved by HR</p>
                </div>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-600"></div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-rose-100 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-red-200/50 overflow-hidden group">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-3 bg-gradient-to-r from-red-500 to-rose-600 rounded-lg shadow-md group-hover:scale-110 transition-transform duration-300">
                      <ExclamationTriangleIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-red-900">Rejected</p>
                      <p className="text-xs text-red-600">Not approved</p>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-red-900 mb-1">
                    {objectives.filter(obj => obj.status === 'REJECTED').length}
                  </p>
                  <p className="text-xs text-red-700 font-medium">Rejected objectives</p>
                </div>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-red-500 to-rose-600"></div>
          </div>
        </div>

        {/* Objectives List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              All {viewMode === 'manager' ? 'Manager' : 'Employee'} Objectives
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Complete list of all {viewMode === 'manager' ? 'manager' : 'employee'} objectives in the organization
            </p>
          </div>
          <div className="overflow-x-auto">
            {(viewMode === 'manager' ? managerObjectives : objectives).length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {viewMode === 'employee' ? 'Employee' : 'Manager'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Objective
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    {viewMode === 'manager' && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        AI Score
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(viewMode === 'manager' ? managerObjectives : objectives).map((objective) => (
                    <tr key={objective.id} className="hover:bg-gray-50">
                      {/* Employee/Manager Column */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {viewMode === 'manager' ? (
                          <>
                            <div className="text-sm font-medium text-gray-900">{(objective as ManagerObjective).managerName}</div>
                            <div className="text-xs text-gray-500">{(objective as ManagerObjective).managerTitle}</div>
                          </>
                        ) : (
                          <>
                            <div className="text-sm font-medium text-gray-900">{(objective as Objective).user.name}</div>
                            <div className="text-xs text-gray-500">{(objective as Objective).user.title}</div>
                          </>
                        )}
                      </td>
                      
                      {/* Objective Column */}
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{objective.title}</div>
                        <div className="text-xs text-gray-500 mt-1">{objective.description.length > 60 ? `${objective.description.substring(0, 60)}...` : objective.description}</div>
                        <div className="text-xs text-gray-400 mt-1">Q{objective.quarter} {objective.year}</div>
                      </td>
                      
                      {/* Category Column */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {objective.category || 'General'}
                        </span>
                      </td>
                      
                      {/* Progress Column */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-[#004E9E] h-2 rounded-full" 
                              style={{ width: `${Math.min(100, getCompletionPercentage(objective))}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-900">{getCompletionPercentage(objective)}%</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {objective.current} / {objective.target}
                        </div>
                      </td>
                      
                      {/* Status Column */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(objective.status)}`}>
                          {objective.status === 'BONUS_APPROVED' ? (
                            <>
                              <CheckCircleIcon className="h-3 w-3 mr-1" />
                              {getStatusDisplayText(objective.status)}
                            </>
                          ) : (
                            getStatusDisplayText(objective.status)
                          )}
                        </span>
                      </td>
                      
                      {/* Due Date Column */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(objective.dueDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      
                      {/* AI Score Column - Only for Manager Objectives */}
                      {viewMode === 'manager' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {(objective as ManagerObjective).aiScore ? 
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {Math.round((objective as ManagerObjective).aiScore!)}/10
                            </span> : 
                            <span className="text-gray-400">-</span>
                          }
                        </td>
                      )}
                      
                      {/* Actions Column */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-[#004E9E] hover:text-[#007BFF] transition-colors">
                          <EyeIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center">
                <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No {viewMode === 'manager' ? 'manager' : 'employee'} objectives found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  No objectives have been created yet. Objectives will appear here once managers start assigning them to employees.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
