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
  ShieldCheckIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';

interface SystemMetrics {
  totalEmployees: number;
  myManagers: number;
  totalObjectivesAssigned: number;
  pendingObjectives: number;
  overdueWorkflows: number;
  departmentCount: number;
  activeAssignments: number;
}

interface DepartmentPerformance {
  id: string;
  name: string;
  employees: number;
  managers: number;
  totalUsers: number;
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
  const { user, isLoading: authLoading } = useAuth(true, ['SENIOR_MANAGEMENT', 'senior-management']);
  const router = useRouter();
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    totalEmployees: 0,
    myManagers: 0,
    totalObjectivesAssigned: 0,
    pendingObjectives: 0,
    overdueWorkflows: 0,
    departmentCount: 0,
    activeAssignments: 0
  });
  
  const [departmentPerformance, setDepartmentPerformance] = useState<DepartmentPerformance[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check authentication and role - handled by useAuth hook now
  useEffect(() => {
    if (!authLoading && user) {
      loadSystemData();
    }
  }, [authLoading, user]);

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
      if (!user || !user.id) {
        setSystemMetrics({
          totalEmployees: 0,
          myManagers: 0,
          totalObjectivesAssigned: 0,
          pendingObjectives: 0,
          overdueWorkflows: 0,
          departmentCount: 0,
          activeAssignments: 0
        });
        return;
      }

      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Get total employees count
      let totalEmployees = 0;
      try {
        const usersResponse = await fetch('/api/mbo/data?type=users');
        if (usersResponse.ok) {
          const usersResult = await usersResponse.json();
          totalEmployees = (usersResult.success && usersResult.data && Array.isArray(usersResult.data)) 
            ? usersResult.data.length 
            : Array.isArray(usersResult) ? usersResult.length : 0;
        }
      } catch (error) {
        totalEmployees = 0;
      }

      // Get managers under this senior manager
      let myManagers = 0;
      try {
        const managersResponse = await fetch(`/api/senior-management/team?seniorManagerId=${user.id}`, { headers });
        if (managersResponse.ok) {
          const managersResult = await managersResponse.json();
          myManagers = (managersResult.success && managersResult.subordinateManagers && Array.isArray(managersResult.subordinateManagers)) 
            ? managersResult.subordinateManagers.length : 0;
        }
      } catch (error) {
        myManagers = 0;
      }

      // Get objectives assigned to all managers under this senior manager
      let totalObjectivesAssigned = 0;
      let pendingObjectives = 0;
      try {
        const objectivesResponse = await fetch(`/api/senior-management/assigned-objectives?seniorManagerId=${user.id}`, { headers });
        if (objectivesResponse.ok) {
          const objectivesResult = await objectivesResponse.json();
          if (objectivesResult.success && objectivesResult.objectives && Array.isArray(objectivesResult.objectives)) {
            totalObjectivesAssigned = objectivesResult.objectives.length;
            pendingObjectives = objectivesResult.objectives.filter((obj: any) => 
              obj.status === 'MANAGER_SUBMITTED' || obj.status === 'SENIOR_REVIEWED'
            ).length;
          }
        }
      } catch (error) {
        totalObjectivesAssigned = 0;
        pendingObjectives = 0;
      }

      // Set senior management specific metrics
      setSystemMetrics({
        totalEmployees,
        myManagers,
        totalObjectivesAssigned,
        pendingObjectives,
        overdueWorkflows: 0,
        departmentCount: 0,
        activeAssignments: 0
      });

    } catch (error) {
      console.error('❌ Error loading system metrics:', error);
      setError('Failed to load system metrics');
      
      // Set fallback values with dashes
      setSystemMetrics({
        totalEmployees: 0,
        myManagers: 0,
        totalObjectivesAssigned: 0,
        pendingObjectives: 0,
        overdueWorkflows: 0,
        departmentCount: 0,
        activeAssignments: 0
      });
    }
  };

  const loadDepartmentPerformance = async () => {
    try {
      console.log('🔍 Loading department performance with live data...');
      
      // Create a dedicated API call to get departments with user counts
      const response = await fetch('/api/system/department-stats');
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setDepartmentPerformance(result.data);
          console.log('✅ Department data loaded:', result.data);
          return;
        }
      }
      
      // Fallback: Try to construct the data manually
      console.log('📊 Using fallback method for department data...');
      
      const [deptResponse, usersResponse] = await Promise.all([
        fetch('/api/mbo/data?type=departments'),
        fetch('/api/mbo/data?type=users')
      ]);
      
      const deptResult = await deptResponse.json();
      const usersResult = await usersResponse.json();
      
      console.log('📊 Departments API result:', deptResult);
      console.log('📊 Users API result:', usersResult);
      
      if (deptResult.success && deptResult.data && usersResult.success && usersResult.data) {
        const users = usersResult.data;
        const departments = deptResult.data;
        
        console.log('📊 Processing', departments.length, 'departments and', users.length, 'users');
        
        const departmentsWithCounts = departments.map((dept: any) => {
          // Try different possible field names for department relationship
          const departmentUsers = users.filter((user: any) => 
            user.departmentId === dept.id || 
            user.department?.id === dept.id ||
            user.department === dept.id ||
            (user.department && user.department.name === dept.name)
          );
          
          console.log(`📊 Department ${dept.name}: Found ${departmentUsers.length} users`);
          
          const employees = departmentUsers.filter((user: any) => 
            user.role === 'EMPLOYEE' || user.role === 'employee'
          ).length;
          
          const managers = departmentUsers.filter((user: any) => 
            user.role === 'MANAGER' || user.role === 'manager'
          ).length;
          
          console.log(`📊 Department ${dept.name}: ${employees} employees, ${managers} managers`);
          
          return {
            id: dept.id,
            name: dept.name,
            employees: employees,
            managers: managers,
            totalUsers: employees + managers,
            completion: 0,
            score: 0,
            trend: 'stable' as const
          };
        });
        
        setDepartmentPerformance(departmentsWithCounts);
        console.log('✅ Final department data:', departmentsWithCounts);
      } else {
        console.log('❌ Failed to get department or user data');
        setDepartmentPerformance([]);
      }
    } catch (error) {
      console.error('❌ Error loading department data:', error);
      setDepartmentPerformance([]);
    }
  };

  const loadRecentActivity = async () => {
    // Recent activity not needed for senior management dashboard
    setRecentActivity([]);
  };

  const loadSystemHealth = async () => {
    // System health always healthy for senior management dashboard
    setSystemHealth({
      status: 'healthy',
      lastSync: new Date().toISOString(),
      issues: []
    });
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

  if (authLoading) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  if (!user) {
    return <LoadingSpinner message="Authentication required..." />;
  }

  if (isLoading) {
    return <LoadingSpinner message={`Loading system dashboard... (Connected as: ${user?.name})`} />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Dashboard Error</h3>
          <p className="mt-2 text-sm text-gray-500">{error}</p>
          <div className="mt-6">
            <button
              onClick={() => {
                setError(null);
                loadSystemData();
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#004E9E] hover:bg-[#003875]"
            >
              <ArrowPathIcon className="mr-2 h-4 w-4" />
              Retry
            </button>
          </div>
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
                  Good morning, {user.firstName || user.name}
                </h1>
                <p className="text-[#666666]">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {systemMetrics.totalEmployees > 0 ? systemMetrics.totalEmployees : '-'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <BuildingOfficeIcon className="h-8 w-8 text-[#007BFF]" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">My Managers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {systemMetrics.myManagers >= 0 ? systemMetrics.myManagers : '-'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Objectives</p>
                <p className="text-2xl font-bold text-gray-900">
                  {systemMetrics.totalObjectivesAssigned >= 0 ? systemMetrics.totalObjectivesAssigned : '-'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Objectives</p>
                <p className="text-2xl font-bold text-gray-900">
                  {systemMetrics.pendingObjectives >= 0 ? systemMetrics.pendingObjectives : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => router.push('/senior-management/review-objectives')}
            className="bg-gradient-to-br from-[#004E9E] to-[#007BFF] p-6 rounded-xl text-white hover:shadow-lg transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h3 className="text-lg font-semibold mb-2">Review Objectives</h3>
                <p className="text-blue-100 text-sm">Review and approve manager objectives</p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-blue-200 group-hover:scale-110 transition-transform" />
            </div>
          </button>

          <button
            onClick={() => router.push('/performance')}
            className="bg-gradient-to-br from-green-600 to-green-700 p-6 rounded-xl text-white hover:shadow-lg transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h3 className="text-lg font-semibold mb-2">Performance</h3>
                <p className="text-green-100 text-sm">Analyze organizational performance metrics</p>
              </div>
              <ChartBarIcon className="h-8 w-8 text-green-200 group-hover:scale-110 transition-transform" />
            </div>
          </button>

          <button
            onClick={() => router.push('/settings')}
            className="bg-gradient-to-br from-purple-600 to-purple-700 p-6 rounded-xl text-white hover:shadow-lg transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h3 className="text-lg font-semibold mb-2">System Settings</h3>
                <p className="text-purple-100 text-sm">Configure system parameters and options</p>
              </div>
              <Cog6ToothIcon className="h-8 w-8 text-purple-200 group-hover:scale-110 transition-transform" />
            </div>
          </button>
        </div>

        {/* Department Performance & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Department Performance */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Department Overview</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {departmentPerformance.length > 0 ? (
                  departmentPerformance.map((dept) => (
                    <div key={dept.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <BuildingOfficeIcon className="h-8 w-8 text-[#004E9E]" />
                        <div>
                          <h4 className="font-medium text-gray-900">{dept.name}</h4>
                          <p className="text-sm text-gray-600">Department</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <span className="text-lg font-bold text-gray-900">{dept.employees}</span>
                            <p className="text-xs text-gray-500">Employees</p>
                          </div>
                          <div className="text-center">
                            <span className="text-lg font-bold text-gray-900">{dept.managers}</span>
                            <p className="text-xs text-gray-500">Managers</p>
                          </div>
                          <div className="text-center">
                            <span className="text-lg font-bold text-[#004E9E]">{dept.totalUsers}</span>
                            <p className="text-xs text-gray-500">Total</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <BuildingOfficeIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No department data available</p>
                  </div>
                )}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Objective Status */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Objective Status</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Objectives</span>
                <span className="font-semibold text-gray-900">
                  {systemMetrics.totalObjectivesAssigned >= 0 ? systemMetrics.totalObjectivesAssigned : '-'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Assignments</span>
                <span className="font-semibold text-gray-900">
                  {systemMetrics.activeAssignments > 0 ? systemMetrics.activeAssignments : '-'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">My Managers</span>
                <span className="font-semibold text-green-600">
                  {systemMetrics.myManagers >= 0 ? systemMetrics.myManagers : '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Workflow Status */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Workflow Status</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending Objectives</span>
                <span className="font-semibold text-yellow-600">
                  {systemMetrics.pendingObjectives >= 0 ? systemMetrics.pendingObjectives : '-'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Overdue Items</span>
                <span className="font-semibold text-red-600">
                  {systemMetrics.overdueWorkflows >= 0 ? systemMetrics.overdueWorkflows : '-'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">System Health</span>
                <span className={`font-semibold ${
                  systemHealth?.status === 'healthy' ? 'text-green-600' :
                  systemHealth?.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {systemHealth?.status?.toUpperCase() || '-'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
