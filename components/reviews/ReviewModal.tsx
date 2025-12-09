"use client";

import { useState } from "react";
import { Star, X } from "lucide-react";
import { createReview } from "@/lib/database";
import { useToast } from "@/hooks/use-toast";
import type { CreateReviewData } from "@/lib/types";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  orderId: string;
  productName: string;
  productImage: string;
  userId: string;
  onSuccess: () => void;
}

export default function ReviewModal({
  isOpen,
  onClose,
  productId,
  orderId,
  productName,
  productImage,
  userId,
  onSuccess,
}: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!title.trim() || !comment.trim()) {
      toast({
        title: "Ulasan Tidak Lengkap",
        description: "Mohon berikan judul dan komentar",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewData: CreateReviewData = {
        product_id: productId,
        order_id: orderId,
        rating: rating,
        title: title.trim(),
        comment: comment.trim(),
      };

      const result = await createReview(userId, reviewData);

      if (result.success) {
        toast({
          title: "Ulasan Dibuat",
          description: "Ulasan Anda berhasil dikirim",
          variant: "success",
        });
        onSuccess();
        onClose();
        setTitle("");
        setComment("");
        setRating(5);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Gagal Membuat Ulasan",
        description:
          error instanceof Error ? error.message : "Gagal membuat ulasan",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="animate-in fade-in zoom-in-95 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl duration-200">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-bold text-[#2C3E50]">Tulis Ulasan</h3>
          <button
            onClick={onClose}
            className="text-gray-500 transition-colors hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-6 flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={productImage}
            alt={productName}
            className="h-16 w-16 rounded-lg object-cover"
          />
          <div>
            <h4 className="line-clamp-1 font-semibold text-[#2C3E50]">
              {productName}
            </h4>
            <p className="text-sm text-gray-600">Order #{orderId.slice(-8)}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#2C3E50]">
              Rating
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    size={28}
                    className={
                      star <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#2C3E50]">
              Judul Ulasan
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all focus:border-[#3498DB] focus:ring-2 focus:ring-[#3498DB] focus:outline-none"
              placeholder="Rangkum pengalaman Anda"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#2C3E50]">
              Komentar
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="h-24 w-full resize-none rounded-xl border border-gray-300 px-4 py-3 transition-all focus:border-[#3498DB] focus:ring-2 focus:ring-[#3498DB] focus:outline-none"
              placeholder="Ceritakan pengalaman Anda menggunakan produk ini"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 rounded-xl bg-[#3498DB] py-3.5 font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[#2980B9] hover:shadow-lg disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Mengirim..." : "Kirim Ulasan"}
            </button>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border-2 border-gray-100 bg-white px-6 py-3.5 font-bold text-gray-500 transition-all hover:bg-gray-50 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
