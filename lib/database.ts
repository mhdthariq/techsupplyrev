import { createClient } from "@/lib/supabase/client";
import type {
  Order,
  OrderItem,
  Review,
  Profile,
  UpdateProfileData,
  CreateReviewData,
  Wishlist,
} from "@/lib/types";

const supabase = createClient();

// Profile Management
export async function getUserProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

export async function updateUserProfile(
  userId: string,
  profileData: UpdateProfileData,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update profile",
    };
  }
}

// User Management
export async function getAllUsers(): Promise<Profile[]> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching all users:", error);
    return [];
  }
}

export async function createUserProfile(
  userId: string,
  email: string,
  name?: string,
): Promise<void> {
  try {
    const nameParts = name?.split(" ") || [];
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    await supabase.from("profiles").insert({
      id: userId,
      email,
      first_name: firstName,
      last_name: lastName,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error creating profile:", error);
  }
}

// Order Management
export async function getAllOrders(): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (
          *,
          product:products (*)
        )
      `,
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching all orders:", error);
    return [];
  }
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (
          *,
          product:products (*)
        )
      `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return [];
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: Order["status"],
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", orderId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error updating order status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update order",
    };
  }
}

export async function getOrderById(
  orderId: string,
  userId?: string,
): Promise<Order | null> {
  try {
    let query = supabase
      .from("orders")
      .select(
        `
        *,
        order_items (
          *,
          product:products (*)
        )
      `,
      )
      .eq("id", orderId);

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query.single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching order:", error);
    return null;
  }
}

// Review Management
export async function getUserReviews(userId: string): Promise<Review[]> {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select(
        `
        *,
        product:products (name, image_url)
      `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    return [];
  }
}

export async function getProductReviews(productId: string): Promise<Review[]> {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select(
        `
        *,
        user:profiles (email, first_name, last_name)
      `,
      )
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    return [];
  }
}

export async function createReview(
  userId: string,
  reviewData: CreateReviewData,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if user has already reviewed this product
    const { data: existingReview } = await supabase
      .from("reviews")
      .select("id")
      .eq("user_id", userId)
      .eq("product_id", reviewData.product_id)
      .single();

    if (existingReview) {
      return {
        success: false,
        error: "You have already reviewed this product",
      };
    }

    // Check if this is a verified purchase
    let verifiedPurchase = false;
    if (reviewData.order_id) {
      const { data: orderItem } = await supabase
        .from("order_items")
        .select("id, order:orders!inner(user_id, status)")
        .eq("product_id", reviewData.product_id)
        .eq("order_id", reviewData.order_id)
        .eq("order.user_id", userId)
        .in("order.status", ["delivered", "completed"])
        .single();

      verifiedPurchase = !!orderItem;
    }

    const { error } = await supabase.from("reviews").insert({
      user_id: userId,
      product_id: reviewData.product_id,
      order_id: reviewData.order_id,
      rating: reviewData.rating,
      title: reviewData.title,
      comment: reviewData.comment,
      verified_purchase: verifiedPurchase,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;

    // Update product rating
    await updateProductRating(reviewData.product_id);

    return { success: true };
  } catch (error) {
    console.error("Error creating review:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create review",
    };
  }
}

export async function updateReview(
  reviewId: string,
  userId: string,
  updateData: Partial<CreateReviewData>,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("reviews")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", reviewId)
      .eq("user_id", userId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Error updating review:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update review",
    };
  }
}

export async function deleteReview(
  reviewId: string,
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get the product_id before deletion for rating update
    const { data: review } = await supabase
      .from("reviews")
      .select("product_id")
      .eq("id", reviewId)
      .eq("user_id", userId)
      .single();

    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId)
      .eq("user_id", userId);

    if (error) throw error;

    // Update product rating if review was deleted
    if (review?.product_id) {
      await updateProductRating(review.product_id);
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting review:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete review",
    };
  }
}

