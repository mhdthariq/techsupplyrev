"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  User,
  Package,
  MessageSquare,
  Settings,
  LogOut,
  Edit,
  Save,
  X,
  Star,
  Calendar,
  MapPin,
  Phone,
  Mail,
  ShoppingBag,
  Trash2,
  Heart,
  ShoppingCart,
  Camera,
} from "lucide-react";

import ReviewModal from "@/components/reviews/ReviewModal";

import { getCurrentUser, signOut, updatePassword } from "@/lib/auth";
import {
  getUserProfile,
  updateUserProfile,
  getUserOrders,
  getUserReviews,
  getReviewableProducts,
  deleteReview,
  getWishlist,
  removeFromWishlist,
} from "@/lib/database";
import { useToast } from "@/hooks/use-toast";
import type {
  User as AuthUser,
  Order,
  Review,
  UpdateProfileData,
} from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { convertImageToWebP } from "@/lib/image-utils";

interface WishlistProduct {
  id: string;
  name: string;
  price: number;
  image_url: string;
  in_stock: boolean;
}

// Mock data for wishlist
const mockWishlist: WishlistProduct[] = [
  {
    id: "1",
    name: "Wireless Noise-Canceling Headphones",
    price: 299.99,
    image_url: "/placeholder.svg",
    in_stock: true,
  },
  {
    id: "2",
    name: "Mechanical Gaming Keyboard",
    price: 159.99,
    image_url: "/placeholder.svg",
    in_stock: true,
  },
  {
    id: "3",
    name: "Ultra-Wide Monitor 34",
    price: 499.99,
    image_url: "/placeholder.svg",
    in_stock: false,
  },
];

