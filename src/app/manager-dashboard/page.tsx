'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  UserGroupIcon, 
  ClipboardDocumentListIcon, 
  ChartBarIcon,
  PlusIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  BellIcon,
  UsersIcon,
  XMarkIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';

// Types for the manager dashboard
interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  manager: string;
  objectivesCount: number;
  completionRate: number;
  status: 'active' | 'pending_review' | 'overdue' | 'completed';
  detailedStatus: string;
  statusCounts: {
    completed: number;
    inProgress: number;
    overdue: number;
    pendingReview: number;
  };
  currentQuarter: string;
}

export default function ManagerDashboard() {
  const { user, isLoading: authLoading } = useAuth(true, ['MANAGER', 'manager']);
  const [activeTab, setActiveTab] = useState<'overview' | 'assign' | 'team'>('overview');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load data when authentication is complete
  useEffect(() => {
    console.log('useEffect triggered:', { authLoading, user: user?.id });
    if (authLoading) return;
    if (!user) return;
    const loadData = async () => {
      setLoading(true);
      try {
        await loadTeamData();
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [authLoading, user]);

  const loadTeamData = async () => {
    try {
      console.log('Loading team data for manager:', user?.id);
      // Fetch employees managed by this manager
      const response = await fetch(`/api/manager/team?managerId=${user?.id}`);
      const data = await response.json();
      console.log('Team data response:', data);
      
      if (data.success && data.teamMembers) {
        console.log(`Found ${data.teamMembers.length} team members`);
        setTeamMembers(data.teamMembers);
      } else {
        console.log('No team members found or API error:', data.error);
        setTeamMembers([]);
      }
    } catch (error) {
      console.error('Error loading team data:', error);
      setTeamMembers([]);
    }
  };

  const loadObjectiveTemplates = async () => {
    // Removed template loading - will use custom creation instead
  };

  // Custom objective assignment handler
  const handleAssignCustomObjective = async (employeeId: string, objectiveData: any) => {
    setIsAssigning(true);
    try {
      const employee = teamMembers.find(member => member.id === employeeId);
      if (!employee) {
        alert('Employee not found');
        return;
      }

      // Call API to assign custom objective
      const response = await fetch('/api/manager/assign-objectives', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId: employeeId,
          objectives: [objectiveData],
          assignedById: user?.id
        })
      });

      const data = await response.json();

      if (data.success) {
        // Update team member data locally
        const updatedTeamMembers = teamMembers.map(member => 
          member.id === employeeId 
            ? { ...member, objectivesCount: data.updatedEmployee.objectivesCount, status: 'active' as const }
            : member
        );
        setTeamMembers(updatedTeamMembers);

        alert(data.message || 'Objective assigned successfully!');
        setSelectedEmployee('');
        
        // Reload team data to get fresh metrics
        await loadTeamData();
      } else {
        // Handle weight validation errors specially
        if (data.details && data.details.quarter) {
          const details = data.details;
          alert(`Weight Allocation Error for ${details.quarter}:\n\n` +
                `Current Allocated: ${details.currentAllocated}%\n` +
                `Available: ${details.available}%\n` +
                `Requested: ${details.requestedTotal}%\n` +
                `Exceeds by: ${details.exceedsBy}%\n\n` +
                `Please reduce the weight or assign to a different quarter.`);
        } else {
          alert(data.error || 'Failed to assign objective');
        }
      }
    } catch (error) {
      console.error('Error assigning objective:', error);
      alert('Failed to assign objective. Please try again.');
    } finally {
      setIsAssigning(false);
    }
  };

  const getQuarterEndDate = () => {
    // Get the end of current quarter
    const now = new Date();
    const month = now.getMonth();
    if (month < 3) return '2025-03-31';
    if (month < 6) return '2025-06-30';
    if (month < 9) return '2025-09-30';
    return '2025-12-31';
  };

  const getStatusIcon = (status: TeamMember['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'pending_review':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'overdue':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status: TeamMember['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'pending_review':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'overdue':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'completed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004E9E] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading manager dashboard...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Authentication required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#333333] to-[#666666] bg-clip-text text-transparent mb-2">
                  Good morning, {user.firstName}
                </h1>
                <p className="text-[#666666]">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {/* User Profile */}
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.title || 'Manager'}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#004E9E] flex items-center justify-center">
                    <span className="text-white font-medium">
                      {user.firstName ? user.firstName[0] : ''}{user.lastName ? user.lastName[0] : ''}
                    </span>
                  </div>
                </div>
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
              { id: 'overview', name: 'Team Overview', icon: ChartBarIcon },
              { id: 'assign', name: 'Create & Assign', icon: PlusIcon },
              { id: 'team', name: 'Team Management', icon: UsersIcon }
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
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Four Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <UserGroupIcon className="h-8 w-8 text-[#004E9E]" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Team Members</p>
                    <p className="text-2xl font-bold text-gray-900">{teamMembers.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <ClipboardDocumentListIcon className="h-8 w-8 text-[#007BFF]" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Objectives</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {teamMembers.reduce((sum, member) => sum + member.objectivesCount, 0)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <ArrowTrendingUpIcon className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Avg Completion Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {teamMembers.length > 0 ? Math.round(teamMembers.reduce((sum, member) => sum + member.completionRate, 0) / teamMembers.length) : 0}%
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <ClockIcon className="h-8 w-8 text-yellow-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Pending Reviews</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {teamMembers.filter(member => member.status === 'pending_review').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Team Performance Table */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Team Performance</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {loading ? 'Loading team data...' : `Showing ${teamMembers.length} team members`}
                </p>
              </div>
              <div className="overflow-x-auto">
                {teamMembers.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Objectives</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Rate</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {teamMembers.map((member) => (
                        <tr key={member.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-[#004E9E] flex items-center justify-center">
                                <span className="text-sm font-medium text-white">
                                  {member.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{member.name}</div>
                                <div className="text-sm text-gray-500">{member.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.role}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.objectivesCount}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                                <div className="bg-[#004E9E] h-2 rounded-full" style={{ width: `${member.completionRate}%` }}></div>
                              </div>
                              <span className="text-sm text-gray-900">{member.completionRate}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-1">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(member.status)}`}>
                                {getStatusIcon(member.status)}
                                <span className="ml-1 capitalize">{member.status.replace('_', ' ')}</span>
                              </span>
                              <div className="text-xs text-gray-500">
                                {member.detailedStatus}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button 
                              onClick={() => { setSelectedEmployee(member.id); setActiveTab('assign'); }} 
                              className="bg-gradient-to-r from-[#004E9E] to-[#007BFF] text-white px-3 py-1 rounded-md text-xs hover:shadow-md transition-all mr-3"
                            >
                              ✨ Create Objective
                            </button>
                            <button className="text-[#007BFF] hover:text-[#0056b3] text-xs">Review</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-12">
                    <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No team members</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {loading ? 'Loading team data...' : 'No employees are currently assigned to your management.'}
                    </p>
                    {!loading && (
                      <div className="mt-4">
                        <p className="text-xs text-gray-400">
                          Debug: User ID: {user?.id || 'Not found'} | Auth Loading: {authLoading ? 'Yes' : 'No'}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'assign' && (
          <CustomObjectiveCreationPanel 
            teamMembers={teamMembers}
            selectedEmployee={selectedEmployee}
            setSelectedEmployee={setSelectedEmployee}
            onAssignObjective={handleAssignCustomObjective}
            isAssigning={isAssigning}
          />
        )}

        {activeTab === 'team' && (
          <TeamManagementPanel 
            teamMembers={teamMembers} 
            user={user}
            onRefreshData={loadTeamData}
          />
        )}
      </div>
    </div>
  );
}

// Custom Objective Creation Panel Component
function CustomObjectiveCreationPanel({ 
  teamMembers, 
  selectedEmployee, 
  setSelectedEmployee, 
  onAssignObjective, 
  isAssigning 
}: {
  teamMembers: TeamMember[];
  selectedEmployee: string;
  setSelectedEmployee: (id: string) => void;
  onAssignObjective: (employeeId: string, objectiveData: any) => void;
  isAssigning: boolean;
}) {

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [objectiveData, setObjectiveData] = useState({
    title: '',
    description: '',
    category: 'performance',
    target: '',
    weight: 20,
    dueDate: '',
    quarter: `Q${Math.ceil((new Date().getMonth() + 1) / 3)}`,
    year: new Date().getFullYear()
  });
  const [quarterlyWeights, setQuarterlyWeights] = useState<any>(null);
  const [loadingWeights, setLoadingWeights] = useState<boolean>(false);

  const employee = teamMembers.find(member => member.id === selectedEmployee);

  // Fetch quarterly weight allocations for the selected employee
  useEffect(() => {
    const fetchQuarterlyWeights = async () => {
      if (!employee) {
        setQuarterlyWeights(null);
        return;
      }
      setLoadingWeights(true);
      try {
        const res = await fetch(`/api/manager/quarterly-weights?employeeId=${employee.id}&year=${objectiveData.year}`);
        const data = await res.json();
        if (data.success) {
          setQuarterlyWeights(data.quarterlyWeights);
        } else {
          setQuarterlyWeights(null);
        }
      } catch (e) {
        console.error('Error fetching quarterly weights:', e);
        setQuarterlyWeights(null);
      } finally {
        setLoadingWeights(false);
      }
    };
    if (showCreateModal && employee) {
      fetchQuarterlyWeights();
    }
  }, [showCreateModal, employee, objectiveData.year]);

  // Get current quarter's weight info
  const getCurrentQuarterInfo = () => {
    if (!quarterlyWeights || !objectiveData.quarter) {
      return { allocated: 0, available: 100 };
    }
    return quarterlyWeights[objectiveData.quarter] || { allocated: 0, available: 100 };
  };

  const currentQuarterInfo = getCurrentQuarterInfo();

  // Clamp weight if it exceeds available weight
  useEffect(() => {
    const available = currentQuarterInfo.available;
    if (objectiveData.weight > available) {
      setObjectiveData((prev) => ({ ...prev, weight: Math.max(5, available) }));
    }
  }, [currentQuarterInfo.available, objectiveData.weight]);

  const resetForm = () => {
    setObjectiveData({
      title: '',
      description: '',
      category: 'performance',
      target: '',
      weight: 20,
      dueDate: '',
      quarter: `Q${Math.ceil((new Date().getMonth() + 1) / 3)}`,
      year: new Date().getFullYear()
    });
  };

  const handleCreateAndAssign = () => {
    if (!selectedEmployee) {
      alert('Please select an employee first.');
      return;
    }
    
    if (!objectiveData.title || !objectiveData.description || !objectiveData.target || !objectiveData.dueDate) {
      alert('Please fill in all required fields.');
      return;
    }

    // Check weight availability
    if (objectiveData.weight > currentQuarterInfo.available) {
      alert(`Not enough weight available for ${objectiveData.quarter}. Available: ${currentQuarterInfo.available}%, Requested: ${objectiveData.weight}%`);
      return;
    }

    const formattedObjective = {
      title: objectiveData.title,
      description: objectiveData.description,
      category: objectiveData.category,
      target: parseFloat(objectiveData.target),
      weight: objectiveData.weight / 100, // Convert percentage to decimal
      dueDate: objectiveData.dueDate,
      quarter: objectiveData.quarter,
      year: objectiveData.year
    };

    onAssignObjective(selectedEmployee, formattedObjective);
    setShowCreateModal(false);
    resetForm();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Create & Assign Custom Objectives</h3>
            <p className="text-sm text-gray-500 mt-1">Design personalized objectives for your team members</p>
          </div>
          <div className="bg-gradient-to-r from-[#004E9E] to-[#007BFF] px-4 py-2 rounded-lg">
            <span className="text-white text-sm font-medium">✨ Custom Creation</span>
          </div>
        </div>
        
        {/* Employee Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Team Member
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                onClick={() => setSelectedEmployee(member.id)}
                className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedEmployee === member.id
                    ? 'border-[#004E9E] bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#004E9E] to-[#007BFF] flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{member.name}</h4>
                    <p className="text-xs text-gray-500">{member.role}</p>
                    <div className="flex items-center mt-1 space-x-2">
                      <span className="text-xs text-gray-400">{member.objectivesCount} objectives</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-400">{member.completionRate}% complete</span>
                    </div>
                  </div>
                  {selectedEmployee === member.id && (
                    <div className="text-[#004E9E]">
                      <CheckCircleIcon className="h-5 w-5" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create Objective Button */}
        {employee && (
          <div className="border-t pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Ready to create objective for {employee.name}</h4>
                <p className="text-sm text-gray-500">Click the button to open the objective creation form</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-[#004E9E] to-[#007BFF] text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Create Custom Objective</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Custom Objective Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-8 border w-11/12 max-w-5xl shadow-2xl rounded-xl bg-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Create Custom Objective</h3>
                <p className="text-sm text-gray-500 mt-1">for {employee?.name} ({employee?.role})</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Basic Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 border-b pb-2">Basic Information</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Objective Title *
                  </label>
                  <input
                    type="text"
                    value={objectiveData.title}
                    onChange={(e) => setObjectiveData({ ...objectiveData, title: e.target.value })}
                    placeholder="e.g., Increase Customer Satisfaction"
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-[#004E9E] focus:border-[#004E9E]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={objectiveData.description}
                    onChange={(e) => setObjectiveData({ ...objectiveData, description: e.target.value })}
                    placeholder="Detailed description of what needs to be achieved..."
                    rows={4}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-[#004E9E] focus:border-[#004E9E]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={objectiveData.category}
                    onChange={(e) => setObjectiveData({ ...objectiveData, category: e.target.value })}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-[#004E9E] focus:border-[#004E9E]"
                  >
                    <option value="performance">🎯 Performance</option>
                    <option value="development">📚 Development</option>
                    <option value="leadership">👑 Leadership</option>
                    <option value="innovation">💡 Innovation</option>
                    <option value="collaboration">🤝 Collaboration</option>
                    <option value="quality">⭐ Quality</option>
                  </select>
                </div>
              </div>

              {/* Right Column - Metrics & Timeline */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 border-b pb-2">Metrics & Timeline</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Value/Score *
                  </label>
                  <input
                    type="number"
                    value={objectiveData.target}
                    onChange={(e) => setObjectiveData({ ...objectiveData, target: e.target.value })}
                    placeholder="e.g., 95 (for 95% satisfaction)"
                    min="1"
                    max="1000"
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-[#004E9E] focus:border-[#004E9E]"
                  />
                  <p className="text-xs text-gray-500 mt-1">The target value the employee should achieve</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (%) - {objectiveData.quarter} {objectiveData.year}
                  </label>
                  <input
                    type="range"
                    value={objectiveData.weight}
                    onChange={(e) => setObjectiveData({ ...objectiveData, weight: parseInt(e.target.value) })}
                    min="5"
                    max={Math.max(5, currentQuarterInfo.available)}
                    disabled={currentQuarterInfo.available === 0 || loadingWeights}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>5%</span>
                    <span className="font-medium text-[#004E9E]">{objectiveData.weight}%</span>
                    <span>{currentQuarterInfo.available}% max</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {loadingWeights ? 'Checking available weight...' :
                      currentQuarterInfo.available === 0 ? 'No weight left for this quarter.' :
                      `You can assign up to ${currentQuarterInfo.available}% more for ${objectiveData.quarter}. (${currentQuarterInfo.allocated}% already assigned)`}
                  </p>
                  
                  {/* Quarterly Weight Overview */}
                  {quarterlyWeights && !loadingWeights && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <h5 className="text-xs font-medium text-gray-700 mb-2">Weight Allocation Overview - {objectiveData.year}</h5>
                      <div className="grid grid-cols-4 gap-2">
                        {Object.entries(quarterlyWeights).map(([quarter, info]: [string, any]) => (
                          <div key={quarter} className="text-center">
                            <div className={`text-xs font-medium ${quarter === objectiveData.quarter ? 'text-[#004E9E]' : 'text-gray-600'}`}>
                              {quarter}
                            </div>
                            <div className={`text-xs ${quarter === objectiveData.quarter ? 'text-[#004E9E]' : 'text-gray-500'}`}>
                              {info.allocated}% used
                            </div>
                            <div className={`text-xs ${quarter === objectiveData.quarter ? 'text-[#004E9E]' : 'text-gray-400'}`}>
                              {info.available}% left
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    value={objectiveData.dueDate}
                    onChange={(e) => setObjectiveData({ ...objectiveData, dueDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-[#004E9E] focus:border-[#004E9E]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quarter
                    </label>
                    <select
                      value={objectiveData.quarter}
                      onChange={(e) => setObjectiveData({ ...objectiveData, quarter: e.target.value })}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-[#004E9E] focus:border-[#004E9E]"
                    >
                      <option value="Q1">Q1</option>
                      <option value="Q2">Q2</option>
                      <option value="Q3">Q3</option>
                      <option value="Q4">Q4</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year
                    </label>
                    <input
                      type="number"
                      value={objectiveData.year}
                      onChange={(e) => setObjectiveData({ ...objectiveData, year: parseInt(e.target.value) })}
                      min={new Date().getFullYear()}
                      max={new Date().getFullYear() + 2}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-[#004E9E] focus:border-[#004E9E]"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="mt-8 flex justify-end space-x-4 border-t pt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAndAssign}
                disabled={isAssigning}
                className="px-6 py-2 bg-gradient-to-r from-[#004E9E] to-[#007BFF] text-white rounded-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2"
              >
                {isAssigning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Assigning...</span>
                  </>
                ) : (
                  <>
                    <span>Create & Assign Objective</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Objectives Review Panel Component
function ObjectivesReviewPanel({ teamMembers, user }: { teamMembers: TeamMember[]; user: any }) {
  const [completedObjectives, setCompletedObjectives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedObjective, setSelectedObjective] = useState<any>(null);
  const [reviewScore, setReviewScore] = useState<number>(0);
  const [reviewComments, setReviewComments] = useState<string>('');
  const [reviewedObjectives, setReviewedObjectives] = useState<any[]>([]);
  const [aiScoringInProgress, setAiScoringInProgress] = useState<boolean>(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState<boolean>(false);
  const [managerSignature, setManagerSignature] = useState<string>('');
  const [submissionNotes, setSubmissionNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  
  // Rejection Modal States
  const [showRejectionModal, setShowRejectionModal] = useState<boolean>(false);
  const [rejectionObjective, setRejectionObjective] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [rejecting, setRejecting] = useState<boolean>(false);

  useEffect(() => {
    loadCompletedObjectives();
  }, [teamMembers, user]);

  const loadCompletedObjectives = async () => {
    setLoading(true);
    try {
      console.log('Loading completed objectives for manager:', user?.id);
      const response = await fetch(`/api/manager/completed-objectives?managerId=${user?.id}`);
      const data = await response.json();
      console.log('Completed objectives response:', data);
      
      if (data.success) {
        setCompletedObjectives(data.objectives);
        console.log(`Found ${data.objectives.length} completed objectives to review`);
      } else {
        console.error('Failed to load completed objectives:', data.error);
        setCompletedObjectives([]);
      }
    } catch (error) {
      console.error('Error loading completed objectives:', error);
      setCompletedObjectives([]);
    } finally {
      setLoading(false);
    }
  };

  const generateAIScores = async () => {
    if (completedObjectives.length === 0) {
      alert('No completed objectives to score');
      return;
    }

    setAiScoringInProgress(true);
    try {
      const scoredResults = [];

      for (const objective of completedObjectives) {
        try {
          console.log(`Generating AI score for: ${objective.title}`);
          const response = await fetch('/api/manager/ai-score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              objectiveTitle: objective.title,
              objectiveDescription: objective.description,
              targetValue: objective.target,
              currentValue: objective.current,
              employeeName: objective.user?.name,
              category: objective.category || 'General'
            })
          });

          const data = await response.json();
          if (data.success) {
            scoredResults.push({
              ...objective,
              aiEvaluation: data.aiEvaluation,
              finalScore: data.aiEvaluation.score,
              managerComments: '',
              readyForReview: true
            });
          } else {
            throw new Error(data.error);
          }
        } catch (error) {
          console.error(`Error scoring objective ${objective.title}:`, error);
          // Add with fallback score
          scoredResults.push({
            ...objective,
            aiEvaluation: {
              score: Math.round((objective.current / objective.target) * 100),
              explanation: 'Fallback scoring based on achievement ratio',
              strengths: 'Met objective targets',
              improvements: 'Continue current approach'
            },
            finalScore: Math.round((objective.current / objective.target) * 100),
            managerComments: '',
            readyForReview: true
          });
        }
      }

      setReviewedObjectives(scoredResults);
      alert(`✅ AI scoring completed for ${scoredResults.length} objectives!`);
    } catch (error) {
      console.error('Error in AI scoring:', error);
      alert('Error generating AI scores. Please try again.');
    } finally {
      setAiScoringInProgress(false);
    }
  };

  const updateObjectiveReview = (objectiveId: string, field: string, value: any) => {
    setReviewedObjectives(prev => 
      prev.map(obj => 
        obj.id === objectiveId 
          ? { ...obj, [field]: value }
          : obj
      )
    );
  };

  const submitToHR = async () => {
    if (!managerSignature.trim()) {
      alert('Digital signature is required');
      return;
    }

    const uncompletedReviews = reviewedObjectives.filter(obj => 
      !obj.managerComments.trim() || !obj.finalScore
    );

    if (uncompletedReviews.length > 0) {
      alert(`Please complete reviews for all objectives. ${uncompletedReviews.length} objectives need manager comments.`);
      return;
    }

    setSubmitting(true);
    try {
      const submissionData = reviewedObjectives.map(obj => ({
        objectiveId: obj.id,
        employeeId: obj.userId,
        employeeName: obj.user?.name,
        objectiveTitle: obj.title,
        finalScore: obj.finalScore,
        aiScore: obj.aiEvaluation?.score,
        managerComments: obj.managerComments,
        aiRecommendation: obj.aiEvaluation?.explanation
      }));

      const response = await fetch('/api/manager/submit-to-hr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          managerId: user?.id,
          reviewedObjectives: submissionData,
          managerSignature,
          submissionNotes
        })
      });

      const data = await response.json();
      if (data.success) {
        alert(`✅ Successfully submitted ${reviewedObjectives.length} objective reviews to HR!`);
        setShowSubmissionModal(false);
        setReviewedObjectives([]);
        setManagerSignature('');
        setSubmissionNotes('');
        loadCompletedObjectives(); // Reload to remove submitted objectives
      } else {
        alert(data.error || 'Failed to submit to HR');
      }
    } catch (error) {
      console.error('Error submitting to HR:', error);
      alert('Error submitting to HR. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handler for approving objective for AI scoring (existing functionality)
  const handleApproveForAI = async (objectiveId: string) => {
    // This just triggers the AI scoring directly - we can use the existing generateAIScores function
    // but for a single objective. For now, let's use the batch approach.
    const objectiveToScore = completedObjectives.find(obj => obj.id === objectiveId);
    if (objectiveToScore) {
      // Add to the list and trigger AI scoring
      await generateAIScores();
    }
  };

  // Handler for rejecting objectives
  const handleRejectObjective = (objectiveId: string, title: string, employeeName: string) => {
    const objective = completedObjectives.find(obj => obj.id === objectiveId);
    setRejectionObjective({
      id: objectiveId,
      title,
      employeeName,
      ...objective
    });
    setShowRejectionModal(true);
    setRejectionReason('');
  };

  // Submit rejection
  const submitRejection = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setRejecting(true);
    try {
      const response = await fetch('/api/manager/reject-objective', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objectiveId: rejectionObjective.id,
          managerId: user?.id,
          rejectionReason: rejectionReason.trim()
        })
      });

      const data = await response.json();
      if (data.success) {
        alert(`✅ Objective "${rejectionObjective.title}" has been rejected and sent back to ${rejectionObjective.employeeName}`);
        setShowRejectionModal(false);
        setRejectionObjective(null);
        setRejectionReason('');
        loadCompletedObjectives(); // Reload to remove rejected objective
      } else {
        alert(data.error || 'Failed to reject objective');
      }
    } catch (error) {
      console.error('Error rejecting objective:', error);
      alert('Error rejecting objective. Please try again.');
    } finally {
      setRejecting(false);
    }
  };

  const handleReviewSubmit = async (objectiveId: string) => {
    try {
      const response = await fetch('/api/manager/review-objective', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objectiveId,
          score: reviewScore,
          comments: reviewComments,
          reviewerId: user?.id
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Review submitted successfully!');
        setSelectedObjective(null);
        setReviewScore(0);
        setReviewComments('');
        loadCompletedObjectives();
      } else {
        alert(data.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with AI Scoring Button */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Completed Objectives for Review</h3>
            <p className="text-sm text-gray-500">
              {completedObjectives.length} objectives completed by your team members
            </p>
          </div>
          <div className="flex space-x-3">
            {completedObjectives.length > 0 && reviewedObjectives.length === 0 && (
              <button
                onClick={generateAIScores}
                disabled={aiScoringInProgress}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {aiScoringInProgress ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generating AI Scores...</span>
                  </>
                ) : (
                  <>
                    <span>🤖 Generate AI Scores</span>
                  </>
                )}
              </button>
            )}
            {reviewedObjectives.length > 0 && (
              <button
                onClick={() => setShowSubmissionModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-2"
              >
                <span>📤 Submit to HR ({reviewedObjectives.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Show AI Scored Objectives for Review */}
        {reviewedObjectives.length > 0 ? (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-blue-900 mb-2">🤖 AI Scoring Complete - Please Review & Add Comments</h4>
              <p className="text-sm text-blue-700">
                AI has analyzed all objectives. Please review the scores, add your manager comments, and submit to HR.
              </p>
            </div>

            {reviewedObjectives.map((objective) => (
              <div key={objective.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Objective Details */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">{objective.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">{objective.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Employee:</span>
                        <p className="text-gray-600">{objective.user?.name}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Achievement:</span>
                        <p className="text-gray-600">{objective.current}/{objective.target} ({Math.round((objective.current/objective.target)*100)}%)</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Weight:</span>
                        <p className="text-gray-600">{objective.weight}%</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Status:</span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {objective.status}
                        </span>
                      </div>
                    </div>

                    {/* AI Evaluation */}
                    <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded">
                      <h5 className="font-medium text-purple-900 mb-2">🤖 AI Evaluation</h5>
                      <div className="text-sm space-y-1">
                        <p><span className="font-medium">Score:</span> {objective.aiEvaluation?.score}/100</p>
                        <p><span className="font-medium">Analysis:</span> {objective.aiEvaluation?.explanation}</p>
                        <p><span className="font-medium">Strengths:</span> {objective.aiEvaluation?.strengths}</p>
                        <p><span className="font-medium">Improvements:</span> {objective.aiEvaluation?.improvements}</p>
                      </div>
                    </div>
                  </div>

                  {/* Manager Review */}
                  <div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Final Score (0-100)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={objective.finalScore}
                          onChange={(e) => updateObjectiveReview(objective.id, 'finalScore', Number(e.target.value))}
                          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-[#004E9E] focus:border-[#004E9E]"
                        />
                        <p className="text-xs text-gray-500 mt-1">AI suggested: {objective.aiEvaluation?.score < 1 ? Math.round(objective.aiEvaluation.score * 100) : objective.aiEvaluation.score}%</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Manager Comments *</label>
                        <textarea
                          value={objective.managerComments}
                          onChange={(e) => updateObjectiveReview(objective.id, 'managerComments', e.target.value)}
                          rows={4}
                          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-[#004E9E] focus:border-[#004E9E]"
                          placeholder="Add your manager review comments..."
                          required
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        <span className="text-sm text-gray-700">Ready for HR submission</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : completedObjectives.length > 0 ? (
          /* Enhanced Completed Objectives Display with Rejection Option */
          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-orange-900 mb-2">📋 Objectives Pending Your Review</h4>
              <p className="text-sm text-orange-700">
                Review employee-submitted objectives below. You can approve them for AI scoring or reject them back to the employee.
              </p>
            </div>
            
            {completedObjectives.map((objective) => (
              <div key={objective.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Objective Details */}
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900 text-lg">{objective.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{objective.description}</p>
                      </div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {objective.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <span className="font-medium text-gray-700">Employee:</span>
                        <p className="text-gray-600">{objective.user?.name}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Achievement:</span>
                        <p className="text-gray-600">{objective.current}/{objective.target} ({Math.round((objective.current/objective.target)*100)}%)</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Weight:</span>
                        <p className="text-gray-600">{objective.weight < 1 ? Math.round(objective.weight * 100) : objective.weight}%</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Due Date:</span>
                        <p className="text-gray-600">{new Date(objective.dueDate).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {/* Employee Final Description/Remarks */}
                    {objective.employeeRemarks && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h5 className="font-medium text-blue-900 mb-2">👤 Employee Final Description</h5>
                        <p className="text-sm text-blue-800">{objective.employeeRemarks}</p>
                      </div>
                    )}
                  </div>

                  {/* Manager Actions */}
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border">
                      <h5 className="font-medium text-gray-900 mb-3">Manager Actions</h5>
                      
                      <div className="space-y-3">
                        <button
                          onClick={() => handleApproveForAI(objective.id)}
                          className="w-full px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center space-x-2 transition-colors"
                        >
                          <span>✅ Approve for AI Scoring</span>
                        </button>
                        
                        <button
                          onClick={() => handleRejectObjective(objective.id, objective.title, objective.user?.name)}
                          className="w-full px-4 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center space-x-2 transition-colors"
                        >
                          <span>❌ Reject & Send Back</span>
                        </button>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-white rounded-lg p-4 border">
                      <h5 className="font-medium text-gray-900 mb-2">Quick Stats</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Progress:</span>
                          <span className="font-medium">{Math.round((objective.current/objective.target)*100)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Quarter:</span>
                          <span className="font-medium">{objective.quarter} {objective.year}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Submitted:</span>
                          <span className="font-medium">
                            {objective.submittedToManagerAt ? new Date(objective.submittedToManagerAt).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No objectives to review</h3>
            <p className="mt-1 text-sm text-gray-500">No completed objectives from your team members.</p>
          </div>
        )}
      </div>

      {/* HR Submission Modal */}
      {showSubmissionModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Submit to HR - Digital Signature Required</h3>
              
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Review Summary</h4>
                  <p className="text-sm text-blue-700">
                    You are about to submit {reviewedObjectives.length} objective reviews to HR for final approval.
                  </p>
                  <ul className="text-sm text-blue-700 mt-2 space-y-1">
                    {reviewedObjectives.map(obj => (
                      <li key={obj.id}>• {obj.user?.name}: {obj.title} (Score: {obj.finalScore < 1 ? Math.round(obj.finalScore * 100) : obj.finalScore}%)</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Digital Signature * <span className="text-red-500">(Type your full name)</span>
                  </label>
                  <input
                    type="text"
                    value={managerSignature}
                    onChange={(e) => setManagerSignature(e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-[#004E9E] focus:border-[#004E9E]"
                    placeholder="Type your full name as digital signature"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Submission Notes (Optional)</label>
                  <textarea
                    value={submissionNotes}
                    onChange={(e) => setSubmissionNotes(e.target.value)}
                    rows={3}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-[#004E9E] focus:border-[#004E9E]"
                    placeholder="Add any additional notes for HR..."
                  />
                </div>
                
                <div className="flex space-x-2 pt-4">
                  <button
                    onClick={() => setShowSubmissionModal(false)}
                    disabled={submitting}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitToHR}
                    disabled={submitting || !managerSignature.trim()}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <span>📤 Submit to HR</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && rejectionObjective && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">❌ Reject Objective</h3>
              
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-900 mb-2">Objective Details</h4>
                  <p className="text-sm text-red-700">
                    <strong>Title:</strong> {rejectionObjective.title}
                  </p>
                  <p className="text-sm text-red-700">
                    <strong>Employee:</strong> {rejectionObjective.employeeName}
                  </p>
                  <p className="text-sm text-red-700 mt-2">
                    This objective will be sent back to the employee for revision.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Rejection * <span className="text-red-500">(Required)</span>
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={4}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                    placeholder="Please provide specific feedback on why this objective is being rejected and what the employee should improve..."
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Be specific and constructive. This feedback will help the employee improve their objective.
                  </p>
                </div>
                
                <div className="flex space-x-2 pt-4">
                  <button
                    onClick={() => {
                      setShowRejectionModal(false);
                      setRejectionObjective(null);
                      setRejectionReason('');
                    }}
                    disabled={rejecting}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitRejection}
                    disabled={rejecting || !rejectionReason.trim()}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {rejecting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Rejecting...</span>
                      </>
                    ) : (
                      <span>❌ Reject Objective</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Team Management Panel Component
function TeamManagementPanel({ 
  teamMembers, 
  user, 
  onRefreshData 
}: { 
  teamMembers: TeamMember[]; 
  user: any; 
  onRefreshData: () => void; 
}) {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [memberObjectives, setMemberObjectives] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingObjective, setEditingObjective] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    target: '',
    dueDate: '',
    weight: ''
  });

  const loadMemberObjectives = async (memberId: string) => {
    setLoading(true);
    try {
      console.log('Loading objectives for member:', memberId);
      const response = await fetch(`/api/manager/member-objectives?employeeId=${memberId}`);
      const data = await response.json();
      console.log('Member objectives response:', data);
      
      if (data.success) {
        setMemberObjectives(data.objectives);
        console.log(`Loaded ${data.objectives.length} objectives for member`);
      } else {
        console.error('Failed to load member objectives:', data.error);
        setMemberObjectives([]);
      }
    } catch (error) {
      console.error('Error loading member objectives:', error);
      setMemberObjectives([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMemberSelect = (member: TeamMember) => {
    setSelectedMember(member);
    loadMemberObjectives(member.id);
  };

  const handleObjectiveAction = async (objectiveId: string, action: string) => {
    try {
      const response = await fetch('/api/manager/objective-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objectiveId,
          action,
          managerId: user?.id
        })
      });

      const data = await response.json();
      if (data.success) {
        alert(`Objective ${action} successful!`);
        if (selectedMember) {
          loadMemberObjectives(selectedMember.id);
        }
        onRefreshData();
      } else {
        alert(data.error || `Failed to ${action} objective`);
      }
    } catch (error) {
      console.error(`Error ${action} objective:`, error);
      alert(`Failed to ${action} objective`);
    }
  };

  const handleEditClick = (objective: any) => {
    setEditingObjective(objective);
    setEditForm({
      title: objective.title,
      description: objective.description,
      target: objective.target.toString(),
      dueDate: objective.dueDate ? new Date(objective.dueDate).toISOString().split('T')[0] : '',
      weight: (objective.weight * 100).toString()
    });
  };

  const handleEditSave = async () => {
    try {
      const response = await fetch('/api/manager/edit-objective', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objectiveId: editingObjective.id,
          managerId: user?.id,
          title: editForm.title,
          description: editForm.description,
          target: parseInt(editForm.target),
          dueDate: editForm.dueDate,
          weight: parseFloat(editForm.weight) / 100
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Objective updated successfully!');
        setEditingObjective(null);
        if (selectedMember) {
          loadMemberObjectives(selectedMember.id);
        }
        onRefreshData();
      } else {
        alert(data.error || 'Failed to update objective');
      }
    } catch (error) {
      console.error('Error updating objective:', error);
      alert('Failed to update objective');
    }
  };

  const handleEditCancel = () => {
    setEditingObjective(null);
    setEditForm({
      title: '',
      description: '',
      target: '',
      dueDate: '',
      weight: ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Members List */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#004E9E] to-[#007BFF]">
              <h3 className="text-lg font-semibold text-white">Team Members</h3>
              <p className="text-blue-100 text-sm mt-1">Select a member to view objectives</p>
            </div>
            <div className="divide-y divide-gray-200">
              {teamMembers.map((member) => (
                <div 
                  key={member.id}
                  onClick={() => handleMemberSelect(member)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-all ${
                    selectedMember?.id === member.id ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-[#004E9E] shadow-md' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-[#004E9E] flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.role}</p>
                      <p className="text-xs text-gray-500">{member.objectivesCount} objectives</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Member Details & Objectives */}
        <div className="lg:col-span-2">
          {selectedMember ? (
            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedMember.name}</h3>
                    <p className="text-sm text-gray-500">{selectedMember.role} • {selectedMember.email}</p>
                  </div>
                  <div className="text-right">
                    <div className="bg-white rounded-lg px-4 py-2 shadow-sm border">
                      <p className="text-sm font-medium text-gray-900">{selectedMember.objectivesCount} Objectives</p>
                      <p className="text-sm text-[#004E9E] font-medium">{selectedMember.completionRate}% Complete</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {loading ? (
                  <div className="animate-pulse">Loading objectives...</div>
                ) : memberObjectives.length > 0 ? (
                  <div className="space-y-4">
                    {memberObjectives.map((objective) => (
                      <div key={objective.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{objective.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{objective.description}</p>
                            <div className="mt-2 flex items-center space-x-4">
                              <span className="text-xs text-gray-500">Target: {objective.target}</span>
                              <span className="text-xs text-gray-500">Current: {objective.current || 0}</span>
                              <span className="text-xs text-gray-500">Weight: {objective.weight}%</span>
                              <span className="text-xs text-gray-500">Due: {new Date(objective.dueDate).toLocaleDateString()}</span>
                            </div>
                            <div className="mt-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                objective.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                objective.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                                objective.status === 'ACTIVE' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {objective.status}
                              </span>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                <span>Progress</span>
                                <span>{Math.round((objective.current / objective.target) * 100 || 0)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-[#004E9E] h-2 rounded-full" 
                                  style={{ width: `${Math.min(100, (objective.current / objective.target) * 100 || 0)}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="ml-4 flex flex-col space-y-2">
                            {objective.status === 'COMPLETED' && (
                              <button
                                onClick={() => handleObjectiveAction(objective.id, 'approve')}
                                className="px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white rounded text-xs hover:shadow-md transition-all"
                              >
                                ✅ Approve
                              </button>
                            )}
                            {objective.status !== 'COMPLETED' && (
                              <button
                                onClick={() => handleObjectiveAction(objective.id, 'remind')}
                                className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded text-xs hover:shadow-md transition-all"
                              >
                                🔔 Remind
                              </button>
                            )}
                            {(objective.status === 'IN_PROGRESS' || objective.status === 'ASSIGNED' || objective.status === 'ACTIVE') && (
                              <button
                                onClick={() => handleEditClick(objective)}
                                className="px-3 py-1 bg-gradient-to-r from-[#004E9E] to-[#007BFF] text-white rounded text-xs hover:shadow-md transition-all"
                              >
                                ✏️ Edit
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No objectives assigned</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {loading ? 'Loading objectives...' : 'This team member has no objectives assigned yet.'}
                    </p>
                    {!loading && (
                      <div className="mt-4">
                        <p className="text-xs text-gray-400">
                          Debug: Employee ID: {selectedMember?.id} | API Loading: {loading ? 'Yes' : 'No'}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
              <div className="text-center py-8">
                <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Select a team member</h3>
                <p className="mt-1 text-sm text-gray-500">Choose a team member from the list to view their objectives and tasks.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Objective Modal */}
      {editingObjective && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 border w-11/12 md:w-1/2 max-w-2xl shadow-xl rounded-xl bg-white">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <PencilSquareIcon className="h-6 w-6 text-[#004E9E]" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Edit Objective</h3>
                  <p className="text-sm text-gray-500 mt-1">Update objective details for {selectedMember?.name}</p>
                </div>
              </div>
              <button
                onClick={handleEditCancel}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#004E9E] focus:ring-[#004E9E] focus:ring-1 transition-colors"
                  placeholder="Enter objective title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={4}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#004E9E] focus:ring-[#004E9E] focus:ring-1 transition-colors"
                  placeholder="Enter objective description"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target *
                  </label>
                  <input
                    type="number"
                    value={editForm.target}
                    onChange={(e) => setEditForm({ ...editForm, target: e.target.value })}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#004E9E] focus:ring-[#004E9E] focus:ring-1 transition-colors"
                    placeholder="Target value"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (%) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={editForm.weight}
                    onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#004E9E] focus:ring-[#004E9E] focus:ring-1 transition-colors"
                    placeholder="Weight %"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    value={editForm.dueDate}
                    onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#004E9E] focus:ring-[#004E9E] focus:ring-1 transition-colors"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                onClick={handleEditCancel}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                disabled={!editForm.title.trim() || !editForm.description.trim() || !editForm.target || !editForm.weight || !editForm.dueDate}
                className="px-6 py-2.5 bg-gradient-to-r from-[#004E9E] to-[#007BFF] text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center space-x-2"
              >
                <span>💾</span>
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


