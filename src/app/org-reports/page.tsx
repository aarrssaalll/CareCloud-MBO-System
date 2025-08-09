"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import {
  DocumentArrowDownIcon,
  PrinterIcon,
  ShareIcon,
  CalendarIcon,
  UsersIcon,
  TrophyIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  DocumentTextIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

export default function OrgReportsPage() {
  const [user, setUser] = useState<any>(null);
  const [selectedReport, setSelectedReport] = useState("quarterly");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("Q4-2024");
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  if (!user) return <div>Loading...</div>;

  // Report Types
  const reportTypes = [
    { id: "quarterly", name: "Quarterly Performance", icon: CalendarIcon },
    { id: "department", name: "Department Analysis", icon: UsersIcon },
    { id: "individual", name: "Individual Performance", icon: TrophyIcon },
    { id: "bonus", name: "Bonus Distribution", icon: CurrencyDollarIcon },
    { id: "trends", name: "Performance Trends", icon: ChartBarIcon },
  ];

  // Sample Data
  const quarterlyData = [
    { department: "Sales", q1: 85, q2: 88, q3: 91, q4: 87, employees: 45, totalBonus: 125000 },
    { department: "Marketing", q1: 82, q2: 85, q3: 89, q4: 85, employees: 28, totalBonus: 84000 },
    { department: "Engineering", q1: 88, q2: 89, q3: 87, q4: 89, employees: 67, totalBonus: 201000 },
    { department: "Customer Success", q1: 91, q2: 93, q3: 95, q4: 94, employees: 32, totalBonus: 96000 },
    { department: "HR", q1: 79, q2: 81, q3: 83, q4: 81, employees: 15, totalBonus: 45000 },
    { department: "Finance", q1: 84, q2: 86, q3: 88, q4: 86, employees: 22, totalBonus: 66000 },
  ];

  const individualPerformance = [
    { name: "Sarah Wilson", department: "Leadership", score: 95, bonus: 15000, objectives: 5, completed: 5 },
    { name: "John Doe", department: "Sales", score: 92, bonus: 8500, objectives: 5, completed: 4 },
    { name: "Jane Smith", department: "Management", score: 88, bonus: 7200, objectives: 6, completed: 5 },
    { name: "Mike Johnson", department: "HR", score: 85, bonus: 6800, objectives: 4, completed: 3 },
    { name: "Emily Davis", department: "Engineering", score: 91, bonus: 8200, objectives: 5, completed: 5 },
    { name: "David Brown", department: "Marketing", score: 87, bonus: 7000, objectives: 5, completed: 4 },
  ];

  const bonusDistribution = [
    { range: "$0-2K", count: 45, percentage: 22 },
    { range: "$2K-5K", count: 67, percentage: 33 },
    { range: "$5K-8K", count: 52, percentage: 25 },
    { range: "$8K-12K", count: 28, percentage: 14 },
    { range: "$12K+", count: 12, percentage: 6 },
  ];

  const trendData = [
    { month: "Jan", avgScore: 78, engagement: 82, completion: 75 },
    { month: "Feb", avgScore: 80, engagement: 84, completion: 78 },
    { month: "Mar", avgScore: 82, engagement: 85, completion: 80 },
    { month: "Apr", avgScore: 81, engagement: 86, completion: 79 },
    { month: "May", avgScore: 84, engagement: 88, completion: 82 },
    { month: "Jun", avgScore: 85, engagement: 89, completion: 84 },
    { month: "Jul", avgScore: 83, engagement: 87, completion: 81 },
    { month: "Aug", avgScore: 86, engagement: 90, completion: 85 },
    { month: "Sep", avgScore: 88, engagement: 91, completion: 87 },
    { month: "Oct", avgScore: 87, engagement: 90, completion: 86 },
    { month: "Nov", avgScore: 89, engagement: 92, completion: 88 },
    { month: "Dec", avgScore: 87, engagement: 91, completion: 84 },
  ];

  const COLORS = ['#004E9E', '#007BFF', '#10B981', '#F59E0B', '#EF4444'];

  const generateReport = () => {
    alert("Report generation initiated. You will receive an email when the report is ready for download.");
  };

  const exportData = () => {
    alert("Exporting data to CSV format...");
  };

  const renderQuarterlyReport = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-text-dark mb-6">Quarterly Performance Overview</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={quarterlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="department" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="q1" fill="#004E9E" name="Q1" />
            <Bar dataKey="q2" fill="#007BFF" name="Q2" />
            <Bar dataKey="q3" fill="#10B981" name="Q3" />
            <Bar dataKey="q4" fill="#F59E0B" name="Q4" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-text-dark mb-6">Department Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-3 text-sm font-semibold text-text-light uppercase tracking-wide">Department</th>
                <th className="pb-3 text-sm font-semibold text-text-light uppercase tracking-wide">Employees</th>
                <th className="pb-3 text-sm font-semibold text-text-light uppercase tracking-wide">Avg Score</th>
                <th className="pb-3 text-sm font-semibold text-text-light uppercase tracking-wide">Total Bonus</th>
                <th className="pb-3 text-sm font-semibold text-text-light uppercase tracking-wide">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {quarterlyData.map((dept, index) => {
                const avgScore = Math.round((dept.q1 + dept.q2 + dept.q3 + dept.q4) / 4);
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-4 font-medium text-text-dark">{dept.department}</td>
                    <td className="py-4 text-text-light">{dept.employees}</td>
                    <td className="py-4">
                      <span className="text-lg font-semibold text-primary">{avgScore}/100</span>
                    </td>
                    <td className="py-4 text-text-dark font-medium">${dept.totalBonus.toLocaleString()}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        avgScore >= 90 ? "text-green-600 bg-green-50" :
                        avgScore >= 80 ? "text-blue-600 bg-blue-50" :
                        avgScore >= 70 ? "text-yellow-600 bg-yellow-50" :
                        "text-red-600 bg-red-50"
                      }`}>
                        {avgScore >= 90 ? "Excellent" :
                         avgScore >= 80 ? "Good" :
                         avgScore >= 70 ? "Average" : "Needs Improvement"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderIndividualReport = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-text-dark mb-6">Top Performers</h3>
        <div className="space-y-4">
          {individualPerformance.slice(0, 10).map((person, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                  {person.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 className="font-semibold text-text-dark">{person.name}</h4>
                  <p className="text-sm text-text-light">{person.department}</p>
                </div>
              </div>
              <div className="flex items-center space-x-6 text-sm">
                <div className="text-center">
                  <p className="font-semibold text-primary">{person.score}/100</p>
                  <p className="text-text-light">Score</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-green-600">${person.bonus.toLocaleString()}</p>
                  <p className="text-text-light">Bonus</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-text-dark">{person.completed}/{person.objectives}</p>
                  <p className="text-text-light">Objectives</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderBonusReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-text-dark mb-6">Bonus Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={bonusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="percentage"
              >
                {bonusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-text-dark mb-6">Bonus Statistics</h3>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-text-light">Total Bonus Distributed</p>
              <p className="text-2xl font-bold text-primary">$617,000</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-text-light">Average Bonus</p>
              <p className="text-2xl font-bold text-text-dark">$3,025</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-text-light">Eligible Employees</p>
              <p className="text-2xl font-bold text-text-dark">204</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTrendsReport = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-text-dark mb-6">12-Month Performance Trends</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="avgScore" stroke="#004E9E" strokeWidth={3} name="Average Score" />
            <Line type="monotone" dataKey="engagement" stroke="#007BFF" strokeWidth={3} name="Engagement" />
            <Line type="monotone" dataKey="completion" stroke="#10B981" strokeWidth={3} name="Completion Rate" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderReportContent = () => {
    switch (selectedReport) {
      case "quarterly":
        return renderQuarterlyReport();
      case "individual":
        return renderIndividualReport();
      case "bonus":
        return renderBonusReport();
      case "trends":
        return renderTrendsReport();
      default:
        return renderQuarterlyReport();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-3xl font-bold text-text-dark">Organization Reports</h1>
              <p className="text-text-light mt-2">Comprehensive organizational performance and analytics reports</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={generateReport}
                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                Generate Report
              </button>
              <button
                onClick={exportData}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-text-dark rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ShareIcon className="w-4 h-4 mr-2" />
                Export Data
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-light mb-2">Report Type</label>
              <select
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                {reportTypes.map((type) => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-light mb-2">Period</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="Q4-2024">Q4 2024</option>
                <option value="Q3-2024">Q3 2024</option>
                <option value="Q2-2024">Q2 2024</option>
                <option value="Q1-2024">Q1 2024</option>
                <option value="2024">Full Year 2024</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-light mb-2">Department</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="all">All Departments</option>
                <option value="sales">Sales</option>
                <option value="marketing">Marketing</option>
                <option value="engineering">Engineering</option>
                <option value="customer_success">Customer Success</option>
                <option value="hr">HR</option>
                <option value="finance">Finance</option>
              </select>
            </div>
          </div>
        </div>

        {/* Report Content */}
        {renderReportContent()}

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-text-dark mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <DocumentTextIcon className="w-5 h-5 mr-2 text-gray-600" />
              <span className="text-sm font-medium">Schedule Report</span>
            </button>
            <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <PrinterIcon className="w-5 h-5 mr-2 text-gray-600" />
              <span className="text-sm font-medium">Print Report</span>
            </button>
            <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <EyeIcon className="w-5 h-5 mr-2 text-gray-600" />
              <span className="text-sm font-medium">View History</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
