"use client";
import Navigation from '@/components/Navigation';
import EnhancedSidebar from '@/components/EnhancedSidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-white to-[#F5F7FA]">
      <Navigation />
      <div className="flex">
        <EnhancedSidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
