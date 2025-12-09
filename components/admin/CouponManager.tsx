"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";

interface Coupon {
  id: string;
  code: string;
  discount_value: number;
  discount_type: string;
  active: boolean;
}

interface CouponManagerProps {
  initialCoupons: Coupon[];
}

export default function CouponManager({ initialCoupons }: CouponManagerProps) {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discount_type: "percentage",
    discount_value: "",
  });

  const supabase = createClient();

  const addCoupon = async () => {
    try {
      const { data, error } = await supabase
        .from("coupons")
        .insert({
          code: newCoupon.code.toUpperCase(),
          discount_type: newCoupon.discount_type,
          discount_value: Number.parseFloat(newCoupon.discount_value),
          active: true,
        })
        .select()
        .single();

      if (error) throw error;
      setCoupons([...coupons, data]);
      setNewCoupon({
        code: "",
        discount_type: "percentage",
        discount_value: "",
      });
    } catch (error) {
      console.error("Error adding coupon:", error);
    }
  };

  const deleteCoupon = async (id: string) => {
    try {
      await supabase.from("coupons").delete().eq("id", id);
      setCoupons(coupons.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Error deleting coupon:", error);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#2C3E50]">Kupon</h2>
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-bold text-[#2C3E50]">
          Tambah Kupon Baru
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <input
            type="text"
            placeholder="Kode kupon"
            value={newCoupon.code}
            onChange={(e) =>
              setNewCoupon({ ...newCoupon, code: e.target.value })
            }
            className="rounded-lg border border-gray-300 px-4 py-2 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-[#3498DB]"
          />
          <select
            value={newCoupon.discount_type}
            onChange={(e) =>
              setNewCoupon({
                ...newCoupon,
                discount_type: e.target.value,
              })
            }
            className="rounded-lg border border-gray-300 px-4 py-2 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-[#3498DB]"
          >
            <option value="percentage">Persentase</option>
            <option value="fixed">Tetap</option>
          </select>
          <input
            type="number"
            placeholder="Nilai diskon"
            value={newCoupon.discount_value}
            onChange={(e) =>
              setNewCoupon({
                ...newCoupon,
                discount_value: e.target.value,
              })
            }
            className="rounded-lg border border-gray-300 px-4 py-2 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-[#3498DB]"
          />
          <input
            type="text"
            placeholder="Maks penggunaan"
            className="rounded-lg border border-gray-300 px-4 py-2 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-[#3498DB]"
          />
          <button
            onClick={addCoupon}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#3498DB] px-4 py-2 font-bold text-white shadow-sm transition-colors hover:bg-[#2980B9]"
          >
            <Plus size={20} /> Add
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="p-4 text-left font-semibold text-gray-600">
                Kode
              </th>
              <th className="p-4 text-left font-semibold text-gray-600">
                Tipe
              </th>
              <th className="p-4 text-left font-semibold text-gray-600">
                Nilai
              </th>
              <th className="p-4 text-left font-semibold text-gray-600">
                Status
              </th>
              <th className="p-4 text-left font-semibold text-gray-600">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {coupons.map((coupon) => (
              <tr
                key={coupon.id}
                className="transition-colors hover:bg-gray-50"
              >
                <td className="p-4 font-medium text-gray-900">{coupon.code}</td>
                <td className="p-4 text-gray-600">{coupon.discount_type}</td>
                <td className="p-4 text-gray-600">
                  {coupon.discount_type === "percentage"
                    ? `${coupon.discount_value}%`
                    : formatCurrency(coupon.discount_value)}
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    Aktif
                  </span>
                </td>
                <td className="flex gap-3 p-4">
                  <button className="text-blue-500 transition-colors hover:text-blue-700">
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => deleteCoupon(coupon.id)}
                    className="text-red-500 transition-colors hover:text-red-700"
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
  );
}
