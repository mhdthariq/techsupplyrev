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
        const cart = await getCartItems();

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

  const updateQuantity = async (id: string, change: number) => {
    const updated = cartItems.map((item) =>
      item.id === id
        ? { ...item, quantity: Math.max(1, item.quantity + change) }
        : item,
    );
    setCartItems(updated);

    const item = updated.find((item) => item.id === id);
    if (item) {
      await updateCartItemQuantity(id, item.quantity);
    }
  };

  const removeItem = async (id: string) => {
    const updated = cartItems.filter((item) => item.id !== id);
    setCartItems(updated);
    await removeFromCart(id);
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
        <div className="px-4 pt-28 pb-20">
          <div className="mx-auto max-w-7xl animate-pulse space-y-4">
            <div className="h-8 w-1/3 rounded bg-gray-200" />
            <div className="h-64 rounded bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 pt-28 pb-20">
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-8 text-4xl font-bold text-[#2C3E50]">
            Shopping Cart
          </h1>
          <p className="mb-8 text-gray-600">
            {cartItems.length} items in your cart
          </p>

          {cartItems.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-200">
                          <th className="p-4 text-left font-bold text-[#2C3E50]">
                            Product
                          </th>
                          <th className="p-4 text-center font-bold text-[#2C3E50]">
                            Price
                          </th>
                          <th className="p-4 text-center font-bold text-[#2C3E50]">
                            Quantity
                          </th>
                          <th className="p-4 text-center font-bold text-[#2C3E50]">
                            Total
                          </th>
                          <th className="p-4 text-center font-bold text-[#2C3E50]">
                            Remove
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {cartItems.map((item) => (
                          <tr
                            key={item.id}
                            className="border-b border-gray-100 transition hover:bg-gray-50"
                          >
                            <td className="p-4">
                              <div className="flex items-center gap-4">
                                <div className="h-16 w-16 overflow-hidden rounded bg-gray-100">
                                  <Image
                                    src={item.image_url || "/placeholder.svg"}
                                    alt={item.name}
                                    width={64}
                                    height={64}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900">
                                    {item.name}
                                  </h3>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              <span className="font-bold text-[#3498DB]">
                                ${item.price.toFixed(2)}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => updateQuantity(item.id, -1)}
                                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition hover:bg-gray-100"
                                >
                                  <Minus size={14} />
                                </button>
                                <span className="w-12 text-center font-bold text-gray-900">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, 1)}
                                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition hover:bg-gray-100"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              <span className="font-bold text-[#2C3E50]">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <button
                                onClick={() => removeItem(item.id)}
                                className="rounded-full p-2 text-red-500 transition hover:bg-red-50 hover:text-red-700"
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
                  className="mt-6 inline-block font-bold text-[#3498DB] hover:text-[#2980B9]"
                >
                  ← Continue Shopping
                </Link>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="sticky top-32 rounded-lg border border-gray-200 bg-white p-6 shadow">
                  <h3 className="mb-4 text-xl font-bold text-[#2C3E50]">
                    Order Summary
                  </h3>

                  <div className="mb-4 space-y-2">
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

                  <div className="mb-6 flex justify-between">
                    <span className="font-bold text-[#2C3E50]">Total</span>
                    <span className="text-2xl font-bold text-[#3498DB]">
                      ${total.toFixed(2)}
                    </span>
                  </div>

                  <Link
                    href="/checkout"
                    className="mb-4 block w-full rounded-lg bg-[#3498DB] py-3 text-center font-bold text-white transition hover:bg-[#2980B9]"
                  >
                    Proceed to Checkout
                  </Link>

                  <Link
                    href="/products"
                    className="block w-full rounded-lg border-2 border-[#2C3E50] py-3 text-center font-bold text-[#2C3E50] transition hover:bg-gray-100"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="mb-4 text-6xl">🛒</div>
              <h2 className="mb-2 text-2xl font-bold text-[#2C3E50]">
                Your cart is empty
              </h2>
              <p className="mb-6 text-gray-600">
                Add some products to your cart and come back!
              </p>
              <Link
                href="/products"
                className="inline-block rounded-lg bg-[#3498DB] px-8 py-3 font-bold text-white transition hover:bg-[#2980B9]"
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
