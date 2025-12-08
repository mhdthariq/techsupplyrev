-- Clean up existing data
TRUNCATE TABLE public.products RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.banners RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.coupons RESTART IDENTITY CASCADE;

-- Seed products
INSERT INTO public.products (name, description, price, discount_price, category, image_url, rating, reviews_count, in_stock, stock_quantity, featured) VALUES
('Pro Wireless Headphones', 'Premium noise-canceling headphones with 30-hour battery life', 4500000, 3750000, 'Electronics', '/placeholder.svg?height=300&width=300', 4.8, 1250, true, 50, true),
('USB-C Hub 7-in-1', 'Multi-port USB-C hub with HDMI, USB 3.0, and SD card reader', 750000, 600000, 'Accessories', '/placeholder.svg?height=300&width=300', 4.6, 450, true, 150, false),
('Mechanical Gaming Keyboard', 'RGB backlit mechanical keyboard with Cherry MX switches', 1950000, 1500000, 'Peripherals', '/placeholder.svg?height=300&width=300', 4.7, 820, true, 75, true),
('4K Webcam', 'Ultra HD 4K webcam with built-in microphone and auto-focus', 3000000, 2400000, 'Electronics', '/placeholder.svg?height=300&width=300', 4.5, 320, true, 40, true),
('Ergonomic Mouse Pad', 'Extra-large mousepad with wrist support and non-slip base', 375000, 300000, 'Accessories', '/placeholder.svg?height=300&width=300', 4.4, 180, true, 200, false),
('External SSD 1TB', 'Fast external solid state drive with USB 3.1 interface', 1350000, 1125000, 'Storage', '/placeholder.svg?height=300&width=300', 4.7, 560, true, 100, true),
('Laptop Stand', 'Adjustable aluminum laptop stand for better ergonomics', 525000, 420000, 'Accessories', '/placeholder.svg?height=300&width=300', 4.6, 380, true, 120, false),
('Wireless Mouse', 'Precision wireless mouse with 2.4GHz connection', 600000, 450000, 'Peripherals', '/placeholder.svg?height=300&width=300', 4.5, 650, true, 180, true),
('Monitor Light Bar', 'Eye-care monitor light bar with auto-brightness adjustment', 900000, 750000, 'Lighting', '/placeholder.svg?height=300&width=300', 4.6, 290, true, 85, true),
('Cable Management Kit', 'Complete cable organizer kit with clips and ties', 300000, 225000, 'Accessories', '/placeholder.svg?height=300&width=300', 4.3, 210, true, 250, false);

-- Seed banners
INSERT INTO public.banners (title, description, image_url, link, active, position) VALUES
('Promo Musim Panas - Diskon hingga 40%', 'Diskon besar untuk semua elektronik musim panas ini', '/placeholder.svg?height=400&width=1200', '/products?category=Electronics', true, 0),
('Produk Terbaru - Gadget Terkini', 'Cek produk terbaru kami musim ini', '/placeholder.svg?height=400&width=1200', '/products?sort=newest', true, 1),
('Gratis Ongkir untuk Pesanan di atas Rp 750.000', 'Dapatkan gratis ongkir untuk semua pesanan di atas Rp 750.000', '/placeholder.svg?height=400&width=1200', '/products', true, 2);

-- Seed coupons
INSERT INTO public.coupons (code, discount_type, discount_value, max_uses, active, expires_at) VALUES
('WELCOME20', 'percentage', 20, 1000, true, '2025-12-31 23:59:59+00'),
('SUMMER40', 'percentage', 40, 500, true, '2025-08-31 23:59:59+00'),
('HEMAT50K', 'fixed', 50000, 2000, true, '2025-12-31 23:59:59+00'),
('FLASH100K', 'fixed', 100000, 100, true, '2025-07-15 23:59:59+00');
