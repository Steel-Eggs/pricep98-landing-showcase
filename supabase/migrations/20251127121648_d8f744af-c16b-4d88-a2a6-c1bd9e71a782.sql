-- Create storage bucket for banner images
INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to banner images
CREATE POLICY "Public can view banner images"
ON storage.objects FOR SELECT
USING (bucket_id = 'banners');

-- Allow admins to upload banner images
CREATE POLICY "Admins can upload banner images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'banners' AND has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update banner images
CREATE POLICY "Admins can update banner images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'banners' AND has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete banner images
CREATE POLICY "Admins can delete banner images"
ON storage.objects FOR DELETE
USING (bucket_id = 'banners' AND has_role(auth.uid(), 'admin'::app_role));