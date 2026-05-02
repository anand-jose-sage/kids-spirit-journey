'use client';

interface StatsRowProps {
  totalScore: number;
  streakDays: number;
  rank: number;
}

const PILLS = [
  { key: 'score',  label: 'Score',  icon: '✦', accent: 'oklch(0.52 0.22 280)' },
  { key: 'streak', label: 'Streak', icon: '🔥', accent: 'oklch(0.55 0.22 55)'  },
  { key: 'rank',   label: 'Rank',   icon: '👑', accent: 'oklch(0.52 0.16 310)' },
] as const;

export default function StatsRow({ totalScore, streakDays, rank }: StatsRowProps) {
  const values: Record<string, string | number> = {
    score:  totalScore,
    streak: `${streakDays}D`,
    rank:   `#${rank}`,
  };

  return (
    <div className="flex items-stretch gap-2.5">
      {PILLS.map(({ key, label, icon, accent }) => (
        <div
          key={key}
          className="sg-card sg-noise flex-1 flex flex-col items-center gap-1 py-4 px-2"
        >
          <span
            className="font-cinzel font-bold leading-none"
            style={{ fontSize: 9, letterSpacing: '0.15em', color: 'oklch(0.52 0.08 270)', textTransform: 'uppercase' }}
          >
            {label}
          </span>
          <span
            className="font-display font-bold leading-none"
            style={{ fontSize: 34, color: accent }}
          >
            {values[key]}
          </span>
          <span className="text-base leading-none">{icon}</span>
        </div>
      ))}
    </div>
  );
}
