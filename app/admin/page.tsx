"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

import { useToast } from "@/hooks/use-toast";
import {
  LayoutDashboard,
  Package,
  ImageIcon,
  Tag,
  LogOut,
  Plus,
  Trash2,
  Edit2,
} from "lucide-react";

interface User {
  id: string;
  email?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  discount_price: number | null;
  category: string;
  in_stock: boolean;
}

interface Banner {
  id: string;
  title: string;
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

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    discount_price: "",
    category: "",
  });
  const [newBanner, setNewBanner] = useState({
    title: "",
    description: "",
    link: "",
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
          router.push("/auth/login");
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", authUser.id)
          .single();

        if (!profile?.is_admin) {
          router.push("/");
          return;
        }

        setUser(authUser);
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
        })
        .select()
        .single();

      if (error) throw error;

      setProducts([data, ...products]);
      setNewProduct({ name: "", price: "", discount_price: "", category: "" });
      toast({
        title: "Product added successfully!",
        description: `${data.name} has been added to your store`,
        variant: "success",
      });
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Failed to add product",
        description: "Please check all fields and try again",
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
        title: "Product deleted",
        description: productToDelete
          ? `${productToDelete.name} has been removed`
          : "Product has been removed",
        variant: "success",
        action: {
          label: "Undo",
          onClick: () => {
            toast({
              title: "Undo not implemented",
              description: "Please add the product again manually",
              variant: "warning",
            });
          },
        },
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Failed to delete product",
        description: "Please try again",
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
          image_url: "/placeholder.svg",
          active: true,
        })
        .select()
        .single();

      if (error) throw error;
      setBanners([...banners, data]);
      setNewBanner({ title: "", description: "", link: "" });
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
      <div className="min-h-screen bg-gray-50">
        <div className="pt-28 pb-20 px-4 flex items-center justify-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="pt-28 pb-20 px-4 flex items-center justify-center">
          <p className="text-red-600">
            Access denied. Admin privileges required.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Admin Header */}
          <div className="flex items-center justify-between mb-8 bg-white rounded-lg p-6 shadow">
            <div>
              <h1 className="text-3xl font-bold text-[#2C3E50]">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">Welcome back, {user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold transition"
            >
              <LogOut size={20} /> Logout
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 bg-white rounded-lg p-4 shadow flex-wrap">
            {[
              { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
              { id: "products", label: "Products", icon: Package },
              { id: "banners", label: "Banners", icon: ImageIcon },
              { id: "coupons", label: "Coupons", icon: Tag },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition ${
                    activeTab === tab.id
                      ? "bg-[#3498DB] text-white"
                      : "bg-gray-100 text-[#2C3E50] hover:bg-gray-200"
                  }`}
                >
                  <Icon size={20} /> {tab.label}
                </button>
              );
            })}
          </div>

          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                {
                  label: "Total Products",
                  value: products.length,
                  color: "blue",
                },
                {
                  label: "Active Banners",
                  value: banners.filter((b) => b.active).length,
                  color: "green",
                },
                {
                  label: "Active Coupons",
                  value: coupons.filter((c) => c.active).length,
                  color: "yellow",
                },
                { label: "Admin User", value: user?.email, color: "purple" },
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-lg p-6 shadow">
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold text-[#2C3E50] mt-2">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Products Tab */}
          {activeTab === "products" && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg p-6 shadow">
                <h2 className="text-2xl font-bold text-[#2C3E50] mb-4">
                  Add New Product
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <input
                    type="text"
                    placeholder="Product name"
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, name: e.target.value })
                    }
                    className="border-2 border-gray-300 rounded-lg px-3 py-2"
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, price: e.target.value })
                    }
                    className="border-2 border-gray-300 rounded-lg px-3 py-2"
                  />
                  <input
                    type="number"
                    placeholder="Discount price"
                    value={newProduct.discount_price}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        discount_price: e.target.value,
                      })
                    }
                    className="border-2 border-gray-300 rounded-lg px-3 py-2"
                  />
                  <select
                    value={newProduct.category}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, category: e.target.value })
                    }
                    className="border-2 border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="">Select category</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Peripherals">Peripherals</option>
                    <option value="Storage">Storage</option>
                  </select>
                  <button
                    onClick={addProduct}
                    className="bg-[#3498DB] hover:bg-[#2980B9] text-white px-4 py-2 rounded-lg font-bold flex items-center justify-center gap-2"
                  >
                    <Plus size={20} /> Add
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left p-4 font-bold text-[#2C3E50]">
                        Name
                      </th>
                      <th className="text-left p-4 font-bold text-[#2C3E50]">
                        Price
                      </th>
                      <th className="text-left p-4 font-bold text-[#2C3E50]">
                        Discount
                      </th>
                      <th className="text-left p-4 font-bold text-[#2C3E50]">
                        Category
                      </th>
                      <th className="text-left p-4 font-bold text-[#2C3E50]">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr
                        key={product.id}
                        className="border-t border-gray-200 hover:bg-gray-50"
                      >
                        <td className="p-4">{product.name}</td>
                        <td className="p-4">${product.price.toFixed(2)}</td>
                        <td className="p-4">
                          {product.discount_price
                            ? `$${product.discount_price.toFixed(2)}`
                            : "-"}
                        </td>
                        <td className="p-4">{product.category}</td>
                        <td className="p-4 flex gap-2">
                          <button className="text-blue-500 hover:text-blue-700">
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="text-red-500 hover:text-red-700"
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

          {/* Banners Tab */}
          {activeTab === "banners" && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg p-6 shadow">
                <h2 className="text-2xl font-bold text-[#2C3E50] mb-4">
                  Add New Banner
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input
                    type="text"
                    placeholder="Banner title"
                    value={newBanner.title}
                    onChange={(e) =>
                      setNewBanner({ ...newBanner, title: e.target.value })
                    }
                    className="border-2 border-gray-300 rounded-lg px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={newBanner.description}
                    onChange={(e) =>
                      setNewBanner({
                        ...newBanner,
                        description: e.target.value,
                      })
                    }
                    className="border-2 border-gray-300 rounded-lg px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="Link"
                    value={newBanner.link}
                    onChange={(e) =>
                      setNewBanner({ ...newBanner, link: e.target.value })
                    }
                    className="border-2 border-gray-300 rounded-lg px-3 py-2"
                  />
                  <button
                    onClick={addBanner}
                    className="bg-[#3498DB] hover:bg-[#2980B9] text-white px-4 py-2 rounded-lg font-bold flex items-center justify-center gap-2"
                  >
                    <Plus size={20} /> Add
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {banners.map((banner) => (
                  <div
                    key={banner.id}
                    className="bg-white rounded-lg p-4 shadow"
                  >
                    <h3 className="font-bold text-[#2C3E50]">{banner.title}</h3>
                    <div className="mt-2 flex gap-2">
                      <button className="text-blue-500 hover:text-blue-700">
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => deleteBanner(banner.id)}
                        className="text-red-500 hover:text-red-700"
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
              <div className="bg-white rounded-lg p-6 shadow">
                <h2 className="text-2xl font-bold text-[#2C3E50] mb-4">
                  Add New Coupon
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <input
                    type="text"
                    placeholder="Coupon code"
                    value={newCoupon.code}
                    onChange={(e) =>
                      setNewCoupon({ ...newCoupon, code: e.target.value })
                    }
                    className="border-2 border-gray-300 rounded-lg px-3 py-2"
                  />
                  <select
                    value={newCoupon.discount_type}
                    onChange={(e) =>
                      setNewCoupon({
                        ...newCoupon,
                        discount_type: e.target.value,
                      })
                    }
                    className="border-2 border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Discount value"
                    value={newCoupon.discount_value}
                    onChange={(e) =>
                      setNewCoupon({
                        ...newCoupon,
                        discount_value: e.target.value,
                      })
                    }
                    className="border-2 border-gray-300 rounded-lg px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="Max uses"
                    className="border-2 border-gray-300 rounded-lg px-3 py-2"
                  />
                  <button
                    onClick={addCoupon}
                    className="bg-[#3498DB] hover:bg-[#2980B9] text-white px-4 py-2 rounded-lg font-bold flex items-center justify-center gap-2"
                  >
                    <Plus size={20} /> Add
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left p-4 font-bold text-[#2C3E50]">
                        Code
                      </th>
                      <th className="text-left p-4 font-bold text-[#2C3E50]">
                        Type
                      </th>
                      <th className="text-left p-4 font-bold text-[#2C3E50]">
                        Value
                      </th>
                      <th className="text-left p-4 font-bold text-[#2C3E50]">
                        Status
                      </th>
                      <th className="text-left p-4 font-bold text-[#2C3E50]">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((coupon) => (
                      <tr
                        key={coupon.id}
                        className="border-t border-gray-200 hover:bg-gray-50"
                      >
                        <td className="p-4 font-bold">{coupon.code}</td>
                        <td className="p-4">{coupon.discount_type}</td>
                        <td className="p-4">${coupon.discount_value}</td>
                        <td className="p-4">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-bold">
                            Active
                          </span>
                        </td>
                        <td className="p-4 flex gap-2">
                          <button className="text-blue-500 hover:text-blue-700">
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => deleteCoupon(coupon.id)}
                            className="text-red-500 hover:text-red-700"
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
    </div>
  );
}
