"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import {
  BriefcaseIcon,
  UsersIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

export default function HRReportsPage() {
  const [user, setUser] = useState<any>(null);
  const [selectedReport, setSelectedReport] = useState("employee-overview");
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
      id: "employee-overview",
      name: "Employee Overview",
      description: "Comprehensive view of all employees, performance, and status",
      icon: UsersIcon
    },
    {
      id: "performance-analytics",
      name: "Performance Analytics",
      description: "Organization-wide performance trends and insights",
      icon: ChartBarIcon
    },
    {
      id: "compensation-analysis",
      name: "Compensation Analysis",
      description: "Salary, bonus, and compensation structure analysis",
      icon: CurrencyDollarIcon
    },
    {
      id: "attendance-reports",
      name: "Attendance & Time Tracking",
      description: "Employee attendance patterns and time management",
      icon: ClockIcon
    },
    {
      id: "recruitment-metrics",
      name: "Recruitment Metrics",
      description: "Hiring pipeline, success rates, and recruitment analytics",
      icon: BriefcaseIcon
    },
    {
      id: "compliance-audit",
      name: "Compliance & Audit",
      description: "Regulatory compliance and internal audit reports",
      icon: DocumentTextIcon
    }
  ];

  const mockEmployeeData = [
    { name: "John Doe", department: "Engineering", position: "Senior Developer", score: 85, salary: "$95,000", status: "Active" },
    { name: "Alice Johnson", department: "Product", position: "Product Manager", score: 92, salary: "$110,000", status: "Active" },
    { name: "Bob Smith", department: "Engineering", position: "QA Engineer", score: 78, salary: "$75,000", status: "Active" },
    { name: "Carol White", department: "Design", position: "UX Designer", score: 88, salary: "$85,000", status: "Active" },
    { name: "David Brown", department: "Sales", position: "Sales Manager", score: 91, salary: "$105,000", status: "Active" }
  ];

  const departmentStats = [
    { name: "Engineering", employees: 12, avgScore: 82, avgSalary: "$88,000" },
    { name: "Product", employees: 5, avgScore: 89, avgSalary: "$105,000" },
    { name: "Sales", employees: 8, avgScore: 85, avgSalary: "$92,000" },
    { name: "Design", employees: 4, avgScore: 87, avgSalary: "$80,000" },
    { name: "HR", employees: 3, avgScore: 90, avgSalary: "$75,000" }
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
      
      <main className="w-full px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">HR Reports</h1>
          <p className="text-gray-600 mt-2">Comprehensive HR analytics and organizational insights</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
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
                    className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center space-x-2 text-sm"
                  >
                    <DocumentTextIcon className="w-4 h-4" />
                    <span>Generate Report</span>
                  </button>
                  <button
                    onClick={exportReport}
                    className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2 text-sm"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    <span>Export PDF</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Report Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {reportTypes.find(r => r.id === selectedReport)?.name}
                </h3>
                <span className="text-sm text-gray-500">Generated: {new Date().toLocaleDateString()}</span>
              </div>

              {selectedReport === "employee-overview" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-800">Total Employees</h4>
                      <p className="text-2xl font-bold text-blue-900 mt-1">32</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-green-800">Avg Performance</h4>
                      <p className="text-2xl font-bold text-green-900 mt-1">86.8</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-yellow-800">Departments</h4>
                      <p className="text-2xl font-bold text-yellow-900 mt-1">5</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-purple-800">Avg Salary</h4>
                      <p className="text-2xl font-bold text-purple-900 mt-1">$88K</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-4">Department Overview</h4>
                    <div className="space-y-3">
                      {departmentStats.map((dept, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div>
                            <h5 className="font-medium text-gray-900">{dept.name}</h5>
                            <p className="text-sm text-gray-600">{dept.employees} employees</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Avg Score: {dept.avgScore}</p>
                            <p className="text-sm text-gray-600">Avg Salary: {dept.avgSalary}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-4">Employee Details</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {mockEmployeeData.map((employee, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{employee.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.department}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.position}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.score}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.salary}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  {employee.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {selectedReport !== "employee-overview" && (
                <div className="text-center py-12">
                  {(() => {
                    const report = reportTypes.find(r => r.id === selectedReport);
                    const IconComponent = report?.icon || DocumentTextIcon;
                    return (
                      <>
                        <IconComponent className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900">{report?.name}</h4>
                        <p className="text-gray-600 mt-2">{report?.description}</p>
                        <p className="text-sm text-gray-500 mt-4">Detailed analytics and insights would be displayed here</p>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
