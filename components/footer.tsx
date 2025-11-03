import type React from "react";
import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer
      className="bg-primary-blue text-light-grey mt-20"
      style={
        {
          "--primary-blue": "#2C3E50",
          "--light-grey": "#ECF0F1",
        } as React.CSSProperties
      }
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="font-heading font-bold text-white mb-4">
              TechSupply Co.
            </h3>
            <p className="text-sm">
              Your trusted source for premium technology solutions and products.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-accent-blue transition">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="hover:text-accent-blue transition"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-accent-blue transition"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-accent-blue transition"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-4">
              Policies
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-accent-blue transition"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-accent-blue transition"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping"
                  className="hover:text-accent-blue transition"
                >
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link
                  href="/returns"
                  className="hover:text-accent-blue transition"
                >
                  Returns
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-4">
              Follow Us
            </h4>
            <div className="flex gap-4">
              <a href="#" className="hover:text-accent-blue transition">
                <Facebook size={20} />
              </a>
              <a href="#" className="hover:text-accent-blue transition">
                <Twitter size={20} />
              </a>
              <a href="#" className="hover:text-accent-blue transition">
                <Instagram size={20} />
              </a>
              <a href="#" className="hover:text-accent-blue transition">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-accent-blue/30 pt-8 text-center text-sm">
          <p>&copy; 2025 TechSupply Co. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
