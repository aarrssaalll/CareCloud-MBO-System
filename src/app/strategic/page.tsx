"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import {
  BuildingOfficeIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  TrophyIcon,
  UsersIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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

export default function StrategicPage() {
  const [user, setUser] = useState<any>(null);
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

  // Strategic KPIs Data
  const strategicKPIs = [
    {
      title: "Overall Organizational Score",
      value: "87.2",
      unit: "/100",
      change: "+5.3%",
      trend: "up",
      icon: TrophyIcon,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Employee Engagement",
      value: "91%",
      unit: "",
      change: "+2.1%",
      trend: "up", 
      icon: UsersIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Objectives Completion Rate",
      value: "84%",
      unit: "",
      change: "+7.5%",
      trend: "up",
      icon: CheckCircleIcon,
      color: "text-primary",
      bgColor: "bg-primary-50",
    },
    {
      title: "Revenue Impact",
      value: "$2.4M",
      unit: "",
      change: "+12.8%",
      trend: "up",
      icon: CurrencyDollarIcon,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
  ];

  // Department Performance Data
  const departmentData = [
    { name: "Sales", score: 92, employees: 45, completion: 88 },
    { name: "Marketing", score: 85, employees: 28, completion: 91 },
    { name: "Engineering", score: 89, employees: 67, completion: 82 },
    { name: "Customer Success", score: 94, employees: 32, completion: 96 },
    { name: "HR", score: 81, employees: 15, completion: 78 },
    { name: "Finance", score: 86, employees: 22, completion: 85 },
  ];

  // Quarterly Trend Data
  const quarterlyTrends = [
    { quarter: "Q1-2024", score: 78, engagement: 85, completion: 72 },
    { quarter: "Q2-2024", score: 81, engagement: 87, completion: 76 },
    { quarter: "Q3-2024", score: 84, engagement: 89, completion: 80 },
    { quarter: "Q4-2024", score: 87, engagement: 91, completion: 84 },
  ];

  // Strategic Initiatives Status
  const strategicInitiatives = [
    {
      name: "Digital Transformation",
      progress: 78,
      status: "on_track",
      owner: "Engineering",
      dueDate: "Q1-2025",
      impact: "High"
    },
    {
      name: "Customer Experience Excellence",
      progress: 92,
      status: "ahead",
      owner: "Customer Success", 
      dueDate: "Q4-2024",
      impact: "Critical"
    },
    {
      name: "Market Expansion",
      progress: 65,
      status: "at_risk",
      owner: "Sales",
      dueDate: "Q2-2025",
      impact: "High"
    },
    {
      name: "Operational Efficiency",
      progress: 88,
      status: "on_track",
      owner: "Operations",
      dueDate: "Q1-2025",
      impact: "Medium"
    },
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "ahead":
        return { color: "text-green-600", bg: "bg-green-50", label: "Ahead of Schedule" };
      case "on_track":
        return { color: "text-blue-600", bg: "bg-blue-50", label: "On Track" };
      case "at_risk":
        return { color: "text-yellow-600", bg: "bg-yellow-50", label: "At Risk" };
      case "delayed":
        return { color: "text-red-600", bg: "bg-red-50", label: "Delayed" };
      default:
        return { color: "text-gray-600", bg: "bg-gray-50", label: "Unknown" };
    }
  };

  const COLORS = ['#004E9E', '#007BFF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-dark">Strategic Overview</h1>
            <p className="text-text-light mt-2">Executive dashboard for organizational performance and strategic initiatives</p>
          </div>
          <div className="mt-4 lg:mt-0">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="Q4-2024">Q4 2024</option>
              <option value="Q3-2024">Q3 2024</option>
              <option value="Q2-2024">Q2 2024</option>
              <option value="Q1-2024">Q1 2024</option>
            </select>
          </div>
        </div>

        {/* Strategic KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {strategicKPIs.map((kpi, index) => {
            const Icon = kpi.icon;
            const TrendIcon = kpi.trend === "up" ? ArrowUpIcon : ArrowDownIcon;
            
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${kpi.bgColor}`}>
                    <Icon className={`w-6 h-6 ${kpi.color}`} />
                  </div>
                  <div className={`flex items-center space-x-1 ${kpi.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                    <TrendIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">{kpi.change}</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-text-dark mb-2">{kpi.title}</h3>
                <div className="flex items-end space-x-1">
                  <span className="text-3xl font-bold text-text-dark">{kpi.value}</span>
                  <span className="text-lg text-text-light mb-1">{kpi.unit}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Quarterly Trends */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-text-dark mb-6">Quarterly Performance Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={quarterlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="#004E9E" strokeWidth={3} name="Overall Score" />
                <Line type="monotone" dataKey="engagement" stroke="#007BFF" strokeWidth={3} name="Engagement" />
                <Line type="monotone" dataKey="completion" stroke="#10B981" strokeWidth={3} name="Completion Rate" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Department Performance */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-text-dark mb-6">Department Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="score" fill="#004E9E" name="Performance Score" />
                <Bar dataKey="completion" fill="#007BFF" name="Completion Rate" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Strategic Initiatives */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-xl font-semibold text-text-dark mb-6">Strategic Initiatives</h3>
          <div className="space-y-6">
            {strategicInitiatives.map((initiative, index) => {
              const statusConfig = getStatusConfig(initiative.status);
              
              return (
                <div key={index} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-semibold text-text-dark">{initiative.name}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color} ${statusConfig.bg}`}>
                          {statusConfig.label}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {initiative.impact} Impact
                        </span>
                      </div>
                      <div className="flex items-center space-x-6 text-sm text-text-light">
                        <span>Owner: <span className="font-medium text-text-dark">{initiative.owner}</span></span>
                        <span>Due: <span className="font-medium text-text-dark">{initiative.dueDate}</span></span>
                      </div>
                    </div>
                    <div className="mt-4 lg:mt-0 text-right">
                      <div className="text-2xl font-bold text-primary">{initiative.progress}%</div>
                      <div className="text-sm text-text-light">Complete</div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                      style={{ width: `${initiative.progress}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Department Summary Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-text-dark mb-6">Department Summary</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 text-sm font-semibold text-text-light uppercase tracking-wide">Department</th>
                  <th className="pb-3 text-sm font-semibold text-text-light uppercase tracking-wide">Employees</th>
                  <th className="pb-3 text-sm font-semibold text-text-light uppercase tracking-wide">Performance Score</th>
                  <th className="pb-3 text-sm font-semibold text-text-light uppercase tracking-wide">Completion Rate</th>
                  <th className="pb-3 text-sm font-semibold text-text-light uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {departmentData.map((dept, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-4 font-medium text-text-dark">{dept.name}</td>
                    <td className="py-4 text-text-light">{dept.employees}</td>
                    <td className="py-4">
                      <span className="text-lg font-semibold text-primary">{dept.score}/100</span>
                    </td>
                    <td className="py-4">
                      <span className="text-lg font-semibold text-text-dark">{dept.completion}%</span>
                    </td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        dept.score >= 90 ? "text-green-600 bg-green-50" :
                        dept.score >= 80 ? "text-blue-600 bg-blue-50" :
                        dept.score >= 70 ? "text-yellow-600 bg-yellow-50" :
                        "text-red-600 bg-red-50"
                      }`}>
                        {dept.score >= 90 ? "Excellent" :
                         dept.score >= 80 ? "Good" :
                         dept.score >= 70 ? "Average" : "Needs Improvement"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
