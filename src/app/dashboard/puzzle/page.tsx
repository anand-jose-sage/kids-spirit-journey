'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';
import { useLang } from '@/contexts/LanguageContext';

const COLS = 3;
const ROWS = 4;
const TOTAL = COLS * ROWS;
const DEFAULT_IMAGE = '/images/risen-christ.jpg';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Selection =
  | { kind: 'tray'; piece: number }
  | { kind: 'grid'; slot: number; piece: number };

function pieceStyle(piece: number, image: string) {
  const pCol = piece % COLS;
  const pRow = Math.floor(piece / COLS);
  return {
    backgroundImage: `url(${image})`,
    backgroundSize: `${COLS * 100}% ${ROWS * 100}%`,
    backgroundPosition: `${(pCol / (COLS - 1)) * 100}% ${(pRow / (ROWS - 1)) * 100}%`,
  };
}

export default function PuzzlePage() {
  const params = useSearchParams();
  const { lang } = useLang();
  const IMAGE = params.get('image') || DEFAULT_IMAGE;
  const titleEn = params.get('titleEn') || 'Risen Christ Puzzle';
  const titleMl = params.get('titleMl') || 'ഉയിർത്ത ക്രിസ്തു പസൽ';
  const solvedTextEn = params.get('solvedTextEn') || 'He is Risen! Alleluia! 🌅';
  const solvedTextMl = params.get('solvedTextMl') || 'അവൻ ഉയിർത്തെഴുന്നേറ്റു! അല്ലേലൂയ! 🌅';
  const title = lang === 'ml' ? titleMl : titleEn;
  const solvedText = lang === 'ml' ? solvedTextMl : solvedTextEn;

  const [tray, setTray] = useState<number[]>(() =>
    shuffle(Array.from({ length: TOTAL }, (_, i) => i))
  );
  const [grid, setGrid] = useState<(number | null)[]>(Array(TOTAL).fill(null));
  const [selected, setSelected] = useState<Selection | null>(null);

  const solved = grid.every((v, i) => v === i);
  const placedCount = grid.filter((v) => v !== null).length;

  function reset() {
    setTray(shuffle(Array.from({ length: TOTAL }, (_, i) => i)));
    setGrid(Array(TOTAL).fill(null));
    setSelected(null);
  }

  function handleTrayPiece(piece: number) {
    if (selected?.kind === 'tray' && selected.piece === piece) {
      setSelected(null);
      return;
    }
    setSelected({ kind: 'tray', piece });
  }

  function handleGridSlot(slot: number) {
    const currentPiece = grid[slot];

    if (!selected) {
      if (currentPiece !== null) {
        setSelected({ kind: 'grid', slot, piece: currentPiece });
      }
      return;
    }

    const newGrid = [...grid];
    const newTray = [...tray];

    if (selected.kind === 'tray') {
      const idx = newTray.indexOf(selected.piece);
      if (idx !== -1) newTray.splice(idx, 1);
      if (currentPiece !== null) newTray.push(currentPiece);
      newGrid[slot] = selected.piece;
    } else {
      // grid → grid swap
      newGrid[selected.slot] = currentPiece;
      newGrid[slot] = selected.piece;
    }

    setGrid(newGrid);
    setTray(newTray);
    setSelected(null);
  }

  function handleGridPieceClick(slot: number, piece: number) {
    if (selected) {
      handleGridSlot(slot);
    } else {
      setSelected({ kind: 'grid', slot, piece });
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-700 px-5 pt-12 pb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="bg-white/20 text-white p-2 rounded-xl hover:bg-white/30 transition-colors"
          >
            <ChevronLeft size={22} />
          </Link>
          <div className="flex-1">
            <h1 className="text-white text-xl font-bold">{title}</h1>
            <p className="text-purple-200 text-xs">
              {placedCount}/{TOTAL} pieces placed
            </p>
          </div>
          <button
            onClick={reset}
            className="bg-white/20 text-white p-2 rounded-xl hover:bg-white/30 transition-colors"
            aria-label="Reset puzzle"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      <div className="px-4 py-5 space-y-4">
        {/* Solved banner */}
        {solved && (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-3xl p-5 text-center">
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="text-white text-xl font-bold">Puzzle Complete!</h3>
            <p className="text-yellow-100 text-sm mt-1">{solvedText}</p>
            <div className="flex gap-3 justify-center mt-3">
              <button
                onClick={reset}
                className="bg-white/30 text-white font-bold text-sm px-4 py-2 rounded-xl"
              >
                Play Again
              </button>
              <Link
                href="/dashboard"
                className="bg-white text-orange-500 font-bold text-sm px-4 py-2 rounded-xl"
              >
                Back to Journey →
              </Link>
            </div>
          </div>
        )}

        {/* Hint */}
        <p className="text-center text-xs text-gray-500 font-medium">
          {selected
            ? '✨ Tap a grid square to place the piece'
            : 'Tap a piece below, then tap a square above'}
        </p>

        {/* Grid */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-purple-50">
          {solved ? (
            /* Seamless full image when solved */
            <div
              className="mx-auto rounded-2xl overflow-hidden transition-all duration-500"
              style={{ maxWidth: 380, aspectRatio: `${COLS}/${ROWS}` }}
            >
              <img
                src={IMAGE}
                alt="Risen Christ"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div
              className="grid gap-1 mx-auto"
              style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, maxWidth: 380 }}
            >
              {Array.from({ length: TOTAL }, (_, slot) => {
                const piece = grid[slot];
                const isCorrect = piece === slot;
                const isSelected = selected?.kind === 'grid' && selected.slot === slot;

                return (
                  <div
                    key={slot}
                    onClick={() =>
                      piece !== null
                        ? handleGridPieceClick(slot, piece)
                        : handleGridSlot(slot)
                    }
                    className={clsx(
                      'aspect-square rounded overflow-hidden border-2 cursor-pointer transition-all select-none',
                      isSelected && 'ring-2 ring-yellow-400 ring-offset-1 scale-105',
                      piece !== null
                        ? isCorrect
                          ? 'border-green-400'
                          : 'border-purple-200'
                        : selected
                        ? 'border-dashed border-purple-400 bg-purple-50'
                        : 'border-dashed border-gray-200 bg-gray-50'
                    )}
                  >
                    {piece !== null && (
                      <div className="w-full h-full" style={pieceStyle(piece, IMAGE)} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tray */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-purple-50">
          <p className="text-xs text-gray-500 text-center mb-3 font-medium">
            {tray.length > 0 ? 'Pieces — tap one to pick it up' : '✅ All pieces placed!'}
          </p>
          <div className="flex flex-wrap gap-2 justify-center min-h-[4rem]">
            {tray.map((piece) => {
              const isSelected = selected?.kind === 'tray' && selected.piece === piece;
              return (
                <div
                  key={piece}
                  onClick={() => handleTrayPiece(piece)}
                  className={clsx(
                    'w-16 h-16 rounded-xl border-2 cursor-pointer transition-all select-none shadow-sm',
                    isSelected
                      ? 'border-yellow-400 ring-2 ring-yellow-300 ring-offset-1 scale-110 shadow-md'
                      : 'border-purple-200 hover:border-purple-400 active:scale-95'
                  )}
                  style={pieceStyle(piece, IMAGE)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
