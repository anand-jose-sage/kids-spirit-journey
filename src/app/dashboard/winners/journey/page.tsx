'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import BottomNav from '@/components/BottomNav';
import { getWinners, Winner } from '@/lib/database';
import { useLang } from '@/contexts/LanguageContext';
import { Trophy, Star, MapPin, BookOpen, ChevronLeft } from 'lucide-react';

// Per-rank card gradients, ribbon, text colors
const RANK_CARD = [
  { card: 'from-yellow-400 via-amber-400 to-orange-400', ribbon: 'from-yellow-500 to-amber-600', text: 'text-yellow-900', sub: 'text-yellow-800/80', divider: 'border-yellow-300/50', answerText: 'text-yellow-900/80' },
  { card: 'from-slate-400 via-slate-300 to-blue-300',    ribbon: 'from-slate-500 to-slate-600',  text: 'text-slate-900',  sub: 'text-slate-700/80',  divider: 'border-slate-300/50',  answerText: 'text-slate-800/80'  },
  { card: 'from-orange-500 via-amber-400 to-yellow-300', ribbon: 'from-orange-600 to-red-500',   text: 'text-orange-900', sub: 'text-orange-800/80', divider: 'border-orange-300/50', answerText: 'text-orange-900/80' },
];
const DEFAULT_CARD = { card: 'from-violet-500 via-purple-400 to-indigo-400', ribbon: 'from-violet-600 to-indigo-600', text: 'text-white', sub: 'text-white/80', divider: 'border-white/20', answerText: 'text-white/90' };

const MEDAL_ICONS = ['🥇', '🥈', '🥉'];

export default function WinnersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { lang } = useLang();
  const [winners, setWinners] = useState<Winner[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    getWinners().then((data) => {
      setWinners(data);
      setFetching(false);
    });
  }, [user]);

  if (loading || fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-violet-900 to-amber-900">
        <div className="text-center">
          <div className="text-5xl mb-3 animate-bounce">🏆</div>
          <p className="text-amber-300 font-semibold">
            {lang === 'ml' ? 'വിജയികളെ ലോഡ് ചെയ്യുന്നു...' : 'Loading winners...'}
          </p>
        </div>
      </div>
    );
  }

  const byDay = winners.reduce<Record<number, Winner[]>>((acc, w) => {
    if (!acc[w.day]) acc[w.day] = [];
    acc[w.day].push(w);
    return acc;
  }, {});

  const days = Object.keys(byDay).map(Number).sort((a, b) => b - a);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 pb-nav">
      {/* Header */}
      <div className="bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 px-5 pt-12 pb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-56 h-56 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-orange-600/20 rounded-full translate-y-1/2 -translate-x-1/4" />
        <div className="absolute top-6 right-16 w-20 h-20 bg-white/5 rounded-full" />
        <div className="relative">
          <Link href="/dashboard/winners" className="flex items-center gap-1 text-white/70 text-xs font-semibold mb-3 hover:text-white transition-colors">
            <ChevronLeft size={14} /> {lang === 'ml' ? '← തിരികെ' : '← Back'}
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-13 h-13 bg-white/25 rounded-2xl flex items-center justify-center p-2.5 shadow-lg">
              <Trophy size={28} className="text-white drop-shadow" />
            </div>
            <div>
              <h1 className="text-white text-2xl font-extrabold drop-shadow">
                {lang === 'ml' ? 'ശിലോഹ ആത്മീയ യാത്ര വിജയികൾ 🏆' : 'Spiritual Journey Winners 🏆'}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="px-2 py-6">
        {days.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🌟</div>
            <p className="text-gray-500 font-medium">
              {lang === 'ml' ? 'ഇതുവരെ വിജയികൾ ഇല്ല' : 'No winners announced yet'}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {lang === 'ml' ? 'ഉടൻ വരും!' : 'Stay tuned!'}
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-6 top-3 bottom-3 w-0.5 bg-gradient-to-b from-yellow-400 via-amber-400 to-violet-500 rounded-full opacity-60" />

            <div className="space-y-6">
              {days.map((day, i) => {
                const dayWinners = byDay[day];
                return (
                  <div
                    key={day}
                    className="relative flex gap-2 animate-reveal-block"
                    style={{ animationDelay: `${i * 120}ms` }}
                  >
                    {/* Timeline node */}
                    <div className="relative z-10 flex-shrink-0">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-500 to-orange-600 flex items-center justify-center shadow-xl shadow-amber-900/50 border-2 border-yellow-300/40">
                        <span className="text-white font-extrabold text-base drop-shadow">{day}</span>
                      </div>
                    </div>

                    {/* Day block */}
                    <div className="flex-1 min-w-0 bg-gradient-to-br from-amber-100 via-yellow-100 to-orange-100 border border-amber-300 rounded-3xl p-4 shadow-md">
                      <p className="text-xs font-extrabold text-red-800 uppercase tracking-widest mb-3">
                        {lang === 'ml' ? `✦ ദിവസം ${day}` : `✦ Day ${day}`}
                      </p>

                      <div className="space-y-3">
                        {dayWinners.map((winner, idx) => {
                          const rank = RANK_CARD[idx] ?? DEFAULT_CARD;
                          return (
                            <div
                              key={winner.id}
                              className={`relative bg-gradient-to-br ${rank.card} rounded-2xl p-4 shadow-lg overflow-hidden`}
                            >
                              {/* Decorative glow blob */}
                              <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />

                              {/* Rank ribbon */}
                              {idx < 3 && (
                                <div className={`absolute top-0 right-0 bg-gradient-to-bl ${rank.ribbon} text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl shadow`}>
                                  {MEDAL_ICONS[idx]}
                                </div>
                              )}

                              <div className="relative pr-10">
                                <div className="flex items-center gap-1.5 mb-1">
                                  {idx < 3 && (
                                    <Star size={13} className="text-white/90 flex-shrink-0" fill="currentColor" />
                                  )}
                                  <p className="font-extrabold text-base truncate text-red-800">{winner.name}</p>
                                </div>

                                <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                                  <div className="flex items-center gap-1">
                                    <MapPin size={12} className="text-red-800 flex-shrink-0" />
                                    <span className="text-sm truncate text-red-800">{winner.parish}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <BookOpen size={12} className="text-red-800 flex-shrink-0" />
                                    <span className="text-sm text-red-800">
                                      <span className="font-semibold">
                                        {lang === 'ml' ? 'മേഖല:' : 'Meghala:'}
                                      </span>{' '}
                                      {winner.standard}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {(lang === 'ml' ? winner.answerMl : winner.answer) && (
                                <>
                                  <div className={`border-t ${rank.divider} my-3`} />
                                  <div className="flex items-start gap-2">
                                    <span className="flex-shrink-0 bg-white/25 text-green-900 text-xs font-bold px-2 py-0.5 rounded-full border border-white/30">
                                      {lang === 'ml' ? 'ഉത്തരം' : 'Answer'}
                                    </span>
                                    <p className="text-sm leading-relaxed text-green-100 font-medium drop-shadow-sm">
                                      {lang === 'ml' ? winner.answerMl : winner.answer}
                                    </p>
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
