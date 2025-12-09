"use client";

import { useState, useEffect, useRef } from "react";
import { X, Upload, Save, Loader2 } from "lucide-react";
import Image from "next/image";
import type { Product } from "@/lib/types";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (productData: Partial<Product>, imageFile?: File) => Promise<void>;
  initialData?: Product | null;
  title: string;
}

export default function ProductModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
}: ProductModalProps) {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    price: 0,
    discount_price: null,
    category: "",
    brand: "",
    description: "",
    stock_quantity: 0,
    in_stock: true,
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
        name: "",
        price: 0,
        discount_price: null,
        category: "",
        brand: "",
        description: "",
        stock_quantity: 0,
        in_stock: true,
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
      console.error("Error submitting product:", error);
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
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
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
          <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col gap-6 md:flex-row">
              {/* Image Upload Section */}
              <div className="w-full space-y-4 md:w-1/3">
                <label className="block text-sm font-semibold text-gray-700">
                  Gambar Produk
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative flex aspect-square w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-[#3498DB] hover:bg-blue-50"
                >
                  {previewUrl ? (
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                      unoptimized
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
              <div className="flex-1 space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">
                    Nama Produk
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-[#3498DB]"
                    placeholder="Contoh: Wireless Mouse"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">
                      Harga (IDR)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.price || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: Number(e.target.value),
                        })
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-[#3498DB]"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">
                      Harga Diskon (Opsional)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.discount_price || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discount_price: e.target.value
                            ? Number(e.target.value)
                            : null,
                        })
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-[#3498DB]"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">
                      Kategori
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.category || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-[#3498DB]"
                      placeholder="Elektronik"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">
                      Merek
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.brand || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, brand: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-[#3498DB]"
                      placeholder="Logitech"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">
                      Stok
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.stock_quantity || 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          stock_quantity: Number(e.target.value),
                        })
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-[#3498DB]"
                    />
                  </div>
                  <div className="flex items-center pt-6">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.in_stock ?? true}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            in_stock: e.target.checked,
                          })
                        }
                        className="h-5 w-5 rounded border-gray-300 text-[#3498DB] focus:ring-[#3498DB]"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Product In Stock
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Deskripsi
              </label>
              <textarea
                rows={4}
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-[#3498DB]"
                placeholder="Deskripsi produk..."
              />
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
            form="product-form"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-lg bg-[#3498DB] px-6 py-2.5 font-bold text-white hover:bg-[#2980B9] disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={20} className="animate-spin" /> Menyimpan...
              </>
            ) : (
              <>
                <Save size={20} /> Simpan Produk
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
