'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  firstName?: string;
  lastName?: string;
  title?: string;
  phone?: string;
  hireDate?: string;
  salary?: number;
  departmentId?: string;
  teamId?: string;
  managerId?: string;
  employeeId?: string;
  isDemoUser?: boolean;
}

export function useAuth(requireAuth: boolean = true, allowedRoles?: string[]) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  
  // Use refs to store the latest values without causing re-renders
  const requireAuthRef = useRef(requireAuth);
  const allowedRolesRef = useRef(allowedRoles);
  
  // Update refs when props change
  requireAuthRef.current = requireAuth;
  allowedRolesRef.current = allowedRoles;

  const checkAuth = useCallback(() => {
    try {
      const userData = localStorage.getItem('mbo_user');
      
      if (!userData) {
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        
        if (requireAuthRef.current) {
          console.log('No user data found, redirecting to login');
          router.push('/login');
        }
        return;
      }

      const parsedUser = JSON.parse(userData);
      
      // Validate user data structure
      if (!parsedUser.id || !parsedUser.email || !parsedUser.role) {
        console.log('Invalid user data structure, clearing and redirecting');
        localStorage.removeItem('mbo_user');
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        
        if (requireAuthRef.current) {
          router.push('/login');
        }
        return;
      }

      // Check role permissions with flexible matching
      if (allowedRolesRef.current && allowedRolesRef.current.length > 0) {
        const userRole = parsedUser.role;
        const normalizeRole = (role: string) => role.toLowerCase().replace(/_/g, '-');
        
        const normalizedUserRole = normalizeRole(userRole);
        const normalizedAllowedRoles = allowedRolesRef.current.map(role => normalizeRole(role));
        
        if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
          console.log(`Access denied. User role ${userRole} (normalized: ${normalizedUserRole}) not in allowed roles:`, normalizedAllowedRoles);
          alert(`Access denied. This page requires one of the following roles: ${allowedRolesRef.current.join(', ')}`);
          
          // Redirect to appropriate role-based dashboard instead of objectives
          const role = parsedUser.role?.toLowerCase();
          switch (role) {
            case 'employee':
              router.push('/emp-dashboard');
              break;
            case 'manager':
              router.push('/manager-dashboard');
              break;
            case 'hr':
              router.push('/hr-dashboard');
              break;
            case 'senior-management':
            case 'senior_management':
              router.push('/system-dashboard');
              break;
            default:
              router.push('/emp-dashboard');
              break;
          }
          return;
        }
      }

      setUser(parsedUser);
      setIsAuthenticated(true);
      setIsLoading(false);
      
    } catch (error) {
      console.error('Error checking authentication:', error);
      localStorage.removeItem('mbo_user');
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      
      if (requireAuthRef.current) {
        router.push('/login');
      }
    }
  }, [router]);

  useEffect(() => {
    checkAuth();

    // Listen for storage changes (if user logs out in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'mbo_user' || e.key === 'user' || e.key === null) {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Listen for focus events to re-check auth when user comes back to tab
    const handleFocus = () => {
      checkAuth();
    };
    
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [checkAuth]);

  const logout = useCallback(() => {
    localStorage.removeItem('mbo_user');
    localStorage.removeItem('user'); // Also clear backward compatibility key
    setUser(null);
    setIsAuthenticated(false);
    router.push('/login');
  }, [router]);

  const updateUser = useCallback((userData: User) => {
    localStorage.setItem('mbo_user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated,
    logout,
    updateUser
  };
}
