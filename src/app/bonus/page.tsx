"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Bonus {
  id: string;
  quarter: string;
  year: number;
  baseAmount: number;
  performanceMultiplier: number;
  finalAmount: number;
  status: string;
  calculatedAt: string;
  paidAt?: string;
}

export default function BonusPage() {
  const [user, setUser] = useState<any>(null);
  const [bonuses, setBonuses] = useState<Bonus[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("mbo_user");
    if (!userData) {
      router.push("/login");
      return;
    }
    const currentUser = JSON.parse(userData);
    setUser(currentUser);
    loadBonusHistory(currentUser.id);
  }, [router]);

  const loadBonusHistory = async (userId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/mbo/bonus/history?userId=${userId}`);
      const result = await response.json();
      
      if (result.bonuses) {
        setBonuses(result.bonuses);
      }
    } catch (error) {
      console.error('Error loading bonus history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'paid':
        return 'text-green-600 bg-green-100';
      case 'calculated':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen ms-surface bg-ms-gray-50">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="ms-text-xxlarge font-semibold text-ms-gray-900">Bonus History</h1>
          <p className="ms-text-medium text-ms-gray-600 mt-2">View your quarterly bonus payments and calculations</p>
        </div>

        <div className="ms-card p-6">
          <h2 className="ms-text-large font-semibold text-ms-gray-900 mb-4">Bonus Payments</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ms-blue-600 mx-auto"></div>
              <p className="mt-2 text-ms-gray-600">Loading bonus history...</p>
            </div>
          ) : bonuses.length === 0 ? (
            <p className="text-ms-gray-600 text-center py-8">No bonus records found.</p>
          ) : (
            <div className="space-y-4">
              {bonuses.map((bonus) => (
                <div key={bonus.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {bonus.quarter} {bonus.year}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Calculated: ${(bonus.finalAmount || 0).toFixed(2)} • 
                        Performance: {((bonus.performanceMultiplier || 0) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(bonus.status)}`}>
                        {bonus.status}
                      </span>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        ${(bonus.finalAmount || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Base Amount:</span> ${(bonus.baseAmount || 0).toFixed(2)}
                    </div>
                    <div>
                      <span className="font-medium">Calculated:</span> {bonus.calculatedAt ? new Date(bonus.calculatedAt).toLocaleDateString() : 'N/A'}
                    </div>
                    {bonus.paidAt && (
                      <div>
                        <span className="font-medium">Paid:</span> {new Date(bonus.paidAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
