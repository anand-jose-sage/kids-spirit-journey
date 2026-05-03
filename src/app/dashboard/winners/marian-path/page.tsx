'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import BottomNav from '@/components/BottomNav';
import { getMarianLeaderboardPaged, MarianLeaderboardEntry } from '@/lib/marian-path-db';
import { useLang } from '@/contexts/LanguageContext';
import { ChevronLeft, Star } from 'lucide-react';

const PAGE_SIZE = 20;

export default function MarianPathScoreboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { lang } = useLang();
  const [entries, setEntries] = useState<MarianLeaderboardEntry[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [fetching, setFetching] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    getMarianLeaderboardPaged(0, PAGE_SIZE).then((data) => {
      setEntries(data.entries);
      setTotal(data.total);
      setHasMore(data.hasMore);
      setPage(1);
      setFetching(false);
    });
  }, [user]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const data = await getMarianLeaderboardPaged(page, PAGE_SIZE);
    setEntries((prev) => [...prev, ...data.entries]);
    setHasMore(data.hasMore);
    setPage((p) => p + 1);
    setLoadingMore(false);
  }, [page, hasMore, loadingMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { rootMargin: '200px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  if (loading || fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-rose-900">
        <div className="text-center">
          <div className="text-5xl mb-3 animate-bounce">📿</div>
          <p className="text-rose-300 font-semibold">
            {lang === 'ml' ? 'സ്കോർബോർഡ് ലോഡ് ചെയ്യുന്നു...' : 'Loading scoreboard...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 pb-nav">
      {/* Header */}
      <div className="bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600 px-5 pt-12 pb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-56 h-56 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-purple-600/20 rounded-full translate-y-1/2 -translate-x-1/4" />
        <div className="relative">
          <Link href="/dashboard/winners" className="flex items-center gap-1 text-white/70 text-xs font-semibold mb-3 hover:text-white transition-colors">
            <ChevronLeft size={14} /> {lang === 'ml' ? '← തിരികെ' : '← Back'}
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-13 h-13 bg-white/25 rounded-2xl flex items-center justify-center p-2.5 shadow-lg">
              <span className="text-2xl">📿</span>
            </div>
            <div>
              <h1 className="text-white text-2xl font-extrabold drop-shadow">
                {lang === 'ml' ? 'മരിയൻ പാത്ത് സ്കോർബോർഡ്' : 'Marian Path Scoreboard'}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-5">
        {entries.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📿</div>
            <p className="text-gray-500 font-medium">
              {lang === 'ml' ? 'ഇതുവരെ സ്കോർ ഇല്ല' : 'No scores yet'}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {lang === 'ml' ? 'മരിയൻ പാത്ത് പൂർത്തിയാക്കൂ!' : 'Complete Marian Path days to appear here!'}
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-rose-200">
              {/* Table header */}
              <div className="grid grid-cols-[2.5rem_1fr_4rem_4rem] bg-gradient-to-r from-rose-500 to-purple-600 text-white text-xs font-bold uppercase tracking-wider px-3 py-3">
                <span>#</span>
                <span>{lang === 'ml' ? 'പേര്' : 'Name'}</span>
                <span className="text-center">{lang === 'ml' ? 'ദിനങ്ങൾ' : 'Days'}</span>
                <span className="text-right">{lang === 'ml' ? 'സ്കോർ' : 'Score'}</span>
              </div>

              {/* Table rows */}
              <div className="divide-y divide-rose-100">
                {entries.map((entry, idx) => {
                  const isCurrentUser = entry.userId === user?.id;
                  return (
                    <div
                      key={entry.userId}
                      className={`grid grid-cols-[2.5rem_1fr_4rem_4rem] items-center px-3 py-3 ${
                        isCurrentUser ? 'bg-rose-50' : idx % 2 === 0 ? 'bg-white' : 'bg-purple-50/30'
                      }`}
                    >
                      <span className="text-sm font-bold text-gray-500">{idx + 1}</span>
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold break-words ${isCurrentUser ? 'text-rose-700' : 'text-gray-800'}`}>
                          {entry.name}
                          {isCurrentUser && <span className="text-rose-500 text-xs ml-1">(You)</span>}
                        </p>
                        {entry.parish ? (
                          <p className="text-xs text-gray-400 break-words">{entry.parish}</p>
                        ) : null}
                      </div>
                      <span className="text-xs text-gray-500 text-center">{entry.completedCount}/30</span>
                      <div className="flex items-center justify-end gap-1">
                        <Star size={12} className="text-rose-500" fill="currentColor" />
                        <span className="text-sm font-bold text-gray-700">{entry.totalScore}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div ref={sentinelRef} className="h-1" />

              {loadingMore && (
                <div className="text-center py-3">
                  <p className="text-rose-500 text-xs font-semibold animate-pulse">
                    {lang === 'ml' ? 'കൂടുതൽ ലോഡ് ചെയ്യുന്നു...' : 'Loading more...'}
                  </p>
                </div>
              )}
            </div>

            <p className="text-center text-gray-400 text-xs mt-3">
              {lang === 'ml' ? `ആകെ ${total} പേർ` : `${total} participants`}
            </p>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
