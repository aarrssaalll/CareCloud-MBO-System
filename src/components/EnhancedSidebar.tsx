"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import { filterNavByRole } from '@/config/navigation';
import { 
  ClockIcon, 
  ChartBarIcon, 
  TrophyIcon, 
  ExclamationTriangleIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';

interface SidebarStats {
  type: string;
  overview: {
    [key: string]: any;
  };
  [key: string]: any;
}

export default function EnhancedSidebar() {
  const { user, isLoading } = useAuth(false);
  const pathname = usePathname();
  const [stats, setStats] = useState<SidebarStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  // Load dark mode preference from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);

    // Listen for storage changes (when dark mode is toggled in settings)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "darkMode") {
        setDarkMode(e.newValue === "true");
      }
    };

    // Also listen for custom events from settings page
    const handleDarkModeChange = (e: any) => {
      setDarkMode(e.detail?.darkMode ?? false);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("darkModeChanged", handleDarkModeChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("darkModeChanged", handleDarkModeChange);
    };
  }, []);

  const items = useMemo(() => {
    if (!user) return [];
    const userRole = user.role?.toLowerCase().replace('_', '-') || 'employee';
    let list = filterNavByRole(userRole);
    list = list.filter(i => i.name !== 'Profile' && i.href !== '/profile');
    
    if (userRole === 'manager') {
      const customOrder = [
        { name: 'Dashboard' },
        { name: 'My Objectives' }, // Objectives assigned by senior management
        { name: 'Pending Objectives' }, // For AI scoring and team objectives
        { name: 'Final Reviews', original: 'Manager Review' }, // Final review and HR submission
        { name: 'Performance Review' },
        { name: 'Manager Reports' }
      ];
      const mapped = customOrder.map(order => {
        const match = list.find(i => i.name === (order.original || order.name));
        if (!match) return null;
        return { ...match, name: order.name };
      }).filter(Boolean);
      return mapped;
    }
    return list;
  }, [user?.role]);

  // Fetch sidebar statistics
  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id || !user?.role) return;
      
      try {
        setStatsLoading(true);
        const response = await fetch(`/api/sidebar/stats?userId=${user.id}&role=${user.role}`);
        
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
          setLastUpdated(new Date());
        } else {
          console.error('Failed to fetch sidebar stats:', await response.text());
        }
      } catch (error) {
        console.error('Error fetching sidebar stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
    // Refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user?.id, user?.role]);

  if (isLoading) {
    return (
      <aside className={`w-80 backdrop-blur-xl border-r shadow-lg hidden lg:block ${
        darkMode
          ? 'bg-gray-900/80 border-gray-700/50'
          : 'bg-white/80 border-gray-200/50'
      }`}>
        <div className="h-full p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004E9E] mx-auto mb-4"></div>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Loading...</p>
          </div>
        </div>
      </aside>
    );
  }

  if (!user) {
    return null;
  }

  const displayName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Guest';
  const userRole = user.role?.toLowerCase().replace('_', '-') || 'employee';

  const getRouteForItem = (itemName: string, userRole: string) => {
    switch (itemName) {
      case 'Dashboard':
        if (userRole === 'senior-management') return '/system-dashboard';
        if (userRole === 'hr') return '/hr-dashboard';
        if (userRole === 'manager') return '/manager-dashboard';
        return '/emp-dashboard';
      case 'My Objectives':
        return '/manager/my-objectives';
      case 'Pending Objectives':
        if (userRole === 'manager') return '/manager/objectives';
        return '/objectives';
      case 'Review Objectives':
        if (userRole === 'senior-management') return '/senior-management/review-objectives';
        if (userRole === 'manager') return '/manager/objectives';
        return '/objectives';
      case 'Incoming Reviews':
        return '/hr/incoming-objectives';
      case 'All Objectives':
        return '/hr/objectives';
      case 'Performance Review':
        return '/performance';
      case 'Team Management':
        return '/team';
      case 'Final Reviews':
        return '/manager-review';
      case 'Manager Review':
        return '/manager-review';
      case 'Manager Reports':
        return '/manager-reports';
      case 'Bonus Structure':
        return '/bonus-structure';
      case 'HR Reports':
        return '/hr-reports';
      case 'Employee Enrollment':
        return '/employee-enrollment';
      case 'Strategic Overview':
        return '/strategic';
      case 'Organization Reports':
        return '/org-reports';
      case 'Settings':
        return '/settings';
      default:
        return '/objectives';
    }
  };

  const renderEmployeeStats = () => {
    if (!stats?.overview) return null;
    
    const { totalObjectives, completedObjectives, completionRate, overdueObjectives } = stats.overview;
    
    const cardClass = darkMode
      ? 'bg-gray-800 border-gray-700'
      : 'bg-white/20 border-white/20';
    const textPrimaryClass = darkMode ? 'text-gray-100' : 'text-white';
    const textSecondaryClass = darkMode ? 'text-gray-400' : 'text-blue-100';
    
    return (
      <>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className={`${cardClass} rounded-xl p-3 backdrop-blur-sm border`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-2xl font-bold ${textPrimaryClass}`}>{completionRate}%</div>
                <div className={`text-xs ${textSecondaryClass}`}>Completion</div>
              </div>
              <ChartBarIcon className={darkMode ? 'h-5 w-5 text-gray-400' : 'h-5 w-5 text-white/80'} />
            </div>
          </div>
          <div className={`${cardClass} rounded-xl p-3 backdrop-blur-sm border`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-2xl font-bold ${textPrimaryClass}`}>{completedObjectives}/{totalObjectives}</div>
                <div className={`text-xs ${textSecondaryClass}`}>Goals</div>
              </div>
              <TrophyIcon className={darkMode ? 'h-5 w-5 text-gray-400' : 'h-5 w-5 text-white/80'} />
            </div>
          </div>
        </div>
        
        {overdueObjectives > 0 && (
          <div className={`mt-3 p-2 ${darkMode ? 'bg-red-900/30 border-red-700/30' : 'bg-red-500/20 border-red-400/30'} rounded-lg border`}>
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className={darkMode ? 'h-4 w-4 text-red-500' : 'h-4 w-4 text-red-200'} />
              <span className={darkMode ? 'text-xs text-red-500' : 'text-xs text-red-200'}>
                {overdueObjectives} overdue objective{overdueObjectives !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}
      </>
    );
  };

  const renderManagerStats = () => {
    if (!stats?.overview) return null;
    
    const { teamMembers, totalTeamObjectives, completedTeamObjectives, pendingReviews, ownCompletionRate, teamCompletionRate } = stats.overview;
    
    const cardClass = darkMode
      ? 'bg-gray-800 border-gray-700'
      : 'bg-white/20 border-white/20';
    const textPrimaryClass = darkMode ? 'text-gray-100' : 'text-white';
    const textSecondaryClass = darkMode ? 'text-gray-400' : 'text-blue-100';
    
    return (
      <>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className={`${cardClass} rounded-xl p-3 backdrop-blur-sm border`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-2xl font-bold ${textPrimaryClass}`}>{teamCompletionRate || 0}%</div>
                <div className={`text-xs ${textSecondaryClass}`}>Team Progress</div>
              </div>
              <ChartBarIcon className={darkMode ? 'h-5 w-5 text-gray-400' : 'h-5 w-5 text-white/80'} />
            </div>
          </div>
          <div className={`${cardClass} rounded-xl p-3 backdrop-blur-sm border`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-2xl font-bold ${textPrimaryClass}`}>{teamMembers || 0}</div>
                <div className={`text-xs ${textSecondaryClass}`}>Team Size</div>
              </div>
              <UserGroupIcon className={darkMode ? 'h-5 w-5 text-gray-400' : 'h-5 w-5 text-white/80'} />
            </div>
          </div>
        </div>
        
        {pendingReviews > 0 && (
          <div className={`mt-3 p-2 ${darkMode ? 'bg-yellow-900/30 border-yellow-700/30' : 'bg-yellow-500/20 border-yellow-400/30'} rounded-lg border`}>
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className={darkMode ? 'h-4 w-4 text-yellow-500' : 'h-4 w-4 text-yellow-200'} />
              <span className={darkMode ? 'text-xs text-yellow-500' : 'text-xs text-yellow-200'}>
                {pendingReviews} pending review{pendingReviews !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}
      </>
    );
  };

  const renderHRStats = () => {
    if (!stats?.overview) return null;
    
    const { totalEmployees, totalObjectives, completedObjectives, pendingHRReviews, organizationCompletion } = stats.overview;
    
    const cardClass = darkMode
      ? 'bg-gray-800 border-gray-700'
      : 'bg-white/20 border-white/20';
    const textPrimaryClass = darkMode ? 'text-gray-100' : 'text-white';
    const textSecondaryClass = darkMode ? 'text-gray-400' : 'text-blue-100';
    const infoCardClass = darkMode
      ? 'bg-blue-900/30 border-blue-700/30'
      : 'bg-blue-500/20 border-blue-400/30';
    
    return (
      <>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className={`${cardClass} rounded-xl p-3 backdrop-blur-sm border`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-2xl font-bold ${textPrimaryClass}`}>{totalObjectives}</div>
                <div className={`text-xs ${textSecondaryClass}`}>Objectives</div>
              </div>
              <DocumentTextIcon className={darkMode ? 'h-5 w-5 text-gray-400' : 'h-5 w-5 text-white/80'} />
            </div>
          </div>
          <div className={`${cardClass} rounded-xl p-3 backdrop-blur-sm border`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-2xl font-bold ${textPrimaryClass}`}>{totalEmployees}</div>
                <div className={`text-xs ${textSecondaryClass}`}>Employees</div>
              </div>
              <UserGroupIcon className={darkMode ? 'h-5 w-5 text-gray-400' : 'h-5 w-5 text-white/80'} />
            </div>
          </div>
        </div>
        
        <div className="mt-3 space-y-2">
          {pendingHRReviews > 0 && (
            <div className={`flex justify-between items-center p-2 ${infoCardClass} rounded-lg border`}>
              <span className={darkMode ? 'text-xs text-blue-400' : 'text-xs text-blue-200'}>Awaiting Review</span>
              <span className={darkMode ? 'text-sm font-semibold text-blue-400' : 'text-sm font-semibold text-blue-200'}>{pendingHRReviews}</span>
            </div>
          )}
        </div>
      </>
    );
  };

  const renderSeniorManagementStats = () => {
    // No boxes or fields to display for senior managers
    return null;
  };

  const renderStatsForRole = () => {
    if (statsLoading) {
      return (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 rounded-xl p-3 animate-pulse">
              <div className="h-6 bg-white/20 rounded mb-1"></div>
              <div className="h-3 bg-white/20 rounded w-16"></div>
            </div>
            <div className="bg-white/10 rounded-xl p-3 animate-pulse">
              <div className="h-6 bg-white/20 rounded mb-1"></div>
              <div className="h-3 bg-white/20 rounded w-12"></div>
            </div>
          </div>
        </div>
      );
    }

    switch (userRole) {
      case 'employee':
        return renderEmployeeStats();
      case 'manager':
        return renderManagerStats();
      case 'hr':
        return renderHRStats();
      case 'senior-management':
        return renderSeniorManagementStats();
      default:
        return renderEmployeeStats();
    }
  };

  return (
    <aside className={`w-80 backdrop-blur-xl border-r shadow-lg hidden lg:block ${
      darkMode
        ? 'bg-gray-900/80 border-gray-700/50'
        : 'bg-white/80 border-gray-200/50'
    }`}>
      <div className="h-full p-6 space-y-6 overflow-y-auto">
        {/* Enhanced Profile Card with Real Data */}
        <div className="bg-gradient-to-br from-[#004E9E] to-[#007BFF] rounded-2xl p-6 text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-lg">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm-8 8a8 8 0 1116 0v2H4v-2z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold">{displayName}</h3>
                <p className="text-blue-100 capitalize font-medium">{userRole.replace('-', ' ')}</p>
              </div>
            </div>
            
            {/* Dynamic Stats Based on Role */}
            {renderStatsForRole()}
            
            {/* Last Updated */}
            {lastUpdated && (
              <div className="mt-3 text-xs text-blue-200 opacity-75">
                Updated {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </div>
          
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full -ml-8 -mb-8"></div>
        </div>

        {/* Primary Navigation */}
        <nav aria-label="Primary" className="space-y-1">
          {items.map(item => {
            if (!item) return null;
            const Icon = item.icon as any;
            let active = false;
            
            // Enhanced active logic for manager module
            if (userRole === 'manager') {
              if (item.name === 'Dashboard' && pathname === '/manager-dashboard') active = true;
              else if (item.name === 'Pending Objectives' && (pathname === '/objectives' || pathname.startsWith('/manager/objectives'))) active = true;
              else if (item.name === 'Review Objectives' && pathname.startsWith('/manager/objectives')) active = true;
              else if (item.name === 'Final Reviews' && pathname.startsWith('/manager-review')) active = true;
              else if (item.name === 'Manager Reports' && pathname.startsWith('/manager-reports')) active = true;
              else if (item.name === 'Performance Review' && pathname.startsWith('/performance')) active = true;
              else if (item.name === 'Team Management' && pathname.startsWith('/team')) active = true;
              else active = pathname === getRouteForItem(item.name, userRole);
            } else if (userRole === 'senior-management') {
              if (item.name === 'Dashboard' && pathname === '/system-dashboard') active = true;
              else if (item.name === 'Review Objectives' && pathname.startsWith('/senior-management/review-objectives')) active = true;
              else if (item.name === 'Strategic Overview' && pathname.startsWith('/strategic')) active = true;
              else if (item.name === 'Organization Reports' && pathname.startsWith('/org-reports')) active = true;
              else if (item.name === 'Settings' && pathname.startsWith('/settings')) active = true;
              else active = pathname === getRouteForItem(item.name, userRole);
            } else if ((item.name === 'Objectives' || item.name === 'Pending Objectives') && (pathname === '/objectives' || pathname === '/employee/objectives')) {
              active = true;
            } else {
              active = pathname === getRouteForItem(item.name, userRole);
            }

            const targetRoute = getRouteForItem(item.name, userRole);
            
            return (
              <Link key={item.name} href={targetRoute}
                className={`group flex items-center gap-3 px-3 py-3 rounded-xl border transition-all duration-200 ${
                  active 
                    ? 'bg-gradient-to-r from-[#004E9E] to-[#007BFF] text-white border-transparent shadow-md' 
                    : darkMode
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700 hover:border-gray-600'
                    : 'bg-white hover:bg-blue-50/60 text-gray-700 border-gray-100 hover:border-blue-200'
                }`}
              > 
                <div className={`p-2 rounded-lg ${
                  active 
                    ? 'bg-white/20' 
                    : darkMode
                    ? 'bg-gray-700 group-hover:bg-gray-600'
                    : 'bg-gray-100 group-hover:bg-blue-100'
                }`}>
                  <Icon className={`w-5 h-5 ${
                    active 
                      ? 'text-white' 
                      : darkMode
                      ? 'text-gray-400 group-hover:text-gray-300'
                      : 'text-gray-600 group-hover:text-[#004E9E]'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className={`font-medium ${
                    active 
                      ? 'text-white' 
                      : darkMode
                      ? 'text-gray-300 group-hover:text-gray-100'
                      : 'text-gray-900 group-hover:text-[#004E9E]'
                  }`}>
                    {item.name}
                  </div>
                  <div className={`text-xs ${
                    active ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {item.name === 'Dashboard' && 'Overview and analytics'}
                    {item.name === 'My Objectives' && 'My pending tasks'}
                    {item.name === 'Objectives' && 'Manage your goals'}
                    {item.name === 'Pending Objectives' && (userRole === 'manager' ? 'Manage objectives' : 'Manage your goals')}
                    {item.name === 'Review Objectives' && 'Track your goals'}
                    {item.name === 'Incoming Reviews' && 'Review manager submissions'}
                    {item.name === 'All Objectives' && 'Organization-wide view'}
                    {item.name === 'Performance Review' && 'Trends and reviews'}
                    {item.name === 'Team Management' && 'Manage your team'}
                    {item.name === 'Final Reviews' && 'Final scoring & HR submission'}
                    {item.name === 'Manager Review' && 'Final scoring & HR submission'}
                    {item.name === 'Manager Reports' && 'Team reports'}
                    {item.name === 'Bonus Structure' && 'Configure bonus'}
                    {item.name === 'HR Reports' && 'Org insights'}
                    {item.name === 'Employee Enrollment' && 'Add new employees'}
                    {item.name === 'Strategic Overview' && 'Executive KPIs'}
                    {item.name === 'Organization Reports' && 'Enterprise analytics'}
                    {item.name === 'Settings' && 'System preferences'}
                  </div>
                </div>
                {active && <span className="w-2 h-2 bg-white rounded-full animate-pulse" />}
              </Link>
            );
          })}
        </nav>

        {/* Quick Actions with Real Data Context */}
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Quick Actions</h4>
          
          {userRole === 'employee' && (
            <Link href="/employee/objectives" className="w-full flex items-center space-x-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-blue-200 group">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                <ClockIcon className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-gray-900">Update Progress</p>
                <p className="text-sm text-gray-500">Review your objectives</p>
              </div>
            </Link>
          )}
          
          {userRole === 'manager' && stats?.overview?.pendingReviews > 0 && (
            <Link href="/manager-review" className="w-full flex items-center space-x-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-blue-200 group">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:bg-yellow-600 group-hover:text-white transition-all">
                <DocumentTextIcon className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-gray-900">Pending Reviews</p>
                <p className="text-sm text-gray-500">{stats?.overview?.pendingReviews} awaiting review</p>
              </div>
            </Link>
          )}
          
          {userRole === 'hr' && stats?.overview?.pendingHRReviews > 0 && (
            <Link href="/hr/incoming-objectives" className="w-full flex items-center space-x-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-blue-200 group">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-all">
                <CheckCircleIcon className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-gray-900">HR Reviews</p>
                <p className="text-sm text-gray-500">{stats?.overview?.pendingHRReviews} need attention</p>
              </div>
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}