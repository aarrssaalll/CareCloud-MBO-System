"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import {
  DocumentChartBarIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  CalendarIcon,
  ChartBarIcon,
  UsersIcon,
  TrophyIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function ReportsPage() {
  const [user, setUser] = useState<any>(null);
  const [selectedReport, setSelectedReport] = useState<string>("performance");
  const [dateRange, setDateRange] = useState<string>("q4-2024");
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

  // Sample data
  const performanceData = [
    { month: 'Oct', team: 85, individual: 82, target: 80 },
    { month: 'Nov', team: 88, individual: 85, target: 80 },
    { month: 'Dec', team: 92, individual: 89, target: 80 },
    { month: 'Jan', team: 87, individual: 86, target: 80 },
  ];

  const objectiveData = [
    { name: 'Completed', value: 45, color: '#10B981' },
    { name: 'On Track', value: 30, color: '#3B82F6' },
    { name: 'At Risk', value: 20, color: '#F59E0B' },
    { name: 'Overdue', value: 5, color: '#EF4444' },
  ];

  const departmentData = [
    { department: 'Engineering', performance: 91, objectives: 28, bonus: 85000 },
    { department: 'Sales', performance: 88, objectives: 24, bonus: 92000 },
    { department: 'Marketing', performance: 85, objectives: 18, bonus: 45000 },
    { department: 'Product', performance: 90, objectives: 22, bonus: 67000 },
    { department: 'Design', performance: 87, objectives: 16, bonus: 38000 },
  ];

  const bonusData = [
    { quarter: 'Q1', allocated: 125000, paid: 118000 },
    { quarter: 'Q2', allocated: 132000, paid: 128000 },
    { quarter: 'Q3', allocated: 145000, paid: 142000 },
    { quarter: 'Q4', allocated: 158000, paid: 151000 },
  ];

  const reportTypes = [
    {
      id: "performance",
      title: "Performance Overview",
      description: "Team and individual performance metrics",
      icon: ChartBarIcon,
    },
    {
      id: "objectives",
      title: "Objective Status",
      description: "Current status of all objectives",
      icon: TrophyIcon,
    },
    {
      id: "departments",
      title: "Department Analysis",
      description: "Performance breakdown by department",
      icon: UsersIcon,
    },
    {
      id: "bonus",
      title: "Bonus Reports",
      description: "Bonus allocation and payout analysis",
      icon: CurrencyDollarIcon,
    },
  ];

  const exportReport = (type: string) => {
    // In a real app, this would generate and download the actual report
    alert(`Exporting ${type} report for ${dateRange}...`);
  };

  const renderReport = () => {
    switch (selectedReport) {
      case "performance":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="text-lg font-semibold text-text-dark mb-2">Team Average</h4>
                <p className="text-3xl font-bold text-blue-600">88%</p>
                <p className="text-sm text-text-light">+5% from last quarter</p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="text-lg font-semibold text-text-dark mb-2">Top Performer</h4>
                <p className="text-3xl font-bold text-green-600">95%</p>
                <p className="text-sm text-text-light">Sarah Johnson</p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="text-lg font-semibold text-text-dark mb-2">Target Achievement</h4>
                <p className="text-3xl font-bold text-primary">110%</p>
                <p className="text-sm text-text-light">Exceeded by 10%</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h4 className="text-lg font-semibold text-text-dark mb-4">Performance Trends</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="team" stroke="#3B82F6" strokeWidth={2} />
                  <Line type="monotone" dataKey="individual" stroke="#10B981" strokeWidth={2} />
                  <Line type="monotone" dataKey="target" stroke="#EF4444" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case "objectives":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="text-lg font-semibold text-text-dark mb-4">Objective Status Distribution</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={objectiveData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {objectiveData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="text-lg font-semibold text-text-dark mb-4">Key Metrics</h4>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-text-light">Total Objectives</span>
                    <span className="font-semibold">156</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-light">Completion Rate</span>
                    <span className="font-semibold text-green-600">75%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-light">On Schedule</span>
                    <span className="font-semibold text-blue-600">85%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-light">Average Score</span>
                    <span className="font-semibold">87.2</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "departments":
        return (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-6">
              <h4 className="text-lg font-semibold text-text-dark mb-4">Department Performance Analysis</h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avg Performance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Active Objectives
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Bonus
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {departmentData.map((dept) => (
                      <tr key={dept.department}>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-text-dark">
                          {dept.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${dept.performance}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{dept.performance}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">
                          {dept.objectives}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          ${dept.bonus.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case "bonus":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="text-lg font-semibold text-text-dark mb-2">Total Allocated</h4>
                <p className="text-3xl font-bold text-blue-600">$560,000</p>
                <p className="text-sm text-text-light">This fiscal year</p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="text-lg font-semibold text-text-dark mb-2">Total Paid</h4>
                <p className="text-3xl font-bold text-green-600">$539,000</p>
                <p className="text-sm text-text-light">96.2% payout rate</p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="text-lg font-semibold text-text-dark mb-2">Avg per Employee</h4>
                <p className="text-3xl font-bold text-primary">$12,750</p>
                <p className="text-sm text-text-light">Based on performance</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h4 className="text-lg font-semibold text-text-dark mb-4">Quarterly Bonus Trends</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={bonusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quarter" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                  <Legend />
                  <Bar dataKey="allocated" fill="#3B82F6" name="Allocated" />
                  <Bar dataKey="paid" fill="#10B981" name="Paid" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      default:
        return <div>Select a report type</div>;
    }
  };

  return (
    <div className="min-h-screen ms-surface bg-ms-gray-50">
      <Navigation />
      <main className="w-full px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="ms-text-xxlarge font-semibold text-ms-gray-900">Reports & Analytics</h1>
          <p className="ms-text-medium text-ms-gray-600 mt-2">Comprehensive performance and analytics reports</p>
        </div>

        {/* Report Controls */}
        <div className="ms-card p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FunnelIcon className="w-5 h-5 text-ms-gray-600" />
                <select
                  value={selectedReport}
                  onChange={(e) => setSelectedReport(e.target.value)}
                  className="ms-input"
                >
                  {reportTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-5 h-5 text-ms-gray-600" />
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="ms-input"
                >
                  <option value="q4-2024">Q4 2024</option>
                  <option value="q3-2024">Q3 2024</option>
                  <option value="q2-2024">Q2 2024</option>
                  <option value="q1-2024">Q1 2024</option>
                  <option value="2024">Full Year 2024</option>
                </select>
              </div>
            </div>
            <button
              onClick={() => exportReport(selectedReport)}
              className="ms-button-primary flex items-center space-x-2"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Report Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {reportTypes.map((type) => {
            const IconComponent = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedReport(type.id)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedReport === type.id
                    ? 'border-primary bg-primary-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <IconComponent className={`w-6 h-6 mb-2 ${
                  selectedReport === type.id ? 'text-primary' : 'text-text-light'
                }`} />
                <h3 className={`font-medium ${
                  selectedReport === type.id ? 'text-primary' : 'text-text-dark'
                }`}>
                  {type.title}
                </h3>
                <p className="text-sm text-text-light mt-1">{type.description}</p>
              </button>
            );
          })}
        </div>

        {/* Report Content */}
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-text-dark">
              {reportTypes.find(t => t.id === selectedReport)?.title}
            </h2>
            <span className="text-text-light">
              Report Period: {dateRange.toUpperCase()}
            </span>
          </div>
          {renderReport()}
        </div>
      </main>
    </div>
  );
}
