-- Marian Path schema
-- marian_path_progress table (create if not yet applied manually)
CREATE TABLE IF NOT EXISTS marian_path_progress (
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day          INTEGER NOT NULL CHECK (day >= 1 AND day <= 30),
  score        INTEGER NOT NULL DEFAULT 0,
  text_score   INTEGER DEFAULT NULL,
  completed    BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ DEFAULT NULL,
  PRIMARY KEY (user_id, day)
);

ALTER TABLE marian_path_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own marian progress"
  ON marian_path_progress FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own marian progress"
  ON marian_path_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own marian progress"
  ON marian_path_progress FOR UPDATE USING (auth.uid() = user_id);

-- Allow authenticated users to read others' progress for the leaderboard
CREATE POLICY "Authenticated users can read all marian progress"
  ON marian_path_progress FOR SELECT USING (auth.role() = 'authenticated');

-- Leaderboard view: total_score sums both score and text_score per day
CREATE OR REPLACE VIEW marian_path_leaderboard AS
SELECT
  p.user_id,
  u.name,
  u.parish,
  SUM(p.score + COALESCE(p.text_score, 0))::integer AS total_score,
  COUNT(*) FILTER (WHERE p.completed = TRUE)::integer AS completed_count
FROM marian_path_progress p
JOIN users u ON u.id = p.user_id
GROUP BY p.user_id, u.name, u.parish;

-- RPC: count users with a strictly higher total score (used to compute rank)
CREATE OR REPLACE FUNCTION marian_path_rank(p_user_id UUID)
RETURNS BIGINT
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(DISTINCT user_id)
  FROM marian_path_progress
  GROUP BY user_id
  HAVING SUM(score + COALESCE(text_score, 0)) > (
    SELECT SUM(score + COALESCE(text_score, 0))
    FROM marian_path_progress
    WHERE user_id = p_user_id
  );
$$;
