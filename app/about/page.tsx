"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, Shield, Truck, Users, Award } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <div className="pt-32 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="mb-6 text-4xl font-bold text-[#2c3e50] md:text-6xl">
              About <span className="text-[#3498db]">TechSupply</span>
            </h1>
            <p className="mx-auto max-w-3xl text-xl leading-relaxed text-gray-600">
              We&apos;re passionate about providing premium technology
              accessories that enhance your digital lifestyle. From cutting-edge
              peripherals to essential accessories, we curate the best products
              for tech enthusiasts.
            </p>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-[#2c3e50] md:text-4xl">
              Why Choose TechSupply?
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              We&apos;re committed to delivering exceptional quality and service
              that exceeds your expectations
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Quality */}
            <div className="group text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 transform items-center justify-center rounded-xl bg-linear-to-br from-[#3498db] to-[#2980b9] transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-[#2c3e50]">
                Premium Quality
              </h3>
              <p className="text-gray-600">
                Hand-picked products from trusted brands, ensuring reliability
                and performance you can count on.
              </p>
            </div>

            {/* Fast Shipping */}
            <div className="group text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 transform items-center justify-center rounded-xl bg-linear-to-br from-[#e74c3c] to-[#c0392b] transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg">
                <Truck className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-[#2c3e50]">
                Fast Shipping
              </h3>
              <p className="text-gray-600">
                Free shipping on orders over $50 with quick processing and
                reliable delivery to your doorstep.
              </p>
            </div>

            {/* Expert Support */}
            <div className="group text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 transform items-center justify-center rounded-xl bg-linear-to-br from-[#9b59b6] to-[#8e44ad] transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-[#2c3e50]">
                Expert Support
              </h3>
              <p className="text-gray-600">
                Our knowledgeable team is here to help you find the perfect tech
                accessories for your needs.
              </p>
            </div>

            {/* Secure Shopping */}
            <div className="group text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 transform items-center justify-center rounded-xl bg-linear-to-br from-[#27ae60] to-[#229954] transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-[#2c3e50]">
                Secure Shopping
              </h3>
              <p className="text-gray-600">
                Shop with confidence using our secure payment system and
                comprehensive buyer protection.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="bg-linear-to-r from-[#f8f9fa] to-[#e9ecef] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div>
              <h2 className="mb-6 text-3xl font-bold text-[#2c3e50] md:text-4xl">
                Our Story
              </h2>
              <div className="space-y-4 text-lg text-gray-600">
                <p>
                  Founded in 2020, TechSupply was born from a simple idea:
                  everyone deserves access to high-quality technology
                  accessories without breaking the bank.
                </p>
                <p>
                  We started as a small team of tech enthusiasts who were
                  frustrated with the lack of affordable, reliable accessories
                  in the market. Today, we&apos;ve grown into a trusted
                  destination for thousands of customers worldwide.
                </p>
                <p>
                  Our mission remains the same: to democratize access to premium
                  tech accessories and help people enhance their digital
                  experiences.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="rotate-2 transform rounded-2xl bg-linear-to-br from-[#3498db] to-[#2980b9] p-8">
                <div className="-rotate-2 transform rounded-xl bg-white p-8">
                  <div className="text-center">
                    <div className="mb-2 text-4xl font-bold text-[#3498db]">
                      10,000+
                    </div>
                    <div className="font-medium text-gray-600">
                      Happy Customers
                    </div>
                  </div>
                  <hr className="my-6 border-gray-200" />
                  <div className="text-center">
                    <div className="mb-2 text-4xl font-bold text-[#e74c3c]">
                      500+
                    </div>
                    <div className="font-medium text-gray-600">
                      Products Available
                    </div>
                  </div>
                  <hr className="my-6 border-gray-200" />
                  <div className="text-center">
                    <div className="mb-2 text-4xl font-bold text-[#27ae60]">
                      99%
                    </div>
                    <div className="font-medium text-gray-600">
                      Customer Satisfaction
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-[#2c3e50] md:text-4xl">
              Get In Touch
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Have questions or need help? We&apos;d love to hear from you.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Email */}
            <div className="rounded-2xl border border-gray-100 bg-linear-to-br from-gray-50 to-white p-8 text-center transition-all duration-300 hover:shadow-lg">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-[#3498db] to-[#2980b9]">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-[#2c3e50]">
                Email Us
              </h3>
              <p className="mb-4 text-gray-600">Get support or ask questions</p>
              <a
                href="mailto:support@techsupply.co"
                className="font-semibold text-[#3498db] transition-colors hover:text-[#2980b9]"
              >
                support@techsupply.co
              </a>
            </div>

            {/* Phone */}
            <div className="rounded-2xl border border-gray-100 bg-linear-to-br from-gray-50 to-white p-8 text-center transition-all duration-300 hover:shadow-lg">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-[#e74c3c] to-[#c0392b]">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-[#2c3e50]">Call Us</h3>
              <p className="mb-4 text-gray-600">Mon-Fri 9AM-6PM EST</p>
              <a
                href="tel:+1-555-123-4567"
                className="font-semibold text-[#3498db] transition-colors hover:text-[#2980b9]"
              >
                +1 (555) 123-4567
              </a>
            </div>

            {/* Address */}
            <div className="rounded-2xl border border-gray-100 bg-linear-to-br from-gray-50 to-white p-8 text-center transition-all duration-300 hover:shadow-lg">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-[#27ae60] to-[#229954]">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-[#2c3e50]">
                Visit Us
              </h3>
              <p className="mb-4 text-gray-600">Our headquarters</p>
              <address className="text-[#3498db] not-italic">
                123 Tech Street
                <br />
                Silicon Valley, CA 94025
              </address>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-linear-to-r from-[#2c3e50] to-[#3498db] py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl">
            Ready to Upgrade Your Tech Setup?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-blue-100">
            Browse our collection of premium accessories and find the perfect
            additions to your workspace.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/products"
              className="transform rounded-xl bg-white px-8 py-4 font-bold text-[#2c3e50] shadow-lg transition-all duration-300 hover:scale-105 hover:bg-gray-100"
            >
              Shop Products
            </Link>
            <Link
              href="mailto:support@techsupply.co"
              className="transform rounded-xl border-2 border-white px-8 py-4 font-bold text-white transition-all duration-300 hover:scale-105 hover:bg-white hover:text-[#2c3e50]"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
