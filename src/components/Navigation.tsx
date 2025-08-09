'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  UserGroupIcon,
  CogIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  ChartPieIcon,
  DocumentTextIcon,
  ClockIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  TrophyIcon,
  BriefcaseIcon,
  GlobeAltIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  Cog8ToothIcon
} from '@heroicons/react/24/outline';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles: ('employee' | 'manager' | 'hr' | 'senior-management')[];
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
    roles: ['employee', 'manager', 'hr', 'senior-management']
  },
  {
    name: 'My Objectives',
    href: '/objectives',
    icon: ClipboardDocumentListIcon,
    roles: ['employee', 'manager', 'hr']
  },
  {
    name: 'Performance Review',
    href: '/performance',
    icon: ChartBarIcon,
    roles: ['employee', 'manager', 'hr']
  },
  {
    name: 'Team Management',
    href: '/team',
    icon: UserGroupIcon,
    roles: ['manager', 'hr']
  },
  {
    name: 'Score Reviews',
    href: '/score-reviews',
    icon: TrophyIcon,
    roles: ['manager', 'hr']
  },
  {
    name: 'Manager Reports',
    href: '/manager-reports',
    icon: DocumentTextIcon,
    roles: ['manager', 'hr']
  },
  {
    name: 'Bonus Structure',
    href: '/bonus-structure',
    icon: AcademicCapIcon,
    roles: ['hr']
  },
  {
    name: 'HR Reports',
    href: '/hr-reports',
    icon: BriefcaseIcon,
    roles: ['hr']
  },
  {
    name: 'Strategic Overview',
    href: '/strategic',
    icon: GlobeAltIcon,
    roles: ['senior-management']
  },
  {
    name: 'Organization Reports',
    href: '/org-reports',
    icon: BuildingOfficeIcon,
    roles: ['senior-management']
  },
  {
    name: 'Final Approvals',
    href: '/approvals',
    icon: CheckCircleIcon,
    roles: ['senior-management']
  },
  {
    name: 'System Settings',
    href: '/settings',
    icon: Cog8ToothIcon,
    roles: ['senior-management']
  }
];

