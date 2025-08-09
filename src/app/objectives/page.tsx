"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  CalendarIcon,
  ScaleIcon,
  ChartBarIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

interface Objective {
  id: string;
  title: string;
  description: string;
  weight: number;
  type: "quantitative" | "qualitative";
  target: string;
  progress: number;
  status: "pending" | "in_progress" | "completed" | "overdue";
  dueDate: string;
  remarks?: string;
  lastUpdated: string;
  aiScore?: number;
  managerOverride?: {
    score: number;
    justification: string;
    timestamp: string;
  };
}

export default function ObjectivesPage() {
  const [selectedObjective, setSelectedObjective] = useState<Objective | null>(null);
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState({
    name: "Guest",
    role: "employee" as const,
    email: "guest@carecloud.com"
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      window.location.href = "/login";
    }
  }, []);

  // Sample objectives data
  const objectives: Objective[] = [
    {
      id: "1",
      title: "Increase Customer Satisfaction Score",
      description: "Achieve and maintain a customer satisfaction score of 90% or higher throughout Q4 2024 by implementing feedback-driven improvements.",
      weight: 25,
      type: "quantitative",
      target: "90% Customer Satisfaction",
      progress: 85,
      status: "in_progress",
      dueDate: "2024-12-30",
      lastUpdated: "2024-11-30",
      aiScore: 22,
      remarks: "Currently at 85% satisfaction. Implemented new feedback system and increased response time. Planning customer survey campaign for December."
    },
    {
      id: "2",
      title: "Complete Advanced Product Training",
      description: "Successfully complete all advanced product training modules and pass the certification exam with a score of 85% or higher.",
      weight: 15,
      type: "qualitative",
      target: "Training Certification",
      progress: 100,
      status: "completed",
      dueDate: "2024-11-28",
      lastUpdated: "2024-11-27",
      aiScore: 15,
      remarks: "Completed all 12 training modules ahead of schedule. Achieved 92% on certification exam. Applied new knowledge to recent customer interactions."
    },
    {
      id: "3",
      title: "Lead Cross-Functional Team Projects",
      description: "Successfully lead 2 cross-functional projects that demonstrate collaboration, communication, and project management skills.",
      weight: 20,
      type: "qualitative",
      target: "2 Successful Projects",
      progress: 60,
      status: "in_progress",
      dueDate: "2024-12-30",
      lastUpdated: "2024-11-24",
      aiScore: 12,
      remarks: "Leading the customer onboarding improvement project (75% complete) and the internal process automation initiative (45% complete). Both projects on track for Q4 completion."
    },
    {
      id: "4",
      title: "Revenue Growth Contribution",
      description: "Contribute to team revenue growth by identifying and pursuing 3 new business opportunities worth at least $50K each.",
      weight: 30,
      type: "quantitative",
      target: "$150K New Business",
      progress: 80,
      status: "in_progress",
      dueDate: "2024-12-31",
      lastUpdated: "2024-11-20",
      aiScore: 24,
      remarks: "Identified 4 opportunities totaling $180K. Closed 2 deals ($120K). Working on final 2 prospects for December close."
    },
    {
      id: "5",
      title: "Process Improvement Initiative",
      description: "Identify and implement one significant process improvement that increases team efficiency by at least 15%.",
      weight: 10,
      type: "quantitative",
      target: "15% Efficiency Gain",
      progress: 40,
      status: "in_progress",
      dueDate: "2024-12-31",
      lastUpdated: "2024-11-15",
      aiScore: 4,
      remarks: "Analyzing current workflow bottlenecks. Proposed automation solution for ticket routing. Pilot testing in December."
    }
  ];

  const handleRemarksSubmit = async (objectiveId: string) => {
    setIsSubmitting(true);
    try {
      console.log("Submitting remarks for objective:", objectiveId, remarks);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setRemarks("");
      setSelectedObjective(null);
      alert("Remarks submitted successfully!");
    } catch (error) {
      console.error("Error submitting remarks:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusConfig = (status: Objective["status"]) => {
    switch (status) {
      case "completed":
        return {
          icon: CheckCircleIcon,
          color: "text-green-600",
          bg: "bg-green-50",
          border: "border-green-200",
          label: "COMPLETED"
        };
      case "in_progress":
        return {
          icon: ClockIcon,
          color: "text-blue-600",
          bg: "bg-blue-50",
          border: "border-blue-200",
          label: "IN PROGRESS"
        };
      case "pending":
        return {
          icon: ClockIcon,
          color: "text-gray-600",
          bg: "bg-gray-50",
          border: "border-gray-200",
          label: "PENDING"
        };
      case "overdue":
        return {
          icon: ExclamationTriangleIcon,
          color: "text-red-600",
          bg: "bg-red-50",
          border: "border-red-200",
          label: "OVERDUE"
        };
    }
  };

  const calculateTotalScore = () => {
    return objectives.reduce((total, obj) => total + (obj.aiScore || 0), 0);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return "from-green-500 to-green-600";
    if (progress >= 70) return "from-blue-500 to-blue-600";
    if (progress >= 50) return "from-yellow-500 to-yellow-600";
    return "from-red-500 to-red-600";
  };

  return (
    <div className="min-h-screen ms-surface bg-ms-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className="ms-text-xxlarge font-semibold text-ms-gray-900">My Objectives</h1>
              <p className="mt-2 ms-text-medium text-ms-gray-600">Q4 2024 • Track your progress and add remarks</p>
            </div>
            
            {/* Score Summary Card */}
            <div className="ms-card p-6 lg:w-80">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="ms-text-large font-semibold text-ms-gray-900">Current Score</h3>
                  <p className="ms-text-small text-ms-gray-600">AI-Generated Assessment</p>
                </div>
                <div className="p-3 bg-ms-blue-100 rounded-lg">
                  <StarIcon className="w-6 h-6 text-ms-blue" />
                </div>
              </div>
              <div className="flex items-end space-x-2">
                <p className="ms-text-xxlarge font-semibold text-ms-blue">{calculateTotalScore()}</p>
                <p className="ms-text-large text-ms-gray-600 mb-1">/100</p>
              </div>
              <div className="mt-3 ms-text-small text-ms-gray-600">
                {objectives.filter(o => o.status === "completed").length} of {objectives.length} objectives completed
              </div>
            </div>
          </div>
        </div>

        {/* Objectives List */}
        <div className="space-y-6">
          {objectives.map((objective) => {
            const statusConfig = getStatusConfig(objective.status);
            const StatusIcon = statusConfig.icon;
            
            return (
              <div key={objective.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
                <div className="p-6">
                  {/* Objective Header */}
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
                    <div className="flex-1 mb-4 lg:mb-0 lg:pr-6">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <h3 className="text-xl font-semibold text-text-dark">{objective.title}</h3>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color} ${statusConfig.bg} ${statusConfig.border} border`}>
                          <StatusIcon className="w-4 h-4 mr-1" />
                          {statusConfig.label}
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                          {objective.type}
                        </span>
                      </div>
                      <p className="text-text-light leading-relaxed">{objective.description}</p>
                    </div>
                    
                    {/* Quick Stats */}
                    <div className="flex lg:flex-col gap-4 lg:gap-2 lg:text-right">
                      <div className="text-center lg:text-right">
                        <p className="text-xs font-medium text-text-light uppercase tracking-wide">Weight</p>
                        <p className="text-lg font-bold text-text-dark">{objective.weight}%</p>
                      </div>
                      <div className="text-center lg:text-right">
                        <p className="text-xs font-medium text-text-light uppercase tracking-wide">AI Score</p>
                        <p className="text-lg font-bold text-primary">{objective.aiScore}<span className="text-text-light">/{objective.weight}</span></p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Section */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-text-light font-medium">
                        Progress to Target: <span className="text-text-dark font-semibold">{objective.target}</span>
                      </span>
                      <span className="text-xl font-bold text-primary">{objective.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r ${getProgressColor(objective.progress)}`}
                        style={{ width: `${objective.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <CalendarIcon className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-text-light uppercase tracking-wide">Due Date</p>
                        <p className="text-sm font-semibold text-text-dark">
                          {new Date(objective.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <ScaleIcon className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-text-light uppercase tracking-wide">Weight</p>
                        <p className="text-sm font-semibold text-text-dark">{objective.weight}%</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <ChartBarIcon className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-text-light uppercase tracking-wide">Last Updated</p>
                        <p className="text-sm font-semibold text-text-dark">
                          {new Date(objective.lastUpdated).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Manager Override */}
                  {objective.managerOverride && (
                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <h4 className="font-semibold text-amber-800 mb-2 flex items-center">
                        <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                        Manager Override
                      </h4>
                      <p className="text-sm text-amber-700 mb-1">
                        Score adjusted to {objective.managerOverride.score}/{objective.weight}
                      </p>
                      <p className="text-xs text-amber-600">
                        Reason: {objective.managerOverride.justification}
                      </p>
                    </div>
                  )}

                  {/* Remarks Section */}
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-text-dark">Your Remarks</h4>
                      <button
                        onClick={() => setSelectedObjective(objective)}
                        className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
                      >
                        <PencilIcon className="w-4 h-4 mr-2" />
                        {objective.remarks ? "Edit Remarks" : "Add Remarks"}
                      </button>
                    </div>
                    
                    {objective.remarks ? (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <p className="text-text-dark leading-relaxed mb-3">{objective.remarks}</p>
                        <p className="text-xs text-text-light">
                          Last updated: {new Date(objective.lastUpdated).toLocaleDateString()}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <p className="text-text-light mb-2">No remarks added yet</p>
                        <p className="text-xs text-text-light">Click "Add Remarks" to share your progress notes and updates</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Remarks Modal */}
        {selectedObjective && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-text-dark">
                    {selectedObjective.remarks ? "Edit Remarks" : "Add Remarks"}
                  </h3>
                  <button
                    onClick={() => setSelectedObjective(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-text-light mt-1">{selectedObjective.title}</p>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <h4 className="text-lg font-medium text-text-dark mb-2">Objective Details</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-text-dark mb-3">{selectedObjective.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-text-light">Target:</span>
                        <span className="ml-2 text-text-dark">{selectedObjective.target}</span>
                      </div>
                      <div>
                        <span className="font-medium text-text-light">Progress:</span>
                        <span className="ml-2 text-text-dark">{selectedObjective.progress}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="remarks" className="block text-sm font-medium text-text-dark mb-2">
                    Your Progress Notes
                  </label>
                  <textarea
                    id="remarks"
                    rows={6}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                    placeholder="Share your progress, challenges, achievements, and any updates related to this objective..."
                    defaultValue={selectedObjective.remarks || ""}
                  />
                  <p className="text-xs text-text-light mt-1">
                    Provide detailed updates on your progress, key achievements, and any obstacles you've encountered.
                  </p>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setSelectedObjective(null)}
                    className="px-6 py-2 border border-gray-300 text-text-dark rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleRemarksSubmit(selectedObjective.id)}
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? "Saving..." : "Save Remarks"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
