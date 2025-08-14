"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-dark">User Profile</h1>
          <p className="text-text-light mt-2">Manage your profile information and preferences</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-text-dark mb-4">Profile Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-dark">Name</label>
              <p className="text-text-light">{user.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-dark">Email</label>
              <p className="text-text-light">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-dark">Role</label>
              <p className="text-text-light capitalize">{(user.role || '').replace(/_/g, '-').replace('-', ' ')}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
