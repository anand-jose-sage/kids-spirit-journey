'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { getSavedDays } from '@/lib/database';
import BottomNav from '@/components/BottomNav';
import activities from '@/data/activities.json';
import { CheckCircle2, Lock, Circle, Clock } from 'lucide-react';
import { clsx } from 'clsx';

function getTodayDay(completedDays: number[]): number {
  for (let i = 1; i <= 30; i++) {
    if (!completedDays.includes(i)) return i;
  }
  return 30;
}

export default function TimelinePage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [savedDays, setSavedDays] = useState<number[]>([]);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    getSavedDays(user.id).then(setSavedDays);
  }, [user]);

  if (loading || !profile) return null;

  const completedDays = profile.completedDays || [];
  const todayDay = getTodayDay(completedDays);
  const progressPct = Math.round((completedDays.length / 30) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 pb-nav">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-700 px-5 pt-12 pb-6">
        <h1 className="text-white text-2xl font-bold">My Journey 🗺️</h1>
        <p className="text-purple-200 text-sm mt-1">{completedDays.length} days completed · {progressPct}%</p>

        {/* Mini progress bar */}
        <div className="mt-3 bg-white/20 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-yellow-400 to-orange-400 h-full rounded-full"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="px-5 py-5">
        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[22px] top-0 bottom-0 w-0.5 bg-gray-200" />

          <div className="space-y-1">
            {activities.map((act) => {
              const done = completedDays.includes(act.day);
              const inProgress = !done && savedDays.includes(act.day);
              const isToday = act.day === todayDay && !done;
              const locked = !done && !inProgress && act.day > todayDay;

              return (
                <Link
                  key={act.day}
                  href={locked ? '#' : `/dashboard/activity/${act.day}`}
                  className="flex items-start gap-4 group"
                >
                  {/* Timeline node */}
                  <div className="relative z-10 flex-shrink-0 mt-3">
                    {done ? (
                      <CheckCircle2 size={22} className="text-green-500 bg-white rounded-full" />
                    ) : inProgress ? (
                      <Clock size={22} className="text-orange-400 bg-white rounded-full" />
                    ) : isToday ? (
                      <div className="w-5.5 h-5.5 bg-purple-500 border-2 border-white rounded-full shadow-md shadow-purple-300 animate-pulse-slow">
                        <div className="w-full h-full rounded-full" />
                      </div>
                    ) : locked ? (
                      <Lock size={18} className="text-gray-300 bg-white p-0.5" />
                    ) : (
                      <Circle size={22} className="text-purple-300 bg-white rounded-full" />
                    )}
                  </div>

                  {/* Content */}
                  <div className={clsx(
                    'flex-1 mb-2 rounded-2xl px-4 py-3 transition-all',
                    done      ? 'bg-green-50 border border-green-100' :
                    inProgress ? 'bg-orange-50 border border-orange-200' :
                    isToday   ? 'bg-white border-2 border-purple-300 shadow-sm' :
                    locked    ? 'bg-gray-50 border border-gray-100 opacity-50' :
                                'bg-white border border-purple-50'
                  )}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Day {act.day}</p>
                        <p className={clsx(
                          'font-semibold text-sm mt-0.5',
                          done       ? 'text-green-700' :
                          inProgress ? 'text-orange-600' :
                          isToday    ? 'text-purple-700' :
                                       'text-gray-600'
                        )}>
                          {act.title}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {isToday && !inProgress && (
                          <span className="bg-purple-100 text-purple-600 text-xs font-bold px-2 py-0.5 rounded-full">
                            Today
                          </span>
                        )}
                        {done && (
                          <span className="bg-green-100 text-green-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                            ✓ Done
                          </span>
                        )}
                        {inProgress && (
                          <span className="bg-orange-100 text-orange-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                            ⏳ In Progress
                          </span>
                        )}
                        <span className="text-lg">{act.tasks[0]?.emoji}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {completedDays.length === 30 && (
          <div className="mt-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-3xl p-6 text-center">
            <div className="text-5xl mb-3">🏆</div>
            <h3 className="text-white text-xl font-bold">Journey Complete!</h3>
            <p className="text-yellow-100 text-sm mt-1">You completed all 30 days! You are a champion!</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
