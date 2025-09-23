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
  password: string;
}

export default function EmployeeEnrollmentPage() {
  const { user, isLoading } = useAuth(true, ['HR', 'hr', 'SENIOR_MANAGEMENT', 'senior-management']);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [managers, setManagers] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
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

  // Fetch potential managers
  const fetchManagers = async () => {
    try {
      const response = await fetch('/api/mbo/users?role=MANAGER');
      const data = await response.json();
      
      if (data.success) {
        setManagers(data.data);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Reset teamId when department changes
    if (name === 'departmentId') {
      setForm(prev => ({ ...prev, teamId: "" }));
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
    
    // Reset teamId when department changes
    if (name === 'departmentId') {
      setEditForm(prev => ({ ...prev, teamId: "" }));
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
      salary: "",
      password: "" // Leave empty for edit
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/mbo/users/${editingEmployee.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editForm,
          departmentId: editForm.departmentId || null,
          teamId: editForm.teamId || null,
          managerId: editForm.managerId || null,
          // Only include password if it's provided
          ...(editForm.password && { password: editForm.password })
        }),
      });

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
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-1" key="employee-form">
            <h2 className="text-xl font-semibold text-text-dark mb-4">Add New Employee</h2>
            
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

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-dark">Full Name *</label>
                <input 
                  name="name" 
                  value={form.name} 
                  onChange={handleChange} 
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary" 
                  placeholder="Enter employee's full name"
                  autoComplete="off"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-dark">Email *</label>
                <input 
                  type="email" 
                  name="email" 
                  value={form.email} 
                  onChange={handleChange} 
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary" 
                  placeholder="employee@carecloud.com"
                  autoComplete="off"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-dark">Role *</label>
                <select 
                  name="role" 
                  value={form.role} 
                  onChange={handleChange} 
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                  required
                >
                  <option value="EMPLOYEE">Employee</option>
                  <option value="MANAGER">Manager</option>
                  <option value="HR">HR</option>
                  <option value="SENIOR_MANAGEMENT">Senior Management</option>
                </select>
              </div>

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
                <label className="block text-sm font-medium text-text-dark">Job Title</label>
                <input 
                  name="title" 
                  value={form.title} 
                  onChange={handleChange} 
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary" 
                  placeholder="e.g., Software Engineer, HR Manager"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-dark">Department</label>
                <select 
                  name="departmentId" 
                  value={form.departmentId} 
                  onChange={handleChange} 
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark">Manager</label>
                <select 
                  name="managerId" 
                  value={form.managerId} 
                  onChange={handleChange} 
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">Select Manager</option>
                  {managers.map(manager => (
                    <option key={manager.id} value={manager.id}>{manager.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark">Hire Date</label>
                  <input 
                    type="date" 
                    name="hireDate" 
                    value={form.hireDate} 
                    onChange={handleChange} 
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-dark">Employee ID *</label>
                  <input 
                    name="employeeId" 
                    value={form.employeeId} 
                    onChange={handleChange} 
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary" 
                    placeholder="e.g., CC001, EMP123"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark">Phone</label>
                  <input 
                    name="phone" 
                    value={form.phone} 
                    onChange={handleChange} 
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary" 
                    placeholder="e.g., +1 (555) 123-4567"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-dark">Salary</label>
                  <input 
                    name="salary" 
                    value={form.salary} 
                    onChange={handleChange} 
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary" 
                    placeholder="e.g., 75000"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-2 rounded-lg bg-primary text-white hover:bg-[#003d7c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Adding Employee...' : 'Add Employee'}
              </button>
            </div>
          </form>

          {/* Employee List */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-text-dark">CareCloud Employees</h2>
              <div className="text-sm text-text-light">
                Total: {employees.length} employees
              </div>
            </div>

            {loading && employees.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2 text-text-light">Loading employees...</span>
              </div>
            ) : employees.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <p className="text-text-light">No employees found. Add your first employee to get started.</p>
              </div>
            ) : (
              /* Scrollable Employee Display Box */
              <div className="border border-gray-200 rounded-lg">
                {/* Header */}
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="col-span-3">Employee</div>
                    <div className="col-span-2">Role</div>
                    <div className="col-span-2">Department</div>
                    <div className="col-span-2">Manager</div>
                    <div className="col-span-2">Employee ID</div>
                    <div className="col-span-1 text-right">Actions</div>
                  </div>
                </div>

                {/* Scrollable Content - Height matches form height minus header */}
                <div className="h-[600px] overflow-y-auto">
                  <div className="divide-y divide-gray-200">
                    {employees.map(emp => (
                      <div key={emp.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                        <div className="grid grid-cols-12 gap-4 items-center">
                          {/* Employee Info */}
                          <div className="col-span-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-medium flex-shrink-0">
                                {emp.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-text-dark text-sm truncate">{emp.name}</div>
                                <div className="text-text-light text-xs truncate">{emp.email}</div>
                              </div>
                            </div>
                          </div>

                          {/* Role */}
                          <div className="col-span-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              emp.role === 'SENIOR_MANAGEMENT' ? 'bg-purple-100 text-purple-800' :
                              emp.role === 'HR' ? 'bg-blue-100 text-blue-800' :
                              emp.role === 'MANAGER' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {emp.role.replace('_', ' ')}
                            </span>
                          </div>

                          {/* Department */}
                          <div className="col-span-2">
                            <div className="text-sm text-text-light truncate">
                              {emp.department?.name || 'Unassigned'}
                            </div>
                          </div>

                          {/* Manager */}
                          <div className="col-span-2">
                            <div className="text-sm text-text-light truncate">
                              {emp.manager?.name || 'No Manager'}
                            </div>
                          </div>

                          {/* Employee ID */}
                          <div className="col-span-2">
                            <div className="text-sm text-text-light font-mono truncate">
                              {emp.employeeId || 'N/A'}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="col-span-1 text-right space-x-2">
                            <button 
                              onClick={() => handleEdit(emp)} 
                              disabled={loading}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                              title={`Edit ${emp.name}`}
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => removeEmployee(emp)} 
                              disabled={loading}
                              className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                              title={`Remove ${emp.name}`}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer with scroll indicator */}
                {employees.length > 6 && (
                  <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
                    <div className="text-xs text-gray-500 text-center">
                      Scroll to view all {employees.length} employees
                    </div>
                  </div>
                )}
              </div>
            )}
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
