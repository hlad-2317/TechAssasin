-- Enable Row Level Security on sponsors table
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;

-- Policy: Sponsors are viewable by everyone
-- Allows all users (authenticated and unauthenticated) to read sponsor data
CREATE POLICY "Sponsors are viewable by everyone"
  ON public.sponsors
  FOR SELECT
  USING (true);

-- Policy: Only admins can modify sponsors
-- Allows only admin users to create, update, or delete sponsors
CREATE POLICY "Only admins can modify sponsors"
  ON public.sponsors
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Add comment to explain RLS policies
COMMENT ON TABLE public.sponsors IS 'Sponsor information with RLS: public read, admin-only write';
