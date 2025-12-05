"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Product {
  id: string;
  name: string;
  category: string;
  image_url: string;
  price: number;
}

interface SearchSuggestionsProps {
  onClose?: () => void;
  className?: string;
}

export default function SearchSuggestions({
  onClose,
  className = "",
}: SearchSuggestionsProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query.trim()) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const { data } = await supabase
          .from("products")
          .select("id, name, category, image_url, price")
          .ilike("name", `%${query}%`)
          .limit(5);

        if (data) {
          setSuggestions(data);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, supabase]);

  return (
    <div ref={wrapperRef} className={`relative w-full ${className}`}>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search products..."
          className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pr-10 pl-10 text-sm text-gray-900 placeholder-gray-400 transition-all hover:bg-white focus:border-transparent focus:ring-2 focus:ring-[#3498db] focus:outline-none"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setSuggestions([]);
            }}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {showSuggestions && (query.trim() !== "" || suggestions.length > 0) && (
        <div className="animate-in fade-in slide-in-from-top-2 absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Loading...
            </div>
          ) : suggestions.length > 0 ? (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                Products
              </div>
              {suggestions.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  onClick={() => {
                    setShowSuggestions(false);
                    setQuery("");
                    onClose?.();
                  }}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50"
                >
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {/* <Image src={product.image_url} alt={product.name} fill className="object-cover" /> */}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500">{product.category}</p>
                  </div>
                  <div className="text-sm font-bold text-[#3498db]">
                    ${product.price.toFixed(2)}
                  </div>
                </Link>
              ))}
              <Link
                href={`/products?search=${encodeURIComponent(query)}`}
                onClick={() => {
                  setShowSuggestions(false);
                  onClose?.();
                }}
                className="block border-t border-gray-100 px-4 py-3 text-center text-sm font-medium text-[#3498db] hover:bg-gray-50"
              >
                View all results for &quot;{query}&quot;
              </Link>
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">
              No products found for &quot;{query}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
