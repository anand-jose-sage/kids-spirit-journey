import { supabase } from './supabase';

export interface UserProfile {
  name: string;
  houseName: string;
  parish: string;
  standard: string;
  phone: string;
  completedDays: number[];
  currentStreak: number;
  lastCompletedDate: string | null;
  createdAt: string | null;
}

export type NewUserData = Omit<UserProfile, 'completedDays' | 'currentStreak' | 'lastCompletedDate' | 'createdAt'>;

// Day entry — stores task checkboxes + reflection for one day
export interface DayEntry {
  tasksDone: Record<string, boolean>; // e.g. { read: true, pray: false, act: true }
  reflection: string;
  savedAt: string | null;
}

// Maps snake_case DB row to camelCase UserProfile
export function mapRowToProfile(row: Record<string, unknown>): UserProfile {
  return {
    name: row.name as string,
    houseName: row.house_name as string,
    parish: row.parish as string,
    standard: row.standard as string,
    phone: row.phone as string,
    completedDays: (row.completed_days as number[]) || [],
    currentStreak: (row.current_streak as number) || 0,
    lastCompletedDate: (row.last_completed_date as string) || null,
    createdAt: (row.created_at as string) || null,
  };
}

export async function saveDayEntry(uid: string, day: number, entry: Omit<DayEntry, 'savedAt'>): Promise<void> {
  const { error } = await supabase.from('day_entries').upsert(
    {
      user_id: uid,
      day,
      tasks_done: entry.tasksDone,
      reflection: entry.reflection.slice(0, 2000),
      saved_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,day' }
  );
  if (error) throw error;
}

export async function getDayEntry(uid: string, day: number): Promise<DayEntry | null> {
  const { data, error } = await supabase
    .from('day_entries')
    .select('*')
    .eq('user_id', uid)
    .eq('day', day)
    .single();
  if (error || !data) return null;
  return {
    tasksDone: data.tasks_done as Record<string, boolean>,
    reflection: data.reflection as string,
    savedAt: data.saved_at as string,
  };
}

export async function isPhoneTaken(phone: string): Promise<boolean> {
  const { data } = await supabase.from('users').select('id').eq('phone', phone).maybeSingle();
  return !!data;
}

export async function createUserProfile(uid: string, data: NewUserData): Promise<void> {
  const { error } = await supabase.from('users').insert({
    id: uid,
    name: data.name,
    house_name: data.houseName,
    parish: data.parish,
    standard: data.standard,
    phone: data.phone,
    completed_days: [],
    current_streak: 0,
    last_completed_date: null,
  });
  if (error) throw error;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const { data, error } = await supabase.from('users').select('*').eq('id', uid).single();
  if (error || !data) return null;
  return mapRowToProfile(data as Record<string, unknown>);
}

export async function getSavedDays(uid: string): Promise<number[]> {
  const { data } = await supabase.from('day_entries').select('day').eq('user_id', uid);
  return data?.map((r) => r.day as number) ?? [];
}

export async function getSavedEntries(uid: string): Promise<{ day: number; tasksDone: Record<string, boolean> }[]> {
  const { data } = await supabase.from('day_entries').select('day, tasks_done').eq('user_id', uid);
  return (data ?? []).map((r) => ({ day: r.day as number, tasksDone: (r.tasks_done ?? {}) as Record<string, boolean> }));
}

export function getMassStreak(entries: { day: number; tasksDone: Record<string, boolean> }[]): number {
  const massDays = entries
    .filter((e) => e.tasksDone?.mass === true)
    .map((e) => e.day)
    .sort((a, b) => a - b);
  if (massDays.length === 0) return 0;
  let max = 1, run = 1;
  for (let i = 1; i < massDays.length; i++) {
    run = massDays[i] === massDays[i - 1] + 1 ? run + 1 : 1;
    max = Math.max(max, run);
  }
  return max;
}

export interface Winner {
  id: string;
  day: number;
  userId: string;
  name: string;
  parish: string;
  standard: string;
  answer: string;
  answerMl: string;
  createdAt: string | null;
}

export async function getWinners(): Promise<Winner[]> {
  // Step 1: fetch all winner rows
  const { data: winnerRows, error } = await supabase
    .from('winners')
    .select('id, day, user_id, answer, answer_ml, created_at')
    .order('day', { ascending: true });
  if (error || !winnerRows || winnerRows.length === 0) return [];

  // Step 2: fetch user profiles for all referenced user ids
  const userIds = [...new Set(winnerRows.map((r) => r.user_id as string))];
  const { data: userRows } = await supabase
    .from('users')
    .select('id, name, parish, standard')
    .in('id', userIds);

  const userMap: Record<string, { name: string; parish: string; standard: string }> = {};
  (userRows ?? []).forEach((u: Record<string, unknown>) => {
    userMap[u.id as string] = {
      name: u.name as string,
      parish: u.parish as string,
      standard: u.standard as string,
    };
  });

  return winnerRows.map((row: Record<string, unknown>) => {
    const user = userMap[row.user_id as string] ?? { name: '', parish: '', standard: '' };
    return {
      id: row.id as string,
      day: row.day as number,
      userId: row.user_id as string,
      name: user.name,
      parish: user.parish,
      standard: user.standard,
      answer: (row.answer as string) || '',
      answerMl: (row.answer_ml as string) || '',
      createdAt: row.created_at as string | null,
    };
  });
}

export async function completeDay(uid: string, day: number): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const profile = await getUserProfile(uid);
  if (!profile) return;

  const completedDays = profile.completedDays || [];
  if (completedDays.includes(day)) return; // already done

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const lastDate = profile.lastCompletedDate;
  let newStreak = 1;
  if (lastDate === yesterdayStr || lastDate === today) {
    newStreak = (profile.currentStreak || 0) + 1;
  }

  const { error } = await supabase
    .from('users')
    .update({
      completed_days: [...completedDays, day],
      current_streak: newStreak,
      last_completed_date: today,
    })
    .eq('id', uid);
  if (error) throw error;
}

