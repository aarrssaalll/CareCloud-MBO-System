"use client";

import { useState, useEffect } from "react";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("mbo_user") || localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      loadPerformanceData(parsedUser.id);
    } else {
      // Redirect to login if no user data
      window.location.href = "/login";
    }
  }, []);

  const loadPerformanceData = async (userId: string) => {
    try {
      setLoading(true);
      
      // Load bonus history
      const bonusResponse = await fetch(`/api/mbo/bonus/history?userId=${userId}`);
      const bonusResult = await bonusResponse.json();
      
      // Load objectives data
      const objectivesResponse = await fetch(`/api/employee/objectives?userId=${userId}`);
      const objectivesResult = await objectivesResponse.json();
      
      if (bonusResult.success && bonusResult.bonuses && bonusResult.bonuses.length > 0) {
        // Transform bonus data to performance history format
        const transformedHistory = bonusResult.bonuses.map((bonus: any) => ({
          quarter: `${bonus.quarter} ${bonus.year}`,
          score: Math.round(bonus.performanceMultiplier * 100) || 0,
          bonus: bonus.finalAmount || 0,
          objectives: 0, // Will be calculated from objectives data
          ranking: 0 // Not available in current data structure
        }));
        
        setPerformanceHistory(transformedHistory);
        
        // Transform to quarterly details format
        const transformedDetails = bonusResult.bonuses.map((bonus: any) => ({
          quarter: `${bonus.quarter} ${bonus.year}`,
          totalObjectives: 0, // Will be calculated
          completedObjectives: 0, // Will be calculated
          avgScore: Math.round(bonus.performanceMultiplier * 100) || 0,
          bonusEligible: bonus.status === 'APPROVED' || bonus.status === 'CALCULATED',
          bonusAmount: bonus.finalAmount || 0,
          feedback: `Performance evaluation for ${bonus.quarter} ${bonus.year}. Status: ${bonus.status}`
        }));
        
        setQuarterlyDetails(transformedDetails);
      } else {
        // No bonus data available - show empty state
        setPerformanceHistory([]);
        setQuarterlyDetails([]);
      }
      
    } catch (error) {
      console.error('Error loading performance data:', error);
      // Set empty arrays on error
      setPerformanceHistory([]);
      setQuarterlyDetails([]);
    } finally {
      setLoading(false);
    }
  };

  // Initialize empty performance data - will be loaded from database
  const [performanceHistory, setPerformanceHistory] = useState<PerformanceData[]>([]);

  // Initialize empty quarterly details - will be loaded from database
  const [quarterlyDetails, setQuarterlyDetails] = useState<QuarterlyMetrics[]>([]);

  const currentQuarter = quarterlyDetails[0] || {
    quarter: "Q1 2025",
    totalObjectives: 0,
    completedObjectives: 0,
    avgScore: 0,
    bonusEligible: false,
    bonusAmount: 0,
    feedback: "No performance data available yet."
  };

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
    <div className="min-h-screen bg-gray-50">
      {/* Unified Header Section */}
      <div className="bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col py-6">
            <h1 className="text-3xl font-bold text-[#333333] mb-1">Performance</h1>
            <p className="text-gray-500 text-base max-w-2xl">Track your performance trends, bonus history, and quarterly analytics. Review your progress and see how your efforts contribute to your success at CareCloud.</p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="ms-card p-6 bg-gradient-to-r from-[#004E9E] to-[#007BFF] text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Current Score</p>
                <p className="text-3xl font-bold">{currentQuarter.avgScore}/100</p>
                <p className="text-white/80 text-sm">Q4 2024</p>
              </div>
              <div className="text-4xl">★</div>
            </div>
          </div>

          <div className="ms-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-light text-sm">Current Ranking</p>
                <p className="text-3xl font-bold text-text">N/A</p>
                <p className="text-gray-500 text-sm">No ranking data</p>
              </div>
              <div className="text-4xl">⭐</div>
            </div>
          </div>

          <div className="ms-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-light text-sm">Objectives Progress</p>
                <p className="text-3xl font-bold text-text">{currentQuarter.completedObjectives}/{currentQuarter.totalObjectives}</p>
                <p className="text-blue-600 text-sm">
                  {currentQuarter.totalObjectives > 0 
                    ? `${Math.round((currentQuarter.completedObjectives / currentQuarter.totalObjectives) * 100)}% complete`
                    : 'No objectives yet'
                  }
                </p>
              </div>
              <div className="text-4xl">◯</div>
            </div>
          </div>

          <div className="ms-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-light text-sm">Current Bonus</p>
                <p className="text-3xl font-bold text-text">${currentQuarter.bonusAmount.toLocaleString()}</p>
                <p className={`text-sm ${currentQuarter.bonusEligible ? 'text-green-600' : 'text-gray-500'}`}>
                  {currentQuarter.bonusAmount > 0 ? (currentQuarter.bonusEligible ? 'Approved' : 'Calculated') : 'No bonus yet'}
                </p>
              </div>
              <div className="text-4xl">$</div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Performance Trend Chart */}
          <div className="ms-card p-6">
            <h3 className="text-lg font-semibold text-text mb-4">Performance Trend</h3>
            {loading ? (
              <div className="flex items-center justify-center h-[300px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004E9E]"></div>
              </div>
            ) : performanceHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quarter" />
                  <YAxis domain={[0, 100]} />
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
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <p>No performance data available</p>
                  <p className="text-sm">Complete some objectives to see your trends</p>
                </div>
              </div>
            )}
          </div>

          {/* Bonus History Chart */}
          <div className="ms-card p-6">
            <h3 className="text-lg font-semibold text-text mb-4">Bonus History</h3>
            {loading ? (
              <div className="flex items-center justify-center h-[300px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004E9E]"></div>
              </div>
            ) : performanceHistory.length > 0 ? (
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
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <div className="text-center">
                  <div className="text-4xl mb-2">💰</div>
                  <p>No bonus history available</p>
                  <p className="text-sm">Bonuses will appear here once awarded</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quarterly Details */}
        <div className="ms-card p-6">
          <h3 className="text-lg font-semibold text-text mb-6">Quarterly Performance Details</h3>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004E9E]"></div>
              <span className="ml-3 text-gray-600">Loading performance data...</span>
            </div>
          ) : quarterlyDetails.length > 0 ? (
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
                                Recent
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-text">
                            {quarter.completedObjectives}/{quarter.totalObjectives}
                          </div>
                          <div className="text-xs text-text-light">
                            {quarter.totalObjectives > 0 
                              ? `${Math.round((quarter.completedObjectives / quarter.totalObjectives) * 100)}% Complete`
                              : 'N/A'
                            }
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
                            {quarter.bonusAmount > 0 ? (quarter.bonusEligible ? "Approved" : "Calculated") : "No bonus"}
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
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">📋</div>
              <h4 className="text-lg font-medium mb-2">No Performance Data Yet</h4>
              <p className="text-sm">Your quarterly performance details will appear here once you have:</p>
              <ul className="text-sm mt-3 space-y-1">
                <li>• Completed some objectives</li>
                <li>• Received manager reviews</li>
                <li>• Had bonus calculations processed</li>
              </ul>
            </div>
          )}
        </div>

        {/* Performance Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Strengths */}
          <div className="ms-card p-6">
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
          <div className="ms-card p-6">
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
          <div className="ms-card p-6">
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
