"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export default function Navigation() {
  const [user, setUser] = useState<{ name: string; role: string; email: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <nav className="bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-sm sticky top-0 z-50">
      <div className="px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Left: Brand */}
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-[#004E9E] to-[#007BFF] rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 12l2-2 7-7 7 7-2 2V20a1 1 0 01-1 1h-3v-5a1 1 0 00-1-1h-2a1 1 0 00-1 1v5H6a1 1 0 01-1-1v-8z"/>
              </svg>
            </div>
            <div>
              <div className="text-base font-bold text-gray-900">CareCloud</div>
              <div className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">MBO SYSTEM</div>
            </div>
          </Link>

          {/* Right: User and Sign out */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user && (
              <>
                <Link href="/profile" className="flex items-center gap-2 sm:gap-3 group">
                  <div className="relative">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-[#004E9E] to-[#007BFF] rounded-xl flex items-center justify-center shadow-md ring-1 ring-black/5">
                      <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                  </div>
                  <div className="hidden sm:block leading-tight">
                    <div className="text-sm font-semibold text-gray-900 group-hover:text-[#004E9E]">{user.name}</div>
                    <div className="text-xs text-gray-600 capitalize flex items-center">
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      {user.role.replace('-', ' ')}
                    </div>
                  </div>
                </Link>
                <button onClick={handleLogout} className="h-9 sm:h-10 px-3 text-sm rounded-lg bg-[#004E9E] text-white hover:bg-[#003D7C] transition-colors flex items-center gap-2">
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
