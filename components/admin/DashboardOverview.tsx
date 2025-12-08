"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { TrendingUp, Users } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const data = [
  { name: "Jan", sales: 4000, visitors: 2400 },
  { name: "Feb", sales: 3000, visitors: 1398 },
  { name: "Mar", sales: 2000, visitors: 9800 },
  { name: "Apr", sales: 2780, visitors: 3908 },
  { name: "May", sales: 1890, visitors: 4800 },
  { name: "Jun", sales: 2390, visitors: 3800 },
  { name: "Jul", sales: 3490, visitors: 4300 },
];

const recentActivity = [
  {
    id: 1,
    user: "John Doe",
    action: "membuat pesanan",
    time: "2 menit yang lalu",
    amount: 120,
  },
  {
    id: 2,
    user: "Jane Smith",
    action: "mendaftar",
    time: "1 jam yang lalu",
  },
  {
    id: 3,
    user: "Mike Johnson",
    action: "mengulas produk",
    time: "3 jam yang lalu",
    rating: 5,
  },
  {
    id: 4,
    user: "Sarah Wilson",
    action: "membuat pesanan",
    time: "5 jam yang lalu",
    amount: 350,
  },
];

export default function DashboardOverview() {
  return (
    <div className="space-y-6">
      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Sales Chart */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#2C3E50]">
              Ringkasan Pendapatan
            </h3>
            <div className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-600">
              <TrendingUp size={16} />
              +12.5%
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3498DB" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3498DB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#3498DB"
                  fillOpacity={1}
                  fill="url(#colorSales)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Visitors Chart */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#2C3E50]">
              Lalu Lintas Pengunjung
            </h3>
            <div className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600">
              <Users size={16} />
              +5.2%
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="visitors" fill="#2ECC71" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-6">
          <h3 className="text-lg font-bold text-[#2C3E50]">
            Aktivitas Terbaru
          </h3>
        </div>
        <div className="divide-y divide-gray-100">
          {recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-4 transition-colors hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 font-bold text-gray-600">
                  {activity.user.charAt(0)}
                </div>
                <div>
                  <p className="text-sm text-gray-900">
                    <span className="font-bold">{activity.user}</span>{" "}
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
              {activity.amount && (
                <span className="font-bold text-[#2C3E50]">
                  {formatCurrency(activity.amount)}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
