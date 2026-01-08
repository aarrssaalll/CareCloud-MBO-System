"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  title?: string;
  employeeId?: string;
  phone?: string;
  hireDate?: string;
  salary?: number;
  allocatedBonusAmount?: number;
  department?: {
    id: string;
    name: string;
  };
  team?: {
    id: string;
    name: string;
  };
  manager?: {
    id: string;
    name: string;
    email: string;
  };
}

interface Department {
  id: string;
  name: string;
  teams: Array<{
    id: string;
    name: string;
  }>;
}

interface NewEmployee {
  name: string;
  email: string;
  role: "EMPLOYEE" | "MANAGER" | "HR" | "SENIOR_MANAGEMENT";
  title: string;
  departmentId: string;
  teamId: string;
  managerId: string;
  employeeId: string;
  phone: string;
  hireDate: string;
  salary: string;
  allocatedBonusAmount: string;
  password: string;
}

export default function EmployeeEnrollmentPage() {
  const { user, isLoading } = useAuth(true, ['HR', 'hr', 'SENIOR_MANAGEMENT', 'senior-management']);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [managers, setManagers] = useState<Employee[]>([]);
  const [teams, setTeams] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState<NewEmployee>({
    name: "",
    email: "",
    role: "EMPLOYEE",
    title: "",
    departmentId: "",
    teamId: "",
    managerId: "",
    employeeId: "",
    phone: "",
    hireDate: "",
    salary: "",
    allocatedBonusAmount: "",
    password: ""
  });
  const [editForm, setEditForm] = useState<NewEmployee>({
    name: "",
    email: "",
    role: "EMPLOYEE",
    title: "",
    departmentId: "",
    teamId: "",
    managerId: "",
    employeeId: "",
    phone: "",
    hireDate: "",
    salary: "",
    allocatedBonusAmount: "",
    password: ""
  });

  // Fetch employees from database
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching employees from database...');
      
      const response = await fetch('/api/mbo/users');
      console.log('📥 Fetch employees response status:', response.status);
      
      const data = await response.json();
      console.log('📥 Fetch employees response data:', data);
      
      if (data.success) {
        setEmployees(data.data);
        setFilteredEmployees(data.data);
        console.log('✅ Employees loaded successfully:', data.data.length, 'employees');
      } else {
        setError('Failed to fetch employees');
        console.error('❌ Failed to fetch employees:', data.error);
      }
    } catch (err) {
      setError('Error loading employees');
      console.error('❌ Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch departments and teams
  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/mbo/departments');
      const data = await response.json();
      
      if (data.success) {
        setDepartments(data.data);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  // Fetch potential managers (both MANAGER and SENIOR_MANAGEMENT)
  const fetchManagers = async () => {
    try {
      const response = await fetch('/api/mbo/users');
      const data = await response.json();
      
      if (data.success) {
        // Filter to include only MANAGER and SENIOR_MANAGEMENT roles
        const managerUsers = data.data.filter((user: Employee) => 
          user.role === 'MANAGER' || user.role === 'SENIOR_MANAGEMENT'
        );
        setManagers(managerUsers);
      }
    } catch (err) {
      console.error('Error fetching managers:', err);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    fetchManagers();
  }, []);

  // Add keyboard shortcut to focus search (Ctrl/Cmd + K)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('employee-search');
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredEmployees(employees);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = employees.filter(emp => {
      // Search in multiple fields
      const searchableFields = [
        emp.name?.toLowerCase() || '',
        emp.email?.toLowerCase() || '',
        emp.employeeId?.toLowerCase() || '',
        emp.title?.toLowerCase() || '',
        emp.role?.toLowerCase().replace('_', ' ') || '',
        emp.department?.name?.toLowerCase() || '',
        emp.manager?.name?.toLowerCase() || '',
        emp.phone?.toLowerCase() || ''
      ];

      return searchableFields.some(field => field.includes(query));
    });

    setFilteredEmployees(filtered);
  }, [searchQuery, employees]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  // Highlight search matches in text
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim() || !text) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 py-0.5 rounded text-gray-900 font-medium">
          {part}
        </mark>
      ) : part
    );
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      clearSearch();
    }
  };

  // Get available managers based on role hierarchy
  const getAvailableManagers = (selectedRole: string) => {
    switch (selectedRole) {
      case 'EMPLOYEE':
        // Employees can have managers
        return managers.filter(manager => 
          manager.role === 'MANAGER'
        );
      case 'MANAGER':
        // Managers can have senior management as managers
        return managers.filter(manager => 
          manager.role === 'SENIOR_MANAGEMENT'
        );
      case 'HR':
        // HR doesn't have managers in the hierarchy
        return [];
      case 'SENIOR_MANAGEMENT':
        // Senior management doesn't have managers (top of company)
        return [];
      default:
        return managers;
    }
  };

  // Auto-dismiss success message after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Auto-dismiss error message after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Reset teamId and fetch teams when department changes
    if (name === 'departmentId') {
      setForm(prev => ({ ...prev, teamId: "" }));
      if (value) {
        try {
          console.log('🔍 Fetching teams for departmentId:', value);
          const response = await fetch(`/api/mbo/teams?departmentId=${value}`);
          const data = await response.json();
          console.log('📊 Teams API response:', data);
          if (data.success && data.data) {
            console.log(`✅ Found ${data.data.length} teams`);
            setTeams(data.data);
          } else {
            console.log('⚠️ No teams found or API error:', data.error);
            setTeams([]);
          }
        } catch (err) {
          console.error('❌ Error fetching teams:', err);
          setTeams([]);
        }
      } else {
        setTeams([]);
      }
    }
    // Reset managerId when role changes (due to hierarchy rules)
    if (name === 'role') {
      setForm(prev => ({ ...prev, managerId: "" }));
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
    
    // Reset teamId when department changes
    if (name === 'departmentId') {
      setEditForm(prev => ({ ...prev, teamId: "" }));
    }
    
    // Reset managerId when role changes (due to hierarchy rules)
    if (name === 'role') {
      setEditForm(prev => ({ ...prev, managerId: "" }));
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    
    console.log('🔄 Form submission started with data:', form);
    
    if (!form.name || !form.email || !form.employeeId || !form.role || !form.password) {
      setError("Name, Email, Employee ID, Role, and Password are required");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      setLoading(true);
      console.log('📤 Sending POST request to /api/mbo/users');
      
      const response = await fetch('/api/mbo/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      console.log('📥 Response status:', response.status);
      const data = await response.json();
      console.log('📥 Response data:', data);

      if (data.success) {
        setSuccess(`Employee ${form.name} added successfully!`);
        setForm({
          name: "",
          email: "",
          role: "EMPLOYEE",
          title: "",
          departmentId: "",
          teamId: "",
          managerId: "",
          employeeId: "",
          phone: "",
          hireDate: "",
          salary: "",
          allocatedBonusAmount: "",
          password: ""
        });
        // Refresh the employee list
        fetchEmployees();
      } else {
        setError(data.error || 'Failed to add employee');
      }
    } catch (err) {
      console.error('❌ Error in handleSubmit:', err);
      setError('Error adding employee');
    } finally {
      setLoading(false);
    }
  };

  const removeEmployee = async (emp: Employee) => {
    if (!confirm(`Are you sure you want to remove ${emp.name} from the system?`)) {
      return;
    }

    try {
      setLoading(true);
      clearMessages();
      
      const response = await fetch(`/api/mbo/users/${emp.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`Employee ${emp.name} removed successfully!`);
        // Refresh the employee list
        fetchEmployees();
      } else {
        setError(data.error || 'Failed to remove employee');
      }
    } catch (err) {
      setError('Error removing employee');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setEditForm({
      name: employee.name,
      email: employee.email,
      role: employee.role as "EMPLOYEE" | "MANAGER" | "HR" | "SENIOR_MANAGEMENT",
      title: employee.title || "",
      departmentId: employee.department?.id || "",
      teamId: employee.team?.id || "",
      managerId: employee.manager?.id || "",
      employeeId: employee.employeeId || "",
      phone: employee.phone || "",
      hireDate: employee.hireDate || "",
      salary: employee.salary ? employee.salary.toString() : "",
      allocatedBonusAmount: employee.allocatedBonusAmount ? employee.allocatedBonusAmount.toString() : "",
      password: "" // Leave empty for edit
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    setLoading(true);

    try {
      console.log('🔄 Edit submission with data:', {
        id: editingEmployee.id,
        allocatedBonusAmount: editForm.allocatedBonusAmount,
        salary: editForm.salary
      });

      const response = await fetch(`/api/mbo/users/${editingEmployee.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingEmployee.id,
          ...editForm,
          departmentId: editForm.departmentId || null,
          teamId: editForm.teamId || null,
          managerId: editForm.managerId || null,
          // Only include password if it's provided
          ...(editForm.password && { password: editForm.password })
        }),
      });

      console.log('📥 Edit response status:', response.status);

      const data = await response.json();

      if (data.success) {
        setSuccess(`Employee ${editForm.name} updated successfully!`);
        fetchEmployees();
        setShowEditModal(false);
        setEditingEmployee(null);
        setEditForm({
          name: "",
          email: "",
          role: "EMPLOYEE",
          title: "",
          departmentId: "",
          teamId: "",
          managerId: "",
          employeeId: "",
          phone: "",
          hireDate: "",
          salary: "",
          allocatedBonusAmount: "",
          password: ""
        });
      } else {
        setError(data.error || 'Failed to update employee');
      }
    } catch (err) {
      setError('Error updating employee');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectedDepartment = departments.find(d => d.id === form.departmentId);

  if (isLoading || !user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-dark">Employee Enrollment</h1>
          <p className="text-text-light mt-2">HR can add new employees to the MBO system</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Employee Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-1 flex flex-col" style={{ maxHeight: '900px' }} key="employee-form">
            <h2 className="text-xl font-semibold text-text-dark mb-4">Add New Employee</h2>
            
            <div className="flex-shrink-0">
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Quick Enrollment:</span> Enter the Employee ID to automatically fetch details from the company database.
                </p>
              </div>

              {/* Success/Error Messages */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  {success}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 space-y-4 px-1">
              {/* Primary Field - Employee ID */}
              <div>
                <label className="block text-sm font-medium text-text-dark">Employee ID *</label>
                <input 
                  name="employeeId" 
                  value={form.employeeId} 
                  onChange={handleChange} 
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary text-lg font-semibold" 
                  placeholder="e.g., CC001, EMP123"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Employee details will be auto-filled from company database</p>
              </div>

              {/* Divider */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-gray-500">Auto-filled Information</span>
                </div>
              </div>
              
              {/* Auto-filled fields - Read-only appearance */}
              <div>
                <label className="block text-sm font-medium text-gray-500">Full Name</label>
                <input 
                  name="name" 
                  value={form.name} 
                  onChange={handleChange} 
                  className="mt-1 w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-gray-600" 
                  placeholder="Will be auto-filled"
                  readOnly
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Email</label>
                <input 
                  type="email" 
                  name="email" 
                  value={form.email} 
                  onChange={handleChange} 
                  className="mt-1 w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-gray-600" 
                  placeholder="Will be auto-filled"
                  readOnly
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Role</label>
                <input 
                  name="role" 
                  value={form.role.replace('_', ' ')} 
                  className="mt-1 w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-gray-600" 
                  placeholder="Will be auto-filled"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Job Title</label>
                <input 
                  name="title" 
                  value={form.title} 
                  onChange={handleChange} 
                  className="mt-1 w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-gray-600" 
                  placeholder="Will be auto-filled"
                  readOnly
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Department</label>
                <input 
                  value={departments.find(d => d.id === form.departmentId)?.name || 'Will be auto-filled'}
                  className="mt-1 w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-gray-600" 
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Phone</label>
                <input 
                  name="phone" 
                  value={form.phone} 
                  onChange={handleChange} 
                  className="mt-1 w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-gray-600" 
                  placeholder="Will be auto-filled"
                  readOnly
                />
              </div>

              {/* Divider */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-gray-500">MBO System Configuration</span>
                </div>
              </div>

              {/* Required manual fields */}
              <div>
                <label className="block text-sm font-medium text-text-dark">Password *</label>
                <input 
                  type="password" 
                  name="password" 
                  value={form.password} 
                  onChange={handleChange} 
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary" 
                  placeholder="Create secure password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 6 characters required</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark">Allocated Bonus Pool (Quarterly)</label>
                <input 
                  name="allocatedBonusAmount" 
                  value={form.allocatedBonusAmount} 
                  onChange={handleChange} 
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary" 
                  placeholder="e.g., 5000"
                />
                <p className="text-xs text-gray-500 mt-1">Optional: Set quarterly bonus allocation</p>
              </div>
            </div>

            <div className="flex-shrink-0 pt-4">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 rounded-lg bg-gradient-to-br from-[#004E9E] to-[#007BFF] text-white hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Adding Employee...' : 'Add Employee to MBO System'}
              </button>
            </div>
          </form>

          {/* Employee List */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col overflow-hidden" style={{ maxHeight: '900px' }}>
            {/* Header and Search - Fixed at top */}
            <div className="flex-shrink-0">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-text-dark">CareCloud Employees</h2>
                <div className="text-sm text-text-light">
                  {searchQuery ? `${filteredEmployees.length} of ${employees.length}` : `Total: ${employees.length}`} employees
                </div>
              </div>

              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    id="employee-search"
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Search employees by name, email, ID, role, department, or manager..."
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                    autoComplete="off"
                  />
                  {searchQuery && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        onClick={clearSearch}
                        className="text-gray-400 hover:text-gray-600 focus:outline-none"
                        title="Clear search"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Search Results Info */}
                {searchQuery && (
                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      {filteredEmployees.length === 0 ? (
                        <span className="text-red-600">No employees found matching "{searchQuery}"</span>
                      ) : (
                        <span>Found {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? 's' : ''} matching "{searchQuery}"</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      Press <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Esc</kbd> to clear
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Content Area - Scrollable */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {loading && employees.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2 text-text-light">Loading employees...</span>
                </div>
              ) : filteredEmployees.length === 0 && employees.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <p className="text-text-light">No employees found. Add your first employee to get started.</p>
                </div>
              ) : filteredEmployees.length === 0 && searchQuery ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <p className="text-text-light">No employees found matching your search.</p>
                  <button
                    onClick={clearSearch}
                    className="mt-2 text-primary hover:text-[#003d7c] text-sm font-medium"
                  >
                    Clear search to view all employees
                  </button>
                </div>
              ) : (
                /* Scrollable Employee Display Box */
                <div className="border border-gray-200 rounded-lg h-full flex flex-col overflow-hidden">
                  {/* Header */}
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex-shrink-0">
                    <div className="flex gap-3 text-xs font-medium text-gray-500 uppercase tracking-wider min-w-max">
                      <div className="w-56">Employee</div>
                      <div className="w-24">Role</div>
                      <div className="w-32">Department</div>
                      <div className="w-32">Manager</div>
                      <div className="w-24">Emp ID</div>
                      <div className="w-16 text-center">Actions</div>
                    </div>
                  </div>

                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto overflow-x-hidden">
                    <div className="divide-y divide-gray-200">
                      {filteredEmployees.map(emp => (
                        <div key={emp.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                          <div className="flex gap-3 items-center min-w-max">
                            {/* Employee Info */}
                            <div className="w-56">
                              <div className="flex items-center space-x-2">
                                <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-medium flex-shrink-0">
                                  {emp.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="font-medium text-text-dark text-xs truncate">
                                    {searchQuery ? highlightMatch(emp.name, searchQuery) : emp.name}
                                  </div>
                                  <div className="text-text-light text-xs truncate">
                                    {searchQuery ? highlightMatch(emp.email, searchQuery) : emp.email}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Role */}
                            <div className="w-24">
                              <span className={`inline-flex px-1.5 py-0.5 text-xs font-medium rounded whitespace-nowrap ${
                                emp.role === 'SENIOR_MANAGEMENT' ? 'bg-purple-100 text-purple-800' :
                                emp.role === 'HR' ? 'bg-blue-100 text-blue-800' :
                                emp.role === 'MANAGER' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {emp.role === 'SENIOR_MANAGEMENT' ? 'Senior' : 
                                 emp.role === 'MANAGER' ? 'Manager' :
                                 emp.role === 'HR' ? 'HR' : 'Employee'}
                              </span>
                            </div>

                            {/* Department */}
                            <div className="w-32">
                              <div className="text-xs text-text-light truncate">
                                {emp.department?.name ? (
                                  searchQuery ? highlightMatch(emp.department.name, searchQuery) : emp.department.name
                                ) : 'Unassigned'}
                              </div>
                            </div>

                            {/* Manager */}
                            <div className="w-32">
                              <div className="text-xs text-text-light truncate">
                                {emp.manager?.name ? (
                                  searchQuery ? highlightMatch(emp.manager.name, searchQuery) : emp.manager.name
                                ) : 'No Manager'}
                              </div>
                            </div>

                            {/* Employee ID */}
                            <div className="w-24">
                              <div className="text-xs text-text-light font-mono truncate">
                                {emp.employeeId ? (
                                  searchQuery ? highlightMatch(emp.employeeId, searchQuery) : emp.employeeId
                                ) : 'N/A'}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="w-16 flex gap-1 justify-center flex-shrink-0">
                              <button 
                                onClick={() => handleEdit(emp)} 
                                disabled={loading}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title={`Edit ${emp.name}`}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button 
                                onClick={() => removeEmployee(emp)} 
                                disabled={loading}
                                className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title={`Remove ${emp.name}`}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer with scroll indicator */}
                  {filteredEmployees.length > 6 && (
                    <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 flex-shrink-0">
                      <div className="text-xs text-gray-500 text-center">
                        Scroll to view all {filteredEmployees.length} {searchQuery ? 'matching ' : ''}employees
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Edit Employee Modal */}
      {showEditModal && editingEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Edit Employee</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingEmployee(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#004E9E] focus:border-[#004E9E]"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleEditChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#004E9E] focus:border-[#004E9E]"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select
                    name="role"
                    value={editForm.role}
                    onChange={handleEditChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#004E9E] focus:border-[#004E9E]"
                  >
                    <option value="EMPLOYEE">Employee</option>
                    <option value="MANAGER">Manager</option>
                    <option value="HR">HR</option>
                    <option value="SENIOR_MANAGEMENT">Senior Management</option>
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={editForm.title}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#004E9E] focus:border-[#004E9E]"
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <select
                    name="departmentId"
                    value={editForm.departmentId}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#004E9E] focus:border-[#004E9E]"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Team */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team
                  </label>
                  <select
                    name="teamId"
                    value={editForm.teamId}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#004E9E] focus:border-[#004E9E]"
                  >
                    <option value="">Select Team</option>
                    {(departments.find(d => d.id === editForm.departmentId)?.teams || []).map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Manager */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Manager
                  </label>
                  <select
                    name="managerId"
                    value={editForm.managerId}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#004E9E] focus:border-[#004E9E]"
                    disabled={editForm.role === 'HR' || editForm.role === 'SENIOR_MANAGEMENT'}
                  >
                    <option value="">
                      {editForm.role === 'HR' ? 'HR does not have managers' : 
                       editForm.role === 'SENIOR_MANAGEMENT' ? 'Senior Management is at top of company' :
                       getAvailableManagers(editForm.role).length === 0 ? 'No available managers' : 
                       'Select Manager'}
                    </option>
                    {getAvailableManagers(editForm.role).map(manager => (
                      <option key={manager.id} value={manager.id}>{manager.name} ({manager.role.replace('_', ' ')})</option>
                    ))}
                  </select>
                </div>

                {/* Employee ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    name="employeeId"
                    value={editForm.employeeId}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#004E9E] focus:border-[#004E9E]"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={editForm.phone}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#004E9E] focus:border-[#004E9E]"
                  />
                </div>

                {/* Hire Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hire Date
                  </label>
                  <input
                    type="date"
                    name="hireDate"
                    value={editForm.hireDate}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#004E9E] focus:border-[#004E9E]"
                  />
                </div>

                {/* Salary */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Salary
                  </label>
                  <input
                    type="number"
                    name="salary"
                    value={editForm.salary}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#004E9E] focus:border-[#004E9E]"
                  />
                </div>

                {/* Allocated Bonus Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Allocated Bonus Pool (Quarterly)
                  </label>
                  <input
                    type="number"
                    name="allocatedBonusAmount"
                    value={editForm.allocatedBonusAmount}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#004E9E] focus:border-[#004E9E]"
                  />
                </div>

                {/* Password */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password (leave blank to keep current)
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={editForm.password}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#004E9E] focus:border-[#004E9E]"
                    placeholder="Enter new password (optional)"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingEmployee(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-[#004E9E] text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Updating...' : 'Update Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
