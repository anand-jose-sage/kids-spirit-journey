'use client';

import { useState, useEffect, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { completeDay, saveDayEntry, getDayEntry } from '@/lib/database';
import activities from '@/data/activities.json';
import mlActivities from '@/data/activities.ml.json';
import { useLang } from '@/contexts/LanguageContext';
import { ChevronLeft, CheckCircle2, Circle, ExternalLink, BookOpen, Pen } from 'lucide-react';
import { clsx } from 'clsx';
import BibleAudioPlayer from '@/components/BibleAudioPlayer';
import { getTodayCalendarDay } from '@/lib/schedule';

type Params = Promise<{ day: string }>;

function audioName(day: number) {
  if (day === -1) return 'teaser';
  if (day === 0) return 'intro';
  return String(day);
}

export default function ActivityPage({ params }: { params: Params }) {
  const { day: dayParam } = use(params);
  const dayNum = parseInt(dayParam, 10);
  const { user, profile, loading, refreshProfile } = useAuth();
  const router = useRouter();

  const [checkedTasks, setCheckedTasks] = useState<Set<string>>(new Set());
  const [reflection, setReflection] = useState('');
  const [reflectionLocked, setReflectionLocked] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [entryLoading, setEntryLoading] = useState(true);
  const [savedIndicator, setSavedIndicator] = useState(false);
  const [showEasterToast, setShowEasterToast] = useState(false);
  const easterToastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { lang, setLang } = useLang();
  const reflectionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Malayalam translation helpers — falls back to English if ML string is empty
  const ml = mlActivities[String(dayNum) as keyof typeof mlActivities];
  const t = (en: string, mlStr: string | undefined) => (lang === 'ml' && mlStr) ? mlStr : en;
  const tTask = (index: number, enLabel: string) => {
    const mlLabel = ml?.tasks?.[index];
    return (lang === 'ml' && mlLabel) ? mlLabel : enLabel;
  };

  const activity = activities.find((a) => a.day === dayNum);
  const alreadyDone = profile?.completedDays?.includes(dayNum) ?? false;
  const isPastDay = dayNum < getTodayCalendarDay() && !alreadyDone;
  const isReadOnly = alreadyDone || isPastDay;

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (alreadyDone) setCompleted(true);
  }, [alreadyDone]);

  // Load previously saved entry (tasks + reflection)
  useEffect(() => {
    if (!user) return;
    setEntryLoading(true);
    getDayEntry(user.id, dayNum).then((entry) => {
      if (entry) {
        setCheckedTasks(new Set(Object.keys(entry.tasksDone).filter((k) => entry.tasksDone[k])));
        setReflection(entry.reflection);
        if (entry.reflection?.trim()) setReflectionLocked(true);
      }
    }).finally(() => setEntryLoading(false));
  }, [user, dayNum]);

  useEffect(() => {
    if (showCelebration) {
      // Dynamic import for confetti to avoid SSR issues
      import('canvas-confetti').then((confetti) => {
        confetti.default({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#7c3aed', '#f59e0b', '#10b981', '#3b82f6', '#ec4899'],
        });
        setTimeout(() => {
          confetti.default({
            particleCount: 60,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.7 },
          });
          confetti.default({
            particleCount: 60,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.7 },
          });
        }, 300);
      });
    }
  }, [showCelebration]);

  if (loading || entryLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="text-5xl mb-4">🔍</div>
        <h2 className="text-xl font-bold text-gray-700">Activity not found</h2>
        <Link href="/dashboard" className="mt-4 text-purple-600 font-semibold">Go back home</Link>
      </div>
    );
  }

  async function autoSave(tasks: Set<string>, reflectionText: string) {
    if (!user || isReadOnly || !activity) return;
    try {
      const tasksDone = Object.fromEntries(activity.tasks.map((t) => [t.id, tasks.has(t.id)]));
      await saveDayEntry(user.id, dayNum, { tasksDone, reflection: reflectionText });
      setSavedIndicator(true);
      setTimeout(() => setSavedIndicator(false), 2000);
    } catch {
      // silent — don't crash on save failure
    }
  }

  function toggleTask(id: string) {
    if (isReadOnly) return;
    const next = new Set(checkedTasks);
    const isChecking = !next.has(id);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setCheckedTasks(next);
    autoSave(next, reflection);
    if (isChecking) {
      setShowEasterToast(true);
      if (easterToastTimer.current) clearTimeout(easterToastTimer.current);
      easterToastTimer.current = setTimeout(() => setShowEasterToast(false), 3000);
    }
  }

  function handleReflectionChange(value: string) {
    setReflection(value);
    if (reflectionTimer.current) clearTimeout(reflectionTimer.current);
    reflectionTimer.current = setTimeout(() => autoSave(checkedTasks, value), 1000);
  }

  const canComplete = checkedTasks.size > 0 || reflection.trim().length > 0;

  async function handleComplete() {
    if (!user || completing || !activity || dayNum < 1) return;
    if (reflectionTimer.current) {
      clearTimeout(reflectionTimer.current);
      reflectionTimer.current = null;
    }
    setCompleting(true);
    try {
      const tasksDone = Object.fromEntries(activity.tasks.map((t) => [t.id, checkedTasks.has(t.id)]));
      await saveDayEntry(user.id, dayNum, { tasksDone, reflection });
      await completeDay(user.id, dayNum);
      await refreshProfile();
      setCompleted(true);
      setShowCelebration(true);
    } catch {
      // silent fail — show error state if needed
    } finally {
      setCompleting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-700 px-5 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/dashboard" className="bg-white/20 text-white p-2 rounded-xl hover:bg-white/30 transition-colors">
            <ChevronLeft size={22} />
          </Link>
          <div className="flex-1">
            <p className="text-purple-200 text-xs font-semibold uppercase tracking-wider">Day {activity.day}</p>
            <h1 className="text-white text-xl font-bold leading-tight">{t(activity.title, ml?.title)}</h1>
          </div>

          {/* Language toggle */}
          <div className="flex items-center bg-white/20 rounded-full p-0.5 gap-0.5 flex-shrink-0">
            <button
              onClick={() => setLang('en')}
              className={clsx(
                'text-xs font-bold px-2.5 py-1 rounded-full transition-all',
                lang === 'en' ? 'bg-white text-purple-700' : 'text-white/80 hover:text-white'
              )}
            >
              EN
            </button>
            <button
              onClick={() => setLang('ml')}
              className={clsx(
                'text-xs font-bold px-2.5 py-1 rounded-full transition-all',
                lang === 'ml' ? 'bg-white text-purple-700' : 'text-white/80 hover:text-white'
              )}
            >
              മല
            </button>
          </div>

          {completed && (
            <div className="bg-green-400 text-white text-xs font-bold px-3 py-1 rounded-full flex-shrink-0">
              ✓ Done!
            </div>
          )}
        </div>

        {/* Theme badge */}
        <div className="flex gap-2">
          <span className="bg-white/20 text-purple-100 text-xs font-semibold px-3 py-1 rounded-full">
            🏷️ {t(activity.theme, ml?.theme)}
          </span>
        </div>
      </div>

      <div className="px-5 py-5 space-y-4">
        {/* Celebration banner */}
        {showCelebration && (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-3xl p-5 text-center">
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="text-white text-xl font-bold">Amazing job!</h3>
            <p className="text-yellow-100 text-sm mt-1">Day {dayNum} complete! Keep going! 🌟</p>
            <Link
              href="/dashboard"
              className="mt-3 inline-block bg-white text-orange-500 font-bold text-sm px-5 py-2 rounded-xl"
            >
              Back to Journey →
            </Link>
          </div>
        )}

        {/* Bible verse */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-purple-50">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={18} className="text-purple-500" />
            <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wide">
              {lang === 'ml' ? 'ഇന്നത്തെ വചന വായന' : "Today's Reading"}
            </h2>
          </div>
          <p className="text-gray-700 text-base leading-relaxed italic font-medium">
            &ldquo;{t(activity.verseText, ml?.verseText)}&rdquo;
          </p>
          <p className="text-purple-500 text-sm font-bold mt-2">— {activity.verse}</p>
        </div>

        {/* Bible Reflection Audio */}
        <BibleAudioPlayer
          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/audio/day-${audioName(dayNum)}.mp3`}
          day={dayNum}
          label={lang === 'ml' ? 'ബൈബിൾ ധ്യാനം' : 'Bible Reflection'}
        />

        {/* Description */}
        <div className="bg-purple-50 rounded-3xl p-5 border border-purple-100">
          <p className="text-gray-700 text-sm leading-relaxed">{t(activity.description, ml?.description)}</p>
        </div>

        {/* Video */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-purple-50">
          <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-3">
            🎬 {lang === 'ml' ? 'വീഡിയോ കാണുക' : 'Watch Video'}
          </h2>
          <a
            href={/^https:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(activity.videoUrl)
              ? activity.videoUrl.replace('/embed/', '/watch?v=')
              : '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl p-4 active:bg-red-100 transition-colors"
          >
            <div className="bg-red-500 text-white w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-lg">▶</span>
            </div>
            <div className="flex-1">
              <p className="text-red-600 font-semibold text-sm">{t(activity.title, ml?.title)}</p>
              <p className="text-red-400 text-xs">{lang === 'ml' ? 'YouTube-ൽ തുറക്കുക' : 'Open in YouTube'}</p>
            </div>
            <ExternalLink size={16} className="text-red-400 flex-shrink-0" />
          </a>
        </div>

        {/* Tasks */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-purple-50">
          <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-4">
            ✅ {lang === 'ml' ? 'ഇന്നത്തെ പ്രവൃത്തികൾ' : "Today's Tasks"}
          </h2>
          <div className="space-y-3">
            {activity.tasks.map((task, index) => {
              const checked = checkedTasks.has(task.id) || alreadyDone;
              return (
                <button
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  disabled={isReadOnly}
                  className={clsx(
                    'w-full flex items-start gap-3 p-3 rounded-2xl text-left transition-all',
                    checked ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-100 active:bg-gray-100',
                    isReadOnly && 'cursor-default opacity-60'
                  )}
                >
                  {checked ? (
                    <CheckCircle2 size={22} className="text-green-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Circle size={22} className="text-gray-300 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <span className="text-lg mr-2">{task.emoji}</span>
                    <span className={clsx('text-sm font-medium', checked ? 'text-green-700 line-through' : 'text-gray-700')}>
                      {tTask(index, task.label)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-purple-50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Pen size={16} className="text-purple-500" />
              <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wide">
                {lang === 'ml' ? 'ചോദ്യം' : 'Question'}
              </h2>
            </div>
            {savedIndicator && (
              <span className="text-xs text-green-500 font-semibold">✓ Saved</span>
            )}
          </div>
          <p className="text-gray-600 text-sm italic mb-3">&ldquo;{t(activity.question, ml?.question)}&rdquo;</p>
          <textarea
            value={reflection}
            onChange={(e) => handleReflectionChange(e.target.value)}
            placeholder={lang === 'ml' ? 'നിങ്ങളുടെ ഉത്തരം ഇവിടെ എഴുതുക...' : 'Write your answer here...'}
            disabled={isReadOnly}
            readOnly={reflectionLocked}
            rows={4}
            maxLength={2000}
            className="w-full bg-purple-50 border border-purple-100 rounded-2xl px-4 py-3 text-gray-700 text-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-100 resize-none transition-all disabled:opacity-60 read-only:cursor-default read-only:focus:border-purple-100 read-only:focus:ring-0"
          />
        </div>

        {/* Past day notice */}
        {isPastDay && (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-center">
            <p className="text-gray-500 text-sm font-medium">
              {lang === 'ml' ? '⏳ ഈ ദിവസം കഴിഞ്ഞു. എഡിറ്റ് ചെയ്യാൻ കഴിയില്ല.' : '⏳ This day has passed and can no longer be edited.'}
            </p>
          </div>
        )}

        {/* Complete button */}
        {!completed && !isPastDay && (
          <button
            onClick={handleComplete}
            disabled={!canComplete || completing}
            className={clsx(
              'w-full py-4 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2',
              canComplete
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-200 active:scale-95'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            )}
          >
            {completing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {lang === 'ml' ? 'സേവ് ചെയ്യുന്നു...' : 'Saving...'}
              </>
            ) : canComplete ? (
              lang === 'ml' ? '🎉 ഞാൻ ചെയ്തു! ദിവസം പൂർത്തിയാക്കൂ!' : '🎉 I Did It! Complete Day!'
            ) : (
              lang === 'ml'
                ? `ആദ്യം ${activity.tasks.length} പ്രവൃത്തികളും പൂർത്തിയാക്കൂ`
                : `Complete all ${activity.tasks.length} tasks first`
            )}
          </button>
        )}

        {completed && !showCelebration && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
            <CheckCircle2 size={28} className="text-green-500 mx-auto mb-2" />
            <p className="text-green-700 font-bold">
              {lang === 'ml' ? `ദിവസം ${dayNum} പൂർത്തിയായി! 🌟` : `Day ${dayNum} completed! 🌟`}
            </p>
            <Link href="/dashboard" className="mt-2 inline-block text-purple-600 font-semibold text-sm">
              {lang === 'ml' ? 'യാത്ര തുടരൂ →' : 'Continue your journey →'}
            </Link>
          </div>
        )}
      </div>

      {/* Easter Toast */}
      <div className={clsx(
        'fixed bottom-24 left-1/2 -translate-x-1/2 z-50 transition-all duration-500',
        showEasterToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      )}>
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-300 via-white to-slate-300 rounded-full px-5 py-2.5 shadow-xl flex items-center gap-2.5 border border-slate-200">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent animate-[shimmer_1.8s_ease-in-out_infinite]" />
          <span className="text-base">🐣</span>
          <span className="relative bg-gradient-to-r from-slate-500 via-slate-800 to-slate-500 bg-clip-text text-transparent font-black text-xs tracking-widest uppercase">
            {lang === 'ml' ? 'ഈസ്റ്റർ ആശംസകൾ · അവൻ ഉയിർത്തെഴുന്നേറ്റു' : 'Happy Easter · He is Risen'}
          </span>
          <span className="text-base">🌸</span>
        </div>
      </div>
    </div>
  );
}
