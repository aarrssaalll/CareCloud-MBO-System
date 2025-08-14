"use client";
import { usePathname } from 'next/navigation';
import AppShell from '@/components/AppShell';

export default function ClientAppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = pathname === '/' || pathname?.startsWith('/login');
  if (isPublic) return <>{children}</>;
  return <AppShell>{children}</AppShell>;
}
