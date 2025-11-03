import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Product, Specification } from "@/types/product";

export const useProductDetails = (productId: string) => {
  return useQuery({
    queryKey: ["product-details", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (error) throw error;
      return data as Product;
    },
    enabled: !!productId,
  });
};

export const useHeroProduct = () => {
  return useQuery({
    queryKey: ["hero-product"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("show_in_hero", true)
        .maybeSingle();

      if (error) throw error;
      return data as Product | null;
    },
  });
};

export const useProductSpecifications = (productId: string) => {
  return useQuery({
    queryKey: ["product-specifications", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("specifications")
        .select("*")
        .eq("product_id", productId)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as Specification[];
    },
    enabled: !!productId,
  });
};
