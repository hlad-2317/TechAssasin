-- Enable Row Level Security on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Profiles are viewable by everyone
-- Allows all users (authenticated and unauthenticated) to read profile data
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles
  FOR SELECT
  USING (true);

-- Policy: Users can update own profile
-- Allows users to update only their own profile (where id matches auth.uid())
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Add comment to explain RLS policies
COMMENT ON TABLE public.profiles IS 'Extended user profile information with RLS: public read, own profile update';
