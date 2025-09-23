'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function QuickLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Sample users for quick login (these match our seeded data)
  const sampleUsers = [
    { 
      email: 'crystal.williams@company.com', 
      name: 'Crystal Williams', 
      role: 'SENIOR_MANAGEMENT',
      title: 'Operations President',
      department: 'Operations'
    },
    { 
      email: 'hadi.chaudhary@company.com', 
      name: 'Hadi Chaudhary', 
      role: 'SENIOR_MANAGEMENT',
      title: 'IT President',
      department: 'Information Technology'
    },
    { 
      email: 'linda.johnson@company.com', 
      name: 'Linda Johnson', 
      role: 'MANAGER',
      title: 'Customer Service Manager',
      department: 'Operations'
    },
    { 
      email: 'michael.brown@company.com', 
      name: 'Michael Brown', 
      role: 'MANAGER',
      title: 'Software Development Manager',
      department: 'Information Technology'
    },
    { 
      email: 'emily.davis@company.com', 
      name: 'Emily Davis', 
      role: 'EMPLOYEE',
      title: 'Customer Service Representative',
      department: 'Operations'
    },
    { 
      email: 'david.wilson@company.com', 
      name: 'David Wilson', 
      role: 'EMPLOYEE',
      title: 'Software Developer',
      department: 'Information Technology'
    },
  ];

  const handleQuickLogin = async (userEmail: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/mbo/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Store user info in localStorage for session management
        localStorage.setItem('mbo_user', JSON.stringify(result.user));
        
        // Redirect to dashboard
        router.push('/emp-dashboard');
      } else {
        alert('Login failed: ' + result.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SENIOR_MANAGEMENT':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'MANAGER':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'HR':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            MBO System - Quick Login
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Select a user to instantly access the live database dashboard
          </p>
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            Live Database Connected
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {sampleUsers.map((user) => (
            <div
              key={user.email}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-[#004E9E] flex items-center justify-center">
                  <span className="text-white font-medium text-lg">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                  {user.role.replace('_', ' ')}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{user.name}</h3>
              <p className="text-sm text-gray-600 mb-1">{user.title}</p>
              <p className="text-sm text-gray-500 mb-4">{user.department}</p>
              <p className="text-xs text-gray-400 mb-4">{user.email}</p>
              
              <button
                onClick={() => handleQuickLogin(user.email)}
                disabled={loading}
                className="w-full bg-[#004E9E] text-white py-2 px-4 rounded-lg hover:bg-[#003875] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Logging in...' : 'Login as ' + user.name.split(' ')[0]}
              </button>
            </div>
          ))}
        </div>

        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Use Regular Login Form
            </button>
            <button
              onClick={() => router.push('/emp-dashboard')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Employee Dashboard
            </button>
            <button
              onClick={() => router.push('/mbo-test')}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Database Test Interface
            </button>
          </div>
          
          <p className="text-sm text-gray-500">
            This quick login demonstrates the live database integration with real organizational data
          </p>
        </div>
      </div>
    </div>
  );
}