// Helper function to update product rating
async function updateProductRating(productId: string): Promise<void> {
  try {
    const { data: reviews } = await supabase
      .from("reviews")
      .select("rating")
      .eq("product_id", productId);

    if (!reviews || reviews.length === 0) {
      await supabase
        .from("products")
        .update({
          rating: 0,
          reviews_count: 0,
          updated_at: new Date().toISOString(),
        })
        .eq("id", productId);
      return;
    }

    const averageRating =
      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

    await supabase
      .from("products")
      .update({
        rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
        reviews_count: reviews.length,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId);
  } catch (error) {
    console.error("Error updating product rating:", error);
  }
}

// Get products that can be reviewed by user (from completed orders without reviews)
export async function getReviewableProducts(userId: string): Promise<
  (OrderItem & {
    hasReview: boolean;
    order: Pick<Order, "id" | "status" | "created_at">;
  })[]
> {
  try {
    // Get all order items from delivered/completed orders
    const { data: orderItems, error } = await supabase
      .from("order_items")
      .select(
        `
        *,
        product:products (*),
        order:orders!inner (id, status, created_at)
      `,
      )
      .eq("order.user_id", userId)
      .in("order.status", ["delivered", "completed"]);

    if (error) throw error;

    // Get all reviews by this user
    const { data: userReviews } = await supabase
      .from("reviews")
      .select("product_id, order_id")
      .eq("user_id", userId);

    const reviewedProducts = new Set(
      userReviews?.map((review) => `${review.product_id}-${review.order_id}`) ||
        [],
    );

    return (orderItems || []).map((item) => ({
      ...item,
      hasReview: reviewedProducts.has(`${item.product_id}-${item.order_id}`),
      order: {
        id: item.order.id,
        status: item.order.status,
        created_at: item.order.created_at,
      },
    }));
  } catch (error) {
    console.error("Error fetching reviewable products:", error);
    return [];
  }
}

// Check if user can review a specific product from a specific order
export async function canUserReviewProduct(
  userId: string,
  productId: string,
  orderId: string,
): Promise<boolean> {
  try {
    // Check if order exists and is completed
    const { data: order } = await supabase
      .from("orders")
      .select("status")
      .eq("id", orderId)
      .eq("user_id", userId)
      .in("status", ["delivered", "completed"])
      .single();

    if (!order) return false;

    // Check if product was in this order
    const { data: orderItem } = await supabase
      .from("order_items")
      .select("id")
      .eq("order_id", orderId)
      .eq("product_id", productId)
      .single();

    if (!orderItem) return false;

    // Check if review already exists
    const { data: existingReview } = await supabase
      .from("reviews")
      .select("id")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .eq("order_id", orderId)
      .single();

    return !existingReview;
  } catch (error) {
    console.error("Error checking review eligibility:", error);
    return false;
  }
}

export async function getReviewableOrderByProduct(
  userId: string,
  productId: string,
): Promise<string | null> {
  try {
    // Check for delivered/completed orders containing this product
    const { data: orderItem } = await supabase
      .from("order_items")
      .select("order_id, order:orders!inner(status)")
      .eq("product_id", productId)
      .eq("order.user_id", userId)
      .in("order.status", ["delivered", "completed"])
      .limit(1)
      .single();

    if (!orderItem) return null;

    // Check if review already exists
    const { data: existingReview } = await supabase
      .from("reviews")
      .select("id")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .eq("order_id", orderItem.order_id)
      .single();

    if (existingReview) return null;

    return orderItem.order_id;
  } catch (error) {
    console.error("Error checking review eligibility:", error);
    return null;
  }
}

// Wishlist Management
export async function getWishlist(userId: string): Promise<Wishlist[]> {
  try {
    const { data, error } = await supabase
      .from("wishlists")
      .select(
        `
        *,
        product:products (*)
      `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return [];
  }
}

export async function addToWishlist(
  userId: string,
  productId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("wishlists").insert({
      user_id: userId,
      product_id: productId,
    });

    if (error) {
      if (error.code === "23505") {
        // Unique violation
        return { success: false, error: "Product already in wishlist" };
      }
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to add to wishlist",
    };
  }
}

export async function removeFromWishlist(
  userId: string,
  productId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("wishlists")
      .delete()
      .eq("user_id", userId)
      .eq("product_id", productId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to remove from wishlist",
    };
  }
}

export async function getAdminDashboardData() {
  try {
    // Get recent orders (last 5)
    const { data: recentOrders, error: ordersError } = await supabase
      .from("orders")
      .select("id, total_amount, created_at, status, user_id")
      .order("created_at", { ascending: false })
      .limit(5);

    if (ordersError) throw ordersError;

    // Get profiles for these orders
    let recentActivity: {
      id: string;
      user: string;
      action: string;
      amount: number;
      status: string;
      date: string;
    }[] = [];
    if (recentOrders && recentOrders.length > 0) {
      const userIds = Array.from(new Set(recentOrders.map((o) => o.user_id)));
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email")
        .in("id", userIds);

      recentActivity = recentOrders.map((order) => {
        const user = profiles?.find((p) => p.id === order.user_id);
        const userName = user?.first_name
          ? `${user.first_name} ${user.last_name || ""}`
          : user?.email || "Guest";

        return {
          id: order.id,
          user: userName,
          action: `membuat pesanan`,
          date: new Date(order.created_at).toLocaleDateString("id-ID"),
          amount: order.total_amount,
          status: order.status,
        };
      });
    }

    // Chart Data Processing
    // Fetch orders for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1); // Start of that month

    const { data: chartOrders } = await supabase
      .from("orders")
      .select("total_amount, created_at")
      .gte("created_at", sixMonthsAgo.toISOString())
      .order("created_at", { ascending: true });

    // Initialize map for last 6 months
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthlyData = new Map<string, { sales: number; orders: number }>();

    // Fill with empty data for last 6 months to ensure continuity
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const monthKey = monthNames[d.getMonth()];
      monthlyData.set(monthKey, { sales: 0, orders: 0 });
    }

    // Aggregate data
    chartOrders?.forEach((order) => {
      const date = new Date(order.created_at);
      const monthKey = monthNames[date.getMonth()];
      // Only valid if in our map (handling edge cases of dates)
      if (monthlyData.has(monthKey)) {
        const current = monthlyData.get(monthKey)!;
        current.sales += order.total_amount;
        current.orders += 1;
      }
    });

    // Convert map to array
    const chartData = Array.from(monthlyData.entries()).map(([name, data]) => ({
      name,
      sales: data.sales,
      visitors: data.orders, // Using orders as visitor proxy/replacement
    }));

    return {
      recentActivity,
      chartData,
    };
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error);
    return { recentActivity: [], chartData: [] };
  }
}
