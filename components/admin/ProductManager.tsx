"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ProductTable from "@/components/admin/ProductTable";
import ProductModal from "@/components/admin/ProductModal";
import type { Product } from "@/lib/types";
import { convertImageToWebP } from "@/lib/image-utils";

interface ProductManagerProps {
  initialProducts: Product[];
}

export default function ProductManager({
  initialProducts,
}: ProductManagerProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const supabase = createClient();
  const { toast } = useToast();

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (
    productData: Partial<Product>,
    imageFile?: File,
  ) => {
    let uploadedFilePath: string | null = null;
    let oldImagePath: string | null = null;

    try {
      let imageUrl = productData.image_url;

      // Handle Image Upload
      if (imageFile) {
        // Convert to WebP
        const webpBlob = await convertImageToWebP(imageFile);
        const webpFile = new File([webpBlob], `${Date.now()}.webp`, {
          type: "image/webp",
        });

        // Upload to Supabase Storage
        const fileName = `${Date.now()}_${webpFile.name}`;
        // Store path for cleanup
        uploadedFilePath = fileName;

        const { error: uploadError } = await supabase.storage
          .from("products")
          .upload(fileName, webpFile);

        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        // Get Public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("products").getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      if (editingProduct) {
        // Identify old image path for cleanup if image is changed
        if (
          imageFile &&
          editingProduct.image_url &&
          editingProduct.image_url.includes("/products/")
        ) {
          const parts = editingProduct.image_url.split("/products/");
          if (parts.length === 2) {
            oldImagePath = parts[1];
          }
        }

        // Update
        const { data, error } = await supabase
          .from("products")
          .update({
            ...productData,
            image_url: imageUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingProduct.id)
          .select()
          .single();

        if (error) throw error;

        // If updated successfully and we have an old image to delete
        if (oldImagePath) {
          await supabase.storage.from("products").remove([oldImagePath]);
        }

        setProducts(
          products.map((p) => (p.id === editingProduct.id ? data : p)),
        );
        toast({
          title: "Produk diperbarui",
          description: `${data.name} berhasil diperbarui`,
          variant: "success",
        });
      } else {
        // Create
        const { data, error } = await supabase
          .from("products")
          .insert({
            ...productData,
            image_url: imageUrl || "/placeholder.svg",
            reviews_count: 0,
            rating: 0,
            stock_quantity: productData.stock_quantity || 0,
          })
          .select()
          .single();

        if (error) throw error;

        setProducts([data, ...products]);
        toast({
          title: "Produk ditambahkan",
          description: `${data.name} berhasil ditambahkan`,
          variant: "success",
        });
      }
    } catch (error) {
      // Cleanup uploaded file if DB operation fails
      if (uploadedFilePath) {
        await supabase.storage.from("products").remove([uploadedFilePath]);
      }

      console.error("Error saving product:", error);
      toast({
        title: "Gagal menyimpan produk",
        description:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat menyimpan",
        variant: "destructive",
      });
      // Do NOT throw here if you want the modal to remain open but just show error
      // throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    const productToDelete = products.find((p) => p.id === id);
    if (!confirm(`Apakah Anda yakin ingin menghapus ${productToDelete?.name}?`))
      return;

    try {
      await supabase.from("products").delete().eq("id", id);
      setProducts(products.filter((p) => p.id !== id));
      toast({
        title: "Produk dihapus",
        description: `${productToDelete?.name} telah dihapus`,
        variant: "success",
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Gagal menghapus produk",
        description: "Mohon coba lagi",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#2C3E50]">Produk</h2>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 rounded-lg bg-[#3498DB] px-4 py-2 font-bold text-white shadow-sm transition-colors hover:bg-[#2980B9]"
        >
          <Plus size={20} /> Tambah Produk
        </button>
      </div>

      <ProductTable
        products={products}
        deleteProduct={deleteProduct}
        onEdit={handleOpenEditModal}
      />

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveProduct}
        initialData={editingProduct}
        title={editingProduct ? "Edit Produk" : "Tambah Produk Baru"}
      />
    </div>
  );
}
