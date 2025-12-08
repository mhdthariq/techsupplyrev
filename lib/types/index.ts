export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  provider?: string;
  created_at?: string;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  discount_amount: number;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "completed"
    | "cancelled";
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_country: string;
  payment_method: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: number;
  created_at: string;
  product?: Product;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  discount_price?: number | null;
  category: string;
  brand: string;
  image_url: string;
  rating: number;
  reviews_count: number;
  in_stock: boolean;
  stock_quantity: number;
  featured?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  order_id?: string;
  rating: number;
  title: string;
  comment: string;
  verified_purchase: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    email: string;
    name?: string;
  };
  product?: {
    name: string;
    image_url: string;
  };
}

export interface Profile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  created_at: string;
  updated_at: string;
}

export interface Wishlist {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
}

export interface CreateReviewData {
  product_id: string;
  order_id?: string;
  rating: number;
  title: string;
  comment: string;
}

export interface Banner {
  id: string;
  title: string;
  description: string;
  link: string;
  image_url: string;
  active: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  discount_value: number;
  discount_type: string;
  active: boolean;
}
