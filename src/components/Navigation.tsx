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
      <nav className="ms-surface bg-ms-white border-b border-ms-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-ms-blue mr-3 flex items-center justify-center rounded">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                  </svg>
                </div>
                <span className="ms-text-large font-semibold text-ms-gray-900">CareCloud MBO</span>
              </Link>
            </div>

            <div 
              className="flex items-center space-x-4 cursor-pointer ms-button-secondary border-0 bg-transparent hover:bg-ms-gray-100 px-3 py-2 rounded"
              onMouseEnter={() => setIsHeroVisible(true)}
              onMouseLeave={() => setIsHeroVisible(false)}
            >
              <span className="ms-text-medium text-ms-gray-700">
                Navigate
              </span>
              <svg className="w-4 h-4 text-ms-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="ms-text-medium font-semibold text-ms-gray-900">{user.name}</div>
                    <div className="ms-text-small text-ms-gray-600 capitalize">{user.role.replace('-', ' ')}</div>
                  </div>
                  <div className="w-8 h-8 bg-ms-blue rounded-full flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-white" />
                  </div>
                  <button
                    onClick={handleLogout}
                    className="ms-button-secondary flex items-center space-x-2"
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
        className={`fixed top-16 left-0 right-0 ms-surface bg-ms-white/95 backdrop-blur-md border-b border-ms-gray-200 shadow-lg z-40 transition-all duration-300 ease-in-out ${
          isHeroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
        }`}
        onMouseEnter={() => setIsHeroVisible(true)}
        onMouseLeave={() => setIsHeroVisible(false)}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h2 className="ms-text-xlarge font-semibold text-ms-gray-900 mb-2">
              Welcome to your {user?.role?.replace(/_/g, ' ').replace(/-/g, ' ').toUpperCase()} Portal
            </h2>
            <p className="ms-text-medium text-ms-gray-600">
              Access all your tools and features from this comprehensive navigation center
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`ms-card group relative border-2 p-6 transition-all duration-200 ${
                      isActive 
                        ? 'border-ms-blue bg-ms-blue-50 shadow-md' 
                        : 'border-ms-gray-200 hover:border-ms-blue hover:shadow-lg'
                    }`}
                  >
                    <div className="flex items-center space-x-4 mb-3">
                      <div className={`p-3 rounded-lg ${
                        isActive 
                          ? 'bg-ms-blue text-white' 
                          : 'bg-ms-gray-100 text-ms-gray-600 group-hover:bg-ms-blue group-hover:text-white'
                      } transition-all duration-200`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <h3 className={`ms-text-medium font-semibold ${
                        isActive ? 'text-ms-blue' : 'text-ms-gray-900 group-hover:text-ms-blue'
                      } transition-colors`}>
                        {item.name}
                      </h3>
                    </div>
                    <p className="ms-text-small text-ms-gray-600 leading-relaxed">
                      Access this feature for your role
                    </p>
                    
                    {isActive && (
                      <div className="absolute top-4 right-4">
                        <div className="h-3 w-3 bg-ms-blue rounded-full"></div>
                      </div>
                    )}
                  </Link>
                );
              })
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="ms-text-medium text-ms-gray-500 mb-2">No navigation items found</p>
                <p className="ms-text-small text-ms-gray-400">
                  Current role: {user?.role || 'Not loaded'} | 
                  Normalized: {user?.role ? user.role.toLowerCase().replace(/_/g, '-') : 'N/A'}
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-ms-gray-200">
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/profile"
                className="ms-button-secondary flex items-center space-x-2"
              >
                <UserIcon className="h-4 w-4" />
                <span className="ms-text-small font-medium">Profile Settings</span>
              </Link>
              <Link
                href="/help"
                className="ms-button-secondary flex items-center space-x-2"
              >
                <ClockIcon className="h-4 w-4" />
                <span className="ms-text-small font-medium">Help & Support</span>
              </Link>
              <button
                onClick={handleLogout}
                className="ms-button-secondary text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center space-x-2"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                <span className="ms-text-small font-medium">Sign Out</span>
              </button>
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
