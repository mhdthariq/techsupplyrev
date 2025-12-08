"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Banner {
  id: string;
  title: string;
  description: string;
  link: string;
  image_url: string;
  active: boolean;
}

interface BannerManagerProps {
  initialBanners: Banner[];
}

export default function BannerManager({ initialBanners }: BannerManagerProps) {
  const [banners, setBanners] = useState<Banner[]>(initialBanners);
  const [newBanner, setNewBanner] = useState({
    title: "",
    description: "",
    link: "",
    image_url: "",
  });

  const supabase = createClient();

  const addBanner = async () => {
    try {
      const { data, error } = await supabase
        .from("banners")
        .insert({
          title: newBanner.title,
          description: newBanner.description,
          link: newBanner.link,
          image_url: newBanner.image_url || "/placeholder.svg",
          active: true,
        })
        .select()
        .single();

      if (error) throw error;
      setBanners([...banners, data]);
      setNewBanner({ title: "", description: "", link: "", image_url: "" });
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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#2C3E50]">Banner</h2>
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-bold text-[#2C3E50]">
          Tambah Banner Baru
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <input
            type="text"
            placeholder="Judul banner"
            value={newBanner.title}
            onChange={(e) =>
              setNewBanner({ ...newBanner, title: e.target.value })
            }
            className="rounded-lg border border-gray-300 px-4 py-2 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-[#3498DB]"
          />
          <input
            type="text"
            placeholder="Deskripsi"
            value={newBanner.description}
            onChange={(e) =>
              setNewBanner({
                ...newBanner,
                description: e.target.value,
              })
            }
            className="rounded-lg border border-gray-300 px-4 py-2 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-[#3498DB]"
          />
          <input
            type="text"
            placeholder="Tautan"
            value={newBanner.link}
            onChange={(e) =>
              setNewBanner({ ...newBanner, link: e.target.value })
            }
            className="rounded-lg border border-gray-300 px-4 py-2 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-[#3498DB]"
          />
          <input
            type="text"
            placeholder="URL Gambar"
            value={newBanner.image_url}
            onChange={(e) =>
              setNewBanner({ ...newBanner, image_url: e.target.value })
            }
            className="rounded-lg border border-gray-300 px-4 py-2 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-[#3498DB]"
          />
          <button
            onClick={addBanner}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#3498DB] px-4 py-2 font-bold text-white shadow-sm transition-colors hover:bg-[#2980B9]"
          >
            <Plus size={20} /> Add
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <div>
              <h3 className="font-bold text-[#2C3E50]">{banner.title}</h3>
              <span className="mt-2 inline-block rounded bg-green-50 px-2 py-1 text-sm text-green-600">
                Aktif
              </span>
            </div>
            <div className="flex gap-2">
              <button className="rounded-lg p-2 text-blue-500 transition-colors hover:bg-blue-50">
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
        ))}
      </div>
    </div>
  );
}
