'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, RefreshCw } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';
import BottomNav from '@/components/BottomNav';

const COLS = 9;
const ROWS = 11;
const N = 1, S = 2, E = 4, W = 8;
const START_COL = Math.floor(COLS / 2);
const END_COL = Math.floor(COLS / 2);
const END_ROW = ROWS - 1;

function cellIdx(c: number, r: number) { return r * COLS + c; }

function shuffleArr<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateMaze(): number[] {
  const walls = new Array(COLS * ROWS).fill(N | S | E | W);
  const visited = new Array(COLS * ROWS).fill(false);

  function dfs(c: number, r: number) {
    visited[cellIdx(c, r)] = true;
    const dirs = shuffleArr([
      { dc: 0, dr: -1, from: N, to: S },
      { dc: 0, dr: 1,  from: S, to: N },
      { dc: 1, dr: 0,  from: E, to: W },
      { dc: -1, dr: 0, from: W, to: E },
    ]);
    for (const { dc, dr, from, to } of dirs) {
      const nc = c + dc, nr = r + dr;
      if (nc < 0 || nc >= COLS || nr < 0 || nr >= ROWS) continue;
      if (visited[cellIdx(nc, nr)]) continue;
      walls[cellIdx(c, r)] &= ~from;
      walls[cellIdx(nc, nr)] &= ~to;
      dfs(nc, nr);
    }
  }

  dfs(START_COL, 0);
  walls[cellIdx(START_COL, 0)] &= ~N;       // entrance at top
  walls[cellIdx(END_COL, END_ROW)] &= ~S;   // exit at bottom
  return walls;
}

type GameState = {
  pos: { c: number; r: number };
  trace: boolean[];   // cells the player has passed through
  solved: boolean;
};

function initState(): GameState {
  const trace = new Array(COLS * ROWS).fill(false);
  trace[cellIdx(START_COL, 0)] = true;
  return { pos: { c: START_COL, r: 0 }, trace, solved: false };
}

