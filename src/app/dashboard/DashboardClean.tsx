"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/NavigationEnhanced";
import PerformanceCard from "@/components/PerformanceCard";
import ObjectiveCard from "@/components/ObjectiveCard";
import {
  ChartBarIcon,
  TrophyIcon,
  CurrencyDollarIcon,
  ArrowUpIcon,
  ClockIcon,
  CheckCircleIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

interface User {
  name: string;
  email: string;
  role: "employee" | "manager" | "hr" | "senior-management";
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
}

interface KPI {
  title: string;
  value: string;
  change: number;
  trend: "up" | "down" | "neutral";
  icon: any;
  color: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User>({
    name: "Guest",
    role: "employee",
    email: "guest@carecloud.com"
  });

  const mockObjectives: Objective[] = useMemo(() => [
    {
      id: 1,
      title: "Increase Customer Satisfaction",
      description: "Achieve 95% customer satisfaction rating",
      target: 95,
      current: 87,
      status: "on-track",
      dueDate: "2024-12-31",
      category: "Customer Service"
    },
    {
      id: 2,
      title: "Complete Training Program",
      description: "Finish advanced technical certification",
      target: 100,
      current: 75,
      status: "on-track",
      dueDate: "2024-11-30",
      category: "Professional Development"
    }
  ], []);

  const kpiData: KPI[] = useMemo(() => [
    {
      title: "Overall Performance",
      value: "87%",
      change: 5.2,
      icon: ChartBarIcon,
      color: "from-[#004E9E] to-[#007BFF]",
      progress: 87
    },
    {
      title: "Goals Completed",
      value: "6/8",
      change: 12.5,
      icon: TrophyIcon,
      color: "from-green-500 to-green-600",
      progress: 75
    },
    {
      title: "Quarterly Bonus",
      value: "$4,250",
      change: 8.3,
      icon: CurrencyDollarIcon,
      color: "from-yellow-500 to-orange-600",
      progress: 85
    }
  ], []);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      window.location.href = "/login";
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-white to-[#F5F7FA]">
      <Navigation user={user} />
      
      <div className="flex">
        {/* Enhanced Sidebar */}
        <aside className="w-80 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 shadow-lg">
          <div className="h-full p-6 space-y-6 overflow-y-auto">
            
            {/* Enhanced User Profile Card */}
            <div className="bg-gradient-to-br from-[#004E9E] to-[#007BFF] rounded-2xl p-6 text-white relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
              <div className="relative z-10">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{user.name}</h3>
                    <p className="text-blue-100 capitalize font-medium">{user.role.replace('-', ' ')}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/20">
                    <div className="text-2xl font-bold">87%</div>
                    <div className="text-sm text-blue-100">Performance</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/20">
                    <div className="text-2xl font-bold">6/8</div>
                    <div className="text-sm text-blue-100">Goals</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h4>
              <button className="w-full flex items-center space-x-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-blue-200 group">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <ClockIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900">Review Objectives</p>
                  <p className="text-sm text-gray-500">Update progress</p>
                </div>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          
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
                <PerformanceCard
                  key={index}
                  title={kpi.title}
                  value={kpi.value}
                  change={kpi.change}
                  icon={kpi.icon}
                  trend="up"
                />
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
                            <stop offset="0%" stopColor="#004E9E" stopOpacity="0.3"/>
                            <stop offset="50%" stopColor="#007BFF" stopOpacity="0.2"/>
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
                          className="animate-pulse"
                        />
                        
                        {/* Main Performance Line */}
                        <path
                          d="M40,220 Q100,180 150,160 T250,140 T360,120"
                          stroke="url(#lineGradient)"
                          strokeWidth="4"
                          fill="none"
                          strokeLinecap="round"
                          className="animate-pulse"
                        />
                        
                        {/* Performance Data Points */}
                        <g className="performance-points">
                          <circle cx="40" cy="220" r="8" fill="#004E9E" className="animate-bounce" style={{animationDelay: '0.1s'}}>
                            <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite"/>
                          </circle>
                          <circle cx="150" cy="160" r="8" fill="#007BFF" className="animate-bounce" style={{animationDelay: '0.3s'}}>
                            <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite"/>
                          </circle>
                          <circle cx="250" cy="140" r="8" fill="#004E9E" className="animate-bounce" style={{animationDelay: '0.5s'}}>
                            <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite"/>
                          </circle>
                          <circle cx="360" cy="120" r="8" fill="#007BFF" className="animate-bounce" style={{animationDelay: '0.7s'}}>
                            <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite"/>
                          </circle>
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
                      <ObjectiveCard
                        key={objective.id}
                        title={objective.title}
                        description={objective.description}
                        progress={(objective.current / objective.target) * 100}
                        status={objective.status}
                        dueDate={objective.dueDate}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="space-y-6">
                
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
        </main>
      </div>
    </div>
  );
}
