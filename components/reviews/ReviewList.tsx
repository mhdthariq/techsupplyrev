"use client";

import { useEffect, useState } from "react";
import { Star, MessageSquare, ThumbsUp } from "lucide-react";
import { getProductReviews, getReviewableOrderByProduct } from "@/lib/database";
import { getCurrentUser } from "@/lib/auth";
import type { Review } from "@/lib/types";
import ReviewModal from "./ReviewModal";

interface ReviewListProps {
  productId: string;
  productName: string;
  productImage: string;
}

export default function ReviewList({
  productId,
  productName,
  productImage,
}: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [reviewableOrderId, setReviewableOrderId] = useState<string | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchReviews = async () => {
    try {
      const data = await getProductReviews(productId);
      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkEligibility = async () => {
    const user = await getCurrentUser();
    if (user) {
      setUserId(user.id);
      const orderId = await getReviewableOrderByProduct(user.id, productId);
      setReviewableOrderId(orderId);
    }
  };

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (productId) {
      fetchReviews();
      checkEligibility();
    }
  }, [productId]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-[#2C3E50]">
            Ulasan Pelanggan ({reviews.length})
          </h3>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm text-gray-500">Rata-rata rating:</span>
            <div className="flex items-center gap-1">
              <Star className="fill-yellow-400 text-yellow-400" size={16} />
              <span className="font-bold text-[#2C3E50]">
                {reviews.length > 0
                  ? (
                      reviews.reduce((acc, r) => acc + r.rating, 0) /
                      reviews.length
                    ).toFixed(1)
                  : "0.0"}
              </span>
            </div>
          </div>
        </div>

        {userId && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-[#3498DB] px-6 py-3 font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[#2980B9] hover:shadow-lg"
          >
            <MessageSquare size={20} />
            Tulis Ulasan
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500">Memuat ulasan...</div>
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-gray-50 py-12 text-center">
          <MessageSquare size={48} className="mb-4 text-gray-300" />
          <p className="text-lg font-medium text-gray-600">Belum ada ulasan</p>
          <p className="text-gray-500">
            Jadilah yang pertama mengulas produk ini!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3498DB] font-bold text-white">
                    {review.user?.first_name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#2C3E50]">
                      {review.user?.first_name
                        ? `${review.user.first_name} ${review.user.last_name || ""}`
                        : "Pengguna"}
                    </h4>
                    <div className="flex items-center gap-2">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={
                              i < review.rating
                                ? "fill-current"
                                : "text-gray-300"
                            }
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        {formatDate(review.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
                {review.verified_purchase && (
                  <span className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                    <ThumbsUp size={12} />
                    Terverifikasi
                  </span>
                )}
              </div>

              <div className="pl-14">
                <h5 className="mb-2 font-bold text-[#2C3E50]">
                  {review.title}
                </h5>
                <p className="leading-relaxed text-gray-600">
                  {review.comment}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {userId && isModalOpen && (
        <ReviewModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          productId={productId}
          orderId={reviewableOrderId || ""}
          productName={productName}
          productImage={productImage}
          userId={userId}
          onSuccess={() => {
            fetchReviews();
            checkEligibility();
            // Don't close immediately if we want them to see it posted, but usually close modal.
            // setReviewableOrderId(null); // No need to clear if we simply allow multiple or just want to refresh
          }}
        />
      )}
    </div>
  );
}
