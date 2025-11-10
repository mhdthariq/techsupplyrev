"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import {
  getCartItems,
  updateCartItemQuantity,
  removeFromCart,
} from "@/lib/cart";

import { Trash2, Plus, Minus } from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  discount_price?: number;
  quantity: number;
  image_url: string;
}

interface CartLocalItem {
  id: string;
  quantity: number;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const loadCart = async () => {
      try {
        const cart = getCartItems();

        if (cart.length === 0) {
          setCartItems([]);
          setLoading(false);
          return;
        }

        const ids = cart.map((item) => item.id);
        const { data: products } = await supabase
          .from("products")
          .select("*")
          .in("id", ids);

        if (products) {
          const enrichedCart = cart.map((cartItem: CartLocalItem) => {
            const product = products.find((p) => p.id === cartItem.id);
            return {
              ...product,
              quantity: cartItem.quantity,
            };
          });
          setCartItems(enrichedCart);
        }
      } catch (error) {
        console.error("Error loading cart:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [supabase]);

  const updateQuantity = (id: string, change: number) => {
    const updated = cartItems.map((item) =>
      item.id === id
        ? { ...item, quantity: Math.max(1, item.quantity + change) }
        : item,
    );
    setCartItems(updated);

    const item = updated.find((item) => item.id === id);
    if (item) {
      updateCartItemQuantity(id, item.quantity);
    }
  };

  const removeItem = (id: string) => {
    const updated = cartItems.filter((item) => item.id !== id);
    setCartItems(updated);
    removeFromCart(id);
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.discount_price || item.price) * item.quantity,
    0,
  );
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="pt-28 pb-20 px-4">
          <div className="max-w-7xl mx-auto animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="pt-28 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-[#2C3E50] mb-8">
            Shopping Cart
          </h1>
          <p className="text-gray-600 mb-8">
            {cartItems.length} items in your cart
          </p>

          {cartItems.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-200">
                          <th className="text-left p-4 font-bold text-[#2C3E50]">
                            Product
                          </th>
                          <th className="text-center p-4 font-bold text-[#2C3E50]">
                            Price
                          </th>
                          <th className="text-center p-4 font-bold text-[#2C3E50]">
                            Quantity
                          </th>
                          <th className="text-center p-4 font-bold text-[#2C3E50]">
                            Total
                          </th>
                          <th className="text-center p-4 font-bold text-[#2C3E50]">
                            Remove
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {cartItems.map((item) => (
                          <tr
                            key={item.id}
                            className="border-b border-gray-100 hover:bg-gray-50 transition"
                          >
                            <td className="p-4">
                              <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
                                  <Image
                                    src={item.image_url || "/placeholder.svg"}
                                    alt={item.name}
                                    width={64}
                                    height={64}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900">
                                    {item.name}
                                  </h3>
                                </div>
                              </div>
                            </td>
                            <td className="text-center p-4">
                              <span className="text-[#3498DB] font-bold">
                                ${item.price.toFixed(2)}
                              </span>
                            </td>
                            <td className="text-center p-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => updateQuantity(item.id, -1)}
                                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition text-gray-600"
                                >
                                  <Minus size={14} />
                                </button>
                                <span className="w-12 text-center font-bold text-gray-900">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, 1)}
                                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition text-gray-600"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                            </td>
                            <td className="text-center p-4">
                              <span className="font-bold text-[#2C3E50]">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                            </td>
                            <td className="text-center p-4">
                              <button
                                onClick={() => removeItem(item.id)}
                                className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition"
                              >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <Link
                  href="/products"
                  className="inline-block mt-6 text-[#3498DB] hover:text-[#2980B9] font-bold"
                >
                  ← Continue Shopping
                </Link>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow border border-gray-200 p-6 sticky top-32">
                  <h3 className="text-xl font-bold text-[#2C3E50] mb-4">
                    Order Summary
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-bold text-[#2C3E50]">
                        ${subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-bold text-[#2C3E50]">
                        ${shipping.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-bold text-[#2C3E50]">
                        ${tax.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <hr className="my-4 border-gray-200" />

                  <div className="flex justify-between mb-6">
                    <span className="font-bold text-[#2C3E50]">Total</span>
                    <span className="text-2xl font-bold text-[#3498DB]">
                      ${total.toFixed(2)}
                    </span>
                  </div>

                  <Link
                    href="/checkout"
                    className="block w-full bg-[#3498DB] text-white text-center py-3 rounded-lg font-bold hover:bg-[#2980B9] transition mb-4"
                  >
                    Proceed to Checkout
                  </Link>

                  <Link
                    href="/products"
                    className="block w-full border-2 border-[#2C3E50] text-[#2C3E50] hover:bg-gray-100 py-3 rounded-lg font-bold text-center transition"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🛒</div>
              <h2 className="text-2xl font-bold text-[#2C3E50] mb-2">
                Your cart is empty
              </h2>
              <p className="text-gray-600 mb-6">
                Add some products to your cart and come back!
              </p>
              <Link
                href="/products"
                className="inline-block bg-[#3498DB] text-white px-8 py-3 rounded-lg hover:bg-[#2980B9] transition font-bold"
              >
                Start Shopping
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
