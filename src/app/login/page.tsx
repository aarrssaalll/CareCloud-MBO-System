"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "EMPLOYEE"
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Try database authentication first
      console.log('Attempting database authentication...');
      const response = await fetch('/api/mbo/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: formData.email, 
          password: formData.password,
          role: formData.role 
        }),
      });

      console.log('Auth response status:', response.status);
      const result = await response.json();
      console.log('Auth result:', result);
      
      if (result.success) {
        console.log('Database authentication successful!');
        // Store user info in localStorage for session management
        localStorage.setItem('mbo_user', JSON.stringify(result.user));
        // Backward compatibility - also store in 'user' key for older pages
        localStorage.setItem('user', JSON.stringify(result.user));
        
        // Role-based dashboard redirection
        switch (result.user.role) {
          case 'SENIOR_MANAGEMENT':
            router.push('/system-dashboard');
            break;
          case 'HR':
            router.push('/hr-dashboard');
            break;
          case 'MANAGER':
            router.push('/manager-dashboard');
            break;
          case 'EMPLOYEE':
          default:
            router.push('/emp-dashboard');
            break;
        }
        return;
      } else {
        // Database auth failed, show specific error
        alert(`Database authentication failed: ${result.message}`);
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.error('Database auth error:', error);
      alert('Database authentication error. Please check if the server is running.');
      setIsLoading(false);
      return;
    }

    // This code should never be reached now
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-white">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Logo and Header */}
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">CareCloud</h1>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
            <p className="text-gray-600">Sign in to your MBO dashboard</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Leave empty if not required"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="MANAGER">Manager</option>
                <option value="HR">HR</option>
                <option value="SENIOR_MANAGEMENT">Senior Management</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <a href="#" className="text-sm text-blue-600 hover:text-blue-500 font-medium">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-colors ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Live Database Users */}
          <div className="mt-6">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-sm font-medium text-blue-800 mb-3">Live Database Users</h3>
              <div className="space-y-3 text-sm text-blue-600">
                <div>
                  <p className="font-medium">crystal.williams@carecloud.com</p>
                  <p className="text-blue-500">Operations President</p>
                </div>
                <div>
                  <p className="font-medium">hadi.chaudhary@carecloud.com</p>
                  <p className="text-blue-500">IT & AI President</p>
                </div>
                <div>
                  <p className="font-medium">sarah.johnson@carecloud.com</p>
                  <p className="text-blue-500">IT Department Manager</p>
                </div>
                <div>
                  <p className="font-medium">alex.chen@carecloud.com</p>
                  <p className="text-blue-500">AI Team Lead</p>
                </div>
              </div>
              <div className="mt-3 text-center">
                <button
                  onClick={() => router.push('/emp-dashboard')}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Quick Access to Employee Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Professional Branding */}
      <div className="hidden lg:block relative w-0 flex-1 bg-gradient-to-br from-gray-900 to-gray-700">
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-white max-w-md">
            <div className="w-20 h-20 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-8 backdrop-blur-sm">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-4">Management by Objectives</h2>
            <p className="text-lg text-gray-300 mb-8">
              Streamline performance management with our comprehensive MBO platform
            </p>
            <div className="space-y-4 text-left">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-4 flex-shrink-0"></div>
                <span className="text-gray-300">Set and track strategic objectives</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-4 flex-shrink-0"></div>
                <span className="text-gray-300">Automated performance reviews</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-4 flex-shrink-0"></div>
                <span className="text-gray-300">Real-time analytics and reporting</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-4 flex-shrink-0"></div>
                <span className="text-gray-300">Bonus calculation and insights</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
