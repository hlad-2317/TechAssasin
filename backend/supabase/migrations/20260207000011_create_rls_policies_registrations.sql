-- Enable Row Level Security on registrations table
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view own registrations
-- Allows users to read only their own registration records
CREATE POLICY "Users can view own registrations"
  ON public.registrations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Admins can view all registrations
-- Allows admin users to read all registration records
CREATE POLICY "Admins can view all registrations"
  ON public.registrations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Policy: Users can create registrations
-- Allows authenticated users to create registrations for themselves
CREATE POLICY "Users can create registrations"
  ON public.registrations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can update registrations
-- Allows admin users to update any registration (e.g., change status)
CREATE POLICY "Admins can update registrations"
  ON public.registrations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Add comment to explain RLS policies
COMMENT ON TABLE public.registrations IS 'User registrations with RLS: users see own, admins see all, admins can update';
