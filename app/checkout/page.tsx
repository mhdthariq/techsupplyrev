"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getCartItems, clearCart } from "@/lib/cart";
import { formatCurrency } from "@/lib/utils";

import { Check, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  // ... (same as before)
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface User {
  id: string;
  email?: string;
}

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orderTotal, setOrderTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const searchParams = useSearchParams();
  const [couponCode, setCouponCode] = useState(
    searchParams.get("coupon") || "",
  );
  const [hasAutoApplied, setHasAutoApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [formData, setFormData] = useState({
    // ... same as before
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    country: "Indonesia",
    shippingMethod: "standard",
    paymentMethod: "credit-card",
  });
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const steps = [
    {
      number: 1,
      title: "Alamat Pengiriman",
      description: "Ke mana kami harus mengirim pesanan Anda?",
    },
    {
      number: 2,
      title: "Metode Pengiriman",
      description: "Seberapa cepat Anda membutuhkannya?",
    },
    {
      number: 3,
      title: "Pembayaran",
      description: "Bagaimana Anda ingin membayar?",
    },
    { number: 4, title: "Tinjauan", description: "Konfirmasi pesanan Anda" },
  ];

  useEffect(() => {
    const loadCheckout = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (authUser) {
          setUser(authUser);
          setFormData((prev) => ({ ...prev, email: authUser.email || "" }));
        }

        const cart = await getCartItems();

        if (cart.length === 0) {
          setCartItems([]);
          setOrderTotal(0);
          setLoading(false);
          return;
        }

        // Fetch product details for cart items
        const ids = cart.map((item) => item.id);
        const { data: products } = await supabase
          .from("products")
          .select("*")
          .in("id", ids);

        if (products) {
          const cartWithProducts: CartItem[] = cart.map((cartItem) => {
            const product = products.find((p) => p.id === cartItem.id);
            return {
              id: cartItem.id,
              name: product?.name || "Unknown Product",
              price: product?.discount_price || product?.price || 0,
              quantity: cartItem.quantity,
            };
          });

          setCartItems(cartWithProducts);

          const subtotal = cartWithProducts.reduce(
            (sum: number, item: CartItem) => sum + item.price * item.quantity,
            0,
          );
          setOrderTotal(subtotal);
        }
      } catch (error) {
        console.error("Error loading checkout:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCheckout();
  }, [supabase.auth, supabase]);

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
          discountAmount = orderTotal * (coupon.discount_value / 100);
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

  useEffect(() => {
    if (
      orderTotal > 0 &&
      couponCode &&
      !hasAutoApplied &&
      searchParams.get("coupon")
    ) {
      // We only auto-apply if it came from URL and we haven't tried yet
      const autoApply = async () => {
        // Re-implement apply logic or call applyCoupon if dependency warnings allow.
        // Since applyCoupon depends on state, calling it here is fine if included in deps or we ignore deps.
        // But applyCoupon is not in deps. I'll add it to deps or suppress.
        // Actually, simplest is to just call it.
        await applyCoupon();
      };
      autoApply();
      setHasAutoApplied(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderTotal, hasAutoApplied]);

  const getShippingCost = (method: string) => {
    switch (method) {
      case "standard":
        return 20000;
      case "express":
        return 50000;
      case "overnight":
        return 100000;
      default:
        return 20000;
    }
  };

  const shippingCost = getShippingCost(formData.shippingMethod);
  const subtotal = orderTotal;
  const tax = (subtotal - discount) * 0.11; // PPN 11%
  const total = subtotal + shippingCost + tax - discount;

  const handlePlaceOrder = async () => {
    try {
      if (!user) {
        toast({
          title: "Silakan login",
          description: "Anda harus login untuk membuat pesanan",
          variant: "destructive",
        });
        router.push("/auth/login");
        return;
      }

      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total_amount: total,
          discount_amount: discount,
          status: "pending",
          shipping_address: formData.address,
          shipping_city: formData.city,
          shipping_postal_code: formData.postalCode,
          shipping_country: formData.country,
          payment_method: formData.paymentMethod,
        })
        .select()
        .single();

      if (error) throw error;

      for (const item of cartItems) {
        await supabase.from("order_items").insert({
          order_id: order.id,
          product_id: item.id,
          quantity: item.quantity,
          price_at_purchase: item.price,
        });
      }

      clearCart();

      toast({
        title: "Pesanan berhasil dibuat!",
        description: `Pesanan #${order.id.slice(0, 8)} telah dikonfirmasi`,
        variant: "success",
      });
      router.push(`/order-confirmation/${order.id}`);
    } catch (error) {
      console.error("Error placing order:", error);
      toast({
        title: "Gagal membuat pesanan",
        description: "Silakan coba lagi atau hubungi support",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="px-4 pt-28 pb-20">
          <div className="mx-auto max-w-6xl animate-pulse space-y-4">
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
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-12 text-4xl font-bold text-[#2C3E50]">Checkout</h1>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              {/* Step Indicator */}
              <div className="mb-12">
                <div className="mb-8 flex items-center justify-between">
                  {steps.map((step, idx) => (
                    <div key={step.number} className="flex flex-1 items-center">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full font-bold transition ${
                          currentStep >= step.number
                            ? "bg-[#3498DB] text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {currentStep > step.number ? (
                          <Check size={20} />
                        ) : (
                          step.number
                        )}
                      </div>
                      {idx < steps.length - 1 && (
                        <div
                          className={`mx-2 h-1 flex-1 transition ${
                            currentStep > step.number
                              ? "bg-[#3498DB]"
                              : "bg-gray-200"
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-[#2C3E50]">
                    {steps[currentStep - 1].title}
                  </h2>
                  <p className="text-gray-600">
                    {steps[currentStep - 1].description}
                  </p>
                </div>
              </div>

              {/* Step 1: Shipping Address */}
              {currentStep === 1 && (
                <div className="mb-6 rounded-lg border border-gray-200 bg-white p-8 shadow">
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block font-bold text-[#2C3E50]">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 outline-none focus:border-[#3498DB]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-2 block font-bold text-[#2C3E50]">
                          Nama Depan
                        </label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              firstName: e.target.value,
                            })
                          }
                          className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 outline-none focus:border-[#3498DB]"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block font-bold text-[#2C3E50]">
                          Nama Belakang
                        </label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              lastName: e.target.value,
                            })
                          }
                          className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 outline-none focus:border-[#3498DB]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block font-bold text-[#2C3E50]">
                        Alamat
                      </label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 outline-none focus:border-[#3498DB]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-2 block font-bold text-[#2C3E50]">
                          Kota
                        </label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) =>
                            setFormData({ ...formData, city: e.target.value })
                          }
                          className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 outline-none focus:border-[#3498DB]"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block font-bold text-[#2C3E50]">
                          Provinsi
                        </label>
                        <input
                          type="text"
                          value={formData.province}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              province: e.target.value,
                            })
                          }
                          className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 outline-none focus:border-[#3498DB]"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-2 block font-bold text-[#2C3E50]">
                          Kode Pos
                        </label>
                        <input
                          type="text"
                          value={formData.postalCode}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              postalCode: e.target.value,
                            })
                          }
                          className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 outline-none focus:border-[#3498DB]"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block font-bold text-[#2C3E50]">
                          Negara
                        </label>
                        <input
                          type="text"
                          value={formData.country}
                          disabled
                          className="w-full rounded-lg border-2 border-gray-200 bg-gray-100 px-4 py-2 text-gray-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Shipping Method */}
              {currentStep === 2 && (
                <div className="mb-6 rounded-lg border border-gray-200 bg-white p-8 shadow">
                  <div className="space-y-3">
                    {[
                      {
                        id: "standard",
                        name: "Reguler",
                        desc: "5-7 hari kerja",
                        price: 20000,
                      },
                      {
                        id: "express",
                        name: "Express",
                        desc: "2-3 hari kerja",
                        price: 50000,
                      },
                      {
                        id: "overnight",
                        name: "Instan / Same Day",
                        desc: "Hari yang sama",
                        price: 100000,
                      },
                    ].map((method) => (
                      <label
                        key={method.id}
                        className="flex cursor-pointer items-center rounded-lg border-2 border-gray-300 p-4 transition hover:border-[#3498DB]"
                      >
                        <input
                          type="radio"
                          name="shipping"
                          value={method.id}
                          checked={formData.shippingMethod === method.id}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              shippingMethod: e.target.value,
                            })
                          }
                          className="mr-4"
                        />
                        <div className="flex-1">
                          <p className="font-bold text-[#2C3E50]">
                            {method.name}
                          </p>
                          <p className="text-sm text-gray-600">{method.desc}</p>
                        </div>
                        <span className="font-bold text-[#3498DB]">
                          {formatCurrency(method.price)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              {currentStep === 3 && (
                <div className="mb-6 rounded-lg border border-gray-200 bg-white p-8 shadow">
                  <div className="space-y-4">
                    {[
                      { id: "credit-card", name: "Kartu Kredit / Debit" },
                      {
                        id: "midtrans",
                        name: "Midtrans (Transfer Bank, E-Wallet)",
                      },
                      { id: "cod", name: "Bayar di Tempat (COD)" },
                    ].map((method) => (
                      <label
                        key={method.id}
                        className={`flex cursor-pointer items-center rounded-lg border-2 p-4 transition ${
                          formData.paymentMethod === method.id
                            ? "border-[#3498DB] bg-blue-50"
                            : "border-gray-300 hover:border-[#3498DB]"
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method.id}
                          checked={formData.paymentMethod === method.id}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              paymentMethod: e.target.value,
                            })
                          }
                          className="mr-4"
                        />
                        <span className="font-bold text-[#2C3E50]">
                          {method.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <div className="mb-6 rounded-lg border border-gray-200 bg-white p-8 shadow">
                  <h3 className="mb-4 font-bold text-[#2C3E50]">
                    Detail Pesanan
                  </h3>
                  <div className="space-y-3 text-sm">
                    <p>
                      <span className="font-bold text-[#2C3E50]">Email:</span>{" "}
                      {formData.email}
                    </p>
                    <p>
                      <span className="font-bold text-[#2C3E50]">
                        Penerima:
                      </span>{" "}
                      {formData.firstName} {formData.lastName}
                    </p>
                    <p>
                      <span className="font-bold text-[#2C3E50]">Alamat:</span>{" "}
                      {formData.address}, {formData.city}, {formData.province}{" "}
                      {formData.postalCode}, {formData.country}
                    </p>
                    <p>
                      <span className="font-bold text-[#2C3E50]">
                        Metode Pembayaran:
                      </span>{" "}
                      {formData.paymentMethod === "credit-card"
                        ? "Kartu Kredit"
                        : formData.paymentMethod === "midtrans"
                          ? "Midtrans"
                          : "COD"}
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-4">
                {currentStep > 1 && (
                  <button
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="rounded-lg border-2 border-[#2C3E50] px-6 py-3 font-bold text-[#2C3E50] transition hover:bg-gray-100"
                  >
                    Kembali
                  </button>
                )}
                {currentStep < 4 && (
                  <button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="ml-auto flex items-center gap-2 rounded-lg bg-[#3498DB] px-6 py-3 font-bold text-white transition hover:bg-[#2980B9]"
                  >
                    Lanjut <ChevronRight size={20} />
                  </button>
                )}
                {currentStep === 4 && (
                  <button
                    onClick={handlePlaceOrder}
                    className="ml-auto rounded-lg bg-[#3498DB] px-8 py-3 text-lg font-bold text-white transition hover:bg-[#2980B9]"
                  >
                    Buat Pesanan
                  </button>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-lg border border-gray-200 bg-gray-50 p-6">
                <h3 className="mb-6 font-bold text-[#2C3E50]">
                  Ringkasan Pesanan
                </h3>

                {/* Coupon Code */}
                <div className="mb-6">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Kode Kupon"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 rounded-lg border-2 border-gray-300 px-3 py-2 text-sm"
                    />
                    <button
                      onClick={applyCoupon}
                      className="rounded-lg bg-[#3498DB] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#2980B9]"
                    >
                      Terapkan
                    </button>
                  </div>
                </div>

                <div className="mb-6 space-y-3 rounded-lg bg-white p-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-bold">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pengiriman</span>
                    <span className="font-bold">
                      {formatCurrency(shippingCost)}
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
                    <span className="font-bold">{formatCurrency(tax)}</span>
                  </div>
                </div>

                <div className="border-t-2 border-gray-300 pt-4">
                  <div className="flex justify-between">
                    <span className="font-bold text-[#2C3E50]">Total</span>
                    <span className="text-2xl font-bold text-[#3498DB]">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
