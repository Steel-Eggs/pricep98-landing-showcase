import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  background_gradient: string;
  button_text: string | null;
  button_url: string | null;
  image_url: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export const useBanners = () => {
  return useQuery({
    queryKey: ['banners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as Banner[];
    },
  });
};

export const useAllBanners = () => {
  return useQuery({
    queryKey: ['all-banners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as Banner[];
    },
  });
};
