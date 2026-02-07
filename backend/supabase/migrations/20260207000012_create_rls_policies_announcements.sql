-- Enable Row Level Security on announcements table
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can view announcements
-- Allows all authenticated users to read announcements
CREATE POLICY "Authenticated users can view announcements"
  ON public.announcements
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Policy: Admins can create announcements
-- Allows only admin users to create new announcements
CREATE POLICY "Admins can create announcements"
  ON public.announcements
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Policy: Authors and admins can modify announcements
-- Allows the original author or any admin to update/delete announcements
CREATE POLICY "Authors and admins can modify announcements"
  ON public.announcements
  FOR ALL
  USING (
    auth.uid() = author_id OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Add comment to explain RLS policies
COMMENT ON TABLE public.announcements IS 'Community announcements with RLS: authenticated read, admin/author write';