export default function MazePage() {
  const { lang } = useLang();
  const [walls, setWalls] = useState<number[]>(generateMaze);
  const [game, setGame] = useState<GameState>(initState);
  const gridRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  function reset() {
    setWalls(generateMaze());
    setGame(initState());
  }

  /** Convert a pointer position to a grid cell, or null if outside. */
  function cellAt(clientX: number, clientY: number): { c: number; r: number } | null {
    const el = gridRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const c = Math.floor(((clientX - rect.left) / rect.width) * COLS);
    const r = Math.floor(((clientY - rect.top) / rect.height) * ROWS);
    if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return null;
    return { c, r };
  }

  /** Try to move to (targetC, targetR). Only succeeds if it's an adjacent open cell. */
  function tryMoveTo(targetC: number, targetR: number, currentWalls: number[]) {
    setGame((g) => {
      if (g.solved) return g;
      const { c, r } = g.pos;
      const dc = targetC - c;
      const dr = targetR - r;
      // Must be exactly one step away
      if (Math.abs(dc) + Math.abs(dr) !== 1) return g;

      const wall = currentWalls[cellIdx(c, r)];
      const canMove =
        (dc === 1  && !(wall & E)) ||
        (dc === -1 && !(wall & W)) ||
        (dr === 1  && !(wall & S)) ||
        (dr === -1 && !(wall & N));

      // Walked out the exit at the bottom
      if (dr === 1 && targetR === ROWS) {
        return { ...g, pos: { c, r: END_ROW }, solved: true };
      }

      if (!canMove) return g;

      const newTrace = [...g.trace];
      newTrace[cellIdx(targetC, targetR)] = true;
      return { pos: { c: targetC, r: targetR }, trace: newTrace, solved: false };
    });
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    dragging.current = true;
    // Capture so pointermove keeps firing even if pointer leaves the element
    e.currentTarget.setPointerCapture(e.pointerId);
    const cell = cellAt(e.clientX, e.clientY);
    if (cell) tryMoveTo(cell.c, cell.r, walls);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;
    const cell = cellAt(e.clientX, e.clientY);
    if (cell) tryMoveTo(cell.c, cell.r, walls);
  }

  function onPointerUp() {
    dragging.current = false;
  }

  const { pos, trace, solved } = game;
  const WALL = '2px solid #92400e';
  const OPEN = '2px solid transparent';

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 pb-nav">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-600 to-orange-700 px-5 pt-12 pb-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="bg-white/20 text-white p-2 rounded-xl hover:bg-white/30 transition-colors">
            <ChevronLeft size={22} />
          </Link>
          <div className="flex-1">
            <h1 className="text-white text-xl font-bold">
              {lang === 'ml' ? 'എമ്മാവൂസ് പാത' : 'Way to Emmaus'}
            </h1>
            <p className="text-amber-200 text-xs">
              {lang === 'ml' ? 'ഈശോയെ ഡ്രാഗ് ചെയ്ത് നയിക്കൂ' : 'Drag Jesus through the maze to Emmaus'}
            </p>
          </div>
          <button
            onClick={reset}
            className="bg-white/20 text-white p-2 rounded-xl hover:bg-white/30 transition-colors"
            aria-label="New maze"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {/* Solved banner */}
        {solved && (
          <div className="bg-gradient-to-r from-amber-400 to-orange-400 rounded-3xl p-5 text-center">
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="text-white text-xl font-bold">
              {lang === 'ml' ? 'എമ്മാവൂസിൽ എത്തി!' : 'Reached Emmaus!'}
            </h3>
            <p className="text-amber-100 text-sm mt-1">
              {lang === 'ml'
                ? 'ഈശോ വഴി മുഴുവൻ ഒപ്പം നടന്നു! 🔥'
                : 'Jesus walked with them all the way! 🔥'}
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
                className="bg-white text-orange-500 font-bold text-sm px-4 py-2 rounded-xl"
              >
                {lang === 'ml' ? 'തിരിച്ചു →' : 'Back to Journey →'}
              </Link>
            </div>
          </div>
        )}

        {/* Start label */}
        <p className="text-center text-xs font-semibold text-amber-700">
          🚶‍♂️🚶‍♀️{' '}
          {lang === 'ml'
            ? 'ഈശോയും ശിഷ്യരും — ഇവിടെ തുടങ്ങൂ'
            : 'Jesus & Disciples — Start here'}
        </p>

        {/* Maze grid */}
        <div
          className="bg-white rounded-3xl shadow-sm border border-amber-200 overflow-hidden"
          style={{ touchAction: 'none', userSelect: 'none' }}
        >
          <div
            ref={gridRef}
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${COLS}, 1fr)`,
              cursor: 'crosshair',
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {Array.from({ length: COLS * ROWS }, (_, i) => {
              const c = i % COLS;
              const r = Math.floor(i / COLS);
              const wall = walls[i];
              const isPlayer = pos.c === c && pos.r === r;
              const isEnd = c === END_COL && r === END_ROW;
              const isTrace = trace[i] && !isPlayer;

              return (
                <div
                  key={i}
                  style={{
                    aspectRatio: '1',
                    boxSizing: 'border-box',
                    borderTop:    wall & N ? WALL : OPEN,
                    borderBottom: wall & S ? WALL : OPEN,
                    borderLeft:   wall & W ? WALL : OPEN,
                    borderRight:  wall & E ? WALL : OPEN,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    // Player = amber highlight, end = green, trace = soft amber glow, rest = white
                    backgroundColor: isPlayer
                      ? '#fbbf24'          // amber-400
                      : isEnd
                      ? '#d1fae5'          // emerald-100
                      : isTrace
                      ? 'rgba(251,191,36,0.22)'  // light amber trail
                      : 'white',
                    fontSize: isPlayer || isEnd ? '1rem' : '0',
                    pointerEvents: 'none',
                  }}
                >
                  {isPlayer ? '🚶' : isEnd ? '⛪' : null}
                </div>
              );
            })}
          </div>
        </div>

        {/* End label */}
        <p className="text-center text-xs font-semibold text-green-700">
          ⛪{' '}
          {lang === 'ml' ? 'എമ്മാവൂസ് — ഇവിടെ എത്തൂ' : 'Emmaus — Reach here'}
        </p>

        <p className="text-center text-xs text-amber-500 font-medium">
          {lang === 'ml'
            ? '👆 ഈശോയെ ഡ്രാഗ് ചെയ്ത് വഴി കണ്ടെത്തൂ'
            : '👆 Press and drag to find the path'}
        </p>
      </div>
      <BottomNav />
    </div>
  );
}
