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
    <div className="min-h-screen bg-gradient-to-br from-accent-50 to-accent-100 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold text-primary mb-2">CareCloud</h1>
            <p className="text-text-light text-lg">MBO System</p>
          </Link>
        </div>

        {/* Login Form */}
        <div className="card">
          <h2 className="text-2xl font-bold text-text text-center mb-6">Sign In</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter your password"
                required
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-text mb-2">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="input-field"
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
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-text-light">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-primary hover:text-primary-700">
                  Forgot your password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-3 text-lg"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-text-light">
              Don't have an account?{" "}
              <a href="#" className="font-medium text-primary hover:text-primary-700">
                Contact your administrator
              </a>
            </p>
          </div>
        </div>

        {/* Demo Access */}
        <div className="mt-6 card bg-accent-100">
          <h3 className="text-lg font-semibold text-text mb-3">Demo Access</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="font-medium text-text">Employee</p>
              <p className="text-text-light">employee@carecloud.com</p>
            </div>
            <div>
              <p className="font-medium text-text">Manager</p>
              <p className="text-text-light">manager@carecloud.com</p>
            </div>
            <div>
              <p className="font-medium text-text">HR</p>
              <p className="text-text-light">hr@carecloud.com</p>
            </div>
            <div>
              <p className="font-medium text-text">Senior Mgmt</p>
              <p className="text-text-light">exec@carecloud.com</p>
            </div>
          </div>
          <p className="text-xs text-text-light mt-2">Password: demo123 for all accounts</p>
        </div>
      </div>
    </div>
  );
}
