'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import BottomNav from '@/components/BottomNav';
import activities from '@/data/activities.json';
import mlActivities from '@/data/activities.ml.json';
import { useLang } from '@/contexts/LanguageContext';
import { CheckCircle2, Lock, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { isDayUnlocked, getTodayCalendarDay } from '@/lib/schedule';

export default function ActivitiesPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const { lang } = useLang();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  if (loading || !profile) return null;

  const completedDays = profile.completedDays || [];
  const todayDay = getTodayCalendarDay();

  function t(enStr: string, dayNum: number, field: 'title' | 'theme') {
    if (lang !== 'ml') return enStr;
    const ml = mlActivities[String(dayNum) as keyof typeof mlActivities];
    return ml?.[field] || enStr;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 pb-nav">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-700 px-5 pt-12 pb-6 relative overflow-hidden">
        {/* Easter Silver Ribbon */}
        <div className="absolute top-0 left-0 right-0 overflow-hidden">
          <div className="relative bg-gradient-to-r from-slate-300 via-white to-slate-300 py-1.5 text-center shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent -translate-x-full animate-[shimmer_2.5s_ease-in-out_infinite]" style={{backgroundSize:'200% 100%'}} />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-400 to-transparent" />
            <p className="relative text-slate-700 font-extrabold tracking-widest text-xs uppercase drop-shadow-sm flex items-center justify-center gap-2">
              <span>🐣</span>
              <span className="bg-gradient-to-r from-slate-500 via-slate-800 to-slate-500 bg-clip-text text-transparent font-black">
                {lang === 'ml' ? '✦ ഈസ്റ്റർ ആശംസകൾ · അവൻ ഉയിർത്തെഴുന്നേറ്റു ✦' : '✦ Happy Easter · He is Risen ✦'}
              </span>
              <span>🌸</span>
            </p>
          </div>
        </div>
        <h1 className="text-white text-2xl font-bold">
          {lang === 'ml' ? 'എല്ലാ പ്രവൃത്തികളും 📖' : 'All Activities 📖'}
        </h1>
        <p className="text-purple-200 text-sm mt-1">
          {lang === 'ml'
            ? `${completedDays.length} / 30 ദിവസം പൂർത്തിയായി`
            : `${completedDays.length} of 30 days completed`}
        </p>
      </div>

      <div className="px-5 py-4 space-y-2.5">
        {activities.map((act) => {
          const done = completedDays.includes(act.day);
          const isToday = act.day === todayDay && !done;
          const locked = !done && !isDayUnlocked(act.day);

          return (
            <Link
              key={act.day}
              href={locked ? '#' : `/dashboard/activity/${act.day}`}
              className={clsx(
                'flex items-center gap-4 rounded-2xl p-4 transition-all',
                done && 'bg-green-50 border border-green-100',
                isToday && 'bg-white border-2 border-purple-400 shadow-md',
                locked && 'bg-white border border-gray-100 opacity-60',
                !done && !isToday && !locked && 'bg-white border border-purple-100'
              )}
            >
              {/* Day number / status icon */}
              <div className={clsx(
                'w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0',
                done ? 'bg-green-100' : isToday ? 'bg-purple-500' : 'bg-gray-100'
              )}>
                {done ? (
                  <CheckCircle2 size={22} className="text-green-500" />
                ) : locked ? (
                  <Lock size={18} className="text-gray-400" />
                ) : (
                  <span className={clsx('font-bold text-sm', isToday ? 'text-white' : 'text-gray-600')}>
                    {act.day}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={clsx(
                    'font-semibold text-sm truncate',
                    done ? 'text-green-700' : isToday ? 'text-purple-700' : locked ? 'text-gray-400' : 'text-gray-700'
                  )}>
                    {t(act.title, act.day, 'title')}
                  </p>
                  {isToday && (
                    <span className="bg-purple-100 text-purple-600 text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                      {lang === 'ml' ? 'ഇന്ന്!' : 'Today!'}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-400">{t(act.theme, act.day, 'theme')}</span>
                  <span className="text-gray-300">·</span>
                  <span className="text-xs text-gray-400">{act.verse}</span>
                </div>
                <div className="flex gap-1 mt-1.5">
                  {act.tasks.map((t, i) => (
                    <span key={i} className="text-base">{t.emoji}</span>
                  ))}
                </div>
              </div>

              {!locked && (
                <ChevronRight size={18} className={clsx('flex-shrink-0', done ? 'text-green-400' : 'text-purple-400')} />
              )}
            </Link>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
}
