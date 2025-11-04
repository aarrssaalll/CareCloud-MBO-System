'use client';

import React, { useState, useEffect } from 'react';
import { 
  BuildingOfficeIcon,
  UserGroupIcon,
  ChartBarIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  UsersIcon,
  BriefcaseIcon,
  ShieldCheckIcon,
  CogIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// Types for organizational hierarchy
interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  level: 'employee' | 'manager' | 'senior_manager' | 'executive';
  department: string;
  managerId?: string;
  directReports: string[];
  hireDate: string;
  status: 'active' | 'inactive' | 'pending';
  permissions: string[];
  lastLogin: string;
  objectivesCount: number;
  completionRate: number;
}

interface Department {
  id: string;
  name: string;
  description: string;
  headId: string;
  employeeCount: number;
  budget?: number;
  objectives: string[];
  status: 'active' | 'inactive';
}

interface Role {
  id: string;
  title: string;
  level: Employee['level'];
  permissions: string[];
  canAssignObjectives: boolean;
  canApproveObjectives: boolean;
  canManageTeam: boolean;
  canViewReports: boolean;
  description: string;
}

interface HierarchyNode {
  employee: Employee;
  children: HierarchyNode[];
}

export default function OrganizationManagement() {
  const [activeTab, setActiveTab] = useState<'hierarchy' | 'employees' | 'departments' | 'roles'>('hierarchy');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Mock user - in real implementation, get from auth context
  const user = {
    email: "admin@carecloud.com",
    role: "senior_management",
    name: "David Wilson",
    permissions: ["manage_organization", "assign_objectives", "approve_objectives", "view_all_reports"]
  };

  useEffect(() => {
    loadOrganizationData();
  }, []);

  const loadOrganizationData = () => {
    // Load employees
    const mockEmployees: Employee[] = [
      {
        id: "emp001",
        name: "David Wilson",
        email: "david.wilson@carecloud.com",
        role: "Chief Technology Officer",
        level: "executive",
        department: "technology",
        directReports: ["emp002", "emp008"],
        hireDate: "2022-01-15",
        status: "active",
        permissions: ["manage_organization", "assign_objectives", "approve_objectives", "view_all_reports"],
        lastLogin: "2025-08-12",
        objectivesCount: 5,
        completionRate: 95
      },
      {
        id: "emp002",
        name: "Sarah Johnson",
        email: "sarah.johnson@carecloud.com",
        role: "Customer Success Director",
        level: "senior_manager",
        department: "customer_success",
        managerId: "emp001",
        directReports: ["emp003", "emp004", "emp005"],
        hireDate: "2022-03-20",
        status: "active",
        permissions: ["assign_objectives", "approve_team_objectives", "view_team_reports"],
        lastLogin: "2025-08-12",
        objectivesCount: 6,
        completionRate: 88
      },
      {
        id: "emp003",
        name: "John Smith",
        email: "john.smith@carecloud.com",
        role: "Senior Customer Success Manager",
        level: "manager",
        department: "customer_success",
        managerId: "emp002",
        directReports: ["emp006"],
        hireDate: "2022-06-10",
        status: "active",
        permissions: ["assign_team_objectives", "view_team_performance"],
        lastLogin: "2025-08-11",
        objectivesCount: 5,
        completionRate: 85
      },
      {
        id: "emp004",
        name: "Emily Davis",
        email: "emily.davis@carecloud.com",
        role: "Customer Success Manager",
        level: "manager",
        department: "customer_success",
        managerId: "emp002",
        directReports: ["emp007"],
        hireDate: "2022-08-15",
        status: "active",
        permissions: ["assign_team_objectives", "view_team_performance"],
        lastLogin: "2025-08-12",
        objectivesCount: 4,
        completionRate: 75
      },
      {
        id: "emp005",
        name: "Michael Chen",
        email: "michael.chen@carecloud.com",
        role: "Customer Success Manager",
        level: "manager",
        department: "customer_success",
        managerId: "emp002",
        directReports: [],
        hireDate: "2023-01-10",
        status: "active",
        permissions: ["view_own_performance"],
        lastLogin: "2025-08-10",
        objectivesCount: 3,
        completionRate: 60
      },
      {
        id: "emp006",
        name: "Lisa Rodriguez",
        email: "lisa.rodriguez@carecloud.com",
        role: "Customer Success Specialist",
        level: "employee",
        department: "customer_success",
        managerId: "emp003",
        directReports: [],
        hireDate: "2023-02-20",
        status: "active",
        permissions: ["view_own_performance"],
        lastLogin: "2025-08-11",
        objectivesCount: 4,
        completionRate: 80
      },
      {
        id: "emp007",
        name: "Alex Thompson",
        email: "alex.thompson@carecloud.com",
        role: "Junior Customer Success Manager",
        level: "employee",
        department: "customer_success",
        managerId: "emp004",
        directReports: [],
        hireDate: "2023-05-15",
        status: "active",
        permissions: ["view_own_performance"],
        lastLogin: "2025-08-12",
        objectivesCount: 3,
        completionRate: 70
      },
      {
        id: "emp008",
        name: "Dr. Amanda Foster",
        email: "amanda.foster@carecloud.com",
        role: "Head of HR",
        level: "senior_manager",
        department: "human_resources",
        managerId: "emp001",
        directReports: ["emp009"],
        hireDate: "2022-02-01",
        status: "active",
        permissions: ["manage_employees", "define_bonus_structures", "view_all_reports"],
        lastLogin: "2025-08-12",
        objectivesCount: 5,
        completionRate: 92
      },
      {
        id: "emp009",
        name: "Robert Kim",
        email: "robert.kim@carecloud.com",
        role: "HR Business Partner",
        level: "manager",
        department: "human_resources",
        managerId: "emp008",
        directReports: [],
        hireDate: "2022-09-12",
        status: "active",
        permissions: ["manage_employee_records", "process_approvals"],
        lastLogin: "2025-08-11",
        objectivesCount: 4,
        completionRate: 85
      }
    ];

    // Load departments
    const mockDepartments: Department[] = [
      {
        id: "technology",
        name: "Technology",
        description: "Software development, infrastructure, and technical operations",
        headId: "emp001",
        employeeCount: 2,
        objectives: ["Digital transformation", "System scalability", "Security enhancement"],
        status: "active"
      },
      {
        id: "customer_success",
        name: "Customer Success",
        description: "Customer relationship management, support, and growth",
        headId: "emp002",
        employeeCount: 6,
        objectives: ["Customer satisfaction", "Retention improvement", "Growth initiatives"],
        status: "active"
      },
      {
        id: "human_resources",
        name: "Human Resources",
        description: "Employee management, compliance, and organizational development",
        headId: "emp008",
        employeeCount: 2,
        objectives: ["Talent acquisition", "Employee development", "Compliance management"],
        status: "active"
      }
    ];

    // Load roles
    const mockRoles: Role[] = [
      {
        id: "executive",
        title: "Executive Leadership",
        level: "executive",
        permissions: ["manage_organization", "assign_objectives", "approve_objectives", "view_all_reports", "strategic_planning"],
        canAssignObjectives: true,
        canApproveObjectives: true,
        canManageTeam: true,
        canViewReports: true,
        description: "C-level executives with full organizational authority"
      },
      {
        id: "senior_manager",
        title: "Senior Management",
        level: "senior_manager",
        permissions: ["assign_objectives", "approve_team_objectives", "view_team_reports", "manage_department"],
        canAssignObjectives: true,
        canApproveObjectives: true,
        canManageTeam: true,
        canViewReports: true,
        description: "Department heads and senior leaders"
      },
      {
        id: "manager",
        title: "Management",
        level: "manager",
        permissions: ["assign_team_objectives", "view_team_performance", "approve_team_actions"],
        canAssignObjectives: true,
        canApproveObjectives: false,
        canManageTeam: true,
        canViewReports: false,
        description: "Team managers and supervisors"
      },
      {
        id: "employee",
        title: "Employee",
        level: "employee",
        permissions: ["view_own_performance", "submit_objectives", "request_approvals"],
        canAssignObjectives: false,
        canApproveObjectives: false,
        canManageTeam: false,
        canViewReports: false,
        description: "Individual contributors and specialists"
      }
    ];

    setEmployees(mockEmployees);
    setDepartments(mockDepartments);
    setRoles(mockRoles);
  };

  const buildHierarchy = (): HierarchyNode[] => {
    const employeeMap = new Map(employees.map(emp => [emp.id, emp]));
    const rootNodes: HierarchyNode[] = [];

    // Find root employees (those without managers)
    const rootEmployees = employees.filter(emp => !emp.managerId);

    const buildNode = (employee: Employee): HierarchyNode => {
      const children = employee.directReports
        .map(reportId => employeeMap.get(reportId))
        .filter(Boolean)
        .map(emp => buildNode(emp!));

      return { employee, children };
    };

    rootEmployees.forEach(emp => {
      rootNodes.push(buildNode(emp));
    });

    return rootNodes;
  };

  const handleCreateEmployee = (newEmployee: Partial<Employee>) => {
    const employee: Employee = {
      id: `emp${Date.now()}`,
      name: newEmployee.name!,
      email: newEmployee.email!,
      role: newEmployee.role!,
      level: newEmployee.level!,
      department: newEmployee.department!,
      managerId: newEmployee.managerId,
      directReports: [],
      hireDate: new Date().toISOString().split('T')[0],
      status: 'active',
      permissions: roles.find(r => r.level === newEmployee.level)?.permissions || [],
      lastLogin: new Date().toISOString().split('T')[0],
      objectivesCount: 0,
      completionRate: 0
    };

    // Update manager's direct reports
    if (employee.managerId) {
      setEmployees(prev => prev.map(emp => 
        emp.id === employee.managerId 
          ? { ...emp, directReports: [...emp.directReports, employee.id] }
          : emp
      ));
    }

    setEmployees(prev => [...prev, employee]);
    setIsCreateMode(false);
  };

  const handleUpdateEmployee = (updatedEmployee: Employee) => {
    setEmployees(prev => prev.map(emp => 
      emp.id === updatedEmployee.id ? updatedEmployee : emp
    ));
    setEditingEmployee(null);
  };

  const handleDeleteEmployee = (employeeId: string) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      // Remove from manager's direct reports
      const employee = employees.find(emp => emp.id === employeeId);
      if (employee?.managerId) {
        setEmployees(prev => prev.map(emp => 
          emp.id === employee.managerId 
            ? { ...emp, directReports: emp.directReports.filter(id => id !== employeeId) }
            : emp
        ));
      }

      // Remove employee
      setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
    }
  };

  const filteredEmployees = selectedDepartment === 'all' 
    ? employees 
    : employees.filter(emp => emp.department === selectedDepartment);

  const getLevelIcon = (level: Employee['level']) => {
    switch (level) {
      case 'executive':
        return <ShieldCheckIcon className="h-5 w-5 text-purple-600" />;
      case 'senior_manager':
        return <BriefcaseIcon className="h-5 w-5 text-blue-600" />;
      case 'manager':
        return <UsersIcon className="h-5 w-5 text-green-600" />;
      case 'employee':
        return <UserGroupIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getLevelColor = (level: Employee['level']) => {
    switch (level) {
      case 'executive':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'senior_manager':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'manager':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'employee':
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Organization Management</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage organizational hierarchy, roles, and employee structure
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {[
              { id: 'hierarchy', name: 'Org Hierarchy', icon: BuildingOfficeIcon },
              { id: 'employees', name: 'Employee Management', icon: UserGroupIcon },
              { id: 'departments', name: 'Departments', icon: BriefcaseIcon },
              { id: 'roles', name: 'Roles & Permissions', icon: CogIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`${
                  activeTab === tab.id
                    ? 'border-[#004E9E] text-[#004E9E]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'hierarchy' && (
          <OrganizationHierarchy 
            hierarchyNodes={buildHierarchy()}
            onEditEmployee={setEditingEmployee}
          />
        )}

        {activeTab === 'employees' && (
          <EmployeeManagement
            employees={filteredEmployees}
            departments={departments}
            roles={roles}
            selectedDepartment={selectedDepartment}
            setSelectedDepartment={setSelectedDepartment}
            isCreateMode={isCreateMode}
            setIsCreateMode={setIsCreateMode}
            editingEmployee={editingEmployee}
            setEditingEmployee={setEditingEmployee}
            onCreateEmployee={handleCreateEmployee}
            onUpdateEmployee={handleUpdateEmployee}
            onDeleteEmployee={handleDeleteEmployee}
          />
        )}

        {activeTab === 'departments' && (
          <DepartmentManagement
            departments={departments}
            employees={employees}
            setDepartments={setDepartments}
          />
        )}

        {activeTab === 'roles' && (
          <RoleManagement
            roles={roles}
            setRoles={setRoles}
          />
        )}
      </div>
    </div>
  );
}

// Organization Hierarchy Component
function OrganizationHierarchy({ 
  hierarchyNodes, 
  onEditEmployee 
}: { 
  hierarchyNodes: HierarchyNode[];
  onEditEmployee: (employee: Employee) => void;
}) {
  const renderHierarchyNode = (node: HierarchyNode, level: number = 0) => {
    const { employee, children } = node;
    
    return (
      <div key={employee.id} className={`${level > 0 ? 'ml-8' : ''}`}>
        <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
          <div className="h-12 w-12 rounded-full bg-[#004E9E] flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {employee.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900">{employee.name}</h3>
            <p className="text-xs text-gray-500">{employee.role}</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getLevelColor(employee.level)}`}>
                {getLevelIcon(employee.level)}
                <span className="ml-1 capitalize">{employee.level.replace('_', ' ')}</span>
              </span>
              <span className="text-xs text-gray-500">
                {employee.directReports.length} direct reports
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{employee.completionRate}%</p>
            <p className="text-xs text-gray-500">completion</p>
          </div>
          <button
            onClick={() => onEditEmployee(employee)}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
        </div>
        
        {children.length > 0 && (
          <div className="relative">
            {level < 3 && (
              <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-300"></div>
            )}
            {children.map(child => renderHierarchyNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const getLevelIcon = (level: Employee['level']) => {
    switch (level) {
      case 'executive':
        return <ShieldCheckIcon className="h-4 w-4" />;
      case 'senior_manager':
        return <BriefcaseIcon className="h-4 w-4" />;
      case 'manager':
        return <UsersIcon className="h-4 w-4" />;
      case 'employee':
        return <UserGroupIcon className="h-4 w-4" />;
    }
  };

  const getLevelColor = (level: Employee['level']) => {
    switch (level) {
      case 'executive':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'senior_manager':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'manager':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'employee':
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Organizational Structure</h3>
        <div className="space-y-4">
          {hierarchyNodes.map(node => renderHierarchyNode(node))}
        </div>
      </div>
    </div>
  );
}

// Employee Management Component
function EmployeeManagement({
  employees,
  departments,
  roles,
  selectedDepartment,
  setSelectedDepartment,
  isCreateMode,
  setIsCreateMode,
  editingEmployee,
  setEditingEmployee,
  onCreateEmployee,
  onUpdateEmployee,
  onDeleteEmployee
}: any) {
  return (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="border-gray-300 rounded-md shadow-sm focus:ring-[#004E9E] focus:border-[#004E9E]"
          >
            <option value="all">All Departments</option>
            {departments.map((dept: Department) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setIsCreateMode(true)}
          className="px-4 py-2 bg-[#004E9E] text-white rounded-md hover:bg-[#003875] flex items-center space-x-2"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Employee Creation/Edit Form */}
      {(isCreateMode || editingEmployee) && (
        <EmployeeForm
          employee={editingEmployee}
          departments={departments}
          roles={roles}
          employees={employees}
          onSave={editingEmployee ? onUpdateEmployee : onCreateEmployee}
          onCancel={() => {
            setIsCreateMode(false);
            setEditingEmployee(null);
          }}
        />
      )}

      {/* Employee Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Employees ({employees.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role & Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Manager
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.map((employee: Employee) => (
                <EmployeeRow
                  key={employee.id}
                  employee={employee}
                  employees={employees}
                  departments={departments}
                  onEdit={setEditingEmployee}
                  onDelete={onDeleteEmployee}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Employee Row Component
function EmployeeRow({ 
  employee, 
  employees, 
  departments, 
  onEdit, 
  onDelete 
}: { 
  employee: Employee; 
  employees: Employee[]; 
  departments: Department[]; 
  onEdit: (employee: Employee) => void; 
  onDelete: (id: string) => void; 
}) {
  const manager = employees.find(emp => emp.id === employee.managerId);
  const department = departments.find(dept => dept.id === employee.department);

  const getLevelIcon = (level: Employee['level']) => {
    switch (level) {
      case 'executive':
        return <ShieldCheckIcon className="h-4 w-4 text-purple-600" />;
      case 'senior_manager':
        return <BriefcaseIcon className="h-4 w-4 text-blue-600" />;
      case 'manager':
        return <UsersIcon className="h-4 w-4 text-green-600" />;
      case 'employee':
        return <UserGroupIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const getLevelColor = (level: Employee['level']) => {
    switch (level) {
      case 'executive':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'senior_manager':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'manager':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'employee':
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-[#004E9E] flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {employee.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{employee.name}</div>
            <div className="text-sm text-gray-500">{employee.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{employee.role}</div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getLevelColor(employee.level)}`}>
          {getLevelIcon(employee.level)}
          <span className="ml-1 capitalize">{employee.level.replace('_', ' ')}</span>
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {department?.name || 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {manager ? manager.name : 'None'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
            <div 
              className="bg-[#004E9E] h-2 rounded-full" 
              style={{ width: `${employee.completionRate}%` }}
            ></div>
          </div>
          <span className="text-sm text-gray-900">{employee.completionRate}%</span>
        </div>
        <div className="text-xs text-gray-500">{employee.objectivesCount} objectives</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          employee.status === 'active' ? 'bg-green-100 text-green-800' :
          employee.status === 'inactive' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {employee.status === 'active' ? <CheckCircleIcon className="h-3 w-3 mr-1" /> : 
           <ExclamationTriangleIcon className="h-3 w-3 mr-1" />}
          {employee.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <button
          onClick={() => onEdit(employee)}
          className="text-[#004E9E] hover:text-[#003875] mr-4"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(employee.id)}
          className="text-red-600 hover:text-red-700"
        >
          Delete
        </button>
      </td>
    </tr>
  );
}

// Employee Form Component
function EmployeeForm({ 
  employee, 
  departments, 
  roles, 
  employees, 
  onSave, 
  onCancel 
}: any) {
  const [formData, setFormData] = useState({
    name: employee?.name || '',
    email: employee?.email || '',
    role: employee?.role || '',
    level: employee?.level || 'employee',
    department: employee?.department || '',
    managerId: employee?.managerId || ''
  });

  const potentialManagers = employees.filter((emp: Employee) => 
    emp.level !== 'employee' && emp.id !== employee?.id
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(employee ? { ...employee, ...formData } : formData);
  };

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {employee ? 'Edit Employee' : 'Add New Employee'}
      </h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-[#004E9E] focus:border-[#004E9E]"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-[#004E9E] focus:border-[#004E9E]"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role Title</label>
          <input
            type="text"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-[#004E9E] focus:border-[#004E9E]"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
          <select
            value={formData.level}
            onChange={(e) => setFormData({ ...formData, level: e.target.value as Employee['level'] })}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-[#004E9E] focus:border-[#004E9E]"
          >
            {roles.map((role: Role) => (
              <option key={role.level} value={role.level}>
                {role.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
          <select
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-[#004E9E] focus:border-[#004E9E]"
            required
          >
            <option value="">Select Department</option>
            {departments.map((dept: Department) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Manager</label>
          <select
            value={formData.managerId}
            onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-[#004E9E] focus:border-[#004E9E]"
          >
            <option value="">No Manager</option>
            {potentialManagers.map((manager: Employee) => (
              <option key={manager.id} value={manager.id}>
                {manager.name} - {manager.role}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2 flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#004E9E] hover:bg-[#003875]"
          >
            {employee ? 'Update' : 'Create'} Employee
          </button>
        </div>
      </form>
    </div>
  );
}

// Department Management Component
function DepartmentManagement({ 
  departments, 
  employees, 
  setDepartments 
}: { 
  departments: Department[]; 
  employees: Employee[]; 
  setDepartments: (departments: Department[]) => void; 
}) {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((department) => {
            const deptEmployees = employees.filter(emp => emp.department === department.id);
            const head = employees.find(emp => emp.id === department.headId);
            
            return (
              <div key={department.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{department.name}</h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    department.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {department.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4">{department.description}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Head:</span>
                    <span className="font-medium">{head?.name || 'Not assigned'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Employees:</span>
                    <span className="font-medium">{deptEmployees.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Avg Performance:</span>
                    <span className="font-medium">
                      {deptEmployees.length > 0 
                        ? Math.round(deptEmployees.reduce((sum, emp) => sum + emp.completionRate, 0) / deptEmployees.length)
                        : 0
                      }%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Role Management Component
function RoleManagement({ 
  roles, 
  setRoles 
}: { 
  roles: Role[]; 
  setRoles: (roles: Role[]) => void; 
}) {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Definitions & Permissions</h3>
        <div className="space-y-4">
          {roles.map((role) => (
            <div key={role.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{role.title}</h4>
                  <p className="text-sm text-gray-600">{role.description}</p>
                </div>
                <div className="flex space-x-2">
                  {role.canAssignObjectives && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Assign Objectives
                    </span>
                  )}
                  {role.canApproveObjectives && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Approve Objectives
                    </span>
                  )}
                  {role.canManageTeam && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Manage Team
                    </span>
                  )}
                  {role.canViewReports && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      View Reports
                    </span>
                  )}
                </div>
              </div>
              <div className="text-sm text-gray-500">
                <strong>Permissions:</strong> {role.permissions.join(', ')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
