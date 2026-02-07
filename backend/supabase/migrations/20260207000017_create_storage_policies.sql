-- Create storage policies for TechAssassin backend
-- This migration creates RLS policies for storage buckets to control access

-- ============================================================================
-- AVATARS BUCKET POLICIES
-- ============================================================================

-- Policy: Public read access for avatars
CREATE POLICY "Public read access for avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Policy: Users can upload their own avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can update their own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================================================
-- EVENT-IMAGES BUCKET POLICIES
-- ============================================================================

-- Policy: Public read access for event images
CREATE POLICY "Public read access for event images"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-images');

-- Policy: Admins can upload event images
CREATE POLICY "Admins can upload event images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'event-images' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Policy: Admins can update event images
CREATE POLICY "Admins can update event images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'event-images' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Policy: Admins can delete event images
CREATE POLICY "Admins can delete event images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'event-images' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- ============================================================================
-- SPONSOR-LOGOS BUCKET POLICIES
-- ============================================================================

-- Policy: Public read access for sponsor logos
CREATE POLICY "Public read access for sponsor logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'sponsor-logos');

-- Policy: Admins can upload sponsor logos
CREATE POLICY "Admins can upload sponsor logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'sponsor-logos' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Policy: Admins can update sponsor logos
CREATE POLICY "Admins can update sponsor logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'sponsor-logos' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Policy: Admins can delete sponsor logos
CREATE POLICY "Admins can delete sponsor logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'sponsor-logos' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);
