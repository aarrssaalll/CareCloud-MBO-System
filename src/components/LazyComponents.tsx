import dynamic from 'next/dynamic';

// Lazy load heavy components for better performance
export const LazyNavigation = dynamic(
  () => import('@/components/Navigation'),
  { 
    loading: () => <div className="h-16 bg-white border-b border-gray-200"></div>,
    ssr: true 
  }
);

export const LazyDashboard = dynamic(
  () => import('@/app/dashboard/page').then(mod => ({ default: mod.default })),
  { 
    loading: () => (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    ),
    ssr: false 
  }
);

export const LazyObjectives = dynamic(
  () => import('@/app/objectives/page'),
  { 
    loading: () => (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading objectives...</p>
        </div>
      </div>
    ),
    ssr: false 
  }
);

export const LazyPerformance = dynamic(
  () => import('@/app/performance/page'),
  { 
    loading: () => (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading performance...</p>
        </div>
      </div>
    ),
    ssr: false 
  }
);

export const LazyReports = dynamic(
  () => import('@/app/reports/page'),
  { 
    loading: () => (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading reports...</p>
        </div>
      </div>
    ),
    ssr: false 
  }
);
