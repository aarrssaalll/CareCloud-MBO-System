"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import {
  DocumentTextIcon,
  ChartBarIcon,
  UserGroupIcon,
  TrophyIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";

export default function ManagerReportsPage() {
  const [user, setUser] = useState<any>(null);
  const [selectedReport, setSelectedReport] = useState("team-performance");
  const [dateRange, setDateRange] = useState("current-quarter");
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  const reportTypes = [
    {
      id: "team-performance",
      name: "Team Performance Overview",
      description: "Comprehensive analysis of team member performance and objectives",
      icon: ChartBarIcon
    },
    {
      id: "objective-progress",
      name: "Objective Progress Report",
      description: "Detailed tracking of team objective completion rates",
      icon: TrophyIcon
    },
    {
      id: "individual-assessments",
      name: "Individual Assessments",
      description: "Detailed performance assessments for each team member",
      icon: UserGroupIcon
    },
    {
      id: "quarterly-summary",
      name: "Quarterly Summary",
      description: "High-level summary of team achievements and areas for improvement",
      icon: CalendarIcon
    }
  ];

  const mockTeamData = [
    { name: "John Doe", position: "Senior Developer", score: 85, objectives: 4, completed: 3 },
    { name: "Alice Johnson", position: "Product Manager", score: 92, objectives: 5, completed: 4 },
    { name: "Bob Smith", position: "QA Engineer", score: 78, objectives: 3, completed: 2 },
    { name: "Carol White", position: "UX Designer", score: 88, objectives: 4, completed: 4 }
  ];

  const generateReport = () => {
    alert(`Generating ${reportTypes.find(r => r.id === selectedReport)?.name} for ${dateRange}...`);
  };

  const exportReport = () => {
    alert("Exporting report as PDF...");
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manager Reports</h1>
          <p className="text-gray-600 mt-2">Generate detailed reports on team performance and objectives</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Report Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Configuration</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                  <select
                    value={selectedReport}
                    onChange={(e) => setSelectedReport(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    {reportTypes.map(report => (
                      <option key={report.id} value={report.id}>{report.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="current-quarter">Current Quarter</option>
                    <option value="last-quarter">Last Quarter</option>
                    <option value="current-year">Current Year</option>
                    <option value="last-year">Last Year</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>

                <div className="space-y-2 pt-4">
                  <button
                    onClick={generateReport}
                    className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center space-x-2"
                  >
                    <DocumentTextIcon className="w-4 h-4" />
                    <span>Generate Report</span>
                  </button>
                  <button
                    onClick={exportReport}
                    className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    <span>Export as PDF</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Report Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {reportTypes.find(r => r.id === selectedReport)?.name}
                </h3>
                <span className="text-sm text-gray-500">Generated: {new Date().toLocaleDateString()}</span>
              </div>

              {selectedReport === "team-performance" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-800">Team Average Score</h4>
                      <p className="text-2xl font-bold text-blue-900 mt-1">85.8</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-green-800">Objectives Completed</h4>
                      <p className="text-2xl font-bold text-green-900 mt-1">13/16</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-yellow-800">Team Members</h4>
                      <p className="text-2xl font-bold text-yellow-900 mt-1">4</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-4">Individual Performance</h4>
                    <div className="space-y-3">
                      {mockTeamData.map((member, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div>
                            <h5 className="font-medium text-gray-900">{member.name}</h5>
                            <p className="text-sm text-gray-600">{member.position}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">Score: {member.score}/100</p>
                            <p className="text-sm text-gray-600">Objectives: {member.completed}/{member.objectives}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {selectedReport === "objective-progress" && (
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900">Objective Progress Analysis</h4>
                    <p className="text-gray-600">Detailed tracking and analytics would be displayed here</p>
                  </div>
                </div>
              )}

              {selectedReport === "individual-assessments" && (
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900">Individual Assessment Reports</h4>
                    <p className="text-gray-600">Detailed individual performance assessments would be displayed here</p>
                  </div>
                </div>
              )}

              {selectedReport === "quarterly-summary" && (
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900">Quarterly Summary Report</h4>
                    <p className="text-gray-600">High-level quarterly achievements and insights would be displayed here</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
