"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  UsersIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  Cog6ToothIcon,
  PlusIcon,
  PencilIcon,
  BanknotesIcon,
  ClipboardDocumentListIcon
} from "@heroicons/react/24/outline";

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  employeeType: 'Employee' | 'Manager' | 'Senior Manager';
  reportsTo?: string;
  joinDate: string;
  status: 'Active' | 'Inactive' | 'On Leave';
  salary: string;
}

interface Department {
  id: string;
  name: string;
  managerId: string;
  managerName: string;
  employeeCount: number;
  budget: string;
}

export default function HRDashboard() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "hr") {
      router.push("/dashboard");
      return;
    }
    
    setUser(parsedUser);
  }, [router]);

  // HR Organization Management Metrics
  const organizationMetrics = [
    {
      title: "Total Workforce",
      value: "247",
      change: "+12 this month",
      icon: UsersIcon,
      color: "from-blue-500 to-blue-600",
      description: "Active employees across all departments"
    },
    {
      title: "Departments",
      value: "8",
      change: "+1 new dept",
      icon: BuildingOfficeIcon,
      color: "from-green-500 to-green-600",
      description: "Active business units"
    },
    {
      title: "Management Positions",
      value: "42",
      change: "17% of workforce",
      icon: UserGroupIcon,
      color: "from-purple-500 to-purple-600",
      description: "Managers and senior management"
    },
    {
      title: "HR Workflows",
      value: "15",
      change: "3 pending approval",
      icon: ClipboardDocumentListIcon,
      color: "from-amber-500 to-amber-600",
      description: "Active HR processes"
    }
  ];

  const hrActions = [
    {
      title: "Employee Enrollment",
      description: "Add new employees and set up reporting structure",
      icon: PlusIcon,
      href: "/employee-enrollment",
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      title: "Organization Chart",
      description: "Manage reporting relationships and hierarchy",
      icon: UserGroupIcon,
      href: "/org-chart",
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      title: "Department Management",
      description: "Create and manage business units",
      icon: BuildingOfficeIcon,
      href: "/departments",
      color: "bg-purple-500 hover:bg-purple-600"
    },
    {
      title: "Bonus Structure",
      description: "Configure compensation and bonus tiers",
      icon: BanknotesIcon,
      href: "/bonus-structure",
      color: "bg-emerald-500 hover:bg-emerald-600"
    },
    {
      title: "System Settings",
      description: "Configure MBO system parameters",
      icon: Cog6ToothIcon,
      href: "/settings",
      color: "bg-gray-500 hover:bg-gray-600"
    },
    {
      title: "HR Analytics",
      description: "Generate workforce and performance reports",
      icon: ChartBarIcon,
      href: "/hr-reports",
      color: "bg-indigo-500 hover:bg-indigo-600"
    }
  ];

  const recentEmployees: Employee[] = [
    {
      id: "emp_1",
      name: "Sarah Wilson",
      email: "sarah.wilson@carecloud.com",
      department: "Engineering",
      role: "Senior Developer",
      employeeType: "Employee",
      reportsTo: "John Tech (Engineering Manager)",
      joinDate: "2024-12-01",
      status: "Active",
      salary: "$95,000"
    },
    {
      id: "emp_2", 
      name: "Michael Brown",
      email: "michael.brown@carecloud.com",
      department: "Sales",
      role: "Sales Manager",
      employeeType: "Manager",
      reportsTo: "David Sales (Sales Director)",
      joinDate: "2024-12-05",
      status: "Active",
      salary: "$110,000"
    },
    {
      id: "emp_3",
      name: "Lisa Chen",
      email: "lisa.chen@carecloud.com", 
      department: "Product",
      role: "Product Analyst",
      employeeType: "Employee",
      reportsTo: "Anna Product (Product Manager)",
      joinDate: "2024-12-08",
      status: "Active",
      salary: "$80,000"
    }
  ];

  const departments: Department[] = [
    {
      id: "dept_1",
      name: "Engineering",
      managerId: "mgr_1",
      managerName: "John Tech",
      employeeCount: 85,
      budget: "$8.5M"
    },
    {
      id: "dept_2",
      name: "Sales & Marketing",
      managerId: "mgr_2", 
      managerName: "David Sales",
      employeeCount: 42,
      budget: "$4.2M"
    },
    {
      id: "dept_3",
      name: "Product Management",
      managerId: "mgr_3",
      managerName: "Anna Product", 
      employeeCount: 28,
      budget: "$3.1M"
    },
    {
      id: "dept_4",
      name: "Operations",
      managerId: "mgr_4",
      managerName: "Steve Ops",
      employeeCount: 35,
      budget: "$2.8M"
    }
  ];
  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">HR Management Center</h1>
          <p className="mt-2 text-gray-600">Manage workforce, organization structure, and HR operations</p>
        </div>

        {/* Organization Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {organizationMetrics.map((metric, index) => {
            const IconComponent = metric.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                    <p className="text-sm text-gray-500 mt-1">{metric.change}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${metric.color}`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">{metric.description}</p>
              </div>
            );
          })}
        </div>

        {/* HR Action Centers */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">HR Management Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hrActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <a
                  key={index}
                  href={action.href}
                  className={`${action.color} text-white p-6 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md transform hover:-translate-y-1`}
                >
                  <IconComponent className="w-8 h-8 mb-3" />
                  <h3 className="font-semibold mb-2">{action.title}</h3>
                  <p className="text-sm opacity-90">{action.description}</p>
                </a>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Employee Additions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Enrollments</h3>
                <a href="/employee-enrollment" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Add Employee
                </a>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentEmployees.map((employee) => (
                  <div key={employee.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{employee.name}</h4>
                      <p className="text-sm text-gray-600">{employee.role} • {employee.department}</p>
                      <p className="text-xs text-gray-500">
                        {employee.employeeType} • Reports to: {employee.reportsTo}
                      </p>
                      <p className="text-xs text-gray-500">Joined: {employee.joinDate}</p>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        {employee.status}
                      </span>
                      <p className="text-sm font-medium text-gray-900 mt-1">{employee.salary}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Department Structure */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Department Structure</h3>
                <a href="/departments" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Manage Departments
                </a>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {departments.map((dept) => (
                  <div key={dept.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{dept.name}</h4>
                      <p className="text-sm text-gray-600">Manager: {dept.managerName}</p>
                      <p className="text-xs text-gray-500">{dept.employeeCount} employees</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{dept.budget}</p>
                      <p className="text-xs text-gray-500">Annual budget</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* HR Workflow Status */}
        <div className="mt-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">HR Workflow Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">12</div>
                <div className="text-sm text-blue-800">Pending Enrollments</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">95%</div>
                <div className="text-sm text-green-800">Organization Coverage</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">8.5</div>
                <div className="text-sm text-purple-800">Avg Team Size</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
