"use client";
import { useEffect, useState } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { usePathname } from 'next/navigation';

interface Notification {
  id: number;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionRequired?: boolean;
}

export default function RightPanel() {
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Load from localStorage or seed defaults
    const saved = localStorage.getItem('notifications');
    if (saved) {
      setNotifications(JSON.parse(saved));
    } else {
      const seed: Notification[] = [
        { id: 1, type: 'info', title: 'AI Score Analysis', message: 'Q4 performance analyzed: 94.2%', timestamp: '2h ago', read: false },
        { id: 2, type: 'warning', title: 'Objective Due Soon', message: 'Process Optimization due in 3 days', timestamp: '1d ago', read: false },
        { id: 3, type: 'success', title: 'Bonus Calculated', message: 'Q3 bonus processed: $4,250', timestamp: '3d ago', read: true },
      ];
      setNotifications(seed);
      localStorage.setItem('notifications', JSON.stringify(seed));
    }
  }, []);

  const markRead = (id: number) => {
    setNotifications(prev => {
      const next = prev.map(n => (n.id === id ? { ...n, read: true } : n));
      localStorage.setItem('notifications', JSON.stringify(next));
      return next;
    });
  };

  // Page-specific right cards (kept simple; we can extend as needed)
  const pageExtras = () => {
    if (pathname?.startsWith('/objectives')) {
      return (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Objective Tips</h3>
          <p className="text-sm text-gray-600">Ensure objectives are measurable and time-bound. Keep remarks updated weekly.</p>
        </div>
      );
    }
    if (pathname?.startsWith('/performance')) {
      return (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Trend Filters</h3>
          <p className="text-sm text-gray-600">Switch time ranges to see monthly and quarterly movement.</p>
        </div>
      );
    }
    if (pathname?.startsWith('/team')) {
      return (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Team Actions</h3>
          <p className="text-sm text-gray-600">Invite, assign objectives, and review pending approvals.</p>
        </div>
      );
    }
    return null;
  };

  return (
    <aside className="w-[360px] bg-transparent hidden xl:block">
      <div className="h-full p-6 space-y-6 overflow-y-auto">
        {/* Notifications */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center"><BellIcon className="w-5 h-5 mr-2"/> Notifications</h3>
          <div className="space-y-3">
            {notifications.map(n => (
              <div key={n.id} className={`p-3 rounded-lg border flex items-start justify-between ${n.read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'}`}>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                  <p className="text-xs text-gray-600">{n.message}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{n.timestamp}</p>
                </div>
                {!n.read && (
                  <button onClick={() => markRead(n.id)} className="text-xs text-[#004E9E] hover:underline">Mark read</button>
                )}
              </div>
            ))}
          </div>
        </div>

        {pageExtras()}
      </div>
    </aside>
  );
}
