"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

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
          match: "matches your search",
        },
        { id: 2, name: "USB 3.0 Hub", price: 39.99, match: "contains USB" },
      ]
    : [];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="pt-28 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Search Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-heading font-bold text-primary-blue mb-4">
              Search Results
            </h1>

            {/* Search Bar */}
            <div className="flex gap-2">
              <div className="flex-1 flex items-center bg-white border-2 border-primary-blue rounded-lg px-4">
                <input
                  type="text"
                  defaultValue={query}
                  placeholder="Search products..."
                  className="flex-1 py-3 outline-none text-dark-grey"
                />
                <Search className="text-neutral-grey" size={20} />
              </div>
              <button className="bg-accent-blue text-white px-6 py-3 rounded-lg hover:bg-accent-blue/90 transition font-semibold">
                Search
              </button>
            </div>
          </div>

          {/* Results */}
          {query ? (
            results.length > 0 ? (
              <div>
                <p className="text-neutral-grey mb-6">
                  Found {results.length} results for &quot;{query}&quot;
                </p>
                <div className="space-y-4">
                  {results.map((result) => (
                    <Link
                      key={result.id}
                      href={`/product/${result.id}`}
                      className="bg-white rounded-lg p-6 border-2 border-light-grey hover:border-accent-blue transition flex items-center justify-between"
                    >
                      <div>
                        <h3 className="font-heading font-semibold text-primary-blue text-lg mb-1">
                          {result.name}
                        </h3>
                        <p className="text-sm text-neutral-grey">
                          {result.match}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-accent-blue">
                          ${result.price}
                        </span>
                        <button className="mt-2 bg-accent-blue text-white px-4 py-2 rounded hover:bg-accent-blue/90 transition text-sm font-semibold">
                          View Product
                        </button>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🔍</div>
                <h2 className="text-xl font-heading font-semibold text-dark-grey mb-2">
                  No results found
                </h2>
                <p className="text-neutral-grey mb-4">
                  We couldn&apos;t find any products matching &quot;{query}
                  &quot;
                </p>
                <Link
                  href="/products"
                  className="inline-block bg-accent-blue text-white px-6 py-3 rounded-lg hover:bg-accent-blue/90 transition font-semibold"
                >
                  Browse All Products
                </Link>
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-neutral-grey">
                Enter a search term to find products
              </p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
