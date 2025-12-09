"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import SearchSuggestions from "@/components/SearchSuggestions";
import { formatCurrency } from "@/lib/utils";

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
    if (filters.priceRange === "under750k")
      filtered = filtered.filter((p) => p.price < 750000);
    else if (filters.priceRange === "750k-1500k")
      filtered = filtered.filter(
        (p) => p.price >= 750000 && p.price <= 1500000,
      );
    else if (filters.priceRange === "1500k-3000k")
      filtered = filtered.filter(
        (p) => p.price >= 1500000 && p.price <= 3000000,
      );
    else if (filters.priceRange === "over3000k")
      filtered = filtered.filter((p) => p.price > 3000000);

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
    <div className="sticky top-32 h-fit rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Filter</h3>
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
          className="text-sm font-medium text-[#3498db] hover:text-[#2980b9]"
        >
          Hapus semua
        </button>
      </div>

      <div className="space-y-6">
        {/* Category Filter */}
        <div>
          <h4 className="mb-3 font-medium text-gray-900">Kategori</h4>
          <div className="space-y-2">
            {[
              { value: "", label: "Semua Kategori" },
              { value: "Electronics", label: "Elektronik" },
              { value: "Peripherals", label: "Periferal" },
              { value: "Accessories", label: "Aksesoris" },
              { value: "Storage", label: "Penyimpanan" },
              { value: "Lighting", label: "Pencahayaan" },
            ].map((cat) => (
              <label
                key={cat.value}
                className="group flex cursor-pointer items-center gap-3"
              >
                <input
                  type="radio"
                  name="category"
                  value={cat.value}
                  checked={filters.category === cat.value}
                  onChange={(e) =>
                    setFilters({ ...filters, category: e.target.value })
                  }
                  className="h-4 w-4 border-gray-300 text-[#3498db] focus:ring-[#3498db]"
                />
                <span className="text-sm text-gray-700 transition-colors group-hover:text-[#3498db]">
                  {cat.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Filter */}
        <div>
          <h4 className="mb-3 font-medium text-gray-900">Rentang Harga</h4>
          <div className="space-y-2">
            {[
              { value: "", label: "Semua Harga" },
              { value: "under750k", label: "Di bawah Rp 750rb" },
              { value: "750k-1500k", label: "Rp 750rb - Rp 1.5jt" },
              { value: "1500k-3000k", label: "Rp 1.5jt - Rp 3jt" },
              { value: "over3000k", label: "Di atas Rp 3jt" },
            ].map((range) => (
              <label
                key={range.value}
                className="group flex cursor-pointer items-center gap-3"
              >
                <input
                  type="radio"
                  name="price"
                  value={range.value}
                  checked={filters.priceRange === range.value}
                  onChange={(e) =>
                    setFilters({ ...filters, priceRange: e.target.value })
                  }
                  className="h-4 w-4 border-gray-300 text-[#3498db] focus:ring-[#3498db]"
                />
                <span className="text-sm text-gray-700 transition-colors group-hover:text-[#3498db]">
                  {range.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Rating Filter */}
        <div>
          <h4 className="mb-3 font-medium text-gray-900">Rating</h4>
          <div className="space-y-2">
            {[
              { value: 0, label: "Semua Rating" },
              { value: 4, label: "4+ Bintang" },
              { value: 4.5, label: "4.5+ Bintang" },
            ].map((rating) => (
              <label
                key={rating.value}
                className="group flex cursor-pointer items-center gap-3"
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
                  className="h-4 w-4 border-gray-300 text-[#3498db] focus:ring-[#3498db]"
                />
                <span className="text-sm text-gray-700 transition-colors group-hover:text-[#3498db]">
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
      <div className="border-b border-gray-200 bg-white pt-20">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Produk</h1>
              <p className="mt-1 text-gray-600">
                Temukan aksesoris teknologi premium kami
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-md flex-1">
              <SearchSuggestions />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <FilterSection />
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Bar */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">{filteredProducts.length}</span>{" "}
                  {filteredProducts.length === 1 ? "produk" : "produk"}
                  {searchQuery && (
                    <span>
                      {" "}
                      untuk &quot;
                      <span className="font-medium">{searchQuery}</span>&quot;
                    </span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-4">
                {/* View Mode Toggle */}
                <div className="flex items-center rounded-lg border border-gray-200 bg-white p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`rounded p-2 transition-colors ${
                      viewMode === "grid"
                        ? "bg-[#3498db] text-white"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Grid3X3 size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`rounded p-2 transition-colors ${
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
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-[#3498db] focus:outline-none"
                >
                  <option value="newest">Terbaru</option>
                  <option value="price-low">Harga: Rendah ke Tinggi</option>
                  <option value="price-high">Harga: Tinggi ke Rendah</option>
                  <option value="rating">Rating Tertinggi</option>
                </select>

                {/* Mobile Filters Button */}
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="flex items-center gap-2 rounded-lg bg-[#3498db] px-4 py-2 text-sm font-medium text-white lg:hidden"
                >
                  <Filter size={16} />
                  Filter
                </button>
              </div>
            </div>

            {/* Mobile Filters */}
            {showMobileFilters && (
              <div className="mb-6 rounded-lg border border-gray-200 bg-white lg:hidden">
                <div className="p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">Filter</h3>
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
                    className="animate-pulse rounded-lg border border-gray-200 bg-white"
                  >
                    <div className="aspect-square rounded-t-lg bg-gray-200"></div>
                    <div className="space-y-3 p-4">
                      <div className="h-4 rounded bg-gray-200"></div>
                      <div className="h-3 w-3/4 rounded bg-gray-200"></div>
                      <div className="h-5 w-1/2 rounded bg-gray-200"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  Produk tidak ditemukan
                </h3>
                <p className="mb-4 text-gray-500">
                  Coba sesuaikan pencarian atau filter Anda untuk menemukan apa
                  yang Anda cari.
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
                  className="rounded-lg bg-[#3498db] px-4 py-2 text-white transition-colors hover:bg-[#2980b9]"
                >
                  Hapus semua filter
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
                      className={`group rounded-lg border border-gray-200 bg-white transition-all duration-300 hover:shadow-lg ${
                        viewMode === "list" ? "flex" : "block"
                      }`}
                    >
                      {/* Image */}
                      <div
                        className={`relative overflow-hidden bg-gray-50 ${
                          viewMode === "list"
                            ? "h-48 w-48 shrink-0"
                            : "aspect-square"
                        } ${viewMode === "grid" ? "rounded-t-lg" : "rounded-l-lg"}`}
                      >
                        <Image
                          src={product.image_url || "/placeholder.svg"}
                          alt={product.name}
                          width={300}
                          height={300}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {product.discount_price && (
                          <div className="absolute top-3 right-3 rounded bg-red-500 px-2 py-1 text-xs font-bold text-white">
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
                      <div className="flex-1 p-4">
                        <h3 className="mb-2 font-semibold text-gray-900 transition-colors group-hover:text-[#3498db]">
                          {product.name}
                        </h3>

                        {/* Rating */}
                        <div className="mb-3 flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={
                                i < Math.floor(product.rating)
                                  ? "fill-current text-yellow-400"
                                  : "fill-current text-gray-200"
                              }
                            />
                          ))}
                          <span className="ml-1 text-sm text-gray-600">
                            {product.rating} ({product.reviews_count})
                          </span>
                        </div>

                        {/* Price */}
                        <div className="flex items-center gap-2">
                          {product.discount_price ? (
                            <>
                              <span className="text-xl font-bold text-gray-900">
                                {formatCurrency(product.discount_price)}
                              </span>
                              <span className="text-sm text-gray-500 line-through">
                                {formatCurrency(product.price)}
                              </span>
                            </>
                          ) : (
                            <span className="text-xl font-bold text-gray-900">
                              {formatCurrency(product.price)}
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
