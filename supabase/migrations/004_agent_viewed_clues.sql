-- Track which clues the user has viewed (array of clue indexes, e.g. [1, 2])
ALTER TABLE agent_progress ADD COLUMN IF NOT EXISTS viewed_clues INTEGER[] DEFAULT '{}';
