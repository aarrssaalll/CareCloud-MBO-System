"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  UserIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface ApprovalItem {
  id: string;
  type: "objective_override" | "bonus_adjustment" | "performance_review" | "strategic_initiative";
  title: string;
  description: string;
  requestedBy: string;
  requestedByRole: string;
  requestDate: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "approved" | "rejected";
  currentValue?: string | number;
  proposedValue?: string | number;
  justification: string;
  impact: string;
  relatedEmployee?: string;
  department: string;
}

export default function ApprovalsPage() {
  const [user, setUser] = useState<any>(null);
  const [selectedApproval, setSelectedApproval] = useState<ApprovalItem | null>(null);
  const [filterStatus, setFilterStatus] = useState("pending");
  const [filterType, setFilterType] = useState("all");
  const [isProcessing, setIsProcessing] = useState(false);
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

  // Sample approval items
  const approvalItems: ApprovalItem[] = [
    {
      id: "1",
      type: "objective_override",
      title: "Manager Score Override - John Doe",
      description: "Request to override AI-generated score for Q4 objectives",
      requestedBy: "Jane Smith",
      requestedByRole: "Department Manager",
      requestDate: "2024-12-01",
      priority: "high",
      status: "pending",
      currentValue: 22,
      proposedValue: 25,
      justification: "Employee achieved exceptional results despite difficult market conditions. AI scoring didn't account for external factors and client retention efforts.",
      impact: "Increase in quarterly bonus calculation",
      relatedEmployee: "John Doe",
      department: "Sales"
    },
    {
      id: "2", 
      type: "bonus_adjustment",
      title: "Exceptional Performance Bonus - Emily Davis",
      description: "Request for additional performance bonus for outstanding project delivery",
      requestedBy: "Mike Johnson",
      requestedByRole: "HR Director",
      requestDate: "2024-11-28",
      priority: "medium",
      status: "pending",
      currentValue: "$8,200",
      proposedValue: "$12,500",
      justification: "Led critical project that saved company $150K and delivered 2 weeks ahead of schedule. Performance significantly exceeded standard metrics.",
      impact: "One-time bonus adjustment",
      relatedEmployee: "Emily Davis",
      department: "Engineering"
    },
    {
      id: "3",
      type: "performance_review",
      title: "Mid-Cycle Performance Review - Marketing Team",
      description: "Request to conduct early performance review due to organizational restructure",
      requestedBy: "Sarah Wilson",
      requestedByRole: "VP Marketing",
      requestDate: "2024-11-25",
      priority: "medium",
      status: "pending",
      justification: "Department restructure requires updated performance baselines. Need to reset objectives for Q1 2025 planning.",
      impact: "Affects 28 employees in marketing department",
      department: "Marketing"
    },
    {
      id: "4",
      type: "strategic_initiative",
      title: "Emergency Budget Allocation - Customer Success",
      description: "Request for additional budget allocation for customer retention initiative",
      requestedBy: "David Brown",
      requestedByRole: "Director of Customer Success",
      requestDate: "2024-11-30",
      priority: "high",
      status: "pending",
      currentValue: "$50,000",
      proposedValue: "$85,000",
      justification: "Urgent need to address increasing churn rate. Additional resources required for customer success team expansion and retention tools.",
      impact: "Potential to reduce churn by 15% and save $300K in lost revenue",
      department: "Customer Success"
    },
    {
      id: "5",
      type: "objective_override",
      title: "Score Adjustment - Team Lead Performance",
      description: "Manager override request for team leadership objectives",
      requestedBy: "Tom Wilson",
      requestedByRole: "Engineering Manager",
      requestDate: "2024-11-20",
      priority: "low",
      status: "approved",
      currentValue: 18,
      proposedValue: 20,
      justification: "Employee mentored 3 junior developers and contributed significantly to team knowledge sharing initiatives.",
      impact: "Minor bonus adjustment",
      relatedEmployee: "Alex Chen",
      department: "Engineering"
    }
  ];

  const handleApproval = async (id: string, action: "approve" | "reject", notes?: string) => {
    setIsProcessing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log(`${action} approval ${id}:`, notes);
      alert(`Request ${action}d successfully!`);
      setSelectedApproval(null);
    } catch (error) {
      console.error("Error processing approval:", error);
      alert("Error processing request. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getTypeConfig = (type: ApprovalItem["type"]) => {
    switch (type) {
      case "objective_override":
        return { icon: DocumentTextIcon, color: "text-blue-600", bg: "bg-blue-50", label: "Score Override" };
      case "bonus_adjustment":
        return { icon: CurrencyDollarIcon, color: "text-green-600", bg: "bg-green-50", label: "Bonus Adjustment" };
      case "performance_review":
        return { icon: UserIcon, color: "text-purple-600", bg: "bg-purple-50", label: "Performance Review" };
      case "strategic_initiative":
        return { icon: ExclamationTriangleIcon, color: "text-orange-600", bg: "bg-orange-50", label: "Strategic Initiative" };
      default:
        return { icon: DocumentTextIcon, color: "text-gray-600", bg: "bg-gray-50", label: "Unknown" };
    }
  };

  const getPriorityConfig = (priority: ApprovalItem["priority"]) => {
    switch (priority) {
      case "high":
        return { color: "text-red-600", bg: "bg-red-50", label: "High Priority" };
      case "medium":
        return { color: "text-yellow-600", bg: "bg-yellow-50", label: "Medium Priority" };
      case "low":
        return { color: "text-green-600", bg: "bg-green-50", label: "Low Priority" };
    }
  };

  const getStatusConfig = (status: ApprovalItem["status"]) => {
    switch (status) {
      case "pending":
        return { icon: ClockIcon, color: "text-yellow-600", bg: "bg-yellow-50", label: "Pending Review" };
      case "approved":
        return { icon: CheckCircleIcon, color: "text-green-600", bg: "bg-green-50", label: "Approved" };
      case "rejected":
        return { icon: XCircleIcon, color: "text-red-600", bg: "bg-red-50", label: "Rejected" };
    }
  };

  const filteredApprovals = approvalItems.filter(item => {
    const statusMatch = filterStatus === "all" || item.status === filterStatus;
    const typeMatch = filterType === "all" || item.type === filterType;
    return statusMatch && typeMatch;
  });

  const pendingCount = approvalItems.filter(item => item.status === "pending").length;
  const highPriorityCount = approvalItems.filter(item => item.priority === "high" && item.status === "pending").length;

  return (
    <div className="min-h-screen bg-gray-50">
      
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-dark">Final Approvals</h1>
              <p className="text-text-light mt-2">Review and approve critical organizational decisions</p>
            </div>
            
            {/* Summary Cards */}
            <div className="mt-6 lg:mt-0 flex space-x-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-50 rounded-lg">
                    <ClockIcon className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-text-dark">{pendingCount}</p>
                    <p className="text-sm text-text-light">Pending</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-50 rounded-lg">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-text-dark">{highPriorityCount}</p>
                    <p className="text-sm text-text-light">High Priority</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-light mb-2">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-light mb-2">Filter by Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="all">All Types</option>
                <option value="objective_override">Score Overrides</option>
                <option value="bonus_adjustment">Bonus Adjustments</option>
                <option value="performance_review">Performance Reviews</option>
                <option value="strategic_initiative">Strategic Initiatives</option>
              </select>
            </div>
          </div>
        </div>

        {/* Approvals List */}
        <div className="space-y-6">
          {filteredApprovals.map((approval) => {
            const typeConfig = getTypeConfig(approval.type);
            const priorityConfig = getPriorityConfig(approval.priority);
            const statusConfig = getStatusConfig(approval.status);
            const TypeIcon = typeConfig.icon;
            const StatusIcon = statusConfig.icon;

            return (
              <div key={approval.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <h3 className="text-xl font-semibold text-text-dark">{approval.title}</h3>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color} ${statusConfig.bg}`}>
                          <StatusIcon className="w-4 h-4 mr-1" />
                          {statusConfig.label}
                        </span>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${priorityConfig.color} ${priorityConfig.bg}`}>
                          {priorityConfig.label}
                        </span>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${typeConfig.color} ${typeConfig.bg}`}>
                          <TypeIcon className="w-4 h-4 mr-1" />
                          {typeConfig.label}
                        </span>
                      </div>
                      <p className="text-text-light mb-3">{approval.description}</p>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-text-light">Requested by:</span>
                          <p className="text-text-dark">{approval.requestedBy}</p>
                          <p className="text-xs text-text-light">{approval.requestedByRole}</p>
                        </div>
                        <div>
                          <span className="font-medium text-text-light">Department:</span>
                          <p className="text-text-dark">{approval.department}</p>
                        </div>
                        <div>
                          <span className="font-medium text-text-light">Request Date:</span>
                          <p className="text-text-dark">{new Date(approval.requestDate).toLocaleDateString()}</p>
                        </div>
                        {approval.relatedEmployee && (
                          <div>
                            <span className="font-medium text-text-light">Employee:</span>
                            <p className="text-text-dark">{approval.relatedEmployee}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Value Change Display */}
                  {approval.currentValue && approval.proposedValue && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-text-dark mb-2">Proposed Change</h4>
                      <div className="flex items-center space-x-4">
                        <div>
                          <span className="text-sm text-text-light">Current:</span>
                          <span className="ml-2 font-semibold text-text-dark">{approval.currentValue}</span>
                        </div>
                        <span className="text-gray-400">→</span>
                        <div>
                          <span className="text-sm text-text-light">Proposed:</span>
                          <span className="ml-2 font-semibold text-primary">{approval.proposedValue}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setSelectedApproval(approval)}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary-50 transition-colors mb-3 lg:mb-0"
                    >
                      <EyeIcon className="w-4 h-4 mr-2" />
                      View Details
                    </button>
                    
                    {approval.status === "pending" && (
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleApproval(approval.id, "reject")}
                          disabled={isProcessing}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                        >
                          <XMarkIcon className="w-4 h-4 mr-2" />
                          Reject
                        </button>
                        <button
                          onClick={() => handleApproval(approval.id, "approve")}
                          disabled={isProcessing}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                          <CheckIcon className="w-4 h-4 mr-2" />
                          {isProcessing ? "Processing..." : "Approve"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail Modal */}
        {selectedApproval && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-semibold text-text-dark">{selectedApproval.title}</h3>
                  <button
                    onClick={() => setSelectedApproval(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-lg font-medium text-text-dark mb-3">Request Details</h4>
                  <p className="text-text-dark leading-relaxed">{selectedApproval.description}</p>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-text-dark mb-3">Justification</h4>
                  <p className="text-text-dark leading-relaxed">{selectedApproval.justification}</p>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-text-dark mb-3">Impact Assessment</h4>
                  <p className="text-text-dark leading-relaxed">{selectedApproval.impact}</p>
                </div>

                {selectedApproval.status === "pending" && (
                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => handleApproval(selectedApproval.id, "reject")}
                      disabled={isProcessing}
                      className="px-6 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                    >
                      <XMarkIcon className="w-4 h-4 mr-2 inline" />
                      Reject Request
                    </button>
                    <button
                      onClick={() => handleApproval(selectedApproval.id, "approve")}
                      disabled={isProcessing}
                      className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      <CheckIcon className="w-4 h-4 mr-2 inline" />
                      {isProcessing ? "Processing..." : "Approve Request"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
