"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import {
  ChartBarIcon,
  TrophyIcon,
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

interface User {
  name: string;
  email: string;
  role: "employee" | "manager" | "hr" | "senior_management";
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
  const [user, setUser] = useState({
    name: "Guest",
    role: "employee" as const,
    email: "guest@carecloud.com"
  });

  // Mock objectives data
  const mockObjectives = [
    {
      title: "Q4 Revenue Target",
      description: "Achieve 15% increase in quarterly revenue through strategic initiatives and client expansion",
      progress: 85,
      status: "In Progress"
    },
    {
      title: "Customer Satisfaction",
      description: "Maintain NPS score above 85 through improved service delivery and support",
      progress: 100,
      status: "Completed"
    },
    {
      title: "Process Optimization",
      description: "Reduce operational costs by 10% through automation and efficiency improvements",
      progress: 76,
      status: "At Risk"
    },
    {
      title: "Team Development",
      description: "Complete leadership training program and mentor 2 junior team members",
      progress: 65,
      status: "In Progress"
    },
    {
      title: "Innovation Initiative",
      description: "Launch new product feature that increases user engagement by 20%",
      progress: 45,
      status: "In Progress"
    }
  ];

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      // Redirect to login if no user data
      window.location.href = "/login";
    }
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Navigation />
      
      {/* Main Content Area - Full Screen Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar - Quick Stats & Navigation */}
        <aside className="w-80 bg-white/90 backdrop-blur-xl border-r border-gray-200 shadow-sm">
          <div className="h-full p-6 space-y-6 overflow-y-auto">
            
            {/* User Profile Card */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative z-10">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{user.name}</h3>
                    <p className="text-white/80 capitalize">{user.role.replace('-', ' ')}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                    <div className="text-2xl font-bold">87%</div>
                    <div className="text-sm text-white/80">Performance</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                    <div className="text-2xl font-bold">6/8</div>
                    <div className="text-sm text-white/80">Goals</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h4>
              <button className="w-full flex items-center space-x-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-blue-200 group">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <span className="text-gray-900 font-medium">Add New Objective</span>
              </button>
              
              <button className="w-full flex items-center space-x-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-green-200 group">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <span className="text-gray-900 font-medium">Update Progress</span>
              </button>
              
              <button className="w-full flex items-center space-x-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-purple-200 group">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 17v-2.34c0-.22.04-.44.12-.64.09-.2.23-.37.42-.53.19-.15.42-.24.69-.26.26-.02.52.02.76.15l.38.22c.44-.06.89-.06 1.33 0l.38-.22c.24-.13.5-.17.76-.15.27.02.5.11.69.26.19.16.33.33.42.53.08.2.12.42.12.64V17c0 .55-.2 1.02-.59 1.41-.39.39-.86.59-1.41.59H10c-.55 0-1.02-.2-1.41-.59C8.2 18.02 8 17.55 8 17zm5-2c.83 0 1.5-.67 1.5-1.5S13.83 12 13 12s-1.5.67-1.5 1.5S12.17 15 13 15z"/>
                  </svg>
                </div>
                <span className="text-gray-900 font-medium">Generate Report</span>
              </button>
            </div>

            {/* Recent Activity */}
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h4>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-100">
                  <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">Objective completed</p>
                    <p className="text-xs text-gray-500">Customer satisfaction target achieved</p>
                    <p className="text-xs text-gray-400">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-100">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">Review scheduled</p>
                    <p className="text-xs text-gray-500">Q4 performance review</p>
                    <p className="text-xs text-gray-400">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-100">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">Bonus calculated</p>
                    <p className="text-xs text-gray-500">Q3 bonus processed</p>
                    <p className="text-xs text-gray-400">3 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          
          {/* Header Section */}
          <div className="bg-white/90 backdrop-blur-xl border-b border-gray-200 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Good morning, {user.name.split(' ')[0]} 👋
                </h1>
                <p className="text-gray-600">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl shadow-sm">
                  <div className="text-2xl font-bold">$4,250</div>
                  <div className="text-sm opacity-90">Current Bonus</div>
                </div>
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl shadow-sm">
                  <div className="text-2xl font-bold">87%</div>
                  <div className="text-sm opacity-90">Performance</div>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              
              {/* Performance Card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ChartBarIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-green-600 font-semibold flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7 14l5-5 5 5z"/>
                      </svg>
                      +5.2%
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="text-3xl font-bold text-gray-900 mb-1">87%</div>
                  <div className="text-gray-600">Overall Performance</div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500" style={{ width: "87%" }}></div>
                </div>
              </div>

              {/* Objectives Card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <TrophyIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-blue-600 font-semibold flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7 14l5-5 5 5z"/>
                      </svg>
                      +12.5%
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="text-3xl font-bold text-gray-900 mb-1">6/8</div>
                  <div className="text-gray-600">Objectives Progress</div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: "75%" }}></div>
                </div>
              </div>

              {/* Bonus Card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <CurrencyDollarIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-orange-600 font-semibold flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7 14l5-5 5 5z"/>
                      </svg>
                      +8.3%
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="text-3xl font-bold text-gray-900 mb-1">$4,250</div>
                  <div className="text-gray-600">Quarterly Bonus</div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-600 h-2 rounded-full transition-all duration-500" style={{ width: "85%" }}></div>
                </div>
              </div>

              {/* Team Performance (for managers) */}
              {(user.role === "manager" || user.role === "senior_management") && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <UsersIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-purple-600 font-semibold flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M7 14l5-5 5 5z"/>
                        </svg>
                        +3.1%
                      </div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="text-3xl font-bold text-gray-900 mb-1">92%</div>
                    <div className="text-gray-600">Team Performance</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500" style={{ width: "92%" }}></div>
                  </div>
                </div>
              )}
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              
              {/* Performance Analytics - Left Column */}
              <div className="xl:col-span-2 space-y-8">
                
                {/* Performance Chart */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">Performance Trend</h3>
                    <div className="flex items-center space-x-3">
                      <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                        This Quarter
                      </button>
                      <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        This Year
                      </button>
                    </div>
                  </div>
                  
                  {/* Mock Chart Area with Grid */}
                  <div className="h-80 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-gray-200/50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                    
                    {/* Chart Lines */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 300">
                      <defs>
                        <linearGradient id="performanceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3"/>
                          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0"/>
                        </linearGradient>
                      </defs>
                      
                      {/* Performance Line */}
                      <path
                        d="M50,200 Q100,150 150,120 T250,100 T350,80"
                        stroke="#3B82F6"
                        strokeWidth="4"
                        fill="none"
                        strokeLinecap="round"
                        className="animate-pulse"
                      />
                      
                      {/* Area under curve */}
                      <path
                        d="M50,200 Q100,150 150,120 T250,100 T350,80 L350,280 L50,280 Z"
                        fill="url(#performanceGradient)"
                      />
                      
                      {/* Data Points */}
                      <circle cx="50" cy="200" r="6" fill="#3B82F6" className="animate-bounce" style={{animationDelay: '0.1s'}}/>
                      <circle cx="150" cy="120" r="6" fill="#3B82F6" className="animate-bounce" style={{animationDelay: '0.3s'}}/>
                      <circle cx="250" cy="100" r="6" fill="#3B82F6" className="animate-bounce" style={{animationDelay: '0.5s'}}/>
                      <circle cx="350" cy="80" r="6" fill="#3B82F6" className="animate-bounce" style={{animationDelay: '0.7s'}}/>
                    </svg>
                    
                    {/* Chart Labels */}
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between text-sm text-gray-600">
                      <span>Jan</span>
                      <span>Feb</span>
                      <span>Mar</span>
                      <span>Apr</span>
                    </div>
                    
                    {/* Chart Stats */}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-sm">
                      <div className="text-2xl font-bold text-green-600">+15.2%</div>
                      <div className="text-sm text-gray-600">Growth Rate</div>
                    </div>
                  </div>
                </div>

                {/* Objective Breakdown */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Objective Breakdown</h3>
                  <div className="space-y-6">
                    
                    <div className="group">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-lg font-medium text-gray-700">Customer Satisfaction</span>
                        </div>
                        <span className="text-xl font-bold text-green-600">95%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-1000 group-hover:shadow-lg" style={{ width: "95%" }}></div>
                      </div>
                    </div>
                    
                    <div className="group">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="text-lg font-medium text-gray-700">Revenue Growth</span>
                        </div>
                        <span className="text-xl font-bold text-blue-600">82%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-1000 group-hover:shadow-lg" style={{ width: "82%" }}></div>
                      </div>
                    </div>
                    
                    <div className="group">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <span className="text-lg font-medium text-gray-700">Team Efficiency</span>
                        </div>
                        <span className="text-xl font-bold text-purple-600">88%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-1000 group-hover:shadow-lg" style={{ width: "88%" }}></div>
                      </div>
                    </div>

                    <div className="group">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                          <span className="text-lg font-medium text-gray-700">Innovation Score</span>
                        </div>
                        <span className="text-xl font-bold text-orange-600">76%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-1000 group-hover:shadow-lg" style={{ width: "76%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Current Objectives */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">Current Objectives</h3>
                    <button className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg">
                      Add New Objective
                    </button>
                  </div>
                  <div className="space-y-6">
                    {mockObjectives.map((objective, index) => (
                      <div key={index} className="border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                              {objective.title}
                            </h4>
                            <p className="text-gray-600 leading-relaxed">
                              {objective.description}
                            </p>
                          </div>
                          <span className={`px-4 py-2 rounded-xl text-sm font-semibold ml-4 ${
                            objective.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            objective.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {objective.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex-1 mr-6">
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-1000 group-hover:shadow-lg" 
                                style={{ width: `${objective.progress}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className="text-lg font-bold text-gray-900">
                            {objective.progress}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Sidebar - Analytics & Insights */}
              <div className="space-y-8">
                
                {/* Performance Insights */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Performance Insights</h3>
                  
                  {/* Circular Progress */}
                  <div className="relative w-48 h-48 mx-auto mb-6">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="#E5E7EB"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="url(#circularGradient)"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray="283"
                        strokeDashoffset="37"
                        className="transition-all duration-1000"
                      />
                      <defs>
                        <linearGradient id="circularGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#3B82F6"/>
                          <stop offset="100%" stopColor="#8B5CF6"/>
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900">87%</div>
                        <div className="text-sm text-gray-600">Overall Score</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-green-700 font-medium">Strong Areas</span>
                      <span className="text-green-600 font-bold">4</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <span className="text-yellow-700 font-medium">Improvement Areas</span>
                      <span className="text-yellow-600 font-bold">2</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-blue-700 font-medium">Next Reviews</span>
                      <span className="text-blue-600 font-bold">3</span>
                    </div>
                  </div>
                </div>

                {/* Upcoming Deadlines */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Upcoming Deadlines</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 p-4 bg-red-50 rounded-xl border border-red-200">
                      <div className="w-4 h-4 bg-red-500 rounded-full flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="font-semibold text-red-800">Q4 Review</p>
                        <p className="text-sm text-red-600">Due in 3 days</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 p-4 bg-orange-50 rounded-xl border border-orange-200">
                      <div className="w-4 h-4 bg-orange-500 rounded-full flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="font-semibold text-orange-800">Team Goals</p>
                        <p className="text-sm text-orange-600">Due in 1 week</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="font-semibold text-blue-800">Annual Planning</p>
                        <p className="text-sm text-blue-600">Due in 2 weeks</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Team Leaderboard (for managers) */}
                {(user.role === "manager" || user.role === "senior_management") && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Team Leaderboard</h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">Sarah Johnson</p>
                          <p className="text-sm text-gray-600">95% completion</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-yellow-600">$5,200</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold">2</div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">Mike Chen</p>
                          <p className="text-sm text-gray-600">89% completion</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-600">$4,100</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 p-4 bg-orange-50 rounded-xl border border-orange-200">
                        <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center text-white font-bold">3</div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">Lisa Wong</p>
                          <p className="text-sm text-gray-600">87% completion</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-orange-600">$4,250</p>
                        </div>
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
