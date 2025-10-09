"use client";

import { useState, useEffect } from "react";
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

export default function HRObjectivesPage() {
  const { user, isLoading: authLoading } = useAuth(true, ['HR', 'hr', 'SENIOR_MANAGEMENT', 'senior_management']);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    loadAllObjectives();
  }, [authLoading, user]);

  const loadAllObjectives = async () => {
    setLoading(true);
    try {
      console.log('Loading all objectives for HR view:', user?.id);
      const response = await fetch(`/api/hr/all-objectives`);
      const data = await response.json();
      console.log('All objectives response:', data);
      
      if (data.success) {
        setObjectives(data.data || []); // Fixed: changed from data.objectives to data.data
        console.log(`Found ${data.data?.length || 0} total objectives`);
      } else {
        console.error('Failed to load objectives:', data.error);
        setObjectives([]);
      }
    } catch (error) {
      console.error('Error loading objectives:', error);
      setObjectives([]);
    } finally {
      setLoading(false);
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

  const getCompletionPercentage = (objective: Objective) => {
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004E9E] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading objectives overview...</p>
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
                <h1 className="text-3xl font-bold text-gray-900">All Organization Objectives</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Complete overview of all employee objectives across the organization
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">HR</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#003d7c] text-white flex items-center justify-center text-sm font-medium">
                    {user.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                  </div>
                </div>
              </div>
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
                  <p className="text-3xl font-bold text-blue-900 mb-1">{objectives.length}</p>
                  <p className="text-xs text-blue-700 font-medium">All objectives in the org</p>
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
                    {objectives.filter(obj => obj.status === 'ASSIGNED' || obj.status === 'ACTIVE' || obj.status === 'IN_PROGRESS').length}
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
                    {objectives.filter(obj => obj.status === 'COMPLETED').length}
                  </p>
                  <p className="text-xs text-green-700 font-medium">Completed by employees</p>
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
                    {objectives.filter(obj => obj.status === 'AI_SCORED' || obj.status === 'SUBMITTED_TO_HR').length}
                  </p>
                  <p className="text-xs text-purple-700 font-medium">Scored by managers</p>
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
            <h2 className="text-lg font-semibold text-gray-900">All Employee Objectives</h2>
            <p className="text-sm text-gray-500 mt-1">Complete list of all objectives in the organization</p>
          </div>
          <div className="overflow-x-auto">
            {objectives.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Objective Details
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned To
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned By
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Weight
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {objectives.map((objective) => (
                    <tr key={objective.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{objective.title}</div>
                        <div className="text-xs text-gray-500">{objective.description.length > 40 ? `${objective.description.substring(0, 40)}...` : objective.description}</div>
                        <div className="text-xs text-gray-400">Q{objective.quarter} {objective.year}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{objective.user.name}</div>
                        <div className="text-xs text-gray-500">{objective.user.title}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {objective.assignedBy ? objective.assignedBy.name : 'Manager'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {objective.assignedBy ? objective.assignedBy.title : 'Manager'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${Math.min(100, getCompletionPercentage(objective))}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-900">{getCompletionPercentage(objective)}%</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {objective.current} / {objective.target}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(objective.status)}`}>
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
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900">
                        {new Date(objective.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900">
                        {Math.round(objective.weight * 100)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center">
                <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No objectives found</h3>
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
