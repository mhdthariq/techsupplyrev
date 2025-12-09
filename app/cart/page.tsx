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
import { formatCurrency } from "@/lib/utils";

import { Trash2, Plus, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const { toast } = useToast();

  const supabase = createClient();

  // ... (useEffect remains same, I will assume it's correct context) ...

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

  const applyCoupon = async () => {
    try {
      const { data: coupon } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", couponCode.toUpperCase())
        .eq("active", true)
        .single();

      if (coupon) {
        let discountAmount = 0;
        if (coupon.discount_type === "percentage") {
          discountAmount = subtotal * (coupon.discount_value / 100);
        } else {
          discountAmount = coupon.discount_value;
        }
        setDiscount(discountAmount);
        toast({
          title: "Kupon Berhasil",
          description: "Diskon telah diterapkan",
          variant: "success",
        });
      } else {
        toast({
          title: "Kupon Tidak Valid",
          description: "Kode kupon tidak ditemukan atau kadaluarsa",
          variant: "destructive",
        });
        setDiscount(0);
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      toast({
        title: "Error",
        description: "Gagal menerapkan kupon",
        variant: "destructive",
      });
    }
  };

  const shipping = subtotal > 750000 ? 0 : 20000;
  const tax = (subtotal - discount) * 0.11;
  const total = subtotal + shipping + tax - discount;

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
            Keranjang Belanja
          </h1>
          <p className="mb-8 text-gray-600">
            {cartItems.length} item di keranjang Anda
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
                            Produk
                          </th>
                          <th className="p-4 text-center font-bold text-[#2C3E50]">
                            Harga
                          </th>
                          <th className="p-4 text-center font-bold text-[#2C3E50]">
                            Jumlah
                          </th>
                          <th className="p-4 text-center font-bold text-[#2C3E50]">
                            Total
                          </th>
                          <th className="p-4 text-center font-bold text-[#2C3E50]">
                            Hapus
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
                              <div className="flex items-start gap-4">
                                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                                  <Image
                                    src={item.image_url || "/placeholder.svg"}
                                    alt={item.name}
                                    width={64}
                                    height={64}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <div>
                                  <h3
                                    className="line-clamp-2 font-semibold text-gray-900"
                                    title={item.name}
                                  >
                                    {item.name}
                                  </h3>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              {item.discount_price &&
                              item.discount_price < item.price ? (
                                <div className="flex flex-col items-center">
                                  <span className="text-xs text-gray-500 line-through">
                                    {formatCurrency(item.price)}
                                  </span>
                                  <span className="font-bold text-[#3498DB]">
                                    {formatCurrency(item.discount_price)}
                                  </span>
                                </div>
                              ) : (
                                <span className="font-bold text-[#3498DB]">
                                  {formatCurrency(item.price)}
                                </span>
                              )}
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
                                {formatCurrency(
                                  (item.discount_price || item.price) *
                                    item.quantity,
                                )}
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
                  ← Lanjut Belanja
                </Link>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="sticky top-32 rounded-lg border border-gray-200 bg-white p-6 shadow">
                  <h3 className="mb-4 text-xl font-bold text-[#2C3E50]">
                    Ringkasan Pesanan
                  </h3>

                  {/* Coupon Input */}
                  <div className="mb-6">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Kode Kupon"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1 rounded-lg border-2 border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#3498DB]"
                      />
                      <button
                        onClick={applyCoupon}
                        className="rounded-lg bg-[#3498DB] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#2980B9]"
                      >
                        Terapkan
                      </button>
                    </div>
                  </div>

                  <div className="mb-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-bold text-[#2C3E50]">
                        {formatCurrency(subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pengiriman</span>
                      <span className="font-bold text-[#2C3E50]">
                        {formatCurrency(shipping)}
                      </span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Diskon</span>
                        <span className="font-bold">
                          -{formatCurrency(discount)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">PPN (11%)</span>
                      <span className="font-bold text-[#2C3E50]">
                        {formatCurrency(tax)}
                      </span>
                    </div>
                  </div>

                  <hr className="my-4 border-gray-200" />

                  <div className="mb-6 flex justify-between">
                    <span className="font-bold text-[#2C3E50]">Total</span>
                    <span className="text-2xl font-bold text-[#3498DB]">
                      {formatCurrency(total)}
                    </span>
                  </div>

                  <Link
                    href={`/checkout${discount > 0 ? `?coupon=${couponCode}` : ""}`}
                    className="mb-4 block w-full rounded-lg bg-[#3498DB] py-3 text-center font-bold text-white transition hover:bg-[#2980B9]"
                  >
                    Lanjut ke Pembayaran
                  </Link>

                  <Link
                    href="/products"
                    className="block w-full rounded-lg border-2 border-[#2C3E50] py-3 text-center font-bold text-[#2C3E50] transition hover:bg-gray-100"
                  >
                    Lanjut Belanja
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="mb-4 text-6xl">🛒</div>
              <h2 className="mb-2 text-2xl font-bold text-[#2C3E50]">
                Keranjang Anda kosong
              </h2>
              <p className="mb-6 text-gray-600">
                Tambahkan beberapa produk ke keranjang dan kembali lagi!
              </p>
              <Link
                href="/products"
                className="inline-block rounded-lg bg-[#3498DB] px-8 py-3 font-bold text-white transition hover:bg-[#2980B9]"
              >
                Mulai Belanja
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
