-- Minimal Setup Script for Reviews System
-- Run this in your Supabase SQL editor

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  first_name text,
  last_name text,
  phone text,
  address text,
  city text,
  postal_code text,
  country text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (id)
);

-- 2. Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.products ON DELETE CASCADE NOT NULL,
  order_id uuid REFERENCES public.orders ON DELETE SET NULL,
  rating integer NOT NULL,
  title text NOT NULL,
  comment text NOT NULL,
  verified_purchase boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT rating_check CHECK (rating >= 1 AND rating <= 5),
  CONSTRAINT unique_user_product UNIQUE (user_id, product_id)
);

-- 3. Add RLS policies for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Enable update for own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. Add RLS policies for reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all reviews" ON public.reviews
FOR SELECT USING (true);

CREATE POLICY "Enable insert for own reviews" ON public.reviews
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for own reviews" ON public.reviews
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable delete for own reviews" ON public.reviews
FOR DELETE USING (auth.uid() = user_id);

-- 5. Grant permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.reviews TO authenticated;
GRANT SELECT ON public.reviews TO anon;

-- 6. Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (new.id, new.email, '', '');
  RETURN new;
END;
$$ language plpgsql security definer;

-- 7. Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 8. Function to update product ratings
CREATE OR REPLACE FUNCTION update_product_ratings()
RETURNS trigger AS $$
DECLARE
  product_uuid uuid;
  avg_rating numeric;
  review_count integer;
BEGIN
  IF TG_OP = 'DELETE' THEN
    product_uuid = OLD.product_id;
  ELSE
    product_uuid = NEW.product_id;
  END IF;

  SELECT AVG(rating), COUNT(*)
  INTO avg_rating, review_count
  FROM public.reviews
  WHERE product_id = product_uuid;

  UPDATE public.products
  SET rating = COALESCE(avg_rating, 0),
      reviews_count = review_count
  WHERE id = product_uuid;

  RETURN COALESCE(NEW, OLD);
END;
$$ language plpgsql;

-- 9. Triggers for product rating updates
CREATE TRIGGER update_product_rating_on_review_insert
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_ratings();

CREATE TRIGGER update_product_rating_on_review_update
  AFTER UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_ratings();

CREATE TRIGGER update_product_rating_on_review_delete
  AFTER DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_ratings();
