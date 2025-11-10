-- Complete Database Setup Script
-- This script will fix all database issues including RLS policies and missing columns
-- Run this script in your Supabase SQL editor

-- First, drop all existing policies to start fresh
DROP POLICY IF EXISTS "Allow public to read products" ON public.products;
DROP POLICY IF EXISTS "Allow admin to manage products" ON public.products;
DROP POLICY IF EXISTS "Allow public to read banners" ON public.banners;
DROP POLICY IF EXISTS "Allow admin to manage banners" ON public.banners;
DROP POLICY IF EXISTS "Allow public to read active coupons" ON public.coupons;
DROP POLICY IF EXISTS "Allow admin to manage coupons" ON public.coupons;
DROP POLICY IF EXISTS "Allow users to view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow admin to view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to view own orders" ON public.orders;
DROP POLICY IF EXISTS "Allow users to create orders" ON public.orders;
DROP POLICY IF EXISTS "Allow admin to view all orders" ON public.orders;
DROP POLICY IF EXISTS "Allow users to view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Allow users to manage own wishlist" ON public.wishlist;

-- Disable RLS temporarily for all tables
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist DISABLE ROW LEVEL SECURITY;

-- Add featured column to products table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'products'
        AND column_name = 'featured'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.products ADD COLUMN featured BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Clear existing data and start fresh
DELETE FROM public.order_items;
DELETE FROM public.orders;
DELETE FROM public.wishlist;
DELETE FROM public.products;
DELETE FROM public.banners;
DELETE FROM public.coupons;

-- Insert fresh product data with featured column
INSERT INTO public.products (name, description, price, discount_price, category, image_url, rating, reviews_count, in_stock, stock_quantity, featured) VALUES
('Pro Wireless Headphones', 'Premium noise-canceling headphones with 30-hour battery life', 299.99, 249.99, 'Electronics', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop', 4.8, 1250, true, 50, true),
('USB-C Hub 7-in-1', 'Multi-port USB-C hub with HDMI, USB 3.0, and SD card reader', 49.99, 39.99, 'Accessories', 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=300&h=300&fit=crop', 4.6, 450, true, 150, false),
('Mechanical Gaming Keyboard', 'RGB backlit mechanical keyboard with Cherry MX switches', 129.99, 99.99, 'Peripherals', 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=300&h=300&fit=crop', 4.7, 820, true, 75, true),
('4K Webcam', 'Ultra HD 4K webcam with built-in microphone and auto-focus', 199.99, 159.99, 'Electronics', 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=300&h=300&fit=crop', 4.5, 320, true, 40, true),
('Ergonomic Mouse Pad', 'Extra-large mousepad with wrist support and non-slip base', 24.99, 19.99, 'Accessories', 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop', 4.4, 180, true, 200, false),
('External SSD 1TB', 'Fast external solid state drive with USB 3.1 interface', 89.99, 74.99, 'Storage', 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=300&h=300&fit=crop', 4.7, 560, true, 100, true),
('Laptop Stand', 'Adjustable aluminum laptop stand for better ergonomics', 34.99, 27.99, 'Accessories', 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop', 4.6, 380, true, 120, false),
('Wireless Mouse', 'Precision wireless mouse with 2.4GHz connection', 39.99, 29.99, 'Peripherals', 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop', 4.5, 650, true, 180, true),
('Monitor Light Bar', 'Eye-care monitor light bar with auto-brightness adjustment', 59.99, 49.99, 'Lighting', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop', 4.6, 290, true, 85, true),
('Cable Management Kit', 'Complete cable organizer kit with clips and ties', 19.99, 14.99, 'Accessories', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop', 4.3, 210, true, 250, false),
('Gaming Headset', 'Professional gaming headset with 7.1 surround sound', 79.99, 59.99, 'Peripherals', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop', 4.5, 340, true, 90, true),
('Wireless Charger', 'Fast wireless charging pad for smartphones', 29.99, 24.99, 'Electronics', 'https://images.unsplash.com/photo-1607473256706-8c16e2d4cf44?w=300&h=300&fit=crop', 4.3, 520, true, 200, false),
('USB Flash Drive 64GB', 'High-speed USB 3.0 flash drive with metal casing', 15.99, 12.99, 'Storage', 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=300&h=300&fit=crop', 4.4, 890, true, 300, false),
('Bluetooth Speaker', 'Portable waterproof bluetooth speaker with bass boost', 49.99, 39.99, 'Electronics', 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=300&fit=crop', 4.6, 680, true, 120, true),
('Screen Cleaner Kit', 'Professional screen cleaning kit for monitors and phones', 12.99, 9.99, 'Accessories', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop', 4.2, 150, true, 500, false);

-- Insert banner data
INSERT INTO public.banners (title, description, image_url, link, active, position) VALUES
('Summer Tech Sale - Up to 40% Off', 'Huge discounts on all electronics this summer', 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=400&fit=crop', '/products?category=Electronics', true, 0),
('New Arrivals - Latest Tech Gadgets', 'Check out our newest products this season', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&h=400&fit=crop', '/products?sort=newest', true, 1),
('Free Shipping on Orders Over $50', 'Get free shipping on all orders above $50', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=400&fit=crop', '/products', true, 2);

-- Insert coupon data
INSERT INTO public.coupons (code, discount_type, discount_value, max_uses, active, expires_at) VALUES
('WELCOME20', 'percentage', 20, 1000, true, '2025-12-31 23:59:59+00'),
('SUMMER40', 'percentage', 40, 500, true, '2025-08-31 23:59:59+00'),
('SAVE10', 'fixed', 10, 2000, true, '2025-12-31 23:59:59+00'),
('FLASH50', 'fixed', 50, 100, true, '2025-07-15 23:59:59+00');

-- Grant necessary permissions for anonymous and authenticated users
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.banners TO anon;
GRANT SELECT ON public.coupons TO anon;
GRANT SELECT ON public.products TO authenticated;
GRANT SELECT ON public.banners TO authenticated;
GRANT SELECT ON public.coupons TO authenticated;

-- Enable simple RLS policies only where needed
-- Products: Allow public read (no RLS needed)
-- Banners: Allow public read (no RLS needed)
-- Coupons: Allow public read (no RLS needed)

-- For user-specific tables, enable RLS with simple policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own orders" ON public.orders
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own wishlist" ON public.wishlist
  FOR ALL USING (auth.uid() = user_id);

-- Verify the setup
SELECT 'Products' as table_name, COUNT(*) as total_records, COUNT(*) FILTER (WHERE featured = true) as featured_products FROM public.products
UNION ALL
SELECT 'Banners', COUNT(*), NULL FROM public.banners
UNION ALL
SELECT 'Coupons', COUNT(*), NULL FROM public.coupons;

-- Show sample products
SELECT id, name, price, discount_price, category, featured
FROM public.products
ORDER BY featured DESC, created_at DESC
LIMIT 5;
