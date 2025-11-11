-- Add cart table for user-specific shopping carts
-- Run this script in your Supabase SQL editor

-- Create cart table for persistent user carts
CREATE TABLE IF NOT EXISTS public.cart (
  id uuid DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE(user_id, product_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON public.cart(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_product_id ON public.cart(product_id);

-- Enable RLS for cart
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;

-- Users can only access their own cart items
CREATE POLICY "Users can view own cart" ON public.cart
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items" ON public.cart
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items" ON public.cart
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items" ON public.cart
  FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.cart TO authenticated;

-- Function to update cart item timestamp on update
CREATE OR REPLACE FUNCTION public.update_cart_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger to auto-update updated_at timestamp
CREATE TRIGGER trigger_update_cart_updated_at
  BEFORE UPDATE ON public.cart
  FOR EACH ROW EXECUTE FUNCTION public.update_cart_updated_at();

-- Function to merge guest cart with user cart on login
CREATE OR REPLACE FUNCTION public.merge_guest_cart_to_user(
  p_user_id uuid,
  p_guest_cart_items jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cart_item jsonb;
BEGIN
  -- Loop through each guest cart item
  FOR cart_item IN SELECT * FROM jsonb_array_elements(p_guest_cart_items)
  LOOP
    -- Insert or update cart item for user
    INSERT INTO public.cart (user_id, product_id, quantity)
    VALUES (
      p_user_id,
      (cart_item->>'product_id')::uuid,
      (cart_item->>'quantity')::integer
    )
    ON CONFLICT (user_id, product_id)
    DO UPDATE SET
      quantity = public.cart.quantity + EXCLUDED.quantity,
      updated_at = now();
  END LOOP;
END;
$$;

-- Function to clear user cart (for checkout completion)
CREATE OR REPLACE FUNCTION public.clear_user_cart(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.cart WHERE user_id = p_user_id;
END;
$$;

-- Verify setup
SELECT 'Cart table setup completed successfully!' as status;

-- Show table structure
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'cart'
ORDER BY ordinal_position;
