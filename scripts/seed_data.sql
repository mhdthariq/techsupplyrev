-- Seed products
INSERT INTO public.products (name, description, price, discount_price, category, image_url, rating, reviews_count, in_stock, stock_quantity, featured) VALUES
('Pro Wireless Headphones', 'Premium noise-canceling headphones with 30-hour battery life', 299.99, 249.99, 'Electronics', '/placeholder.svg?height=300&width=300', 4.8, 1250, true, 50, true),
('USB-C Hub 7-in-1', 'Multi-port USB-C hub with HDMI, USB 3.0, and SD card reader', 49.99, 39.99, 'Accessories', '/placeholder.svg?height=300&width=300', 4.6, 450, true, 150, false),
('Mechanical Gaming Keyboard', 'RGB backlit mechanical keyboard with Cherry MX switches', 129.99, 99.99, 'Peripherals', '/placeholder.svg?height=300&width=300', 4.7, 820, true, 75, true),
('4K Webcam', 'Ultra HD 4K webcam with built-in microphone and auto-focus', 199.99, 159.99, 'Electronics', '/placeholder.svg?height=300&width=300', 4.5, 320, true, 40, true),
('Ergonomic Mouse Pad', 'Extra-large mousepad with wrist support and non-slip base', 24.99, 19.99, 'Accessories', '/placeholder.svg?height=300&width=300', 4.4, 180, true, 200, false),
('External SSD 1TB', 'Fast external solid state drive with USB 3.1 interface', 89.99, 74.99, 'Storage', '/placeholder.svg?height=300&width=300', 4.7, 560, true, 100, true),
('Laptop Stand', 'Adjustable aluminum laptop stand for better ergonomics', 34.99, 27.99, 'Accessories', '/placeholder.svg?height=300&width=300', 4.6, 380, true, 120, false),
('Wireless Mouse', 'Precision wireless mouse with 2.4GHz connection', 39.99, 29.99, 'Peripherals', '/placeholder.svg?height=300&width=300', 4.5, 650, true, 180, true),
('Monitor Light Bar', 'Eye-care monitor light bar with auto-brightness adjustment', 59.99, 49.99, 'Lighting', '/placeholder.svg?height=300&width=300', 4.6, 290, true, 85, true),
('Cable Management Kit', 'Complete cable organizer kit with clips and ties', 19.99, 14.99, 'Accessories', '/placeholder.svg?height=300&width=300', 4.3, 210, true, 250, false);

-- Seed banners
INSERT INTO public.banners (title, description, image_url, link, active, position) VALUES
('Summer Tech Sale - Up to 40% Off', 'Huge discounts on all electronics this summer', '/placeholder.svg?height=400&width=1200', '/products?category=Electronics', true, 0),
('New Arrivals - Latest Tech Gadgets', 'Check out our newest products this season', '/placeholder.svg?height=400&width=1200', '/products?sort=newest', true, 1),
('Free Shipping on Orders Over $50', 'Get free shipping on all orders above $50', '/placeholder.svg?height=400&width=1200', '/products', true, 2);

-- Seed coupons
INSERT INTO public.coupons (code, discount_type, discount_value, max_uses, active, expires_at) VALUES
('WELCOME20', 'percentage', 20, 1000, true, '2025-12-31 23:59:59+00'),
('SUMMER40', 'percentage', 40, 500, true, '2025-08-31 23:59:59+00'),
('SAVE10', 'fixed', 10, 2000, true, '2025-12-31 23:59:59+00'),
('FLASH50', 'fixed', 50, 100, true, '2025-07-15 23:59:59+00');
