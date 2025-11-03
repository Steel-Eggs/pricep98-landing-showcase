import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSiteSettings = () => {
  return useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .order("key");

      if (error) throw error;
      
      // Convert array to object for easier access
      const settings: Record<string, string> = {};
      data?.forEach(setting => {
        settings[setting.key] = setting.value;
      });
      
      return settings;
    },
  });
};

export const useSiteSetting = (key: string) => {
  const { data: settings } = useSiteSettings();
  return settings?.[key] || "";
};

export const useUpdateSiteSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase
        .from("site_settings")
        .upsert({ key, value }, { onConflict: "key" });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
    },
  });
};
