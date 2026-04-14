-- Catholic Secret Agent game — progress tracking
-- Run this in Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS agent_progress (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day           INTEGER NOT NULL CHECK (day >= 1 AND day <= 15),
  completed     BOOLEAN NOT NULL DEFAULT FALSE,
  attempts      INTEGER NOT NULL DEFAULT 0,
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, day)
);

-- Enable Row Level Security
ALTER TABLE agent_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies: users can only read/write their own progress
CREATE POLICY "Users can view own agent progress"
  ON agent_progress FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own agent progress"
  ON agent_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own agent progress"
  ON agent_progress FOR UPDATE USING (auth.uid() = user_id);
