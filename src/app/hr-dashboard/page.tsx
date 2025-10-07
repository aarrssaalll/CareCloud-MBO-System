"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
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

interface HRAction {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: string;
  enabled: boolean;
}

export default function HRDashboard() {
  const { user, isLoading: authLoading } = useAuth(true, ['HR', 'hr']);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [organizationMetrics, setOrganizationMetrics] = useState<any[]>([]);
  const [recentEmployees, setRecentEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [workflowMetrics, setWorkflowMetrics] = useState({
    pendingEnrollments: 0,
    organizationCoverage: 0,
    avgTeamSize: 0
  });
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    
    loadHRData();
  }, [authLoading, user]);

  const loadHRData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadOrganizationMetrics(),
        loadRecentEmployees(),
        loadDepartments(),
        loadWorkflowMetrics()
      ]);
    } catch (error) {
      console.error('Error loading HR data:', error);
      setError('Failed to load HR data');
    } finally {
      setLoading(false);
    }
  };

  const loadOrganizationMetrics = async () => {
    try {
      console.log('🔍 Loading organization metrics...');
      
      // Get all users
      const usersResponse = await fetch('/api/mbo/data?type=users');
      const usersResult = await usersResponse.json();
      const users = usersResult.success ? usersResult.data : [];
      
      // Get all departments
      const deptResponse = await fetch('/api/mbo/data?type=departments');
      const deptResult = await deptResponse.json();
      const departments = deptResult.success ? deptResult.data : [];
      
      // Calculate pending enrollments for HR Workflows
      const pendingEnrollments = users.filter((user: any) => !user.departmentId).length;
      
      // Calculate metrics
      const totalWorkforce = users.length;
      const managementCount = users.filter((user: any) => 
        user.role === 'MANAGER' || user.role === 'SENIOR_MANAGEMENT'
      ).length;
      
      const metrics = [
        {
          title: "Total Workforce",
          value: totalWorkforce > 0 ? totalWorkforce.toString() : "-",
          change: totalWorkforce > 0 ? `${totalWorkforce} employees` : "No employees",
          icon: UsersIcon,
          color: "from-blue-500 to-blue-600",
          description: "Active employees across all departments"
        },
        {
          title: "Departments",
          value: departments.length > 0 ? departments.length.toString() : "-",
          change: departments.length > 0 ? `${departments.length} business units` : "No departments",
          icon: BuildingOfficeIcon,
          color: "from-green-500 to-green-600",
          description: "Active business units"
        },
        {
          title: "Management Positions",
          value: managementCount > 0 ? managementCount.toString() : "-",
          change: totalWorkforce > 0 ? `${Math.round((managementCount / totalWorkforce) * 100)}% of workforce` : "0%",
          icon: UserGroupIcon,
          color: "from-purple-500 to-purple-600",
          description: "Managers and senior management"
        },
        {
          title: "HR Workflows",
          value: pendingEnrollments.toString(),
          change: pendingEnrollments > 0 ? `${pendingEnrollments} pending` : "All complete",
          icon: ClipboardDocumentListIcon,
          color: "from-amber-500 to-amber-600",
          description: "Active HR processes"
        }
      ];
      
      setOrganizationMetrics(metrics);
      console.log('✅ Organization metrics loaded');
    } catch (error) {
      console.error('❌ Error loading organization metrics:', error);
      // Set fallback metrics
      setOrganizationMetrics([]);
    }
  };

  const loadRecentEmployees = async () => {
    try {
      console.log('🔍 Loading recent employees...');
      
      const usersResponse = await fetch('/api/mbo/data?type=users');
      const usersResult = await usersResponse.json();
      const users = usersResult.success ? usersResult.data : [];
      
      // Get departments for mapping
      const deptResponse = await fetch('/api/mbo/data?type=departments');
      const deptResult = await deptResponse.json();
      const departments = deptResult.success ? deptResult.data : [];
      
      // Transform users to Employee interface and get recent ones
      const employees: Employee[] = users.slice(-3).map((user: any) => {
        const department = departments.find((dept: any) => dept.id === user.departmentId);
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          department: department?.name || 'Unknown Department',
          role: user.title || user.role,
          employeeType: user.role === 'SENIOR_MANAGEMENT' ? 'Senior Manager' : 
                       user.role === 'MANAGER' ? 'Manager' : 'Employee',
          reportsTo: user.managerId ? `Manager ID: ${user.managerId}` : 'No direct manager',
          joinDate: user.hireDate ? new Date(user.hireDate).toLocaleDateString() : 'Unknown',
          status: 'Active' as const,
          salary: user.salary ? `$${user.salary.toLocaleString()}` : 'Not specified'
        };
      });
      
      setRecentEmployees(employees);
      console.log('✅ Recent employees loaded');
    } catch (error) {
      console.error('❌ Error loading recent employees:', error);
      setRecentEmployees([]);
    }
  };

  const loadDepartments = async () => {
    try {
      console.log('🔍 Loading departments...');
      
      const deptResponse = await fetch('/api/mbo/data?type=departments');
      const deptResult = await deptResponse.json();
      const departments = deptResult.success ? deptResult.data : [];
      
      const usersResponse = await fetch('/api/mbo/data?type=users');
      const usersResult = await usersResponse.json();
      const users = usersResult.success ? usersResult.data : [];
      
      // Transform departments with employee counts
      const deptData: Department[] = departments.map((dept: any) => {
        const deptUsers = users.filter((user: any) => user.departmentId === dept.id);
        const manager = users.find((user: any) => user.id === dept.managerId);
        
        return {
          id: dept.id,
          name: dept.name,
          managerId: dept.managerId || '',
          managerName: manager ? manager.name : 'No manager assigned',
          employeeCount: deptUsers.length,
          budget: dept.budget ? `$${dept.budget.toLocaleString()}` : 'Not specified'
        };
      });
      
      setDepartments(deptData);
      console.log('✅ Departments loaded');
    } catch (error) {
      console.error('❌ Error loading departments:', error);
      setDepartments([]);
    }
  };

  const loadWorkflowMetrics = async () => {
    try {
      console.log('🔍 Loading workflow metrics...');

      const usersResponse = await fetch('/api/mbo/data?type=users');
      const usersResult = await usersResponse.json();
      const users = usersResult.success ? usersResult.data : [];

      const deptResponse = await fetch('/api/mbo/data?type=departments');
      const deptResult = await deptResponse.json();
      const departments = deptResult.success ? deptResult.data : [];

      // Calculate pending enrollments (users without department assignment)
      const pendingEnrollments = users.filter((user: any) => !user.departmentId).length;

      // Calculate organization coverage (users with departments / total users)
      const organizationCoverage = users.length > 0 ?
        ((users.length - pendingEnrollments) / users.length) * 100 : 0;

      // Calculate average team size
      const totalUsersWithDept = users.filter((user: any) => user.departmentId).length;
      const avgTeamSize = departments.length > 0 ? totalUsersWithDept / departments.length : 0;

      setWorkflowMetrics({
        pendingEnrollments,
        organizationCoverage: Math.round(organizationCoverage),
        avgTeamSize: Math.round(avgTeamSize * 10) / 10 // Round to 1 decimal place
      });

      console.log('✅ Workflow metrics loaded');
    } catch (error) {
      console.error('❌ Error loading workflow metrics:', error);
      setWorkflowMetrics({
        pendingEnrollments: 0,
        organizationCoverage: 0,
        avgTeamSize: 0
      });
    }
  };

  const hrActions = [
    {
      title: "Employee Enrollment",
      description: "Onboard new employees and manage enrollments",
      icon: UsersIcon,
      href: "/employee-enrollment",
      color: "bg-blue-500 hover:bg-blue-600",
      enabled: true
    },
    {
      title: "Organization Chart",
      description: "Manage reporting relationships and hierarchy",
      icon: UserGroupIcon,
      href: "#",
      color: "bg-purple-500 hover:bg-purple-600",
      enabled: false
    },
    {
      title: "Department Management",
      description: "Create and manage business units",
      icon: BuildingOfficeIcon,
      href: "#",
      color: "bg-green-500 hover:bg-green-600",
      enabled: false
    },
    {
      title: "Bonus Approvals",
      description: "Review and approve employee bonuses",
      icon: BanknotesIcon,
      href: "#",
      color: "bg-yellow-500 hover:bg-yellow-600",
      enabled: false
    },
    {
      title: "Bonus Structure",
      description: "Configure compensation and bonus tiers",
      icon: BanknotesIcon,
      href: "/bonus-structure",
      color: "bg-teal-500 hover:bg-teal-600",
      enabled: true
    },
    {
      title: "System Settings",
      description: "Configure MBO system parameters",
      icon: Cog6ToothIcon,
      href: "/settings",
      color: "bg-gray-500 hover:bg-gray-600",
      enabled: true
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
              
              if (!action.enabled) {
                // Disabled action - no click functionality, same appearance
                return (
                  <div
                    key={index}
                    className={`${action.color} text-white p-6 rounded-xl shadow-sm cursor-not-allowed`}
                  >
                    <IconComponent className="w-8 h-8 mb-3" />
                    <h3 className="font-semibold mb-2">{action.title}</h3>
                    <p className="text-sm opacity-90">{action.description}</p>
                  </div>
                );
              }
              
              // Enabled action - clickable
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
                <span className="text-gray-400 text-sm font-medium cursor-not-allowed">
                  Manage Departments (Coming Soon)
                </span>
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
      </main>
    </div>
  );
}
