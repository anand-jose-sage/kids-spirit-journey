-- Allow any authenticated user to read all agent_progress rows (for scoreboard)
DROP POLICY IF EXISTS "Users can view own agent progress" ON agent_progress;
DROP POLICY IF EXISTS "Authenticated users can view all agent progress" ON agent_progress;

CREATE POLICY "Authenticated users can view all agent progress"
  ON agent_progress FOR SELECT USING (auth.uid() IS NOT NULL);

-- Allow any authenticated user to read all user profiles (for scoreboard names)
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON users;

CREATE POLICY "Authenticated users can view all profiles"
  ON users FOR SELECT USING (auth.uid() IS NOT NULL);
