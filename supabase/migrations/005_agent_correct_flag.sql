-- Track whether the submitted answer was correct
ALTER TABLE agent_progress ADD COLUMN IF NOT EXISTS correct BOOLEAN DEFAULT FALSE;
