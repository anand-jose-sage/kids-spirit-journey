'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { getAchievements, getSavedDays, getSavedEntries, getMassStreak } from '@/lib/database';
import BottomNav from '@/components/BottomNav';
import activities from '@/data/activities.json';
import mlActivities from '@/data/activities.ml.json';
import { useLang } from '@/contexts/LanguageContext';
import { Lock, CheckCircle2, ChevronRight, Flame, Star, LogOut, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { clsx } from 'clsx';
import { isDayUnlocked, getTodayCalendarDay } from '@/lib/schedule';

const TOTAL_DAYS = 30;

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}


export default function DashboardPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const { lang } = useLang();
  const [savedDays, setSavedDays] = useState<number[]>([]);
  const [massStreak, setMassStreak] = useState(0);
  const todayDayRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!user) return;
    getSavedDays(user.id).then(setSavedDays);
    getSavedEntries(user.id).then((entries) => setMassStreak(getMassStreak(entries)));
  }, [user]);

  useEffect(() => {
    if (!profile) return;
    const frame = requestAnimationFrame(() => {
      todayDayRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    });
    return () => cancelAnimationFrame(frame);
  }, [profile]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace('/login');
  }

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  // Show spinner while auth resolves OR while Firestore profile is being
  // written for the first time (new registration race condition).
  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="text-center">
          <img src="/images/logo.png" alt="Logo" className="w-24 h-24 mx-auto mb-4 animate-bounce rounded-full object-cover" />
          <p className="text-purple-600 font-semibold">Loading your journey...</p>
        </div>
      </div>
    );
  }

  const completedDays = profile.completedDays || [];
  const todayDay = getTodayCalendarDay();
  const todayActivity = activities.find((a) => a.day === todayDay);
  const progressPct = Math.round((completedDays.length / TOTAL_DAYS) * 100);
  const achievements = getAchievements(completedDays, massStreak).filter((a) => a.unlocked);
  const streak = profile.currentStreak || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 pb-nav">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 px-5 pt-12 pb-8 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />

        <div className="relative">
          {/* Logout button — top right */}
          <button
            onClick={handleLogout}
            title="Sign out"
            className="absolute top-0 right-0 flex items-center gap-1.5 bg-white/15 hover:bg-white/30 active:bg-white/40 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
          >
            <LogOut size={13} />
            Sign out
          </button>

          <p className="text-purple-200 text-sm font-medium">{getGreeting()} 👋</p>
          <h1 className="text-white text-2xl font-bold mt-0.5">
            {profile.name?.split(' ')[0] || 'Friend'}!
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
              🏠 {profile.houseName}
            </span>
            <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
              📚 {profile.standard}
            </span>
          </div>
        </div>

        {/* Progress card */}
        <div className="relative mt-5 bg-white/15 backdrop-blur-sm rounded-3xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-purple-100 text-xs font-medium">{lang === 'ml' ? 'നിന്റെ പുരോഗതി' : 'Your Progress'}</p>
              <p className="text-white text-2xl font-bold">
                {completedDays.length}
                <span className="text-purple-200 text-base font-medium"> / {TOTAL_DAYS} {lang === 'ml' ? 'ദിവസം' : 'days'}</span>
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-orange-400 text-white px-3 py-1.5 rounded-full">
              <Flame size={16} />
              <span className="font-bold text-sm">{streak}</span>
            </div>
          </div>
          {/* Progress bar */}
          <div className="bg-white/20 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-yellow-400 to-orange-400 h-full rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-purple-100 text-xs mt-2 text-right">{progressPct}% {lang === 'ml' ? 'പൂർത്തിയായി ✨' : 'complete ✨'}</p>
        </div>
      </div>

      <div className="px-5 py-5 space-y-5">
        {/* Today's Activity */}
        {todayActivity && completedDays.length < TOTAL_DAYS && (
          <div>
            <h2 className="text-base font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span className="text-lg">🎯</span> {lang === 'ml' ? 'ഇന്നത്തെ ദൗത്യം' : "Today's Mission"}
            </h2>
            <Link href={`/dashboard/activity/${todayActivity.day}`}>
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl p-5 shadow-lg shadow-purple-200 active:scale-98 transition-transform">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-purple-200 text-xs font-semibold uppercase tracking-wider">
                      {lang === 'ml' ? `ദിവസം ${todayActivity.day}` : `Day ${todayActivity.day}`}
                    </p>
                    <h3 className="text-white text-xl font-bold mt-1 leading-tight">
                      {lang === 'ml'
                        ? (mlActivities[String(todayActivity.day) as keyof typeof mlActivities]?.title || todayActivity.title)
                        : todayActivity.title}
                    </h3>
                    <p className="text-purple-200 text-sm mt-1">
                      {lang === 'ml'
                        ? (mlActivities[String(todayActivity.day) as keyof typeof mlActivities]?.theme || todayActivity.theme)
                        : todayActivity.theme}
                    </p>
                    <div className="mt-3 flex items-center gap-1 text-yellow-300 text-sm font-medium">
                      <Star size={14} fill="currentColor" />
                      <span className="text-purple-100 text-xs">{todayActivity.verse}</span>
                    </div>
                  </div>
                  <div className="ml-3 bg-white/20 rounded-2xl p-3 flex-shrink-0">
                    <ChevronRight size={24} className="text-white" />
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  {todayActivity.tasks.map((t, i) => (
                    <span key={`${t.id}-${i}`} className="bg-white/20 text-white text-lg rounded-xl px-2 py-1">
                      {t.emoji}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          </div>
        )}

        {completedDays.length === TOTAL_DAYS && (
          <div className="bg-gradient-to-br from-yellow-400 to-orange-400 rounded-3xl p-5 text-center shadow-lg">
            <div className="text-5xl mb-2">🏆</div>
            <h3 className="text-white text-xl font-bold">{lang === 'ml' ? 'യാത്ര പൂർത്തിയായി!' : 'Journey Complete!'}</h3>
            <p className="text-yellow-100 text-sm mt-1">{lang === 'ml' ? 'നിങ്ങൾ 30-ദിവസ ചാമ്പ്യൻ ആണ്!' : 'You are a 30-Day Champion!'}</p>
          </div>
        )}

        {/* Day Timeline Preview */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-700 flex items-center gap-2">
              <span className="text-lg">📅</span> {lang === 'ml' ? 'ദിവസങ്ങൾ' : 'Days'}
            </h2>
            <Link href="/dashboard/activities" className="text-purple-600 text-sm font-semibold">
              {lang === 'ml' ? 'എല്ലാം കാണൂ →' : 'See all →'}
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
            {activities.map((act) => {
              const done = completedDays.includes(act.day);
              const inProgress = !done && savedDays.includes(act.day);
              const isToday = act.day === todayDay && !done;
              const locked = !done && !isDayUnlocked(act.day);

              return (
                <Link
                  key={act.day}
                  ref={isToday ? todayDayRef : undefined}
                  href={locked ? '#' : `/dashboard/activity/${act.day}`}
                  className={clsx(
                    'flex-shrink-0 w-16 rounded-2xl p-2 text-center transition-all',
                    done && 'bg-green-100',
                    inProgress && 'bg-orange-100 ring-2 ring-orange-300',
                    isToday && !inProgress && 'bg-purple-100 ring-2 ring-purple-400',
                    locked && 'bg-gray-100 opacity-60'
                  )}
                >
                  {done ? (
                    <CheckCircle2 size={22} className="mx-auto text-green-500" />
                  ) : inProgress ? (
                    <Clock size={20} className="mx-auto text-orange-400" />
                  ) : locked ? (
                    <Lock size={20} className="mx-auto text-gray-400" />
                  ) : (
                    <div className="w-6 h-6 bg-purple-500 rounded-full mx-auto flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{act.day}</span>
                    </div>
                  )}
                  <p className={clsx(
                    'text-xs mt-1 font-medium truncate',
                    done ? 'text-green-600' : inProgress ? 'text-orange-500' : isToday ? 'text-purple-600' : 'text-gray-400'
                  )}>
                    {lang === 'ml' ? `ദി. ${act.day}` : `Day ${act.day}`}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Achievements */}
        {achievements.length > 0 && (
          <div>
            <h2 className="text-base font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span className="text-lg">🏅</span> {lang === 'ml' ? 'നേട്ടങ്ങൾ' : 'Achievements'}
            </h2>
            <div className="grid grid-cols-4 gap-3">
              {achievements.map((a) => (
                <div key={a.id} className="bg-white rounded-2xl p-3 text-center shadow-sm border border-purple-50">
                  <div className="text-2xl mb-1">{a.emoji}</div>
                  <p className="text-xs font-semibold text-gray-600 leading-tight">{a.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
