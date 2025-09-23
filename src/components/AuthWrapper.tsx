'use client';

import { useAuth } from '@/hooks/useAuth';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface AuthWrapperProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
  fallback?: React.ReactNode;
}

export default function AuthWrapper({ 
  children, 
  requireAuth = true, 
  allowedRoles,
  fallback 
}: AuthWrapperProps) {
  const { user, isLoading, isAuthenticated } = useAuth(requireAuth, allowedRoles);

  if (isLoading) {
    return fallback || (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="h-8 w-8 animate-spin text-[#004E9E] mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return fallback || (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="h-8 w-8 animate-spin text-[#004E9E] mx-auto mb-4" />
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
