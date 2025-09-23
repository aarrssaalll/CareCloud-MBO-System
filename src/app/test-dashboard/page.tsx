'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TestDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('mbo_user');
    console.log('Test Dashboard - Stored user:', storedUser);
    
    if (!storedUser) {
      console.log('No user found, redirecting to login');
      router.push('/login');
      return;
    }

    const currentUser = JSON.parse(storedUser);
    console.log('Current user:', currentUser);
    setUser(currentUser);
  }, [router]);

  if (!user) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Employee Dashboard</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Welcome Back!</h2>
          <p className="text-gray-600">Name: {user.name}</p>
          <p className="text-gray-600">Email: {user.email}</p>
          <p className="text-gray-600">Role: {user.role}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance</h3>
            <div className="text-3xl font-bold text-blue-600">87%</div>
            <p className="text-gray-500">Overall Score</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Goals</h3>
            <div className="text-3xl font-bold text-green-600">6/8</div>
            <p className="text-gray-500">Completed</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Bonus</h3>
            <div className="text-3xl font-bold text-yellow-600">$4,250</div>
            <p className="text-gray-500">This Quarter</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Objectives</h3>
          <div className="space-y-3">
            <div className="border-l-4 border-green-400 pl-4">
              <h4 className="font-medium">Performance Excellence</h4>
              <p className="text-sm text-gray-600">Maintain high performance standards</p>
              <div className="text-sm text-green-600">On Track - 85%</div>
            </div>
            <div className="border-l-4 border-yellow-400 pl-4">
              <h4 className="font-medium">Team Collaboration</h4>
              <p className="text-sm text-gray-600">Improve cross-team communication</p>
              <div className="text-sm text-yellow-600">At Risk - 78%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
