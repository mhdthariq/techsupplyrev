interface AdminStatsProps {
  productsCount: number;
  activeBannersCount: number;
  activeCouponsCount: number;
  userName?: string;
}

export default function AdminStats({
  productsCount,
  activeBannersCount,
  activeCouponsCount,
  userName,
}: AdminStatsProps) {
  const stats = [
    {
      label: "Total Products",
      value: productsCount,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Active Banners",
      value: activeBannersCount,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Active Coupons",
      value: activeCouponsCount,
      color: "bg-yellow-50 text-yellow-600",
    },
    {
      label: "Admin User",
      value: userName || "Admin",
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <p className="text-sm font-medium text-gray-500">{stat.label}</p>
          <div className="mt-4 flex items-baseline">
            <p
              className={`text-2xl font-bold ${stat.color} rounded-lg px-3 py-1`}
            >
              {stat.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
