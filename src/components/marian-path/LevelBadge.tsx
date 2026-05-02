'use client';

import { LEVEL_COLORS, LEVEL_NAMES } from '@/lib/marian-path-db';

interface LevelBadgeProps {
  level: number;
  showName?: boolean;
  size?: 'sm' | 'md';
}

export default function LevelBadge({ level, showName = false, size = 'md' }: LevelBadgeProps) {
  const color = LEVEL_COLORS[level] ?? '#6B21C8';
  const name = LEVEL_NAMES[level] ?? '';

  return (
    <span
      className="sg-pill convex inline-flex items-center gap-1.5 font-cinzel font-semibold"
      style={{
        padding: size === 'sm' ? '4px 10px' : '5px 13px',
        fontSize: size === 'sm' ? 10 : 12,
        color: 'oklch(0.38 0.14 270)',
        letterSpacing: '0.07em',
      }}
    >
      <span
        className="inline-block rounded-full flex-shrink-0"
        style={{
          width: 6, height: 6,
          background: color,
          boxShadow: `0 0 6px ${color}`,
        }}
      />
      Level {level}
      {showName && <span style={{ opacity: 0.6 }}> · {name}</span>}
    </span>
  );
}
