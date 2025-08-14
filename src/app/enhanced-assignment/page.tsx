'use client';

import React, { useState, useEffect } from 'react';
import { 
  PlusIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  ChartBarIcon,
  AdjustmentsHorizontalIcon,
  CalendarIcon,
  UserGroupIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

// Enhanced Assignment API for real-time objective assignment
class ObjectiveAssignmentAPI {
  static async assignObjectivesToEmployee(assignmentData: {
    employeeId: string;
    objectives: any[];
    assignedBy: string;
    dueDate: string;
    quarter: string;
  }) {
    try {
      // Simulate API call - in real implementation, call backend
      const assignment = {
        id: `assignment_${Date.now()}`,
        ...assignmentData,
        status: 'assigned',
        assignedDate: new Date().toISOString(),
        notifications: {
          employee: true,
          manager: true,
          hr: false
        }
      };

      // Save to localStorage for demo (replace with actual API call)
      const storageKey = `objectives_${assignmentData.employeeId}`;
      const existingObjectives = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      const newObjectives = assignmentData.objectives.map((obj, index) => ({
        id: `obj_${assignmentData.employeeId}_${Date.now()}_${index}`,
        ...obj,
        employeeId: assignmentData.employeeId,
        assignedBy: assignmentData.assignedBy,
        assignedDate: assignment.assignedDate,
        dueDate: assignmentData.dueDate,
        quarter: assignmentData.quarter,
        status: 'assigned',
        progress: 0,
        remarks: '',
        isLocked: false,
        aiScore: undefined,
        lastUpdated: assignment.assignedDate
      }));

      const updatedObjectives = [...existingObjectives, ...newObjectives];
      localStorage.setItem(storageKey, JSON.stringify(updatedObjectives));

      // Save assignment record
      const assignmentKey = `assignments_${assignmentData.assignedBy}`;
      const existingAssignments = JSON.parse(localStorage.getItem(assignmentKey) || '[]');
      localStorage.setItem(assignmentKey, JSON.stringify([...existingAssignments, assignment]));

      return { success: true, assignment, objectives: newObjectives };
    } catch (error) {
      console.error('Error assigning objectives:', error);
      return { success: false, error: 'Failed to assign objectives' };
    }
  }

  static async getAssignmentHistory(managerId: string) {
    try {
      const assignmentKey = `assignments_${managerId}`;
      const assignments = JSON.parse(localStorage.getItem(assignmentKey) || '[]');
      return { success: true, assignments };
    } catch (error) {
      return { success: false, error: 'Failed to fetch assignment history' };
    }
  }

  static async bulkAssignObjectives(bulkData: {
    employeeIds: string[];
    template: any;
    assignedBy: string;
    dueDate: string;
    quarter: string;
  }) {
    try {
      const results = [];
      
      for (const employeeId of bulkData.employeeIds) {
        const result = await this.assignObjectivesToEmployee({
          employeeId,
          objectives: [bulkData.template],
          assignedBy: bulkData.assignedBy,
          dueDate: bulkData.dueDate,
          quarter: bulkData.quarter
        });
        results.push({ employeeId, ...result });
      }

      return { success: true, results };
    } catch (error) {
      return { success: false, error: 'Failed to bulk assign objectives' };
    }
  }
}

// Smart Objective Recommendation Engine
class ObjectiveRecommendationEngine {
  static getRecommendationsForEmployee(employee: any, performanceHistory: any[] = []) {
    const recommendations = [];

    // Performance-based recommendations
    if (employee.completionRate < 70) {
      recommendations.push({
        type: 'improvement',
        priority: 'high',
        title: 'Performance Enhancement Plan',
        description: 'Focus on fundamental skills and goal achievement',
        weight: 25,
        category: 'development',
        suggestedActions: [
          'Schedule weekly 1:1 meetings',
          'Provide additional training resources',
          'Set smaller, achievable milestones'
        ]
      });
    }

    // Role-based recommendations
    if (employee.level === 'manager' && employee.directReports.length > 0) {
      recommendations.push({
        type: 'leadership',
        priority: 'medium',
        title: 'Team Leadership Excellence',
        description: 'Develop advanced leadership and team management skills',
        weight: 30,
        category: 'leadership',
        suggestedActions: [
          'Complete leadership certification',
          'Implement team development initiatives',
          'Mentor junior team members'
        ]
      });
    }

    // Industry-specific recommendations
    recommendations.push({
      type: 'innovation',
      priority: 'medium',
      title: 'Healthcare Technology Innovation',
      description: 'Drive innovation in healthcare technology solutions',
      weight: 20,
      category: 'innovation',
      suggestedActions: [
        'Research emerging healthcare technologies',
        'Propose process improvement initiatives',
        'Lead cross-functional innovation projects'
      ]
    });

    return recommendations;
  }

  static getQuarterlyObjectiveTemplates(quarter: string, role: string) {
    const baseTemplates = [
      {
        id: 'q3_customer_satisfaction',
        title: 'Q3 Customer Satisfaction Excellence',
        description: 'Achieve exceptional customer satisfaction scores and feedback',
        type: 'quantitative',
        defaultWeight: 25,
        target: '95% Customer Satisfaction',
        category: 'performance',
        applicableRoles: ['Customer Success Manager', 'Customer Success Specialist']
      },
      {
        id: 'q3_revenue_growth',
        title: 'Q3 Revenue Growth Contribution',
        description: 'Contribute to quarterly revenue targets through strategic initiatives',
        type: 'quantitative',
        defaultWeight: 30,
        target: '$200K Revenue Impact',
        category: 'performance',
        applicableRoles: ['Senior Customer Success Manager', 'Customer Success Manager']
      },
      {
        id: 'q3_skill_development',
        title: 'Q3 Professional Development',
        description: 'Complete advanced skill development and certification programs',
        type: 'qualitative',
        defaultWeight: 15,
        target: 'Complete 2 Advanced Certifications',
        category: 'development',
        applicableRoles: ['all']
      },
      {
        id: 'q3_process_innovation',
        title: 'Q3 Process Innovation Initiative',
        description: 'Lead or contribute to significant process improvement projects',
        type: 'qualitative',
        defaultWeight: 20,
        target: 'Implement 1 Major Process Improvement',
        category: 'innovation',
        applicableRoles: ['manager', 'senior_manager']
      },
      {
        id: 'q3_team_collaboration',
        title: 'Q3 Cross-Team Collaboration',
        description: 'Enhance collaboration across departments and teams',
        type: 'qualitative',
        defaultWeight: 10,
        target: 'Lead 2 Cross-Team Projects',
        category: 'leadership',
        applicableRoles: ['manager', 'senior_manager']
      }
    ];

    return baseTemplates.filter(template => 
      template.applicableRoles.includes(role.toLowerCase()) || 
      template.applicableRoles.includes('all')
    );
  }
}

export default function EnhancedObjectiveAssignment() {
  const [activeTab, setActiveTab] = useState<'assign' | 'bulk' | 'recommendations' | 'history'>('assign');
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [assignmentMode, setAssignmentMode] = useState<'individual' | 'bulk'>('individual');
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignmentHistory, setAssignmentHistory] = useState<any[]>([]);
  const [quarterTemplates, setQuarterTemplates] = useState<any[]>([]);

  // Mock user - in real implementation, get from auth context
  const user = {
    email: "manager@carecloud.com",
    role: "manager",
    name: "Sarah Johnson",
    id: "emp002"
  };

  useEffect(() => {
    loadTeamMembers();
    loadAssignmentHistory();
    loadQuarterTemplates();
  }, []);

  const loadTeamMembers = () => {
    // Mock team members data
    const mockTeamMembers = [
      {
        id: "emp003",
        name: "John Smith",
        email: "john.smith@carecloud.com",
        role: "Senior Customer Success Manager",
        level: "manager",
        department: "Customer Success",
        objectivesCount: 5,
        completionRate: 85,
        lastObjectiveAssignment: "2025-07-15",
        status: "active",
        performanceHistory: [
          { quarter: "Q2-2025", completionRate: 82, score: 88 },
          { quarter: "Q1-2025", completionRate: 78, score: 85 }
        ]
      },
      {
        id: "emp004",
        name: "Emily Davis",
        email: "emily.davis@carecloud.com",
        role: "Customer Success Manager",
        level: "manager",
        department: "Customer Success",
        objectivesCount: 4,
        completionRate: 75,
        lastObjectiveAssignment: "2025-07-10",
        status: "needs_objectives",
        performanceHistory: [
          { quarter: "Q2-2025", completionRate: 73, score: 79 },
          { quarter: "Q1-2025", completionRate: 68, score: 75 }
        ]
      },
      {
        id: "emp005",
        name: "Michael Chen",
        email: "michael.chen@carecloud.com",
        role: "Customer Success Manager",
        level: "manager",
        department: "Customer Success",
        objectivesCount: 3,
        completionRate: 60,
        lastObjectiveAssignment: "2025-06-20",
        status: "overdue",
        performanceHistory: [
          { quarter: "Q2-2025", completionRate: 58, score: 65 },
          { quarter: "Q1-2025", completionRate: 55, score: 62 }
        ]
      }
    ];
    setTeamMembers(mockTeamMembers);
  };

  const loadAssignmentHistory = async () => {
    const result = await ObjectiveAssignmentAPI.getAssignmentHistory(user.id);
    if (result.success) {
      setAssignmentHistory(result.assignments);
    }
  };

  const loadQuarterTemplates = () => {
    const templates = ObjectiveRecommendationEngine.getQuarterlyObjectiveTemplates('Q3-2025', 'manager');
    setQuarterTemplates(templates);
  };

  const handleIndividualAssignment = async (employeeId: string, selectedObjectives: any[]) => {
    setIsAssigning(true);
    try {
      const result = await ObjectiveAssignmentAPI.assignObjectivesToEmployee({
        employeeId,
        objectives: selectedObjectives,
        assignedBy: user.id,
        dueDate: getQuarterEndDate(),
        quarter: 'Q3-2025'
      });

      if (result.success) {
        alert(`Successfully assigned ${selectedObjectives.length} objectives!`);
        loadTeamMembers(); // Refresh team data
        loadAssignmentHistory(); // Refresh history
      } else {
        alert('Failed to assign objectives. Please try again.');
      }
    } catch (error) {
      alert('An error occurred while assigning objectives.');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleBulkAssignment = async (template: any) => {
    if (selectedEmployees.length === 0) {
      alert('Please select at least one employee.');
      return;
    }

    setIsAssigning(true);
    try {
      const result = await ObjectiveAssignmentAPI.bulkAssignObjectives({
        employeeIds: selectedEmployees,
        template,
        assignedBy: user.id,
        dueDate: getQuarterEndDate(),
        quarter: 'Q3-2025'
      });

      if (result.success) {
        const successCount = result.results.filter(r => r.success).length;
        alert(`Successfully assigned objectives to ${successCount} employees!`);
        setSelectedEmployees([]);
        loadTeamMembers();
        loadAssignmentHistory();
      }
    } catch (error) {
      alert('An error occurred during bulk assignment.');
    } finally {
      setIsAssigning(false);
    }
  };

  const getQuarterEndDate = () => {
    return '2025-09-30'; // Q3 2025 end date
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'needs_objectives':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'overdue':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'needs_objectives':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'overdue':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
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
                <h1 className="text-3xl font-bold text-gray-900">Smart Objective Assignment</h1>
                <p className="mt-1 text-sm text-gray-500">
                  AI-powered objective assignment and team management for Q3 2025
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">Team Manager</p>
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
              { id: 'assign', name: 'Assign Objectives', icon: PlusIcon },
              { id: 'bulk', name: 'Bulk Assignment', icon: UserGroupIcon },
              { id: 'recommendations', name: 'Smart Recommendations', icon: AdjustmentsHorizontalIcon },
              { id: 'history', name: 'Assignment History', icon: DocumentTextIcon }
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
        {activeTab === 'assign' && (
          <IndividualAssignmentPanel
            teamMembers={teamMembers}
            quarterTemplates={quarterTemplates}
            onAssign={handleIndividualAssignment}
            isAssigning={isAssigning}
          />
        )}

        {activeTab === 'bulk' && (
          <BulkAssignmentPanel
            teamMembers={teamMembers}
            quarterTemplates={quarterTemplates}
            selectedEmployees={selectedEmployees}
            setSelectedEmployees={setSelectedEmployees}
            onBulkAssign={handleBulkAssignment}
            isAssigning={isAssigning}
          />
        )}

        {activeTab === 'recommendations' && (
          <SmartRecommendationsPanel
            teamMembers={teamMembers}
            onAssign={handleIndividualAssignment}
          />
        )}

        {activeTab === 'history' && (
          <AssignmentHistoryPanel assignmentHistory={assignmentHistory} />
        )}
      </div>
    </div>
  );
}

// Individual Assignment Panel
function IndividualAssignmentPanel({ 
  teamMembers, 
  quarterTemplates, 
  onAssign, 
  isAssigning 
}: any) {
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);

  const handleAssign = () => {
    if (!selectedEmployee || selectedTemplates.length === 0) return;
    
    const objectives = selectedTemplates.map(templateId => {
      const template = quarterTemplates.find((t: any) => t.id === templateId);
      return template;
    }).filter(Boolean);

    onAssign(selectedEmployee, objectives);
    setSelectedEmployee('');
    setSelectedTemplates([]);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Individual Objective Assignment</h3>
        
        {/* Employee Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Employee</label>
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-[#004E9E] focus:border-[#004E9E]"
          >
            <option value="">Choose an employee...</option>
            {teamMembers.map((member: any) => (
              <option key={member.id} value={member.id}>
                {member.name} - {member.role} ({member.completionRate}% completion)
              </option>
            ))}
          </select>
        </div>

        {/* Template Selection */}
        {selectedEmployee && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Objective Templates
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quarterTemplates.map((template: any) => (
                <div
                  key={template.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedTemplates.includes(template.id)
                      ? 'border-[#004E9E] bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    setSelectedTemplates(prev => 
                      prev.includes(template.id)
                        ? prev.filter(id => id !== template.id)
                        : [...prev, template.id]
                    );
                  }}
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
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedTemplates.includes(template.id)}
                      onChange={() => {}}
                      className="h-4 w-4 text-[#004E9E] focus:ring-[#004E9E] border-gray-300 rounded"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        {selectedEmployee && selectedTemplates.length > 0 && (
          <div className="flex justify-end">
            <button
              onClick={handleAssign}
              disabled={isAssigning}
              className="px-6 py-2 bg-[#004E9E] text-white rounded-md hover:bg-[#003875] disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isAssigning ? (
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
              ) : (
                <PlusIcon className="h-4 w-4" />
              )}
              <span>{isAssigning ? 'Assigning...' : `Assign ${selectedTemplates.length} Objective(s)`}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Bulk Assignment Panel
function BulkAssignmentPanel({ 
  teamMembers, 
  quarterTemplates, 
  selectedEmployees, 
  setSelectedEmployees, 
  onBulkAssign, 
  isAssigning 
}: any) {
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const handleEmployeeToggle = (employeeId: string) => {
    setSelectedEmployees((prev: string[]) => 
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleBulkAssign = () => {
    if (!selectedTemplate || selectedEmployees.length === 0) return;
    
    const template = quarterTemplates.find((t: any) => t.id === selectedTemplate);
    onBulkAssign(template);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bulk Objective Assignment</h3>
        
        {/* Template Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Template</label>
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-[#004E9E] focus:border-[#004E9E]"
          >
            <option value="">Choose a template...</option>
            {quarterTemplates.map((template: any) => (
              <option key={template.id} value={template.id}>
                {template.title} - {template.category} ({template.defaultWeight}%)
              </option>
            ))}
          </select>
        </div>

        {/* Employee Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Employees ({selectedEmployees.length} selected)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamMembers.map((member: any) => (
              <div
                key={member.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedEmployees.includes(member.id)
                    ? 'border-[#004E9E] bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleEmployeeToggle(member.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{member.name}</h4>
                    <p className="text-sm text-gray-600">{member.role}</p>
                    <div className="flex items-center mt-1">
                      {getStatusIcon(member.status)}
                      <span className="ml-1 text-xs text-gray-500">{member.completionRate}%</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedEmployees.includes(member.id)}
                    onChange={() => {}}
                    className="h-4 w-4 text-[#004E9E] focus:ring-[#004E9E] border-gray-300 rounded"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        {selectedTemplate && selectedEmployees.length > 0 && (
          <div className="flex justify-end">
            <button
              onClick={handleBulkAssign}
              disabled={isAssigning}
              className="px-6 py-2 bg-[#004E9E] text-white rounded-md hover:bg-[#003875] disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isAssigning ? (
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
              ) : (
                <UserGroupIcon className="h-4 w-4" />
              )}
              <span>
                {isAssigning 
                  ? 'Assigning...' 
                  : `Bulk Assign to ${selectedEmployees.length} Employee(s)`
                }
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Smart Recommendations Panel
function SmartRecommendationsPanel({ teamMembers, onAssign }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI-Powered Objective Recommendations</h3>
        
        <div className="space-y-6">
          {teamMembers.map((member: any) => {
            const recommendations = ObjectiveRecommendationEngine.getRecommendationsForEmployee(
              member, 
              member.performanceHistory
            );
            
            return (
              <div key={member.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{member.name}</h4>
                    <p className="text-sm text-gray-600">{member.role}</p>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-gray-500">
                        Current Performance: {member.completionRate}%
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onAssign(member.id, recommendations)}
                    className="px-3 py-1 bg-[#004E9E] text-white rounded text-sm hover:bg-[#003875]"
                  >
                    Apply Recommendations
                  </button>
                </div>
                
                <div className="space-y-3">
                  {recommendations.map((rec: any, index: number) => (
                    <div key={index} className="bg-gray-50 rounded p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{rec.title}</h5>
                          <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                          <div className="flex items-center mt-2 space-x-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                              rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {rec.priority} priority
                            </span>
                            <span className="text-xs text-gray-500">Weight: {rec.weight}%</span>
                          </div>
                        </div>
                      </div>
                      
                      {rec.suggestedActions && (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-gray-700 mb-1">Suggested Actions:</p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {rec.suggestedActions.map((action: string, actionIndex: number) => (
                              <li key={actionIndex} className="flex items-center">
                                <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Assignment History Panel
function AssignmentHistoryPanel({ assignmentHistory }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment History</h3>
        
        {assignmentHistory.length > 0 ? (
          <div className="space-y-4">
            {assignmentHistory.map((assignment: any) => (
              <div key={assignment.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Assignment to Employee {assignment.employeeId}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {assignment.objectives.length} objectives assigned for {assignment.quarter}
                    </p>
                    <p className="text-xs text-gray-500">
                      Assigned on {new Date(assignment.assignedDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    assignment.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                    assignment.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {assignment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No assignment history</h3>
            <p className="mt-1 text-sm text-gray-500">Start assigning objectives to build your history.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function (duplicated for component isolation)
function getStatusIcon(status: string) {
  switch (status) {
    case 'active':
      return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
    case 'needs_objectives':
      return <ClockIcon className="h-4 w-4 text-yellow-500" />;
    case 'overdue':
      return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
    default:
      return <ClockIcon className="h-4 w-4 text-gray-500" />;
  }
}
