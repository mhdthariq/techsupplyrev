"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit2 } from "lucide-react";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminStats from "@/components/admin/AdminStats";
import ProductTable from "@/components/admin/ProductTable";
import DashboardOverview from "@/components/admin/DashboardOverview";
import OrderList from "@/components/admin/OrderList";
import UserList from "@/components/admin/UserList";
import { formatCurrency } from "@/lib/utils";

interface User {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  discount_price: number | null;
  category: string;
  brand: string;
  in_stock: boolean;
}

interface Banner {
  id: string;
  title: string;
  description: string;
  link: string;
  image_url: string;
  active: boolean;
}

interface Coupon {
  id: string;
  code: string;
  discount_value: number;
  discount_type: string;
  active: boolean;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    discount_price: "",
    category: "",
    brand: "",
  });
  const [newBanner, setNewBanner] = useState({
    title: "",
    description: "",
    link: "",
    image_url: "",
  });
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discount_type: "percentage",
    discount_value: "",
  });

  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

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

  const addProduct = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .insert({
          name: newProduct.name,
          price: Number.parseFloat(newProduct.price),
          discount_price: newProduct.discount_price
            ? Number.parseFloat(newProduct.discount_price)
            : null,
          category: newProduct.category,
          brand: newProduct.brand,
        })
        .select()
        .single();

      if (error) throw error;

      setProducts([data, ...products]);
      setNewProduct({
        name: "",
        price: "",
        discount_price: "",
        category: "",
        brand: "",
      });
      toast({
        title: "Produk berhasil ditambahkan!",
        description: `${data.name} telah ditambahkan ke toko Anda`,
        variant: "success",
      });
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Gagal menambahkan produk",
        description: "Mohon periksa semua kolom dan coba lagi",
        variant: "destructive",
      });
    }
  };

  const deleteProduct = async (id: string) => {
    const productToDelete = products.find((p) => p.id === id);
    try {
      await supabase.from("products").delete().eq("id", id);
      setProducts(products.filter((p) => p.id !== id));
      toast({
        title: "Produk dihapus",
        description: productToDelete
          ? `${productToDelete.name} telah dihapus`
          : "Produk telah dihapus",
        variant: "success",
        action: {
          label: "Undo",
          onClick: () => {
            toast({
              title: "Undo belum diimplementasikan",
              description: "Mohon tambahkan produk lagi secara manual",
              variant: "warning",
            });
          },
        },
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Gagal menghapus produk",
        description: "Mohon coba lagi",
        variant: "destructive",
      });
    }
  };

  const addBanner = async () => {
    try {
      const { data, error } = await supabase
        .from("banners")
        .insert({
          title: newBanner.title,
          description: newBanner.description,
          link: newBanner.link,
          image_url: newBanner.image_url || "/placeholder.svg",
          active: true,
        })
        .select()
        .single();

      if (error) throw error;
      setBanners([...banners, data]);
      setNewBanner({ title: "", description: "", link: "", image_url: "" });
    } catch (error) {
      console.error("Error adding banner:", error);
    }
  };

  const deleteBanner = async (id: string) => {
    try {
      await supabase.from("banners").delete().eq("id", id);
      setBanners(banners.filter((b) => b.id !== id));
    } catch (error) {
      console.error("Error deleting banner:", error);
    }
  };

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
                    : user?.email
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
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#2C3E50]">Produk</h2>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-bold text-[#2C3E50]">
                Tambah Produk Baru
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                <input
                  type="text"
                  placeholder="Nama produk"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  className="rounded-lg border border-gray-300 px-4 py-2 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-[#3498DB]"
                />
                <input
                  type="number"
                  placeholder="Harga"
                  value={newProduct.price}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, price: e.target.value })
                  }
                  className="rounded-lg border border-gray-300 px-4 py-2 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-[#3498DB]"
                />
                <input
                  type="number"
                  placeholder="Harga diskon"
                  value={newProduct.discount_price}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      discount_price: e.target.value,
                    })
                  }
                  className="rounded-lg border border-gray-300 px-4 py-2 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-[#3498DB]"
                />
                <input
                  type="text"
                  placeholder="Kategori"
                  value={newProduct.category}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, category: e.target.value })
                  }
                  className="rounded-lg border border-gray-300 px-4 py-2 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-[#3498DB]"
                />
                <input
                  type="text"
                  placeholder="Merek"
                  value={newProduct.brand}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, brand: e.target.value })
                  }
                  className="rounded-lg border border-gray-300 px-4 py-2 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-[#3498DB]"
                />
                <button
                  onClick={addProduct}
                  className="flex items-center justify-center gap-2 rounded-lg bg-[#3498DB] px-4 py-2 font-bold text-white shadow-sm transition-colors hover:bg-[#2980B9]"
                >
                  <Plus size={20} /> Add
                </button>
              </div>
            </div>

            <ProductTable products={products} deleteProduct={deleteProduct} />
          </div>
        )}

        {/* Banners Tab */}
        {activeTab === "banners" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#2C3E50]">Banner</h2>
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-bold text-[#2C3E50]">
                Tambah Banner Baru
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <input
                  type="text"
                  placeholder="Judul banner"
                  value={newBanner.title}
                  onChange={(e) =>
                    setNewBanner({ ...newBanner, title: e.target.value })
                  }
                  className="rounded-lg border border-gray-300 px-4 py-2 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-[#3498DB]"
                />
                <input
                  type="text"
                  placeholder="Deskripsi"
                  value={newBanner.description}
                  onChange={(e) =>
                    setNewBanner({
                      ...newBanner,
                      description: e.target.value,
                    })
                  }
                  className="rounded-lg border border-gray-300 px-4 py-2 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-[#3498DB]"
                />
                <input
                  type="text"
                  placeholder="Tautan"
                  value={newBanner.link}
                  onChange={(e) =>
                    setNewBanner({ ...newBanner, link: e.target.value })
                  }
                  className="rounded-lg border border-gray-300 px-4 py-2 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-[#3498DB]"
                />
                <input
                  type="text"
                  placeholder="URL Gambar"
                  value={newBanner.image_url}
                  onChange={(e) =>
                    setNewBanner({ ...newBanner, image_url: e.target.value })
                  }
                  className="rounded-lg border border-gray-300 px-4 py-2 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-[#3498DB]"
                />
                <button
                  onClick={addBanner}
                  className="flex items-center justify-center gap-2 rounded-lg bg-[#3498DB] px-4 py-2 font-bold text-white shadow-sm transition-colors hover:bg-[#2980B9]"
                >
                  <Plus size={20} /> Add
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {banners.map((banner) => (
                <div
                  key={banner.id}
                  className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
                >
                  <div>
                    <h3 className="font-bold text-[#2C3E50]">{banner.title}</h3>
                    <span className="mt-2 inline-block rounded bg-green-50 px-2 py-1 text-sm text-green-600">
                      Aktif
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button className="rounded-lg p-2 text-blue-500 transition-colors hover:bg-blue-50">
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => deleteBanner(banner.id)}
                      className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Coupons Tab */}
        {activeTab === "coupons" && (
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
                      <td className="p-4 font-medium text-gray-900">
                        {coupon.code}
                      </td>
                      <td className="p-4 text-gray-600">
                        {coupon.discount_type}
                      </td>
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
        )}
      </div>
    </div>
  );
}
