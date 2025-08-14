"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  UsersIcon,
  ChartBarIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  performance: number;
  objectives: {
    total: number;
    completed: number;
    onTrack: number;
    atRisk: number;
  };
  lastUpdate: string;
}

export default function TeamPage() {
  const [user, setUser] = useState<any>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  if (!user) return <div>Loading...</div>;

  // Sample team data
  const teamMembers: TeamMember[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.johnson@carecloud.com",
      role: "Senior Developer",
      department: "Engineering",
      performance: 92,
      objectives: { total: 5, completed: 4, onTrack: 1, atRisk: 0 },
      lastUpdate: "2024-01-15",
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "michael.chen@carecloud.com",
      role: "Product Manager",
      department: "Product",
      performance: 88,
      objectives: { total: 6, completed: 3, onTrack: 2, atRisk: 1 },
      lastUpdate: "2024-01-14",
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      email: "emily.rodriguez@carecloud.com",
      role: "UX Designer",
      department: "Design",
      performance: 85,
      objectives: { total: 4, completed: 2, onTrack: 2, atRisk: 0 },
      lastUpdate: "2024-01-16",
    },
    {
      id: 4,
      name: "David Thompson",
      email: "david.thompson@carecloud.com",
      role: "Sales Representative",
      department: "Sales",
      performance: 78,
      objectives: { total: 7, completed: 2, onTrack: 3, atRisk: 2 },
      lastUpdate: "2024-01-13",
    },
  ];

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-100";
    if (score >= 80) return "text-blue-600 bg-blue-100";
    if (score >= 70) return "text-amber-600 bg-amber-100";
    return "text-red-600 bg-red-100";
  };

  const getObjectiveStatus = (member: TeamMember) => {
    const { completed, onTrack, atRisk } = member.objectives;
    if (atRisk > 0) return { status: "At Risk", color: "text-red-600", icon: ExclamationTriangleIcon };
    if (onTrack > completed) return { status: "On Track", color: "text-blue-600", icon: ClockIcon };
    return { status: "Excellent", color: "text-green-600", icon: CheckCircleIcon };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-dark">Team Management</h1>
          <p className="text-text-light mt-2">Monitor and manage your team&apos;s performance and objectives</p>
        </div>

        {/* Team Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-50">
                <UsersIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-text-dark">{teamMembers.length}</p>
                <p className="text-text-light text-sm">Team Members</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-50">
                <ChartBarIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-text-dark">
                  {Math.round(teamMembers.reduce((acc, m) => acc + m.performance, 0) / teamMembers.length)}%
                </p>
                <p className="text-text-light text-sm">Avg Performance</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-50">
                <TrophyIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-text-dark">
                  {teamMembers.reduce((acc, m) => acc + m.objectives.completed, 0)}
                </p>
                <p className="text-text-light text-sm">Completed Objectives</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-amber-50">
                <ExclamationTriangleIcon className="w-6 h-6 text-amber-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-text-dark">
                  {teamMembers.reduce((acc, m) => acc + m.objectives.atRisk, 0)}
                </p>
                <p className="text-text-light text-sm">At Risk Objectives</p>
              </div>
            </div>
          </div>
        </div>

        {/* Team Members Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-text-dark">Team Members</h2>
            <p className="text-text-light text-sm mt-1">Monitor individual performance and objectives</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Objectives
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teamMembers.map((member) => {
                  const status = getObjectiveStatus(member);
                  const StatusIcon = status.icon;
                  
                  return (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-text-dark">{member.name}</div>
                            <div className="text-sm text-text-light">{member.role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">
                        {member.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPerformanceColor(member.performance)}`}>
                          {member.performance}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">
                        <div className="flex space-x-2">
                          <span className="text-green-600">{member.objectives.completed} completed</span>
                          <span className="text-blue-600">{member.objectives.onTrack} on track</span>
                          {member.objectives.atRisk > 0 && (
                            <span className="text-red-600">{member.objectives.atRisk} at risk</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`flex items-center space-x-1 ${status.color}`}>
                          <StatusIcon className="w-4 h-4" />
                          <span className="text-sm font-medium">{status.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedMember(member)}
                            className="text-primary hover:text-primary-dark flex items-center space-x-1"
                          >
                            <EyeIcon className="w-4 h-4" />
                            <span>View</span>
                          </button>
                          <button className="text-blue-600 hover:text-blue-800 flex items-center space-x-1">
                            <PencilIcon className="w-4 h-4" />
                            <span>Edit</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Member Detail Modal */}
        {selectedMember && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-text-dark">
                    {selectedMember.name} - Performance Details
                  </h3>
                  <button
                    onClick={() => setSelectedMember(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-dark">Email</label>
                    <p className="text-text-light">{selectedMember.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-dark">Department</label>
                    <p className="text-text-light">{selectedMember.department}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-dark">Performance Score</label>
                    <p className="text-text-light">{selectedMember.performance}%</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-dark">Last Update</label>
                    <p className="text-text-light">{new Date(selectedMember.lastUpdate).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium text-text-dark mb-4">Objective Summary</h4>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-text-dark">{selectedMember.objectives.total}</p>
                      <p className="text-sm text-text-light">Total</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{selectedMember.objectives.completed}</p>
                      <p className="text-sm text-text-light">Completed</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{selectedMember.objectives.onTrack}</p>
                      <p className="text-sm text-text-light">On Track</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">{selectedMember.objectives.atRisk}</p>
                      <p className="text-sm text-text-light">At Risk</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
