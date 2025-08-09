"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import {
  ClipboardDocumentCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

interface Review {
  id: number;
  employeeName: string;
  employeeEmail: string;
  objective: string;
  description: string;
  selfScore: number;
  managerScore: number | null;
  status: "pending" | "reviewed" | "approved";
  submittedDate: string;
  category: string;
  evidence: string;
  comments: string[];
}

// Sample data moved outside component to prevent recreation on every render
const SAMPLE_REVIEWS: Review[] = [
  {
    id: 1,
    employeeName: "Sarah Johnson",
    employeeEmail: "sarah.johnson@carecloud.com",
    objective: "Q4 Revenue Growth",
    description: "Increase quarterly revenue by 15% through new client acquisition",
    selfScore: 92,
    managerScore: null,
    status: "pending",
    submittedDate: "2024-01-15",
    category: "Sales",
    evidence: "Exceeded targets by securing 3 major contracts worth $2.4M total",
    comments: ["Great performance this quarter", "Excellent client relationship management"],
  },
  {
    id: 2,
    employeeName: "Michael Chen",
    employeeEmail: "michael.chen@carecloud.com",
    objective: "Product Feature Development",
    description: "Complete user authentication system overhaul",
    selfScore: 88,
    managerScore: 85,
    status: "reviewed",
    submittedDate: "2024-01-12",
    category: "Engineering",
    evidence: "Delivered secure OAuth2 implementation with 99.9% uptime",
    comments: ["Solid technical implementation", "Minor delays but quality delivery"],
  },
  {
    id: 3,
    employeeName: "Emily Rodriguez",
    employeeEmail: "emily.rodriguez@carecloud.com",
    objective: "Marketing Campaign ROI",
    description: "Achieve 4x ROI on Q4 digital marketing campaigns",
    selfScore: 95,
    managerScore: 92,
    status: "approved",
    submittedDate: "2024-01-10",
    category: "Marketing",
    evidence: "Generated $480K revenue from $120K campaign spend (4.2x ROI)",
    comments: ["Outstanding results", "Innovative campaign strategies"],
  },
  {
    id: 4,
    employeeName: "David Park",
    employeeEmail: "david.park@carecloud.com",
    objective: "Customer Satisfaction Score",
    description: "Improve NPS score to 75+ through support optimization",
    selfScore: 82,
    managerScore: null,
    status: "pending",
    submittedDate: "2024-01-14",
    category: "Customer Success",
    evidence: "Implemented new ticketing system, reduced response time by 40%",
    comments: ["Good progress on response times"],
  },
];

