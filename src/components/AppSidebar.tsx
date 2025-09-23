"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { filterNavByRole } from '@/config/navigation';
import { ClockIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';

export default function AppSidebar() {
  const { user, isLoading } = useAuth(false); // Don't require auth for sidebar, let individual pages handle it
  const pathname = usePathname();

  const items = useMemo(() => {
    if (!user) return [];
    const userRole = user.role?.toLowerCase().replace('_', '-') || 'employee';
    const list = filterNavByRole(userRole);
    // Remove Profile from sidebar; accessible via top bar only
    return list.filter(i => i.name !== 'Profile' && i.href !== '/profile');
  }, [user?.role]);

  if (isLoading) {
    return (
      <aside className="w-80 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 shadow-lg hidden lg:block">
        <div className="h-full p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004E9E] mx-auto mb-4"></div>
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
      </aside>
    );
  }

  if (!user) {
    return null; // Don't render sidebar if no user
  }

  const displayName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Guest';
  const userRole = user.role?.toLowerCase().replace('_', '-') || 'employee';

  return (
    <aside className="w-80 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 shadow-lg hidden lg:block">
      <div className="h-full p-6 space-y-6 overflow-y-auto">
        {/* Profile Card */}
        <div className="bg-gradient-to-br from-[#004E9E] to-[#007BFF] rounded-2xl p-6 text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-lg">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12a4 4 0 100-8 4 4 0 000 8zm-8 8a8 8 0 1116 0v2H4v-2z"/></svg>
              </div>
              <div>
                <h3 className="text-xl font-bold">{displayName}</h3>
                <p className="text-blue-100 capitalize font-medium">{userRole.replace('-', ' ')}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/20">
                <div className="text-2xl font-bold">87%</div>
                <div className="text-sm text-blue-100">Performance</div>
              </div>
              <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/20">
                <div className="text-2xl font-bold">6/8</div>
                <div className="text-sm text-blue-100">Goals</div>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Navigation */}
        <nav aria-label="Primary" className="space-y-1">
          {items.map(item => {
            const Icon = item.icon as any;
            const active = pathname === item.href;
            
            // Determine the correct route based on role and page
            const getRouteForItem = (itemName: string, userRole: string) => {
              switch (itemName) {
                case 'Dashboard':
                  if (userRole === 'senior-management') return '/system-dashboard';
                  if (userRole === 'hr') return '/hr-dashboard';
                  if (userRole === 'manager') return '/manager-dashboard';
                  return '/emp-dashboard';
                case 'Objectives':
                  return '/objectives';
                case 'Incoming Reviews':
                  return '/hr/incoming-objectives';
                case 'All Objectives':
                  return '/hr/objectives';
                case 'Performance Review':
                  return '/performance';
                case 'Team Management':
                  return '/team';
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
                case 'Final Approvals':
                  return '/approvals';
                case 'Settings':
                  return '/settings';
                default:
                  return item.href;
              }
            };

            const targetRoute = getRouteForItem(item.name, userRole);
            
            return (
              <Link key={item.name} href={targetRoute}
                className={`group flex items-center gap-3 px-3 py-3 rounded-xl border transition-all duration-200 ${active ? 'bg-gradient-to-r from-[#004E9E] to-[#007BFF] text-white border-transparent shadow-md' : 'bg-white hover:bg-blue-50/60 text-gray-700 border-gray-100 hover:border-blue-200'}`}>
                <div className={`p-2 rounded-lg ${active ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-blue-100'}`}>
                  <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-600 group-hover:text-[#004E9E]'}`} />
                </div>
                <div className="flex-1">
                  <div className={`font-medium ${active ? 'text-white' : 'text-gray-900 group-hover:text-[#004E9E]'}`}>{item.name}</div>
                  <div className={`text-xs ${active ? 'text-blue-100' : 'text-gray-500'}`}>
                    {item.name === 'Dashboard' && 'Overview and analytics'}
                    {item.name === 'Objectives' && 'Track your goals'}
                    {item.name === 'Incoming Reviews' && 'Review manager submissions'}
                    {item.name === 'All Objectives' && 'Organization-wide view'}
                    {item.name === 'Performance Review' && 'Trends and reviews'}
                    {item.name === 'Team Management' && 'Manage your team'}
                    {item.name === 'Manager Review' && 'Final scoring & HR submission'}
                    {item.name === 'Manager Reports' && 'Team reports'}
                    {item.name === 'Bonus Structure' && 'Configure bonus'}
                    {item.name === 'HR Reports' && 'Org insights'}
                    {item.name === 'Employee Enrollment' && 'Add new employees'}
                    {item.name === 'Strategic Overview' && 'Executive KPIs'}
                    {item.name === 'Organization Reports' && 'Enterprise analytics'}
                    {item.name === 'Final Approvals' && 'Approve requests'}
                    {item.name === 'Settings' && 'System preferences'}
                  </div>
                </div>
                {active && <span className="w-2 h-2 bg-white rounded-full animate-pulse" />}
              </Link>
            );
          })}
        </nav>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Quick Actions</h4>
          <button className="w-full flex items-center space-x-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-blue-200 group">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
              <ClockIcon className="w-5 h-5" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-gray-900">Review Objectives</p>
              <p className="text-sm text-gray-500">Update progress</p>
            </div>
          </button>
        </div>
      </div>
    </aside>
  );
}
