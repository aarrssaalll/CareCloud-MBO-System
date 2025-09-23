"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from '@/hooks/useAuth';
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
  type: string; // Matches the 'type' field in MboApproval
  status: string; // Matches the 'status' field in MboApproval
  comments?: string; // Matches the 'comments' field in MboApproval
  approverId: string; // Matches the 'approverId' field in MboApproval
  createdAt: string; // Matches the 'createdAt' field in MboApproval
  updatedAt: string; // Matches the 'updatedAt' field in MboApproval
  approvedAt?: string; // Matches the 'approvedAt' field in MboApproval
}

export default function ApprovalsPage() {
  const { user, isLoading: isAuthLoading } = useAuth(true, ['SENIOR_MANAGEMENT', 'senior-management']);
  const [selectedApproval, setSelectedApproval] = useState<ApprovalItem | null>(null);
  const [filterStatus, setFilterStatus] = useState("pending");
  const [filterType, setFilterType] = useState("all");
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();



  // Fetch live approvals once user is available
  useEffect(() => {
    if (user && user.id) {
      fetchApprovals(user.id).catch(err => console.error('fetchApprovals error:', err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Demo fallback approval items (used when API is not reachable)
  const SAMPLE_APPROVALS: ApprovalItem[] = [
    {
      id: "1",
      type: "objective_override",
      status: "pending",
      comments: "Request to override AI-generated score for Q4 objectives",
      approverId: "Jane Smith",
      createdAt: "2024-12-01",
      updatedAt: "2024-12-01",
      approvedAt: undefined,
    },
    {
      id: "2", 
      type: "bonus_adjustment",
      status: "pending",
      comments: "Request for additional performance bonus for outstanding project delivery",
      approverId: "Mike Johnson",
      createdAt: "2024-11-28",
      updatedAt: "2024-11-28",
      approvedAt: undefined,
    },
    {
      id: "3",
      type: "performance_review",
      status: "pending",
      comments: "Request to conduct early performance review due to organizational restructure",
      approverId: "Sarah Wilson",
      createdAt: "2024-11-25",
      updatedAt: "2024-11-25",
      approvedAt: undefined,
    },
    {
      id: "4",
      type: "strategic_initiative",
      status: "pending",
      comments: "Request for additional budget allocation for customer retention initiative",
      approverId: "David Brown",
      createdAt: "2024-11-30",
      updatedAt: "2024-11-30",
      approvedAt: undefined,
    },
    {
      id: "5",
      type: "objective_override",
      status: "approved",
      comments: "Manager override request for team leadership objectives",
      approverId: "Tom Wilson",
      createdAt: "2024-11-20",
      updatedAt: "2024-11-20",
      approvedAt: "2024-11-21",
    }
  ];

  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [isLoadingApprovals, setIsLoadingApprovals] = useState(false);
  const [approvalsError, setApprovalsError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  const handleApproval = async (id: string, action: "approve" | "reject", notes?: string) => {
    setIsProcessing(true);
    try {
      // Prefer API call to update approval status
      const res = await fetch('/api/mbo/approvals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvalId: id, status: action === 'approve' ? 'APPROVED' : 'REJECTED', comments: notes }),
      });

      const result = await res.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to update approval');
      }

      // Refresh approvals for current user if available
      if (user && user.id) {
        await fetchApprovals(user.id);
      } else {
        // remove or update locally as fallback
        setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: action === 'approve' ? 'approved' : 'rejected' } : a));
      }

      alert(`Request ${action}d successfully!`);
      setSelectedApproval(null);
    } catch (error: any) {
      console.error('Error processing approval:', error);
      alert('Error processing request. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const fetchApprovals = async (approverId: string) => {
    setIsLoadingApprovals(true);
    setApprovalsError(null);
    try {
      const response = await fetch(`/api/mbo/approvals?approverId=${approverId}`);
      const data = await response.json();
      if (data.success) {
        // normalize status values to match frontend expectations (lowercase for display)
        const normalized = data.data.map((a: any) => ({
          ...a,
          status: (a.status || '').toLowerCase(),
          createdAt: a.createdAt || a.requestedAt || a.requestDate,
          approverId: a.requestedByName || a.requestedBy || a.requestedById || 'Unknown',
        }));
        setApprovals(normalized);
        setUsingFallback(false);
      } else {
        setApprovalsError(data.message || 'Failed to load approvals');
        // fallback to sample data so UI remains usable in dev
        setApprovals(SAMPLE_APPROVALS);
        setUsingFallback(true);
      }
    } catch (err: any) {
      console.error('Failed to load approvals:', err);
      setApprovalsError(err.message || 'Failed to load approvals');
      setApprovals(SAMPLE_APPROVALS);
      setUsingFallback(true);
    } finally {
      setIsLoadingApprovals(false);
    }
  };

  // Only render after auth is resolved; user check happens here (keeps hooks order stable)
  if (isAuthLoading || !user) return <div>Loading...</div>;

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

  const filteredApprovals = approvals.filter(item => {
    const statusMatch = filterStatus === "all" || item.status === filterStatus;
    const typeMatch = filterType === "all" || item.type === filterType;
    return statusMatch && typeMatch;
  });

  const pendingCount = approvals.filter(item => item.status === "pending").length;

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
            </div>
          </div>
        </div>
        {usingFallback && (
          <div className="mb-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm">
            Showing demo fallback approvals because the approvals API failed or returned no data.
          </div>
        )}

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
            const TypeIcon = typeConfig.icon;

            return (
              <div key={approval.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <h3 className="text-xl font-semibold text-text-dark">{approval.type}</h3>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${typeConfig.color} ${typeConfig.bg}`}>
                          <TypeIcon className="w-4 h-4 mr-1" />
                          {typeConfig.label}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-text-light">Requested by:</span>
                          <p className="text-text-dark">{approval.approverId}</p>
                        </div>
                        <div>
                          <span className="font-medium text-text-light">Request Date:</span>
                          <p className="text-text-dark">{new Date(approval.createdAt).toLocaleDateString()}</p>
                        </div>
                        {approval.approvedAt && (
                          <div>
                            <span className="font-medium text-text-light">Approved At:</span>
                            <p className="text-text-dark">{new Date(approval.approvedAt).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

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
                  <h3 className="text-2xl font-semibold text-text-dark">{selectedApproval.type}</h3>
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
                  <p className="text-text-dark leading-relaxed">{selectedApproval.comments}</p>
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
