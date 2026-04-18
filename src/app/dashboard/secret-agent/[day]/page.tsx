'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/components/AuthProvider';
import BottomNav from '@/components/BottomNav';
import missions from '@/data/secret-agent-missions.json';
import mlMissions from '@/data/secret-agent-missions.ml.json';
import { getAgentDayProgress, submitAgentAnswer, recordClueView, AgentProgress, getClueBasedPoints } from '@/lib/database';
import { isAgentDayUnlocked, isPuzzleUnlocked, getAgentUnlockDate, getTodayAgentDay } from '@/lib/schedule';
import { sanitizeInput } from '@/lib/sanitize';
import { useLang } from '@/contexts/LanguageContext';
import { ChevronLeft, Eye, EyeOff, CheckCircle2, XCircle, Lock, Shield, Send, Crosshair, Puzzle, Pencil } from 'lucide-react';
import { clsx } from 'clsx';

const CLUE_LABELS = ['🔍 STAR 1 — RIDDLE', '🧩 STAR 2 — PUZZLE', '📖 STAR 3 — SCRIPTURE', '🧩 STAR 4 — JIGSAW'];
const CLUE_LABELS_ML = ['🔍 സ്റ്റാർ 1 — കടങ്കഥ', '🧩 സ്റ്റാർ 2 — പസിൽ', '📖 സ്റ്റാർ 3 — വേദവാക്യം', '🧩 സ്റ്റാർ 4 — ജിഗ്സോ'];
const CLUE_DELAY_MS = [0, 10_000, 20_000, 30_000]; // free, 10s, 20s, 30s

