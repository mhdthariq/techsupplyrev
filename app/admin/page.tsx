"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminStats from "@/components/admin/AdminStats";
import DashboardOverview from "@/components/admin/DashboardOverview";
import OrderList from "@/components/admin/OrderList";
import UserList from "@/components/admin/UserList";
import ProductManager from "@/components/admin/ProductManager";
import BannerManager from "@/components/admin/BannerManager";
import CouponManager from "@/components/admin/CouponManager";

import type { Product, Banner, Coupon } from "@/lib/types";

// Types for local state (can be moved to separate file)
interface User {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (!authUser) {
          router.push("/auth/admin/login");
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("is_admin, first_name, last_name")
          .eq("id", authUser.id)
          .single();

        if (!profile?.is_admin) {
          router.push("/");
          return;
        }

        setUser({
          ...authUser,
          first_name: profile.first_name,
          last_name: profile.last_name,
        });
        setIsAdmin(true);

        // Load data
        const [productsData, bannersData, couponsData] = await Promise.all([
          supabase.from("products").select("*"),
          supabase.from("banners").select("*"),
          supabase.from("coupons").select("*"),
        ]);

        if (productsData.data) setProducts(productsData.data);
        if (bannersData.data) setBanners(bannersData.data);
        if (couponsData.data) setCoupons(couponsData.data);
      } catch (error) {
        console.error("Error checking admin status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#3498DB]"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-xl font-bold text-red-600">
          Akses ditolak. Diperlukan hak akses admin.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleLogout={handleLogout}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1 p-8 pt-20 transition-all duration-300 md:ml-64 md:pt-8">
        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            <div>
              <h2 className="mb-6 text-2xl font-bold text-[#2C3E50]">
                Ringkasan Dashboard
              </h2>
              <AdminStats
                productsCount={products.length}
                activeBannersCount={banners.filter((b) => b.active).length}
                activeCouponsCount={coupons.filter((c) => c.active).length}
                userName={
                  user?.first_name
                    ? `${user.first_name} ${user.last_name || ""}`
                    : "Administrator"
                }
              />
            </div>
            <DashboardOverview />
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && <OrderList />}

        {/* Users Tab */}
        {activeTab === "users" && <UserList />}

        {/* Products Tab */}
        {activeTab === "products" && (
          <ProductManager initialProducts={products} />
        )}

        {/* Banners Tab */}
        {activeTab === "banners" && <BannerManager initialBanners={banners} />}

        {/* Coupons Tab */}
        {activeTab === "coupons" && <CouponManager initialCoupons={coupons} />}
      </div>
    </div>
  );
}
