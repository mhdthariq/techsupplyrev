"use client";
import Link from "next/link";
import {
  ShoppingCart,
  Search,
  User,
  Menu,
  X,
  Package,
  LogOut,
} from "lucide-react";
import SearchSuggestions from "@/components/SearchSuggestions";
import { useState, useEffect } from "react";
import {
  getCurrentCartCount,
  getCachedCartCount,
  initializeCartSystem,
  mergeGuestCartWithUserCart,
} from "@/lib/cart";
import { getCurrentUser, signOut } from "@/lib/auth";
import type { User as AuthUser } from "@/lib/types";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(() => getCachedCartCount());
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Update cart count and initialize cart system
  useEffect(() => {
    const updateCartCount = async () => {
      try {
        const count = await getCurrentCartCount();
        setCartCount(count);
      } catch {
        // Fallback to cached count
        setCartCount(getCachedCartCount());
      }
    };

    // Load actual count (async) - no sync setState in effect
    updateCartCount();

    // Initialize cart system
    initializeCartSystem().then(() => {
      updateCartCount();
    });

    // Listen for custom cart update events
    const handleCartUpdate = () => {
      updateCartCount();
    };

    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, []);

  // Check for authenticated user and handle cart merge
  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await getCurrentUser();
      const previousUser = user;
      setUser(currentUser);

      // If user just logged in, merge guest cart
      if (currentUser && !previousUser) {
        try {
          await mergeGuestCartWithUserCart(currentUser.id);
          // Update cart count after merge
          const count = await getCurrentCartCount();
          setCartCount(count);
        } catch (error) {
          console.error("Error merging cart on login:", error);
          setCartCount(getCachedCartCount());
        }
      }

      // If user logged out, reset to guest cart
      if (!currentUser && previousUser) {
        setCartCount(getCachedCartCount());
      }
    };

    checkUser();

    // Listen for auth state changes
    const handleAuthChange = () => {
      checkUser();
    };

    window.addEventListener("authStateChanged", handleAuthChange);
    return () =>
      window.removeEventListener("authStateChanged", handleAuthChange);
  }, [user]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".user-menu-container")) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      setShowUserMenu(false);
      // Reset cart count to guest cart
      setCartCount(getCachedCartCount());
      window.dispatchEvent(new Event("authStateChanged"));
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <header className="fixed top-0 z-50 w-full border-b border-gray-100 bg-white/95 shadow-lg backdrop-blur-md">
      {/* Top promotional bar */}
      <div className="bg-linear-to-r from-[#2c3e50] to-[#3498db] py-2 text-center text-sm font-medium text-white">
        🚚 Free shipping on orders over $50 | 🔒 Secure checkout
      </div>

      {/* Main header */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group flex shrink-0 items-center gap-3">
            <div className="flex h-10 w-10 transform items-center justify-center rounded-xl bg-linear-to-br from-[#2c3e50] to-[#3498db] text-lg font-bold text-white transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg">
              <Package size={20} />
            </div>
            <div className="hidden sm:block">
              <div className="text-xl font-bold text-[#2c3e50] transition-colors group-hover:text-[#3498db]">
                TechSupply
              </div>
              <div className="text-xs font-medium text-[#7f8c8d]">
                Premium Tech Store
              </div>
            </div>
          </Link>

          {/* Main Navigation - Desktop */}
          {/* Main Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            <Link
              href="/"
              className="rounded-xl px-6 py-3 font-medium text-[#2c3e50] transition-all duration-200 hover:bg-[#ecf0f1] hover:text-[#3498db]"
            >
              Home
            </Link>
            <Link
              href="/products"
              className="rounded-xl px-6 py-3 font-medium text-[#2c3e50] transition-all duration-200 hover:bg-[#ecf0f1] hover:text-[#3498db]"
            >
              Products
            </Link>
            <Link
              href="/about"
              className="rounded-xl px-6 py-3 font-medium text-[#2c3e50] transition-all duration-200 hover:bg-[#ecf0f1] hover:text-[#3498db]"
            >
              About Us
            </Link>
          </nav>

          {/* Search Bar - Desktop */}
          <div className="mx-8 hidden max-w-md flex-1 lg:flex">
            <SearchSuggestions />
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Search Icon - Mobile */}
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#2c3e50] transition-all hover:bg-gray-100 lg:hidden"
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
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#2c3e50] transition-all hover:bg-gray-100 hover:text-[#3498db]"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 animate-pulse items-center justify-center rounded-full bg-[#e74c3c] text-xs font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Account */}
            {user ? (
              <div className="user-menu-container relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex h-10 w-10 touch-manipulation items-center justify-center rounded-full text-[#2c3e50] transition-all hover:bg-gray-100 hover:text-[#3498db]"
                >
                  <User size={20} />
                </button>

                {showUserMenu && (
                  <div className="animate-in fade-in slide-in-from-top-2 absolute right-0 mt-2 w-48 rounded-xl border border-gray-100 bg-white py-2 shadow-lg">
                    <div className="border-b border-gray-100 px-4 py-2">
                      <p className="truncate text-sm font-semibold text-[#2C3E50]">
                        {user.name || "User"}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      href="/account?tab=profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#3498DB]"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/account?tab=orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#3498DB]"
                    >
                      Orders
                    </Link>
                    <Link
                      href="/account?tab=wishlist"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#3498DB]"
                    >
                      Wishlist
                    </Link>
                    {/* Assuming isAdmin is a prop or state variable */}
                    {/* {isAdmin && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#3498DB]"
                      >
                        Admin Dashboard
                      </Link>
                    )} */}
                    <button
                      onClick={handleSignOut}
                      className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="hidden items-center gap-2 rounded-lg bg-[#3498db] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#2980b9] sm:flex"
              >
                <User size={16} />
                Login
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              className="rounded-lg p-2 text-[#2c3e50] transition-all hover:bg-gray-100 lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="border-t border-gray-100 bg-white shadow-lg lg:hidden">
          <div className="mx-auto max-w-7xl space-y-1 px-4 py-4">
            {/* Mobile Search */}
            <div className="border-b border-gray-100 pb-4">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="block w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-3 pl-10 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-transparent focus:ring-2 focus:ring-[#3498db] focus:outline-none"
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
              className="block rounded-lg px-3 py-3 font-semibold text-[#2c3e50] transition-colors hover:bg-gray-50 hover:text-[#3498db]"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/products"
              className="block rounded-lg px-3 py-3 font-semibold text-[#2c3e50] transition-colors hover:bg-gray-50 hover:text-[#3498db]"
              onClick={() => setIsMenuOpen(false)}
            >
              Products
            </Link>
            <Link
              href="/about"
              className="block rounded-lg px-3 py-3 font-semibold text-[#2c3e50] transition-colors hover:bg-gray-50 hover:text-[#3498db]"
              onClick={() => setIsMenuOpen(false)}
            >
              About Us
            </Link>

            <hr className="my-3 border-gray-200" />

            {/* Account Links */}
            <Link
              href="/cart"
              className="flex items-center gap-3 rounded-lg px-3 py-3 font-medium text-[#2c3e50] transition-colors hover:bg-gray-50 hover:text-[#3498db]"
              onClick={() => setIsMenuOpen(false)}
            >
              <ShoppingCart size={20} />
              Shopping Cart
              {cartCount > 0 && (
                <span className="rounded-full bg-[#e74c3c] px-2 py-1 text-xs font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
            {user ? (
              <>
                <Link
                  href="/account"
                  className="flex items-center gap-3 rounded-lg px-3 py-3 font-medium text-[#2c3e50] transition-colors hover:bg-gray-50 hover:text-[#3498db]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User size={20} />
                  My Account
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                >
                  <LogOut size={20} />
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center gap-3 rounded-lg px-3 py-3 font-medium text-[#2c3e50] transition-colors hover:bg-gray-50 hover:text-[#3498db]"
                onClick={() => setIsMenuOpen(false)}
              >
                <User size={20} />
                Sign In / Register
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
