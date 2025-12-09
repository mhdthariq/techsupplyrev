"use client";

import { useState, useEffect, useCallback } from "react";
import { Eye, Truck, CheckCircle, Clock, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getAllOrders, updateOrderStatus } from "@/lib/database";
import { useToast } from "@/hooks/use-toast";
import type { Order } from "@/lib/types";
import { TableSkeleton } from "@/components/skeleton-loader";

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { toast } = useToast();

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllOrders();
      setOrders(data);
    } catch {
      toast({
        title: "Error",
        description: "Gagal memuat pesanan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const result = await updateOrderStatus(
        orderId,
        newStatus as Order["status"],
      );
      if (result.success) {
        toast({
          title: "Status Diperbarui",
          description: `Status pesanan #${orderId.slice(-6)} berhasil diperbarui`,
          variant: "success",
        });
        loadOrders();
      } else {
        throw new Error(result.error);
      }
    } catch {
      toast({
        title: "Gagal Update Status",
        description: "Terjadi kesalahan saat memperbarui status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "delivered":
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "processing":
        return <Clock size={16} />;
      case "shipped":
        return <Truck size={16} />;
      case "delivered":
      case "completed":
        return <CheckCircle size={16} />;
      default:
        return null;
    }
  };

  const filteredOrders =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  if (loading) {
    return <TableSkeleton rows={5} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#2C3E50]">Pesanan</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-[#3498DB]"
        >
          <option value="all">Semua Status</option>
          <option value="processing">Diproses</option>
          <option value="shipped">Dikirim</option>
          <option value="delivered">Diterima</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="p-4 text-left font-semibold text-gray-600">
                ID Pesanan
              </th>
              <th className="p-4 text-left font-semibold text-gray-600">
                Total
              </th>
              <th className="p-4 text-left font-semibold text-gray-600">
                Status
              </th>
              <th className="p-4 text-left font-semibold text-gray-600">
                Update
              </th>
              <th className="p-4 text-left font-semibold text-gray-600">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  Tidak ada pesanan ditemukan.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="transition-colors hover:bg-gray-50"
                >
                  <td className="p-4 font-medium text-[#3498DB]">
                    {order.id.slice(0, 8)}...
                  </td>
                  <td className="p-4 font-medium text-gray-900">
                    {formatCurrency(order.total_amount)}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(
                        order.status,
                      )}`}
                    >
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-4">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusUpdate(order.id, e.target.value)
                      }
                      className="rounded border-gray-300 p-1 text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-gray-400 transition-colors hover:text-[#3498DB]"
                    >
                      <Eye size={20} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div
          className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-all duration-200"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl ring-1 ring-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-xl font-bold text-[#2C3E50]">
                  Detail Pesanan
                </h3>
                <p className="text-sm text-gray-500">ID: {selectedOrder.id}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="font-bold text-[#3498DB]">Pengiriman</h4>
                  <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600">
                    <p className="mb-1 font-semibold text-gray-900">Alamat:</p>
                    <p>{selectedOrder.shipping_address}</p>
                    <p>
                      {selectedOrder.shipping_city},{" "}
                      {selectedOrder.shipping_postal_code}
                    </p>
                    <p className="mt-2 text-xs font-medium tracking-wide text-gray-500 uppercase">
                      {selectedOrder.shipping_country}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-[#3498DB]">Info Pesanan</h4>
                  <div className="space-y-2 rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Tanggal:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(selectedOrder.created_at).toLocaleDateString(
                          "id-ID",
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Status:</span>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(selectedOrder.status)}`}
                      >
                        {selectedOrder.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Metode Pembayaran:</span>
                      <span className="font-medium text-gray-900 capitalize">
                        {selectedOrder.payment_method?.replace("-", " ")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-3 font-bold text-[#3498DB]">Item Produk</h4>
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-700">
                      <tr>
                        <th className="p-3 text-left font-semibold">Produk</th>
                        <th className="p-3 text-right font-semibold">Harga</th>
                        <th className="p-3 text-center font-semibold">Qty</th>
                        <th className="p-3 text-right font-semibold">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {selectedOrder.order_items?.length ? (
                        selectedOrder.order_items.map((item) => (
                          <tr key={item.id}>
                            <td className="p-3 font-medium text-gray-900">
                              {item.product?.name || "Unknown Product"}
                            </td>
                            <td className="p-3 text-right text-gray-600">
                              {formatCurrency(item.price_at_purchase)}
                            </td>
                            <td className="p-3 text-center text-gray-600">
                              {item.quantity}
                            </td>
                            <td className="p-3 text-right font-semibold text-gray-900">
                              {formatCurrency(
                                item.price_at_purchase * item.quantity,
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="p-4 text-center text-gray-500 italic"
                          >
                            Data produk tidak tersedia
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="bg-gray-50 font-semibold text-gray-900">
                      <tr>
                        <td
                          colSpan={3}
                          className="p-3 text-right text-gray-600"
                        >
                          Subtotal
                        </td>
                        <td className="p-3 text-right">
                          {formatCurrency(
                            selectedOrder.order_items?.reduce(
                              (sum, item) =>
                                sum + item.price_at_purchase * item.quantity,
                              0,
                            ) || 0,
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td
                          colSpan={3}
                          className="p-3 text-right text-green-600"
                        >
                          Diskon
                        </td>
                        <td className="p-3 text-right text-green-600">
                          -{formatCurrency(selectedOrder.discount_amount || 0)}
                        </td>
                      </tr>
                      <tr className="border-t border-gray-300 bg-blue-50/50">
                        <td
                          colSpan={3}
                          className="p-3 px-4 text-right text-base"
                        >
                          Grand Total
                        </td>
                        <td className="p-3 text-right text-base text-[#3498DB]">
                          {formatCurrency(selectedOrder.total_amount)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-lg bg-gray-100 px-6 py-2.5 font-bold text-gray-600 transition-colors hover:bg-gray-200"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
