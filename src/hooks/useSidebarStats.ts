import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

interface SidebarStats {
  type: string;
  overview: {
    [key: string]: any;
  };
  [key: string]: any;
}

interface UseSidebarStatsReturn {
  stats: SidebarStats | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
}

export function useSidebarStats(): UseSidebarStatsReturn {
  const { user } = useAuth(false);
  const [stats, setStats] = useState<SidebarStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStats = useCallback(async () => {
    if (!user?.id || !user?.role) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `/api/sidebar/stats?userId=${encodeURIComponent(user.id)}&role=${encodeURIComponent(user.role)}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
        setLastUpdated(new Date());
      } else {
        throw new Error(data.error || 'Failed to fetch sidebar statistics');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching sidebar stats:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.role]);

  // Initial fetch and setup periodic refresh
  useEffect(() => {
    fetchStats();
    
    // Refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    lastUpdated,
    refresh: fetchStats
  };
}

// Helper functions to extract specific metrics
export function getCompletionRate(stats: SidebarStats | null): number {
  if (!stats?.overview) return 0;
  
  switch (stats.type) {
    case 'employee':
      return stats.overview.completionRate || 0;
    case 'manager':
      return stats.overview.ownCompletionRate || 0;
    case 'hr':
      return stats.overview.organizationCompletion || 0;
    case 'senior-management':
      return stats.overview.strategicCompletion || 0;
    default:
      return 0;
  }
}

export function getPendingItems(stats: SidebarStats | null): number {
  if (!stats?.overview) return 0;
  
  switch (stats.type) {
    case 'employee':
      return stats.overview.overdueObjectives || 0;
    case 'manager':
      return stats.overview.pendingReviews || 0;
    case 'hr':
      return stats.overview.pendingHRReviews || 0;
    case 'senior-management':
      return 0; // Senior management doesn't have pending items in this context
    default:
      return 0;
  }
}

export function getTotalObjectives(stats: SidebarStats | null): number {
  if (!stats?.overview) return 0;
  
  switch (stats.type) {
    case 'employee':
      return stats.overview.totalObjectives || 0;
    case 'manager':
      return stats.overview.totalTeamObjectives || 0;
    case 'hr':
      return stats.overview.totalObjectives || 0;
    case 'senior-management':
      return stats.overview.totalObjectives || 0;
    default:
      return 0;
  }
}

export function getCompletedObjectives(stats: SidebarStats | null): number {
  if (!stats?.overview) return 0;
  
  switch (stats.type) {
    case 'employee':
      return stats.overview.completedObjectives || 0;
    case 'manager':
      return stats.overview.completedTeamObjectives || 0;
    case 'hr':
      return stats.overview.completedObjectives || 0;
    case 'senior-management':
      return stats.overview.completedObjectives || 0;
    default:
      return 0;
  }
}

// Get role-specific primary metric
export function getPrimaryMetric(stats: SidebarStats | null, role: string): { value: string; label: string } {
  if (!stats?.overview) return { value: '0', label: 'No Data' };
  
  switch (role.toLowerCase()) {
    case 'employee':
      return {
        value: `${getCompletionRate(stats)}%`,
        label: 'Completion Rate'
      };
    case 'manager':
      return {
        value: `${stats.overview.teamMembers || 0}`,
        label: 'Team Members'
      };
    case 'hr':
      return {
        value: `${stats.overview.totalEmployees || 0}`,
        label: 'Employees'
      };
    case 'senior-management':
      return {
        value: `${getCompletionRate(stats)}%`,
        label: 'Strategic Progress'
      };
    default:
      return { value: '0', label: 'No Data' };
  }
}

// Get role-specific secondary metric
export function getSecondaryMetric(stats: SidebarStats | null, role: string): { value: string; label: string } {
  if (!stats?.overview) return { value: '0', label: 'No Data' };
  
  switch (role.toLowerCase()) {
    case 'employee':
      return {
        value: `${getCompletedObjectives(stats)}/${getTotalObjectives(stats)}`,
        label: 'Goals Completed'
      };
    case 'manager':
      return {
        value: `${getCompletionRate(stats)}%`,
        label: 'Personal Progress'
      };
    case 'hr':
      return {
        value: `${getCompletionRate(stats)}%`,
        label: 'Organization Rate'
      };
    case 'senior-management':
      return {
        value: `${stats.overview.organizationHealth || 0}%`,
        label: 'Org Health'
      };
    default:
      return { value: '0', label: 'No Data' };
  }
}