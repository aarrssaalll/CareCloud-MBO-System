"use client";

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function LoadingSpinner({ 
  message = "Loading...", 
  size = 'md' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12', 
    lg: 'h-16 w-16'
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className={`animate-spin rounded-full border-b-2 border-[#004E9E] mx-auto ${sizeClasses[size]}`}></div>
        <p className="mt-4 text-gray-600 text-base">{message}</p>
      </div>
    </div>
  );
}

// Alternative compact loading component for inline usage
export function InlineLoading({ 
  message = "Loading...", 
  size = 'sm' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className={`animate-spin rounded-full border-b-2 border-[#004E9E] mr-2 ${sizeClasses[size]}`}></div>
      <span className="text-gray-600 text-sm">{message}</span>
    </div>
  );
}