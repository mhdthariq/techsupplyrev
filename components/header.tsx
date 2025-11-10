"use client";
import Link from "next/link";
import { ShoppingCart, Search, User, Menu, X, Package } from "lucide-react";
import { useState, useEffect } from "react";
import { getCartItemCount } from "@/lib/cart";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Update cart count from localStorage
  useEffect(() => {
    const updateCartCount = () => {
      setCartCount(getCartItemCount());
    };

    // Update on mount
    updateCartCount();

    // Listen for storage changes (when cart is updated in other tabs/components)
    window.addEventListener("storage", updateCartCount);

    // Listen for custom cart update events
    window.addEventListener("cartUpdated", updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, []);

  return (
    <header className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-50 shadow-lg border-b border-gray-100">
      {/* Top promotional bar */}
      <div className="bg-linear-to-r from-[#2c3e50] to-[#3498db] text-white py-2 text-center text-sm font-medium">
        🚚 Free shipping on orders over $50 | 🔒 Secure checkout
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 bg-linear-to-br from-[#2c3e50] to-[#3498db] rounded-xl flex items-center justify-center text-white font-bold text-lg group-hover:shadow-lg transition-all duration-300 transform group-hover:scale-105">
              <Package size={20} />
            </div>
            <div className="hidden sm:block">
              <div className="font-bold text-xl text-[#2c3e50] group-hover:text-[#3498db] transition-colors">
                TechSupply
              </div>
              <div className="text-xs text-[#7f8c8d] font-medium">
                Premium Tech Store
              </div>
            </div>
          </Link>

          {/* Main Navigation - Desktop */}
          {/* Main Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className="px-6 py-3 text-[#2c3e50] hover:text-[#3498db] hover:bg-[#ecf0f1] rounded-xl font-medium transition-all duration-200"
            >
              Home
            </Link>
            <Link
              href="/products"
              className="px-6 py-3 text-[#2c3e50] hover:text-[#3498db] hover:bg-[#ecf0f1] rounded-xl font-medium transition-all duration-200"
            >
              Products
            </Link>
            <Link
              href="/about"
              className="px-6 py-3 text-[#2c3e50] hover:text-[#3498db] hover:bg-[#ecf0f1] rounded-xl font-medium transition-all duration-200"
            >
              About Us
            </Link>
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex flex-1 mx-8 max-w-md">
            <div className="w-full relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3498db] focus:border-transparent transition-all bg-gray-50 hover:bg-white text-gray-900"
                onKeyPress={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
                  }
                }}
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Search Icon - Mobile */}
            <button
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 text-[#2c3e50] transition-all"
              onClick={() => {
                const query = prompt("Search products:");
                if (query?.trim()) {
                  window.location.href = `/products?search=${encodeURIComponent(query.trim())}`;
                }
              }}
            >
              <Search size={20} />
            </button>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 text-[#2c3e50] hover:text-[#3498db] transition-all"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#e74c3c] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Account */}
            <Link
              href="/auth/login"
              className="hidden sm:flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 text-[#2c3e50] hover:text-[#3498db] transition-all"
            >
              <User size={20} />
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden text-[#2c3e50] p-2 hover:bg-gray-100 rounded-lg transition-all"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            {/* Mobile Search */}
            <div className="pb-4 border-b border-gray-100">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3498db] focus:border-transparent transition-all bg-white text-gray-900"
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && searchQuery.trim()) {
                      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
                    }
                  }}
                />
              </div>
            </div>

            {/* Navigation Links */}
            <Link
              href="/"
              className="block py-3 text-[#2c3e50] hover:text-[#3498db] font-semibold transition-colors rounded-lg hover:bg-gray-50 px-3"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/products"
              className="block py-3 text-[#2c3e50] hover:text-[#3498db] font-semibold transition-colors rounded-lg hover:bg-gray-50 px-3"
              onClick={() => setIsMenuOpen(false)}
            >
              Products
            </Link>
            <Link
              href="/about"
              className="block py-3 text-[#2c3e50] hover:text-[#3498db] font-semibold transition-colors rounded-lg hover:bg-gray-50 px-3"
              onClick={() => setIsMenuOpen(false)}
            >
              About Us
            </Link>

            <hr className="my-3 border-gray-200" />

            {/* Account Links */}
            <Link
              href="/cart"
              className="flex items-center gap-3 py-3 text-[#2c3e50] hover:text-[#3498db] font-medium transition-colors rounded-lg hover:bg-gray-50 px-3"
              onClick={() => setIsMenuOpen(false)}
            >
              <ShoppingCart size={20} />
              Shopping Cart
              {cartCount > 0 && (
                <span className="bg-[#e74c3c] text-white text-xs font-bold px-2 py-1 rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link
              href="/auth/login"
              className="flex items-center gap-3 py-3 text-[#2c3e50] hover:text-[#3498db] font-medium transition-colors rounded-lg hover:bg-gray-50 px-3"
              onClick={() => setIsMenuOpen(false)}
            >
              <User size={20} />
              Sign In / Register
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
