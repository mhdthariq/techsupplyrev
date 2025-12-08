"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ProductTable from "@/components/admin/ProductTable";
import type { Product } from "@/lib/types";

interface ProductManagerProps {
  initialProducts: Product[];
}

export default function ProductManager({
  initialProducts,
}: ProductManagerProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    discount_price: "",
    category: "",
    brand: "",
  });

  const supabase = createClient();
  const { toast } = useToast();

  const addProduct = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .insert({
          name: newProduct.name,
          price: Number.parseFloat(newProduct.price),
          discount_price: newProduct.discount_price
            ? Number.parseFloat(newProduct.discount_price)
            : null,
          category: newProduct.category,
          brand: newProduct.brand,
          reviews_count: 0,
          rating: 0,
          in_stock: true,
          stock_quantity: 0, // Default value
          image_url: "/placeholder.svg", // Default image
        })
        .select()
        .single();

      if (error) throw error;

      setProducts([data, ...products]);
      setNewProduct({
        name: "",
        price: "",
        discount_price: "",
        category: "",
        brand: "",
      });
      toast({
        title: "Produk berhasil ditambahkan!",
        description: `${data.name} telah ditambahkan ke toko Anda`,
        variant: "success",
      });
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Gagal menambahkan produk",
        description: "Mohon periksa semua kolom dan coba lagi",
        variant: "destructive",
      });
    }
  };

  const deleteProduct = async (id: string) => {
    const productToDelete = products.find((p) => p.id === id);
    try {
      await supabase.from("products").delete().eq("id", id);
      setProducts(products.filter((p) => p.id !== id));
      toast({
        title: "Produk dihapus",
        description: productToDelete
          ? `${productToDelete.name} telah dihapus`
          : "Produk telah dihapus",
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
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-bold text-[#2C3E50]">
          Tambah Produk Baru
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <input
            type="text"
            placeholder="Nama produk"
            value={newProduct.name}
            onChange={(e) =>
              setNewProduct({ ...newProduct, name: e.target.value })
            }
            className="rounded-lg border border-gray-300 px-4 py-2 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-[#3498DB]"
          />
          <input
            type="number"
            placeholder="Harga"
            value={newProduct.price}
            onChange={(e) =>
              setNewProduct({ ...newProduct, price: e.target.value })
            }
            className="rounded-lg border border-gray-300 px-4 py-2 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-[#3498DB]"
          />
          <input
            type="number"
            placeholder="Harga diskon"
            value={newProduct.discount_price}
            onChange={(e) =>
              setNewProduct({
                ...newProduct,
                discount_price: e.target.value,
              })
            }
            className="rounded-lg border border-gray-300 px-4 py-2 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-[#3498DB]"
          />
          <input
            type="text"
            placeholder="Kategori"
            value={newProduct.category}
            onChange={(e) =>
              setNewProduct({ ...newProduct, category: e.target.value })
            }
            className="rounded-lg border border-gray-300 px-4 py-2 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-[#3498DB]"
          />
          <input
            type="text"
            placeholder="Merek"
            value={newProduct.brand}
            onChange={(e) =>
              setNewProduct({ ...newProduct, brand: e.target.value })
            }
            className="rounded-lg border border-gray-300 px-4 py-2 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-[#3498DB]"
          />
          <button
            onClick={addProduct}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#3498DB] px-4 py-2 font-bold text-white shadow-sm transition-colors hover:bg-[#2980B9]"
          >
            <Plus size={20} /> Add
          </button>
        </div>
      </div>

      <ProductTable products={products} deleteProduct={deleteProduct} />
    </div>
  );
}
