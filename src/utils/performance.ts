// Performance utilities for the MBO application

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export const memoize = <T extends (...args: any[]) => any>(
  func: T,
  getKey?: (...args: Parameters<T>) => string
): T => {
  const cache = new Map();
  return ((...args: Parameters<T>) => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

// Lazy loading utility
export const lazy = <T>(factory: () => Promise<{ default: T }>) => {
  let promise: Promise<{ default: T }> | null = null;
  let component: T | null = null;
  
  return () => {
    if (component) {
      return Promise.resolve(component);
    }
    
    if (!promise) {
      promise = factory();
    }
    
    return promise.then(module => {
      component = module.default;
      return component;
    });
  };
};

// Performance measurement
export const measurePerformance = (name: string) => {
  const start = performance.now();
  
  return {
    end: () => {
      const end = performance.now();
      const duration = end - start;
      console.log(`${name} took ${duration.toFixed(2)}ms`);
      return duration;
    }
  };
};

// Virtual scrolling helper
export const getVisibleItems = <T>(
  items: T[],
  containerHeight: number,
  itemHeight: number,
  scrollTop: number
): { visibleItems: T[]; startIndex: number; endIndex: number } => {
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length - 1
  );
  
  return {
    visibleItems: items.slice(startIndex, endIndex + 1),
    startIndex,
    endIndex
  };
};
