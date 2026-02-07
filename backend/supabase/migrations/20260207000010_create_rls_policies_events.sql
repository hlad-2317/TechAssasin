-- Enable Row Level Security on events table
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Policy: Events are viewable by everyone
-- Allows all users (authenticated and unauthenticated) to read event data
CREATE POLICY "Events are viewable by everyone"
  ON public.events
  FOR SELECT
  USING (true);

-- Policy: Only admins can modify events
-- Allows only admin users to insert, update, or delete events
CREATE POLICY "Only admins can modify events"
  ON public.events
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Add comment to explain RLS policies
COMMENT ON TABLE public.events IS 'Hackathon events with RLS: public read, admin-only write';
