"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { addToCart as addToCartUtil } from "@/lib/cart";
import Carousel from "@/components/ui/carousel";

import {
  Star,
  ShoppingCart,
  Zap,
  TrendingUp,
  Award,
  Heart,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  discount_price: number | null;
  image_url: string;
  rating: number;
  reviews_count: number;
  featured?: boolean;
}

interface Banner {
  id: string;
  title: string;
  description: string;
  image_url: string;
  link: string;
  active: boolean;
  position: number;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch banners
        const { data: bannersData } = await supabase
          .from("banners")
          .select("*")
          .eq("active", true)
          .order("position", { ascending: true });

        if (bannersData) {
          setBanners(bannersData);
        }

        // Try to fetch featured products first
        let { data: productsData } = await supabase
          .from("products")
          .select("*")
          .eq("featured", true)
          .limit(8);

        // If no featured products found, fallback to getting the latest products
        if (!productsData || productsData.length === 0) {
          console.log(
            "Featured products query failed or no featured products found, using fallback",
          );
          const { data: fallbackData, error: fallbackError } = await supabase
            .from("products")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(8);

          if (fallbackError) {
            console.error("Fallback query error:", fallbackError);
          } else {
            productsData = fallbackData;
          }
        }

        if (productsData) {
          console.log("Products loaded for home page:", productsData.length);
          setProducts(productsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [supabase]);

  const addToCart = async (product: Product) => {
    await addToCartUtil(product.id, 1);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Hero Banner Carousel Section */}
      <section className="pt-32 pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {banners.length > 0 ? (
            <Carousel
              banners={banners}
              autoplay={true}
              autoplayInterval={5000}
            />
          ) : (
            // Fallback banner if no banners in database
            <div className="relative h-[400px] w-full overflow-hidden rounded-2xl bg-linear-to-r from-[#2c3e50] via-[#34495e] to-[#3498db] md:h-[500px]">
              <div className="relative flex h-full items-center justify-center px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center text-white">
                  <div className="mb-6 inline-block rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm">
                    New Collection 2024
                  </div>
                  <h1 className="mb-4 text-3xl leading-tight font-bold md:text-5xl lg:text-6xl">
                    Premium Tech{" "}
                    <span className="text-[#ffd700]">Accessories</span> for Your
                    Setup
                  </h1>
                  <p className="mb-8 text-lg leading-relaxed text-white/90 md:text-xl lg:text-2xl">
                    Discover our exclusive collection of high-quality tech
                    accessories. From gaming peripherals to office essentials.
                  </p>
                  <Link
                    href="/products"
                    className="inline-flex transform items-center gap-2 rounded-xl bg-white px-8 py-4 font-bold text-gray-900 shadow-lg transition-all hover:scale-105 hover:bg-gray-100"
                  >
                    <Zap size={20} />
                    Shop Now
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-b border-[#ecf0f1] bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ecf0f1] text-[#3498db]">
                <Award size={24} />
              </div>
              <div>
                <div className="font-bold text-[#2c3e50]">Trusted</div>
                <div className="text-sm text-[#7f8c8d]">100K+ Customers</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ecf0f1] text-[#3498db]">
                <Zap size={24} />
              </div>
              <div>
                <div className="font-bold text-[#2c3e50]">Fast Shipping</div>
                <div className="text-sm text-[#7f8c8d]">2-3 Days Delivery</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ecf0f1] text-[#3498db]">
                <TrendingUp size={24} />
              </div>
              <div>
                <div className="font-bold text-[#2c3e50]">Best Prices</div>
                <div className="text-sm text-[#7f8c8d]">
                  Price Match Guarantee
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ecf0f1] text-[#3498db]">
                <Award size={24} />
              </div>
              <div>
                <div className="font-bold text-[#2c3e50]">30-Day Returns</div>
                <div className="text-sm text-[#7f8c8d]">Easy Returns</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex items-center justify-between">
            <div>
              <h2 className="mb-2 text-4xl font-bold text-[#2c3e50]">
                Featured Products
              </h2>
              <p className="text-[#7f8c8d]">Handpicked items just for you</p>
            </div>
            <Link
              href="/products"
              className="text-lg font-bold text-[#3498db] transition-colors hover:text-[#2980b9]"
            >
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-96 animate-pulse rounded-2xl bg-white shadow-md"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.slice(0, 8).map((product) => (
                <Link key={product.id} href={`/product/${product.id}`}>
                  <div className="hover:shadow-premium card-hover flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300">
                    {/* Image Container */}
                    <div className="group relative aspect-square overflow-hidden bg-[#f8f9fa]">
                      <Image
                        src={product.image_url || "/placeholder.svg"}
                        alt={product.name}
                        width={300}
                        height={300}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      {product.discount_price && (
                        <div className="badge-sale absolute top-4 left-4 z-10">
                          -
                          {Math.round(
                            (1 - product.discount_price / product.price) * 100,
                          )}
                          %
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          // TODO: Implement wishlist functionality
                          console.log("Add to wishlist", product.id);
                        }}
                        className="absolute top-4 right-4 z-10 translate-y-[-10px] transform rounded-full bg-white/80 p-2 text-gray-600 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-white hover:text-red-500"
                      >
                        <Heart size={20} />
                      </button>
                      <div className="absolute right-4 bottom-4 left-4 translate-y-[10px] opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addToCart(product);
                          }}
                          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#3498db] py-2 font-bold text-white transition hover:bg-[#2980b9]"
                        >
                          <ShoppingCart size={18} />
                          Add to Cart
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex grow flex-col p-5">
                      <h3 className="mb-3 line-clamp-2 h-10 text-sm font-bold text-[#2c3e50]">
                        {product.name}
                      </h3>

                      {/* Rating */}
                      <div className="mb-4 flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={
                                i < Math.floor(product.rating)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }
                            />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-[#2c3e50]">
                          {product.rating}
                        </span>
                        <span className="text-xs text-[#7f8c8d]">
                          ({product.reviews_count})
                        </span>
                      </div>

                      {/* Price */}
                      <div className="flex flex-wrap items-center gap-3">
                        {product.discount_price ? (
                          <>
                            <span className="text-2xl font-bold text-[#3498db]">
                              ${product.discount_price.toFixed(2)}
                            </span>
                            <span className="text-sm text-[#7f8c8d] line-through">
                              ${product.price.toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="text-2xl font-bold text-[#3498db]">
                            ${product.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
