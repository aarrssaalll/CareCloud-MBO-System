"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface NewEmployee {
  name: string;
  email: string;
  role: "employee" | "manager" | "hr" | "senior-management";
  department: string;
  designation: string;
  joinDate: string;
  employeeId: string;
  avatar?: string;
}

export default function EmployeeEnrollmentPage() {
  const [user, setUser] = useState<any>(null);
  const [employees, setEmployees] = useState<NewEmployee[]>([]);
  const [form, setForm] = useState<NewEmployee>({
    name: "",
    email: "",
    role: "employee",
    department: "",
    designation: "",
    joinDate: new Date().toISOString().slice(0,10),
    employeeId: "",
    avatar: ""
  });
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) { router.push("/login"); return; }
    const parsed = JSON.parse(userData);
    setUser(parsed);
    if (parsed.role !== "hr" && parsed.role !== "senior-management") {
      router.push("/dashboard");
    }
    const saved = localStorage.getItem("mbo_employees");
    if (saved) setEmployees(JSON.parse(saved));
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const saveEmployees = (list: NewEmployee[]) => {
    setEmployees(list);
    localStorage.setItem("mbo_employees", JSON.stringify(list));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.employeeId) {
      alert("Name, Email and Employee ID are required");
      return;
    }
    if (employees.some(e => e.employeeId === form.employeeId)) {
      alert("Employee ID already exists");
      return;
    }
    const updated = [...employees, form];
    saveEmployees(updated);
    setForm({
      name: "",
      email: "",
      role: "employee",
      department: "",
      designation: "",
      joinDate: new Date().toISOString().slice(0,10),
      employeeId: "",
      avatar: ""
    });
  };

  const removeEmployee = (emp: NewEmployee) => {
    const updated = employees.filter(e => e.employeeId !== emp.employeeId);
    saveEmployees(updated);
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-dark">Employee Enrollment</h1>
          <p className="text-text-light mt-2">HR can add new employees to the MBO system</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-1">
            <h2 className="text-xl font-semibold text-text-dark mb-4">New Employee</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-dark">Name</label>
                <input name="name" value={form.name} onChange={handleChange} className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark">Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark">Role</label>
                <select name="role" value={form.role} onChange={handleChange} className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="hr">HR</option>
                  <option value="senior-management">Senior Management</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark">Department</label>
                  <input name="department" value={form.department} onChange={handleChange} className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark">Designation</label>
                  <input name="designation" value={form.designation} onChange={handleChange} className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark">Join Date</label>
                  <input type="date" name="joinDate" value={form.joinDate} onChange={handleChange} className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark">Employee ID</label>
                  <input name="employeeId" value={form.employeeId} onChange={handleChange} className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark">Avatar URL</label>
                <input name="avatar" value={form.avatar} onChange={handleChange} className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <button type="submit" className="w-full py-2 rounded-lg bg-primary text-white hover:bg-[#003d7c] transition-colors">Enroll Employee</button>
            </div>
          </form>

          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-text-dark mb-4">Enrolled Employees</h2>
            {employees.length === 0 ? (
              <p className="text-text-light">No employees enrolled yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designation</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emp ID</th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {employees.map(emp => (
                      <tr key={emp.employeeId}>
                        <td className="px-4 py-2 text-sm text-text-dark flex items-center space-x-2">
                          {emp.avatar ? <img src={emp.avatar} alt={emp.name} className="w-8 h-8 rounded-lg"/> : <div className="w-8 h-8 rounded-lg bg-gray-100"/>}
                          <span>{emp.name}</span>
                        </td>
                        <td className="px-4 py-2 text-sm text-text-light">{emp.email}</td>
                        <td className="px-4 py-2 text-sm text-text-light capitalize">{emp.role.replace('-', ' ')}</td>
                        <td className="px-4 py-2 text-sm text-text-light">{emp.department}</td>
                        <td className="px-4 py-2 text-sm text-text-light">{emp.designation}</td>
                        <td className="px-4 py-2 text-sm text-text-light">{emp.joinDate}</td>
                        <td className="px-4 py-2 text-sm text-text-light">{emp.employeeId}</td>
                        <td className="px-4 py-2 text-right">
                          <button onClick={() => removeEmployee(emp)} className="text-red-600 hover:underline text-sm">Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
