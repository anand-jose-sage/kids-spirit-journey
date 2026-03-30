'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { getAchievements, getSavedEntries, getMassStreak } from '@/lib/database';
import BottomNav from '@/components/BottomNav';
import { LogOut, Star, Flame, Trophy, Calendar, School, Church, Home } from 'lucide-react';

const TOTAL_DAYS = 30;

export default function ProfilePage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [massStreak, setMassStreak] = useState(0);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) getSavedEntries(user.id).then((entries) => setMassStreak(getMassStreak(entries)));
  }, [user]);

  if (loading || !profile) return null;

  const completedDays = profile.completedDays || [];
  const progressPct = Math.round((completedDays.length / TOTAL_DAYS) * 100);
  const achievements = getAchievements(completedDays, massStreak);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace('/login');
  }

  // Avatar color based on name
  const colors = [
    'from-purple-500 to-indigo-500',
    'from-pink-500 to-rose-500',
    'from-orange-500 to-amber-500',
    'from-green-500 to-teal-500',
    'from-blue-500 to-cyan-500',
  ];
  const colorIdx = (profile.name?.charCodeAt(0) ?? 0) % colors.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 pb-nav">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-700 px-5 pt-12 pb-10 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-28 h-28 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />

        {/* Avatar */}
        <div className={`relative w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${colors[colorIdx]} flex items-center justify-center shadow-xl mb-3`}>
          <span className="text-3xl font-bold text-white">
            {profile.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <h1 className="text-white text-xl font-bold">{profile.name}</h1>
        <p className="text-purple-200 text-sm">📱 {profile.phone}</p>

        {/* Stats row */}
        <div className="flex justify-center gap-4 mt-4">
          <div className="bg-white/20 rounded-2xl px-4 py-2 text-center">
            <p className="text-white text-lg font-bold">{completedDays.length}</p>
            <p className="text-purple-200 text-xs">Days Done</p>
          </div>
          <div className="bg-white/20 rounded-2xl px-4 py-2 text-center">
            <p className="text-white text-lg font-bold flex items-center gap-1 justify-center">
              <Flame size={16} className="text-orange-300" />{profile.currentStreak || 0}
            </p>
            <p className="text-purple-200 text-xs">Streak</p>
          </div>
          <div className="bg-white/20 rounded-2xl px-4 py-2 text-center">
            <p className="text-white text-lg font-bold">{unlockedCount}</p>
            <p className="text-purple-200 text-xs">Badges</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-5 space-y-4 -mt-4">
        {/* Progress card */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-purple-50">
          <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-4 flex items-center gap-2">
            <Star size={16} className="text-purple-500" /> Progress
          </h2>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">{completedDays.length} / {TOTAL_DAYS} days</span>
            <span className="text-purple-600 font-bold text-sm">{progressPct}%</span>
          </div>
          <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          {completedDays.length === TOTAL_DAYS && (
            <p className="text-center text-green-600 font-bold text-sm mt-3">🏆 Journey Complete!</p>
          )}
        </div>

        {/* Profile info */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-purple-50">
          <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-4 flex items-center gap-2">
            <Calendar size={16} className="text-purple-500" /> My Details
          </h2>
          <div className="space-y-3">
            {[
              { icon: Home, label: 'House', value: profile.houseName },
              { icon: Church, label: 'Parish', value: profile.parish },
              { icon: School, label: 'Meghala', value: profile.standard },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center">
                  <Icon size={16} className="text-purple-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-gray-700 font-semibold text-sm">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-purple-50">
          <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-4 flex items-center gap-2">
            <Trophy size={16} className="text-purple-500" /> Achievements
          </h2>
          <div className="grid grid-cols-4 gap-3">
            {achievements.map((a) => (
              <div
                key={a.id}
                className={`rounded-2xl p-3 text-center transition-all ${
                  a.unlocked
                    ? 'bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100'
                    : 'bg-gray-50 opacity-40 grayscale'
                }`}
              >
                <div className="text-2xl mb-1">{a.emoji}</div>
                <p className="text-xs font-semibold text-gray-600 leading-tight">{a.title}</p>
                {!a.unlocked && (
                  <p className="text-xs text-gray-400 mt-0.5">{a.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Credits */}
        <div className="bg-gradient-to-br from-violet-100 via-purple-50 to-indigo-100 border border-purple-200 rounded-2xl px-5 py-4 text-center shadow-md">
          <p className="text-[10px] font-semibold text-purple-400 uppercase tracking-[0.2em] mb-1">
            ✦ Conceptualized by ✦
          </p>
          <p className="text-base font-extrabold text-purple-800 leading-tight tracking-tight">
            Cherupushpa Mission League
          </p>
          <div className="flex items-center justify-center gap-2 my-1.5">
            <div className="h-px w-8 bg-purple-300 rounded-full" />
            <span className="text-purple-300 text-xs">✦</span>
            <div className="h-px w-8 bg-purple-300 rounded-full" />
          </div>
          <p className="text-sm font-bold text-indigo-700 leading-tight">
            Manathvady Diocese
          </p>
          <p className="text-xs text-purple-400 leading-none my-0.5">&amp;</p>
          <p className="text-sm font-bold text-indigo-700 leading-tight">
            Kalpatta Meghala
          </p>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-white border border-red-100 text-red-500 font-semibold py-3.5 rounded-2xl hover:bg-red-50 active:bg-red-100 transition-colors"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
