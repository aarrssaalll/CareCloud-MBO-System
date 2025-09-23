'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChartBarIcon,
  TrophyIcon,
  CurrencyDollarIcon,
  ArrowUpIcon,
  ClockIcon,
  CheckCircleIcon,
  UsersIcon,
  BellIcon,
  CogIcon,
  PlusIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  DocumentTextIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

interface User {
  id: string;
  employeeId: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  role: 'EMPLOYEE' | 'MANAGER' | 'HR' | 'SENIOR_MANAGEMENT';
  title: string;
  phone?: string;
  hireDate?: Date;
  salary?: number;
  status: string;
  departmentId?: string;
  teamId?: string;
  managerId?: string;
  departmentName?: string;
  teamName?: string;
  managerName?: string;
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
  dueDate: Date;
  quarter: string;
  year: number;
  userId: string;
  assignedById?: string;
  assignedByName?: string;
}

interface KPI {
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: any;
  color: string;
  progress?: number;
}

interface Notification {
  id: number;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionRequired?: boolean;
}

interface PerformanceData {
  quarter: string;
  score: number;
  trend: 'up' | 'down' | 'neutral';
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  // Objective counts for dashboard
  const totalObjectives = objectives.length;
  const completedObjectives = objectives.filter(obj => obj.status === 'COMPLETED' || obj.status === 'BONUS_APPROVED').length;
  const activeCount = objectives.filter(obj => obj.status !== 'COMPLETED' && obj.status !== 'BONUS_APPROVED').length;
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [performanceScore, setPerformanceScore] = useState('--');
  const [bonusAmount, setBonusAmount] = useState('--');

