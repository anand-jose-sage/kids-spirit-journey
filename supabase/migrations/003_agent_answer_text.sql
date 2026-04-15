-- Add answer column to store the user's submitted answer text
ALTER TABLE agent_progress ADD COLUMN IF NOT EXISTS answer TEXT;
