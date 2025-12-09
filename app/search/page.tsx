"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  // Mock search results
  const results = query
    ? [
        {
          id: 1,
          name: "USB-C Hub 7-in-1",
          price: 79.99,
          match: "cocok dengan pencarian Anda",
        },
        { id: 2, name: "USB 3.0 Hub", price: 39.99, match: "berisi USB" },
      ]
    : [];

  return (
    <div className="bg-background min-h-screen">
      <div className="px-4 pt-28 pb-20">
        <div className="mx-auto max-w-4xl">
          {/* Search Header */}
          <div className="mb-8">
            <h1 className="font-heading text-primary-blue mb-4 text-4xl font-bold">
              Hasil Pencarian
            </h1>

            {/* Search Bar */}
            <div className="flex gap-2">
              <div className="border-primary-blue flex flex-1 items-center rounded-lg border-2 bg-white px-4">
                <input
                  type="text"
                  defaultValue={query}
                  placeholder="Cari produk..."
                  className="text-dark-grey flex-1 py-3 outline-none"
                />
                <Search className="text-neutral-grey" size={20} />
              </div>
              <button className="bg-accent-blue hover:bg-accent-blue/90 rounded-lg px-6 py-3 font-semibold text-white transition">
                Cari
              </button>
            </div>
          </div>

          {/* Results */}
          {query ? (
            results.length > 0 ? (
              <div>
                <p className="text-neutral-grey mb-6">
                  Ditemukan {results.length} hasil untuk &quot;{query}&quot;
                </p>
                <div className="space-y-4">
                  {results.map((result) => (
                    <Link
                      key={result.id}
                      href={`/product/${result.id}`}
                      className="border-light-grey hover:border-accent-blue flex items-center justify-between rounded-lg border-2 bg-white p-6 transition"
                    >
                      <div>
                        <h3 className="font-heading text-primary-blue mb-1 text-lg font-semibold">
                          {result.name}
                        </h3>
                        <p className="text-neutral-grey text-sm">
                          {result.match}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-accent-blue text-2xl font-bold">
                          {formatCurrency(result.price)}
                        </span>
                        <button className="bg-accent-blue hover:bg-accent-blue/90 mt-2 rounded px-4 py-2 text-sm font-semibold text-white transition">
                          Lihat Produk
                        </button>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="mb-4 text-4xl">🔍</div>
                <h2 className="font-heading text-dark-grey mb-2 text-xl font-semibold">
                  Tidak ada hasil ditemukan
                </h2>
                <p className="text-neutral-grey mb-4">
                  Kami tidak dapat menemukan produk yang cocok dengan &quot;
                  {query}
                  &quot;
                </p>
                <Link
                  href="/products"
                  className="bg-accent-blue hover:bg-accent-blue/90 inline-block rounded-lg px-6 py-3 font-semibold text-white transition"
                >
                  Lihat Semua Produk
                </Link>
              </div>
            )
          ) : (
            <div className="py-12 text-center">
              <div className="mb-4 text-4xl">🔍</div>
              <p className="text-neutral-grey">
                Masukkan kata kunci untuk mencari produk
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
