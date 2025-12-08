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
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Company Info */}
          <div>
            <h3 className="font-heading mb-4 font-bold text-white">
              TechSupply Co.
            </h3>
            <p className="text-sm">
              Sumber terpercaya Anda untuk solusi dan produk teknologi premium.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading mb-4 font-semibold text-white">
              Tautan Cepat
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-accent-blue transition">
                  Beranda
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="hover:text-accent-blue transition"
                >
                  Produk
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-accent-blue transition"
                >
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-accent-blue transition"
                >
                  Kontak
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="font-heading mb-4 font-semibold text-white">
              Kebijakan
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-accent-blue transition"
                >
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-accent-blue transition"
                >
                  Syarat & Ketentuan
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping"
                  className="hover:text-accent-blue transition"
                >
                  Info Pengiriman
                </Link>
              </li>
              <li>
                <Link
                  href="/returns"
                  className="hover:text-accent-blue transition"
                >
                  Pengembalian
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="font-heading mb-4 font-semibold text-white">
              Ikuti Kami
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

        <div className="border-accent-blue/30 border-t pt-8 text-center text-sm">
          <p>&copy; 2025 TechSupply Co. Hak cipta dilindungi.</p>
        </div>
      </div>
    </footer>
  );
}
