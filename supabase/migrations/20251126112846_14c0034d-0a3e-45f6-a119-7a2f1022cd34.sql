-- Create banners table
CREATE TABLE public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  button_text TEXT,
  button_url TEXT,
  background_gradient TEXT NOT NULL DEFAULT 'from-blue-600 to-purple-600',
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- Public can view active banners
CREATE POLICY "Public can view active banners"
ON public.banners
FOR SELECT
USING (is_active = true);

-- Admins can view all banners
CREATE POLICY "Admins can view all banners"
ON public.banners
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert banners
CREATE POLICY "Admins can insert banners"
ON public.banners
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update banners
CREATE POLICY "Admins can update banners"
ON public.banners
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete banners
CREATE POLICY "Admins can delete banners"
ON public.banners
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_banners_updated_at
BEFORE UPDATE ON public.banners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert show_hero_section setting
INSERT INTO public.site_settings (key, value)
VALUES ('show_hero_section', 'false')
ON CONFLICT (key) DO NOTHING;

-- Insert initial banners
INSERT INTO public.banners (title, subtitle, background_gradient, display_order, is_active) VALUES
(
  'ПОДАРОК КАЖДОМУ ПОКУПАТЕЛЮ',
  'Выбирай любой прицеп — получай опорное колесо в подарок! ПРИЦЕП98 — устойчивость вашего прицепа в любом положении.',
  'from-blue-600 via-purple-600 to-indigo-600',
  1,
  true
),
(
  'КУПИ СЕЙЧАС — ПОЛУЧИ СЕРВИС БЕСПЛАТНО',
  'При покупке любого прицепа до конца месяца — диагностика и обслуживание в подарок.',
  'from-green-500 via-teal-500 to-cyan-600',
  2,
  true
),
(
  'ТОЛЬКО ДО КОНЦА 2025 — ПОДАРОЧНАЯ КАРТА 5% ВСЕМ',
  'При покупке любого прицепа — получите карту и покупайте любую продукцию со скидкой 5% навсегда!',
  'from-orange-500 via-red-500 to-pink-600',
  3,
  true
);