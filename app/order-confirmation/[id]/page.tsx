"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle, Package, MapPin, CreditCard } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  discount_amount: number;
  status: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_country: string;
  payment_method: string;
}

interface OrderItem {
  id: string;
  quantity: number;
  price_at_purchase: number;
  product: {
    name: string;
    image_url: string;
  };
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const loadOrder = async () => {
      if (!params.id) return;

      try {
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select("*")
          .eq("id", params.id)
          .single();

        if (orderError) throw orderError;
        setOrder(orderData);

        const { data: itemsData, error: itemsError } = await supabase
          .from("order_items")
          .select("*, product:products(name, image_url)")
          .eq("order_id", params.id);

        if (itemsError) throw itemsError;
        setItems(itemsData || []);
      } catch (error) {
        console.error("Error loading order:", error);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [params.id, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-28 pb-20">
        <div className="mx-auto max-w-3xl px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-32 rounded-xl bg-gray-200" />
            <div className="h-64 rounded-xl bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 pt-28 pb-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">
            Pesanan Tidak Ditemukan
          </h1>
          <p className="mb-8 text-gray-600">
            Maaf, kami tidak dapat menemukan detail pesanan yang Anda cari.
          </p>
          <Link
            href="/"
            className="rounded-lg bg-[#3498DB] px-6 py-3 font-bold text-white transition hover:bg-[#2980B9]"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-20">
      <div className="mx-auto max-w-3xl px-4">
        {/* Success Header */}
        <div className="mb-8 rounded-xl bg-white p-8 text-center shadow-sm">
          <div className="mb-4 flex justify-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-[#2C3E50]">
            Pesanan Dikonfirmasi!
          </h1>
          <p className="text-gray-600">
            Terima kasih telah berbelanja. Email konfirmasi akan segera dikirim
            ke email Anda.
          </p>
          <p className="mt-4 text-sm font-bold text-gray-500">
            ID Pesanan: {order.id}
          </p>
        </div>

        {/* Order Details */}
        <div className="space-y-6">
          {/* Shipping & Payment */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <MapPin className="text-[#3498DB]" />
                <h3 className="font-bold text-[#2C3E50]">Detail Pengiriman</h3>
              </div>
              <div className="text-sm text-gray-600">
                <p className="mb-1">{order.shipping_address}</p>
                <p className="mb-1">
                  {order.shipping_city}, {order.shipping_postal_code}
                </p>
                <p>{order.shipping_country}</p>
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <CreditCard className="text-[#3498DB]" />
                <h3 className="font-bold text-[#2C3E50]">Status Pesanan</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status Pembayaran</span>
                  <span className="font-bold text-green-600">Berhasil</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Metode</span>
                  <span className="font-bold text-gray-900 capitalize">
                    {order.payment_method.replace("-", " ")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tanggal</span>
                  <span className="font-bold text-gray-900">
                    {new Date(order.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-2">
              <Package className="text-[#3498DB]" />
              <h3 className="font-bold text-[#2C3E50]">Ringkasan Produk</h3>
            </div>
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-bold text-[#2C3E50]">
                      {item.product.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Jumlah: {item.quantity} x{" "}
                      {formatCurrency(item.price_at_purchase)}
                    </p>
                  </div>
                  <span className="font-bold text-[#2C3E50]">
                    {formatCurrency(item.price_at_purchase * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-gray-200 pt-6">
              <div className="space-y-2">
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Diskon</span>
                    <span>-{formatCurrency(order.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-[#2C3E50]">
                  <span>Total</span>
                  <span className="text-[#3498DB]">
                    {formatCurrency(order.total_amount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/"
            className="rounded-lg border-2 border-[#2C3E50] px-8 py-3 font-bold text-[#2C3E50] transition hover:bg-gray-100"
          >
            Kembali ke Beranda
          </Link>
          <Link
            href="/products"
            className="rounded-lg bg-[#3498DB] px-8 py-3 font-bold text-white transition hover:bg-[#2980B9]"
          >
            Lanjut Belanja
          </Link>
        </div>
      </div>
    </div>
  );
}
