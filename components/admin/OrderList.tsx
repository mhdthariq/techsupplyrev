"use client";

import { useState } from "react";
import { Eye, Truck, CheckCircle, Clock } from "lucide-react";

interface Order {
  id: string;
  customer: string;
  date: string;
  total: number;
  status: "processing" | "shipped" | "delivered";
  items: number;
}

// Mock data - replace with actual Supabase fetch
const mockOrders: Order[] = [
  {
    id: "ORD-001",
    customer: "John Doe",
    date: "2024-03-20",
    total: 120.0,
    status: "processing",
    items: 3,
  },
  {
    id: "ORD-002",
    customer: "Jane Smith",
    date: "2024-03-19",
    total: 250.5,
    status: "shipped",
    items: 1,
  },
  {
    id: "ORD-003",
    customer: "Mike Johnson",
    date: "2024-03-18",
    total: 89.99,
    status: "delivered",
    items: 2,
  },
];

export default function OrderList() {
  const [orders] = useState<Order[]>(mockOrders);
  const [filter, setFilter] = useState("all");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "delivered":
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
        return <CheckCircle size={16} />;
      default:
        return null;
    }
  };

  const filteredOrders =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#2C3E50]">Orders</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-[#3498DB]"
        >
          <option value="all">All Status</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="p-4 text-left font-semibold text-gray-600">
                Order ID
              </th>
              <th className="p-4 text-left font-semibold text-gray-600">
                Customer
              </th>
              <th className="p-4 text-left font-semibold text-gray-600">
                Date
              </th>
              <th className="p-4 text-left font-semibold text-gray-600">
                Items
              </th>
              <th className="p-4 text-left font-semibold text-gray-600">
                Total
              </th>
              <th className="p-4 text-left font-semibold text-gray-600">
                Status
              </th>
              <th className="p-4 text-left font-semibold text-gray-600">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="transition-colors hover:bg-gray-50">
                <td className="p-4 font-medium text-[#3498DB]">{order.id}</td>
                <td className="p-4 text-gray-900">{order.customer}</td>
                <td className="p-4 text-gray-600">{order.date}</td>
                <td className="p-4 text-gray-600">{order.items} items</td>
                <td className="p-4 font-medium text-gray-900">
                  ${order.total.toFixed(2)}
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
                  <button className="text-gray-400 transition-colors hover:text-[#3498DB]">
                    <Eye size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
