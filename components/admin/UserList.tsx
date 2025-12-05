"use client";

import { useState } from "react";
import { Mail, Shield, User as UserIcon, MoreVertical } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "customer";
  joinedDate: string;
  ordersCount: number;
}

const mockUsers: User[] = [
  {
    id: "USR-001",
    name: "Admin User",
    email: "admin@techsupply.co",
    role: "admin",
    joinedDate: "2024-01-01",
    ordersCount: 0,
  },
  {
    id: "USR-002",
    name: "John Doe",
    email: "john@example.com",
    role: "customer",
    joinedDate: "2024-02-15",
    ordersCount: 5,
  },
  {
    id: "USR-003",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "customer",
    joinedDate: "2024-03-10",
    ordersCount: 2,
  },
];

export default function UserList() {
  const [users] = useState<User[]>(mockUsers);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#2C3E50]">Users</h2>
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
                User
              </th>
              <th className="p-4 text-left font-semibold text-gray-600">
                Role
              </th>
              <th className="p-4 text-left font-semibold text-gray-600">
                Joined Date
              </th>
              <th className="p-4 text-left font-semibold text-gray-600">
                Orders
              </th>
              <th className="p-4 text-left font-semibold text-gray-600">
                Action
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
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Mail size={12} />
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                      user.role === "admin"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {user.role === "admin" && <Shield size={12} />}
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </td>
                <td className="p-4 text-gray-600">{user.joinedDate}</td>
                <td className="p-4 text-gray-600">{user.ordersCount}</td>
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
