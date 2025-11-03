"use client";
import Link from "next/link";
import {
  ShoppingCart,
  Search,
  User,
  Menu,
  X,
  Heart,
  Package,
} from "lucide-react";
import { useState } from "react";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount] = useState(0);

  return (
    <header className="fixed top-0 w-full bg-white z-50 shadow-md">
      <div className="bg-linear-to-r from-[#2c3e50] to-[#3498db] text-white py-2 text-center text-sm font-medium">
        🚚 Free shipping on orders over $50 | 🔒 Secure checkout
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-12 h-12 bg-linear-to-br from-[#2c3e50] to-[#3498db] rounded-xl flex items-center justify-center text-white font-bold text-xl group-hover:shadow-lg transition-all duration-300 transform group-hover:scale-105">
              <Package size={24} />
            </div>
            <div className="hidden sm:block">
              <div className="font-bold text-lg text-[#2c3e50] group-hover:text-[#3498db] transition-colors">
                TechSupply
              </div>
              <div className="text-xs text-[#7f8c8d] font-medium">
                Premium Tech Store
              </div>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex flex-1 mx-8">
            <div className="w-full flex items-center bg-white rounded-full px-5 py-3 group hover:shadow-lg transition-all border-2 border-[#ecf0f1] hover:border-[#3498db]">
              <Search size={20} className="text-[#7f8c8d] shrink-0" />
              <input
                type="text"
                placeholder="Search laptops, keyboards, accessories..."
                className="bg-transparent text-[#2c3e50] outline-none w-full ml-4 text-sm placeholder-[#95a5a6] font-medium"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-6">
            {/* Wishlist - Desktop */}
            <button className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full hover:bg-[#ecf0f1] text-[#2c3e50] hover:text-[#3498db] transition-all">
              <Heart size={22} />
            </button>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-[#ecf0f1] text-[#2c3e50] hover:text-[#3498db] transition-all"
            >
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#e74c3c] text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Account */}
            <Link
              href="/auth/login"
              className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full hover:bg-[#ecf0f1] text-[#2c3e50] hover:text-[#3498db] transition-all"
            >
              <User size={22} />
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden text-[#2c3e50] p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Category Navigation - Desktop */}
        <div className="hidden lg:flex border-t border-[#ecf0f1] h-14 items-center gap-8">
          <Link
            href="/products"
            className="text-sm font-semibold text-[#2c3e50] hover:text-[#3498db] transition-colors py-4 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-1 after:bg-[#3498db] hover:after:w-full after:transition-all after:duration-300"
          >
            All Products
          </Link>
          <Link
            href="/products?category=laptops"
            className="text-sm font-semibold text-[#2c3e50] hover:text-[#3498db] transition-colors py-4 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-1 after:bg-[#3498db] hover:after:w-full after:transition-all after:duration-300"
          >
            Laptops
          </Link>
          <Link
            href="/products?category=peripherals"
            className="text-sm font-semibold text-[#2c3e50] hover:text-[#3498db] transition-colors py-4 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-1 after:bg-[#3498db] hover:after:w-full after:transition-all after:duration-300"
          >
            Peripherals
          </Link>
          <Link
            href="/products?category=accessories"
            className="text-sm font-semibold text-[#2c3e50] hover:text-[#3498db] transition-colors py-4 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-1 after:bg-[#3498db] hover:after:w-full after:transition-all after:duration-300"
          >
            Accessories
          </Link>
          <Link
            href="/deals"
            className="text-sm font-semibold text-[#e67e22] hover:text-[#d35400] transition-colors py-4 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-1 after:bg-[#e67e22] hover:after:w-full after:transition-all after:duration-300 flex items-center gap-1"
          >
            🔥 Hot Deals
          </Link>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="lg:hidden bg-white border-t border-[#ecf0f1] py-4">
          <div className="max-w-7xl mx-auto px-4 space-y-3">
            <Link
              href="/products"
              className="block py-2 text-[#2c3e50] hover:text-[#3498db] font-medium transition-colors"
            >
              All Products
            </Link>
            <Link
              href="/products?category=laptops"
              className="block py-2 text-[#2c3e50] hover:text-[#3498db] font-medium transition-colors"
            >
              Laptops
            </Link>
            <Link
              href="/products?category=peripherals"
              className="block py-2 text-[#2c3e50] hover:text-[#3498db] font-medium transition-colors"
            >
              Peripherals
            </Link>
            <Link
              href="/products?category=accessories"
              className="block py-2 text-[#2c3e50] hover:text-[#3498db] font-medium transition-colors"
            >
              Accessories
            </Link>
            <Link
              href="/deals"
              className="block py-2 text-[#e67e22] font-medium transition-colors"
            >
              🔥 Hot Deals
            </Link>
            <hr className="my-3 border-[#ecf0f1]" />
            <Link
              href="/cart"
              className="block py-2 text-[#2c3e50] hover:text-[#3498db] font-medium transition-colors"
            >
              Shopping Cart
            </Link>
            <Link
              href="/auth/login"
              className="block py-2 text-[#2c3e50] hover:text-[#3498db] font-medium transition-colors"
            >
              Sign In / Register
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
