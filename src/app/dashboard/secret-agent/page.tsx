'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/components/AuthProvider';
import BottomNav from '@/components/BottomNav';
import missions from '@/data/secret-agent-missions.json';
import mlMissions from '@/data/secret-agent-missions.ml.json';
import { getAgentProgress, getAgentLevel, getAgentPoints, AgentProgress } from '@/lib/database';
import { isAgentDayUnlocked, getTodayAgentDay } from '@/lib/schedule';
import { useLang } from '@/contexts/LanguageContext';
import { CheckCircle2, Lock, ChevronRight, ChevronLeft, Shield, Crosshair, Fingerprint, Radio } from 'lucide-react';
import { clsx } from 'clsx';

const LEVELS = ['Recruit', 'Messenger', 'Prophet', 'King', 'Disciple', 'Apostle'];
const LEVELS_ML = ['റിക്രൂട്ട്', 'ദൂതൻ', 'പ്രവാചകൻ', 'രാജാവ്', 'ശിഷ്യൻ', 'അപ്പോസ്തലൻ'];
const LEVEL_ICONS = ['🔰', '📨', '🔮', '👑', '✝️', '⚡'];

export default function SecretAgentPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const { lang } = useLang();
  const [progress, setProgress] = useState<AgentProgress[]>([]);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) getAgentProgress(user.id).then(setProgress);
  }, [user]);

  if (loading || !profile) return null;

  const completedMap = new Map(progress.map((p) => [p.day, p]));
  const completedCount = progress.filter((p) => p.completed).length;
  const level = getAgentLevel(completedCount);
  const points = getAgentPoints(progress);
  const levelIdx = LEVELS.indexOf(level);
  const progressPct = Math.round((completedCount / 15) * 100);

  const todayMission = getTodayAgentDay();

  // Refs for scrolling
  const listRef = useRef<HTMLDivElement>(null);
  const missionRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  // Scroll current day mission to top on load
  useEffect(() => {
    if (missionRefs.current && todayMission && missionRefs.current[todayMission - 1]) {
      const el = missionRefs.current[todayMission - 1];
      if (el) {
        el.scrollIntoView({ behavior: 'auto', block: 'center' });
      }
    }
  }, [progress, todayMission]);

  function ml(day: number) {
    return mlMissions[String(day) as keyof typeof mlMissions];
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 pb-nav font-anek">
      {/* Scanline overlay */}
      <div className="fixed inset-0 pointer-events-none z-10 opacity-[0.02]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,65,0.08) 2px, rgba(0,255,65,0.08) 4px)' }} />

      {/* Header — classified dossier style */}
      <div className="relative bg-gradient-to-b from-slate-900 to-slate-800 px-5 pt-12 pb-6 border-b border-emerald-500/25">
        {/* Grid pattern background */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, rgba(0,255,65,0.3) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

        <div className="relative">
          <Link href="/dashboard" className="flex items-center gap-1 text-emerald-400/70 text-xs font-mono mb-4 hover:text-emerald-300 transition-colors">
            <ChevronLeft size={14} /> {lang === 'ml' ? '← ഡാഷ്ബോർഡ്' : '← BACK TO HQ'}
          </Link>

          {/* Agent badge */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <Image src="/images/estherq.png" alt="Agent Esther" width={56} height={56} className="rounded-full border-2 border-emerald-400/60 object-cover" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-[10px] font-bold text-black">{completedCount}</span>
              </div>
            </div>
            <div>
              <p className="text-emerald-400/80 text-[10px] font-mono uppercase tracking-[0.2em]">
                {lang === 'ml' ? 'തരംതിരിച്ചത്' : 'CLASSIFIED OPERATION'}
              </p>
              <h1 className="text-white text-lg font-bold tracking-tight">
                {lang === 'ml' ? 'ബിബ്ലിയ സീക്രട്ട്' : 'Biblia Secret'}
              </h1>
              <p className="text-emerald-300/60 text-xs font-mono">
                {lang === 'ml' ? 'ദൗത്യം: രക്ഷാ ചരിത്രം' : 'MISSION: SALVATION HISTORY'}
              </p>
            </div>
          </div>

          {/* Agent ID card */}
          <div className="bg-slate-900/60 border border-emerald-400/25 rounded-xl p-4 backdrop-blur-sm">
            {/* Top row — rank & points */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-emerald-400" />
                <div>
                  <p className="text-emerald-400/70 text-[10px] font-mono uppercase">{lang === 'ml' ? 'ഏജന്റ് റാങ്ക്' : 'AGENT RANK'}</p>
                  <p className="text-emerald-200 text-sm font-bold">
                    {LEVEL_ICONS[levelIdx]} {lang === 'ml' ? LEVELS_ML[levelIdx] : level}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-emerald-400/70 text-[10px] font-mono uppercase">{lang === 'ml' ? 'സ്റ്റാർ പോയിന്റ്' : 'STAR PTS'}</p>
                <p className="text-emerald-200 text-sm font-bold font-mono">{points}</p>
              </div>
            </div>

            {/* Progress bar — hacker style */}
            <div className="mb-3">
              <div className="flex justify-between text-[10px] font-mono text-emerald-400/60 mb-1">
                <span>[{completedCount}/15 {lang === 'ml' ? 'ദൗത്യങ്ങൾ' : 'MISSIONS'}]</span>
                <span>{progressPct}%</span>
              </div>
              <div className="bg-emerald-500/15 rounded-sm h-2 overflow-hidden border border-emerald-500/25">
                <div
                  className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full transition-all duration-700 relative"
                  style={{ width: `${progressPct}%` }}
                >
                  <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(0,0,0,0.3) 4px, rgba(0,0,0,0.3) 8px)' }} />
                </div>
              </div>
            </div>

            {/* Level progression — dots */}
            <div className="flex items-center gap-1.5">
              {LEVELS.map((lvl, i) => (
                <div key={lvl} className="flex-1 flex flex-col items-center gap-1">
                  <div className={clsx(
                    'w-full h-1 rounded-full transition-all',
                    i <= levelIdx ? 'bg-emerald-400' : 'bg-slate-600'
                  )} />
                  <span className={clsx(
                    'text-[9px] font-mono',
                    i <= levelIdx ? 'text-emerald-300' : 'text-slate-500'
                  )}>
                    {LEVEL_ICONS[i]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mission dossier list */}
      <div className="px-5 py-4" ref={listRef}>
        <div className="flex items-center gap-2 mb-3">
          <Radio size={12} className="text-emerald-400 animate-pulse" />
          <p className="text-emerald-400/70 text-[10px] font-mono uppercase tracking-widest">
            {lang === 'ml' ? 'ദൗത്യ ഫയലുകൾ' : 'MISSION DOSSIERS'}
          </p>
          <div className="flex-1 h-px bg-emerald-500/20" />
        </div>

        <div className="space-y-2">
          {missions.map((m, idx) => {
            const dayProgress = completedMap.get(m.day);
            const done = dayProgress?.completed ?? false;
            const unlocked = isAgentDayUnlocked(m.day);
            const isToday = m.day === todayMission && !done;

            return (
              <Link
                key={m.day}
                href={unlocked ? `/dashboard/secret-agent/${m.day}` : '#'}
                className={clsx(
                  'flex items-center gap-3 rounded-lg p-3 transition-all border',
                  done && 'bg-emerald-500/10 border-emerald-500/25',
                  isToday && 'bg-emerald-500/15 border-emerald-400/50 shadow-lg shadow-emerald-500/10',
                  !done && !isToday && unlocked && 'bg-slate-700/50 border-slate-600/50 hover:border-emerald-500/40 hover:bg-emerald-500/10',
                  !unlocked && 'bg-slate-800/40 border-slate-700/30 opacity-50'
                )}
                ref={el => { missionRefs.current[idx] = el; }}
              >
                {/* Mission number badge */}
                <div className={clsx(
                  'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 font-mono text-xs font-bold border',
                  done ? 'bg-emerald-500/15 border-emerald-500/30' : isToday ? 'bg-emerald-500/20 border-emerald-400/50' : unlocked ? 'bg-slate-600/50 border-slate-500/30' : 'bg-slate-700/30 border-slate-600/20'
                )}>
                  {done ? (
                    <CheckCircle2 size={20} className="text-emerald-400" />
                  ) : !unlocked ? (
                    <Lock size={16} className="text-slate-500" />
                  ) : (
                    <span className={clsx(isToday ? 'text-emerald-400' : 'text-gray-400')}>
                      {String(m.day).padStart(2, '0')}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={clsx(
                      'font-semibold text-sm truncate',
                      done ? 'text-emerald-200' : unlocked ? 'text-slate-100' : 'text-slate-500'
                    )}>
                      {lang === 'ml' ? ml(m.day)?.title || m.title : m.title}
                    </p>
                    {isToday && (
                      <span className="bg-emerald-500 text-black text-[10px] font-mono font-bold px-1.5 py-0.5 rounded flex-shrink-0 animate-pulse">
                        {lang === 'ml' ? 'LIVE' : 'LIVE'}
                      </span>
                    )}
                    {done && (
                      <span className="text-xs">{m.reward.emoji}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className={clsx(
                      'text-[11px] font-mono truncate',
                      done ? 'text-emerald-400/60' : unlocked ? 'text-slate-400' : 'text-slate-600'
                    )}>
                      {done
                        ? `✓ ${lang === 'ml' ? ml(m.day)?.reward || m.reward.badge : m.reward.badge}`
                        : unlocked
                          ? (lang === 'ml' ? `${m.clues.length} സൂചനകൾ · തരംതിരിച്ചത്` : `${m.clues.length} CLUES · CLASSIFIED`)
                          : (lang === 'ml' ? 'ലോക്ക് ചെയ്തത്' : 'LOCKED')}
                    </p>
                  </div>
                </div>

                {unlocked && (
                  <div className={clsx(
                    'w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0',
                    done ? 'bg-emerald-500/15' : 'bg-slate-600/40'
                  )}>
                    <ChevronRight size={14} className={clsx(done ? 'text-emerald-400/60' : 'text-slate-400')} />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Completed all missions banner */}
      {completedCount === 15 && (
        <div className="mx-5 mb-4 bg-gradient-to-r from-emerald-500/15 to-emerald-600/15 border border-emerald-400/30 rounded-xl p-5 text-center">
          <Crosshair size={32} className="mx-auto text-emerald-300 mb-2" />
          <h3 className="text-emerald-200 text-lg font-bold font-mono">
            {lang === 'ml' ? 'എല്ലാ ദൗത്യങ്ങളും പൂർത്തിയായി' : 'ALL MISSIONS COMPLETE'}
          </h3>
          <p className="text-emerald-400/60 text-xs font-mono mt-1">
            {lang === 'ml' ? 'നീ ഒരു യഥാർത്ഥ അപ്പോസ്തലൻ ആണ്!' : 'YOU ARE A TRUE APOSTLE, AGENT.'}
          </p>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
