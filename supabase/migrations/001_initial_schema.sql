-- Kids Spirit Journey — initial schema
-- Run this in Supabase Dashboard → SQL Editor

-- Users profile table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  house_name      TEXT NOT NULL,
  parish          TEXT NOT NULL,
  standard        TEXT NOT NULL,
  phone           TEXT NOT NULL UNIQUE,
  completed_days  INTEGER[] NOT NULL DEFAULT '{}',
  current_streak  INTEGER NOT NULL DEFAULT 0,
  last_completed_date DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Day entries table
CREATE TABLE IF NOT EXISTS day_entries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day         INTEGER NOT NULL CHECK (day >= 1 AND day <= 30),
  tasks_done  JSONB NOT NULL DEFAULT '{}',
  reflection  TEXT NOT NULL DEFAULT '',
  saved_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, day)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE day_entries ENABLE ROW LEVEL SECURITY;

-- RLS policies: users can only read/write their own data
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own day entries"
  ON day_entries FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own day entries"
  ON day_entries FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own day entries"
  ON day_entries FOR UPDATE USING (auth.uid() = user_id);

-- Enable Realtime for profile updates (used by AuthProvider)
ALTER PUBLICATION supabase_realtime ADD TABLE users;
