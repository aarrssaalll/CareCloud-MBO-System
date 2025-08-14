"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PayrollPage() {
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
    <div className="min-h-screen bg-gray-50">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-dark">Payroll Reports</h1>
          <p className="text-text-light mt-2">Generate and analyze payroll and bonus reports</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-text-dark mb-4">Payroll Analytics</h2>
          <p className="text-text-light">Comprehensive payroll reporting features coming soon...</p>
        </div>
      </main>
    </div>
  );
}
