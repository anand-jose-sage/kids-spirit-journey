// Journey starts April 1 2026 — Day 1 unlocks on this date.
// Day N unlocks on April N.
export const JOURNEY_START = new Date('2026-04-01T00:00:00');

export function getUnlockDate(day: number): Date {
  const d = new Date(JOURNEY_START);
  d.setDate(d.getDate() + (day - 1));
  return d;
}

export function isDayUnlocked(day: number): boolean {
  if (process.env.NODE_ENV === 'development') return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const unlock = getUnlockDate(day);
  unlock.setHours(0, 0, 0, 0);
  return today >= unlock;
}

/** Which day number corresponds to today's calendar date. */
export function getTodayCalendarDay(): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(JOURNEY_START);
  start.setHours(0, 0, 0, 0);
  const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return diff + 1; // day 1 on April 1
}

// ── Secret Agent Game schedule ─────────────────────────────
// Mission 1 unlocks April 14 2026, one mission per day.
export const AGENT_START = new Date('2026-04-14T00:00:00');

// Jigsaw puzzle clue starts April 15 2026
export const PUZZLE_START = new Date('2026-04-15T00:00:00');

export function getAgentUnlockDate(day: number): Date {
  const d = new Date(AGENT_START);
  d.setDate(d.getDate() + (day - 1));
  return d;
}

export function isAgentDayUnlocked(day: number): boolean {
  if (process.env.NODE_ENV === 'development') return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const unlock = getAgentUnlockDate(day);
  unlock.setHours(0, 0, 0, 0);
  return today >= unlock;
}

/** Which agent mission day corresponds to today. */
export function getTodayAgentDay(): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(AGENT_START);
  start.setHours(0, 0, 0, 0);
  const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return diff + 1; // mission 1 on April 14
}

/** Whether the jigsaw puzzle clue is available yet (from April 15). */
export function isPuzzleUnlocked(): boolean {
  if (process.env.NODE_ENV === 'development') return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(PUZZLE_START);
  start.setHours(0, 0, 0, 0);
  return today >= start;
}
