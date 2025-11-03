"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Star, ShoppingCart, Zap, TrendingUp, Award } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  discount_price: number | null;
  image_url: string;
  rating: number;
  reviews_count: number;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: productsData } = await supabase
          .from("products")
          .select("*")
          .eq("featured", true)
          .limit(8);

        if (productsData) setProducts(productsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [supabase]);

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <Header />

      {/* Hero Banner Section */}
      <section className="pt-40 pb-20 bg-gradient-to-r from-[#2c3e50] via-[#34495e] to-[#3498db]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="inline-block badge-new mb-6">
                New Collection 2024
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Premium Tech <span className="text-[#ffd700]">Accessories</span>{" "}
                for Your Setup
              </h1>
              <p className="text-xl text-[#ecf0f1] mb-8 leading-relaxed">
                Discover our exclusive collection of high-quality tech
                accessories. From gaming peripherals to office essentials.
              </p>
              <div className="flex gap-4">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 bg-white text-[#2c3e50] px-8 py-4 rounded-xl font-bold hover:bg-[#ecf0f1] transition-all transform hover:scale-105"
                >
                  <Zap size={20} />
                  Shop Now
                </Link>
                <Link
                  href="/deals"
                  className="inline-flex items-center gap-2 bg-[#e74c3c] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#c0392b] transition-all transform hover:scale-105"
                >
                  View Deals
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/10 backdrop-blur rounded-2xl p-8 border border-white/20">
                <div className="bg-gradient-to-br from-[#3498db] to-[#2c3e50] rounded-xl h-96 flex items-center justify-center">
                  <div className="text-6xl">🎮</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-white py-8 border-b border-[#ecf0f1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#ecf0f1] rounded-full flex items-center justify-center text-[#3498db]">
                <Award size={24} />
              </div>
              <div>
                <div className="font-bold text-[#2c3e50]">Trusted</div>
                <div className="text-sm text-[#7f8c8d]">100K+ Customers</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#ecf0f1] rounded-full flex items-center justify-center text-[#3498db]">
                <Zap size={24} />
              </div>
              <div>
                <div className="font-bold text-[#2c3e50]">Fast Shipping</div>
                <div className="text-sm text-[#7f8c8d]">2-3 Days Delivery</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#ecf0f1] rounded-full flex items-center justify-center text-[#3498db]">
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
              <div className="w-12 h-12 bg-[#ecf0f1] rounded-full flex items-center justify-center text-[#3498db]">
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
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-[#2c3e50] mb-2">
                Featured Products
              </h2>
              <p className="text-[#7f8c8d]">Handpicked items just for you</p>
            </div>
            <Link
              href="/products"
              className="text-[#3498db] hover:text-[#2980b9] font-bold text-lg transition-colors"
            >
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl h-96 animate-pulse shadow-md"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.slice(0, 8).map((product) => (
                <Link key={product.id} href={`/product/${product.id}`}>
                  <div className="bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-premium card-hover h-full flex flex-col">
                    {/* Image Container */}
                    <div className="relative aspect-square bg-[#f8f9fa] overflow-hidden group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.image_url || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {product.discount_price && (
                        <div className="absolute top-4 right-4 badge-sale">
                          -
                          {Math.round(
                            (1 - product.discount_price / product.price) * 100,
                          )}
                          %
                        </div>
                      )}
                      <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <button className="w-full bg-[#3498db] hover:bg-[#2980b9] text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition">
                          <ShoppingCart size={18} />
                          Add to Cart
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-grow flex flex-col">
                      <h3 className="font-bold text-[#2c3e50] line-clamp-2 mb-3 text-sm h-10">
                        {product.name}
                      </h3>

                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-4">
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
                      <div className="flex items-center gap-3 flex-wrap">
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

      {/* Category Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-[#ecf0f1]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-[#2c3e50] mb-12">
            Shop by Category
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: "Laptops",
                icon: "💻",
                color: "from-blue-400 to-blue-600",
              },
              {
                name: "Keyboards",
                icon: "⌨️",
                color: "from-purple-400 to-purple-600",
              },
              { name: "Mice", icon: "🖱️", color: "from-pink-400 to-pink-600" },
              {
                name: "Accessories",
                icon: "🎧",
                color: "from-orange-400 to-orange-600",
              },
            ].map((category) => (
              <Link
                key={category.name}
                href={`/products?category=${category.name}`}
              >
                <div
                  className={`bg-gradient-to-br ${category.color} rounded-2xl p-8 text-center hover:shadow-premium transition-all duration-300 transform hover:scale-105 cursor-pointer h-full flex flex-col items-center justify-center`}
                >
                  <div className="text-5xl mb-4">{category.icon}</div>
                  <h3 className="font-bold text-white text-xl">
                    {category.name}
                  </h3>
                  <p className="text-white/80 text-sm mt-2">
                    Browse collection
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
