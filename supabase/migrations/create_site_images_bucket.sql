-- Create the site-images storage bucket (public access)
-- Run this in the Supabase SQL editor

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'site-images',
  'site-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload to site-images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'site-images');

-- Public read access
CREATE POLICY "Public read site-images"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'site-images');

-- Allow users to delete their own uploads
CREATE POLICY "Authenticated users can delete site-images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'site-images');
