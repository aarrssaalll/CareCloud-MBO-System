"use client";

import { useAuth } from '@/hooks/useAuth';
import { redirect } from 'next/navigation';

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth(true, ['EMPLOYEE', 'employee']);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004E9E] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not employee
  if (!user || (user.role?.toLowerCase() !== 'employee')) {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content Only - header removed for cleaner UI */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
