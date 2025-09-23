'use client';

import React, { useState, useEffect } from 'react';

export default function DebugPage() {
  const [debugData, setDebugData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDebugData();
  }, []);

  const loadDebugData = async () => {
    try {
      const response = await fetch('/api/debug/database');
      const data = await response.json();
      setDebugData(data);
    } catch (error) {
      console.error('Error loading debug data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004E9E] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading debug data...</p>
        </div>
      </div>
    );
  }

  if (!debugData?.success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error loading debug data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Database Debug Information</h1>
          <p className="mt-1 text-sm text-gray-500">
            Current state of the MBO database
          </p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Total Users</h3>
            <p className="text-3xl font-bold text-[#004E9E]">{debugData.summary.totalUsers}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Total Objectives</h3>
            <p className="text-3xl font-bold text-[#007BFF]">{debugData.summary.totalObjectives}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Manager-Employee Relations</h3>
            <p className="text-3xl font-bold text-green-600">{debugData.summary.relationships}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">User Roles</h3>
            <p className="text-3xl font-bold text-purple-600">{debugData.summary.usersByRole.length}</p>
          </div>
        </div>

        {/* Users by Role */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Users by Role</h3>
          </div>
          <div className="p-6">
            {debugData.summary.usersByRole.map((roleGroup: any) => (
              <div key={roleGroup.role} className="mb-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">
                  {roleGroup.role} ({roleGroup.count} users)
                </h4>
                <div className="space-y-2">
                  {debugData.data.users[roleGroup.role]?.map((user: any) => (
                    <div key={user.id} className="flex items-center space-x-4 text-sm">
                      <span className="font-medium text-gray-900">{user.name}</span>
                      <span className="text-gray-500">{user.email}</span>
                      <span className="text-gray-400">{user.title || 'No title'}</span>
                      <span className="text-xs text-gray-400">ID: {user.id}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Manager-Employee Relationships */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Manager-Employee Relationships</h3>
          </div>
          <div className="p-6">
            {debugData.data.managerEmployeeRelationships.length > 0 ? (
              <div className="space-y-4">
                {debugData.data.managerEmployeeRelationships.map((rel: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{rel.employee}</h4>
                        <p className="text-sm text-gray-500">{rel.employeeEmail}</p>
                        <p className="text-xs text-gray-400">Employee ID: {rel.employeeId}</p>
                      </div>
                      <div className="text-right">
                        <h4 className="font-medium text-gray-900">Manager: {rel.manager}</h4>
                        <p className="text-sm text-gray-500">{rel.managerEmail}</p>
                        <p className="text-xs text-gray-400">Manager ID: {rel.managerId}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No manager-employee relationships found</p>
                <p className="text-sm text-gray-400 mt-2">Employees need to have a managerId assigned</p>
              </div>
            )}
          </div>
        </div>

        {/* Objectives */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Objectives</h3>
          </div>
          <div className="p-6">
            {debugData.data.objectives.length > 0 ? (
              <div className="space-y-4">
                {debugData.data.objectives.map((obj: any) => (
                  <div key={obj.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{obj.title}</h4>
                        <p className="text-sm text-gray-500">
                          Employee: {obj.user?.name} ({obj.user?.email})
                        </p>
                        <p className="text-sm text-gray-500">
                          Assigned by: {obj.assignedBy?.name || 'System'} ({obj.assignedBy?.email || 'N/A'})
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          obj.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          obj.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                          obj.status === 'ACTIVE' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {obj.status}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">ID: {obj.id}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No objectives found</p>
                <p className="text-sm text-gray-400 mt-2">Create some objectives to see them here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
