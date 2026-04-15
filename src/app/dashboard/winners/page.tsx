'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import BottomNav from '@/components/BottomNav';
import { useLang } from '@/contexts/LanguageContext';
import { Trophy, Shield, ChevronRight } from 'lucide-react';

export default function WinnersHubPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { lang } = useLang();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 pb-nav">
      {/* Header */}
      <div className="bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 px-5 pt-12 pb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-56 h-56 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-orange-600/20 rounded-full translate-y-1/2 -translate-x-1/4" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-13 h-13 bg-white/25 rounded-2xl flex items-center justify-center p-2.5 shadow-lg">
              <Trophy size={28} className="text-white drop-shadow" />
            </div>
            <div>
              <h1 className="text-white text-2xl font-extrabold drop-shadow">
                {lang === 'ml' ? 'വിജയ ഗാഥ 🏆' : 'Hall of Winners 🏆'}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-6 space-y-4">
        {/* Link 1 — Shiloha Spiritual Journey Winners */}
        <Link href="/dashboard/winners/journey">
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl p-5 shadow-lg shadow-purple-200 active:scale-[0.98] transition-transform">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Trophy size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white text-lg font-bold leading-tight">
                    {lang === 'ml' ? 'ശിലോഹ ആത്മീയ യാത്ര വിജയികൾ' : 'Spiritual Journey Winners'}
                  </h3>
                  <p className="text-purple-200 text-xs mt-0.5">
                    {lang === 'ml' ? '30 ദിവസ ദൗത്യ വിജയികൾ' : '30-day mission winners'}
                  </p>
                </div>
              </div>
              <ChevronRight size={24} className="text-white/70 flex-shrink-0" />
            </div>
          </div>
        </Link>

        {/* Link 2 — Biblia Secret Scoreboard */}
        <Link href="/dashboard/winners/scoreboard">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-5 shadow-lg shadow-amber-200 active:scale-[0.98] transition-transform">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Shield size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white text-lg font-bold leading-tight">
                    {lang === 'ml' ? 'ബിബ്ലിയ സീക്രട്ട് സ്കോർബോർഡ്' : 'Biblia Secret Scoreboard'}
                  </h3>
                  <p className="text-amber-200 text-xs mt-0.5">
                    {lang === 'ml' ? '15 ദിവസ രഹസ്യ ദൗത്യ സ്കോർ' : 'Secret agent mission scores'}
                  </p>
                </div>
              </div>
              <ChevronRight size={24} className="text-white/70 flex-shrink-0" />
            </div>
          </div>
        </Link>
      </div>

      <BottomNav />
    </div>
  );
}
