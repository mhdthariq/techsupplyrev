"use client";

import { useState, useEffect, useCallback } from "react";
import { Eye, Truck, CheckCircle, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getAllOrders, updateOrderStatus } from "@/lib/database";
import { useToast } from "@/hooks/use-toast";
import type { Order } from "@/lib/types";
import { TableSkeleton } from "@/components/skeleton-loader";

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
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
    } catch (error) {
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
                    <button className="text-gray-400 transition-colors hover:text-[#3498DB]">
                      <Eye size={20} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
