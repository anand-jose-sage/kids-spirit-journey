'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft, RefreshCw } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';

type CardDef = { emoji: string; labelEn: string; labelMl: string };

const CARD_THEMES: Record<string, CardDef[]> = {
  thomas: [
    { emoji: '👆', labelEn: 'Thomas Points',  labelMl: 'തോമസ് ചൂണ്ടുന്നു' },
    { emoji: '✋', labelEn: "Jesus' Wounds",   labelMl: 'ഈശോയുടെ മുറിവ്' },
    { emoji: '✝️', labelEn: 'The Cross',       labelMl: 'കുരിശ്' },
    { emoji: '🕊️', labelEn: 'Peace',           labelMl: 'സമാധാനം' },
    { emoji: '📖', labelEn: 'Scripture',       labelMl: 'വചനം' },
    { emoji: '🙏', labelEn: 'Believe!',        labelMl: 'വിശ്വസിക്കൂ!' },
    { emoji: '❤️', labelEn: "God's Love",      labelMl: 'ദൈവ സ്നേഹം' },
    { emoji: '🌟', labelEn: 'My Lord & God!',  labelMl: 'എന്റെ കർത്താവ്!' },
  ],
};

type Card = {
  id: number;
  pairId: number;
  emoji: string;
  labelEn: string;
  labelMl: string;
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck(defs: CardDef[]): Card[] {
  const pairs = defs.flatMap((def, pairId) => [
    { id: pairId * 2,     pairId, ...def },
    { id: pairId * 2 + 1, pairId, ...def },
  ]);
  return shuffle(pairs);
}

function MemoryContent() {
  const params = useSearchParams();
  const { lang } = useLang();

  const theme    = params.get('theme')   || 'thomas';
  const titleEn  = params.get('titleEn') || 'Thomas Match';
  const titleMl  = params.get('titleMl') || 'തോമസ് മ്യാച്ച്';

  const defs = CARD_THEMES[theme] ?? CARD_THEMES.thomas;

  const [deck,    setDeck]    = useState<Card[]>(() => buildDeck(defs));
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [locked,  setLocked]  = useState(false);
  const [moves,   setMoves]   = useState(0);

  const solved = matched.size === defs.length;
  const title  = lang === 'ml' ? titleMl : titleEn;

  function reset() {
    setDeck(buildDeck(defs));
    setFlipped([]);
    setMatched(new Set());
    setLocked(false);
    setMoves(0);
  }

  function handleCardTap(card: Card) {
    if (locked)                   return;
    if (matched.has(card.pairId)) return;
    if (flipped.includes(card.id)) return;
    if (flipped.length === 2)     return;

    const newFlipped = [...flipped, card.id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [idA, idB] = newFlipped;
      const cardA = deck.find((c) => c.id === idA)!;
      const cardB = deck.find((c) => c.id === idB)!;

      if (cardA.pairId === cardB.pairId) {
        setMatched((prev) => new Set([...prev, cardA.pairId]));
        setFlipped([]);
      } else {
        setLocked(true);
        setTimeout(() => {
          setFlipped([]);
          setLocked(false);
        }, 900);
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-sky-600 to-blue-700 px-5 pt-12 pb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="bg-white/20 text-white p-2 rounded-xl hover:bg-white/30 transition-colors"
          >
            <ChevronLeft size={22} />
          </Link>
          <div className="flex-1">
            <h1 className="text-white text-xl font-bold">{title}</h1>
            <p className="text-sky-200 text-xs">
              {lang === 'ml'
                ? `${matched.size}/${defs.length} ജോഡി · ${moves} ചലനങ്ങൾ`
                : `${matched.size}/${defs.length} pairs · ${moves} moves`}
            </p>
          </div>
          <button
            onClick={reset}
            className="bg-white/20 text-white p-2 rounded-xl hover:bg-white/30 transition-colors"
            aria-label="Reset game"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Solved banner */}
        {solved && (
          <div className="bg-gradient-to-r from-sky-400 to-blue-400 rounded-3xl p-5 text-center">
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="text-white text-xl font-bold">
              {lang === 'ml' ? 'എല്ലാ ജോഡിയും കണ്ടെത്തി!' : 'All pairs matched!'}
            </h3>
            <p className="text-sky-100 text-sm mt-1">
              {lang === 'ml'
                ? `${moves} ചലനങ്ങളിൽ! 🌟`
                : `Completed in ${moves} moves! 🌟`}
            </p>
            <div className="flex gap-3 justify-center mt-3">
              <button
                onClick={reset}
                className="bg-white/30 text-white font-bold text-sm px-4 py-2 rounded-xl"
              >
                {lang === 'ml' ? 'വീണ്ടും' : 'Play Again'}
              </button>
              <Link
                href="/dashboard"
                className="bg-white text-blue-500 font-bold text-sm px-4 py-2 rounded-xl"
              >
                {lang === 'ml' ? 'തിരിച്ചു →' : 'Back to Journey →'}
              </Link>
            </div>
          </div>
        )}

        {/* Card grid */}
        <div className="grid grid-cols-4 gap-2.5">
          {deck.map((card) => {
            const faceUp  = flipped.includes(card.id) || matched.has(card.pairId);
            const isMatch = matched.has(card.pairId);

            return (
              <button
                key={card.id}
                onClick={() => handleCardTap(card)}
                className={[
                  'aspect-square rounded-2xl flex flex-col items-center justify-center',
                  'transition-all duration-300 select-none',
                  isMatch
                    ? 'bg-green-100 border-2 border-green-400 scale-95'
                    : faceUp
                    ? 'bg-white border-2 border-sky-300 shadow-md'
                    : 'bg-gradient-to-br from-sky-500 to-blue-600 border-2 border-sky-400 active:scale-95',
                ].join(' ')}
              >
                {faceUp ? (
                  <>
                    <span className="text-2xl leading-none">{card.emoji}</span>
                    <span
                      className={[
                        'text-[9px] font-semibold mt-1 text-center px-1 leading-tight',
                        isMatch ? 'text-green-600' : 'text-gray-500',
                      ].join(' ')}
                    >
                      {lang === 'ml' ? card.labelMl : card.labelEn}
                    </span>
                  </>
                ) : (
                  <span className="text-2xl leading-none">✝️</span>
                )}
              </button>
            );
          })}
        </div>

        <p className="text-center text-xs text-sky-500 font-medium">
          {lang === 'ml'
            ? '👆 കാർഡ് ടാപ്പ് ചെയ്ത് ജോഡി കണ്ടെത്തൂ'
            : '👆 Tap cards to find matching pairs'}
        </p>
      </div>
    </div>
  );
}

export default function MemoryPage() {
  return (
    <Suspense>
      <MemoryContent />
    </Suspense>
  );
}
