-- Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product-images', 'product-images', true, 5242880, '{"image/jpeg","image/png","image/webp","image/gif"}')
ON CONFLICT (id) DO NOTHING;

-- RLS policy for viewing/downloading images
-- This makes all objects in the 'product-images' bucket publicly accessible.
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'product-images' );

-- RLS policy for uploading images
-- Allows authenticated users to insert files if they are an 'owner' or 'admin'.
CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images' AND
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = auth.uid() AND role IN ('owner', 'admin')
  )
);

-- RLS policy for updating images
-- Allows authenticated 'owner' or 'admin' users to update files.
CREATE POLICY "Admins can update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images' AND
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = auth.uid() AND role IN ('owner', 'admin')
  )
);

-- RLS policy for deleting images
-- Allows authenticated 'owner' or 'admin' users to delete files.
CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images' AND
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = auth.uid() AND role IN ('owner', 'admin')
  )
);