export default function MissionDayPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { lang } = useLang();
  const day = Number(params.day);
  const isDev = process.env.NODE_ENV === 'development';

  const mission = missions.find((m) => m.day === day);
  const mlData = mlMissions[String(day) as keyof typeof mlMissions];

  const CLUE_TIMERS = [0, 10, 20, 30]; // seconds per clue

  // Persist "first opened" time so timers survive navigation
  const openedAtKey = `agent-day-${day}-openedAt`;

  function computeTimers(): number[] {
    if (typeof window === 'undefined') return CLUE_TIMERS;
    const stored = localStorage.getItem(openedAtKey);
    const openedAt = stored ? Number(stored) : Date.now();
    if (!stored) localStorage.setItem(openedAtKey, String(openedAt));
    const elapsed = Math.floor((Date.now() - openedAt) / 1000);
    return CLUE_TIMERS.map((t) => Math.max(0, t - elapsed));
  }

  function computeRevealed(timersArr: number[]): boolean[] {
    // Only clue 0 auto-reveals; clues 1-3 require explicit VIEW click (restored from DB)
    return timersArr.map((t, i) => i === 0 && t === 0);
  }

  const [progress, setProgress] = useState<AgentProgress | null>(null);
  const [timers, setTimers] = useState<number[]>(() => computeTimers());
  const [revealedClues, setRevealedClues] = useState<boolean[]>(() => computeRevealed(computeTimers()));
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);

  // Reset all state when day changes (navigating between missions)
  useEffect(() => {
    const t = computeTimers();
    setTimers(t);
    setRevealedClues(computeRevealed(t));
    setAnswer('');
    setProgress(null);
    setEditing(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day]);

  const loadProgress = useCallback(async () => {
    if (!user) return;
    const p = await getAgentDayProgress(user.id, day);
    setProgress(p);
    if (p?.completed) {
      // Clear localStorage for completed day — no longer needed
      localStorage.removeItem(`agent-day-${day}-openedAt`);
      setRevealedClues([true, true, true, true]);
    } else if (p) {
      // Restore clue reveals based on viewed_clues from DB
      setRevealedClues((rc) => {
        const u = [...rc];
        for (const idx of p.viewedClues) u[idx] = true;
        return u;
      });
    }
  }, [user, day]);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  // Redirect if mission is still locked
  const dayUnlocked = !loading && mission ? isAgentDayUnlocked(day) : false;

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  // Countdown timers for clue unlock
  useEffect(() => {
    if (progress?.completed) return;
    const interval = setInterval(() => {
      setTimers((prev) => {
        const next = prev.map((t) => Math.max(0, t - 1));
        if (next.every((t) => t === 0)) clearInterval(interval);
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [progress?.completed]);

  // Unlock clue on attempts
  useEffect(() => {
    if (progress && progress.viewedClues.length > 0) {
      setRevealedClues((rc) => {
        const u = [...rc];
        for (const idx of progress.viewedClues) u[idx] = true;
        return u;
      });
    }
  }, [progress?.viewedClues]);

  if (loading || !user) return null;

  if (!mission) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <p className="text-white text-lg">Mission not found.</p>
      </div>
    );
  }

  // Locked day — show disabled preview
  if (!dayUnlocked) {
    const unlockDate = getAgentUnlockDate(day);
    const unlockStr = unlockDate.toLocaleDateString(lang === 'ml' ? 'ml-IN' : 'en-IN', { month: 'short', day: 'numeric' });
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 pb-nav font-anek">
        <div className="fixed inset-0 pointer-events-none z-10 opacity-[0.02]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,65,0.08) 2px, rgba(0,255,65,0.08) 4px)' }} />

        <div className="relative bg-gradient-to-b from-slate-900 to-slate-800 px-5 pt-12 pb-5 border-b border-emerald-500/25">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, rgba(0,255,65,0.3) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          <div className="relative">
            <Link href="/dashboard/secret-agent" className="flex items-center gap-1 text-emerald-400/70 text-xs font-mono mb-4 hover:text-emerald-300 transition-colors">
              <ChevronLeft size={14} /> {lang === 'ml' ? '← എല്ലാ ദൗത്യങ്ങളും' : '← MISSION HQ'}
            </Link>
            <div className="flex items-center gap-3">
              <Image src="/images/estherq.png" alt="Agent Esther" width={48} height={48} className="rounded-lg border border-emerald-400/40 object-cover opacity-50" />
              <div>
                <p className="text-emerald-400/70 text-[10px] font-mono uppercase tracking-[0.15em]">
                  {lang === 'ml' ? `ദൗത്യം ${String(day).padStart(2, '0')} / 15` : `MISSION ${String(day).padStart(2, '0')} OF 15`}
                </p>
                <h1 className="text-white/50 text-lg font-bold tracking-tight mt-0.5">
                  {lang === 'ml' ? mlData?.title || mission.title : mission.title}
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-10 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-slate-700/60 border-2 border-emerald-500/30 flex items-center justify-center">
            <Lock size={36} className="text-emerald-400/50" />
          </div>
          <div>
            <p className="text-emerald-400/70 text-[10px] font-mono uppercase tracking-widest mb-1">
              {lang === 'ml' ? 'രഹസ്യ വർഗ്ഗീകൃതം' : 'CLASSIFIED'}
            </p>
            <h2 className="text-white text-lg font-bold">
              {lang === 'ml' ? 'ദൗത്യം ലോക്ക് ചെയ്തിരിക്കുന്നു' : 'Mission Locked'}
            </h2>
            <p className="text-slate-400 text-sm mt-2 max-w-[260px] mx-auto">
              {lang === 'ml'
                ? `ഈ ദൗത്യം ${unlockStr} മുതൽ ലഭ്യമാകും. തയ്യാറാകൂ, ഏജന്റ്!`
                : `This mission unlocks on ${unlockStr}. Stand by, Agent!`}
            </p>
          </div>
          <Link
            href="/dashboard/secret-agent"
            className="mt-4 bg-emerald-600 hover:bg-emerald-500 text-black font-mono font-bold text-sm py-3 px-6 rounded-lg active:scale-[0.98] transition-all"
          >
            {lang === 'ml' ? '← ദൗത്യ കേന്ദ്രം' : '← MISSION HQ'}
          </Link>
        </div>

        <BottomNav />
      </div>
    );
  }

  const isExpired = day < getTodayAgentDay() && !progress?.completed;
  const solved = (progress?.completed ?? false) && !editing;

  async function handleSubmit() {
    if (!user || submitting || !answer.trim()) return;
    setSubmitting(true);
    const normalized = sanitizeInput(answer, 100);
    if (!normalized) return;
    const mlAliases = mlData?.aliases ?? [];
    const allAliases = [...mission!.aliases, ...mlAliases];
    try {
      await submitAgentAnswer(user.id, day, normalized, allAliases);
      setEditing(false);
      await loadProgress();
    } finally {
      setSubmitting(false);
    }
  }

  const nextDay = day < 15 ? day + 1 : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 pb-nav font-anek">
      {/* Scanline overlay */}
      <div className="fixed inset-0 pointer-events-none z-10 opacity-[0.02]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,65,0.08) 2px, rgba(0,255,65,0.08) 4px)' }} />

      {/* Header — mission dossier */}
      <div className="relative bg-gradient-to-b from-slate-900 to-slate-800 px-5 pt-12 pb-5 border-b border-emerald-500/25">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, rgba(0,255,65,0.3) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

        <div className="relative">
          <Link href="/dashboard/secret-agent" className="flex items-center gap-1 text-emerald-400/70 text-xs font-mono mb-4 hover:text-emerald-300 transition-colors">
            <ChevronLeft size={14} /> {lang === 'ml' ? '← എല്ലാ ദൗത്യങ്ങളും' : '← MISSION HQ'}
          </Link>

          <div className="flex items-center gap-3">
            <Image src="/images/estherq.png" alt="Agent Esther" width={48} height={48} className="rounded-lg border border-emerald-400/40 object-cover" />
            <div>
              <div className="flex items-center gap-2">
                <p className="text-emerald-400/70 text-[10px] font-mono uppercase tracking-[0.15em]">
                  {lang === 'ml' ? `ദൗത്യം ${String(day).padStart(2, '0')} / 15` : `MISSION ${String(day).padStart(2, '0')} OF 15`}
                </p>
                {solved && (
                  <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">
                    SOLVED
                  </span>
                )}
              </div>
              <h1 className="text-white text-lg font-bold tracking-tight mt-0.5">
                {lang === 'ml' ? mlData?.title || mission.title : mission.title}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-5 space-y-4">
        {/* Mission briefing */}
        <div className="bg-slate-900/50 border border-emerald-500/20 rounded-xl p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-400/50" />
          <div className="flex items-center gap-2 mb-2">
            <Shield size={12} className="text-emerald-400/70" />
            <p className="text-emerald-400/70 text-[10px] font-mono uppercase tracking-widest">
              {lang === 'ml' ? 'ദൗത്യ വിവരണം' : 'MISSION BRIEFING'}
            </p>
          </div>
          <p className="text-slate-200 text-sm leading-relaxed pl-0.5">
            {lang === 'ml' ? mlData?.story || mission.story : mission.story}
          </p>
        </div>

        {/* Intel files (clues) */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-emerald-400/70 text-[10px] font-mono uppercase tracking-widest">
              {lang === 'ml' ? 'ഇന്റലിജൻസ് ഫയലുകൾ' : 'INTELLIGENCE FILES'}
            </p>
            <div className="flex-1 h-px bg-emerald-500/20" />
          </div>

          <div className="space-y-2">
            {mission.clues.map((clue, idx) => {
              const revealed = revealedClues[idx];
              const timer = timers[idx];
              return (
                <div
                  key={idx}
                  className={clsx(
                    'rounded-lg p-3.5 transition-all border relative overflow-hidden',
                    revealed ? 'bg-emerald-500/10 border-emerald-400/30' : 'bg-slate-700/40 border-slate-600/40'
                  )}
                >
                  {/* Classified stripe for locked clues */}
                  {!revealed && (
                    <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)' }} />
                  )}

                  <div className="flex items-center justify-between mb-2 relative">
                    <p className={clsx(
                      'text-[10px] font-mono font-bold tracking-wider',
                      revealed ? 'text-emerald-300' : 'text-slate-400'
                    )}>
                      {lang === 'ml' ? CLUE_LABELS_ML[idx] : CLUE_LABELS[idx]}
                    </p>
                    <div className="flex items-center gap-2">
                      {!revealed && timer > 0 && (
                        <span className="text-red-400/70 text-sm font-mono font-bold flex items-center gap-1.5 bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20">
                          <Lock size={16} /> {timer}s
                        </span>
                      )}
                      {revealed ? (
                        <Eye size={18} className="text-emerald-400/60" />
                      ) : (
                        <EyeOff size={18} className="text-slate-400" />
                      )}
                    </div>
                  </div>

                  {revealed ? (
                    <div className="relative">
                      <p className="text-slate-100 text-sm leading-relaxed">
                        {lang === 'ml' ? mlData?.clues?.[idx] || clue.content : clue.content}
                      </p>
                      {'reference' in clue && clue.reference && (
                        <p className="text-emerald-400/60 text-[10px] font-mono mt-1.5">📖 {clue.reference}</p>
                      )}
                    </div>
                  ) : (idx === 1 || idx === 2) && timer === 0 ? (
                    <button
                      onClick={async () => {
                        setRevealedClues((rc) => { const u = [...rc]; u[idx] = true; return u; });
                        if (user) await recordClueView(user.id, day, idx);
                      }}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-black font-mono font-bold text-xs py-2 px-4 rounded-lg transition-all active:scale-[0.98]"
                    >
                      <Eye size={14} />
                      {lang === 'ml' ? 'കാണുക' : 'VIEW'}
                    </button>
                  ) : (
                    <div className="relative">
                      <p className="text-slate-400 text-xs font-mono italic">
                        {timer > 0
                          ? (lang === 'ml' ? `[${timer}s ൽ ഡീക്രിപ്റ്റ് ചെയ്യും…]` : `[DECRYPTING IN ${timer}s…]`)
                          : (lang === 'ml' ? '[തെറ്റായ ശ്രമത്തിന് ശേഷം ലഭ്യം]' : '[AVAILABLE AFTER FAILED ATTEMPT]')}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}

            {/* 4th clue — Jigsaw Puzzle (only after PUZZLE_START) */}
            {isPuzzleUnlocked() && (() => {
              const puzzleIdx = 3;
              const revealed = revealedClues[puzzleIdx];
              const timer = timers[puzzleIdx];
              const puzzleHint = lang === 'ml' ? mlData?.puzzleHint || mission.puzzleHint : mission.puzzleHint;
              const puzzleParams = new URLSearchParams({
                image: mission.puzzleImage,
                titleEn: `Mission ${day} Puzzle`,
                titleMl: `ദൗത്യം ${day} പസിൽ`,
                solvedTextEn: 'Star Decoded! Go back and submit your answer.',
                solvedTextMl: 'സ്റ്റാർ ഡീകോഡ് ചെയ്തു! തിരികെ പോയി ഉത്തരം സമർപ്പിക്കൂ.',
                backUrl: `/dashboard/secret-agent/${day}`,
              });
              return (
                <div
                  className={clsx(
                    'rounded-lg p-3.5 transition-all border relative overflow-hidden',
                    revealed ? 'bg-emerald-500/10 border-emerald-400/30' : 'bg-slate-700/40 border-slate-600/40'
                  )}
                >
                  {!revealed && (
                    <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)' }} />
                  )}

                  <div className="flex items-center justify-between mb-2 relative">
                    <p className={clsx(
                      'text-[10px] font-mono font-bold tracking-wider',
                      revealed ? 'text-emerald-300' : 'text-slate-400'
                    )}>
                      {lang === 'ml' ? CLUE_LABELS_ML[puzzleIdx] : CLUE_LABELS[puzzleIdx]}
                    </p>
                    <div className="flex items-center gap-2">
                      {!revealed && timer > 0 && (
                        <span className="text-red-400/70 text-sm font-mono font-bold flex items-center gap-1.5 bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20">
                          <Lock size={16} /> {timer}s
                        </span>
                      )}
                      {revealed ? (
                        <Eye size={18} className="text-emerald-400/60" />
                      ) : (
                        <EyeOff size={18} className="text-slate-400" />
                      )}
                    </div>
                  </div>

                  {revealed ? (
                    <div className="relative space-y-2">
                      <p className="text-slate-100 text-sm leading-relaxed">{puzzleHint}</p>
                      <Link
                        href={`/dashboard/puzzle?${puzzleParams.toString()}`}
                        className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-black font-mono font-bold text-sm py-2.5 rounded-lg transition-all active:scale-[0.98]"
                      >
                        <Puzzle size={16} />
                        {lang === 'ml' ? 'ജിഗ്സോ പസിൽ തുറക്കൂ' : 'OPEN JIGSAW PUZZLE'}
                      </Link>
                    </div>
                  ) : timer === 0 ? (
                    <button
                      onClick={async () => {
                        setRevealedClues((rc) => { const u = [...rc]; u[puzzleIdx] = true; return u; });
                        if (user) await recordClueView(user.id, day, puzzleIdx);
                      }}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-black font-mono font-bold text-xs py-2 px-4 rounded-lg transition-all active:scale-[0.98]"
                    >
                      <Eye size={14} />
                      {lang === 'ml' ? 'കാണുക' : 'VIEW'}
                    </button>
                  ) : (
                    <div className="relative">
                      <p className="text-slate-400 text-xs font-mono italic">
                        {timer > 0
                          ? (lang === 'ml' ? `[${timer}s ൽ ഡീക്രിപ്റ്റ് ചെയ്യും…]` : `[DECRYPTING IN ${timer}s…]`)
                          : (lang === 'ml' ? '[തെറ്റായ ശ്രമത്തിന് ശേഷം ലഭ്യം]' : '[AVAILABLE AFTER FAILED ATTEMPT]')}
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Answer terminal */}
        {isExpired ? (
          <div className="bg-slate-900/50 border border-red-400/30 rounded-xl p-5 text-center space-y-3 relative overflow-hidden">
            <div className="absolute inset-0 bg-red-500/5" />
            <div className="relative">
              <Lock size={32} className="mx-auto text-red-400/70 mb-2" />
              <p className="text-red-400/70 text-[10px] font-mono uppercase tracking-widest mb-1">
                {lang === 'ml' ? 'ദൗത്യം കാലഹരണപ്പെട്ടു' : 'MISSION EXPIRED'}
              </p>
              <p className="text-slate-400 text-sm">
                {lang === 'ml'
                  ? 'ഈ ദൗത്യത്തിന്റെ ഉത്തരം സമർപ്പിക്കാനുള്ള സമയം കഴിഞ്ഞു.'
                  : 'The window to submit an answer for this mission has closed.'}
              </p>
              <p className="text-slate-200 text-sm font-mono mt-2">
                <span className="text-emerald-400/60">{lang === 'ml' ? 'ഉത്തരം: ' : 'ANSWER: '}</span>
                <span className="font-bold capitalize">{mission.answer}</span>
              </p>
              <Link
                href="/dashboard/secret-agent"
                className="inline-block mt-4 bg-emerald-600 hover:bg-emerald-500 text-black font-mono font-bold text-sm py-3 px-6 rounded-lg active:scale-[0.98] transition-all"
              >
                {lang === 'ml' ? '← ദൗത്യ കേന്ദ്രം' : '← MISSION HQ'}
              </Link>
            </div>
          </div>
        ) : !solved ? (
          <div className="bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-emerald-400/40 rounded-xl p-5 shadow-lg shadow-emerald-500/10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-emerald-300 text-xs font-mono font-bold uppercase tracking-widest">
                {lang === 'ml' ? '🕵️ ഉത്തരം സമർപ്പിക്കുക' : '🕵️ SUBMIT IDENTIFICATION'}
              </p>
            </div>

            <div className="bg-slate-900/80 rounded-lg p-4 border border-emerald-400/30 mb-4">
              <p className="text-emerald-300/70 text-xs font-mono mb-2">
                {lang === 'ml' ? '> വ്യക്തിയെ മനസിലാക്കിയെങ്കിൽ ഉത്തരമായി എഴുതുക_' : '> ENTER IDENTIFIED PERSON NAME'}
              </p>
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder={lang === 'ml' ? 'വ്യക്തിയുടെ പേര് ടൈപ്പ് ചെയ്യൂ…' : 'Type the name of the person…'}
                maxLength={100}
                className="w-full bg-transparent text-emerald-100 placeholder-emerald-500/40 text-lg font-mono font-bold focus:outline-none caret-emerald-400"
                disabled={submitting}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || !answer.trim()}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-base py-3.5 rounded-lg disabled:opacity-30 disabled:hover:bg-emerald-500 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20"
            >
              <Send size={16} />
              {submitting ? (lang === 'ml' ? 'സേവ് ചെയ്യുന്നു…' : 'SAVING…') : (lang === 'ml' ? 'സമർപ്പിക്കുക' : 'SUBMIT')}
            </button>

            {progress && progress.attempts > 0 && !solved && (
              <p className="text-emerald-400/50 text-[10px] font-mono mt-2">
                {lang === 'ml' ? `ശ്രമങ്ങൾ: ${progress.attempts}` : `ATTEMPTS: ${progress.attempts}`}
              </p>
            )}
          </div>
        ) : (
          <div className={clsx(
            'border rounded-xl p-5 text-center space-y-3 relative overflow-hidden',
            progress?.correct
              ? 'bg-slate-900/50 border-emerald-400/30'
              : 'bg-slate-900/50 border-red-400/30'
          )}>
            {/* Glow */}
            <div className={clsx('absolute inset-0', progress?.correct ? 'bg-emerald-500/8' : 'bg-red-500/8')} />
            <div className={clsx('absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full blur-3xl', progress?.correct ? 'bg-emerald-500/10' : 'bg-red-500/10')} />

            <div className="relative">
              {progress?.correct ? (
                <CheckCircle2 size={36} className="mx-auto text-emerald-400 mb-1" />
              ) : (
                <XCircle size={36} className="mx-auto text-red-400 mb-1" />
              )}
              <p className={clsx('text-[10px] font-mono uppercase tracking-widest mb-1', progress?.correct ? 'text-emerald-400/70' : 'text-red-400/70')}>
                {lang === 'ml' ? 'ദൗത്യം പൂർത്തിയായി' : 'MISSION COMPLETE'}
              </p>
              <h3 className="text-white text-xl font-bold">
                {progress?.correct
                  ? (lang === 'ml' ? 'ഉത്തരം ശരി!' : 'CORRECT ANSWER!')
                  : (lang === 'ml' ? 'ഉത്തരം സമർപ്പിച്ചു!' : 'ANSWER SUBMITTED!')}
              </h3>
              <p className="text-slate-200 text-sm font-mono mt-1">
                <span className="text-slate-400">{lang === 'ml' ? 'നിങ്ങളുടെ ഉത്തരം: ' : 'YOUR ANSWER: '}</span>
                <span className="font-bold capitalize">{progress?.answer ?? ''}</span>
              </p>
              {!progress?.correct && (
                <p className="text-slate-200 text-sm font-mono mt-0.5">
                  <span className="text-emerald-400/60">{lang === 'ml' ? 'ശരിയായ ഉത്തരം: ' : 'CORRECT ANSWER: '}</span>
                  <span className="font-bold capitalize">{mission.answer}</span>
                </p>
              )}

              {progress?.correct && (
                <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-400/25 text-emerald-200 px-4 py-2 rounded-lg text-xs font-mono font-semibold mt-3">
                  <span className="text-lg">{mission.reward.emoji}</span>
                  {lang === 'ml' ? mlData?.reward || mission.reward.badge : mission.reward.badge} · +{getClueBasedPoints(progress.viewedClues)} PTS
                </div>
              )}
              {!progress?.correct && (
                <div className="inline-flex items-center gap-2 bg-red-500/15 border border-red-400/25 text-red-200 px-4 py-2 rounded-lg text-xs font-mono font-semibold mt-3">
                  +0 PTS
                </div>
              )}

              {nextDay && (
                <Link
                  href={`/dashboard/secret-agent/${nextDay}`}
                  className="block mt-4 bg-emerald-600 hover:bg-emerald-500 text-black font-mono font-bold text-sm py-3 rounded-lg active:scale-[0.98] transition-all"
                >
                  {lang === 'ml' ? 'അടുത്ത ദൗത്യം →' : 'NEXT MISSION →'}
                </Link>
              )}
              {!nextDay && (
                <Link
                  href="/dashboard/secret-agent"
                  className="block mt-4 bg-emerald-600 hover:bg-emerald-500 text-black font-mono font-bold text-sm py-3 rounded-lg active:scale-[0.98] transition-all"
                >
                  {lang === 'ml' ? 'ദൗത്യ കേന്ദ്രം →' : 'MISSION HQ →'}
                </Link>
              )}
              {isDev && (
                <button
                  onClick={() => { setEditing(true); setAnswer(progress?.answer ?? ''); }}
                  className="block mt-2 w-full bg-amber-600 hover:bg-amber-500 text-black font-mono font-bold text-sm py-3 rounded-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Pencil size={14} /> EDIT ANSWER (DEV)
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
