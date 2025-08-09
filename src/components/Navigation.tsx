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
      <nav className="bg-white shadow-sm border-b border-gray-200 relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex-shrink-0 flex items-center">
                <ChartPieIcon className="h-8 w-8 text-primary" />
                <span className="ml-2 text-xl font-bold text-gray-900">CareCloud MBO</span>
              </Link>
            </div>

            <div 
              className="flex items-center space-x-4 cursor-pointer"
              onMouseEnter={() => setIsHeroVisible(true)}
              onMouseLeave={() => setIsHeroVisible(false)}
            >
              <span className="text-sm text-gray-600 hover:text-primary transition-colors">
                Navigation Menu
              </span>
              <div className="h-6 w-6 bg-primary rounded-full flex items-center justify-center">
                <div className="h-3 w-3 bg-white rounded-full"></div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-500 capitalize">{user.role.replace('-', ' ')}</div>
                  </div>
                  <div className="flex-shrink-0">
                    <UserIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-red-600 transition-colors"
                    title="Logout"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div 
        className={`fixed top-16 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg z-40 transition-all duration-300 ease-in-out ${
          isHeroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
        }`}
        onMouseEnter={() => setIsHeroVisible(true)}
        onMouseLeave={() => setIsHeroVisible(false)}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to your {user?.role?.replace(/_/g, ' ').replace(/-/g, ' ').toUpperCase()} Portal
            </h2>
            <p className="text-gray-600">
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
                    className={`group relative bg-white rounded-xl border-2 p-6 hover:border-primary hover:shadow-lg transition-all duration-200 ${
                      isActive 
                        ? 'border-primary bg-primary-50 shadow-md' 
                        : 'border-gray-200 hover:border-primary'
                    }`}
                  >
                    <div className="flex items-center space-x-4 mb-3">
                      <div className={`p-3 rounded-lg ${
                        isActive 
                          ? 'bg-primary text-white' 
                          : 'bg-gray-100 text-gray-600 group-hover:bg-primary group-hover:text-white'
                      } transition-all duration-200`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <h3 className={`font-semibold ${
                        isActive ? 'text-primary' : 'text-gray-900 group-hover:text-primary'
                      } transition-colors`}>
                        {item.name}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Access this feature for your role
                    </p>
                    
                    {isActive && (
                      <div className="absolute top-4 right-4">
                        <div className="h-3 w-3 bg-primary rounded-full"></div>
                      </div>
                    )}
                  </Link>
                );
              })
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500 mb-2">No navigation items found</p>
                <p className="text-sm text-gray-400">
                  Current role: {user?.role || 'Not loaded'} | 
                  Normalized: {user?.role ? user.role.toLowerCase().replace(/_/g, '-') : 'N/A'}
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/profile"
                className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                <UserIcon className="h-4 w-4" />
                <span className="text-sm font-medium">Profile Settings</span>
              </Link>
              <Link
                href="/help"
                className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                <ClockIcon className="h-4 w-4" />
                <span className="text-sm font-medium">Help & Support</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors px-4 py-2 rounded-lg hover:bg-red-50"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                <span className="text-sm font-medium">Sign Out</span>
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
