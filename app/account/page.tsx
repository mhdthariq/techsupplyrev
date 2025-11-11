"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";

import { getCurrentUser, signOut, updatePassword } from "@/lib/auth";
import {
  getUserProfile,
  updateUserProfile,
  getUserOrders,
  getUserReviews,
  getReviewableProducts,
  createReview,
  deleteReview,
} from "@/lib/database";
import { useToast } from "@/hooks/use-toast";
import type {
  User as AuthUser,
  Order,
  Review,
  CreateReviewData,
} from "@/lib/types";

export default function AccountPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
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
  const [activeTab, setActiveTab] = useState<
    "profile" | "orders" | "reviews" | "settings"
  >("profile");
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

  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: "",
    comment: "",
  });

  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    loadUserData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadUserData = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push("/auth/login");
        return;
      }

      setUser(currentUser);

      // Load profile
      const userProfile = await getUserProfile(currentUser.id);
      if (userProfile) {
        const fullName =
          `${userProfile.first_name || ""} ${userProfile.last_name || ""}`.trim();
        setProfileForm({
          full_name: fullName || currentUser.name || "",
          phone: userProfile.phone || "",
          address: userProfile.address || "",
          city: userProfile.city || "",
          postal_code: userProfile.postal_code || "",
          country: userProfile.country || "",
        });
      }

      // Load orders
      const userOrders = await getUserOrders(currentUser.id);
      setOrders(userOrders);

      // Load reviews
      const userReviews = await getUserReviews(currentUser.id);
      setReviews(userReviews);

      // Load reviewable products
      const reviewableItems = await getReviewableProducts(currentUser.id);
      setReviewableProducts(reviewableItems.filter((item) => !item.hasReview));
    } catch (error) {
      console.error("Error loading user data:", error);
      toast({
        title: "Error",
        description: "Failed to load account data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
          title: "Profile Updated",
          description: "Your profile has been successfully updated",
          variant: "success",
        });
        setIsEditingProfile(false);
        loadUserData(); // Reload data
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description:
          error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await updatePassword(passwordForm.newPassword);
      if (!result.error) {
        toast({
          title: "Password Updated",
          description: "Your password has been successfully updated",
          variant: "success",
        });
        setShowPasswordForm(false);
        setPasswordForm({ newPassword: "", confirmPassword: "" });
      }
    } catch {
      toast({
        title: "Update Failed",
        description: "Failed to update password",
        variant: "destructive",
      });
    }
  };

  const handleCreateReview = async () => {
    if (!user || !selectedProduct) return;

    if (!reviewForm.title.trim() || !reviewForm.comment.trim()) {
      toast({
        title: "Incomplete Review",
        description: "Please provide both a title and comment",
        variant: "destructive",
      });
      return;
    }

    try {
      const reviewData: CreateReviewData = {
        product_id: selectedProduct.product_id,
        order_id: selectedProduct.order_id,
        rating: reviewForm.rating,
        title: reviewForm.title.trim(),
        comment: reviewForm.comment.trim(),
      };

      const result = await createReview(user.id, reviewData);
      if (result.success) {
        toast({
          title: "Review Created",
          description: "Your review has been submitted successfully",
          variant: "success",
        });
        setShowReviewModal(false);
        setSelectedProduct(null);
        setReviewForm({ rating: 5, title: "", comment: "" });
        loadUserData(); // Reload data
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Review Failed",
        description:
          error instanceof Error ? error.message : "Failed to create review",
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
          title: "Review Deleted",
          description: "Your review has been deleted successfully",
          variant: "success",
        });
        loadUserData(); // Reload data
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Delete Failed",
        description:
          error instanceof Error ? error.message : "Failed to delete review",
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
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#3498DB] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-28 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#2C3E50] mb-2">
              My Account
            </h1>
            <p className="text-gray-600">
              Manage your profile, orders, and reviews
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Menu */}
            <aside className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden sticky top-24">
                <nav className="flex flex-col">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`px-6 py-4 text-left font-semibold flex items-center gap-3 transition-colors ${
                      activeTab === "profile"
                        ? "bg-[#3498DB] text-white border-l-4 border-[#2980B9]"
                        : "text-[#2C3E50] hover:bg-gray-50"
                    }`}
                  >
                    <User size={20} /> Profile
                  </button>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className={`px-6 py-4 text-left font-semibold flex items-center gap-3 transition-colors ${
                      activeTab === "orders"
                        ? "bg-[#3498DB] text-white border-l-4 border-[#2980B9]"
                        : "text-[#2C3E50] hover:bg-gray-50"
                    }`}
                  >
                    <Package size={20} /> Orders ({orders.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("reviews")}
                    className={`px-6 py-4 text-left font-semibold flex items-center gap-3 transition-colors ${
                      activeTab === "reviews"
                        ? "bg-[#3498DB] text-white border-l-4 border-[#2980B9]"
                        : "text-[#2C3E50] hover:bg-gray-50"
                    }`}
                  >
                    <MessageSquare size={20} /> Reviews ({reviews.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("settings")}
                    className={`px-6 py-4 text-left font-semibold flex items-center gap-3 transition-colors ${
                      activeTab === "settings"
                        ? "bg-[#3498DB] text-white border-l-4 border-[#2980B9]"
                        : "text-[#2C3E50] hover:bg-gray-50"
                    }`}
                  >
                    <Settings size={20} /> Settings
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="px-6 py-4 text-left font-semibold flex items-center gap-3 text-red-600 hover:bg-red-50 transition-colors border-t border-gray-200"
                  >
                    <LogOut size={20} /> Sign Out
                  </button>
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div className="bg-white rounded-lg shadow-sm p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-[#2C3E50]">
                      Profile Information
                    </h2>
                    <button
                      onClick={() => setIsEditingProfile(!isEditingProfile)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#3498DB] text-white rounded-lg hover:bg-[#2980B9] transition-colors"
                    >
                      {isEditingProfile ? <X size={18} /> : <Edit size={18} />}
                      {isEditingProfile ? "Cancel" : "Edit"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-[#2C3E50] mb-2">
                        <Mail size={16} className="inline mr-2" />
                        Email
                      </label>
                      <input
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 text-gray-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#2C3E50] mb-2">
                        <User size={16} className="inline mr-2" />
                        Full Name
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
                        placeholder="Enter your full name"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3498DB] disabled:bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#2C3E50] mb-2">
                        <Phone size={16} className="inline mr-2" />
                        Phone
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
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3498DB] disabled:bg-gray-50"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-[#2C3E50] mb-2">
                        <MapPin size={16} className="inline mr-2" />
                        Address
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
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3498DB] disabled:bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#2C3E50] mb-2">
                        City
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
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3498DB] disabled:bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#2C3E50] mb-2">
                        Postal Code
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
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3498DB] disabled:bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#2C3E50] mb-2">
                        Country
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
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3498DB] disabled:bg-gray-50"
                      />
                    </div>
                  </div>

                  {isEditingProfile && (
                    <button
                      onClick={handleProfileUpdate}
                      className="mt-6 flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                    >
                      <Save size={18} />
                      Save Changes
                    </button>
                  )}
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === "orders" && (
                <div className="bg-white rounded-lg shadow-sm p-8">
                  <h2 className="text-2xl font-bold text-[#2C3E50] mb-6">
                    Order History
                  </h2>

                  {orders.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingBag
                        size={48}
                        className="mx-auto text-gray-400 mb-4"
                      />
                      <p className="text-gray-600 text-lg">No orders yet</p>
                      <p className="text-gray-500 mb-6">
                        Start shopping to see your orders here
                      </p>
                      <button
                        onClick={() => router.push("/products")}
                        className="bg-[#3498DB] text-white px-6 py-3 rounded-lg hover:bg-[#2980B9] transition-colors"
                      >
                        Browse Products
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          className="border border-gray-200 rounded-lg p-6 hover:border-[#3498DB] transition-colors"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-bold text-[#2C3E50] text-lg">
                                Order #{order.id.slice(-8)}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
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
                              <p className="font-bold text-xl text-[#2C3E50]">
                                ${order.total_amount.toFixed(2)}
                              </p>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
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
                                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                                  >
                                    {item.product && (
                                      <>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                          src={item.product.image_url}
                                          alt={item.product.name}
                                          className="w-16 h-16 object-cover rounded-lg"
                                        />
                                        <div className="flex-1">
                                          <h4 className="font-semibold text-[#2C3E50]">
                                            {item.product.name}
                                          </h4>
                                          <div className="flex justify-between items-center mt-1">
                                            <span className="text-gray-600">
                                              Qty: {item.quantity}
                                            </span>
                                            <span className="font-semibold">
                                              $
                                              {item.price_at_purchase.toFixed(
                                                2,
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
                                            className="bg-[#3498DB] text-white px-4 py-2 rounded-lg hover:bg-[#2980B9] transition-colors text-sm font-medium"
                                          >
                                            Write Review
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
                <div className="bg-white rounded-lg shadow-sm p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-[#2C3E50]">
                      My Reviews
                    </h2>
                    {reviewableProducts.length > 0 && (
                      <span className="bg-[#3498DB] text-white px-3 py-1 rounded-full text-sm">
                        {reviewableProducts.length} products awaiting review
                      </span>
                    )}
                  </div>

                  {/* Reviewable Products */}
                  {reviewableProducts.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-[#2C3E50] mb-4">
                        Products You Can Review
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {reviewableProducts.slice(0, 4).map((item) => (
                          <div
                            key={`${item.order_id}-${item.product_id}`}
                            className="border border-gray-200 rounded-lg p-4"
                          >
                            <div className="flex items-center gap-3 mb-3">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={item.product?.image_url}
                                alt={item.product?.name}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <h4 className="font-semibold text-sm text-[#2C3E50]">
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
                              className="w-full bg-[#3498DB] text-white py-2 rounded-lg hover:bg-[#2980B9] transition-colors text-sm font-medium"
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
                    <div className="text-center py-12">
                      <MessageSquare
                        size={48}
                        className="mx-auto text-gray-400 mb-4"
                      />
                      <p className="text-gray-600 text-lg">No reviews yet</p>
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
                          className="border border-gray-200 rounded-lg p-6"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-4">
                              {review.product && (
                                <>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={review.product.image_url}
                                    alt={review.product.name}
                                    className="w-16 h-16 object-cover rounded-lg"
                                  />
                                  <div>
                                    <h4 className="font-semibold text-[#2C3E50]">
                                      {review.product.name}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
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
                                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
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
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete review"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                          <div>
                            <h5 className="font-semibold text-[#2C3E50] mb-2">
                              {review.title}
                            </h5>
                            <p className="text-gray-700 mb-3">
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

              {/* Settings Tab */}
              {activeTab === "settings" && (
                <div className="bg-white rounded-lg shadow-sm p-8">
                  <h2 className="text-2xl font-bold text-[#2C3E50] mb-6">
                    Account Settings
                  </h2>

                  <div className="space-y-6">
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-[#2C3E50] mb-3">
                        Password
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Update your password to keep your account secure
                      </p>

                      {!showPasswordForm ? (
                        <button
                          onClick={() => setShowPasswordForm(true)}
                          className="bg-[#3498DB] text-white px-4 py-2 rounded-lg hover:bg-[#2980B9] transition-colors"
                        >
                          Change Password
                        </button>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-semibold text-[#2C3E50] mb-2">
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
                              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3498DB]"
                              placeholder="Enter new password"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-[#2C3E50] mb-2">
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
                              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3498DB]"
                              placeholder="Confirm new password"
                            />
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={handlePasswordUpdate}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
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
                              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                      <h3 className="text-lg font-semibold text-red-800 mb-3">
                        Danger Zone
                      </h3>
                      <p className="text-red-700 mb-4">
                        These actions are permanent and cannot be undone
                      </p>
                      <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
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
      {showReviewModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#2C3E50]">Write Review</h3>
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setSelectedProduct(null);
                  setReviewForm({ rating: 5, title: "", comment: "" });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedProduct.product?.image_url}
                alt={selectedProduct.product?.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div>
                <h4 className="font-semibold text-[#2C3E50]">
                  {selectedProduct.product?.name}
                </h4>
                <p className="text-sm text-gray-600">
                  Order #{selectedProduct.order_id?.slice(-8)}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#2C3E50] mb-2">
                  Rating
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() =>
                        setReviewForm({ ...reviewForm, rating: star })
                      }
                      className="transition-colors"
                    >
                      <Star
                        size={24}
                        className={
                          star <= reviewForm.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2C3E50] mb-2">
                  Review Title
                </label>
                <input
                  type="text"
                  value={reviewForm.title}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, title: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3498DB]"
                  placeholder="Summarize your experience"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2C3E50] mb-2">
                  Comment
                </label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, comment: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3498DB] h-24 resize-none"
                  placeholder="Tell others about your experience with this product"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCreateReview}
                  className="flex-1 bg-[#3498DB] text-white py-3 rounded-lg hover:bg-[#2980B9] transition-colors font-semibold"
                >
                  Submit Review
                </button>
                <button
                  onClick={() => {
                    setShowReviewModal(false);
                    setSelectedProduct(null);
                    setReviewForm({ rating: 5, title: "", comment: "" });
                  }}
                  className="px-6 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
