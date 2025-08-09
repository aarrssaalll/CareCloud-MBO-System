"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface PerformanceData {
  quarter: string;
  score: number;
  bonus: number;
  objectives: number;
  ranking: number;
}

interface QuarterlyMetrics {
  quarter: string;
  totalObjectives: number;
  completedObjectives: number;
  avgScore: number;
  bonusEligible: boolean;
  bonusAmount: number;
  feedback: string;
}

export default function PerformancePage() {
  const [selectedPeriod, setSelectedPeriod] = useState("2024");
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

  // Sample performance data
  const performanceHistory: PerformanceData[] = [
    { quarter: "Q1 2023", score: 82, bonus: 1850, objectives: 6, ranking: 15 },
    { quarter: "Q2 2023", score: 78, bonus: 1650, objectives: 6, ranking: 22 },
    { quarter: "Q3 2023", score: 85, bonus: 2100, objectives: 7, ranking: 12 },
    { quarter: "Q4 2023", score: 88, bonus: 2350, objectives: 6, ranking: 8 },
    { quarter: "Q1 2024", score: 84, bonus: 1950, objectives: 6, ranking: 14 },
    { quarter: "Q2 2024", score: 89, bonus: 2400, objectives: 7, ranking: 6 },
    { quarter: "Q3 2024", score: 91, bonus: 2650, objectives: 6, ranking: 4 },
    { quarter: "Q4 2024", score: 87, bonus: 2450, objectives: 6, ranking: 7 }
  ];

  const quarterlyDetails: QuarterlyMetrics[] = [
    {
      quarter: "Q4 2024",
      totalObjectives: 6,
      completedObjectives: 5,
      avgScore: 87,
      bonusEligible: true,
      bonusAmount: 2450,
      feedback: "Strong performance across customer satisfaction and training objectives. Continue focus on process improvement initiatives."
    },
    {
      quarter: "Q3 2024",
      totalObjectives: 6,
      completedObjectives: 6,
      avgScore: 91,
      bonusEligible: true,
      bonusAmount: 2650,
      feedback: "Exceptional quarter with all objectives met. Leadership in cross-functional projects particularly noteworthy."
    },
    {
      quarter: "Q2 2024",
      totalObjectives: 7,
      completedObjectives: 6,
      avgScore: 89,
      bonusEligible: true,
      bonusAmount: 2400,
      feedback: "Consistent high performance. Excellent mentorship contributions and knowledge sharing initiatives."
    },
    {
      quarter: "Q1 2024",
      totalObjectives: 6,
      completedObjectives: 5,
      avgScore: 84,
      bonusEligible: true,
      bonusAmount: 1950,
      feedback: "Good performance with room for improvement in process efficiency initiatives."
    }
  ];

  const currentQuarter = quarterlyDetails[0];

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getPerformanceBadge = (score: number) => {
    if (score >= 90) return { text: "Excellent", bg: "bg-green-100", color: "text-green-800" };
    if (score >= 80) return { text: "Good", bg: "bg-blue-100", color: "text-blue-800" };
    if (score >= 70) return { text: "Satisfactory", bg: "bg-yellow-100", color: "text-yellow-800" };
    return { text: "Needs Improvement", bg: "bg-red-100", color: "text-red-800" };
  };

  return (
    <div className="min-h-screen bg-accent-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text">Performance Analytics</h1>
              <p className="mt-2 text-text-light">Track your performance trends and bonus history</p>
            </div>
            <div className="flex space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="input-field w-40"
              >
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card bg-gradient-to-r from-primary to-primary-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Current Score</p>
                <p className="text-3xl font-bold">{currentQuarter.avgScore}/100</p>
                <p className="text-white/80 text-sm">Q4 2024</p>
              </div>
              <div className="text-4xl">�</div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-light text-sm">Current Ranking</p>
                <p className="text-3xl font-bold text-text">#7</p>
                <p className="text-green-600 text-sm">↑ 3 positions</p>
              </div>
              <div className="text-4xl">⭐</div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-light text-sm">Objectives Progress</p>
                <p className="text-3xl font-bold text-text">{currentQuarter.completedObjectives}/{currentQuarter.totalObjectives}</p>
                <p className="text-blue-600 text-sm">83% complete</p>
              </div>
              <div className="text-4xl">◯</div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-light text-sm">Estimated Bonus</p>
                <p className="text-3xl font-bold text-text">${currentQuarter.bonusAmount.toLocaleString()}</p>
                <p className="text-green-600 text-sm">Eligible</p>
              </div>
              <div className="text-4xl">$</div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Performance Trend Chart */}
          <div className="card">
            <h3 className="text-lg font-semibold text-text mb-4">Performance Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis domain={[60, 100]} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#004E9E" 
                  strokeWidth={3}
                  dot={{ fill: "#004E9E", strokeWidth: 2, r: 6 }}
                  name="Performance Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bonus History Chart */}
          <div className="card">
            <h3 className="text-lg font-semibold text-text mb-4">Bonus History</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Bonus Amount']} />
                <Legend />
                <Bar 
                  dataKey="bonus" 
                  fill="#007BFF" 
                  name="Bonus Amount ($)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quarterly Details */}
        <div className="card">
          <h3 className="text-lg font-semibold text-text mb-6">Quarterly Performance Details</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quarter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Objectives
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bonus
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Manager Feedback
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {quarterlyDetails.map((quarter, index) => {
                  const badge = getPerformanceBadge(quarter.avgScore);
                  return (
                    <tr key={quarter.quarter} className={index === 0 ? "bg-blue-50" : ""}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-text">{quarter.quarter}</span>
                          {index === 0 && (
                            <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-text">
                          {quarter.completedObjectives}/{quarter.totalObjectives}
                        </div>
                        <div className="text-xs text-text-light">
                          {Math.round((quarter.completedObjectives / quarter.totalObjectives) * 100)}% Complete
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-lg font-semibold ${getPerformanceColor(quarter.avgScore)}`}>
                          {quarter.avgScore}/100
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-text">
                          ${quarter.bonusAmount.toLocaleString()}
                        </div>
                        <div className="text-xs text-text-light">
                          {quarter.bonusEligible ? "Eligible" : "Not Eligible"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.bg} ${badge.color}`}>
                          {badge.text}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-text-light max-w-xs">
                          {quarter.feedback}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Strengths */}
          <div className="card">
            <h4 className="font-semibold text-text mb-4 flex items-center">
              <span className="text-green-600 mr-2">+</span>
              Key Strengths
            </h4>
            <ul className="space-y-2 text-sm text-text-light">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                Consistent customer satisfaction scores above 85%
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                Strong leadership in cross-functional projects
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                Excellent knowledge sharing and mentorship
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                Proactive professional development
              </li>
            </ul>
          </div>

          {/* Areas for Improvement */}
          <div className="card">
            <h4 className="font-semibold text-text mb-4 flex items-center">
              <span className="text-yellow-600 mr-2">↗</span>
              Growth Areas
            </h4>
            <ul className="space-y-2 text-sm text-text-light">
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                Process improvement implementation speed
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                Quantitative objective achievement consistency
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                Technical skill advancement in emerging technologies
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                Strategic thinking and long-term planning
              </li>
            </ul>
          </div>

          {/* Goals & Recommendations */}
          <div className="card">
            <h4 className="font-semibold text-text mb-4 flex items-center">
              <span className="text-blue-600 mr-2">→</span>
              Next Quarter Goals
            </h4>
            <ul className="space-y-2 text-sm text-text-light">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                Target 92+ performance score in Q1 2025
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                Lead one major process automation initiative
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                Complete advanced technical certification
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                Mentor additional team member
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
