// Journey starts April 1 2026 — Day 1 unlocks on this date.
// Day N unlocks on April N. Teaser days use negative/zero day numbers:
//   day -1 → March 30, day 0 → March 31, day 1 → April 1, etc.
export const JOURNEY_START = new Date('2026-04-01T00:00:00');

export function getUnlockDate(day: number): Date {
  const d = new Date(JOURNEY_START);
  d.setDate(d.getDate() + (day - 1));
  return d;
}

export function isDayUnlocked(day: number): boolean {
  if (day <= 0) return true; // teaser days are always accessible
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
