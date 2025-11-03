"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Filter, Star } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  discount_price: number | null;
  category: string;
  rating: number;
  reviews_count: number;
  image_url: string;
  in_stock: boolean;
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    priceRange: "",
    minRating: 0,
    sort: "newest",
  });
  const supabase = createClient();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let query = supabase.from("products").select("*");

        if (filters.category) {
          query = query.eq("category", filters.category);
        }

        const { data } = await query;

        if (data) {
          let filtered = [...data];

          if (filters.priceRange === "under50")
            filtered = filtered.filter((p) => p.price < 50);
          else if (filters.priceRange === "50-100")
            filtered = filtered.filter((p) => p.price >= 50 && p.price <= 100);
          else if (filters.priceRange === "100-200")
            filtered = filtered.filter((p) => p.price >= 100 && p.price <= 200);
          else if (filters.priceRange === "over200")
            filtered = filtered.filter((p) => p.price > 200);

          if (filters.minRating > 0)
            filtered = filtered.filter((p) => p.rating >= filters.minRating);

          if (filters.sort === "price-low")
            filtered.sort(
              (a, b) =>
                (a.discount_price || a.price) - (b.discount_price || b.price),
            );
          else if (filters.sort === "price-high")
            filtered.sort(
              (a, b) =>
                (b.discount_price || b.price) - (a.discount_price || a.price),
            );
          else if (filters.sort === "rating")
            filtered.sort((a, b) => b.rating - a.rating);

          setProducts(data);
          setFilteredProducts(filtered);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters, supabase]);

  const FilterSection = () => (
    <div className="bg-white rounded-2xl p-6 shadow-md h-fit sticky top-40">
      <h3 className="font-bold text-[#2c3e50] mb-6 flex items-center gap-2 text-lg">
        <Filter size={20} /> Filters
      </h3>

      <div className="space-y-8">
        {/* Price Filter */}
        <div>
          <h4 className="font-bold text-[#2c3e50] mb-4 text-sm uppercase tracking-wide">
            Price Range
          </h4>
          <div className="space-y-3">
            {[
              { label: "Under $50", value: "under50" },
              { label: "$50 - $100", value: "50-100" },
              { label: "$100 - $200", value: "100-200" },
              { label: "Over $200", value: "over200" },
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="radio"
                  name="price"
                  value={option.value}
                  checked={filters.priceRange === option.value}
                  onChange={(e) =>
                    setFilters({ ...filters, priceRange: e.target.value })
                  }
                  className="w-4 h-4 accent-[#3498db] cursor-pointer"
                />
                <span className="text-[#2c3e50] group-hover:text-[#3498db] transition-colors">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <h4 className="font-bold text-[#2c3e50] mb-4 text-sm uppercase tracking-wide">
            Category
          </h4>
          <div className="space-y-3">
            {["Laptops", "Keyboards", "Mice", "Accessories"].map((cat) => (
              <label
                key={cat}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="radio"
                  name="category"
                  value={cat}
                  checked={filters.category === cat}
                  onChange={(e) =>
                    setFilters({ ...filters, category: e.target.value })
                  }
                  className="w-4 h-4 accent-[#3498db] cursor-pointer"
                />
                <span className="text-[#2c3e50] group-hover:text-[#3498db] transition-colors">
                  {cat}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Rating Filter */}
        <div>
          <h4 className="font-bold text-[#2c3e50] mb-4 text-sm uppercase tracking-wide">
            Rating
          </h4>
          <div className="space-y-3">
            {[4.5, 4.0, 3.5].map((rating) => (
              <label
                key={rating}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="radio"
                  name="rating"
                  value={rating}
                  checked={filters.minRating === rating}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      minRating: Number.parseFloat(e.target.value),
                    })
                  }
                  className="w-4 h-4 accent-[#3498db] cursor-pointer"
                />
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className="fill-yellow-400 text-yellow-400"
                    />
                  ))}
                  <span className="text-xs text-[#7f8c8d]">& up</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={() =>
            setFilters({
              category: "",
              priceRange: "",
              minRating: 0,
              sort: "newest",
            })
          }
          className="w-full bg-[#ecf0f1] hover:bg-[#95a5a6] text-[#2c3e50] py-3 rounded-lg transition-all font-bold text-sm"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <Header />

      <div className="pt-44 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#2c3e50] mb-2">
              All Products
            </h1>
            <p className="text-[#7f8c8d] text-lg">
              Discover our complete collection of premium tech accessories
            </p>
          </div>

          <div className="flex gap-8">
            {/* Sidebar Filters - Desktop */}
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <FilterSection />
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              {/* Sort Bar */}
              <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 shadow-md">
                <span className="text-sm font-semibold text-[#2c3e50]">
                  <span className="text-[#3498db] font-bold">
                    {filteredProducts.length}
                  </span>{" "}
                  products found
                </span>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <label className="font-semibold text-[#2c3e50] hidden sm:block">
                    Sort by:
                  </label>
                  <select
                    value={filters.sort}
                    onChange={(e) =>
                      setFilters({ ...filters, sort: e.target.value })
                    }
                    className="flex-1 sm:flex-none bg-[#ecf0f1] border-2 border-[#ecf0f1] rounded-lg px-4 py-2 text-[#2c3e50] font-medium focus:border-[#3498db] transition-all"
                  >
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                  </select>
                </div>
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="lg:hidden flex items-center gap-2 bg-[#3498db] text-white px-4 py-2 rounded-lg font-semibold"
                >
                  <Filter size={18} /> Filters
                </button>
              </div>

              {/* Mobile Filters */}
              {showMobileFilters && (
                <div className="lg:hidden mb-8">
                  <FilterSection />
                </div>
              )}

              {/* Products Grid */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-2xl h-80 animate-pulse shadow-md"
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <Link key={product.id} href={`/product/${product.id}`}>
                      <div className="bg-white rounded-2xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-premium card-hover h-full flex flex-col">
                        {/* Image */}
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
                                (1 - product.discount_price / product.price) *
                                  100,
                              )}
                              %
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-5 flex-grow flex flex-col">
                          <h3 className="font-bold text-[#2c3e50] mb-3 line-clamp-2 text-sm">
                            {product.name}
                          </h3>

                          {/* Rating */}
                          <div className="flex items-center gap-2 mb-4">
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={12}
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
                          <div className="flex items-center gap-2">
                            {product.discount_price ? (
                              <>
                                <span className="text-2xl font-bold text-[#3498db]">
                                  ${product.discount_price.toFixed(2)}
                                </span>
                                <span className="text-xs text-[#7f8c8d] line-through">
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
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
