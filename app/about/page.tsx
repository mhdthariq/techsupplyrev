"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, Shield, Truck, Users, Award } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <div className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-[#2c3e50] mb-6">
              About <span className="text-[#3498db]">TechSupply</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We&apos;re passionate about providing premium technology
              accessories that enhance your digital lifestyle. From cutting-edge
              peripherals to essential accessories, we curate the best products
              for tech enthusiasts.
            </p>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#2c3e50] mb-4">
              Why Choose TechSupply?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We&apos;re committed to delivering exceptional quality and service
              that exceeds your expectations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Quality */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-linear-to-br from-[#3498db] to-[#2980b9] rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-all duration-300 transform group-hover:scale-105">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#2c3e50] mb-3">
                Premium Quality
              </h3>
              <p className="text-gray-600">
                Hand-picked products from trusted brands, ensuring reliability
                and performance you can count on.
              </p>
            </div>

            {/* Fast Shipping */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-linear-to-br from-[#e74c3c] to-[#c0392b] rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-all duration-300 transform group-hover:scale-105">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#2c3e50] mb-3">
                Fast Shipping
              </h3>
              <p className="text-gray-600">
                Free shipping on orders over $50 with quick processing and
                reliable delivery to your doorstep.
              </p>
            </div>

            {/* Expert Support */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-linear-to-br from-[#9b59b6] to-[#8e44ad] rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-all duration-300 transform group-hover:scale-105">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#2c3e50] mb-3">
                Expert Support
              </h3>
              <p className="text-gray-600">
                Our knowledgeable team is here to help you find the perfect tech
                accessories for your needs.
              </p>
            </div>

            {/* Secure Shopping */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-linear-to-br from-[#27ae60] to-[#229954] rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-all duration-300 transform group-hover:scale-105">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#2c3e50] mb-3">
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
      <div className="py-20 bg-linear-to-r from-[#f8f9fa] to-[#e9ecef]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#2c3e50] mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-gray-600 text-lg">
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
              <div className="bg-linear-to-br from-[#3498db] to-[#2980b9] rounded-2xl p-8 transform rotate-2">
                <div className="bg-white rounded-xl p-8 transform -rotate-2">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-[#3498db] mb-2">
                      10,000+
                    </div>
                    <div className="text-gray-600 font-medium">
                      Happy Customers
                    </div>
                  </div>
                  <hr className="my-6 border-gray-200" />
                  <div className="text-center">
                    <div className="text-4xl font-bold text-[#e74c3c] mb-2">
                      500+
                    </div>
                    <div className="text-gray-600 font-medium">
                      Products Available
                    </div>
                  </div>
                  <hr className="my-6 border-gray-200" />
                  <div className="text-center">
                    <div className="text-4xl font-bold text-[#27ae60] mb-2">
                      99%
                    </div>
                    <div className="text-gray-600 font-medium">
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
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#2c3e50] mb-4">
              Get In Touch
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Have questions or need help? We&apos;d love to hear from you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Email */}
            <div className="text-center bg-linear-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-linear-to-br from-[#3498db] to-[#2980b9] rounded-xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#2c3e50] mb-3">
                Email Us
              </h3>
              <p className="text-gray-600 mb-4">Get support or ask questions</p>
              <a
                href="mailto:support@techsupply.co"
                className="text-[#3498db] hover:text-[#2980b9] font-semibold transition-colors"
              >
                support@techsupply.co
              </a>
            </div>

            {/* Phone */}
            <div className="text-center bg-linear-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-linear-to-br from-[#e74c3c] to-[#c0392b] rounded-xl flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#2c3e50] mb-3">Call Us</h3>
              <p className="text-gray-600 mb-4">Mon-Fri 9AM-6PM EST</p>
              <a
                href="tel:+1-555-123-4567"
                className="text-[#3498db] hover:text-[#2980b9] font-semibold transition-colors"
              >
                +1 (555) 123-4567
              </a>
            </div>

            {/* Address */}
            <div className="text-center bg-linear-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-linear-to-br from-[#27ae60] to-[#229954] rounded-xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#2c3e50] mb-3">
                Visit Us
              </h3>
              <p className="text-gray-600 mb-4">Our headquarters</p>
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
      <div className="py-20 bg-linear-to-r from-[#2c3e50] to-[#3498db]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Upgrade Your Tech Setup?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Browse our collection of premium accessories and find the perfect
            additions to your workspace.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="bg-white text-[#2c3e50] px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Shop Products
            </Link>
            <Link
              href="mailto:support@techsupply.co"
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-[#2c3e50] transition-all duration-300 transform hover:scale-105"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
