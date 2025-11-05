import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/types/product";

export const useProducts = (categorySlug?: string) => {
  return useQuery({
    queryKey: ["products", categorySlug],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select(`
          *,
          category:categories(id, name, slug)
        `)
        .order("display_order", { ascending: true });

      if (categorySlug) {
        query = query.eq("categories.slug", categorySlug);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Product[];
    },
  });
};

export const useProductsByCategory = (categorySlug: string) => {
  return useQuery({
    queryKey: ["products", "category", categorySlug],
    queryFn: async () => {
      const { data: category, error: categoryError } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", categorySlug)
        .single();

      if (categoryError) throw categoryError;

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category_id", category.id)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as Product[];
    },
  });
};
