-- Server-side scoreboard function: computes points per user and returns paginated results
-- Points logic: 1 clue viewed (always clue 0) = 100, 2 = 60, 3 = 30, 4 = 10
-- viewed_clues stores only explicitly clicked clues (not clue 0), so length + 1 = total viewed

CREATE OR REPLACE FUNCTION get_agent_scoreboard(
  page_offset INTEGER DEFAULT 0,
  page_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  user_id UUID,
  name TEXT,
  standard TEXT,
  points BIGINT,
  total_count BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  WITH scored AS (
    SELECT
      ap.user_id,
      SUM(
        CASE
          WHEN coalesce(array_length(ap.viewed_clues, 1), 0) + 1 <= 1 THEN 100
          WHEN coalesce(array_length(ap.viewed_clues, 1), 0) + 1 = 2 THEN 60
          WHEN coalesce(array_length(ap.viewed_clues, 1), 0) + 1 = 3 THEN 30
          ELSE 10
        END
      ) AS points
    FROM agent_progress ap
    WHERE ap.completed = TRUE AND ap.correct = TRUE
    GROUP BY ap.user_id
  ),
  counted AS (
    SELECT count(*) AS cnt FROM scored
  )
  SELECT
    s.user_id,
    u.name,
    u.standard,
    s.points,
    c.cnt AS total_count
  FROM scored s
  JOIN users u ON u.id = s.user_id
  CROSS JOIN counted c
  ORDER BY s.points DESC, u.name ASC
  OFFSET page_offset
  LIMIT page_limit;
$$;
