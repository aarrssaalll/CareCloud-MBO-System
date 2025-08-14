'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { mboSystem } from '@/lib/mbo-integration';

interface SystemMetrics {
  totalEmployees: number;
  totalObjectives: number;
  averageCompletion: number;
  averageScore: number;
  pendingReviews: number;
  overdueWorkflows: number;
  departmentCount: number;
  activeAssignments: number;
}

interface DepartmentPerformance {
  name: string;
  employees: number;
  completion: number;
  score: number;
  trend: 'up' | 'down' | 'stable';
}

interface RecentActivity {
  id: string;
  type: 'assignment' | 'completion' | 'review' | 'approval';
  description: string;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
}

export default function SystemDashboard() {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    totalEmployees: 0,
    totalObjectives: 0,
    averageCompletion: 0,
    averageScore: 0,
    pendingReviews: 0,
    overdueWorkflows: 0,
    departmentCount: 0,
    activeAssignments: 0
  });
  
  const [departmentPerformance, setDepartmentPerformance] = useState<DepartmentPerformance[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter'>('month');

  // Mock user - in real implementation, get from auth context
  const user = {
    email: "ceo@carecloud.com",
    role: "senior_management",
    name: "David Wilson",
    title: "Chief Executive Officer"
  };

  useEffect(() => {
    loadSystemData();
  }, [selectedTimeframe]);

  const loadSystemData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadSystemMetrics(),
        loadDepartmentPerformance(),
        loadRecentActivity(),
        loadSystemHealth()
      ]);
    } catch (error) {
      console.error('Error loading system data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSystemMetrics = async () => {
    try {
      const orgReport = await mboSystem.generateReport('organization', '');
      
      if (orgReport) {
        setSystemMetrics({
          totalEmployees: orgReport.totalEmployees,
          totalObjectives: orgReport.departmentReports.reduce((sum: number, dept: any) => 
            sum + dept.employees.reduce((deptSum: number, emp: any) => deptSum + (emp.objectivesCount || 0), 0), 0
          ),
          averageCompletion: orgReport.organizationMetrics.completionRate,
          averageScore: orgReport.organizationMetrics.averageScore,
          pendingReviews: orgReport.organizationMetrics.pendingReviews,
          overdueWorkflows: Math.floor(orgReport.totalEmployees * 0.08), // Mock calculation
          departmentCount: orgReport.departmentReports.length,
          activeAssignments: Math.floor(orgReport.totalEmployees * 0.6) // Mock calculation
        });
      }
    } catch (error) {
      console.error('Error loading system metrics:', error);
    }
  };

  const loadDepartmentPerformance = async () => {
    try {
      const departments = ['Customer Success', 'Technology', 'Human Resources', 'Sales', 'Marketing'];
      const performance: DepartmentPerformance[] = [];

      for (const dept of departments) {
        const metrics = await mboSystem.getDepartmentMetrics(dept.toLowerCase().replace(' ', '_'));
        performance.push({
          name: dept,
          employees: metrics.totalEmployees,
          completion: metrics.completionRate,
          score: metrics.averageScore,
          trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.3 ? 'stable' : 'down'
        });
      }

      setDepartmentPerformance(performance);
    } catch (error) {
      console.error('Error loading department performance:', error);
    }
  };

  const loadRecentActivity = () => {
    // Mock recent activity data
    const activities: RecentActivity[] = [
      {
        id: '1',
        type: 'assignment',
        description: 'Sarah Johnson assigned 5 objectives to Customer Success team',
        timestamp: '2 hours ago',
        priority: 'medium'
      },
      {
        id: '2',
        type: 'completion',
        description: 'John Smith completed Q3 objectives with 92% score',
        timestamp: '4 hours ago',
        priority: 'high'
      },
      {
        id: '3',
        type: 'review',
        description: '8 pending manager reviews in Technology department',
        timestamp: '6 hours ago',
        priority: 'high'
      },
      {
        id: '4',
        type: 'approval',
        description: 'HR approved bonus calculations for 15 employees',
        timestamp: '1 day ago',
        priority: 'medium'
      },
      {
        id: '5',
        type: 'assignment',
        description: 'Bulk objective assignment completed for Marketing team',
        timestamp: '1 day ago',
        priority: 'low'
      }
    ];

    setRecentActivity(activities);
  };

  const loadSystemHealth = async () => {
    try {
      const health = await mboSystem.systemHealthCheck();
      setSystemHealth(health);
    } catch (error) {
      console.error('Error loading system health:', error);
    }
  };

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'assignment':
        return <UserGroupIcon className="h-5 w-5 text-blue-500" />;
      case 'completion':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'review':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'approval':
        return <ShieldCheckIcon className="h-5 w-5 text-purple-500" />;
    }
  };

  const getPriorityColor = (priority: RecentActivity['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-green-500 bg-green-50';
    }
  };

  const getTrendIcon = (trend: DepartmentPerformance['trend']) => {
    switch (trend) {
      case 'up':
        return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />;
      case 'down':
        return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />;
      case 'stable':
        return <ArrowPathIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="h-8 w-8 animate-spin text-[#004E9E] mx-auto mb-4" />
          <p className="text-gray-600">Loading system dashboard...</p>
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
                <h1 className="text-3xl font-bold text-gray-900">CareCloud MBO System Dashboard</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Comprehensive organizational performance overview for Q3 2025
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value as any)}
                  className="border-gray-300 rounded-md shadow-sm focus:ring-[#004E9E] focus:border-[#004E9E] text-sm"
                >
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="quarter">This Quarter</option>
                </select>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.title}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* System Health Alert */}
        {systemHealth && systemHealth.status !== 'healthy' && (
          <div className={`mb-6 p-4 rounded-lg border ${
            systemHealth.status === 'error' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'
          }`}>
            <div className="flex items-center">
              <ExclamationTriangleIcon className={`h-5 w-5 mr-2 ${
                systemHealth.status === 'error' ? 'text-red-500' : 'text-yellow-500'
              }`} />
              <div>
                <h3 className={`font-medium ${
                  systemHealth.status === 'error' ? 'text-red-800' : 'text-yellow-800'
                }`}>
                  System Health: {systemHealth.status.toUpperCase()}
                </h3>
                <p className={`text-sm mt-1 ${
                  systemHealth.status === 'error' ? 'text-red-700' : 'text-yellow-700'
                }`}>
                  {systemHealth.issues.length} issue(s) detected. Last sync: {new Date(systemHealth.lastSync).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <UserGroupIcon className="h-8 w-8 text-[#004E9E]" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900">{systemMetrics.totalEmployees}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <TrophyIcon className="h-8 w-8 text-[#007BFF]" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round(systemMetrics.averageScore)}%</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round(systemMetrics.averageCompletion)}%</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Reviews</p>
                <p className="text-2xl font-bold text-gray-900">{systemMetrics.pendingReviews}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Department Performance & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Department Performance */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Department Performance</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {departmentPerformance.map((dept) => (
                  <div key={dept.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <BuildingOfficeIcon className="h-8 w-8 text-[#004E9E]" />
                      <div>
                        <h4 className="font-medium text-gray-900">{dept.name}</h4>
                        <p className="text-sm text-gray-600">{dept.employees} employees</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">{Math.round(dept.score)}%</span>
                        {getTrendIcon(dept.trend)}
                      </div>
                      <p className="text-xs text-gray-500">{Math.round(dept.completion)}% completion</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className={`p-3 border-l-4 ${getPriorityColor(activity.priority)}`}>
                    <div className="flex items-start space-x-3">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Objective Status */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Objective Status</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Objectives</span>
                <span className="font-semibold text-gray-900">{systemMetrics.totalObjectives}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Assignments</span>
                <span className="font-semibold text-gray-900">{systemMetrics.activeAssignments}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completion Rate</span>
                <span className="font-semibold text-green-600">{Math.round(systemMetrics.averageCompletion)}%</span>
              </div>
            </div>
          </div>

          {/* Workflow Status */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Workflow Status</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending Reviews</span>
                <span className="font-semibold text-yellow-600">{systemMetrics.pendingReviews}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Overdue Items</span>
                <span className="font-semibold text-red-600">{systemMetrics.overdueWorkflows}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">System Health</span>
                <span className={`font-semibold ${
                  systemHealth?.status === 'healthy' ? 'text-green-600' :
                  systemHealth?.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {systemHealth?.status?.toUpperCase() || 'CHECKING...'}
                </span>
              </div>
            </div>
          </div>

          {/* System Actions */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full px-4 py-2 bg-[#004E9E] text-white rounded-md hover:bg-[#003875] text-sm flex items-center justify-center space-x-2">
                <DocumentTextIcon className="h-4 w-4" />
                <span>Generate Full Report</span>
              </button>
              <button className="w-full px-4 py-2 bg-[#007BFF] text-white rounded-md hover:bg-[#0056b3] text-sm flex items-center justify-center space-x-2">
                <ArrowPathIcon className="h-4 w-4" />
                <span>Sync System Data</span>
              </button>
              <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm flex items-center justify-center space-x-2">
                <Cog6ToothIcon className="h-4 w-4" />
                <span>System Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
