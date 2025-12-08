"use client";

import { useState, useEffect } from "react";
import { Mail, User as UserIcon, MoreVertical } from "lucide-react";
import { getAllUsers } from "@/lib/database";
import type { Profile } from "@/lib/types";
import { TableSkeleton } from "@/components/skeleton-loader";

export default function UserList() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await getAllUsers();
        setUsers(data);
      } catch (error) {
        console.error("Error loading users:", error);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  if (loading) {
    return <TableSkeleton rows={5} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#2C3E50]">Pengguna</h2>
        <div className="flex gap-2">
          <span className="rounded-lg bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600">
            Total: {users.length}
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="p-4 text-left font-semibold text-gray-600">
                Pengguna
              </th>
              <th className="p-4 text-left font-semibold text-gray-600">
                Email
              </th>
              <th className="p-4 text-left font-semibold text-gray-600">
                Tanggal Bergabung
              </th>
              <th className="p-4 text-left font-semibold text-gray-600">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="transition-colors hover:bg-gray-50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                      <UserIcon size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {user.first_name || user.last_name
                          ? `${user.first_name || ""} ${user.last_name || ""}`
                          : "User"}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-gray-600">
                  <div className="flex items-center gap-1">
                    <Mail size={12} />
                    {user.email}
                  </div>
                </td>
                <td className="p-4 text-gray-600">
                  {new Date(user.created_at).toLocaleDateString("id-ID")}
                </td>
                <td className="p-4">
                  <button className="text-gray-400 transition-colors hover:text-gray-600">
                    <MoreVertical size={20} />
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