  // Load user data from database
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);

        // Check if user is logged in
        const storedUser = localStorage.getItem('mbo_user');
        if (!storedUser) {
          router.push('/login');
          return;
        }

        const currentUser = JSON.parse(storedUser);
        setUser(currentUser);

        // Fetch notifications from the database
        const notificationsResponse = await fetch(
          `/api/mbo/notifications?userId=${currentUser.id}`
        );
        const notificationsData = await notificationsResponse.json();
        setNotifications(Array.isArray(notificationsData) ? notificationsData : []);

        // Fetch performance data from the database
        const performanceResponse = await fetch(
          `/api/mbo/performance?userId=${currentUser.id}`
        );
        const performanceData = await performanceResponse.json();
        setPerformanceData(performanceData);

        // Fetch bonus data
        const bonusResponse = await fetch(`/api/mbo/bonus?userId=${currentUser.id}`);
        const bonusData = await bonusResponse.json();
        if (bonusData && bonusData.amount) {
          setBonusAmount(`$${bonusData.amount.toLocaleString()}`);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading user data:', error);
        setError('Failed to load dashboard data.');
        setLoading(false);
      }
    };

    loadUserData();
  }, [router]);

  // Load objectives data from database
  useEffect(() => {
    const loadObjectives = async () => {
      try {
        if (!user) {
          setObjectives([]); // Clear objectives when no user
          return;
        }

        // Clear objectives first to prevent showing old data
        setObjectives([]);

        console.log('Loading objectives for user:', user.id, user.email); // Debug user info
        const response = await fetch(`/api/employee/objectives?userId=${user.id}`);
        const result = await response.json();

        console.log('Fetched objectives for', user.email, ':', result); // Debugging log

        if (response.ok && Array.isArray(result.objectives)) {
          setObjectives(result.objectives);
          console.log('Set objectives for', user.email, ':', result.objectives.length, 'objectives');
        } else {
          console.error('Unexpected objectives data format:', result);
          setObjectives([]); // Set empty array if no valid data
        }
      } catch (error) {
        console.error('Error fetching objectives:', error);
        setObjectives([]); // Clear objectives on error
      }
    };

    loadObjectives();
  }, [user]);

  // Calculate KPIs based on real data
  const kpiData: KPI[] = useMemo(() => {
    if (!objectives.length) {
      return [
        {
          title: 'Overall Performance',
          value: 'Loading...',
          change: 0,
          trend: 'neutral',
          icon: ChartBarIcon,
          color: 'from-[#004E9E] to-[#007BFF]',
          progress: 0,
        },
        {
          title: 'Goals Completed',
          value: '0/0',
          change: 0,
          trend: 'neutral',
          icon: TrophyIcon,
          color: 'from-green-500 to-green-600',
          progress: 0,
        },
        {
          title: 'Quarterly Bonus',
          value: 'TBD',
          change: 0,
          trend: 'neutral',
          icon: CurrencyDollarIcon,
          color: 'from-yellow-500 to-orange-600',
          progress: 0,
        },
      ];
    }

    const totalObjectives = objectives.length;
    const completedObjectives = objectives.filter(
      (obj) => obj.status === 'COMPLETED' || obj.status === 'BONUS_APPROVED'
    ).length;
    
    // Calculate weighted performance score
    let totalWeightedScore = 0;
    let totalWeight = 0;
    
    objectives.forEach((obj) => {
      const progress = obj.target > 0 ? (obj.current / obj.target) * 100 : 0;
      const weight = obj.weight || 1; // Default weight to 1 if not specified
      totalWeightedScore += Math.min(progress, 100) * weight;
      totalWeight += weight;
    });
    
    const weightedAverageScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
    
    // Update performance score state for header display
    if (weightedAverageScore > 0) {
      setPerformanceScore(`${Math.round(weightedAverageScore)}%`);
    }

    const completionRate =
      totalObjectives > 0 ? (completedObjectives / totalObjectives) * 100 : 0;

    return [
      {
        title: 'Overall Performance',
        value: `${Math.round(weightedAverageScore)}%`,
        change: 5.2,
        trend: 'up',
        icon: ChartBarIcon,
        color: 'from-[#004E9E] to-[#007BFF]',
        progress: weightedAverageScore,
      },
      {
        title: 'Goals Completed',
        value: `${completedObjectives}/${totalObjectives}`,
        change: 12.5,
        trend: 'up',
        icon: TrophyIcon,
        color: 'from-green-500 to-green-600',
        progress: completionRate,
      },
      {
        title: 'Quarterly Bonus',
        value: bonusAmount || 'TBD',
        change: bonusAmount !== '--' ? 8.3 : 0,
        trend: bonusAmount !== '--' ? 'up' : 'neutral',
        icon: CurrencyDollarIcon,
        color: 'from-yellow-500 to-orange-600',
        progress: bonusAmount !== '--' ? Math.min(85, Math.max(0, parseFloat(bonusAmount.replace(/[$,]/g, '')) / 100)) : 0,
      },
    ];
  }, [objectives]);

  const markNotificationRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'active':
        return 'text-blue-600 bg-blue-100';
      case 'on_hold':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'bg-green-500';
    if (progress >= 70) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#004E9E] mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️ Error Loading Dashboard</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-[#004E9E] text-white px-6 py-2 rounded-lg hover:bg-[#003875]"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header Section */}
      <div className="bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#333333] to-[#666666] bg-clip-text text-transparent mb-2">
                Good morning, {user.firstName} 👋
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
            <div className="flex items-center space-x-4">
              {/* Performance Card */}
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="text-2xl font-bold">{performanceScore}</div>
                <div className="text-sm text-green-100">Performance</div>
              </div>

              {/* Bonus Card */}
              <div className="bg-gradient-to-r from-[#004E9E] to-[#007BFF] text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="text-2xl font-bold">{bonusAmount}</div>
                <div className="text-sm text-blue-100">Current Bonus</div>
              </div>

              {/* User Profile */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.title}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#004E9E] flex items-center justify-center">
                  <span className="text-white font-medium">
                    {user.firstName[0]}
                    {user.lastName[0]}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {kpiData.map((kpi, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-2">
                    {kpi.value}
                  </p>
                  {kpi.change !== 0 && (
                    <p
                      className={`text-sm flex items-center mt-2 ${
                        kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      <ArrowUpIcon
                        className={`h-4 w-4 mr-1 ${
                          kpi.trend === 'down' ? 'transform rotate-180' : ''
                        }`}
                      />
                      {kpi.change}%
                    </p>
                  )}
                </div>
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-r ${kpi.color} flex items-center justify-center`}
                >
                  <kpi.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              {kpi.progress !== undefined && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getProgressColor(kpi.progress)}`}
                      style={{ width: `${kpi.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Objectives */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    All Objectives
                  </h2>
                  <span className="text-sm text-gray-500">
                    {completedObjectives}/{totalObjectives} Completed • {activeCount} Active
                  </span>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                  {totalObjectives === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <TrophyIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No objectives assigned yet</p>
                  </div>
                  ) : (
                  objectives.map((objective) => {
                    const progress =
                      objective.target > 0
                        ? (objective.current / objective.target) * 100
                        : 0;
                    return (
                      <div key={objective.id} className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-900">
                              {objective.title}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {objective.description}
                            </p>
                            <div className="flex items-center mt-2 space-x-4">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                                  objective.status
                                )}`}
                              >
                                {objective.status}
                              </span>
                              <span className="text-xs text-gray-500">
                                Due: {new Date(objective.dueDate).toLocaleDateString()}
                              </span>
                              <span className="text-xs text-gray-500">
                                Weight: {objective.weight}x
                              </span>
                            </div>
                          </div>
                          <div className="ml-4 text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {objective.current} / {objective.target}
                            </p>
                            <p className="text-xs text-gray-500">
                              {Math.round(progress)}% complete
                            </p>
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getProgressColor(progress)}`}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Notifications & Quick Actions */}
          <div className="space-y-6">
            {/* Notifications */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Notifications
                </h2>
              </div>
              <div className="divide-y divide-gray-200">
                {notifications.length === 0 ? (
                  <div className="h-48 flex items-center justify-center text-gray-500">
                    No notifications to display.
                  </div>
                ) : (
                  notifications.slice(0, 5).map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 cursor-pointer hover:bg-gray-50 ${
                        notification.read ? 'bg-gray-100' : 'bg-white'
                      }`}
                      onClick={() => markNotificationRead(notification.id)}
                    >
                      <div className="flex items-start">
                        <div
                          className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                            notification.type === 'success'
                              ? 'bg-green-500'
                              : notification.type === 'warning'
                              ? 'bg-yellow-500'
                              : notification.type === 'error'
                              ? 'bg-red-500'
                              : 'bg-blue-500'
                          }`}
                        ></div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {notification.timestamp}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Quick Actions
                </h2>
              </div>
              <div className="p-6 space-y-3">
                <button
                  onClick={() => router.push('/mbo-test')}
                  className="w-full flex items-center justify-center px-4 py-2 bg-[#004E9E] text-white rounded-lg hover:bg-[#003875] transition-colors"
                >
                  <SparklesIcon className="h-4 w-4 mr-2" />
                  Test Database System
                </button>
                <button
                  onClick={() => router.push('/employee/objectives')}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <TrophyIcon className="h-4 w-4 mr-2" />
                  View All Objectives
                </button>
                <button
                  onClick={() => router.push('/performance')}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ChartBarIcon className="h-4 w-4 mr-2" />
                  Performance Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
