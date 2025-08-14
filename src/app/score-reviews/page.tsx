"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  TrophyIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";

interface ScoreReview {
  id: string;
  employeeName: string;
  objective: string;
  aiScore: number;
  managerScore?: number;
  status: 'pending' | 'approved' | 'overridden';
  quarter: string;
  submittedDate: string;
}

export default function ScoreReviewsPage() {
  const [user, setUser] = useState<any>(null);
  const [reviews, setReviews] = useState<ScoreReview[]>([]);
  const [selectedReview, setSelectedReview] = useState<ScoreReview | null>(null);
  const [managerScore, setManagerScore] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(userData));
    loadReviews();
  }, [router]);

  const loadReviews = () => {
    const mockReviews: ScoreReview[] = [
      {
        id: "1",
        employeeName: "John Doe",
        objective: "Increase customer satisfaction scores by 15%",
        aiScore: 85,
        status: 'pending',
        quarter: "Q4 2024",
        submittedDate: "2024-12-15"
      },
      {
        id: "2",
        employeeName: "Alice Johnson",
        objective: "Complete project management certification",
        aiScore: 92,
        managerScore: 88,
        status: 'overridden',
        quarter: "Q4 2024",
        submittedDate: "2024-12-10"
      },
      {
        id: "3",
        employeeName: "Bob Smith",
        objective: "Reduce system downtime by 20%",
        aiScore: 78,
        managerScore: 78,
        status: 'approved',
        quarter: "Q4 2024",
        submittedDate: "2024-12-12"
      }
    ];
    setReviews(mockReviews);
  };

  const handleReviewScore = (review: ScoreReview) => {
    setSelectedReview(review);
    setManagerScore(review.managerScore || review.aiScore);
  };

  const submitReview = () => {
    if (!selectedReview) return;
    
    const updatedReviews = reviews.map(review => {
      if (review.id === selectedReview.id) {
        const newStatus: 'pending' | 'approved' | 'overridden' = 
          managerScore === review.aiScore ? 'approved' : 'overridden';
        
        return {
          ...review,
          managerScore,
          status: newStatus
        } as ScoreReview;
      }
      return review;
    });
    
    setReviews(updatedReviews);
    setSelectedReview(null);
    alert("Score review submitted successfully!");
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen ms-surface bg-ms-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="ms-text-xxlarge font-semibold text-ms-gray-900">Score Reviews</h1>
          <p className="ms-text-medium text-ms-gray-600 mt-2">Review and validate AI-generated objective scores</p>
        </div>

        <div className="ms-card p-6">
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{review.employeeName}</h3>
                    <p className="text-gray-600 mt-1">{review.objective}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-sm text-gray-500">AI Score: {review.aiScore}/100</span>
                      {review.managerScore && (
                        <span className="text-sm text-gray-500">Manager Score: {review.managerScore}/100</span>
                      )}
                      <span className="text-sm text-gray-500">{review.quarter}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        review.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : review.status === 'overridden'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {review.status === 'approved' && (
                        <CheckCircleIcon className="w-4 h-4 inline mr-1" />
                      )}
                      {review.status === 'overridden' && (
                        <ExclamationTriangleIcon className="w-4 h-4 inline mr-1" />
                      )}
                      {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                    </div>
                    {review.status === 'pending' && (
                      <button
                        onClick={() => handleReviewScore(review)}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center space-x-2"
                      >
                        <PencilIcon className="w-4 h-4" />
                        <span>Review</span>
                      </button>
                    )}
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
                      <EyeIcon className="w-4 h-4" />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Review Modal */}
        {selectedReview && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Score</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                  <p className="text-gray-900">{selectedReview.employeeName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Objective</label>
                  <p className="text-gray-900">{selectedReview.objective}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">AI Score</label>
                  <p className="text-gray-900">{selectedReview.aiScore}/100</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Manager Score</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={managerScore}
                    onChange={(e) => setManagerScore(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setSelectedReview(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitReview}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
