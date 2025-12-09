"use client";

import { useState, useEffect, useRef } from "react";
import { X, Upload, Save, Loader2 } from "lucide-react";
import type { Banner } from "@/lib/types";

interface BannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bannerData: Partial<Banner>, imageFile?: File) => Promise<void>;
  initialData?: Banner | null;
  title: string;
}

export default function BannerModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
}: BannerModalProps) {
  const [formData, setFormData] = useState<Partial<Banner>>({
    title: "",
    description: "",
    link: "",
    active: true,
    position: 0,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setPreviewUrl(initialData.image_url || null);
    } else {
      setFormData({
        title: "",
        description: "",
        link: "",
        active: true,
        position: 0,
      });
      setPreviewUrl(null);
    }
    setImageFile(null);
  }, [initialData, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData, imageFile || undefined);
      onClose();
    } catch (error) {
      console.error("Error submitting banner:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-all"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="text-xl font-bold text-[#2C3E50]">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="banner-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload Section */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700">
                Gambar Banner
                <span className="ml-2 text-xs font-normal text-gray-500">
                  (Rekomendasi ukuran: 1200 x 400 pixel)
                </span>
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative flex aspect-[3/1] w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-[#3498DB] hover:bg-blue-50"
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center text-gray-500">
                    <Upload size={32} className="mb-2" />
                    <span className="text-sm font-medium">Upload Image</span>
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                  <span className="font-medium text-white">Change Image</span>
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
              <p className="text-center text-xs text-gray-500">
                Gambar akan otomatis dikonversi ke format WebP untuk performa
                terbaik.
              </p>
            </div>

            {/* Form Fields Section */}
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Judul Banner
                </label>
                <input
                  type="text"
                  required
                  value={formData.title || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-[#3498DB]"
                  placeholder="Contoh: Promo Musim Panas"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Deskripsi
                </label>
                <textarea
                  rows={2}
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-[#3498DB]"
                  placeholder="Deskripsi singkat..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">
                    Link Tautan
                  </label>
                  <input
                    type="text"
                    value={formData.link || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, link: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-[#3498DB]"
                    placeholder="/products?category=sale"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">
                    Posisi (Urutan)
                  </label>
                  <input
                    type="number"
                    value={formData.position || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        position: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-[#3498DB]"
                  />
                </div>
              </div>

              <div className="flex items-center pt-2">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.active ?? true}
                    onChange={(e) =>
                      setFormData({ ...formData, active: e.target.checked })
                    }
                    className="h-5 w-5 rounded border-gray-300 text-[#3498DB] focus:ring-[#3498DB]"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Banner Aktif
                  </span>
                </label>
              </div>
            </div>
          </form>
        </div>

        <div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="submit"
            form="banner-form"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-lg bg-[#3498DB] px-6 py-2.5 font-bold text-white hover:bg-[#2980B9] disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={20} className="animate-spin" /> Menyimpan...
              </>
            ) : (
              <>
                <Save size={20} /> Simpan Banner
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
