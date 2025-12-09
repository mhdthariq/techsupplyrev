"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import BannerModal from "@/components/admin/BannerModal";
import type { Banner } from "@/lib/types";
import { convertImageToWebP } from "@/lib/image-utils";

interface BannerManagerProps {
  initialBanners: Banner[];
}

export default function BannerManager({ initialBanners }: BannerManagerProps) {
  const [banners, setBanners] = useState<Banner[]>(initialBanners);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  const supabase = createClient();
  const { toast } = useToast();

  const handleOpenAddModal = () => {
    setEditingBanner(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (banner: Banner) => {
    setEditingBanner(banner);
    setIsModalOpen(true);
  };

  const handleSaveBanner = async (
    bannerData: Partial<Banner>,
    imageFile?: File,
  ) => {
    let uploadedFilePath: string | null = null;
    let oldImagePath: string | null = null;

    try {
      let imageUrl = bannerData.image_url;

      // Handle Image Upload
      if (imageFile) {
        // Convert to WebP
        const webpBlob = await convertImageToWebP(imageFile);
        const webpFile = new File([webpBlob], `${Date.now()}.webp`, {
          type: "image/webp",
        });

        // Upload to Supabase Storage -> 'banners' bucket
        const fileName = `${Date.now()}_${webpFile.name}`;
        uploadedFilePath = fileName;

        const { error: uploadError } = await supabase.storage
          .from("banners")
          .upload(fileName, webpFile);

        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("banners").getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      if (editingBanner) {
        // Identify old image path for cleanup if image is changed
        if (
          imageFile &&
          editingBanner.image_url &&
          editingBanner.image_url.includes("/banners/")
        ) {
          const parts = editingBanner.image_url.split("/banners/");
          if (parts.length === 2) {
            oldImagePath = parts[1];
          }
        }

        // Update
        const { data, error } = await supabase
          .from("banners")
          .update({
            ...bannerData,
            image_url: imageUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingBanner.id)
          .select()
          .single();

        if (error) throw error;

        // Cleanup old image
        if (oldImagePath) {
          await supabase.storage.from("banners").remove([oldImagePath]);
        }

        setBanners(banners.map((b) => (b.id === editingBanner.id ? data : b)));
        toast({
          title: "Banner diperbarui",
          description: `${data.title} berhasil diperbarui`,
          variant: "success",
        });
      } else {
        // Create
        const { data, error } = await supabase
          .from("banners")
          .insert({
            ...bannerData,
            image_url: imageUrl || "/placeholder.svg",
            active: bannerData.active ?? true,
            position: bannerData.position ?? 0,
          })
          .select()
          .single();

        if (error) throw error;

        setBanners([...banners, data]);
        toast({
          title: "Banner ditambahkan",
          description: "Banner baru berhasil ditambahkan",
          variant: "success",
        });
      }
    } catch (error) {
      // Cleanup uploaded file if DB operation fails
      if (uploadedFilePath) {
        await supabase.storage.from("banners").remove([uploadedFilePath]);
      }

      console.error("Error saving banner:", error);
      toast({
        title: "Gagal menyimpan banner",
        description:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat menyimpan",
        variant: "destructive",
      });
      // Do not throw, keep modal open? Or rethrow?
      // Keeping it simple so user can retry or close.
    }
  };

  const deleteBanner = async (id: string) => {
    const bannerToDelete = banners.find((b) => b.id === id);
    if (!confirm(`Apakah Anda yakin ingin menghapus banner ini?`)) return;

    try {
      // Get image path to delete
      let imagePath = null;
      if (
        bannerToDelete?.image_url &&
        bannerToDelete.image_url.includes("/banners/")
      ) {
        const parts = bannerToDelete.image_url.split("/banners/");
        if (parts.length === 2) imagePath = parts[1];
      }

      await supabase.from("banners").delete().eq("id", id);

      // Delete image from storage
      if (imagePath) {
        await supabase.storage.from("banners").remove([imagePath]);
      }

      setBanners(banners.filter((b) => b.id !== id));
      toast({
        title: "Banner dihapus",
        description: "Banner berhasil dihapus",
        variant: "success",
      });
    } catch (error) {
      console.error("Error deleting banner:", error);
      toast({
        title: "Gagal menghapus banner",
        description: "Mohon coba lagi",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#2C3E50]">Banner</h2>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 rounded-lg bg-[#3498DB] px-4 py-2 font-bold text-white shadow-sm transition-colors hover:bg-[#2980B9]"
        >
          <Plus size={20} /> Tambah Banner
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <div className="relative aspect-[3/1] w-full overflow-hidden rounded-lg bg-gray-100">
              {banner.image_url && (
                <Image
                  src={banner.image_url}
                  alt={banner.title}
                  fill
                  className="object-cover"
                />
              )}
            </div>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-[#2C3E50]">{banner.title}</h3>
                <p className="line-clamp-1 text-sm text-gray-500">
                  {banner.description}
                </p>
                <div className="mt-2 flex gap-2">
                  {banner.active ? (
                    <span className="inline-block rounded bg-green-50 px-2 py-1 text-xs font-medium text-green-600">
                      Aktif
                    </span>
                  ) : (
                    <span className="inline-block rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-500">
                      Non-aktif
                    </span>
                  )}
                  <span className="inline-block rounded bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600">
                    Posisi: {banner.position}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenEditModal(banner)}
                  className="rounded-lg p-2 text-blue-500 transition-colors hover:bg-blue-50"
                >
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
          </div>
        ))}
      </div>

      <BannerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveBanner}
        initialData={editingBanner}
        title={editingBanner ? "Edit Banner" : "Tambah Banner Baru"}
      />
    </div>
  );
}
