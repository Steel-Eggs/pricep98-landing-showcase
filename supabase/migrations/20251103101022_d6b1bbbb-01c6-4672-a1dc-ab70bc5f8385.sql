-- Create site_settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can view site settings"
ON public.site_settings
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert site settings"
ON public.site_settings
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update site settings"
ON public.site_settings
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete site settings"
ON public.site_settings
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial data
INSERT INTO public.site_settings (key, value) VALUES
  ('contact_email', 'info@steeleggs.ru'),
  ('phone', '+7 (921) 910-38-50'),
  ('address_city', 'Санкт-Петербург'),
  ('address_full', 'Санкт-Петербург, ул. Примерная, д. 123'),
  ('working_hours', 'Пн-Вс 9:00 - 21:00'),
  ('coordinates', '59.9311,30.3609'),
  ('youtube_url', 'https://www.youtube.com'),
  ('vk_url', 'https://vk.com'),
  ('privacy_policy', 'Здесь будет текст политики конфиденциальности. Вы можете отредактировать его в админ-панели.'),
  ('terms_of_service', 'Здесь будет текст пользовательского соглашения. Вы можете отредактировать его в админ-панели.')
ON CONFLICT (key) DO NOTHING;