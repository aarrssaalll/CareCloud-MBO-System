"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";

export default function BonusPage() {
  const [user, setUser] = useState<any>(null);
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

  return (
    <div className="min-h-screen ms-surface bg-ms-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="ms-text-xxlarge font-semibold text-ms-gray-900">Bonus History</h1>
          <p className="ms-text-medium text-ms-gray-600 mt-2">View your quarterly bonus payments and calculations</p>
        </div>

        <div className="ms-card p-6">
          <h2 className="ms-text-large font-semibold text-ms-gray-900 mb-4">Bonus Payments</h2>
          <p className="ms-text-medium text-ms-gray-600">Bonus history feature coming soon...</p>
        </div>
      </main>
    </div>
  );
}
