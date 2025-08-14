'use client';

import React, { useState, useEffect } from 'react';
import { 
  UserGroupIcon, 
  ClipboardDocumentListIcon, 
  ChartBarIcon,
  PlusIcon,
  AdjustmentsHorizontalIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  BellIcon
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
  lastActive: string;
  status: 'active' | 'pending_review' | 'overdue' | 'completed';
  currentQuarter: string;
}

interface ObjectiveTemplate {
  id: string;
  title: string;
  description: string;
  category: 'performance' | 'development' | 'leadership' | 'innovation';
  type: 'quantitative' | 'qualitative';
  defaultWeight: number;
  suggestedTarget: string;
  applicableRoles: string[];
}

interface DepartmentMetrics {
  department: string;
  totalEmployees: number;
  objectivesAssigned: number;
  completionRate: number;
  averageScore: number;
  pendingReviews: number;
}

export default function ManagerDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'assign' | 'review' | 'templates'>('overview');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [objectiveTemplates, setObjectiveTemplates] = useState<ObjectiveTemplate[]>([]);
  const [departmentMetrics, setDepartmentMetrics] = useState<DepartmentMetrics[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);

  // Mock user - in real implementation, get from auth context
  const user = {
    email: "manager@carecloud.com",
    role: "manager",
    name: "Sarah Johnson",
    department: "Customer Success"
  };

  useEffect(() => {
    loadTeamData();
    loadObjectiveTemplates();
    loadDepartmentMetrics();
  }, []);

  const loadTeamData = () => {
    // In real implementation, fetch from API
    const mockTeamMembers: TeamMember[] = [
      {
        id: "emp001",
        name: "John Smith",
        email: "john.smith@carecloud.com",
        role: "Senior Customer Success Manager",
        department: "Customer Success",
        manager: user.email,
        objectivesCount: 5,
        completionRate: 85,
        lastActive: "2025-08-10",
        status: "active",
        currentQuarter: "Q3-2025"
      },
      {
        id: "emp002",
        name: "Emily Davis",
        email: "emily.davis@carecloud.com",
        role: "Customer Success Specialist",
        department: "Customer Success",
        manager: user.email,
        objectivesCount: 4,
        completionRate: 75,
        lastActive: "2025-08-11",
        status: "pending_review",
        currentQuarter: "Q3-2025"
      },
      {
        id: "emp003",
        name: "Michael Chen",
        email: "michael.chen@carecloud.com",
        role: "Junior Customer Success Manager",
        department: "Customer Success",
        manager: user.email,
        objectivesCount: 3,
        completionRate: 60,
        lastActive: "2025-08-09",
        status: "overdue",
        currentQuarter: "Q3-2025"
      }
    ];
    setTeamMembers(mockTeamMembers);
  };

  const loadObjectiveTemplates = () => {
    const templates: ObjectiveTemplate[] = [
      {
        id: "temp001",
        title: "Customer Satisfaction Improvement",
        description: "Improve customer satisfaction scores through enhanced service delivery and proactive communication.",
        category: "performance",
        type: "quantitative",
        defaultWeight: 25,
        suggestedTarget: "90% Customer Satisfaction Score",
        applicableRoles: ["Customer Success Manager", "Customer Success Specialist"]
      },
      {
        id: "temp002",
        title: "Revenue Growth Contribution",
        description: "Contribute to team revenue growth by identifying upsell opportunities and reducing churn.",
        category: "performance",
        type: "quantitative",
        defaultWeight: 30,
        suggestedTarget: "$150K Additional Revenue",
        applicableRoles: ["Senior Customer Success Manager", "Customer Success Manager"]
      },
      {
        id: "temp003",
        title: "Team Leadership Development",
        description: "Develop leadership skills by mentoring junior team members and leading cross-functional initiatives.",
        category: "leadership",
        type: "qualitative",
        defaultWeight: 20,
        suggestedTarget: "Mentor 2 junior team members",
        applicableRoles: ["Senior Customer Success Manager"]
      },
      {
        id: "temp004",
        title: "Process Innovation Initiative",
        description: "Identify and implement process improvements that enhance team efficiency and customer experience.",
        category: "innovation",
        type: "qualitative",
        defaultWeight: 15,
        suggestedTarget: "1 Major Process Improvement",
        applicableRoles: ["Customer Success Manager", "Senior Customer Success Manager"]
      },
      {
        id: "temp005",
        title: "Professional Skill Development",
        description: "Complete relevant certifications and training programs to enhance professional capabilities.",
        category: "development",
        type: "qualitative",
        defaultWeight: 10,
        suggestedTarget: "Complete 2 Professional Certifications",
        applicableRoles: ["Customer Success Specialist", "Junior Customer Success Manager"]
      }
    ];
    setObjectiveTemplates(templates);
  };

  const loadDepartmentMetrics = () => {
    const metrics: DepartmentMetrics[] = [
      {
        department: "Customer Success",
        totalEmployees: 12,
        objectivesAssigned: 48,
        completionRate: 73,
        averageScore: 82,
        pendingReviews: 8
      }
    ];
    setDepartmentMetrics(metrics);
  };

  const handleAssignObjectives = async (employeeId: string, selectedTemplates: string[]) => {
    setIsAssigning(true);
    try {
      // In real implementation, call API to assign objectives
      const employee = teamMembers.find(member => member.id === employeeId);
      if (!employee) return;

      // Create objectives from templates
      const newObjectives = selectedTemplates.map((templateId, index) => {
        const template = objectiveTemplates.find(t => t.id === templateId);
        if (!template) return null;

        return {
          id: `obj_${employeeId}_${Date.now()}_${index}`,
          employeeId: employeeId,
          title: template.title,
          description: template.description,
          category: template.category,
          type: template.type,
          weight: template.defaultWeight,
          target: template.suggestedTarget,
          assignedBy: user.email,
          assignedDate: new Date().toISOString(),
          dueDate: getQuarterEndDate(),
          status: 'assigned',
          progress: 0,
          remarks: '',
          isLocked: false
        };
      }).filter(obj => obj !== null);

      // Save objectives to localStorage (in real implementation, save to database)
      const storageKey = `objectives_${employee.email}`;
      const existingObjectives = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const updatedObjectives = [...existingObjectives, ...newObjectives];
      localStorage.setItem(storageKey, JSON.stringify(updatedObjectives));

      // Update team member data
      const updatedTeamMembers = teamMembers.map(member => 
        member.id === employeeId 
          ? { ...member, objectivesCount: member.objectivesCount + newObjectives.length, status: 'active' as const }
          : member
      );
      setTeamMembers(updatedTeamMembers);

      alert(`Successfully assigned ${newObjectives.length} objectives to ${employee.name}`);
      setSelectedEmployee('');
    } catch (error) {
      console.error('Error assigning objectives:', error);
      alert('Failed to assign objectives. Please try again.');
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage your team's objectives and performance for Q3 2025
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <BellIcon className="h-6 w-6 text-gray-400" />
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.department} Manager</p>
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
              { id: 'assign', name: 'Assign Objectives', icon: PlusIcon },
              { id: 'review', name: 'Review & Approve', icon: DocumentTextIcon },
              { id: 'templates', name: 'Manage Templates', icon: AdjustmentsHorizontalIcon }
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
            {/* Department Metrics */}
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
                      {Math.round(teamMembers.reduce((sum, member) => sum + member.completionRate, 0) / teamMembers.length)}%
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

            {/* Team Members Table */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Team Performance</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Objectives
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Completion Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Active
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {member.role}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {member.objectivesCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-[#004E9E] h-2 rounded-full" 
                                style={{ width: `${member.completionRate}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-900">{member.completionRate}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(member.status)}`}>
                            {getStatusIcon(member.status)}
                            <span className="ml-1 capitalize">{member.status.replace('_', ' ')}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(member.lastActive).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            onClick={() => {
                              setSelectedEmployee(member.id);
                              setActiveTab('assign');
                            }}
                            className="text-[#004E9E] hover:text-[#003875] mr-4"
                          >
                            Assign
                          </button>
                          <button className="text-[#007BFF] hover:text-[#0056b3]">
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'assign' && (
          <ObjectiveAssignmentPanel 
            teamMembers={teamMembers}
            objectiveTemplates={objectiveTemplates}
            selectedEmployee={selectedEmployee}
            setSelectedEmployee={setSelectedEmployee}
            onAssignObjectives={handleAssignObjectives}
            isAssigning={isAssigning}
          />
        )}

        {activeTab === 'review' && (
          <ReviewApprovalPanel teamMembers={teamMembers} />
        )}

        {activeTab === 'templates' && (
          <TemplateManagementPanel 
            templates={objectiveTemplates}
            setTemplates={setObjectiveTemplates}
          />
        )}
      </div>
    </div>
  );
}

// Objective Assignment Panel Component
function ObjectiveAssignmentPanel({ 
  teamMembers, 
  objectiveTemplates, 
  selectedEmployee, 
  setSelectedEmployee, 
  onAssignObjectives, 
  isAssigning 
}: {
  teamMembers: TeamMember[];
  objectiveTemplates: ObjectiveTemplate[];
  selectedEmployee: string;
  setSelectedEmployee: (id: string) => void;
  onAssignObjectives: (employeeId: string, templates: string[]) => void;
  isAssigning: boolean;
}) {
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [customObjective, setCustomObjective] = useState({
    title: '',
    description: '',
    weight: 20,
    target: '',
    type: 'qualitative' as 'qualitative' | 'quantitative'
  });

  const employee = teamMembers.find(member => member.id === selectedEmployee);
  const applicableTemplates = objectiveTemplates.filter(template => 
    template.applicableRoles.some(role => 
      employee?.role.toLowerCase().includes(role.toLowerCase())
    )
  );

  const handleTemplateToggle = (templateId: string) => {
    setSelectedTemplates(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const handleAssign = () => {
    if (!selectedEmployee || selectedTemplates.length === 0) {
      alert('Please select an employee and at least one objective template.');
      return;
    }
    onAssignObjectives(selectedEmployee, selectedTemplates);
    setSelectedTemplates([]);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign Objectives to Team Members</h3>
        
        {/* Employee Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Employee
          </label>
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#004E9E] focus:border-[#004E9E]"
          >
            <option value="">Choose an employee...</option>
            {teamMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name} - {member.role}
              </option>
            ))}
          </select>
        </div>

        {/* Template Selection */}
        {employee && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Objective Templates for {employee.role}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {applicableTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedTemplates.includes(template.id)
                      ? 'border-[#004E9E] bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleTemplateToggle(template.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{template.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                      <div className="flex items-center mt-2 space-x-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          template.category === 'performance' ? 'bg-green-100 text-green-800' :
                          template.category === 'development' ? 'bg-blue-100 text-blue-800' :
                          template.category === 'leadership' ? 'bg-purple-100 text-purple-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {template.category}
                        </span>
                        <span className="text-xs text-gray-500">Weight: {template.defaultWeight}%</span>
                        <span className="text-xs text-gray-500 capitalize">{template.type}</span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedTemplates.includes(template.id)}
                      onChange={() => handleTemplateToggle(template.id)}
                      className="h-4 w-4 text-[#004E9E] focus:ring-[#004E9E] border-gray-300 rounded"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {employee && selectedTemplates.length > 0 && (
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => {
                setSelectedEmployee('');
                setSelectedTemplates([]);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={isAssigning}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#004E9E] hover:bg-[#003875] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAssigning ? 'Assigning...' : `Assign ${selectedTemplates.length} Objective(s)`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Review and Approval Panel Component
function ReviewApprovalPanel({ teamMembers }: { teamMembers: TeamMember[] }) {
  const pendingReviews = teamMembers.filter(member => member.status === 'pending_review');

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Reviews & Approvals</h3>
        
        {pendingReviews.length > 0 ? (
          <div className="space-y-4">
            {pendingReviews.map((member) => (
              <div key={member.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{member.name}</h4>
                    <p className="text-sm text-gray-600">{member.role}</p>
                    <p className="text-sm text-gray-500">
                      {member.objectivesCount} objectives • {member.completionRate}% completed
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-[#004E9E] text-white rounded text-sm hover:bg-[#003875]">
                      Review Objectives
                    </button>
                    <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                      Approve
                    </button>
                    <button className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                      Request Changes
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No pending reviews</h3>
            <p className="mt-1 text-sm text-gray-500">All team members are up to date with their objectives.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Template Management Panel Component
function TemplateManagementPanel({ 
  templates, 
  setTemplates 
}: { 
  templates: ObjectiveTemplate[]; 
  setTemplates: (templates: ObjectiveTemplate[]) => void; 
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [newTemplate, setNewTemplate] = useState<Partial<ObjectiveTemplate>>({
    title: '',
    description: '',
    category: 'performance',
    type: 'qualitative',
    defaultWeight: 20,
    suggestedTarget: '',
    applicableRoles: []
  });

  const handleCreateTemplate = () => {
    if (!newTemplate.title || !newTemplate.description) {
      alert('Please fill in all required fields.');
      return;
    }

    const template: ObjectiveTemplate = {
      id: `temp${Date.now()}`,
      title: newTemplate.title!,
      description: newTemplate.description!,
      category: newTemplate.category as any,
      type: newTemplate.type as any,
      defaultWeight: newTemplate.defaultWeight!,
      suggestedTarget: newTemplate.suggestedTarget!,
      applicableRoles: newTemplate.applicableRoles!
    };

    setTemplates([...templates, template]);
    setNewTemplate({
      title: '',
      description: '',
      category: 'performance',
      type: 'qualitative',
      defaultWeight: 20,
      suggestedTarget: '',
      applicableRoles: []
    });
    setIsCreating(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Objective Templates</h3>
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-[#004E9E] text-white rounded-md hover:bg-[#003875] flex items-center space-x-2"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Create Template</span>
          </button>
        </div>

        {isCreating && (
          <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h4 className="font-medium text-gray-900 mb-4">Create New Template</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newTemplate.title}
                  onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-[#004E9E] focus:border-[#004E9E]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value as any })}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-[#004E9E] focus:border-[#004E9E]"
                >
                  <option value="performance">Performance</option>
                  <option value="development">Development</option>
                  <option value="leadership">Leadership</option>
                  <option value="innovation">Innovation</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                  rows={3}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-[#004E9E] focus:border-[#004E9E]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={newTemplate.type}
                  onChange={(e) => setNewTemplate({ ...newTemplate, type: e.target.value as any })}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-[#004E9E] focus:border-[#004E9E]"
                >
                  <option value="qualitative">Qualitative</option>
                  <option value="quantitative">Quantitative</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Default Weight (%)</label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={newTemplate.defaultWeight}
                  onChange={(e) => setNewTemplate({ ...newTemplate, defaultWeight: parseInt(e.target.value) })}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-[#004E9E] focus:border-[#004E9E]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Suggested Target</label>
                <input
                  type="text"
                  value={newTemplate.suggestedTarget}
                  onChange={(e) => setNewTemplate({ ...newTemplate, suggestedTarget: e.target.value })}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-[#004E9E] focus:border-[#004E9E]"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setIsCreating(false)}
                className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTemplate}
                className="px-3 py-1 bg-[#004E9E] text-white rounded text-sm hover:bg-[#003875]"
              >
                Create
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div key={template.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900">{template.title}</h4>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  template.category === 'performance' ? 'bg-green-100 text-green-800' :
                  template.category === 'development' ? 'bg-blue-100 text-blue-800' :
                  template.category === 'leadership' ? 'bg-purple-100 text-purple-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  {template.category}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{template.description}</p>
              <div className="space-y-1 text-xs text-gray-500">
                <p>Weight: {template.defaultWeight}%</p>
                <p>Type: {template.type}</p>
                <p>Target: {template.suggestedTarget}</p>
                <p>Roles: {template.applicableRoles.join(', ')}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
