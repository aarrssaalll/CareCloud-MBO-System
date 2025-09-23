"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function ObjectivesRedirect() {
  const { user, isLoading } = useAuth(true);
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (isLoading || redirecting) return;
    
    if (!user) {
      setRedirecting(true);
      router.push('/auth/login');
      return;
    }

    // Add a small delay to ensure proper component mounting
    const timer = setTimeout(() => {
      setRedirecting(true);
      
      // Redirect based on user role
      const role = user.role?.toLowerCase();
      switch (role) {
        case 'employee':
          router.push('/employee/objectives');
          break;
        case 'manager':
          router.push('/manager/objectives');
          break;
        case 'hr':
          router.push('/hr/objectives');
          break;
        case 'senior-management':
          router.push('/hr/objectives'); // Senior management uses HR view
          break;
        default:
          // Default to employee view if role is unclear
          router.push('/employee/objectives');
          break;
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [user, isLoading, router, redirecting]);

  // Loading state
  if (isLoading || redirecting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004E9E] mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {isLoading ? 'Loading...' : 'Redirecting to your objectives...'}
          </p>
        </div>
      </div>
    );
  }

  // Fallback content (should rarely be seen due to redirect)
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004E9E] mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
