'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      router.replace(user ? '/dashboard' : '/login');
    }
  }, [user, loading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700">
      <div className="text-white text-center px-6">
        <img src="/images/logo.png" alt="Logo" className="w-28 h-28 mx-auto mb-6 rounded-full object-cover animate-bounce" />
        <h1 className="text-3xl font-bold mb-2">ശിലോഹ <span className="text-xl font-semibold">| Shiloha</span></h1>
        <p className="text-purple-200 text-lg">Loading your adventure...</p>
        <div className="mt-8 flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 bg-white rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
        <p className="text-purple-300/70 text-xs mt-8">
          ✝️ Cherupusha Mission League · Manathavady
        </p>
      </div>
    </div>
  );
}
