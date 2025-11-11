import { createClient } from "@/lib/supabase/client";
import type {
  Order,
  OrderItem,
  Review,
  Profile,
  UpdateProfileData,
  CreateReviewData,
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

export async function getOrderById(
  orderId: string,
  userId: string,
): Promise<Order | null> {
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
      .eq("id", orderId)
      .eq("user_id", userId)
      .single();

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