function AccountContent() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [wishlist, setWishlist] = useState<WishlistProduct[]>(mockWishlist);
  const [reviewableProducts, setReviewableProducts] = useState<
    Array<{
      product_id: string;
      order_id: string;
      hasReview: boolean;
      product?: {
        id: string;
        name: string;
        image_url: string;
        price: number;
      };
      order: { id: string; status: string; created_at: string };
    }>
  >([]);

  const searchParams = useSearchParams();
  const initialTab =
    (searchParams.get("tab") as
      | "profile"
      | "orders"
      | "reviews"
      | "wishlist"
      | "settings") || "profile";

  const [activeTab, setActiveTab] = useState<
    "profile" | "orders" | "reviews" | "wishlist" | "settings"
  >(initialTab);

  // Update active tab when URL changes
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (
      tab &&
      ["profile", "orders", "reviews", "wishlist", "settings"].includes(tab)
    ) {
      setActiveTab(
        tab as "profile" | "orders" | "reviews" | "wishlist" | "settings",
      );
    }
  }, [searchParams]);

  const [isLoading, setIsLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{
    product_id: string;
    order_id: string;
    product?: {
      id: string;
      name: string;
      image_url: string;
      price: number;
    };
  } | null>(null);

  const [profileForm, setProfileForm] = useState({
    full_name: "",
    phone: "",
    address: "",
    city: "",
    postal_code: "",
    country: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const router = useRouter();
  const { toast } = useToast();

  /* eslint-disable react-hooks/exhaustive-deps */
  const loadUserData = async () => {
    try {
      const currentUser = await getCurrentUser();

      if (!currentUser) {
        router.push("/auth/login");
        return;
      }

      setUser(currentUser);

      // Load profile data
      const profile = await getUserProfile(currentUser.id);
      if (profile) {
        setProfileForm({
          full_name: profile.first_name
            ? `${profile.first_name} ${profile.last_name || ""}`.trim()
            : currentUser.name || "",
          phone: profile.phone || "",
          address: profile.address || "",
          city: profile.city || "",
          postal_code: profile.postal_code || "",
          country: profile.country || "",
        });
        setAvatarUrl(profile.avatar_url || currentUser.avatar_url || "");
      }

      // Load orders
      const userOrders = await getUserOrders(currentUser.id);
      setOrders(userOrders);

      // Load reviews
      const userReviews = await getUserReviews(currentUser.id);
      setReviews(userReviews);

      // Load reviewable products
      const reviewable = await getReviewableProducts(currentUser.id);
      setReviewableProducts(reviewable);

      // Load wishlist
      const wishlistData = await getWishlist(currentUser.id);
      const mappedWishlist = wishlistData
        .filter((item) => item.product) // Ensure product exists
        .map((item) => ({
          id: item.product!.id,
          name: item.product!.name,
          price: item.product!.price,
          image_url: item.product!.image_url,
          in_stock: item.product!.in_stock,
        }));
      setWishlist(mappedWishlist);
    } catch (error) {
      console.error("Error loading user data:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data pengguna",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [router, toast]);

  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;

    const file = e.target.files[0];
    setIsUploadingAvatar(true);

    try {
      // Convert to WebP
      const webpFile = await convertImageToWebP(file);

      const supabase = createClient();
      const fileName = `${user.id}-${Date.now()}.webp`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, webpFile, {
          contentType: "image/webp",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName);

      // Update profile
      const updateData: UpdateProfileData = {
        avatar_url: publicUrl,
      };

      const result = await updateUserProfile(user.id, updateData);

      if (result.success) {
        setAvatarUrl(publicUrl);
        toast({
          title: "Foto Profil Diperbarui",
          description: "Foto profil Anda berhasil diperbarui",
          variant: "success",
        });

        // Refresh full user data to sync everything
        loadUserData();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Gagal Mengunggah",
        description: "Gagal mengunggah foto profil",
        variant: "destructive",
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleProfileUpdate = async () => {
    if (!user) return;

    try {
      // Split full name into first and last name
      const nameParts = profileForm.full_name.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      const updateData = {
        first_name: firstName,
        last_name: lastName,
        phone: profileForm.phone,
        address: profileForm.address,
        city: profileForm.city,
        postal_code: profileForm.postal_code,
        country: profileForm.country,
      };

      const result = await updateUserProfile(user.id, updateData);
      if (result.success) {
        toast({
          title: "Profil Diperbarui",
          description: "Profil Anda berhasil diperbarui",
          variant: "success",
        });
        setIsEditingProfile(false);
        loadUserData(); // Reload data
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Gagal Memperbarui",
        description:
          error instanceof Error ? error.message : "Gagal memperbarui profil",
        variant: "destructive",
      });
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Password Tidak Cocok",
        description: "Password baru tidak cocok",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Password Terlalu Pendek",
        description: "Password harus minimal 6 karakter",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await updatePassword(passwordForm.newPassword);
      if (!result.error) {
        toast({
          title: "Password Diperbarui",
          description: "Password Anda berhasil diperbarui",
          variant: "success",
        });
        setShowPasswordForm(false);
        setPasswordForm({ newPassword: "", confirmPassword: "" });
      }
    } catch {
      toast({
        title: "Gagal Memperbarui",
        description: "Gagal memperbarui password",
        variant: "destructive",
      });
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!user) return;

    try {
      const result = await deleteReview(reviewId, user.id);
      if (result.success) {
        toast({
          title: "Ulasan Dihapus",
          description: "Ulasan Anda berhasil dihapus",
          variant: "success",
        });
        loadUserData(); // Reload data
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Gagal Menghapus",
        description:
          error instanceof Error ? error.message : "Gagal menghapus ulasan",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
      case "completed":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#3498DB] border-t-transparent"></div>
          <p className="text-gray-600">Memuat akun Anda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 pt-28 pb-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="mb-2 text-4xl font-bold text-[#2C3E50]">
              Akun Saya
            </h1>
            <p className="text-gray-600">
              Kelola profil, pesanan, dan ulasan Anda
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {/* Sidebar Menu */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24 overflow-hidden rounded-lg bg-white shadow-sm">
                <nav className="flex flex-col">
                  <button
                    onClick={() => {
                      setActiveTab("profile");
                      router.push("/account?tab=profile", { scroll: false });
                    }}
                    className={`flex items-center gap-3 px-6 py-4 text-left font-semibold transition-colors ${
                      activeTab === "profile"
                        ? "border-l-4 border-[#2980B9] bg-[#3498DB] text-white"
                        : "text-[#2C3E50] hover:bg-gray-50"
                    }`}
                  >
                    <User size={20} /> Profil
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("orders");
                      router.push("/account?tab=orders", { scroll: false });
                    }}
                    className={`flex items-center gap-3 px-6 py-4 text-left font-semibold transition-colors ${
                      activeTab === "orders"
                        ? "border-l-4 border-[#2980B9] bg-[#3498DB] text-white"
                        : "text-[#2C3E50] hover:bg-gray-50"
                    }`}
                  >
                    <Package size={20} /> Pesanan ({orders.length})
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("reviews");
                      router.push("/account?tab=reviews", { scroll: false });
                    }}
                    className={`flex items-center gap-3 px-6 py-4 text-left font-semibold transition-colors ${
                      activeTab === "reviews"
                        ? "border-l-4 border-[#2980B9] bg-[#3498DB] text-white"
                        : "text-[#2C3E50] hover:bg-gray-50"
                    }`}
                  >
                    <MessageSquare size={20} /> Ulasan ({reviews.length})
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("wishlist");
                      router.push("/account?tab=wishlist", { scroll: false });
                    }}
                    className={`flex items-center gap-3 px-6 py-4 text-left font-semibold transition-colors ${
                      activeTab === "wishlist"
                        ? "border-l-4 border-[#2980B9] bg-[#3498DB] text-white"
                        : "text-[#2C3E50] hover:bg-gray-50"
                    }`}
                  >
                    <Heart size={20} /> Wishlist ({wishlist.length})
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("settings");
                      router.push("/account?tab=settings", { scroll: false });
                    }}
                    className={`flex items-center gap-3 px-6 py-4 text-left font-semibold transition-colors ${
                      activeTab === "settings"
                        ? "border-l-4 border-[#2980B9] bg-[#3498DB] text-white"
                        : "text-[#2C3E50] hover:bg-gray-50"
                    }`}
                  >
                    <Settings size={20} /> Pengaturan
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 border-t border-gray-200 px-6 py-4 text-left font-semibold text-red-600 transition-colors hover:bg-red-50"
                  >
                    <LogOut size={20} /> Keluar
                  </button>
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div className="rounded-lg bg-white p-8 shadow-sm">
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-[#2C3E50]">
                      Profile Information
                    </h2>
                    <button
                      onClick={() => setIsEditingProfile(!isEditingProfile)}
                      className="flex items-center gap-2 rounded-lg bg-[#3498DB] px-4 py-2 text-white transition-colors hover:bg-[#2980B9]"
                    >
                      {isEditingProfile ? <X size={18} /> : <Edit size={18} />}
                      {isEditingProfile ? "Batal" : "Edit"}
                    </button>
                  </div>

                  <div className="mb-8 flex items-center gap-6 border-b border-gray-100 pb-8">
                    <div className="group relative">
                      <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-gray-50 bg-gray-100">
                        {avatarUrl ? (
                          <Image
                            src={avatarUrl}
                            alt="Profile"
                            width={96}
                            height={96}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-[#3498DB] text-3xl font-bold text-white">
                            {user?.name?.[0]?.toUpperCase() || "U"}
                          </div>
                        )}
                      </div>
                      {isEditingProfile && (
                        <label className="absolute right-0 bottom-0 cursor-pointer rounded-full bg-[#3498DB] p-2 text-white shadow-lg transition-transform hover:scale-110 hover:bg-[#2980B9]">
                          <div
                            className={isUploadingAvatar ? "animate-spin" : ""}
                          >
                            <Camera size={16} />
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={isUploadingAvatar}
                          />
                        </label>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#2C3E50]">
                        {user?.name || "Pengguna"}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {isEditingProfile
                          ? "Klik ikon kamera untuk mengubah foto"
                          : "Anggota TechSupply"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#2C3E50]">
                        <Mail size={16} className="mr-2 inline" />
                        Email
                      </label>
                      <input
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-600"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#2C3E50]">
                        <User size={16} className="mr-2 inline" />
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        value={profileForm.full_name}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            full_name: e.target.value,
                          })
                        }
                        disabled={!isEditingProfile}
                        placeholder="Masukkan nama lengkap Anda"
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-[#3498DB] focus:outline-none disabled:bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#2C3E50]">
                        <Phone size={16} className="mr-2 inline" />
                        Telepon
                      </label>
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            phone: e.target.value,
                          })
                        }
                        disabled={!isEditingProfile}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-[#3498DB] focus:outline-none disabled:bg-gray-50"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-semibold text-[#2C3E50]">
                        <MapPin size={16} className="mr-2 inline" />
                        Alamat
                      </label>
                      <input
                        type="text"
                        value={profileForm.address}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            address: e.target.value,
                          })
                        }
                        disabled={!isEditingProfile}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-[#3498DB] focus:outline-none disabled:bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#2C3E50]">
                        Kota
                      </label>
                      <input
                        type="text"
                        value={profileForm.city}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            city: e.target.value,
                          })
                        }
                        disabled={!isEditingProfile}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-[#3498DB] focus:outline-none disabled:bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#2C3E50]">
                        Kode Pos
                      </label>
                      <input
                        type="text"
                        value={profileForm.postal_code}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            postal_code: e.target.value,
                          })
                        }
                        disabled={!isEditingProfile}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-[#3498DB] focus:outline-none disabled:bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#2C3E50]">
                        Negara
                      </label>
                      <input
                        type="text"
                        value={profileForm.country}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            country: e.target.value,
                          })
                        }
                        disabled={!isEditingProfile}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-[#3498DB] focus:outline-none disabled:bg-gray-50"
                      />
                    </div>
                  </div>

                  {isEditingProfile && (
                    <button
                      onClick={handleProfileUpdate}
                      className="mt-6 flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-700"
                    >
                      <Save size={18} />
                      Simpan Perubahan
                    </button>
                  )}
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === "orders" && (
                <div className="rounded-lg bg-white p-8 shadow-sm">
                  <h2 className="mb-6 text-2xl font-bold text-[#2C3E50]">
                    Riwayat Pesanan
                  </h2>

                  {orders.length === 0 ? (
                    <div className="py-12 text-center">
                      <ShoppingBag
                        size={48}
                        className="mx-auto mb-4 text-gray-400"
                      />
                      <p className="text-lg text-gray-600">Belum ada pesanan</p>
                      <p className="mb-6 text-gray-500">
                        Mulai berbelanja untuk melihat pesanan Anda di sini
                      </p>
                      <button
                        onClick={() => router.push("/products")}
                        className="rounded-lg bg-[#3498DB] px-6 py-3 text-white transition-colors hover:bg-[#2980B9]"
                      >
                        Browse Products
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          className="rounded-lg border border-gray-200 p-6 transition-colors hover:border-[#3498DB]"
                        >
                          <div className="mb-4 flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-bold text-[#2C3E50]">
                                Pesanan #{order.id.slice(-8)}
                              </h3>
                              <div className="mt-1 flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Calendar size={14} />
                                  {formatDate(order.created_at)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin size={14} />
                                  {order.shipping_city},{" "}
                                  {order.shipping_country}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-[#2C3E50]">
                                {formatCurrency(order.total_amount)}
                              </p>
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(order.status)}`}
                              >
                                {order.status.charAt(0).toUpperCase() +
                                  order.status.slice(1)}
                              </span>
                            </div>
                          </div>

                          {/* Order Items */}
                          {order.order_items &&
                            order.order_items.length > 0 && (
                              <div className="space-y-3">
                                {order.order_items.map((item) => (
                                  <div
                                    key={item.id}
                                    className="flex items-center gap-4 rounded-lg bg-gray-50 p-3"
                                  >
                                    {item.product && (
                                      <>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                          src={item.product.image_url}
                                          alt={item.product.name}
                                          className="h-16 w-16 rounded-lg object-cover"
                                        />
                                        <div className="flex-1">
                                          <h4 className="font-semibold text-[#2C3E50]">
                                            {item.product.name}
                                          </h4>
                                          <div className="mt-1 flex items-center justify-between">
                                            <span className="text-gray-600">
                                              Jml: {item.quantity}
                                            </span>
                                            <span className="font-semibold">
                                              {formatCurrency(
                                                item.price_at_purchase,
                                              )}
                                            </span>
                                          </div>
                                        </div>
                                        {order.status === "delivered" && (
                                          <button
                                            onClick={() => {
                                              setSelectedProduct({
                                                product_id: item.product_id,
                                                order_id: order.id,
                                                product: item.product,
                                              });
                                              setShowReviewModal(true);
                                            }}
                                            className="rounded-lg bg-[#3498DB] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2980B9]"
                                          >
                                            Tulis Ulasan
                                          </button>
                                        )}
                                      </>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === "reviews" && (
                <div className="rounded-lg bg-white p-8 shadow-sm">
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-[#2C3E50]">
                      Ulasan Saya
                    </h2>
                    {reviewableProducts.length > 0 && (
                      <span className="rounded-full bg-[#3498DB] px-3 py-1 text-sm text-white">
                        {reviewableProducts.length} produk menunggu ulasan
                      </span>
                    )}
                  </div>

                  {/* Reviewable Products */}
                  {reviewableProducts.length > 0 && (
                    <div className="mb-8">
                      <h3 className="mb-4 text-lg font-semibold text-[#2C3E50]">
                        Produk yang Dapat Anda Ulas
                      </h3>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {reviewableProducts.slice(0, 4).map((item) => (
                          <div
                            key={`${item.order_id}-${item.product_id}`}
                            className="rounded-lg border border-gray-200 p-4"
                          >
                            <div className="mb-3 flex items-center gap-3">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={item.product?.image_url}
                                alt={item.product?.name}
                                className="h-12 w-12 rounded-lg object-cover"
                              />
                              <div className="flex-1">
                                <h4 className="text-sm font-semibold text-[#2C3E50]">
                                  {item.product?.name}
                                </h4>
                                <p className="text-xs text-gray-600">
                                  Order #{item.order.id.slice(-8)}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedProduct(item);
                                setShowReviewModal(true);
                              }}
                              className="w-full rounded-lg bg-[#3498DB] py-2 text-sm font-medium text-white transition-colors hover:bg-[#2980B9]"
                            >
                              Write Review
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Existing Reviews */}
                  {reviews.length === 0 ? (
                    <div className="py-12 text-center">
                      <MessageSquare
                        size={48}
                        className="mx-auto mb-4 text-gray-400"
                      />
                      <p className="text-lg text-gray-600">No reviews yet</p>
                      <p className="text-gray-500">
                        Purchase products to leave reviews
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-[#2C3E50]">
                        Your Reviews
                      </h3>
                      {reviews.map((review) => (
                        <div
                          key={review.id}
                          className="rounded-lg border border-gray-200 p-6"
                        >
                          <div className="mb-4 flex items-start justify-between">
                            <div className="flex items-center gap-4">
                              {review.product && (
                                <>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={review.product.image_url}
                                    alt={review.product.name}
                                    className="h-16 w-16 rounded-lg object-cover"
                                  />
                                  <div>
                                    <h4 className="font-semibold text-[#2C3E50]">
                                      {review.product.name}
                                    </h4>
                                    <div className="mt-1 flex items-center gap-2">
                                      <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                          <Star
                                            key={i}
                                            size={16}
                                            className={
                                              i < review.rating
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-gray-300"
                                            }
                                          />
                                        ))}
                                      </div>
                                      {review.verified_purchase && (
                                        <span className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                                          Verified Purchase
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleDeleteReview(review.id)}
                                className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
                                title="Delete review"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                          <div>
                            <h5 className="mb-2 font-semibold text-[#2C3E50]">
                              {review.title}
                            </h5>
                            <p className="mb-3 text-gray-700">
                              {review.comment}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDate(review.created_at)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Wishlist Tab */}
              {activeTab === "wishlist" && (
                <div className="rounded-lg bg-white p-8 shadow-sm">
                  <h2 className="mb-6 text-2xl font-bold text-[#2C3E50]">
                    My Wishlist
                  </h2>

                  {wishlist.length === 0 ? (
                    <div className="py-12 text-center">
                      <Heart size={48} className="mx-auto mb-4 text-gray-400" />
                      <p className="text-lg text-gray-600">
                        Wishlist Anda kosong
                      </p>
                      <p className="mb-6 text-gray-500">
                        Save items you love to buy later
                      </p>
                      <button
                        onClick={() => router.push("/products")}
                        className="rounded-lg bg-[#3498DB] px-6 py-3 text-white transition-colors hover:bg-[#2980B9]"
                      >
                        Browse Products
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {wishlist.map((item) => (
                        <div
                          key={item.id}
                          className="group overflow-hidden rounded-lg border border-gray-200 transition-shadow hover:shadow-md"
                        >
                          <div className="relative aspect-square bg-gray-100">
                            <Image
                              src={item.image_url}
                              alt={item.name}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <button
                              onClick={async () => {
                                if (!user) return;
                                setWishlist(
                                  wishlist.filter((w) => w.id !== item.id),
                                );
                                await removeFromWishlist(user.id, item.id);
                                toast({
                                  title: "Dihapus dari Wishlist",
                                  description: `${item.name} telah dihapus`,
                                });
                              }}
                              className="absolute top-3 right-3 rounded-full bg-white/80 p-2 text-red-500 backdrop-blur-sm transition-colors hover:bg-white"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <div className="p-4">
                            <h3 className="mb-1 line-clamp-1 font-semibold text-[#2C3E50]">
                              {item.name}
                            </h3>
                            <div className="mb-4 flex items-center justify-between">
                              <span className="font-bold text-[#3498DB]">
                                ${item.price.toFixed(2)}
                              </span>
                              <span
                                className={`rounded px-2 py-0.5 text-xs font-medium ${
                                  item.in_stock
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {item.in_stock ? "In Stock" : "Out of Stock"}
                              </span>
                            </div>
                            <button
                              disabled={!item.in_stock}
                              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2C3E50] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#34495E] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <ShoppingCart size={16} />
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === "settings" && (
                <div className="rounded-lg bg-white p-8 shadow-sm">
                  <h2 className="mb-6 text-2xl font-bold text-[#2C3E50]">
                    Account Settings
                  </h2>

                  <div className="space-y-6">
                    <div className="rounded-lg border border-gray-200 p-6">
                      <h3 className="mb-3 text-lg font-semibold text-[#2C3E50]">
                        Password
                      </h3>
                      <p className="mb-4 text-gray-600">
                        Update your password to keep your account secure
                      </p>

                      {!showPasswordForm ? (
                        <button
                          onClick={() => setShowPasswordForm(true)}
                          className="rounded-lg bg-[#3498DB] px-4 py-2 text-white transition-colors hover:bg-[#2980B9]"
                        >
                          Change Password
                        </button>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <label className="mb-2 block text-sm font-semibold text-[#2C3E50]">
                              New Password
                            </label>
                            <input
                              type="password"
                              value={passwordForm.newPassword}
                              onChange={(e) =>
                                setPasswordForm({
                                  ...passwordForm,
                                  newPassword: e.target.value,
                                })
                              }
                              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-[#3498DB] focus:outline-none"
                              placeholder="Enter new password"
                            />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-semibold text-[#2C3E50]">
                              Confirm Password
                            </label>
                            <input
                              type="password"
                              value={passwordForm.confirmPassword}
                              onChange={(e) =>
                                setPasswordForm({
                                  ...passwordForm,
                                  confirmPassword: e.target.value,
                                })
                              }
                              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-[#3498DB] focus:outline-none"
                              placeholder="Confirm new password"
                            />
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={handlePasswordUpdate}
                              className="rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
                            >
                              Update Password
                            </button>
                            <button
                              onClick={() => {
                                setShowPasswordForm(false);
                                setPasswordForm({
                                  newPassword: "",
                                  confirmPassword: "",
                                });
                              }}
                              className="rounded-lg bg-gray-500 px-4 py-2 text-white transition-colors hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="rounded-lg border border-red-200 bg-red-50 p-6">
                      <h3 className="mb-3 text-lg font-semibold text-red-800">
                        Danger Zone
                      </h3>
                      <p className="mb-4 text-red-700">
                        These actions are permanent and cannot be undone
                      </p>
                      <button className="rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700">
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {/* Review Modal */}
      {showReviewModal && selectedProduct && user && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedProduct(null);
          }}
          productId={selectedProduct.product_id}
          orderId={selectedProduct.order_id}
          productName={selectedProduct.product?.name || "Product"}
          productImage={
            selectedProduct.product?.image_url || "/placeholder.svg"
          }
          userId={user.id}
          onSuccess={() => {
            setShowReviewModal(false);
            setSelectedProduct(null);
            loadUserData();
          }}
        />
      )}
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#3498DB] border-t-transparent"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <AccountContent />
    </Suspense>
  );
}
