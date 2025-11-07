import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tent, ProductTent } from "@/types/product";

export const useTents = () => {
  return useQuery({
    queryKey: ["tents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tents")
        .select("*")
        .order("default_price", { ascending: true });

      if (error) throw error;
      return data as Tent[];
    },
  });
};

export const useProductTents = (productId: string) => {
  return useQuery({
    queryKey: ["product-tents", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_tents")
        .select(`
          *,
          tent:tents(*)
        `)
        .eq("product_id", productId);

      if (error) throw error;
      return data as ProductTent[];
    },
    enabled: !!productId,
  });
};
