'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import BottomNav from '@/components/BottomNav';
import { useLang } from '@/contexts/LanguageContext';
import { ChevronRight, LogOut, BookOpen } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  getMarianProgress,
  getMarianStats,
  getMarianBadges,
  MarianProgress,
  MarianStats,
  getLevelForDay,
} from '@/lib/marian-path-db';
import marianData from '@/data/marian-path.json';


export default function DashboardPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const { lang } = useLang();

  const [marianProgress, setMarianProgress] = useState<MarianProgress[]>([]);
  const [marianStats, setMarianStats] = useState<MarianStats>({ totalScore: 0, streakDays: 0, rank: 1, completedCount: 0 });
  const currentDayRef = useRef<HTMLAnchorElement>(null);

  const loadProgress = useCallback(async () => {
    if (!user) return;
    const [prog, stats] = await Promise.all([
      getMarianProgress(user.id),
      getMarianStats(user.id),
    ]);
    setMarianProgress(prog);
    setMarianStats(stats);
  }, [user]);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  useEffect(() => {
    if (marianProgress.length > 0 || user) {
      requestAnimationFrame(() => {
        currentDayRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      });
    }
  }, [marianProgress, user]);

  function handleLogout() {
    supabase.auth.signOut();
    router.replace('/login');
  }

  if (loading || !profile) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{
          background: [
            'radial-gradient(ellipse 55% 44% at 8% 8%, oklch(0.82 0.12 295 / 0.85) 0%, transparent 70%)',
            'radial-gradient(ellipse 40% 35% at 92% 5%, oklch(0.86 0.09 195 / 0.75) 0%, transparent 65%)',
            'oklch(0.96 0.018 290)',
          ].join(','),
        }}
      >
        <div className="text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo.png" alt="Shiloha logo" width={96} height={96}
            fetchPriority="high"
            className="w-24 h-24 mx-auto mb-4 rounded-full object-cover"
            style={{ boxShadow: '0 8px 32px rgba(100,60,200,0.25), 0 0 0 3px rgba(255,255,255,0.7)' }}
          />
          <p className="font-cinzel font-semibold" style={{ color: 'oklch(0.42 0.22 280)' }}>
            Loading your journey...
          </p>
        </div>
      </div>
    );
  }

  const completedSet = new Set(marianProgress.filter((p) => p.completed).map((p) => p.day));
  const completedCount = completedSet.size;
  const progressPct = Math.round((completedCount / 30) * 100);

  const calendarDay = new Date().getDate();
  const bibleDay = Math.min(calendarDay, 30);
  const bibleData = marianData.days.find((d) => d.day === bibleDay) as typeof marianData.days[0] & {
    bible_book: string; bible_reference: string; bible_verse: string; bible_verse_ml: string;
  } | undefined;

  const badges = getMarianBadges(marianProgress, marianStats.streakDays);
  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className="min-h-screen pb-nav relative overflow-x-hidden">

      {/* ── Mary image hero header ── */}
      <div style={{ flexShrink: 0, position: 'relative', textAlign: 'center', overflow: 'hidden' }}>

        {/* Sign out — floating pill top-right */}
        <button
          onClick={handleLogout}
          className="sg-pill convex absolute z-20 flex items-center gap-1.5 transition-all active:scale-95"
          style={{
            top: 14, right: 14,
            padding: '6px 12px', fontSize: 12, fontWeight: 500,
            color: 'oklch(0.42 0.08 270)',
          }}
        >
          <LogOut size={12} />
          Sign out
        </button>

        {/* Mary image — full bleed, fade at bottom */}
        <div style={{ position: 'relative', width: '100%', height: 260, marginTop: -30 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/marian.png"
            alt="Our Lady"
            style={{
              width: '100%', height: '100%',
              objectFit: 'contain', objectPosition: 'center top',
              display: 'block',
            }}
          />
          {/* Bottom fade — matches page bg */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'linear-gradient(to bottom, rgba(237,233,250,0) 0%, rgba(237,233,250,0) 45%, rgba(237,233,250,0.65) 72%, rgba(237,233,250,1) 100%)',
          }} />
          {/* Top status bar fade */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 60, pointerEvents: 'none',
            background: 'linear-gradient(to bottom, rgba(237,233,250,0.85), transparent)',
          }} />
        </div>

        {/* Text overlay sitting over the image fade */}
        <div style={{ marginTop: -100, paddingBottom: 18, position: 'relative', zIndex: 5 }}>
          <h1
            className="font-display"
            style={{
              fontSize: 54, fontWeight: 700, letterSpacing: '0.18em',
              color: 'oklch(0.22 0.10 275)',
              textTransform: 'uppercase', lineHeight: 1,
              marginBottom: 6,
              textShadow: '0 2px 24px oklch(0.65 0.20 280 / 0.18)',
            }}
          >
            MARIAN
          </h1>
          <p
            className="font-display"
            style={{
              fontSize: 13, fontWeight: 500, letterSpacing: '0.08em',
              color: 'oklch(0.42 0.12 270)', marginBottom: 4,
              fontStyle: 'italic',
            }}
          >
            Through Mary To Jesus
          </p>
          <p
            className="font-cinzel"
            style={{
              fontSize: 10.5, fontWeight: 600, letterSpacing: '0.14em',
              color: 'oklch(0.52 0.10 270)', textTransform: 'uppercase',
            }}
          >
            Cherupushpa Mission League
          </p>
        </div>
      </div>

      <div className="px-4 pb-4 space-y-4" style={{ marginTop: -10 }}>

        {/* ── Marian Path hero card ── */}
        <Link href="/dashboard/marian-path">
          <div
            className="sg-noise relative overflow-hidden active:scale-[0.98] transition-transform"
            style={{
              borderRadius: 26, marginLeft: 4, marginRight: 4,
              background: 'rgba(255,255,255,0.22)',
              backdropFilter: 'blur(48px) saturate(2.4) brightness(1.05)',
              WebkitBackdropFilter: 'blur(48px) saturate(2.4) brightness(1.05)',
              boxShadow: [
                'inset 0 1.5px 0 rgba(255,255,255,0.98)',
                'inset 1px 0 0 rgba(255,255,255,0.7)',
                'inset -0.5px 0 0 rgba(255,255,255,0.3)',
                'inset 0 -1px 0 rgba(180,160,240,0.12)',
                '0 0 0 1px rgba(180,140,255,0.35)',
                '0 0 18px 2px oklch(0.62 0.22 280 / 0.28)',
                '0 0 40px 6px oklch(0.65 0.20 280 / 0.16)',
                '0 8px 24px rgba(100,60,200,0.12)',
              ].join(','),
            }}
          >
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: 'linear-gradient(135deg, oklch(0.72 0.12 280 / 0.10) 0%, oklch(0.75 0.10 200 / 0.08) 100%)',
            }} />

            <div style={{ position: 'relative', zIndex: 5, padding: '20px 20px 18px' }}>
              {/* Top row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 9, color: 'oklch(0.52 0.20 280)' }}>✦</span>
                  <span className="font-cinzel" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.13em', color: 'oklch(0.42 0.16 270)' }}>
                    MARIAN PATH 30
                  </span>
                </div>
                <ChevronRight size={15} style={{ color: 'oklch(0.55 0.10 270)', opacity: 0.7 }} />
              </div>

              {/* Hero number + meta */}
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                  <span className="font-display" style={{ fontSize: 72, fontWeight: 700, color: 'oklch(0.28 0.18 280)', lineHeight: 1 }}>
                    {completedCount}
                  </span>
                  <span style={{ fontSize: 20, color: 'oklch(0.52 0.08 270)', fontWeight: 400, marginBottom: 6 }}>/30</span>
                </div>
                <div style={{ textAlign: 'right', paddingBottom: 8 }}>
                  <p style={{ fontSize: 11, color: 'oklch(0.48 0.10 270)', fontWeight: 500, marginBottom: 2 }}>
                    {lang === 'ml' ? 'ദിവസം' : 'days'}
                  </p>
                  <p style={{ fontSize: 11, color: 'oklch(0.55 0.08 270)' }}>300 PTS</p>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 10.5, color: 'oklch(0.48 0.08 270)', fontWeight: 500 }}>
                    {lang === 'ml' ? `${completedCount} തലങ്ങൾ പൂർത്തിയായി` : `${completedCount} days complete`}
                  </span>
                  <span className="font-cinzel" style={{ fontSize: 10, color: 'oklch(0.52 0.14 280)', fontWeight: 600, letterSpacing: '0.06em' }}>
                    {progressPct}%
                  </span>
                </div>
                <div style={{
                  height: 10, borderRadius: 99,
                  background: 'rgba(180,160,240,0.15)',
                  boxShadow: 'inset 0 1px 3px rgba(100,60,200,0.12)',
                  overflow: 'hidden',
                }}>
                  <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* ── Day timeline ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span className="font-cinzel" style={{ fontSize: 13, fontWeight: 600, color: 'oklch(0.28 0.08 270)', display: 'flex', alignItems: 'center', gap: 7 }}>
              🕊️ {lang === 'ml' ? 'ദിവസങ്ങൾ' : 'Days'}
            </span>
            <Link href="/dashboard/marian-path" className="font-cinzel" style={{ fontSize: 12, color: 'oklch(0.50 0.22 280)', fontWeight: 500 }}>
              {lang === 'ml' ? 'എല്ലാം →' : 'View all →'}
            </Link>
          </div>

          <div className="flex gap-2.5 overflow-x-auto pt-1.5 pb-2 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
            {marianData.days.map((dayEntry) => {
              const day = dayEntry.day;
              const isDone = completedSet.has(day);
              const isCurrent = day === calendarDay;
              const isLocked = day > calendarDay;
              const href = isLocked ? '#' : `/dashboard/marian-path/${day}`;

              return (
                <Link
                  key={day}
                  href={href}
                  ref={isCurrent ? currentDayRef : undefined}
                  onClick={isLocked ? (e) => e.preventDefault() : undefined}
                  className="flex-shrink-0 transition-all active:scale-95"
                  style={{
                    width: 70, height: 82, borderRadius: 20,
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', gap: 6,
                    cursor: isLocked ? 'not-allowed' : 'pointer',
                    position: 'relative',
                    background: isDone ? 'rgba(255,255,255,0.52)' : isCurrent ? 'rgba(255,255,255,0.38)' : 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(36px) saturate(2)',
                    WebkitBackdropFilter: 'blur(36px) saturate(2)',
                    boxShadow: isDone ? [
                      'inset 0 1.5px 0 rgba(255,255,255,0.98)',
                      'inset 1px 0 0 rgba(255,255,255,0.65)',
                      '0 0 0 0.5px rgba(180,160,240,0.2)',
                      '0 4px 18px rgba(100,60,200,0.08)',
                    ].join(',') : isCurrent ? [
                      'inset 0 1.5px 0 rgba(255,255,255,0.95)',
                      '0 0 0 1px oklch(0.65 0.20 280 / 0.4)',
                      '0 0 0 3px oklch(0.65 0.20 280 / 0.08)',
                      '0 6px 22px oklch(0.52 0.22 280 / 0.18)',
                    ].join(',') : [
                      'inset 0 1px 0 rgba(255,255,255,0.6)',
                      '0 0 0 0.5px rgba(180,160,240,0.12)',
                    ].join(','),
                    opacity: isLocked ? 0.55 : 1,
                  }}
                >
                  {isDone && (
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: 'linear-gradient(145deg, oklch(0.60 0.20 145), oklch(0.52 0.18 160))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 3px 10px oklch(0.55 0.18 145 / 0.4), inset 0 1px 0 rgba(255,255,255,0.35)',
                    }}>
                      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                  {isCurrent && (
                    <span className="font-display" style={{ fontSize: 28, fontWeight: 700, color: 'oklch(0.32 0.20 280)', lineHeight: 1 }}>
                      {day}
                    </span>
                  )}
                  {isLocked && (
                    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="oklch(0.52 0.06 270)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                  )}
                  <span className="font-cinzel" style={{ fontSize: 10.5, fontWeight: 500, color: isCurrent ? 'oklch(0.35 0.18 280)' : 'oklch(0.5 0.06 270)' }}>
                    {lang === 'ml' ? `ദി. ${day}` : `Day ${day}`}
                  </span>
                  {isCurrent && (
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'oklch(0.62 0.22 280)', position: 'absolute', bottom: 7 }} />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── Reading of the day ── */}
        {bibleData && (
          <div className="sg-card sg-noise" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14, flexShrink: 0,
              background: 'linear-gradient(145deg, oklch(0.55 0.18 200), oklch(0.50 0.20 240))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: [
                'inset 0 1px 0 rgba(255,255,255,0.4)',
                '0 4px 16px oklch(0.52 0.18 200 / 0.35)',
                '0 1px 3px rgba(0,0,0,0.12)',
              ].join(','),
            }}>
              <BookOpen size={18} color="white" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="font-cinzel" style={{ fontSize: 10, color: 'oklch(0.50 0.22 280)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>
                {bibleData.bible_book} · {bibleData.bible_reference}
              </p>
              <p style={{ fontSize: 13, fontWeight: 500, color: 'oklch(0.25 0.06 270)', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {lang === 'ml' ? bibleData.bible_verse_ml : bibleData.bible_verse}
              </p>
            </div>
          </div>
        )}

        {/* ── Badges ── */}
        <div className="sg-card sg-noise" style={{ padding: '18px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span className="font-cinzel" style={{ fontSize: 13, fontWeight: 600, color: 'oklch(0.28 0.08 270)', display: 'flex', alignItems: 'center', gap: 7 }}>
              🏅 {lang === 'ml' ? 'ബാഡ്ജുകൾ' : 'Badges'}
            </span>
            <span className="font-cinzel font-bold" style={{ fontSize: 11, color: 'oklch(0.52 0.18 280)' }}>
              {unlockedCount}/{badges.length}
            </span>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {badges.map((badge) => (
              <div key={badge.id} className="flex flex-col items-center gap-0.5" title={lang === 'ml' ? badge.titleMl : badge.title}>
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl transition-all"
                  style={badge.unlocked ? {
                    background: 'rgba(255,255,255,0.65)',
                    boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.98), 0 0 0 0.5px rgba(180,160,240,0.28), 0 2px 8px rgba(100,60,200,0.10)',
                  } : {
                    background: 'rgba(255,255,255,0.22)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), 0 0 0 0.5px rgba(180,160,240,0.08)',
                    opacity: 0.4, filter: 'grayscale(0.7)',
                  }}
                >
                  {badge.emoji}
                </div>
                <p className="font-cinzel text-center leading-tight line-clamp-1 px-0.5" style={{ fontSize: 7, color: badge.unlocked ? 'oklch(0.38 0.08 270)' : 'oklch(0.55 0.04 270)' }}>
                  {(lang === 'ml' ? badge.titleMl : badge.title).split(' ')[0]}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-1 pb-1">
          <p className="font-cinzel" style={{ fontSize: 10, color: 'oklch(0.60 0.06 270)', opacity: 0.6 }}>
            ✝️ Cherupusha Mission League · Manathavady
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
