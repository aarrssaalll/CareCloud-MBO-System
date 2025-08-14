import type { ElementType } from 'react';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  UserGroupIcon,
  TrophyIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  UserIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  Cog8ToothIcon,
} from '@heroicons/react/24/outline';

export type AppRole = 'employee' | 'manager' | 'hr' | 'senior-management';

export interface NavigationItem {
  name: string;
  href: string;
  icon: ElementType;
  roles: AppRole[];
}

export const NAV_ITEMS: NavigationItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, roles: ['employee', 'manager', 'hr', 'senior-management'] },
  { name: 'Objectives', href: '/objectives', icon: ClipboardDocumentListIcon, roles: ['employee', 'manager', 'hr'] },
  { name: 'Performance Review', href: '/performance', icon: ChartBarIcon, roles: ['employee', 'manager', 'hr'] },
  { name: 'Team Management', href: '/team', icon: UserGroupIcon, roles: ['manager', 'hr'] },
  { name: 'Score Reviews', href: '/score-reviews', icon: TrophyIcon, roles: ['manager', 'hr'] },
  { name: 'Manager Reports', href: '/manager-reports', icon: DocumentTextIcon, roles: ['manager', 'hr'] },
  { name: 'Bonus Structure', href: '/bonus-structure', icon: AcademicCapIcon, roles: ['hr'] },
  { name: 'HR Reports', href: '/hr-reports', icon: BriefcaseIcon, roles: ['hr'] },
  { name: 'Employee Enrollment', href: '/employee-enrollment', icon: UserIcon, roles: ['hr'] },
  { name: 'Strategic Overview', href: '/strategic', icon: BuildingOfficeIcon, roles: ['senior-management'] },
  { name: 'Organization Reports', href: '/org-reports', icon: BuildingOfficeIcon, roles: ['senior-management'] },
  { name: 'Final Approvals', href: '/approvals', icon: CheckCircleIcon, roles: ['senior-management'] },
  { name: 'Settings', href: '/settings', icon: Cog8ToothIcon, roles: ['hr', 'senior-management'] },
  { name: 'Profile', href: '/profile', icon: UserIcon, roles: ['employee', 'manager', 'hr', 'senior-management'] },
];

export function filterNavByRole(role?: string) {
  if (!role) return [] as NavigationItem[];
  const normalized = role.toLowerCase().replace(/_/g, '-') as AppRole;
  return NAV_ITEMS.filter(item => item.roles.includes(normalized));
}
