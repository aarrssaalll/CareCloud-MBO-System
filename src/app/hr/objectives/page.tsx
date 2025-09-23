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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <UserGroupIcon className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Objectives</p>
                <p className="text-2xl font-bold text-gray-900">{objectives.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {objectives.filter(obj => obj.status === 'COMPLETED').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <SparklesIcon className="h-8 w-8 text-emerald-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Bonus Approved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {objectives.filter(obj => obj.status === 'BONUS_APPROVED').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {objectives.filter(obj => obj.status === 'ACTIVE').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Progress</p>
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
            <h2 className="text-lg font-semibold text-gray-900">All Employee Objectives</h2>
            <p className="text-sm text-gray-500 mt-1">Complete list of all objectives in the organization</p>
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
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Weight
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {objectives.map((objective) => (
                    <tr key={objective.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{objective.user.name}</div>
                          <div className="text-sm text-gray-500">{objective.title}</div>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(objective.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {objective.weight}%
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
