-- Setup script for existing Supabase authentication users
-- This script works with your existing auth.users table

-- 1. Create profiles table that links to existing auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  first_name text,
  last_name text,
  phone text,
  address text,
  city text,
  postal_code text,
  country text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

-- 2. Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text NOT NULL,
  comment text NOT NULL,
  verified_purchase boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE(user_id, product_id)
);

-- 3. Populate profiles for existing users
INSERT INTO public.profiles (id, email, first_name, last_name, created_at)
SELECT
  id,
  email,
  CASE
    WHEN raw_user_meta_data->>'display_name' IS NOT NULL THEN split_part(raw_user_meta_data->>'display_name', ' ', 1)
    WHEN raw_user_meta_data->>'full_name' IS NOT NULL THEN split_part(raw_user_meta_data->>'full_name', ' ', 1)
    WHEN raw_user_meta_data->>'first_name' IS NOT NULL THEN raw_user_meta_data->>'first_name'
    ELSE split_part(split_part(email, '@', 1), '.', 1)
  END as first_name,
  CASE
    WHEN raw_user_meta_data->>'display_name' IS NOT NULL AND position(' ' in raw_user_meta_data->>'display_name') > 0 THEN trim(substring(raw_user_meta_data->>'display_name' from position(' ' in raw_user_meta_data->>'display_name') + 1))
    WHEN raw_user_meta_data->>'full_name' IS NOT NULL AND position(' ' in raw_user_meta_data->>'full_name') > 0 THEN trim(substring(raw_user_meta_data->>'full_name' from position(' ' in raw_user_meta_data->>'full_name') + 1))
    WHEN raw_user_meta_data->>'last_name' IS NOT NULL THEN raw_user_meta_data->>'last_name'
    ELSE ''
  END as last_name,
  created_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- 4. Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Create new policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 5. Enable RLS for reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can create own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON public.reviews;

-- Create review policies
CREATE POLICY "Anyone can read reviews" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create own reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews" ON public.reviews
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Grant permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.reviews TO authenticated;
GRANT SELECT ON public.reviews TO anon;

-- 7. Function to auto-create profiles for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    CASE
      WHEN NEW.raw_user_meta_data->>'display_name' IS NOT NULL THEN split_part(NEW.raw_user_meta_data->>'display_name', ' ', 1)
      WHEN NEW.raw_user_meta_data->>'full_name' IS NOT NULL THEN split_part(NEW.raw_user_meta_data->>'full_name', ' ', 1)
      WHEN NEW.raw_user_meta_data->>'first_name' IS NOT NULL THEN NEW.raw_user_meta_data->>'first_name'
      ELSE split_part(split_part(NEW.email, '@', 1), '.', 1)
    END,
    CASE
      WHEN NEW.raw_user_meta_data->>'display_name' IS NOT NULL AND position(' ' in NEW.raw_user_meta_data->>'display_name') > 0 THEN trim(substring(NEW.raw_user_meta_data->>'display_name' from position(' ' in NEW.raw_user_meta_data->>'display_name') + 1))
      WHEN NEW.raw_user_meta_data->>'full_name' IS NOT NULL AND position(' ' in NEW.raw_user_meta_data->>'full_name') > 0 THEN trim(substring(NEW.raw_user_meta_data->>'full_name' from position(' ' in NEW.raw_user_meta_data->>'full_name') + 1))
      WHEN NEW.raw_user_meta_data->>'last_name' IS NOT NULL THEN NEW.raw_user_meta_data->>'last_name'
      ELSE ''
    END
  );
  RETURN NEW;
END;
$$;

-- 8. Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. Function to update product ratings when reviews change
CREATE OR REPLACE FUNCTION public.update_product_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  product_id_to_update uuid;
  avg_rating numeric;
  review_count integer;
BEGIN
  -- Determine which product to update
  IF TG_OP = 'DELETE' THEN
    product_id_to_update := OLD.product_id;
  ELSE
    product_id_to_update := NEW.product_id;
  END IF;

  -- Calculate new average rating and count
  SELECT
    COALESCE(AVG(rating), 0),
    COUNT(*)
  INTO avg_rating, review_count
  FROM public.reviews
  WHERE product_id = product_id_to_update;

  -- Update the product
  UPDATE public.products
  SET
    rating = ROUND(avg_rating, 1),
    reviews_count = review_count,
    updated_at = now()
  WHERE id = product_id_to_update;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 10. Triggers to update product ratings
DROP TRIGGER IF EXISTS trigger_update_product_rating_insert ON public.reviews;
DROP TRIGGER IF EXISTS trigger_update_product_rating_update ON public.reviews;
DROP TRIGGER IF EXISTS trigger_update_product_rating_delete ON public.reviews;

CREATE TRIGGER trigger_update_product_rating_insert
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_product_rating();

CREATE TRIGGER trigger_update_product_rating_update
  AFTER UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_product_rating();

CREATE TRIGGER trigger_update_product_rating_delete
  AFTER DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_product_rating();

-- 11. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON public.reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);

-- 12. Verification query
SELECT
  'Setup completed successfully!' as status,
  (SELECT COUNT(*) FROM public.profiles) as profiles_count,
  (SELECT COUNT(*) FROM auth.users) as auth_users_count,
  (SELECT COUNT(*) FROM public.reviews) as reviews_count;

-- Show existing users and their profiles with extracted names
SELECT
  u.email,
  u.created_at as user_created,
  COALESCE(u.raw_user_meta_data->>'display_name', 'No display name') as display_name,
  COALESCE(p.first_name, 'No first name') as extracted_first_name,
  COALESCE(p.last_name, 'No last name') as extracted_last_name,
  CASE
    WHEN p.id IS NOT NULL THEN 'Profile created'
    ELSE 'No profile'
  END as profile_status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC;
