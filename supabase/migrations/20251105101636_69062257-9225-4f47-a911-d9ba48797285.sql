-- Add display_order field to products table
ALTER TABLE public.products 
ADD COLUMN display_order integer NOT NULL DEFAULT 0;

-- Add display_order field to tents table
ALTER TABLE public.tents 
ADD COLUMN display_order integer NOT NULL DEFAULT 0;

-- Set initial display_order values based on current order
UPDATE public.products 
SET display_order = subquery.row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY name) as row_num
  FROM public.products
) as subquery
WHERE products.id = subquery.id;

UPDATE public.tents 
SET display_order = subquery.row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY default_price) as row_num
  FROM public.tents
) as subquery
WHERE tents.id = subquery.id;