export default function ReviewsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [newScore, setNewScore] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [reviews, setReviews] = useState<Review[]>(SAMPLE_REVIEWS);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  if (!user) return <div>Loading...</div>;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "reviewed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <ClockIcon className="w-4 h-4" />;
      case "reviewed":
        return <ExclamationTriangleIcon className="w-4 h-4" />;
      case "approved":
        return <CheckCircleIcon className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  const handleScoreSubmit = (reviewId: number) => {
    setReviews(prev => prev.map(review => 
      review.id === reviewId 
        ? { 
            ...review, 
            managerScore: newScore, 
            status: "reviewed",
            comments: [...review.comments, comment]
          }
        : review
    ));
    setSelectedReview(null);
    setNewScore(0);
    setComment("");
  };

  const handleApprove = (reviewId: number) => {
    setReviews(prev => prev.map(review => 
      review.id === reviewId 
        ? { ...review, status: "approved" }
        : review
    ));
    setSelectedReview(null);
  };

  // Memoize computed values to prevent unnecessary recalculations
  const pendingReviews = reviews.filter(r => r.status === "pending");
  const completedReviews = reviews.filter(r => r.status !== "pending");
  const averageScore = Math.round(
    reviews.reduce((acc, r) => acc + (r.managerScore || r.selfScore), 0) / reviews.length
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-dark">Score Reviews</h1>
          <p className="text-text-light mt-2">Review and approve team performance scores</p>
        </div>

        {/* Review Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-amber-50">
                <ClockIcon className="w-6 h-6 text-amber-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-text-dark">{pendingReviews.length}</p>
                <p className="text-text-light text-sm">Pending Reviews</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-50">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-text-dark">{completedReviews.length}</p>
                <p className="text-text-light text-sm">Completed Reviews</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-50">
                <StarIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-text-dark">{averageScore}</p>
                <p className="text-text-light text-sm">Average Score</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Reviews */}
        {pendingReviews.length > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-text-dark">Pending Reviews</h2>
                <p className="text-text-light text-sm mt-1">Reviews requiring your attention</p>
              </div>
              <div className="divide-y divide-gray-200">
                {pendingReviews.map((review) => (
                  <div key={review.id} className="p-6 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-text-dark">{review.employeeName}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(review.status)}`}>
                            {getStatusIcon(review.status)}
                            <span className="ml-1">{review.status.toUpperCase()}</span>
                          </span>
                        </div>
                        <p className="text-text-dark font-medium mb-1">{review.objective}</p>
                        <p className="text-text-light text-sm mb-2">{review.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-text-light">
                          <span>Self Score: <strong className="text-text-dark">{review.selfScore}</strong></span>
                          <span>Category: {review.category}</span>
                          <span>Submitted: {new Date(review.submittedDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedReview(review)}
                        className="ml-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Completed Reviews */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-text-dark">Recent Reviews</h2>
            <p className="text-text-light text-sm mt-1">Previously reviewed and approved scores</p>
          </div>
          <div className="divide-y divide-gray-200">
            {completedReviews.map((review) => (
              <div key={review.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-text-dark">{review.employeeName}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(review.status)}`}>
                        {getStatusIcon(review.status)}
                        <span className="ml-1">{review.status.toUpperCase()}</span>
                      </span>
                    </div>
                    <p className="text-text-dark font-medium mb-1">{review.objective}</p>
                    <div className="flex items-center space-x-4 text-sm text-text-light">
                      <span>Self: <strong className="text-text-dark">{review.selfScore}</strong></span>
                      <span>Manager: <strong className="text-text-dark">{review.managerScore}</strong></span>
                      <span>Final: <strong className="text-primary">{review.managerScore}</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Review Modal */}
        {selectedReview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-text-dark">
                    Review: {selectedReview.employeeName} - {selectedReview.objective}
                  </h3>
                  <button
                    onClick={() => setSelectedReview(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-lg font-medium text-text-dark mb-2">Objective Details</h4>
                  <p className="text-text-light mb-4">{selectedReview.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Category:</span> {selectedReview.category}
                    </div>
                    <div>
                      <span className="font-medium">Self Score:</span> {selectedReview.selfScore}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-text-dark mb-2">Evidence & Results</h4>
                  <p className="text-text-light bg-gray-50 p-4 rounded-lg">{selectedReview.evidence}</p>
                </div>

                {selectedReview.comments.length > 0 && (
                  <div>
                    <h4 className="text-lg font-medium text-text-dark mb-2">Comments</h4>
                    <div className="space-y-2">
                      {selectedReview.comments.map((comment, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <ChatBubbleLeftRightIcon className="w-4 h-4 text-blue-500 mt-1" />
                          <p className="text-text-light text-sm">{comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedReview.status === "pending" && (
                  <div>
                    <h4 className="text-lg font-medium text-text-dark mb-4">Manager Review</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-text-dark mb-2">Manager Score (0-100)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={newScore}
                          onChange={(e) => setNewScore(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                          placeholder="Enter score"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-dark mb-2">Comment</label>
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                          rows={3}
                          placeholder="Add your review comment..."
                        />
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleScoreSubmit(selectedReview.id)}
                          disabled={!newScore || !comment.trim()}
                          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Submit Review
                        </button>
                        <button
                          onClick={() => setSelectedReview(null)}
                          className="px-6 py-2 border border-gray-300 text-text-dark rounded-lg hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {selectedReview.status === "reviewed" && (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleApprove(selectedReview.id)}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Approve Score
                    </button>
                    <button
                      onClick={() => setSelectedReview(null)}
                      className="px-6 py-2 border border-gray-300 text-text-dark rounded-lg hover:bg-gray-50"
                    >
                      Close
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
