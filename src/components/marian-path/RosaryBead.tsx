'use client';

import clsx from 'clsx';

export type BeadState = 'locked' | 'available' | 'current' | 'completed';

interface RosaryBeadProps {
  day: number;
  state: BeadState;
  isLarge?: boolean;
  onClick?: () => void;
}

export default function RosaryBead({ day, state, isLarge = false, onClick }: RosaryBeadProps) {
  const size = isLarge ? 'w-10 h-10 text-xs' : 'w-7 h-7 text-[10px]';

  const styleMap: Record<BeadState, React.CSSProperties> = {
    locked: {
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
    },
    available: {
      background: 'rgba(56,189,248,0.06)',
      border: '1px solid rgba(56,189,248,0.25)',
    },
    current: {
      background: 'rgba(56,189,248,0.12)',
      border: '2px solid #38BDF8',
      boxShadow: '0 0 12px rgba(56,189,248,0.45), 0 0 4px rgba(56,189,248,0.25)',
      animation: 'glow-pulse 2s ease-in-out infinite',
    },
    completed: {
      background: '#F59E0B',
      border: 'none',
      boxShadow: '0 0 8px rgba(245,158,11,0.60)',
    },
  };

  return (
    <button
      onClick={state !== 'locked' ? onClick : undefined}
      disabled={state === 'locked'}
      className={clsx(
        'relative rounded-full flex items-center justify-center flex-shrink-0 font-cinzel font-semibold transition-all duration-300',
        size,
        {
          'opacity-30 cursor-not-allowed': state === 'locked',
          'text-sky-400 cursor-pointer hover:border-sky-300': state === 'available',
          'text-sky-300 cursor-pointer': state === 'current',
          'text-[#050B1A] cursor-pointer': state === 'completed',
        }
      )}
      style={styleMap[state]}
      aria-label={`Day ${day}`}
    >
      {day}
    </button>
  );
}
