-- Enable Row Level Security on resources table
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can view resources
-- Allows all authenticated users to read educational resources
CREATE POLICY "Authenticated users can view resources"
  ON public.resources
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Policy: Only admins can modify resources
-- Allows only admin users to create, update, or delete resources
CREATE POLICY "Only admins can modify resources"
  ON public.resources
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Add comment to explain RLS policies
COMMENT ON TABLE public.resources IS 'Educational resources with RLS: authenticated read, admin-only write';
