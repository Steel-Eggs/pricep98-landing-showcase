export interface Product {
  id: string;
  name: string;
  base_price: number;
  old_price?: number;
  discount_label?: string;
  availability: string;
  base_image_url?: string;
  description?: string;
  category_id: string;
  show_in_hero?: boolean;
  hero_timer_end?: string;
  wheel_options?: {
    default?: string;
    options?: string[];
  };
  hub_options?: {
    default?: string;
    options?: string[];
  };
  features?: string[];
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProductTent {
  id: string;
  product_id: string;
  tent_id: string;
  price: number;
  image_url?: string;
  is_default: boolean;
  tent?: {
    id: string;
    name: string;
    slug: string;
    default_price: number;
  };
}

export interface Tent {
  id: string;
  name: string;
  slug: string;
  default_price: number;
  display_order?: number;
  created_at?: string;
}

export interface Accessory {
  id: string;
  name: string;
  default_price: number;
  display_order: number;
  created_at?: string;
}

export interface ProductAccessory {
  id: string;
  product_id: string;
  accessory_id: string;
  price: number;
  is_available: boolean;
  accessory?: Accessory;
}

export interface Specification {
  id: string;
  product_id: string;
  spec_name: string;
  spec_value: string;
  display_order: number;
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  display_order: number;
  created_at?: string;
}
