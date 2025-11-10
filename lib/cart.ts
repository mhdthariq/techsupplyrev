"use client";

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

/**
 * Get cart items from localStorage
 */
export const getCartItems = (): CartItem[] => {
  if (typeof window === "undefined") return [];

  try {
    const cart = localStorage.getItem("cart");
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    console.error("Error parsing cart from localStorage:", error);
    return [];
  }
};

/**
 * Save cart items to localStorage and dispatch update event
 */
export const saveCartItems = (items: CartItem[]): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem("cart", JSON.stringify(items));
    // Dispatch custom event to update cart count in header
    window.dispatchEvent(new CustomEvent("cartUpdated"));
  } catch (error) {
    console.error("Error saving cart to localStorage:", error);
  }
};

/**
 * Add item to cart
 */
export const addToCart = (productId: string, quantity: number = 1): void => {
  const cart = getCartItems();
  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ id: productId, quantity });
  }

  saveCartItems(cart);
};

/**
 * Update item quantity in cart
 */
export const updateCartItemQuantity = (productId: string, quantity: number): void => {
  const cart = getCartItems();
  const updatedCart = cart.map((item) =>
    item.id === productId
      ? { ...item, quantity: Math.max(1, quantity) }
      : item
  );

  saveCartItems(updatedCart);
};

/**
 * Remove item from cart
 */
export const removeFromCart = (productId: string): void => {
  const cart = getCartItems();
  const updatedCart = cart.filter((item) => item.id !== productId);
  saveCartItems(updatedCart);
};

/**
 * Clear entire cart
 */
export const clearCart = (): void => {
  saveCartItems([]);
};

/**
 * Get total item count in cart
 */
export const getCartItemCount = (): number => {
  const cart = getCartItems();
  return cart.reduce((sum, item) => sum + item.quantity, 0);
};

/**
 * Get total cart value (requires product data)
 */
export const calculateCartTotal = (cartItems: CartItemWithProduct[]): number => {
  return cartItems.reduce((total, item) => {
    const price = item.discount_price || item.price;
    return total + (price * item.quantity);
  }, 0);
};

/**
 * Check if item is in cart
 */
export const isInCart = (productId: string): boolean => {
  const cart = getCartItems();
  return cart.some((item) => item.id === productId);
};

/**
 * Get item quantity in cart
 */
export const getCartItemQuantity = (productId: string): number => {
  const cart = getCartItems();
  const item = cart.find((item) => item.id === productId);
  return item ? item.quantity : 0;
};
