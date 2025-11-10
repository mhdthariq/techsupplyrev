"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

import { Filter, Star, Search, X, Grid3X3, List } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  discount_price: number | null;
  category: string;
  rating: number;
  reviews_count: number;
  image_url: string;
  in_stock: boolean;
  featured?: boolean;
  created_at?: string;
}

export default function ProductsPage() {
  const searchParams = useSearchParams();

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    priceRange: "",
    minRating: 0,
    sort: "newest",
  });
  const supabase = createClient();

  // Fetch all products once on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase.from("products").select("*");

        if (error) {
          console.error("Error fetching products:", error);
          setAllProducts([]);
          return;
        }

        if (data) {
          setAllProducts(data);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [supabase]);

  // Filter and sort products client-side whenever filters or search changes
  useEffect(() => {
    if (allProducts.length === 0) return;

    let filtered = [...allProducts];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query),
      );
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(
        (p) => p.category.toLowerCase() === filters.category.toLowerCase(),
      );
    }

    // Apply price filter
    if (filters.priceRange === "under50")
      filtered = filtered.filter((p) => p.price < 50);
    else if (filters.priceRange === "50-100")
      filtered = filtered.filter((p) => p.price >= 50 && p.price <= 100);
    else if (filters.priceRange === "100-200")
      filtered = filtered.filter((p) => p.price >= 100 && p.price <= 200);
    else if (filters.priceRange === "over200")
      filtered = filtered.filter((p) => p.price > 200);

    // Apply rating filter
    if (filters.minRating > 0)
      filtered = filtered.filter((p) => p.rating >= filters.minRating);

    // Apply sorting
    if (filters.sort === "price-low")
      filtered.sort(
        (a, b) => (a.discount_price || a.price) - (b.discount_price || b.price),
      );
    else if (filters.sort === "price-high")
      filtered.sort(
        (a, b) => (b.discount_price || b.price) - (a.discount_price || a.price),
      );
    else if (filters.sort === "rating")
      filtered.sort((a, b) => b.rating - a.rating);
    else if (filters.sort === "newest")
      filtered.sort(
        (a, b) =>
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime(),
      );

    setFilteredProducts(filtered);
  }, [allProducts, filters, searchQuery]);

  const FilterSection = () => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-fit sticky top-32">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-gray-900 text-lg">Filters</h3>
        <button
          onClick={() => {
            setFilters({
              category: "",
              priceRange: "",
              minRating: 0,
              sort: "newest",
            });
            setSearchQuery("");
          }}
          className="text-sm text-[#3498db] hover:text-[#2980b9] font-medium"
        >
          Clear all
        </button>
      </div>

      <div className="space-y-6">
        {/* Category Filter */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Category</h4>
          <div className="space-y-2">
            {[
              { value: "", label: "All Categories" },
              { value: "Electronics", label: "Electronics" },
              { value: "Peripherals", label: "Peripherals" },
              { value: "Accessories", label: "Accessories" },
              { value: "Storage", label: "Storage" },
              { value: "Lighting", label: "Lighting" },
            ].map((cat) => (
              <label
                key={cat.value}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="radio"
                  name="category"
                  value={cat.value}
                  checked={filters.category === cat.value}
                  onChange={(e) =>
                    setFilters({ ...filters, category: e.target.value })
                  }
                  className="w-4 h-4 text-[#3498db] border-gray-300 focus:ring-[#3498db]"
                />
                <span className="text-sm text-gray-700 group-hover:text-[#3498db] transition-colors">
                  {cat.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Filter */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
          <div className="space-y-2">
            {[
              { value: "", label: "Any Price" },
              { value: "under50", label: "Under $50" },
              { value: "50-100", label: "$50 - $100" },
              { value: "100-200", label: "$100 - $200" },
              { value: "over200", label: "Over $200" },
            ].map((range) => (
              <label
                key={range.value}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="radio"
                  name="price"
                  value={range.value}
                  checked={filters.priceRange === range.value}
                  onChange={(e) =>
                    setFilters({ ...filters, priceRange: e.target.value })
                  }
                  className="w-4 h-4 text-[#3498db] border-gray-300 focus:ring-[#3498db]"
                />
                <span className="text-sm text-gray-700 group-hover:text-[#3498db] transition-colors">
                  {range.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Rating Filter */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Rating</h4>
          <div className="space-y-2">
            {[
              { value: 0, label: "Any Rating" },
              { value: 4, label: "4+ Stars" },
              { value: 4.5, label: "4.5+ Stars" },
            ].map((rating) => (
              <label
                key={rating.value}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="radio"
                  name="rating"
                  value={rating.value}
                  checked={filters.minRating === rating.value}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      minRating: Number.parseFloat(e.target.value),
                    })
                  }
                  className="w-4 h-4 text-[#3498db] border-gray-300 focus:ring-[#3498db]"
                />
                <span className="text-sm text-gray-700 group-hover:text-[#3498db] transition-colors">
                  {rating.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Products</h1>
              <p className="text-gray-600 mt-1">
                Discover our premium tech accessories
              </p>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3498db] focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <FilterSection />
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">{filteredProducts.length}</span>{" "}
                  {filteredProducts.length === 1 ? "product" : "products"}
                  {searchQuery && (
                    <span>
                      {" "}
                      for &quot;
                      <span className="font-medium">{searchQuery}</span>&quot;
                    </span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-4">
                {/* View Mode Toggle */}
                <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded transition-colors ${
                      viewMode === "grid"
                        ? "bg-[#3498db] text-white"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Grid3X3 size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded transition-colors ${
                      viewMode === "list"
                        ? "bg-[#3498db] text-white"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <List size={16} />
                  </button>
                </div>

                {/* Sort Dropdown */}
                <select
                  value={filters.sort}
                  onChange={(e) =>
                    setFilters({ ...filters, sort: e.target.value })
                  }
                  className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3498db] focus:border-transparent"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>

                {/* Mobile Filters Button */}
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="lg:hidden flex items-center gap-2 bg-[#3498db] text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  <Filter size={16} />
                  Filters
                </button>
              </div>
            </div>

            {/* Mobile Filters */}
            {showMobileFilters && (
              <div className="lg:hidden mb-6 bg-white rounded-lg border border-gray-200">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900">Filters</h3>
                    <button
                      onClick={() => setShowMobileFilters(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <FilterSection />
                </div>
              </div>
            )}

            {/* Products Grid/List */}
            {loading ? (
              <div
                className={`grid gap-6 ${
                  viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                    : "grid-cols-1"
                }`}
              >
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg border border-gray-200 animate-pulse"
                  >
                    <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-500 mb-4">
                  Try adjusting your search or filters to find what you&apos;re
                  looking for.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setFilters({
                      category: "",
                      priceRange: "",
                      minRating: 0,
                      sort: "newest",
                    });
                  }}
                  className="bg-[#3498db] text-white px-4 py-2 rounded-lg hover:bg-[#2980b9] transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div
                className={`grid gap-6 ${
                  viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                    : "grid-cols-1"
                }`}
              >
                {filteredProducts.map((product) => (
                  <Link key={product.id} href={`/product/${product.id}`}>
                    <div
                      className={`bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300 group ${
                        viewMode === "list" ? "flex" : "block"
                      }`}
                    >
                      {/* Image */}
                      <div
                        className={`relative bg-gray-50 overflow-hidden ${
                          viewMode === "list"
                            ? "w-48 h-48 shrink-0"
                            : "aspect-square"
                        } ${viewMode === "grid" ? "rounded-t-lg" : "rounded-l-lg"}`}
                      >
                        <Image
                          src={product.image_url || "/placeholder.svg"}
                          alt={product.name}
                          width={300}
                          height={300}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {product.discount_price && (
                          <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
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
                      <div className="p-4 flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-[#3498db] transition-colors">
                          {product.name}
                        </h3>

                        {/* Rating */}
                        <div className="flex items-center gap-1 mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={
                                i < Math.floor(product.rating)
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-200 fill-current"
                              }
                            />
                          ))}
                          <span className="text-sm text-gray-600 ml-1">
                            {product.rating} ({product.reviews_count})
                          </span>
                        </div>

                        {/* Price */}
                        <div className="flex items-center gap-2">
                          {product.discount_price ? (
                            <>
                              <span className="text-xl font-bold text-gray-900">
                                ${product.discount_price.toFixed(2)}
                              </span>
                              <span className="text-sm text-gray-500 line-through">
                                ${product.price.toFixed(2)}
                              </span>
                            </>
                          ) : (
                            <span className="text-xl font-bold text-gray-900">
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
  );
}
