"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { initializeSampleDataIfNeeded } from "@/lib/sample-data";
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
} from "@heroicons/react/24/outline";
// layout-driven navigation (AppShell) picks items from shared config; no need here

interface User {
  name: string;
  email: string;
  role: "employee" | "manager" | "hr" | "senior-management";
  avatar?: string;
  department?: string;
  designation?: string;
  joinDate?: string;
  employeeId?: string;
}

interface Objective {
  id: number;
  title: string;
  description: string;
  target: number;
  current: number;
  status: "on-track" | "at-risk" | "completed" | "overdue";
  dueDate: string;
  category: string;
  remarks?: string;
  aiScore?: number;
  lastUpdated?: string;
}

interface KPI {
  title: string;
  value: string;
  change: number;
  trend: "up" | "down" | "neutral";
  icon: any;
  color: string;
  progress?: number;
}

interface Notification {
  id: number;
  type: "info" | "warning" | "success" | "error";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionRequired?: boolean;
}

interface PerformanceData {
  quarter: string;
  score: number;
  trend: "up" | "down" | "neutral";
}

export default function DashboardPage() {
  const [user, setUser] = useState<User>({
    name: "Guest",
    role: "employee",
    email: "guest@carecloud.com",
    avatar: "/api/placeholder/64/64",
    department: "Engineering",
    designation: "Software Engineer",
    joinDate: "2023-01-15",
    employeeId: "EMP001"
  });

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: "info",
      title: "AI Score Analysis",
      message: "Your Q4 objective performance has been analyzed by AI. Score: 94.2%",
      timestamp: "2 hours ago",
      read: false,
      actionRequired: false
    },
    {
      id: 2,
      type: "warning", 
      title: "Objective Due Soon",
      message: "Process Optimization objective is due in 3 days",
      timestamp: "1 day ago",
      read: false,
      actionRequired: true
    },
    {
      id: 3,
      type: "success",
      title: "Bonus Calculated",
      message: "Your Q3 bonus of $4,250 has been processed",
      timestamp: "3 days ago",
      read: true,
      actionRequired: false
    }
  ]);

  const [performanceData] = useState<PerformanceData[]>([
    { quarter: "Q1", score: 78, trend: "up" },
    { quarter: "Q2", score: 85, trend: "up" },
    { quarter: "Q3", score: 91, trend: "up" },
    { quarter: "Q4", score: 94.2, trend: "up" }
  ]);

  // Sidebar and navigation are provided by AppShell

  // AI Analysis Function
  const analyzeObjectiveWithAI = async (objective: Objective, remarks: string) => {
    try {
      const res = await fetch('/api/ai-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objective, remarks })
      });
      if (!res.ok) throw new Error('AI API failed');
      return await res.json();
    } catch (error) {
      console.error('AI Analysis failed:', error);
      return null;
    }
  };

  const mockObjectives: Objective[] = useMemo(() => [
    {
      id: 1,
      title: "Q4 Revenue Target",
      description: "Achieve 15% increase in quarterly revenue",
      target: 115,
      current: 98,
      status: "on-track",
      dueDate: "2024-12-31",
      category: "Sales",
      remarks: "Making good progress on key client acquisitions. Secured 3 major deals this month.",
      aiScore: 92.5,
      lastUpdated: "2024-11-15"
    },
    {
      id: 2,
      title: "Customer Satisfaction",
      description: "Maintain NPS score above 85",
      target: 85,
      current: 88,
      status: "completed",
      dueDate: "2024-12-15",
      category: "Customer Success",
      remarks: "Implemented new support workflow resulting in faster resolution times.",
      aiScore: 98.1,
      lastUpdated: "2024-11-10"
    },
    {
      id: 3,
      title: "Process Optimization", 
      description: "Reduce operational costs by 10%",
      target: 90,
      current: 75,
      status: "at-risk",
      dueDate: "2024-11-30",
      category: "Operations",
      remarks: "Identified bottlenecks but implementation delayed due to resource constraints.",
      aiScore: 76.3,
      lastUpdated: "2024-11-14"
    }
  ], []);

  const kpiData: KPI[] = useMemo(() => [
    {
      title: "Overall Performance",
      value: "87%",
      change: 5.2,
  trend: "up",
      icon: ChartBarIcon,
      color: "from-[#004E9E] to-[#007BFF]",
      progress: 87
    },
    {
      title: "Goals Completed",
      value: "6/8",
      change: 12.5,
  trend: "up",
      icon: TrophyIcon,
      color: "from-green-500 to-green-600",
      progress: 75
    },
    {
      title: "Quarterly Bonus",
      value: "$4,250",
      change: 8.3,
  trend: "up",
      icon: CurrencyDollarIcon,
      color: "from-yellow-500 to-orange-600",
      progress: 85
    }
  ], []);

  useEffect(() => {
    const initializeSystem = async () => {
      // Initialize sample data if needed
      await initializeSampleDataIfNeeded();
      
      // Load user data
      const userData = localStorage.getItem("user");
      if (userData) {
        setUser(JSON.parse(userData));
      } else {
        window.location.href = "/login";
      }
    };

    initializeSystem();
  }, []);

  const markNotificationRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const runAIForObjective = async (objectiveId: number) => {
    const obj = mockObjectives.find(o => o.id === objectiveId);
    if (!obj) return;
    const result = await analyzeObjectiveWithAI(obj, obj.remarks || '');
    if (result) {
      alert(`AI Score: ${result.score.toFixed(1)}%\nRecommendations:\n- ${result.recommendations.join('\n- ')}`);
    }
  };

  return (
    <>
        {/* Main Content Area (AppShell wraps this) */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Enhanced Header Section */}
          <div className="bg-white/95 backdrop-blur-xl border-b border-gray-200/50 px-8 py-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#333333] to-[#666666] bg-clip-text text-transparent mb-2">
                  Good morning, {user.name.split(' ')[0]} 👋
                </h1>
                <p className="text-[#666666]">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-[#004E9E] to-[#007BFF] text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="text-2xl font-bold">$4,250</div>
                  <div className="text-sm text-blue-100">Current Bonus</div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="text-2xl font-bold">87%</div>
                  <div className="text-sm text-green-100">Performance</div>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {kpiData.map((kpi, index) => (
                <div key={index} className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-[#004E9E]/10 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#004E9E] to-[#007BFF] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                      <kpi.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-green-600 font-semibold flex items-center">
                        <ArrowUpIcon className="w-4 h-4 mr-1" />
                        +{kpi.change}%
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#333333] mb-1">{kpi.title}</h3>
                    <p className="text-3xl font-bold text-[#004E9E]">{kpi.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              
              {/* Performance Analytics */}
              <div className="xl:col-span-2 space-y-8">
                
                {/* Enhanced Performance Chart */}
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-[#004E9E]/10 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#004E9E] to-[#007BFF]"></div>
                  </div>
                  
                  <style jsx>{`
                    @keyframes dash {
                      to { stroke-dashoffset: -800; }
                    }
                  `}</style>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-[#004E9E] to-[#007BFF] bg-clip-text text-transparent">
                          Performance Trend Analytics
                        </h3>
                        <p className="text-gray-600 mt-1">Real-time performance tracking</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button className="px-4 py-2 bg-gradient-to-r from-[#004E9E] to-[#007BFF] text-white rounded-xl hover:shadow-lg transition-all duration-300">
                          This Quarter
                        </button>
                        <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-300">
                          This Year
                        </button>
                      </div>
                    </div>
                    
                    {/* Chart Area */}
                    <div className="h-96 bg-gradient-to-br from-gray-50/50 to-blue-50/50 rounded-2xl border border-gray-200/50 relative overflow-hidden">
                      {/* Grid Pattern */}
                      <div className="absolute inset-0">
                        <svg className="w-full h-full" viewBox="0 0 400 300">
                          <defs>
                            <pattern id="grid" width="40" height="30" patternUnits="userSpaceOnUse">
                              <path d="M 40 0 L 0 0 0 30" fill="none" stroke="#e5e7eb" strokeWidth="0.5" opacity="0.5"/>
                            </pattern>
                          </defs>
                          <rect width="100%" height="100%" fill="url(#grid)" />
                        </svg>
                      </div>

                      {/* Performance Chart */}
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 300">
                        <defs>
                          <linearGradient id="performanceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#004E9E" stopOpacity="0.25"/>
                            <stop offset="50%" stopColor="#007BFF" stopOpacity="0.15"/>
                            <stop offset="100%" stopColor="#007BFF" stopOpacity="0"/>
                          </linearGradient>
                          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#004E9E"/>
                            <stop offset="100%" stopColor="#007BFF"/>
                          </linearGradient>
                        </defs>
                        
                        {/* Background Performance Area */}
                        <path
                          d="M40,220 Q100,180 150,160 T250,140 T360,120 L360,280 L40,280 Z"
                          fill="url(#performanceGradient)"
                        />
                        
                        {/* Main Performance Line */}
                        <path
                          d="M40,220 Q100,180 150,160 T250,140 T360,120"
                          stroke="url(#lineGradient)"
                          strokeWidth="3"
                          fill="none"
                          strokeLinecap="round"
                        />

                        {/* Animated dashed trail */}
                        <path
                          d="M40,220 Q100,180 150,160 T250,140 T360,120"
                          stroke="#007BFF"
                          strokeWidth="2"
                          fill="none"
                          strokeDasharray="10 8"
                          style={{ animation: 'dash 6s linear infinite' }}
                          opacity="0.5"
                        />

                        {/* Small line markers at data points (no bouncing dots) */}
                        <g stroke="#004E9E" strokeWidth="3" strokeLinecap="round">
                          <line x1="40" y1="228" x2="40" y2="212" />
                          <line x1="150" y1="168" x2="150" y2="152" />
                          <line x1="250" y1="148" x2="250" y2="132" />
                          <line x1="360" y1="128" x2="360" y2="112" />
                        </g>

                        {/* Labels */}
                        <text x="40" y="245" textAnchor="middle" className="text-xs fill-gray-600 font-medium">Q1</text>
                        <text x="150" y="245" textAnchor="middle" className="text-xs fill-gray-600 font-medium">Q2</text>
                        <text x="250" y="245" textAnchor="middle" className="text-xs fill-gray-600 font-medium">Q3</text>
                        <text x="360" y="245" textAnchor="middle" className="text-xs fill-gray-600 font-medium">Q4</text>
                      </svg>

                      {/* Performance Stats Overlay */}
                      <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/50">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-[#004E9E]">94.2%</div>
                          <div className="text-xs text-gray-600">Current Score</div>
                          <div className="flex items-center justify-center mt-2">
                            <svg className="w-4 h-4 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            <span className="text-xs text-green-600 font-medium">+8.3%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-4 gap-4 mt-6">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center border border-blue-200">
                        <div className="text-lg font-bold text-[#004E9E]">78%</div>
                        <div className="text-xs text-gray-600">Q1 Score</div>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center border border-green-200">
                        <div className="text-lg font-bold text-green-600">85%</div>
                        <div className="text-xs text-gray-600">Q2 Score</div>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center border border-purple-200">
                        <div className="text-lg font-bold text-purple-600">91%</div>
                        <div className="text-xs text-gray-600">Q3 Score</div>
                      </div>
                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 text-center border border-orange-200">
                        <div className="text-lg font-bold text-orange-600">94%</div>
                        <div className="text-xs text-gray-600">Q4 Score</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Objectives */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Objectives</h3>
                  <div className="space-y-4">
                    {mockObjectives.map((objective) => (
                      <div key={objective.id} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-[#333333]">{objective.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            objective.status === 'completed' ? 'bg-green-100 text-green-800' :
                            objective.status === 'on-track' ? 'bg-blue-100 text-blue-800' :
                            objective.status === 'at-risk' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {objective.status}
                          </span>
                        </div>
                        <p className="text-[#666666] text-sm mb-3">{objective.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-[#999999]">Due: {objective.dueDate}</div>
                          <div className="text-sm font-medium text-[#004E9E]">
                            {Math.round((objective.current / objective.target) * 100)}% Complete
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <button onClick={() => runAIForObjective(objective.id)} className="px-3 py-1.5 text-xs rounded-lg bg-primary text-white hover:bg-[#003d7c]">AI Analyze</button>
                          <div className="text-sm font-medium text-[#004E9E]">
                            {Math.round((objective.current / objective.target) * 100)}% Complete
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Sidebar (dashboard-only) */}
              <div className="space-y-6">
                {/* Notifications */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center"><BellIcon className="w-5 h-5 mr-2"/> Notifications</h3>
                  <div className="space-y-3">
                    {notifications.map(n => (
                      <div key={n.id} className={`p-3 rounded-lg border flex items-start justify-between ${n.read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'}`}>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                          <p className="text-xs text-gray-600">{n.message}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{n.timestamp}</p>
                        </div>
                        {!n.read && (
                          <button onClick={() => markNotificationRead(n.id)} className="text-xs text-[#004E9E] hover:underline">Mark read</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Objectives Due</span>
                      <span className="font-bold text-orange-600">3</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Completed This Month</span>
                      <span className="font-bold text-green-600">5</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Average Score</span>
                      <span className="font-bold text-blue-600">87%</span>
                    </div>
                  </div>
                </div>

                {/* Team Leaderboard (for managers) */}
                {(user.role === "manager" || user.role === "senior-management") && (
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Team Leaderboard</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-sm">Sarah Johnson</p>
                          <p className="text-xs text-gray-600">95% completion</p>
                        </div>
                        <p className="font-bold text-yellow-600 text-sm">$5,200</p>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-sm">Michael Chen</p>
                          <p className="text-xs text-gray-600">92% completion</p>
                        </div>
                        <p className="font-bold text-blue-600 text-sm">$4,800</p>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-xl border border-green-200">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-sm">Lisa Wong</p>
                          <p className="text-xs text-gray-600">87% completion</p>
                        </div>
                        <p className="font-bold text-green-600 text-sm">$4,250</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
    </div>
  </>
  );
}
