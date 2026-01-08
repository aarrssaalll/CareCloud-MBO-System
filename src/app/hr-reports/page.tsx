"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownTrayIcon,
  XMarkIcon,
  PrinterIcon,
  ChevronRightIcon,
  UserIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

interface Employee {
  id: string;
  name: string;
  email: string;
  title: string;
  role: string;
  phone?: string;
  salary: number;
  allocatedBonusAmount: number;
  departmentId?: string;
  teamId?: string;
  department?: { name: string };
  team?: { name: string };
}

interface EmployeeReport {
  employee: Employee;
  totalObjectives: number;
  completedObjectives: number;
  bonusAmount: number;
  bonusStatus: string;
  performanceScore: number;
  completionRate: number;
}

export default function HRReportsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employeeReport, setEmployeeReport] = useState<EmployeeReport | null>(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(userData));
    loadEmployees();
  }, [router]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/hr/employees");
      const data = await response.json();
      if (data.success) {
        setEmployees(data.employees || []);
      }
    } catch (error) {
      console.error("Error loading employees:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeSelect = async (employee: Employee) => {
    console.log("Selected employee:", employee.id, employee.name);
    setSelectedEmployee(employee);
    setShowEmployeeModal(false);
    
    // Load detailed report
    try {
      setLoading(true);
      const url = `/api/hr/employee-report/${employee.id}`;
      console.log("Fetching report from:", url);
      const response = await fetch(url);
      const data = await response.json();
      console.log("API Response:", data);
      if (data.success) {
        console.log("Setting report data");
        setEmployeeReport(data.report);
        setShowReportModal(true);
      } else {
        console.error("API returned error:", data.error);
      }
    } catch (error) {
      console.error("Error loading report:", error);
      alert("Failed to load employee report");
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleExportReport = () => {
    if (!employeeReport) return;

    const reportContent = generateReportContent();
    const blob = new Blob([reportContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${employeeReport.employee.name}_report.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateReportContent = () => {
    if (!employeeReport) return "";
    const { employee, totalObjectives, completedObjectives, bonusAmount, performanceScore, completionRate, bonusStatus } = employeeReport;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${employee.name} - Performance Report</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; margin: 0; padding: 20px; background-color: #fafbfc; color: #333; }
          .container { max-width: 900px; margin: 0 auto; background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
          .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 1px solid #e0e4e8; }
          .header h1 { color: #004E9E; margin: 0 0 10px 0; font-size: 28px; }
          .header p { color: #666; margin: 5px 0; font-size: 14px; }
          .generated-date { color: #999; font-size: 12px; margin-top: 10px; }
          .section { margin: 35px 0; }
          .section-title { color: #004E9E; font-size: 16px; font-weight: 600; border-left: 3px solid #004E9E; padding-left: 12px; margin: 0 0 15px 0; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 15px; }
          .info-item { padding: 0; }
          .info-label { color: #666; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
          .info-value { color: #333; font-size: 15px; font-weight: 500; margin-top: 6px; }
          .metric-value { color: #004E9E; font-size: 24px; font-weight: 600; }
          .currency { color: #004E9E; font-size: 20px; font-weight: 600; }
          .status-badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 600; letter-spacing: 0.5px; }
          .status-approved { background-color: #f0f7f0; color: #1a6b1a; }
          .status-pending { background-color: #fef7f0; color: #6b4a1a; }
          .metrics-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 15px; margin-top: 15px; }
          .metric-card { padding: 15px; background-color: #fafbfc; border: 1px solid #e0e4e8; border-radius: 6px; }
          .metric-card .metric-label { font-size: 10px; }
          .metric-bar { margin: 20px 0; }
          .metric-bar-label { display: flex; justify-content: space-between; margin-bottom: 6px; }
          .metric-bar-label-name { font-size: 13px; font-weight: 500; color: #333; }
          .metric-bar-label-value { font-size: 13px; font-weight: 600; color: #004E9E; }
          .progress-bar { height: 6px; background-color: #e0e4e8; border-radius: 3px; overflow: hidden; }
          .progress-fill { height: 100%; background-color: #004E9E; }
          .footer { margin-top: 40px; text-align: center; color: #999; font-size: 11px; border-top: 1px solid #e0e4e8; padding-top: 20px; }
          .divider { height: 1px; background-color: #e0e4e8; margin: 30px 0; }
          @media print { body { background: white; } .container { box-shadow: none; } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Performance Report</h1>
            <p style="margin: 8px 0; font-size: 15px;">${employee.name}</p>
            <div class="generated-date">Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>

          <div class="section">
            <div class="section-title">PERSONAL INFORMATION</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Full Name</div>
                <div class="info-value">${employee.name}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Employee ID</div>
                <div class="info-value">${employee.id}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Email</div>
                <div class="info-value">${employee.email}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Phone</div>
                <div class="info-value">${employee.phone || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Job Title</div>
                <div class="info-value">${employee.title}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Role</div>
                <div class="info-value">${employee.role}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Department</div>
                <div class="info-value">${employee.department?.name || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Team</div>
                <div class="info-value">${employee.team?.name || 'N/A'}</div>
              </div>
            </div>
          </div>

          <div class="divider"></div>

          <div class="section">
            <div class="section-title">COMPENSATION & BONUS</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Base Salary</div>
                <div class="currency">$${employee.salary?.toLocaleString()}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Quarterly Bonus Allocation</div>
                <div class="currency">$${employee.allocatedBonusAmount?.toLocaleString()}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Approved Bonus</div>
                <div class="currency">$${bonusAmount?.toLocaleString()}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Bonus Status</div>
                <div>
                  <span class="status-badge ${bonusStatus === 'APPROVED' ? 'status-approved' : 'status-pending'}">
                    ${bonusStatus || 'PENDING'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="divider"></div>

          <div class="section">
            <div class="section-title">PERFORMANCE SUMMARY</div>
            <div class="metrics-grid">
              <div class="metric-card">
                <div class="info-label">Performance Score</div>
                <div class="metric-value" style="margin-top: 6px;">${performanceScore}%</div>
              </div>
              <div class="metric-card">
                <div class="info-label">Completion Rate</div>
                <div class="metric-value" style="margin-top: 6px;">${completionRate}%</div>
              </div>
              <div class="metric-card">
                <div class="info-label">Total Objectives</div>
                <div class="metric-value" style="margin-top: 6px;">${totalObjectives}</div>
              </div>
              <div class="metric-card">
                <div class="info-label">Completed</div>
                <div class="metric-value" style="margin-top: 6px;">${completedObjectives}</div>
              </div>
            </div>

            <div class="metric-bar">
              <div class="metric-bar-label">
                <span class="metric-bar-label-name">Performance Score</span>
                <span class="metric-bar-label-value">${performanceScore}%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${performanceScore}%"></div>
              </div>
            </div>

            <div class="metric-bar">
              <div class="metric-bar-label">
                <span class="metric-bar-label-name">Objective Completion Rate</span>
                <span class="metric-bar-label-value">${completionRate}%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${completionRate}%"></div>
              </div>
            </div>
          </div>

          <div class="footer">
            <p>This report was generated by the CareCloud MBO System</p>
            <p>For inquiries, contact the Human Resources department</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         emp.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "all" || emp.role?.toLowerCase() === filterRole.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const uniqueRoles = [...new Set(employees.map(e => e.role).filter(Boolean))];

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-semibold text-gray-900">HR Reports</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Generate and review comprehensive employee performance reports
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Main Action Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowEmployeeModal(true)}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#004E9E] to-[#007BFF] text-white rounded-lg hover:from-[#003a73] hover:to-[#0056b3] shadow-md hover:shadow-lg transition-all font-semibold text-base"
          >
            <UserIcon className="w-5 h-5" />
            <div className="text-left">
              <div className="text-base  font-bold">Select Employee & Generate Report</div>
            </div>
          </button>
        </div>

        {/* Employee Selection Modal */}
        {showEmployeeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Select Employee</h2>
                <button
                  onClick={() => setShowEmployeeModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Search Bar */}
                <div className="mb-6">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004E9E] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Filter by Role */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Filter by Role</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setFilterRole("all")}
                      className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                        filterRole === "all"
                          ? "bg-[#004E9E] text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      All
                    </button>
                    {uniqueRoles.map((role) => (
                      <button
                        key={role}
                        onClick={() => setFilterRole(role || "")}
                        className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                          filterRole === role
                            ? "bg-[#004E9E] text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Employee List */}
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Loading employees...</p>
                  </div>
                ) : filteredEmployees.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No employees found</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredEmployees.map((employee) => (
                      <button
                        key={employee.id}
                        onClick={() => handleEmployeeSelect(employee)}
                        className="w-full text-left p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 rounded-lg transition"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">{employee.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">{employee.email}</p>
                            <p className="text-xs text-gray-500 mt-1">{employee.title} • {employee.role}</p>
                          </div>
                          <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Report Display Modal */}
        {showReportModal && employeeReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">{employeeReport.employee.name}</h2>
                  <p className="text-sm text-gray-600 mt-1">Performance Report</p>
                </div>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition p-2"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body - Scrollable */}
              <div className="flex-1 overflow-y-auto p-8">
                {/* Personal Information */}
                <div className="mb-10">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Name</p>
                      <p className="mt-2 text-sm text-gray-900 font-medium">{employeeReport.employee.name}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Employee ID</p>
                      <p className="mt-2 text-sm text-gray-900 font-medium">{employeeReport.employee.id}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Email</p>
                      <p className="mt-2 text-sm text-gray-900 font-medium truncate">{employeeReport.employee.email}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Phone</p>
                      <p className="mt-2 text-sm text-gray-900 font-medium">{employeeReport.employee.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Job Title</p>
                      <p className="mt-2 text-sm text-gray-900 font-medium">{employeeReport.employee.title}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Role</p>
                      <p className="mt-2 text-sm text-gray-900 font-medium">{employeeReport.employee.role}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Department</p>
                      <p className="mt-2 text-sm text-gray-900 font-medium">{employeeReport.employee.department?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Team</p>
                      <p className="mt-2 text-sm text-gray-900 font-medium">{employeeReport.employee.team?.name || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Compensation Information */}
                <div className="mb-10">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                    Compensation & Bonus
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Base Salary</p>
                      <p className="mt-2 text-xl font-semibold text-gray-900">
                        ${employeeReport.employee.salary?.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Quarterly Bonus Allocation</p>
                      <p className="mt-2 text-xl font-semibold text-gray-900">
                        ${employeeReport.employee.allocatedBonusAmount?.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Approved Bonus</p>
                      <p className="mt-2 text-xl font-semibold text-[#004E9E]">
                        ${employeeReport.bonusAmount?.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Bonus Status</p>
                      <div className="mt-2">
                        <span className={`inline-block px-3 py-1 rounded text-xs font-semibold ${
                          employeeReport.bonusStatus === "APPROVED"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-200 text-gray-800"
                        }`}>
                          {employeeReport.bonusStatus || "PENDING"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                    Performance Metrics
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Performance Score</p>
                      <p className="mt-2 text-2xl font-semibold text-[#004E9E]">{employeeReport.performanceScore}%</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Completion Rate</p>
                      <p className="mt-2 text-2xl font-semibold text-[#004E9E]">{employeeReport.completionRate}%</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Total Objectives</p>
                      <p className="mt-2 text-2xl font-semibold text-gray-900">{employeeReport.totalObjectives}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Completed</p>
                      <p className="mt-2 text-2xl font-semibold text-gray-900">{employeeReport.completedObjectives}</p>
                    </div>
                  </div>

                  {/* Progress Bars */}
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-900">Performance Score</span>
                        <span className="text-sm font-semibold text-gray-900">{employeeReport.performanceScore}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#004E9E] transition-all duration-300"
                          style={{ width: `${employeeReport.performanceScore}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-900">Objective Completion Rate</span>
                        <span className="text-sm font-semibold text-gray-900">{employeeReport.completionRate}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#004E9E] transition-all duration-300"
                          style={{ width: `${employeeReport.completionRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer - Actions */}
              <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition font-medium text-sm"
                >
                  Close
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={handlePrintReport}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[#004E9E] border border-[#004E9E] hover:bg-blue-50 rounded-lg transition font-medium text-sm"
                  >
                    <PrinterIcon className="w-4 h-4" />
                    Print
                  </button>
                  <button
                    onClick={handleExportReport}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#004E9E] text-white hover:bg-[#003a73] rounded-lg transition font-medium text-sm"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        {!showEmployeeModal && !showReportModal && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 text-2xl">💡</div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">How to Generate Reports</h3>
                <p className="text-sm text-blue-800 leading-relaxed">
                  Click the "Generate Report" button above to search for an employee. Filter by name, email, or role, then select an employee to view their complete performance profile, compensation details, and approved bonus calculations. You can print or export reports for documentation.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
