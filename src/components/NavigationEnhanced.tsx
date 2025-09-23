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
  Cog8ToothIcon,
  UsersIcon,
  AdjustmentsHorizontalIcon
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
    roles: ['employee', 'manager', 'senior-management']
  },
  {
    name: 'HR Dashboard',
    href: '/hr-dashboard',
    icon: HomeIcon,
    roles: ['hr']
  },
  {
    name: 'My Objectives',
    href: '/objectives',
    icon: ClipboardDocumentListIcon,
    roles: ['employee', 'manager']
  },
  {
    name: 'Performance Review',
    href: '/performance',
    icon: ChartBarIcon,
    roles: ['employee', 'manager']
  },
  {
    name: 'Team Management',
    href: '/team',
    icon: UserGroupIcon,
    roles: ['manager']
  },
  {
    name: 'Manager Dashboard',
    href: '/manager-dashboard',
    icon: Cog8ToothIcon,
    roles: ['manager', 'senior-management']
  },
  {
    name: 'Smart Assignment',
    href: '/enhanced-assignment',
    icon: AdjustmentsHorizontalIcon,
    roles: ['manager', 'senior-management']
  },
  {
    name: 'Manager Review',
    href: '/manager-review',
    icon: CheckCircleIcon,
    roles: ['manager']
  },
  {
    name: 'Manager Reports',
    href: '/manager-reports',
    icon: DocumentTextIcon,
    roles: ['manager']
  },
  {
    name: 'Employee Management',
    href: '/employee-enrollment',
    icon: UsersIcon,
    roles: ['hr']
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
    name: 'System Dashboard',
    href: '/system-dashboard',
    icon: ChartPieIcon,
    roles: ['senior-management']
  },
  {
    name: 'Organization Management',
    href: '/organization-management',
    icon: BuildingOfficeIcon,
    roles: ['senior-management', 'hr']
  },
  {
    name: 'Organization Reports',
    href: '/org-reports',
    icon: DocumentTextIcon,
    roles: ['senior-management']
  },
  {
    name: 'Final Approvals',
    href: '/approvals',
    icon: CheckCircleIcon,
    roles: ['senior-management']
  },
];

interface User {
  name: string;
  email: string;
  role: 'employee' | 'manager' | 'hr' | 'senior-management';
}

interface NavigationProps {
  user?: User;
}

export default function Navigation({ user }: NavigationProps) {
  const [isHeroVisible, setIsHeroVisible] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    // Logout logic
    router.push('/');
  };

  const filteredNavigation = navigationItems.filter((item) => {
    if (!user) return false;
    
    // Normalize role format (handle both underscore and hyphen formats)
    const normalizedUserRole = user.role.toLowerCase().replace(/_/g, '-');
    
    return item.roles.includes(normalizedUserRole as any);
  });

  return (
    <>
      {/* Enhanced Top Navigation */}
      <nav className="bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Logo Section */}
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="group flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#004E9E] to-[#007BFF] rounded-xl shadow-lg group-hover:shadow-2xl transition-all duration-300 flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#004E9E] to-[#007BFF] rounded-xl opacity-0 group-hover:opacity-50 blur transition-all duration-300"></div>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-[#004E9E] to-[#007BFF] bg-clip-text text-transparent">
                    CareCloud
                  </h1>
                  <div className="text-xs text-gray-500 font-medium tracking-wider uppercase">MBO SYSTEM</div>
                </div>
              </Link>
            </div>

            {/* Enhanced Navigation Dropdown */}
            <div className="relative">
              <button
                className="group flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-[#004E9E] hover:to-[#007BFF] rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200/50"
                onMouseEnter={() => setIsHeroVisible(true)}
                onMouseLeave={() => setIsHeroVisible(false)}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <span className="text-gray-700 group-hover:text-white font-medium transition-colors">
                    Navigation
                  </span>
                </div>
                <svg className="w-4 h-4 text-gray-500 group-hover:text-white transition-all duration-300 transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Enhanced Dropdown Menu */}
              {isHeroVisible && (
                <div 
                  className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 py-6 px-4 z-50 animate-fadeIn"
                  onMouseEnter={() => setIsHeroVisible(true)}
                  onMouseLeave={() => setIsHeroVisible(false)}
                >
                  <div className="grid gap-2">
                    {filteredNavigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`group flex items-center space-x-4 px-4 py-3 rounded-2xl transition-all duration-300 ${
                          pathname === item.href
                            ? 'bg-gradient-to-r from-[#004E9E] to-[#007BFF] text-white shadow-lg transform scale-105'
                            : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 text-gray-700 hover:text-[#004E9E] hover:scale-105'
                        }`}
                      >
                        <div className={`p-2 rounded-xl transition-all duration-300 ${
                          pathname === item.href
                            ? 'bg-white/20'
                            : 'bg-gray-100 group-hover:bg-[#004E9E]/10'
                        }`}>
                          <item.icon className={`w-5 h-5 transition-colors ${
                            pathname === item.href ? 'text-white' : 'text-gray-600 group-hover:text-[#004E9E]'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className={`font-medium transition-colors ${
                            pathname === item.href ? 'text-white' : 'text-gray-900 group-hover:text-[#004E9E]'
                          }`}>
                            {item.name}
                          </div>
                          <div className={`text-xs transition-colors ${
                            pathname === item.href ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {item.name === 'Dashboard' && 'Overview and analytics'}
                            {item.name === 'My Objectives' && 'Track your goals and progress'}
                            {item.name === 'Performance Review' && 'Analyze performance trends'}
                            {item.name === 'Team Management' && 'Manage team objectives'}
                            {item.name === 'Score Reviews' && 'Review and approve scores'}
                            {item.name === 'Manager Reports' && 'Comprehensive team reports'}
                            {item.name === 'Bonus Structure' && 'Configure bonus parameters'}
                            {item.name === 'HR Reports' && 'Organization-wide insights'}
                            {item.name === 'Strategic Overview' && 'Executive dashboard and KPIs'}
                            {item.name === 'Organization Reports' && 'Enterprise-level analytics'}
                            {item.name === 'Final Approvals' && 'Review and approve requests'}
                          </div>
                        </div>
                        {pathname === item.href && (
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced User Profile Section */}
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-4">
                  <div className="text-right hidden sm:block">
                    <div className="font-semibold text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-600 capitalize flex items-center justify-end">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      {user.role.replace('-', ' ')}
                    </div>
                  </div>
                  
                  <div className="relative group">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#004E9E] to-[#007BFF] rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all duration-300 cursor-pointer">
                      <UserIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#004E9E] to-[#007BFF] rounded-2xl opacity-0 group-hover:opacity-30 blur transition-all duration-300"></div>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 text-gray-700 hover:text-white rounded-xl transition-all duration-300 border border-gray-200 hover:border-red-500"
                    title="Sign out"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                    <span className="hidden sm:inline font-medium">Sign out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
