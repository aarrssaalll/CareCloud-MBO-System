"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export default function Navigation() {
  const [user, setUser] = useState<{ name: string; role: string; email: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('mbo_user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser({
        name: parsedUser.name || `${parsedUser.firstName || ''} ${parsedUser.lastName || ''}`.trim(),
        email: parsedUser.email,
        role: parsedUser.role?.toLowerCase().replace('_', '-') || 'employee'
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('mbo_user');
    router.push('/login');
  };

  return (
    <nav className="bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-sm sticky top-0 z-50">
      <div className="px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Left: Brand */}
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <img src="/carecloud-logo.png" alt="CareCloud Logo" className="h-10 w-auto mr-5" />
            
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
