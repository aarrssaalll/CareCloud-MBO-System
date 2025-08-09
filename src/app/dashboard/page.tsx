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
    <div className="min-h-screen ms-surface bg-ms-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="ms-text-xxlarge font-semibold text-ms-gray-900">
            Good morning, {user.name.split(' ')[0]}
          </h1>
          <p className="ms-text-medium text-ms-gray-600 mt-2">
            Here's an overview of your performance and objectives
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="ms-card p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-ms-gray-100">
                <ChartBarIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex items-center space-x-1 ms-text-small text-green-600">
                <ArrowUpIcon className="w-4 h-4" />
                <span className="font-medium">5.2%</span>
              </div>
            </div>
            <div>
              <p className="ms-text-xlarge font-semibold text-ms-gray-900 mb-1">87%</p>
              <p className="ms-text-small text-ms-gray-600">Overall Performance</p>
            </div>
          </div>

          <div className="ms-card p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-ms-gray-100">
                <TrophyIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex items-center space-x-1 ms-text-small text-green-600">
                <ArrowUpIcon className="w-4 h-4" />
                <span className="font-medium">12.5%</span>
              </div>
            </div>
            <div>
              <p className="ms-text-xlarge font-semibold text-ms-gray-900 mb-1">6/8</p>
              <p className="ms-text-small text-ms-gray-600">Objectives Progress</p>
            </div>
          </div>

          <div className="ms-card p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-ms-gray-100">
                <CurrencyDollarIcon className="w-6 h-6 text-ms-blue" />
              </div>
              <div className="flex items-center space-x-1 ms-text-small text-green-600">
                <ArrowUpIcon className="w-4 h-4" />
                <span className="font-medium">8.3%</span>
              </div>
            </div>
            <div>
              <p className="ms-text-xlarge font-semibold text-ms-gray-900 mb-1">$4,250</p>
              <p className="ms-text-small text-ms-gray-600">Quarterly Bonus</p>
            </div>
          </div>

          {(user.role === "manager" || user.role === "senior_management") && (
            <div className="ms-card p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-ms-gray-100">
                  <UsersIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex items-center space-x-1 ms-text-small text-green-600">
                  <ArrowUpIcon className="w-4 h-4" />
                  <span className="font-medium">3.1%</span>
                </div>
              </div>
              <div>
                <p className="ms-text-xlarge font-semibold text-ms-gray-900 mb-1">92%</p>
                <p className="ms-text-small text-ms-gray-600">Team Performance</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Objectives */}
          <div className="lg:col-span-2">
            <div className="ms-card">
              <div className="p-6 border-b border-ms-gray-200">
                <h2 className="ms-text-large font-semibold text-ms-gray-900">Current Objectives</h2>
                <p className="ms-text-small text-ms-gray-600 mt-1">Track your progress on key objectives</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="border border-ms-gray-200 rounded-lg p-5 hover:shadow-sm transition-shadow">
                  <div className="flex items-center space-x-3 mb-2">
                    <ClockIcon className="w-5 h-5 text-blue-500" />
                    <h3 className="ms-text-medium font-semibold text-ms-gray-900">Q4 Revenue Target</h3>
                    <span className="px-3 py-1 rounded-full ms-text-xsmall font-medium border bg-blue-100 text-blue-800 border-blue-200">
                      ON TRACK
                    </span>
                  </div>
                  <p className="ms-text-small text-ms-gray-600 mb-3">Achieve 15% increase in quarterly revenue</p>
                  <div className="flex items-center justify-between ms-text-small mb-3">
                    <span className="text-ms-gray-600">Progress: 98% of 115%</span>
                    <span className="text-ms-gray-600">Due: 12/31/2024</span>
                  </div>
                  <div className="w-full bg-ms-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: "85%" }}></div>
                  </div>
                </div>

                <div className="border border-ms-gray-200 rounded-lg p-5 hover:shadow-sm transition-shadow">
                  <div className="flex items-center space-x-3 mb-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    <h3 className="ms-text-medium font-semibold text-ms-gray-900">Customer Satisfaction</h3>
                    <span className="px-3 py-1 rounded-full ms-text-xsmall font-medium border bg-green-100 text-green-800 border-green-200">
                      COMPLETED
                    </span>
                  </div>
                  <p className="ms-text-small text-ms-gray-600 mb-3">Maintain NPS score above 85</p>
                  <div className="flex items-center justify-between ms-text-small mb-3">
                    <span className="text-ms-gray-600">Progress: 88% of 85%</span>
                    <span className="text-ms-gray-600">Due: 12/15/2024</span>
                  </div>
                  <div className="w-full bg-ms-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full transition-all duration-300" style={{ width: "100%" }}></div>
                  </div>
                </div>

                <div className="border border-ms-gray-200 rounded-lg p-5 hover:shadow-sm transition-shadow">
                  <div className="flex items-center space-x-3 mb-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
                    <h3 className="ms-text-medium font-semibold text-ms-gray-900">Process Optimization</h3>
                    <span className="px-3 py-1 rounded-full ms-text-xsmall font-medium border bg-amber-100 text-amber-800 border-amber-200">
                      AT RISK
                    </span>
                  </div>
                  <p className="ms-text-small text-ms-gray-600 mb-3">Reduce operational costs by 10%</p>
                  <div className="flex items-center justify-between ms-text-small mb-3">
                    <span className="text-ms-gray-600">Progress: 75% of 90%</span>
                    <span className="text-ms-gray-600">Due: 11/30/2024</span>
                  </div>
                  <div className="w-full bg-ms-gray-200 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full transition-all duration-300" style={{ width: "83%" }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="ms-card">
              <div className="p-6 border-b border-ms-gray-200">
                <h2 className="ms-text-large font-semibold text-ms-gray-900">Quick Actions</h2>
              </div>
              <div className="p-6 space-y-3">
                <button className="ms-button-secondary w-full text-left p-4">
                  <div className="flex items-center space-x-3">
                    <TrophyIcon className="w-5 h-5 text-ms-blue" />
                    <span className="ms-text-medium font-medium text-ms-gray-900">Update Objective</span>
                  </div>
                </button>
                <button className="ms-button-secondary w-full text-left p-4">
                  <div className="flex items-center space-x-3">
                    <ChartBarIcon className="w-5 h-5 text-ms-blue" />
                    <span className="ms-text-medium font-medium text-ms-gray-900">View Analytics</span>
                  </div>
                </button>
                <button className="ms-button-secondary w-full text-left p-4">
                  <div className="flex items-center space-x-3">
                    <CurrencyDollarIcon className="w-5 h-5 text-ms-blue" />
                    <span className="ms-text-medium font-medium text-ms-gray-900">Bonus Calculator</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="ms-card">
              <div className="p-6 border-b border-ms-gray-200">
                <h2 className="ms-text-large font-semibold text-ms-gray-900">Recent Activity</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="ms-text-small font-medium text-ms-gray-900">Objective completed</p>
                    <p className="ms-text-xsmall text-ms-gray-600">Customer Satisfaction target achieved</p>
                    <p className="ms-text-xsmall text-ms-gray-600">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="ms-text-small font-medium text-ms-gray-900">Performance review scheduled</p>
                    <p className="ms-text-xsmall text-ms-gray-600">Q4 review with manager</p>
                    <p className="ms-text-xsmall text-ms-gray-600">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                  <div>
                    <p className="ms-text-small font-medium text-ms-gray-900">Bonus calculation updated</p>
                    <p className="ms-text-xsmall text-ms-gray-600">Q3 bonus processed</p>
                    <p className="ms-text-xsmall text-ms-gray-600">3 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
