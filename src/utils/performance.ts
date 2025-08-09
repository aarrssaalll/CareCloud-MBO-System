// Performance monitoring utilities
export const measurePerformance = (name: string, fn: () => void) => {
  if (typeof window === 'undefined') return fn();
  
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  console.log(`${name} took ${end - start} milliseconds`);
  return result;
};

export const logComponentRender = (componentName: string) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔄 ${componentName} rendered at ${new Date().toLocaleTimeString()}`);
  }
};

export const preloadRoute = (route: string) => {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = route;
    document.head.appendChild(link);
  }
};

// Memory monitoring (development only)
export const logMemoryUsage = () => {
  if (typeof window !== 'undefined' && (window as any).performance?.memory) {
    const memory = (window as any).performance.memory;
    console.log('Memory Usage:', {
      used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
      total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
      limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB'
    });
  }
};

// Bundle size analyzer
export const logBundleMetrics = () => {
  if (typeof window !== 'undefined') {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'navigation') {
          console.log('Navigation timing:', entry);
        }
      });
    });
    observer.observe({ entryTypes: ['navigation'] });
  }
};
