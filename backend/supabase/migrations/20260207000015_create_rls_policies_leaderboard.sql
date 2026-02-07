-- Enable Row Level Security on leaderboard table
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can view leaderboard
-- Allows all authenticated users to read leaderboard data
CREATE POLICY "Authenticated users can view leaderboard"
  ON public.leaderboard
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Policy: Only admins can modify leaderboard
-- Allows only admin users to create, update, or delete leaderboard entries
CREATE POLICY "Only admins can modify leaderboard"
  ON public.leaderboard
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Add comment to explain RLS policies
COMMENT ON TABLE public.leaderboard IS 'Event leaderboard with RLS: authenticated read, admin-only write';
