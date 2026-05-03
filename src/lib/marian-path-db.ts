import { supabase } from './supabase';

// Supabase migration needed:
// ALTER TABLE marian_path_progress ADD COLUMN IF NOT EXISTS text_score integer DEFAULT NULL;

export interface MarianProgress {
  day: number;
  score: number;
  completed: boolean;
  completedAt: string | null;
  textScore: number | null; // null = not attempted, 0 = wrong, 100 = correct
}

export interface MarianStats {
  totalScore: number;
  streakDays: number;
  rank: number;
  completedCount: number;
}

export interface MarianLeaderboardEntry {
  userId: string;
  name: string;
  parish: string;
  totalScore: number;
  completedCount: number;
}

export const LEVEL_COLORS: Record<number, string> = {
  1: '#FB923C',
  2: '#F59E0B',
  3: '#E11D48',
  4: '#FB7185',
  5: '#FFD700',
};

export const LEVEL_NAMES: Record<number, string> = {
  1: 'Knowing Mary',
  2: 'Biblical & Prophetic Mary',
  3: 'Titles & Papal Teachings',
  4: 'Apparitions & Devotions',
  5: 'Living Like Mary',
};

export function getLevelForDay(day: number): number {
  return Math.ceil(day / 6);
}

export interface MarianBadge {
  id: string;
  title: string;
  titleMl: string;
  emoji: string;
  description: string;
  descriptionMl: string;
  unlocked: boolean;
  category: 'streak' | 'score' | 'journey';
}

export const STREAK_MILESTONES = [3, 7, 15, 30];
export const SCORE_MILESTONES = [10, 80, 160, 300];

export function getMarianBadges(progress: MarianProgress[], streakDays: number): MarianBadge[] {
  const completedCount = progress.filter((p) => p.completed).length;
  const totalScore = progress.reduce((sum, p) => sum + (p.score ?? 0) + (p.textScore ?? 0), 0);

  return [
    // Streak
    { id: 'streak_3', category: 'streak', emoji: '🔥', title: 'Pilgrim', titleMl: 'തീർഥാടകൻ', description: '3-day streak', descriptionMl: '3 ദിവസം', unlocked: streakDays >= 3 },
    { id: 'streak_7', category: 'streak', emoji: '⚡', title: 'Guardian', titleMl: 'കാവൽക്കാരൻ', description: '7-day streak', descriptionMl: '7 ദിവസം', unlocked: streakDays >= 7 },
    { id: 'streak_15', category: 'streak', emoji: '💜', title: 'Faithful Heart', titleMl: 'വിശ്വസ്ത ഹൃദയം', description: '15-day streak', descriptionMl: '15 ദിവസം', unlocked: streakDays >= 15 },
    { id: 'streak_30', category: 'streak', emoji: '👑', title: "Mary's Champion", titleMl: 'മറിയത്തിൻ്റെ ജേതാവ്', description: '30-day streak', descriptionMl: '30 ദിവസം', unlocked: streakDays >= 30 },
    // Score
    { id: 'score_10', category: 'score', emoji: '🌱', title: 'First Light', titleMl: 'ആദ്യ വെളിച്ചം', description: '10 pts', descriptionMl: '10 പോയൻ്റ്', unlocked: totalScore >= 10 },
    { id: 'score_80', category: 'score', emoji: '🕯️', title: 'Lamp Bearer', titleMl: 'വിളക്കുവഹിക്കുന്നവൻ', description: '80 pts', descriptionMl: '80 പോയൻ്റ്', unlocked: totalScore >= 80 },
    { id: 'score_160', category: 'score', emoji: '📿', title: 'Rosary Bearer', titleMl: 'ജപമാലക്കാർ', description: '160 pts', descriptionMl: '160 പോയൻ്റ്', unlocked: totalScore >= 160 },
    { id: 'score_300', category: 'score', emoji: '🌟', title: "Queen's Servant", titleMl: 'രാജ്ഞിയുടെ ദാസൻ', description: '300 pts', descriptionMl: '300 പോയൻ്റ്', unlocked: totalScore >= 300 },
    // Journey
    { id: 'journey_1', category: 'journey', emoji: '🕊️', title: 'First Step', titleMl: 'ആദ്യ ചുവട്', description: 'Day 1 done', descriptionMl: 'ദിവസം 1', unlocked: completedCount >= 1 },
    { id: 'journey_10', category: 'journey', emoji: '🙏', title: 'Devoted Seeker', titleMl: 'ഭക്ത അന്വേഷി', description: '10 days', descriptionMl: '10 ദിവസം', unlocked: completedCount >= 10 },
    { id: 'journey_15', category: 'journey', emoji: '🦸', title: 'Halfway Hero', titleMl: 'പകുതി ജേതാവ്', description: '15 days', descriptionMl: '15 ദിവസം', unlocked: completedCount >= 15 },
    { id: 'journey_30', category: 'journey', emoji: '🏆', title: '30-Day Champion', titleMl: '30 ദിവസ ജേതാവ്', description: 'All 30 days!', descriptionMl: 'എല്ലാ 30 ദിവസം!', unlocked: completedCount >= 30 },
  ];
}

