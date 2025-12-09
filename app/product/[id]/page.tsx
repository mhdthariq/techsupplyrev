"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ReviewList from "@/components/reviews/ReviewList";
import { createClient } from "@/lib/supabase/client";
import { addToCart as addToCartUtil } from "@/lib/cart";
import { formatCurrency } from "@/lib/utils";
import {
  Star,
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  Check,
  Minus,
  Plus,
  ArrowLeft,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount_price: number | null;
  category: string;
  image_url: string;
  rating: number;
  reviews_count: number;
  in_stock: boolean;
  stock_quantity: number;
  featured: boolean;
}

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState("deskripsi");
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!params.id) return;

      try {
        // Fetch product details
        const { data: productData, error: productError } = await supabase
          .from("products")
          .select("*")
          .eq("id", params.id)
          .single();

        if (productError) {
          console.error("Error fetching product:", productError);
          router.push("/products");
          return;
        }

        setProduct(productData);

        // Fetch related products from same category
        if (productData?.category) {
          const { data: relatedData } = await supabase
            .from("products")
            .select("*")
            .eq("category", productData.category)
            .neq("id", productData.id)
            .limit(4);

          setRelatedProducts(relatedData || []);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id, supabase, router]);

  const addToCart = async () => {
    if (!product) return;
    await addToCartUtil(product.id, quantity);
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  const shareProduct = () => {
    if (navigator.share && product) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const incrementQuantity = () => {
    if (product && quantity < product.stock_quantity) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] pt-32 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-2">
            <div className="h-96 animate-pulse rounded-2xl bg-white" />
            <div className="space-y-4">
              <div className="h-8 animate-pulse rounded bg-white" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-white" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-white" />
              <div className="h-12 animate-pulse rounded bg-white" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f9fa] pt-32 pb-20">
        <div className="text-center">
          <h1 className="mb-4 text-3xl font-bold text-[#2c3e50]">
            Produk Tidak Ditemukan
          </h1>
          <p className="mb-8 text-[#7f8c8d]">
            Produk yang Anda cari tidak tersedia.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-xl bg-[#3498db] px-6 py-3 font-bold text-white transition hover:bg-[#2980b9]"
          >
            <ArrowLeft size={20} />
            Kembali ke Produk
          </Link>
        </div>
      </div>
    );
  }

  const discountPercentage = product.discount_price
    ? Math.round((1 - product.discount_price / product.price) * 100)
    : 0;

  const finalPrice = product.discount_price || product.price;

  return (
    <div className="min-h-screen bg-[#f8f9fa] pt-32 pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center space-x-2 text-sm text-[#7f8c8d]">
          <Link href="/" className="hover:text-[#3498db]">
            Beranda
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-[#3498db]">
            Produk
          </Link>
          <span>/</span>
          <Link
            href={`/products?category=${product.category}`}
            className="hover:text-[#3498db]"
          >
            {product.category}
          </Link>
          <span>/</span>
          <span className="font-medium text-[#2c3e50]">{product.name}</span>
        </nav>

        {/* Product Details */}
        <div className="mb-16 grid gap-12 lg:grid-cols-2">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="group relative overflow-hidden rounded-2xl bg-white shadow-md">
              <Image
                src={product.image_url || "/placeholder.svg"}
                alt={product.name}
                width={500}
                height={500}
                className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {product.discount_price && (
                <div className="absolute top-4 right-4 rounded-full bg-[#e74c3c] px-3 py-1 text-sm font-bold text-white">
                  -{discountPercentage}%
                </div>
              )}
              {!product.in_stock && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <span className="rounded-xl bg-white px-6 py-3 font-bold text-[#2c3e50]">
                    Stok Habis
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="mb-4 text-3xl font-bold text-[#2c3e50] md:text-4xl">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="mb-6 flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={
                        i < Math.floor(product.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }
                    />
                  ))}
                </div>
                <span className="text-lg font-bold text-[#2c3e50]">
                  {product.rating}
                </span>
                <span className="text-[#7f8c8d]">
                  ({product.reviews_count} ulasan)
                </span>
              </div>

              {/* Price */}
              <div className="mb-6 flex items-center gap-4">
                <span className="text-4xl font-bold text-[#3498db]">
                  {formatCurrency(finalPrice)}
                </span>
                {product.discount_price && (
                  <span className="text-xl text-[#7f8c8d] line-through">
                    {formatCurrency(product.price)}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-6 flex items-center gap-2">
                {product.in_stock ? (
                  <>
                    <Check className="text-green-500" size={20} />
                    <span className="font-medium text-green-600">
                      Tersedia ({product.stock_quantity} unit)
                    </span>
                  </>
                ) : (
                  <>
                    <span className="font-medium text-red-500">Stok Habis</span>
                  </>
                )}
              </div>
            </div>

            {/* Quantity Selector & Add to Cart */}
            {product.in_stock && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="font-medium text-[#2c3e50]">Kuantitas:</span>
                  <div className="flex items-center rounded-lg border border-[#ecf0f1]">
                    <button
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                      className="p-2 hover:bg-[#f8f9fa] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-4 py-2 font-medium">{quantity}</span>
                    <button
                      onClick={incrementQuantity}
                      disabled={quantity >= product.stock_quantity}
                      className="p-2 hover:bg-[#f8f9fa] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={addToCart}
                    className="flex flex-1 transform items-center justify-center gap-2 rounded-xl bg-[#3498db] px-6 py-4 font-bold text-white transition hover:scale-105 hover:bg-[#2980b9]"
                  >
                    <ShoppingCart size={20} />
                    Tambah ke Keranjang
                  </button>
                  <button
                    onClick={toggleWishlist}
                    className={`rounded-xl border-2 p-4 transition ${
                      isWishlisted
                        ? "border-[#e74c3c] bg-[#e74c3c] text-white"
                        : "border-[#ecf0f1] hover:border-[#3498db] hover:text-[#3498db]"
                    }`}
                  >
                    <Heart size={20} fill={isWishlisted ? "white" : "none"} />
                  </button>
                  <button
                    onClick={shareProduct}
                    className="rounded-xl border-2 border-[#ecf0f1] p-4 transition hover:border-[#3498db] hover:text-[#3498db]"
                  >
                    <Share2 size={20} />
                  </button>
                </div>
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-1 gap-4 border-t border-[#ecf0f1] pt-6 md:grid-cols-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ecf0f1] text-[#3498db]">
                  <Truck size={20} />
                </div>
                <div>
                  <div className="font-medium text-[#2c3e50]">
                    Gratis Ongkir
                  </div>
                  <div className="text-sm text-[#7f8c8d]">
                    Minimal belanja Rp 750rb
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ecf0f1] text-[#3498db]">
                  <RotateCcw size={20} />
                </div>
                <div>
                  <div className="font-medium text-[#2c3e50]">
                    30 Hari Pengembalian
                  </div>
                  <div className="text-sm text-[#7f8c8d]">Mudah & Cepat</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ecf0f1] text-[#3498db]">
                  <Shield size={20} />
                </div>
                <div>
                  <div className="font-medium text-[#2c3e50]">Garansi</div>
                  <div className="text-sm text-[#7f8c8d]">1 Tahun Garansi</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="mb-16 rounded-2xl bg-white shadow-md">
          <div className="border-b border-[#ecf0f1]">
            <div className="flex gap-8 px-8">
              {["deskripsi", "spesifikasi", "ulasan"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`py-4 font-medium capitalize transition ${
                    selectedTab === tab
                      ? "border-b-2 border-[#3498db] text-[#3498db]"
                      : "text-[#7f8c8d] hover:text-[#2c3e50]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="p-8">
            {selectedTab === "deskripsi" && (
              <div className="prose max-w-none">
                <p className="leading-relaxed text-[#2c3e50]">
                  {product.description || "Tidak ada deskripsi tersedia."}
                </p>
              </div>
            )}

            {selectedTab === "spesifikasi" && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-[#ecf0f1] py-2">
                    <span className="font-medium text-[#2c3e50]">Kategori</span>
                    <span className="text-[#7f8c8d]">{product.category}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#ecf0f1] py-2">
                    <span className="font-medium text-[#2c3e50]">Merek</span>
                    <span className="text-[#7f8c8d]">TechSupply</span>
                  </div>
                  <div className="flex justify-between border-b border-[#ecf0f1] py-2">
                    <span className="font-medium text-[#2c3e50]">Rating</span>
                    <span className="text-[#7f8c8d]">{product.rating}/5</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-[#ecf0f1] py-2">
                    <span className="font-medium text-[#2c3e50]">
                      Ketersediaan
                    </span>
                    <span
                      className={
                        product.in_stock ? "text-green-600" : "text-red-600"
                      }
                    >
                      {product.in_stock ? "Tersedia" : "Stok Habis"}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-[#ecf0f1] py-2">
                    <span className="font-medium text-[#2c3e50]">SKU</span>
                    <span className="text-[#7f8c8d]">
                      {product.id.slice(0, 8)}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-[#ecf0f1] py-2">
                    <span className="font-medium text-[#2c3e50]">Berat</span>
                    <span className="text-[#7f8c8d]">0.5 kg</span>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === "ulasan" && (
              <ReviewList
                productId={product.id}
                productName={product.name}
                productImage={product.image_url}
              />
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section>
            <h2 className="mb-8 text-3xl font-bold text-[#2c3e50]">
              Produk Terkait
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  href={`/product/${relatedProduct.id}`}
                >
                  <div className="overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg">
                    <div className="aspect-square overflow-hidden bg-[#f8f9fa]">
                      <Image
                        src={relatedProduct.image_url || "/placeholder.svg"}
                        alt={relatedProduct.name}
                        width={300}
                        height={300}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="mb-2 line-clamp-2 font-bold text-[#2c3e50]">
                        {relatedProduct.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        {relatedProduct.discount_price ? (
                          <>
                            <span className="text-lg font-bold text-[#3498db]">
                              {formatCurrency(relatedProduct.discount_price)}
                            </span>
                            <span className="text-sm text-[#7f8c8d] line-through">
                              {formatCurrency(relatedProduct.price)}
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-[#3498db]">
                            {formatCurrency(relatedProduct.price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
