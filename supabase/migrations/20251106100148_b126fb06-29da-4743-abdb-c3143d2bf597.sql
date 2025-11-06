-- Add price_on_request column to products table
ALTER TABLE products ADD COLUMN price_on_request BOOLEAN DEFAULT false;