export async function getMarianProgress(userId: string): Promise<MarianProgress[]> {
  const { data, error } = await supabase
    .from('marian_path_progress')
    .select('day, score, completed, completed_at, text_score')
    .eq('user_id', userId)
    .order('day', { ascending: true });

  if (error || !data) return [];

  return data.map((row) => ({
    day: row.day as number,
    score: row.score as number,
    completed: row.completed as boolean,
    completedAt: row.completed_at as string | null,
    textScore: row.text_score as number | null,
  }));
}

export async function saveMarianQuizResult(
  userId: string,
  day: number,
  correct: boolean
): Promise<{ score: number }> {
  const score = day >= 3 && correct ? 10 : 0;

  const { error } = await supabase.from('marian_path_progress').upsert(
    {
      user_id: userId,
      day,
      score,
      completed: true,
      completed_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,day' }
  );

  if (error) throw error;
  return { score };
}

export async function saveMarianTextQuizResult(
  userId: string,
  day: number,
  correct: boolean
): Promise<{ score: number }> {
  const textScore = day >= 3 && correct ? 100 : 0;

  const { error } = await supabase.from('marian_path_progress').upsert(
    { user_id: userId, day, text_score: textScore },
    { onConflict: 'user_id,day' }
  );

  if (error) throw error;
  return { score: textScore };
}

export async function getMarianStats(userId: string): Promise<MarianStats> {
  const progress = await getMarianProgress(userId);

  const totalScore = progress.reduce((sum, p) => sum + (p.score ?? 0) + (p.textScore ?? 0), 0);
  const completedCount = progress.filter((p) => p.completed).length;

  // Streak: consecutive completed days ending at today's progress
  let streakDays = 0;
  const completedSet = new Set(progress.filter((p) => p.completed).map((p) => p.day));
  for (let d = completedCount; d >= 1; d--) {
    if (completedSet.has(d)) streakDays++;
    else break;
  }

  // Rank: count users with more total score
  const { count } = await supabase
    .from('marian_path_progress')
    .select('user_id', { count: 'exact', head: true })
    .neq('user_id', userId);

  const { data: betterUsers } = await supabase.rpc('marian_path_rank', {
    p_user_id: userId,
  });

  const rank = betterUsers !== null ? (betterUsers as number) + 1 : 1;

  return { totalScore, streakDays, rank, completedCount };
}

export async function getMarianLeaderboard(limit = 20): Promise<MarianLeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('marian_path_leaderboard')
    .select('user_id, name, parish, total_score, completed_count')
    .order('total_score', { ascending: false })
    .order('completed_count', { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((row) => ({
    userId: row.user_id as string,
    name: row.name as string,
    parish: row.parish as string,
    totalScore: row.total_score as number,
    completedCount: row.completed_count as number,
  }));
}

export async function getMarianLeaderboardPaged(
  page: number,
  pageSize: number
): Promise<{ entries: MarianLeaderboardEntry[]; total: number; hasMore: boolean }> {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from('marian_path_leaderboard')
    .select('user_id, name, parish, total_score, completed_count', { count: 'exact' })
    .order('total_score', { ascending: false })
    .order('completed_count', { ascending: false })
    .range(from, to);

  if (error || !data) return { entries: [], total: 0, hasMore: false };

  const total = count ?? 0;
  return {
    entries: data.map((row) => ({
      userId: row.user_id as string,
      name: row.name as string,
      parish: row.parish as string,
      totalScore: row.total_score as number,
      completedCount: row.completed_count as number,
    })),
    total,
    hasMore: to < total - 1,
  };
}
