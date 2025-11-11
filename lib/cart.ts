"use client";

import { createClient } from "@/lib/supabase/client";
import { getCurrentUser } from "@/lib/auth";

export interface CartItem {
  id: string;
  quantity: number;
}

export interface CartItemWithProduct extends CartItem {
  name: string;
  price: number;
  discount_price?: number | null;
  image_url?: string;
}

export interface DatabaseCartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  product?: {
    name: string;
    price: number;
    discount_price?: number | null;
    image_url: string;
  };
}

const supabase = createClient();

/**
 * Get guest cart items from localStorage
 */
export const getGuestCartItems = (): CartItem[] => {
  if (typeof window === "undefined") return [];

  try {
    const cart = localStorage.getItem("guest_cart");
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    console.error("Error parsing guest cart from localStorage:", error);
    return [];
  }
};

/**
 * Save guest cart items to localStorage
 */
export const saveGuestCartItems = (items: CartItem[]): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem("guest_cart", JSON.stringify(items));
    // Update cart count display
    updateCartCountDisplay();
  } catch (error) {
    console.error("Error saving guest cart to localStorage:", error);
  }
};

/**
 * Get user cart items from database
 */
export const getUserCartItems = async (userId: string): Promise<CartItem[]> => {
  try {
    const { data, error } = await supabase
      .from("cart")
      .select("product_id, quantity")
      .eq("user_id", userId);

    if (error) throw error;

    return (data || []).map((item) => ({
      id: item.product_id,
      quantity: item.quantity,
    }));
  } catch (error) {
    console.error("Error fetching user cart:", error);
    return [];
  }
};

/**
 * Get cart items (auto-detects if user is logged in)
 */
export const getCartItems = async (): Promise<CartItem[]> => {
  try {
    const user = await getCurrentUser();

    if (user) {
      return await getUserCartItems(user.id);
    } else {
      return getGuestCartItems();
    }
  } catch (error) {
    console.error("Error getting cart items:", error);
    return getGuestCartItems();
  }
};

/**
 * Save cart items (auto-detects if user is logged in)
 */
export const saveCartItems = async (items: CartItem[]): Promise<void> => {
  try {
    const user = await getCurrentUser();

    if (user) {
      await syncCartToDatabase(user.id, items);
    } else {
      saveGuestCartItems(items);
    }
  } catch (error) {
    console.error("Error saving cart items:", error);
    saveGuestCartItems(items);
  }
};

/**
 * Sync cart items to database for authenticated users
 */
export const syncCartToDatabase = async (
  userId: string,
  items: CartItem[],
): Promise<void> => {
  try {
    // Clear existing cart
    await supabase.from("cart").delete().eq("user_id", userId);

    // Insert new items
    if (items.length > 0) {
      const cartData = items.map((item) => ({
        user_id: userId,
        product_id: item.id,
        quantity: item.quantity,
      }));

      const { error } = await supabase.from("cart").insert(cartData);
      if (error) throw error;
    }

    // Update cart count display
    updateCartCountDisplay();
  } catch (error) {
    console.error("Error syncing cart to database:", error);
    throw error;
  }
};

/**
 * Merge guest cart with user cart on login
 */
export const mergeGuestCartWithUserCart = async (
  userId: string,
): Promise<void> => {
  try {
    const guestCart = getGuestCartItems();

    if (guestCart.length === 0) {
      return; // No guest cart to merge
    }

    // Get existing user cart
    const userCart = await getUserCartItems(userId);

    // Merge carts (combine quantities for same products)
    const mergedCart = [...userCart];

    guestCart.forEach((guestItem) => {
      const existingItem = mergedCart.find((item) => item.id === guestItem.id);

      if (existingItem) {
        existingItem.quantity += guestItem.quantity;
      } else {
        mergedCart.push(guestItem);
      }
    });

    // Save merged cart to database
    await syncCartToDatabase(userId, mergedCart);

    // Clear guest cart
    saveGuestCartItems([]);

    console.log("Guest cart merged with user cart successfully");
  } catch (error) {
    console.error("Error merging guest cart with user cart:", error);
  }
};

/**
 * Clear guest cart (used after login merge)
 */
export const clearGuestCart = (): void => {
  saveGuestCartItems([]);
};

/**
 * Add item to cart
 */
export const addToCart = async (
  productId: string,
  quantity: number = 1,
): Promise<void> => {
  try {
    const user = await getCurrentUser();

    if (user) {
      // Add to user's database cart
      const { data: existingItem } = await supabase
        .from("cart")
        .select("quantity")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .single();

      if (existingItem) {
        // Update existing item
        const { error } = await supabase
          .from("cart")
          .update({
            quantity: existingItem.quantity + quantity,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id)
          .eq("product_id", productId);

        if (error) throw error;
      } else {
        // Insert new item
        const { error } = await supabase.from("cart").insert({
          user_id: user.id,
          product_id: productId,
          quantity,
        });

        if (error) throw error;
      }
    } else {
      // Add to guest cart
      const cart = getGuestCartItems();
      const existingItem = cart.find((item) => item.id === productId);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.push({ id: productId, quantity });
      }

      saveGuestCartItems(cart);
    }

    // Update cart count display
    updateCartCountDisplay();
  } catch (error) {
    console.error("Error adding item to cart:", error);
  }
};

