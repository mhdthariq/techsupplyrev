-- Update products table to add featured column and fix data
-- Run this script to fix the products table structure

-- Add featured column if it doesn't exist
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

-- Clear existing products to avoid conflicts
DELETE FROM public.products;

-- Reset the sequence if needed
-- This ensures clean IDs starting from scratch
-- ALTER SEQUENCE IF EXISTS products_id_seq RESTART WITH 1;

-- Insert products with featured column
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

-- Verify the update
SELECT
    COUNT(*) as total_products,
    COUNT(*) FILTER (WHERE featured = true) as featured_products
FROM public.products;

-- Show some sample data
SELECT id, name, price, category, featured
FROM public.products
ORDER BY featured DESC, created_at DESC
LIMIT 10;