export interface Achievement {
  id: string;
  title: string;
  emoji: string;
  description: string;
  unlocked: boolean;
}

export function getAchievements(completedDays: number[], massStreak = 0): Achievement[] {
  const count = completedDays.length;
  const sorted = [...completedDays].sort((a, b) => a - b);

  let maxStreak = 0;
  let currentRun = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === sorted[i - 1] + 1) {
      currentRun++;
      maxStreak = Math.max(maxStreak, currentRun);
    } else {
      currentRun = 1;
    }
  }
  if (sorted.length === 1) maxStreak = 1;

  return [
    {
      id: 'first_step',
      title: 'First Step',
      emoji: '🌱',
      description: 'Complete Day 1',
      unlocked: count >= 1,
    },
    {
      id: 'prayer_warrior',
      title: 'Prayer Warrior',
      emoji: '🙏',
      description: 'Complete 5 days',
      unlocked: count >= 5,
    },
    {
      id: 'week_champion',
      title: 'Week Champion',
      emoji: '🏆',
      description: 'Complete 7 days',
      unlocked: count >= 7,
    },
    {
      id: 'streak_star',
      title: 'Streak Star',
      emoji: '⭐',
      description: '3 days in a row',
      unlocked: maxStreak >= 3,
    },
    {
      id: 'halfway_hero',
      title: 'Halfway Hero',
      emoji: '🦸',
      description: 'Complete 15 days',
      unlocked: count >= 15,
    },
    {
      id: 'faithful_friend',
      title: 'Faithful Friend',
      emoji: '💛',
      description: 'Complete 20 days',
      unlocked: count >= 20,
    },
    {
      id: 'friend_of_eucharist',
      title: 'Friend of Eucharist',
      emoji: '⛪',
      description: 'Attend Holy Qurbana 7 days in a row',
      unlocked: massStreak >= 7,
    },
    {
      id: 'journey_complete',
      title: '30-Day Champion',
      emoji: '🌟',
      description: 'Complete all 30 days!',
      unlocked: count >= 30,
    },
  ];
}
