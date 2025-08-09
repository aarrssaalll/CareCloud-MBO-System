"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "employee"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Demo authentication - check against demo credentials
    const demoCredentials = {
      "employee@carecloud.com": { role: "employee", name: "John Doe" },
      "manager@carecloud.com": { role: "manager", name: "Jane Smith" },
      "hr@carecloud.com": { role: "hr", name: "Mike Johnson" },
      "exec@carecloud.com": { role: "senior_management", name: "Sarah Wilson" }
    };

    if (formData.email in demoCredentials && formData.password === "demo123") {
      const userInfo = demoCredentials[formData.email as keyof typeof demoCredentials];
      
      // Store user info in localStorage for demo purposes
      localStorage.setItem("user", JSON.stringify({
        email: formData.email,
        role: userInfo.role,
        name: userInfo.name
      }));

      // Redirect to dashboard
      window.location.href = "/dashboard";
    } else {
      alert("Invalid credentials. Please use demo credentials:\nEmail: employee@carecloud.com\nPassword: demo123");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-ms-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        {/* Microsoft-style Login Card */}
        <div className="ms-card-elevated p-8">
          {/* Microsoft Logo Style Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-8 h-8 bg-ms-blue mr-3 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M0 0h11v11H0V0zm13 0h11v11H13V0zM0 13h11v11H0V13zm13 0h11v11H13V13z"/>
                </svg>
              </div>
              <span className="text-2xl font-semibold text-ms-gray-900">Microsoft</span>
            </div>
            <h1 className="ms-heading-3 text-ms-gray-900 mb-2">CareCloud MBO System</h1>
            <p className="ms-text-small text-ms-gray-700">Management by Objectives Platform</p>
          </div>

          <h2 className="ms-heading-4 text-center mb-6">Sign in</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block ms-text-medium font-medium text-ms-gray-800 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="ms-input w-full"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block ms-text-medium font-medium text-ms-gray-800 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="ms-input w-full"
                placeholder="Enter your password"
                required
              />
            </div>

            <div>
              <label htmlFor="role" className="block ms-text-medium font-medium text-ms-gray-800 mb-2">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="ms-input w-full"
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="hr">HR</option>
                <option value="senior_management">Senior Management</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-ms-blue focus:ring-ms-blue border-ms-gray-400 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block ms-text-small text-ms-gray-700">
                  Keep me signed in
                </label>
              </div>

              <div className="ms-text-small">
                <a href="#" className="ms-link">
                  Forgot password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              className="ms-button-primary w-full py-3 text-base font-semibold"
            >
              Sign in
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="ms-text-small text-ms-gray-700">
              Don't have an account?{" "}
              <a href="#" className="ms-link">
                Contact your administrator
              </a>
            </p>
          </div>
        </div>

        {/* Demo Access - Microsoft Style */}
        <div className="mt-6 ms-card bg-ms-gray-100 border border-ms-gray-200">
          <h3 className="ms-heading-4 text-ms-gray-900 mb-3">Demo Access</h3>
          <div className="grid grid-cols-2 gap-3 ms-text-small">
            <div>
              <p className="font-semibold text-ms-gray-800">Employee</p>
              <p className="text-ms-gray-700">employee@carecloud.com</p>
            </div>
            <div>
              <p className="font-semibold text-ms-gray-800">Manager</p>
              <p className="text-ms-gray-700">manager@carecloud.com</p>
            </div>
            <div>
              <p className="font-semibold text-ms-gray-800">HR</p>
              <p className="text-ms-gray-700">hr@carecloud.com</p>
            </div>
            <div>
              <p className="font-semibold text-ms-gray-800">Senior Mgmt</p>
              <p className="text-ms-gray-700">exec@carecloud.com</p>
            </div>
          </div>
          <p className="ms-text-small text-ms-gray-600 mt-2">Password: demo123 for all accounts</p>
        </div>
      </div>
    </div>
  );
}