/**
 * Update item quantity in cart
 */
export const updateCartItemQuantity = async (
  productId: string,
  quantity: number,
): Promise<void> => {
  try {
    const user = await getCurrentUser();

    if (user) {
      // Update in database
      if (quantity <= 0) {
        await removeFromCart(productId);
      } else {
        const { error } = await supabase
          .from("cart")
          .update({
            quantity: Math.max(1, quantity),
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id)
          .eq("product_id", productId);

        if (error) throw error;
      }
    } else {
      // Update in guest cart
      const cart = getGuestCartItems();
      const updatedCart = cart.map((item) =>
        item.id === productId
          ? { ...item, quantity: Math.max(1, quantity) }
          : item,
      );

      saveGuestCartItems(updatedCart);
    }

    // Update cart count display
    updateCartCountDisplay();
  } catch (error) {
    console.error("Error updating cart item quantity:", error);
  }
};

/**
 * Remove item from cart
 */
export const removeFromCart = async (productId: string): Promise<void> => {
  try {
    const user = await getCurrentUser();

    if (user) {
      // Remove from database
      const { error } = await supabase
        .from("cart")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);

      if (error) throw error;
    } else {
      // Remove from guest cart
      const cart = getGuestCartItems();
      const updatedCart = cart.filter((item) => item.id !== productId);
      saveGuestCartItems(updatedCart);
    }

    // Update cart count display
    updateCartCountDisplay();
  } catch (error) {
    console.error("Error removing item from cart:", error);
  }
};

/**
 * Clear entire cart
 */
export const clearCart = async (): Promise<void> => {
  try {
    const user = await getCurrentUser();

    if (user) {
      // Clear database cart
      const { error } = await supabase
        .from("cart")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;
    } else {
      // Clear guest cart
      saveGuestCartItems([]);
    }

    // Update cart count display
    updateCartCountDisplay();
  } catch (error) {
    console.error("Error clearing cart:", error);
  }
};

/**
 * Get total item count in cart
 */
export const getCartItemCount = async (): Promise<number> => {
  try {
    const cart = await getCartItems();
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  } catch (error) {
    console.error("Error getting cart item count:", error);
    return 0;
  }
};

/**
 * Get total item count synchronously (for header component)
 */
export const getCartItemCountSync = (): number => {
  // For header component, use guest cart count if available
  // This will be updated when user state changes
  const guestCart = getGuestCartItems();
  return guestCart.reduce((sum, item) => sum + item.quantity, 0);
};

/**
 * Get cart count for current user state (guest or authenticated)
 */
export const getCurrentCartCount = async (): Promise<number> => {
  try {
    const user = await getCurrentUser();

    if (user) {
      // Get count from database for authenticated users
      const { data, error } = await supabase
        .from("cart")
        .select("quantity")
        .eq("user_id", user.id);

      if (error) throw error;

      return (data || []).reduce((sum, item) => sum + item.quantity, 0);
    } else {
      // Get count from localStorage for guests
      return getCartItemCountSync();
    }
  } catch (error) {
    console.error("Error getting current cart count:", error);
    return getCartItemCountSync();
  }
};

/**
 * Update cart count display across the app
 */
export const updateCartCountDisplay = (): void => {
  if (typeof window === "undefined") return;

  // Use async function in a non-blocking way
  getCurrentCartCount()
    .then((count) => {
      // Store current count for immediate access
      window.localStorage.setItem("current_cart_count", count.toString());
      // Dispatch event with the count
      window.dispatchEvent(
        new CustomEvent("cartUpdated", { detail: { count } }),
      );
    })
    .catch(() => {
      console.error("Error updating cart count display");
    });
};

/**
 * Get cached cart count for immediate display
 */
export const getCachedCartCount = (): number => {
  if (typeof window === "undefined") return 0;

  try {
    const cached = localStorage.getItem("current_cart_count");
    return cached ? parseInt(cached, 10) : getCartItemCountSync();
  } catch {
    return getCartItemCountSync();
  }
};

/**
 * Get total cart value (requires product data)
 */
export const calculateCartTotal = (
  cartItems: CartItemWithProduct[],
): number => {
  return cartItems.reduce((total, item) => {
    const price = item.discount_price || item.price;
    return total + price * item.quantity;
  }, 0);
};

/**
 * Check if item is in cart
 */
export const isInCart = async (productId: string): Promise<boolean> => {
  try {
    const cart = await getCartItems();
    return cart.some((item) => item.id === productId);
  } catch (error) {
    console.error("Error checking if item is in cart:", error);
    return false;
  }
};

/**
 * Get item quantity in cart
 */
export const getCartItemQuantity = async (
  productId: string,
): Promise<number> => {
  try {
    const cart = await getCartItems();
    const item = cart.find((item) => item.id === productId);
    return item ? item.quantity : 0;
  } catch (error) {
    console.error("Error getting cart item quantity:", error);
    return 0;
  }
};

/**
 * Initialize cart system on app load
 */
export const initializeCartSystem = async (): Promise<void> => {
  try {
    const user = await getCurrentUser();

    if (user) {
      // User is logged in - merge guest cart if exists
      await mergeGuestCartWithUserCart(user.id);
    }

    // Update cart count display
    updateCartCountDisplay();
  } catch (error) {
    console.error("Error initializing cart system:", error);
  }
};