export default function Navigation() {
  const [isHeroVisible, setIsHeroVisible] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string; email: string } | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  const filteredItems = navigationItems.filter(item => {
    if (!user?.role) return false;
    
    // Normalize role format (handle both underscore and hyphen formats)
    const normalizedUserRole = user.role.toLowerCase().replace(/_/g, '-');
    
    return item.roles.includes(normalizedUserRole as any);
  });

  return (
    <>
      <nav className="ms-nav-enhanced bg-ms-white border-b border-ms-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex-shrink-0 flex items-center group">
                <div className="w-10 h-10 bg-gradient-to-br from-ms-blue to-ms-blue-dark mr-3 flex items-center justify-center rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                  </svg>
                </div>
                <div>
                  <span className="ms-text-large font-bold text-ms-gray-900 group-hover:text-ms-blue transition-colors">CareCloud</span>
                  <div className="ms-text-xsmall text-ms-gray-500 font-medium uppercase tracking-wider">MBO SYSTEM</div>
                </div>
              </Link>
            </div>

            <div 
              className="flex items-center space-x-4 cursor-pointer px-4 py-2 rounded-xl hover:bg-ms-blue-50 transition-all duration-300 group"
              onMouseEnter={() => setIsHeroVisible(true)}
              onMouseLeave={() => setIsHeroVisible(false)}
            >
              <div className="text-center">
                <span className="ms-text-medium font-semibold text-ms-gray-700 group-hover:text-ms-blue transition-colors">
                  Navigation
                </span>
                <div className="ms-text-xsmall text-ms-gray-500">Explore features</div>
              </div>
              <div className="p-2 rounded-lg bg-ms-gray-100 group-hover:bg-ms-blue group-hover:text-white transition-all duration-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-4">
                  <div className="text-right hidden sm:block">
                    <div className="ms-text-medium font-semibold text-ms-gray-900">{user.name}</div>
                    <div className="ms-text-small text-ms-gray-600 capitalize flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      {user.role.replace('-', ' ')}
                    </div>
                  </div>
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-ms-blue to-ms-blue-dark rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
                      <UserIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="ms-button-enhanced flex items-center space-x-2 px-4 py-2 text-sm"
                    title="Sign out"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Sign out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div 
        className={`fixed top-16 left-0 right-0 ms-surface bg-white/95 backdrop-blur-lg border-b border-ms-gray-200 shadow-2xl z-40 transition-all duration-500 ease-out ${
          isHeroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
        }`}
        onMouseEnter={() => setIsHeroVisible(true)}
        onMouseLeave={() => setIsHeroVisible(false)}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center mb-10 ms-animation-fadeInUp">
            <h2 className="ms-text-xxlarge font-bold text-ms-gray-900 mb-3">
              Welcome to your {user?.role?.replace(/_/g, ' ').replace(/-/g, ' ').toUpperCase()} Portal
            </h2>
            <p className="ms-text-medium text-ms-gray-600 max-w-2xl mx-auto">
              Access all your tools and features from this comprehensive navigation center. Everything you need is just a click away.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
            {filteredItems.length > 0 ? (
              filteredItems.map((item, index) => {
                const IconComponent = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`ms-card-interactive group relative p-6 transition-all duration-300 ms-animation-stagger`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className={`p-4 rounded-xl transition-all duration-300 ${
                        isActive 
                          ? 'bg-gradient-to-br from-ms-blue to-ms-blue-dark text-white shadow-lg' 
                          : 'bg-gradient-to-br from-ms-gray-100 to-ms-gray-200 text-ms-gray-600 group-hover:from-ms-blue group-hover:to-ms-blue-dark group-hover:text-white group-hover:shadow-lg'
                      }`}>
                        <IconComponent className="h-8 w-8" />
                      </div>
                      <div>
                        <h3 className={`ms-text-medium font-semibold mb-2 transition-colors ${
                          isActive ? 'text-ms-blue' : 'text-ms-gray-900 group-hover:text-ms-blue'
                        }`}>
                          {item.name}
                        </h3>
                        <p className="ms-text-small text-ms-gray-600 leading-relaxed">
                          {item.name === 'Dashboard' && 'Overview of your performance and key metrics'}
                          {item.name === 'Objectives' && 'Track and manage your quarterly goals'}
                          {item.name === 'Performance' && 'Analyze your performance trends and analytics'}
                          {item.name === 'Reports' && 'Generate comprehensive performance reports'}
                          {item.name === 'Bonus History' && 'View your bonus calculations and history'}
                          {item.name === 'Team Management' && 'Manage and monitor your team performance'}
                          {item.name === 'Score Reviews' && 'Review and approve team member scores'}
                          {item.name === 'Manager Reports' && 'Access detailed team analytics and reports'}
                          {item.name === 'Bonus Structure' && 'Configure bonus calculation parameters'}
                          {item.name === 'HR Reports' && 'Organization-wide analytics and insights'}
                          {item.name === 'Strategic Overview' && 'High-level organizational performance'}
                          {item.name === 'Organization Reports' && 'Enterprise-level reporting and analytics'}
                          {item.name === 'Final Approvals' && 'Review and approve critical decisions'}
                          {!['Dashboard', 'Objectives', 'Performance', 'Reports', 'Bonus History', 'Team Management', 'Score Reviews', 'Manager Reports', 'Bonus Structure', 'HR Reports', 'Strategic Overview', 'Organization Reports', 'Final Approvals'].includes(item.name) && 'Access this feature for your role'}
                        </p>
                      </div>
                    </div>
                    
                    {isActive && (
                      <div className="absolute top-4 right-4">
                        <div className="w-3 h-3 bg-ms-blue rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </Link>
                );
              })
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="w-16 h-16 bg-ms-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-ms-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.467.881-6.097 2.33l-.896-.897a1 1 0 10-1.414 1.414l.896.897a7.96 7.96 0 00-2.32 5.13c0 .776.115 1.527.331 2.237.058.19.196.335.395.335h13.651a.5.5 0 00.395-.335c.216-.71.331-1.461.331-2.237a7.96 7.96 0 00-2.32-5.13l.896-.897a1 1 0 10-1.414-1.414l-.896.897z" />
                  </svg>
                </div>
                <p className="ms-text-medium text-ms-gray-500 mb-2">No navigation items found</p>
                <p className="ms-text-small text-ms-gray-400">
                  Current role: {user?.role || 'Not loaded'} | 
                  Normalized: {user?.role ? user.role.toLowerCase().replace(/_/g, '-') : 'N/A'}
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-ms-gray-200 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <Link
                  href="/profile"
                  className="ms-button-enhanced flex items-center space-x-2 px-4 py-2 text-sm"
                >
                  <UserIcon className="h-4 w-4" />
                  <span>Profile Settings</span>
                </Link>
                <Link
                  href="/help"
                  className="ms-button-secondary flex items-center space-x-2 px-4 py-2 text-sm"
                >
                  <ClockIcon className="h-4 w-4" />
                  <span>Help & Support</span>
                </Link>
              </div>
              <div className="flex items-center space-x-4 text-ms-gray-500">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="ms-text-small">System Online</span>
                </div>
                <span className="ms-text-small">
                  Last updated: {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isHeroVisible && (
        <div 
          className="fixed inset-0 bg-black/10 z-30 transition-opacity duration-300"
          onMouseEnter={() => setIsHeroVisible(false)}
        />
      )}
    </>
  );
}
