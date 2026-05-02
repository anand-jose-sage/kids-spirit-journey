'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, CheckCircle2, Lock } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useLang } from '@/contexts/LanguageContext';
import BottomNav from '@/components/BottomNav';
import {
  getMarianProgress,
  getMarianStats,
  getLevelForDay,
  LEVEL_NAMES,
  LEVEL_COLORS,
  MarianProgress,
  MarianStats,
} from '@/lib/marian-path-db';
import marianData from '@/data/marian-path.json';
import LevelBadge from '@/components/marian-path/LevelBadge';
import StatsRow from '@/components/marian-path/StatsRow';

function getTodayDayNum(): number {
  return Math.min(new Date().getDate(), 30);
}

export default function MarianPathPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { lang } = useLang();

  const [progress, setProgress] = useState<MarianProgress[]>([]);
  const [stats, setStats] = useState<MarianStats>({ totalScore: 0, streakDays: 0, rank: 1, completedCount: 0 });
  const [loading, setLoading] = useState(true);
  const [activeLevel, setActiveLevel] = useState(0);

  const load = useCallback(async () => {
    if (!user) return;
    const [prog, st] = await Promise.all([
      getMarianProgress(user.id),
      getMarianStats(user.id),
    ]);
    setProgress(prog);
    setStats(st);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const todayDayNum = getTodayDayNum();
  const completedSet = new Set(progress.filter((p) => p.completed).map((p) => p.day));
  const level = getLevelForDay(todayDayNum);
  const levelName = LEVEL_NAMES[level];

  const levels = [
    { id: 'L1', range: '1–6',   color: LEVEL_COLORS[1] },
    { id: 'L2', range: '7–12',  color: LEVEL_COLORS[2] },
    { id: 'L3', range: '13–18', color: LEVEL_COLORS[3] },
    { id: 'L4', range: '19–24', color: LEVEL_COLORS[4] },
    { id: 'L5', range: '25–30', color: LEVEL_COLORS[5] },
  ];

  return (
    <div className="min-h-screen flex flex-col pb-nav relative overflow-hidden">

      {/* Header */}
      <header
        className="relative z-10 flex items-center justify-center px-5 pt-safe pt-4 pb-3 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(180,160,240,0.15)' }}
      >
        <button
          onClick={() => router.back()}
          className="back-btn absolute left-4"
          aria-label="Back"
        >
          <ChevronLeft size={20} />
        </button>

        <div
          className="sg-pill convex"
          style={{ padding: '7px 18px', fontSize: 11.5, fontWeight: 600, letterSpacing: '0.10em', color: 'oklch(0.38 0.14 270)', textTransform: 'uppercase' }}
        >
          <span className="font-cinzel">MARIAN PATH 30</span>
        </div>
      </header>

      {/* Scrollable content */}
      <div className="scroll-area relative z-10">

        {/* Hero number */}
        <section className="px-5 pt-6 pb-4 flex flex-col items-center text-center">
          {loading ? (
            <div
              className="w-6 h-6 rounded-full border-2 animate-spin my-8"
              style={{ borderColor: 'rgba(100,60,200,0.15)', borderTopColor: 'oklch(0.52 0.22 280)' }}
            />
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span
                  className="font-display font-bold leading-none"
                  style={{ fontSize: 90, color: 'oklch(0.32 0.20 280)', lineHeight: 1 }}
                >
                  {stats.completedCount}
                </span>
                <span
                  className="font-display"
                  style={{ fontSize: 24, color: 'oklch(0.52 0.08 270)', fontWeight: 400 }}
                >
                  /30
                </span>
              </div>
              <p
                className="font-cinzel"
                style={{ fontSize: 10, color: 'oklch(0.52 0.08 270)', letterSpacing: '0.25em', textTransform: 'uppercase', marginTop: 4 }}
              >
                {lang === 'ml' ? 'ദിവസം പൂർത്തിയായി' : 'days complete'}
              </p>

              <div
                style={{
                  width: 80, height: 1, margin: '16px auto',
                  background: 'linear-gradient(90deg, transparent, rgba(100,60,200,0.35), transparent)',
                }}
              />

              {/* Level + today label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                <LevelBadge level={level} showName={false} />
                <span style={{ fontSize: 13, color: 'oklch(0.42 0.08 270)' }}>{levelName}</span>
                <span style={{ fontSize: 13, color: 'oklch(0.58 0.05 270)' }}>
                  · {lang === 'ml' ? `ദി ${todayDayNum}` : `Day ${todayDayNum}`}
                </span>
              </div>
            </>
          )}
        </section>

        {/* Level tabs */}
        <section className="px-4 pb-5">
          <div className="sg-card sg-noise" style={{ padding: 6, display: 'flex', gap: 4 }}>
            {levels.map((l, i) => (
              <div
                key={l.id}
                onClick={() => setActiveLevel(i)}
                style={{
                  flex: 1, padding: '10px 4px', borderRadius: 13, textAlign: 'center', cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: activeLevel === i ? 'rgba(255,255,255,0.72)' : 'transparent',
                  boxShadow: activeLevel === i ? [
                    'inset 0 1.5px 0 rgba(255,255,255,0.98)',
                    '0 0 0 0.5px rgba(180,160,240,0.25)',
                    '0 3px 12px rgba(100,60,200,0.10)',
                  ].join(',') : 'none',
                }}
              >
                <div
                  style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: l.color, margin: '0 auto 4px',
                    boxShadow: activeLevel === i ? `0 0 6px ${l.color}` : 'none',
                  }}
                />
                <div
                  className="font-cinzel"
                  style={{
                    fontSize: 10.5, fontWeight: 700,
                    color: activeLevel === i ? 'oklch(0.28 0.06 270)' : 'oklch(0.52 0.05 270)',
                  }}
                >
                  {l.id}
                </div>
                <div style={{ fontSize: 9.5, color: 'oklch(0.58 0.04 270)' }}>{l.range}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="px-4 pb-5">
          <StatsRow totalScore={stats.totalScore} streakDays={stats.streakDays} rank={stats.rank} />
        </section>

        {/* Day list */}
        <section className="px-4 pb-4">
          <p
            className="font-cinzel"
            style={{ fontSize: 10, color: 'oklch(0.52 0.06 270)', letterSpacing: '0.20em', textTransform: 'uppercase', marginBottom: 12 }}
          >
            {lang === 'ml' ? 'ദിവസങ്ങൾ' : 'All Days'}
          </p>
          <div className="flex flex-col gap-2">
            {marianData.days.map((dayEntry) => {
              const day = dayEntry.day;
              const isDone = completedSet.has(day);
              const isToday = day === todayDayNum;
              const isLocked = day > todayDayNum;
              const isPastNotDone = day < todayDayNum && !isDone;
              const lvl = getLevelForDay(day);
              const lvlColor = LEVEL_COLORS[lvl];
              const lvlName = LEVEL_NAMES[lvl];
              const href = isLocked ? '#' : `/dashboard/marian-path/${day}`;

              let rowStyle: React.CSSProperties;
              let iconStyle: React.CSSProperties;

              if (isDone) {
                rowStyle = {
                  background: 'rgba(255,255,255,0.42)',
                  backdropFilter: 'blur(36px) saturate(2)',
                  WebkitBackdropFilter: 'blur(36px) saturate(2)',
                  boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.98), 0 0 0 0.5px rgba(180,160,240,0.15), 0 2px 8px rgba(100,60,200,0.06)',
                };
                iconStyle = {
                  background: 'linear-gradient(145deg, oklch(0.72 0.18 55 / 0.22), oklch(0.62 0.18 55 / 0.12))',
                  border: '1px solid oklch(0.72 0.18 55 / 0.4)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
                };
              } else if (isToday) {
                rowStyle = {
                  background: 'rgba(255,255,255,0.38)',
                  backdropFilter: 'blur(36px) saturate(2)',
                  WebkitBackdropFilter: 'blur(36px) saturate(2)',
                  boxShadow: [
                    'inset 0 1.5px 0 rgba(255,255,255,0.95)',
                    '0 0 0 1px oklch(0.65 0.20 280 / 0.4)',
                    '0 0 0 3px oklch(0.65 0.20 280 / 0.08)',
                    '0 4px 16px oklch(0.52 0.22 280 / 0.14)',
                  ].join(','),
                };
                iconStyle = {
                  background: 'rgba(255,255,255,0.6)',
                  border: '1px solid oklch(0.65 0.20 280 / 0.35)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9)',
                };
              } else if (isLocked) {
                rowStyle = {
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5), 0 0 0 0.5px rgba(180,160,240,0.08)',
                  opacity: 0.5,
                };
                iconStyle = { background: 'rgba(255,255,255,0.3)', border: '1px solid rgba(180,160,240,0.15)' };
              } else {
                // past day (viewable, not yet completed)
                rowStyle = {
                  background: 'rgba(255,255,255,0.28)',
                  backdropFilter: 'blur(36px) saturate(2)',
                  WebkitBackdropFilter: 'blur(36px) saturate(2)',
                  boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.90), 0 0 0 0.5px rgba(180,160,240,0.10)',
                };
                iconStyle = {
                  background: 'rgba(255,255,255,0.45)',
                  border: '1px solid rgba(180,160,240,0.18)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)',
                };
              }

              return (
                <button
                  key={day}
                  onClick={() => !isLocked && router.push(href)}
                  disabled={isLocked}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all active:scale-[0.98]"
                  style={{ borderRadius: 20, ...rowStyle }}
                >
                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={iconStyle}
                  >
                    {isDone ? (
                      <div style={{
                        width: 24, height: 24, borderRadius: '50%',
                        background: 'linear-gradient(145deg, oklch(0.60 0.20 145), oklch(0.52 0.18 160))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 2px 8px oklch(0.55 0.18 145 / 0.4)',
                      }}>
                        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    ) : isLocked ? (
                      <Lock size={14} style={{ color: 'oklch(0.55 0.05 270)' }} />
                    ) : isPastNotDone ? (
                      <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="oklch(0.52 0.10 270)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                      </svg>
                    ) : (
                      <span
                        className="font-display font-bold"
                        style={{ fontSize: 18, color: isToday ? 'oklch(0.32 0.20 280)' : 'oklch(0.42 0.14 270)' }}
                      >
                        {day}
                      </span>
                    )}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-display font-semibold leading-snug truncate"
                      style={{
                        fontSize: 16,
                        color: isDone ? 'oklch(0.38 0.12 55)'
                          : isToday ? 'oklch(0.28 0.18 280)'
                          : isLocked ? 'oklch(0.55 0.04 270)'
                          : isPastNotDone ? 'oklch(0.40 0.06 270)'
                          : 'oklch(0.25 0.06 270)',
                      }}
                    >
                      {lang === 'ml' && (dayEntry as any).ml_title ? (dayEntry as any).ml_title : dayEntry.title}
                    </p>
                    <p className="text-[10px] mt-0.5 font-anek flex items-center gap-1" style={{ color: isLocked ? 'oklch(0.58 0.04 270)' : `${lvlColor}` }}>
                      <span
                        className="inline-block rounded-full"
                        style={{ width: 5, height: 5, background: isLocked ? 'oklch(0.70 0.04 270)' : lvlColor }}
                      />
                      {lvlName}
                    </p>
                  </div>

                  {/* Chevron */}
                  {!isLocked && (
                    <ChevronRight size={15} style={{ color: isToday ? 'oklch(0.42 0.18 280)' : 'oklch(0.60 0.05 270)', flexShrink: 0 }} />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 pb-8">
          {stats.completedCount < 30 ? (
            <button
              onClick={() => router.push(`/dashboard/marian-path/${todayDayNum}`)}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 font-cinzel font-semibold transition-all active:scale-[0.97]"
              style={{
                borderRadius: 99,
                background: 'linear-gradient(135deg, oklch(0.52 0.22 280), oklch(0.56 0.18 215))',
                boxShadow: [
                  '0 4px 24px oklch(0.52 0.22 280 / 0.35)',
                  '0 2px 8px rgba(0,0,0,0.10)',
                  'inset 0 1px 0 rgba(255,255,255,0.35)',
                ].join(','),
                color: 'white',
                fontSize: 14,
                letterSpacing: '0.04em',
                border: 'none',
              }}
            >
              <span className="text-lg">📿</span>
              <span>{lang === 'ml' ? 'ഇന്നത്തെ യാത്ര ആരംഭിക്കൂ' : "Begin Today's Journey"}</span>
              <ChevronRight size={18} style={{ color: 'rgba(255,255,255,0.75)' }} />
            </button>
          ) : (
            <div
              className="w-full text-center px-6 py-4 font-cinzel font-semibold"
              style={{
                borderRadius: 99,
                background: 'linear-gradient(135deg, oklch(0.62 0.18 55), oklch(0.72 0.16 85))',
                color: 'white',
                boxShadow: '0 4px 24px oklch(0.62 0.18 55 / 0.35), inset 0 1px 0 rgba(255,255,255,0.35)',
                fontSize: 14,
              }}
            >
              ✦ {lang === 'ml' ? 'മറിയൻ പാത്ത് പൂർത്തിയാക്കി!' : 'Marian Path Complete!'}
            </div>
          )}
        </section>
      </div>

      <BottomNav />
    </div>
  );
}
